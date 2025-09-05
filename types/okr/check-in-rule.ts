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
  feedbackId?: string;
  target?: number;
  workScheduleId?: string;
  targetDate?: Array<{
    date: string;
    time?: string; // Keep for backward compatibility
    startTime?: string;
    endTime?: string;
    dayId?: string;
  }>;
  tenantId: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  createdBy?: string | null;
  updatedBy?: string | null;
}
