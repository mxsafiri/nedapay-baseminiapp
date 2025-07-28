// Shared authentication service for mini app and main NedaPay app
import { mainAppAPI, API_CONFIG } from './api';
import { privyMiniKitBridge, type PrivySession } from './privyIntegration';

export interface User {
  id: string;
  walletAddress: string;
  email?: string;
  name?: string;
  isVerified: boolean;
  createdAt: string;
  lastSyncAt?: string;
  preferences: {
    defaultCurrency: string;
    notifications: boolean;
    theme: 'light' | 'dark';
  };
  // Privy integration fields
  privyUserId?: string;
  hasPrivyAccount: boolean;
  linkedAccounts: Array<{
    type: 'email' | 'phone';
    address?: string;
    verified: boolean;
  }>;
}

export interface AuthSession {
  token: string;
  user: User;
  expiresAt: string;
  source: 'miniapp' | 'mainapp';
  privySession?: PrivySession;
}

class SharedAuthService {
  private currentSession: AuthSession | null = null;

  // Initialize authentication from stored session
  async initializeAuth(): Promise<AuthSession | null> {
    try {
      const storedToken = localStorage.getItem('nedapay_token');
      const storedUser = localStorage.getItem('nedapay_user');
      
      if (storedToken && storedUser) {
        const user = JSON.parse(storedUser);
        
        // Verify token with main app
        const isValid = await this.verifyTokenWithMainApp(storedToken);
        
        if (isValid) {
          this.currentSession = {
            token: storedToken,
            user,
            expiresAt: localStorage.getItem('nedapay_token_expires') || '',
            source: 'miniapp'
          };
          
          // Sync user data from main app
          await this.syncUserFromMainApp();
          
          return this.currentSession;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Auth initialization failed:', error);
      this.clearSession();
      return null;
    }
  }

  // Authenticate with wallet address (Base MiniKit + Privy integration)
  async authenticateWithWallet(walletAddress: string): Promise<AuthSession> {
    try {
      // Step 1: Authenticate with Privy system
      let privySession: PrivySession | null = null;
      try {
        privySession = await privyMiniKitBridge.authenticateWithPrivy(walletAddress);
        console.log('✅ Privy authentication successful');
      } catch (privyError) {
        console.warn('⚠️ Privy authentication failed, continuing with basic auth:', privyError);
      }

      // Step 2: Authenticate with main NedaPay app
      const response = await mainAppAPI.post(`${API_CONFIG.ENDPOINTS.AUTH}/wallet`, {
        walletAddress,
        source: 'miniapp',
        timestamp: Date.now(),
        privyUserId: privySession?.user.id,
        hasPrivyAccount: !!privySession
      });

      const { token, user, expiresAt } = response.data;

      // Step 3: Enhance user data with Privy information
      const enhancedUser: User = {
        ...user,
        privyUserId: privySession?.user.id,
        hasPrivyAccount: !!privySession,
        email: privySession?.user.email?.address || user.email,
        linkedAccounts: privySession?.user.linkedAccounts || []
      };

      // Store session
      this.currentSession = {
        token,
        user: enhancedUser,
        expiresAt,
        source: 'miniapp',
        privySession: privySession || undefined
      };

      // Persist to localStorage
      localStorage.setItem('nedapay_token', token);
      localStorage.setItem('nedapay_user', JSON.stringify(enhancedUser));
      localStorage.setItem('nedapay_token_expires', expiresAt);
      if (privySession) {
        localStorage.setItem('nedapay_privy_session', JSON.stringify(privySession));
      }

      return this.currentSession;
    } catch (error) {
      console.error('Wallet authentication failed:', error);
      throw new Error('Failed to authenticate with wallet');
    }
  }

  // Sync user data from main app
  async syncUserFromMainApp(): Promise<User | null> {
    try {
      if (!this.currentSession) return null;

      const response = await mainAppAPI.get(`${API_CONFIG.ENDPOINTS.USER_SYNC}/${this.currentSession.user.id}`);
      const syncedUser = response.data.user;

      // Update local session
      this.currentSession.user = {
        ...this.currentSession.user,
        ...syncedUser,
        lastSyncAt: new Date().toISOString()
      };

      // Update localStorage
      localStorage.setItem('nedapay_user', JSON.stringify(this.currentSession.user));

      return this.currentSession.user;
    } catch (error) {
      console.error('User sync failed:', error);
      return null;
    }
  }

  // Verify token with main app
  private async verifyTokenWithMainApp(token: string): Promise<boolean> {
    try {
      const response = await mainAppAPI.post(`${API_CONFIG.ENDPOINTS.AUTH}/verify`, {
        token,
        source: 'miniapp'
      });
      
      return response.data.valid;
    } catch (error) {
      console.error('Token verification failed:', error);
      return false;
    }
  }

  // Update user preferences (sync to main app)
  async updateUserPreferences(preferences: Partial<User['preferences']>): Promise<boolean> {
    try {
      if (!this.currentSession) return false;

      const response = await mainAppAPI.patch(`${API_CONFIG.ENDPOINTS.USER_PROFILE}/${this.currentSession.user.id}`, {
        preferences: {
          ...this.currentSession.user.preferences,
          ...preferences
        }
      });

      // Update local session
      this.currentSession.user.preferences = response.data.preferences;
      localStorage.setItem('nedapay_user', JSON.stringify(this.currentSession.user));

      return true;
    } catch (error) {
      console.error('Failed to update user preferences:', error);
      return false;
    }
  }

  // Get current session
  getCurrentSession(): AuthSession | null {
    return this.currentSession;
  }

  // Get current user
  getCurrentUser(): User | null {
    return this.currentSession?.user || null;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.currentSession && new Date() < new Date(this.currentSession.expiresAt);
  }

  // Link additional account to user (email/phone via Privy)
  async linkAccount(accountType: 'email' | 'phone', identifier: string): Promise<boolean> {
    try {
      if (!this.currentSession) return false;

      const success = await privyMiniKitBridge.linkAccount(accountType, identifier);
      
      if (success) {
        // Refresh user data
        await this.syncUserFromMainApp();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to link account:', error);
      return false;
    }
  }

  // Get user's verified email from Privy
  getVerifiedEmail(): string | null {
    return privyMiniKitBridge.getVerifiedEmail();
  }

  // Get user's verified phone from Privy
  getVerifiedPhone(): string | null {
    return privyMiniKitBridge.getVerifiedPhone();
  }

  // Check if user has Privy account
  hasPrivyAccount(): boolean {
    return this.currentSession?.user.hasPrivyAccount || false;
  }

  // Get Privy session if available
  getPrivySession(): PrivySession | null {
    return this.currentSession?.privySession || null;
  }

  // Clear session (logout)
  clearSession(): void {
    this.currentSession = null;
    localStorage.removeItem('nedapay_token');
    localStorage.removeItem('nedapay_user');
    localStorage.removeItem('nedapay_token_expires');
    localStorage.removeItem('nedapay_privy_session');
  }

  // Logout from both apps and Privy
  async logout(): Promise<void> {
    try {
      if (this.currentSession) {
        // Logout from main app
        await mainAppAPI.post(`${API_CONFIG.ENDPOINTS.AUTH}/logout`, {
          token: this.currentSession.token,
          source: 'miniapp'
        });
        
        // Logout from Privy if session exists
        if (this.currentSession.privySession) {
          await privyMiniKitBridge.logout();
        }
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      this.clearSession();
    }
  }
}

// Export singleton instance
export const sharedAuth = new SharedAuthService();
export default sharedAuth;
