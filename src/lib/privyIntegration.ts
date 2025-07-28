// Hybrid Privy-MiniKit authentication integration
import { mainAppAPI, API_CONFIG } from './api';

export interface PrivyUser {
  id: string;
  wallet: {
    address: string;
    chainType: 'ethereum';
    walletClient: 'privy';
  };
  email?: {
    address: string;
    verified: boolean;
  };
  phone?: {
    number: string;
    verified: boolean;
  };
  createdAt: string;
  linkedAccounts: Array<{
    type: 'wallet' | 'email' | 'phone';
    address?: string;
    verified: boolean;
  }>;
}

export interface PrivySession {
  user: PrivyUser;
  isAuthenticated: boolean;
  accessToken: string;
  refreshToken: string;
}

class PrivyMiniKitBridge {
  private privySession: PrivySession | null = null;

  // Authenticate MiniKit user with Privy backend
  async authenticateWithPrivy(walletAddress: string): Promise<PrivySession> {
    try {
      // Step 1: Check if user exists in Privy system via main app API
      const response = await mainAppAPI.post(`${API_CONFIG.ENDPOINTS.AUTH}/privy-lookup`, {
        walletAddress,
        source: 'minikit'
      });

      if (response.data.exists) {
        // User exists in Privy - get their session
        return await this.getExistingPrivySession(walletAddress, response.data.privyUserId);
      } else {
        // User doesn't exist - create new Privy user via main app
        return await this.createPrivyUserFromMiniKit(walletAddress);
      }
    } catch (error) {
      console.error('Privy authentication failed:', error);
      throw new Error('Failed to authenticate with Privy system');
    }
  }

  // Get existing Privy session for wallet
  private async getExistingPrivySession(walletAddress: string, privyUserId: string): Promise<PrivySession> {
    try {
      const response = await mainAppAPI.post(`${API_CONFIG.ENDPOINTS.AUTH}/privy-session`, {
        privyUserId,
        walletAddress,
        source: 'minikit'
      });

      const session: PrivySession = {
        user: response.data.user,
        isAuthenticated: true,
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken
      };

      this.privySession = session;
      return session;
    } catch (error) {
      console.error('Failed to get Privy session:', error);
      throw error;
    }
  }

  // Create new Privy user from MiniKit wallet
  private async createPrivyUserFromMiniKit(walletAddress: string): Promise<PrivySession> {
    try {
      const response = await mainAppAPI.post(`${API_CONFIG.ENDPOINTS.AUTH}/privy-create`, {
        walletAddress,
        source: 'minikit',
        chainType: 'ethereum',
        defaultChain: 'base'
      });

      const session: PrivySession = {
        user: response.data.user,
        isAuthenticated: true,
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken
      };

      this.privySession = session;
      return session;
    } catch (error) {
      console.error('Failed to create Privy user:', error);
      throw error;
    }
  }

  // Sync user data between Privy and MiniKit
  async syncUserData(): Promise<PrivyUser | null> {
    try {
      if (!this.privySession) return null;

      const response = await mainAppAPI.get(
        `${API_CONFIG.ENDPOINTS.USER_PROFILE}/${this.privySession.user.id}?source=privy`
      );

      const updatedUser = response.data.user;
      this.privySession.user = updatedUser;

      return updatedUser;
    } catch (error) {
      console.error('Failed to sync user data:', error);
      return null;
    }
  }

  // Link additional accounts (email, phone) to MiniKit user
  async linkAccount(accountType: 'email' | 'phone', identifier: string): Promise<boolean> {
    try {
      if (!this.privySession) return false;

      const response = await mainAppAPI.post(`${API_CONFIG.ENDPOINTS.AUTH}/privy-link`, {
        privyUserId: this.privySession.user.id,
        accountType,
        identifier,
        source: 'minikit'
      });

      // Update local session with new linked account
      if (response.data.success) {
        await this.syncUserData();
        return true;
      }

      return false;
    } catch (error) {
      console.error('Failed to link account:', error);
      return false;
    }
  }

  // Get current Privy session
  getCurrentPrivySession(): PrivySession | null {
    return this.privySession;
  }

  // Check if user has specific account linked
  hasLinkedAccount(accountType: 'email' | 'phone'): boolean {
    if (!this.privySession) return false;
    
    return this.privySession.user.linkedAccounts.some(
      account => account.type === accountType && account.verified
    );
  }

  // Get user's verified email
  getVerifiedEmail(): string | null {
    if (!this.privySession?.user.email?.verified) return null;
    return this.privySession.user.email.address;
  }

  // Get user's verified phone
  getVerifiedPhone(): string | null {
    if (!this.privySession?.user.phone?.verified) return null;
    return this.privySession.user.phone.number;
  }

  // Logout from Privy session
  async logout(): Promise<void> {
    try {
      if (this.privySession) {
        await mainAppAPI.post(`${API_CONFIG.ENDPOINTS.AUTH}/privy-logout`, {
          privyUserId: this.privySession.user.id,
          accessToken: this.privySession.accessToken,
          source: 'minikit'
        });
      }
    } catch (error) {
      console.error('Privy logout failed:', error);
    } finally {
      this.privySession = null;
    }
  }

  // Refresh Privy access token
  async refreshAccessToken(): Promise<string | null> {
    try {
      if (!this.privySession?.refreshToken) return null;

      const response = await mainAppAPI.post(`${API_CONFIG.ENDPOINTS.AUTH}/privy-refresh`, {
        refreshToken: this.privySession.refreshToken,
        source: 'minikit'
      });

      const newAccessToken = response.data.accessToken;
      this.privySession.accessToken = newAccessToken;

      return newAccessToken;
    } catch (error) {
      console.error('Failed to refresh Privy token:', error);
      return null;
    }
  }
}

// Export singleton instance
export const privyMiniKitBridge = new PrivyMiniKitBridge();
export default privyMiniKitBridge;
