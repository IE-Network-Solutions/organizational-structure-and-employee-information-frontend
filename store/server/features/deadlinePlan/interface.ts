export type DeadlineTaskPriority = 'low' | 'medium' | 'high';
export type DeadlineTaskStatus = 'active' | 'reported';
export type DeadlineTaskOutcome = 'done' | 'not_done';
export type DeadlineTaskApprovalStatus = 'open' | 'pending' | 'closed';
export type DeadlineTaskStatusFilter = 'all' | 'active' | 'reported';

export interface DeadlineMilestone {
  id: string;
  title: string;
  status?: string | null;
  weight?: number | string;
}

export interface DeadlineKeyResult {
  id: string;
  title: string;
  progress?: number | string | null;
  initialValue?: number | string | null;
  thresholdValue?: number | string | null;
  stretchValue?: number | string | null;
  targetValue?: number | string | null;
  currentValue?: number | string | null;
  weight?: number | string | null;
  isClosed?: boolean;
  metricType?: { id: string; name: string } | null;
  milestones?: DeadlineMilestone[];
  objective?: { id: string; title?: string; userId?: string } | null;
}

export interface DeadlineTask {
  id: string;
  title: string;
  description: string | null;
  priority: DeadlineTaskPriority;
  /** YYYY-MM-DD */
  startDate: string;
  /** YYYY-MM-DD */
  deadline: string;
  assigneeId: string;
  /** Null unless someone other than the assignee created the task. */
  assignedById: string | null;
  parentTaskId: string | null;
  subTasks?: DeadlineTask[];
  keyResultId: string | null;
  keyResult?: DeadlineKeyResult | null;
  milestoneId: string | null;
  milestone?: DeadlineMilestone | null;
  targetValue: number | null;
  achieveKR: boolean;
  isLocked: boolean;
  lockedById: string | null;
  status: DeadlineTaskStatus;
  outcome: DeadlineTaskOutcome | null;
  actualValue: number | null;
  customReason: string | null;
  reportedAt: string | null;
  approvalStatus: DeadlineTaskApprovalStatus;
  approvedById: string | null;
  createdAt: string;
}

export interface DeadlineTaskPage {
  items: DeadlineTask[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}

export interface DeadlineTaskSearchFilter {
  assigneeIds: string[];
  from?: string;
  to?: string;
  includeOverdue?: boolean;
  status: DeadlineTaskStatusFilter;
}

export interface DeadlineSubTaskPayload {
  id?: string;
  title: string;
  date: string;
  description?: string | null;
}

export interface DeadlineTaskPayload {
  title: string;
  description?: string | null;
  priority?: DeadlineTaskPriority;
  assigneeId?: string;
  startDate: string;
  deadline: string;
  keyResultId?: string | null;
  milestoneId?: string | null;
  targetValue?: number | null;
  achieveKR?: boolean;
  subTasks?: DeadlineSubTaskPayload[];
}

export interface DeadlineTaskReportPayload {
  taskId: string;
  outcome: DeadlineTaskOutcome;
  actualValue?: number | null;
  customReason?: string | null;
}

/** Task counts for one assignee and key result (null = general tasks). */
export interface DeadlineTaskSummaryRow {
  assigneeId: string;
  keyResultId: string | null;
  total: number;
  done: number;
}
