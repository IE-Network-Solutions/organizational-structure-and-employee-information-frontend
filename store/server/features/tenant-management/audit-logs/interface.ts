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

export interface AggregateAuditLogParams {
  module?: string | null | undefined;
  page?: number;
  limit?: number;
  orderBy?: string;
  orderDirection?: 'ASC' | 'DESC';
  action?: string;
  performedBy?: string;
  startDate?: string;
  endDate?: string;
  entityType?: string;
}
