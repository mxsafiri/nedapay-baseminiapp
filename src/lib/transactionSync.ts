// Cross-platform transaction history synchronization service
import { mainAppAPI, API_CONFIG } from './api';
import { sharedAuth } from './auth';

export interface SyncableTransaction {
  id: string;
  userId: string;
  type: 'payment' | 'invoice_payment' | 'offramp' | 'swap';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  
  // Transaction details
  amount: string;
  currency: string;
  fromAddress?: string;
  toAddress?: string;
  txHash?: string;
  blockNumber?: number;
  gasUsed?: string;
  gasFee?: string;
  
  // Metadata
  description?: string;
  invoiceId?: string;
  paymentLinkId?: string;
  
  // Timestamps
  createdAt: string;
  completedAt?: string;
  updatedAt: string;
  
  // Sync metadata
  source: 'miniapp' | 'mainapp';
  syncStatus: 'synced' | 'pending' | 'failed';
  lastSyncAt?: string;
  
  // Network info
  chainId: number;
  networkName: string;
}

export interface TransactionSummary {
  totalTransactions: number;
  totalVolume: { [currency: string]: string };
  successfulTransactions: number;
  pendingTransactions: number;
  failedTransactions: number;
  lastTransactionAt?: string;
}

class TransactionSyncService {
  private syncInProgress = false;
  private lastSyncTime: string | null = null;

