'use client';

import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export interface AuthUser {
  id: string;
  email?: string;
  walletAddress?: string;
  businessName?: string | null;
  isAuthenticated: boolean;
}

export function useAuth() {
  const { 
    ready, 
    authenticated, 
    user, 
    login, 
    logout: privyLogout,
    linkEmail,
    linkWallet,
    unlinkEmail,
    unlinkWallet
  } = usePrivy();
  
  const { wallets } = useWallets();
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Get the primary wallet address
  const walletAddress = wallets?.[0]?.address;

  // Sync user data with Supabase when authenticated
  useEffect(() => {
    if (ready && authenticated && user) {
      syncUserWithSupabase();
    } else if (ready && !authenticated) {
      setAuthUser(null);
      setIsLoading(false);
    }
  }, [ready, authenticated, user, walletAddress]);

  const syncUserWithSupabase = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      // Check if user exists in our database
      const { data: existingUser, error: fetchError } = await supabase
        .from('merchants')
        .select('*')
        .eq('id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching user:', fetchError);
        return;
      }

      const userData = {
        id: user.id,
        email: user.email?.address || null,
        wallet_address: walletAddress || null,
        updated_at: new Date().toISOString(),
      };

      if (existingUser) {
        // Update existing user
        const { error: updateError } = await supabase
          .from('merchants')
          .update(userData)
          .eq('id', user.id);

        if (updateError) {
          console.error('Error updating user:', updateError);
          return;
        }

        setAuthUser({
          id: user.id,
          email: user.email?.address,
          walletAddress: walletAddress,
          businessName: existingUser.business_name,
          isAuthenticated: true,
        });
      } else {
        // Create new user
        const { error: insertError } = await supabase
          .from('merchants')
          .insert({
            ...userData,
            created_at: new Date().toISOString(),
          });

        if (insertError) {
          console.error('Error creating user:', insertError);
          return;
        }

        setAuthUser({
          id: user.id,
          email: user.email?.address,
          walletAddress: walletAddress,
          businessName: null,
          isAuthenticated: true,
        });
      }
    } catch (error) {
      console.error('Error syncing user with Supabase:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateBusinessName = async (businessName: string) => {
    if (!authUser) return false;

    try {
      const { error } = await supabase
        .from('merchants')
        .update({ 
          business_name: businessName,
          updated_at: new Date().toISOString()
        })
        .eq('id', authUser.id);

      if (error) {
        console.error('Error updating business name:', error);
        return false;
      }

      setAuthUser(prev => prev ? { ...prev, businessName } : null);
      return true;
    } catch (error) {
      console.error('Error updating business name:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await privyLogout();
      setAuthUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return {
    // Auth state
    user: authUser,
    isAuthenticated: authenticated && !!authUser,
    isLoading: !ready || isLoading,
    ready,

    // Auth actions
    login,
    logout,
    linkEmail,
    linkWallet,
    unlinkEmail,
    unlinkWallet,

    // User management
    updateBusinessName,

    // Wallet info
    walletAddress,
    wallets,
  };
}
