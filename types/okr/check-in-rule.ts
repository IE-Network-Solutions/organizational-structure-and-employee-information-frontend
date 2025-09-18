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
  targetDate?: Array<{
    date: string; // "monday" - the day this rule applies to
    startDay: string; // "monday" or "friday"
    startTime: string; // "03:00" or "17:30"
    endDay: string; // "monday" or "saturday"
    endTime: string; // "03:00" or "16:00"
    time?: string; // Keep for backward compatibility
    dayId?: string; // Keep for backward compatibility
  }>;
  // User selection fields
  selectedDepartmentIds?: string[];
  selectedUserIds?: string[];
  userIds?: string[]; // Backend might send this instead of selectedUserIds
  userTypeFilter?: 'all' | 'team leads' | 'team members';
  tenantId: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  createdBy?: string | null;
  updatedBy?: string | null;
}
