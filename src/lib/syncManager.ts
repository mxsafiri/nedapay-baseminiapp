// Unified synchronization manager for all cross-platform data
import { sharedAuth } from './auth';
import { invoiceSync } from './invoiceSync';
import { transactionSync } from './transactionSync';
import { mainAppAPI, API_CONFIG } from './api';

export interface SyncStatus {
  isOnline: boolean;
  lastFullSync?: string;
  auth: {
    isAuthenticated: boolean;
    lastSync?: string;
  };
  invoices: {
    total: number;
    synced: number;
    pending: number;
    failed: number;
  };
  transactions: {
    total: number;
    synced: number;
    pending: number;
    failed: number;
  };
  errors: string[];
}

class SyncManager {
  private syncInterval: NodeJS.Timeout | null = null;
  private isFullSyncInProgress = false;
  private listeners: Array<(status: SyncStatus) => void> = [];

  // Initialize sync manager
  async initialize(): Promise<void> {
    try {
      // Initialize authentication
      await sharedAuth.initializeAuth();
      
      // Start periodic sync if user is authenticated
      if (sharedAuth.isAuthenticated()) {
        this.startPeriodicSync();
        
        // Perform initial full sync
        await this.performFullSync();
      }
      
      // Listen for online/offline events
      window.addEventListener('online', this.handleOnline.bind(this));
      window.addEventListener('offline', this.handleOffline.bind(this));
      
      console.log('Sync manager initialized successfully');
    } catch (error) {
      console.error('Failed to initialize sync manager:', error);
    }
  }

  // Perform full synchronization
  async performFullSync(): Promise<SyncStatus> {
    if (this.isFullSyncInProgress) {
      console.log('Full sync already in progress, skipping...');
      return this.getSyncStatus();
    }

    this.isFullSyncInProgress = true;
    const errors: string[] = [];

    try {
      console.log('Starting full synchronization...');

      // 1. Sync user data
      try {
        await sharedAuth.syncUserFromMainApp();
      } catch (error) {
        errors.push(`User sync failed: ${error}`);
        console.error('User sync failed:', error);
      }

      // 2. Sync invoices from main app
      try {
        await invoiceSync.syncInvoicesFromMainApp();
      } catch (error) {
        errors.push(`Invoice sync failed: ${error}`);
        console.error('Invoice sync failed:', error);
      }

      // 3. Sync transaction history
      try {
        await transactionSync.syncTransactionsFromMainApp();
      } catch (error) {
        errors.push(`Transaction sync failed: ${error}`);
        console.error('Transaction sync failed:', error);
      }

      // 4. Retry any failed syncs
      try {
        await invoiceSync.retryFailedSyncs();
        await transactionSync.retryFailedSyncs();
      } catch (error) {
        errors.push(`Retry failed syncs error: ${error}`);
        console.error('Retry failed syncs error:', error);
      }

      // Update last sync time
      localStorage.setItem('nedapay_last_full_sync', new Date().toISOString());
      
      console.log('Full synchronization completed');
    } catch (error) {
      errors.push(`Full sync error: ${error}`);
      console.error('Full sync error:', error);
    } finally {
      this.isFullSyncInProgress = false;
    }

    const status = this.getSyncStatus();
    status.errors = errors;
    
    // Notify listeners
    this.notifyListeners(status);
    
    return status;
  }

  // Start periodic background sync
  startPeriodicSync(intervalMinutes: number = 5): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(async () => {
      if (sharedAuth.isAuthenticated() && navigator.onLine) {
        try {
          await this.performIncrementalSync();
        } catch (error) {
          console.error('Periodic sync failed:', error);
        }
      }
    }, intervalMinutes * 60 * 1000);

    console.log(`Periodic sync started (every ${intervalMinutes} minutes)`);
  }

  // Stop periodic sync
  stopPeriodicSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('Periodic sync stopped');
    }
  }

  // Perform incremental sync (lighter than full sync)
  private async performIncrementalSync(): Promise<void> {
    try {
      // Only sync recent data to avoid heavy operations
      const lastSync = localStorage.getItem('nedapay_last_full_sync');
      const shouldFullSync = !lastSync || 
        (Date.now() - new Date(lastSync).getTime()) > 30 * 60 * 1000; // 30 minutes

      if (shouldFullSync) {
        await this.performFullSync();
      } else {
        // Light sync - just retry failed syncs and check for updates
        await invoiceSync.retryFailedSyncs();
        await transactionSync.retryFailedSyncs();
        
        // Sync user preferences
        await sharedAuth.syncUserFromMainApp();
      }
    } catch (error) {
      console.error('Incremental sync failed:', error);
    }
  }

  // Handle online event
  private async handleOnline(): Promise<void> {
    console.log('Connection restored, performing sync...');
    if (sharedAuth.isAuthenticated()) {
      await this.performFullSync();
    }
  }

  // Handle offline event
  private handleOffline(): void {
    console.log('Connection lost, sync paused');
    this.notifyListeners(this.getSyncStatus());
  }

  // Get current sync status
  getSyncStatus(): SyncStatus {
    return {
      isOnline: navigator.onLine,
      lastFullSync: localStorage.getItem('nedapay_last_full_sync') || undefined,
      auth: {
        isAuthenticated: sharedAuth.isAuthenticated(),
        lastSync: sharedAuth.getCurrentUser()?.lastSyncAt
      },
      invoices: invoiceSync.getSyncStatus(),
      transactions: transactionSync.getSyncStatus(),
      errors: []
    };
  }

  // Force sync specific data type
  async forceSyncInvoices(): Promise<void> {
    await invoiceSync.syncInvoicesFromMainApp();
    await invoiceSync.retryFailedSyncs();
  }

  async forceSyncTransactions(): Promise<void> {
    await transactionSync.syncTransactionsFromMainApp();
    await transactionSync.retryFailedSyncs();
  }

  async forceSyncUser(): Promise<void> {
    await sharedAuth.syncUserFromMainApp();
  }

  // Health check with main app
  async healthCheck(): Promise<boolean> {
    try {
      const response = await mainAppAPI.get(API_CONFIG.ENDPOINTS.HEALTH_CHECK);
      return response.status === 200;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  // Subscribe to sync status updates
  onSyncStatusChange(callback: (status: SyncStatus) => void): () => void {
    this.listeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Notify all listeners
  private notifyListeners(status: SyncStatus): void {
    this.listeners.forEach(callback => {
      try {
        callback(status);
      } catch (error) {
        console.error('Sync status listener error:', error);
      }
    });
  }

  // Cleanup
  destroy(): void {
    this.stopPeriodicSync();
    window.removeEventListener('online', this.handleOnline.bind(this));
    window.removeEventListener('offline', this.handleOffline.bind(this));
    this.listeners = [];
  }
}

// Export singleton instance
export const syncManager = new SyncManager();
export default syncManager;