  // Record new transaction from mini app
  async recordTransaction(transactionData: Omit<SyncableTransaction, 'id' | 'createdAt' | 'updatedAt' | 'source' | 'syncStatus'>): Promise<SyncableTransaction> {
    try {
      const user = sharedAuth.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      const transaction: SyncableTransaction = {
        ...transactionData,
        id: `mini_tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        source: 'miniapp',
        syncStatus: 'pending'
      };

      // Store locally
      await this.storeTransactionLocally(transaction);

      // Sync to main app in background
      this.syncTransactionToMainApp(transaction);

      return transaction;
    } catch (error) {
      console.error('Failed to record transaction:', error);
      throw error;
    }
  }

  // Sync transaction to main app
  private async syncTransactionToMainApp(transaction: SyncableTransaction): Promise<void> {
    try {
      const response = await mainAppAPI.post(`${API_CONFIG.ENDPOINTS.TRANSACTIONS}`, {
        transaction: {
          ...transaction,
          syncedFromMiniApp: true,
          miniAppTransactionId: transaction.id
        }
      });

      const syncedTransaction = response.data.transaction;

      // Update local transaction with main app ID
      const updatedTransaction: SyncableTransaction = {
        ...transaction,
        id: syncedTransaction.id, // Use main app ID as primary
        syncStatus: 'synced',
        lastSyncAt: new Date().toISOString()
      };

      await this.updateTransactionLocally(updatedTransaction);
      console.log(`Transaction ${transaction.id} synced successfully to main app`);
    } catch (error) {
      console.error(`Failed to sync transaction ${transaction.id} to main app:`, error);
      
      // Mark as failed sync
      await this.updateTransactionLocally({
        ...transaction,
        syncStatus: 'failed',
        lastSyncAt: new Date().toISOString()
      });
    }
  }

  // Fetch transaction history from main app
  async syncTransactionsFromMainApp(limit: number = 100, offset: number = 0): Promise<SyncableTransaction[]> {
    try {
      const user = sharedAuth.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      const response = await mainAppAPI.get(`${API_CONFIG.ENDPOINTS.TRANSACTION_HISTORY}`, {
        params: {
          userId: user.id,
          limit,
          offset,
          includeSource: 'all'
        }
      });

      const mainAppTransactions = response.data.transactions;
      const syncedTransactions: SyncableTransaction[] = [];

      for (const transaction of mainAppTransactions) {
        const syncableTransaction: SyncableTransaction = {
          ...transaction,
          source: transaction.source || 'mainapp',
          syncStatus: 'synced',
          lastSyncAt: new Date().toISOString()
        };

        await this.storeTransactionLocally(syncableTransaction);
        syncedTransactions.push(syncableTransaction);
      }

      this.lastSyncTime = new Date().toISOString();
      return syncedTransactions;
    } catch (error) {
      console.error('Failed to sync transactions from main app:', error);
      return [];
    }
  }

  // Get unified transaction history (local + main app)
  async getTransactionHistory(options: {
    limit?: number;
    offset?: number;
    type?: SyncableTransaction['type'];
    status?: SyncableTransaction['status'];
    currency?: string;
    forceSync?: boolean;
  } = {}): Promise<SyncableTransaction[]> {
    try {
      // Force sync if requested or if last sync was more than 5 minutes ago
      const shouldSync = options.forceSync || 
        !this.lastSyncTime || 
        (Date.now() - new Date(this.lastSyncTime).getTime()) > 5 * 60 * 1000;

      if (shouldSync && !this.syncInProgress) {
        this.syncInProgress = true;
        await this.syncTransactionsFromMainApp();
        this.syncInProgress = false;
      }

      let transactions = await this.getLocalTransactions();

      // Apply filters
      if (options.type) {
        transactions = transactions.filter(tx => tx.type === options.type);
      }
      if (options.status) {
        transactions = transactions.filter(tx => tx.status === options.status);
      }
      if (options.currency) {
        transactions = transactions.filter(tx => tx.currency === options.currency);
      }

      // Sort by creation date (newest first)
      transactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      // Apply pagination
      const offset = options.offset || 0;
      const limit = options.limit || 50;
      
      return transactions.slice(offset, offset + limit);
    } catch (error) {
      console.error('Failed to get transaction history:', error);
      return [];
    }
  }

  // Update transaction status (e.g., when blockchain confirms)
  async updateTransactionStatus(
    transactionId: string, 
    updates: Partial<Pick<SyncableTransaction, 'status' | 'txHash' | 'blockNumber' | 'gasUsed' | 'gasFee' | 'completedAt'>>
  ): Promise<void> {
    try {
      const transactions = await this.getLocalTransactions();
      const transactionIndex = transactions.findIndex(tx => tx.id === transactionId);
      
      if (transactionIndex === -1) throw new Error('Transaction not found');

      const updatedTransaction = {
        ...transactions[transactionIndex],
        ...updates,
        updatedAt: new Date().toISOString(),
        syncStatus: 'pending' as const
      };

      await this.updateTransactionLocally(updatedTransaction);

      // Sync update to main app
      await mainAppAPI.patch(`${API_CONFIG.ENDPOINTS.TRANSACTIONS}/${transactionId}`, {
        ...updates,
        source: 'miniapp'
      });

      // Mark as synced
      await this.updateTransactionLocally({
        ...updatedTransaction,
        syncStatus: 'synced',
        lastSyncAt: new Date().toISOString()
      });

    } catch (error) {
      console.error('Failed to update transaction status:', error);
      throw error;
    }
  }

  // Get transaction summary/analytics
  async getTransactionSummary(timeframe: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<TransactionSummary> {
    try {
      const user = sharedAuth.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      // Try to get from main app first (more comprehensive)
      try {
        const response = await mainAppAPI.get(`${API_CONFIG.ENDPOINTS.TRANSACTIONS}/summary`, {
          params: {
            userId: user.id,
            timeframe
          }
        });
        
        return response.data.summary;
      } catch (error) {
        console.warn('Failed to get summary from main app, calculating locally:', error);
      }

      // Fallback to local calculation
      const transactions = await this.getLocalTransactions();
      const now = new Date();
      let startDate: Date;

      switch (timeframe) {
        case 'day':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'year':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
      }

      const filteredTransactions = transactions.filter(tx => 
        new Date(tx.createdAt) >= startDate
      );

      const totalVolume: { [currency: string]: string } = {};
      
      filteredTransactions.forEach(tx => {
        if (!totalVolume[tx.currency]) {
          totalVolume[tx.currency] = '0';
        }
        totalVolume[tx.currency] = (
          parseFloat(totalVolume[tx.currency]) + parseFloat(tx.amount)
        ).toString();
      });

      return {
        totalTransactions: filteredTransactions.length,
        totalVolume,
        successfulTransactions: filteredTransactions.filter(tx => tx.status === 'completed').length,
        pendingTransactions: filteredTransactions.filter(tx => tx.status === 'pending').length,
        failedTransactions: filteredTransactions.filter(tx => tx.status === 'failed').length,
        lastTransactionAt: filteredTransactions[0]?.createdAt
      };
    } catch (error) {
      console.error('Failed to get transaction summary:', error);
      return {
        totalTransactions: 0,
        totalVolume: {},
        successfulTransactions: 0,
        pendingTransactions: 0,
        failedTransactions: 0
      };
    }
  }

  // Retry failed syncs
  async retryFailedSyncs(): Promise<void> {
    try {
      const transactions = await this.getLocalTransactions();
      const failedSyncs = transactions.filter(tx => tx.syncStatus === 'failed');

      for (const transaction of failedSyncs) {
        await this.syncTransactionToMainApp(transaction);
      }
    } catch (error) {
      console.error('Failed to retry transaction syncs:', error);
    }
  }

  // Local storage methods
  private async storeTransactionLocally(transaction: SyncableTransaction): Promise<void> {
    const transactions = await this.getLocalTransactions();
    const existingIndex = transactions.findIndex(tx => tx.id === transaction.id);
    
    if (existingIndex >= 0) {
      transactions[existingIndex] = transaction;
    } else {
      transactions.push(transaction);
    }
    
    localStorage.setItem('nedapay_transactions', JSON.stringify(transactions));
  }

  private async updateTransactionLocally(transaction: SyncableTransaction): Promise<void> {
    await this.storeTransactionLocally(transaction);
  }

  private async getLocalTransactions(): Promise<SyncableTransaction[]> {
    try {
      const stored = localStorage.getItem('nedapay_transactions');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to get local transactions:', error);
      return [];
    }
  }

  // Get sync status
  getSyncStatus(): { total: number; synced: number; pending: number; failed: number } {
    try {
      const transactions = JSON.parse(localStorage.getItem('nedapay_transactions') || '[]');
      
      return {
        total: transactions.length,
        synced: transactions.filter((tx: SyncableTransaction) => tx.syncStatus === 'synced').length,
        pending: transactions.filter((tx: SyncableTransaction) => tx.syncStatus === 'pending').length,
        failed: transactions.filter((tx: SyncableTransaction) => tx.syncStatus === 'failed').length
      };
    } catch (error) {
      return { total: 0, synced: 0, pending: 0, failed: 0 };
    }
  }
}

// Export singleton instance
export const transactionSync = new TransactionSyncService();
export default transactionSync;
