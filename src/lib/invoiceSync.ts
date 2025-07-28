// Invoice synchronization service between mini app and main NedaPay app
import { mainAppAPI, API_CONFIG } from './api';
import { sharedAuth } from './auth';

export interface SyncableInvoice {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  items: Array<{
    description: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  status: 'draft' | 'sent' | 'paid' | 'cancelled';
  paymentLink?: string;
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
  source: 'miniapp' | 'mainapp';
  syncStatus: 'synced' | 'pending' | 'failed';
  lastSyncAt?: string;
}

class InvoiceSyncService {
  private pendingSyncs: Set<string> = new Set();

  // Create invoice in mini app and sync to main app
  async createInvoice(invoiceData: Omit<SyncableInvoice, 'id' | 'createdAt' | 'updatedAt' | 'source' | 'syncStatus'>): Promise<SyncableInvoice> {
    try {
      const user = sharedAuth.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      // Create invoice locally first
      const localInvoice: SyncableInvoice = {
        ...invoiceData,
        id: `mini_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        source: 'miniapp',
        syncStatus: 'pending'
      };

      // Store locally
      await this.storeInvoiceLocally(localInvoice);

      // Sync to main app in background
      this.syncInvoiceToMainApp(localInvoice);

      return localInvoice;
    } catch (error) {
      console.error('Failed to create invoice:', error);
      throw error;
    }
  }

  // Sync invoice to main app
  private async syncInvoiceToMainApp(invoice: SyncableInvoice): Promise<void> {
    try {
      if (this.pendingSyncs.has(invoice.id)) return;
      this.pendingSyncs.add(invoice.id);

      const response = await mainAppAPI.post(`${API_CONFIG.ENDPOINTS.INVOICE_SYNC}`, {
        invoice: {
          ...invoice,
          syncedFromMiniApp: true,
          miniAppInvoiceId: invoice.id
        }
      });

      const syncedInvoice = response.data.invoice;

      // Update local invoice with main app ID and sync status
      const updatedInvoice: SyncableInvoice = {
        ...invoice,
        id: syncedInvoice.id, // Use main app ID as primary
        syncStatus: 'synced',
        lastSyncAt: new Date().toISOString(),
        paymentLink: syncedInvoice.paymentLink // Get payment link from main app
      };

      await this.updateInvoiceLocally(updatedInvoice);
      this.pendingSyncs.delete(invoice.id);

      console.log(`Invoice ${invoice.id} synced successfully to main app`);
    } catch (error) {
      console.error(`Failed to sync invoice ${invoice.id} to main app:`, error);
      
      // Mark as failed sync
      await this.updateInvoiceLocally({
        ...invoice,
        syncStatus: 'failed',
        lastSyncAt: new Date().toISOString()
      });
      
      this.pendingSyncs.delete(invoice.id);
    }
  }

  // Fetch invoices from main app and sync locally
  async syncInvoicesFromMainApp(): Promise<SyncableInvoice[]> {
    try {
      const user = sharedAuth.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      const response = await mainAppAPI.get(`${API_CONFIG.ENDPOINTS.INVOICES}?userId=${user.id}&includeSource=all`);
      const mainAppInvoices = response.data.invoices;

      const syncedInvoices: SyncableInvoice[] = [];

      for (const invoice of mainAppInvoices) {
        const syncableInvoice: SyncableInvoice = {
          ...invoice,
          source: invoice.source || 'mainapp',
          syncStatus: 'synced',
          lastSyncAt: new Date().toISOString()
        };

        await this.storeInvoiceLocally(syncableInvoice);
        syncedInvoices.push(syncableInvoice);
      }

      return syncedInvoices;
    } catch (error) {
      console.error('Failed to sync invoices from main app:', error);
      return [];
    }
  }

  // Get all invoices (local + synced)
  async getAllInvoices(): Promise<SyncableInvoice[]> {
    try {
      const localInvoices = await this.getLocalInvoices();
      
      // Try to sync from main app (non-blocking)
      this.syncInvoicesFromMainApp().catch(console.error);
      
      return localInvoices;
    } catch (error) {
      console.error('Failed to get all invoices:', error);
      return [];
    }
  }

  // Update invoice status (e.g., when payment is received)
  async updateInvoiceStatus(invoiceId: string, status: SyncableInvoice['status'], paidAt?: string): Promise<void> {
    try {
      // Update locally
      const localInvoices = await this.getLocalInvoices();
      const invoiceIndex = localInvoices.findIndex(inv => inv.id === invoiceId);
      
      if (invoiceIndex === -1) throw new Error('Invoice not found');

      const updatedInvoice = {
        ...localInvoices[invoiceIndex],
        status,
        paidAt,
        updatedAt: new Date().toISOString(),
        syncStatus: 'pending' as const
      };

      await this.updateInvoiceLocally(updatedInvoice);

      // Sync to main app
      await mainAppAPI.patch(`${API_CONFIG.ENDPOINTS.INVOICES}/${invoiceId}/status`, {
        status,
        paidAt,
        source: 'miniapp'
      });

      // Mark as synced
      await this.updateInvoiceLocally({
        ...updatedInvoice,
        syncStatus: 'synced',
        lastSyncAt: new Date().toISOString()
      });

    } catch (error) {
      console.error('Failed to update invoice status:', error);
      throw error;
    }
  }

  // Retry failed syncs
  async retryFailedSyncs(): Promise<void> {
    try {
      const localInvoices = await this.getLocalInvoices();
      const failedSyncs = localInvoices.filter(inv => inv.syncStatus === 'failed');

      for (const invoice of failedSyncs) {
        await this.syncInvoiceToMainApp(invoice);
      }
    } catch (error) {
      console.error('Failed to retry syncs:', error);
    }
  }

  // Local storage methods
  private async storeInvoiceLocally(invoice: SyncableInvoice): Promise<void> {
    const invoices = await this.getLocalInvoices();
    const existingIndex = invoices.findIndex(inv => inv.id === invoice.id);
    
    if (existingIndex >= 0) {
      invoices[existingIndex] = invoice;
    } else {
      invoices.push(invoice);
    }
    
    localStorage.setItem('nedapay_invoices', JSON.stringify(invoices));
  }

  private async updateInvoiceLocally(invoice: SyncableInvoice): Promise<void> {
    await this.storeInvoiceLocally(invoice);
  }

  private async getLocalInvoices(): Promise<SyncableInvoice[]> {
    try {
      const stored = localStorage.getItem('nedapay_invoices');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to get local invoices:', error);
      return [];
    }
  }

  // Get sync status summary
  getSyncStatus(): { total: number; synced: number; pending: number; failed: number } {
    try {
      const invoices = JSON.parse(localStorage.getItem('nedapay_invoices') || '[]');
      
      return {
        total: invoices.length,
        synced: invoices.filter((inv: SyncableInvoice) => inv.syncStatus === 'synced').length,
        pending: invoices.filter((inv: SyncableInvoice) => inv.syncStatus === 'pending').length,
        failed: invoices.filter((inv: SyncableInvoice) => inv.syncStatus === 'failed').length
      };
    } catch (error) {
      return { total: 0, synced: 0, pending: 0, failed: 0 };
    }
  }
}

// Export singleton instance
export const invoiceSync = new InvoiceSyncService();
export default invoiceSync;
