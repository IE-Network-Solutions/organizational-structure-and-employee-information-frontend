export interface InvoiceRequestBody {
  filter: {
    id?: string[];
    tenantId?: string;
    subscriptionId?: string;
    invoiceNumber?: 'subscription' | 'slot_purchase' | 'refund';
    status?: 'draft' | 'pending' | 'paid' | 'overdue' | 'canceled' | 'refunded';
    dueAt?: string;
  };
}
