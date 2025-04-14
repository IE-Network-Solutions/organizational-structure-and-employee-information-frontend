export interface AuditLogRequestBody {
  filter: {
    id?: string[];
    entity?: 'subscription' | 'invoice' | 'payment' | 'plan' | 'module';
    entityId?: string;
    action?: 'create' | 'update' | 'delete' | 'restore';
    performedBy?: string;
    startDate?: string;
    endDate?: string;
    actionSource?: string;
  };
}
