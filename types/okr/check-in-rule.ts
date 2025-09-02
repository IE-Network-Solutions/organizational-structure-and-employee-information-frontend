export interface CheckInRule {
  id: string;
  name: string;
  description?: string;
  appliesTo: string;
  planningPeriodId: string;
  timeBased: boolean;
  achievementBased: boolean;
  frequency: number;
  operation: string;
  action: 'Appreciation' | 'Reprimand';
  categoryId: string;
  tenantId: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  createdBy?: string | null;
  updatedBy?: string | null;
}
