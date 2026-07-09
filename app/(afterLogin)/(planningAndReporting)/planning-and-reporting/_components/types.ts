export type Priority = 'Low' | 'Medium' | 'High' | 'Priority';
export type Cadence = 'daily' | 'weekly' | 'monthly';
export type ViewMode = 'planning' | 'reporting';

export interface PlanTask {
  id: string;
  title: string;
  priority: Priority;
  weight: number;
  target?: number;
  achieved?: number;
  hasAttachment?: boolean;
  status?:
    | 'completed'
    | 'pending'
    | 'failed'
    | 'pre_achieved'
    | 'pre_pending'
    | string;
  /** Failure reason from API when task did not meet target (reporting). */
  customReason?: string;
  /** Plan task represents achieving the key result or a milestone as a single outcome. */
  achieveMK?: boolean;
  /** When set with achieveMK, outcome is tied to this milestone (vs key-result level). */
  outcomeMilestoneId?: string | null;
}

export interface Milestone {
  id: string;
  name?: string;
  title?: string;
  status?: string;
  tasks: PlanTask[];
  parentTask?: any[];
}

export interface KeyResult {
  id: string;
  name?: string;
  title?: string;
  tasks: PlanTask[];
  milestones?: Milestone[];
  parentTask?: any[];
  objective?: any;
  metricType?: {
    id: string;
    name: string;
    description?: string;
  };
  key_type?: string;
  metricTypeName?: string;
  previousMetricTypeName?: string;
  targetValue?: string | number;
  currentValue?: string | number;
  initialValue?: string | number;
  progress?: string | number;
  status?: string;
  keyResultCompletionStatus?: string;
  deletedAt?: string | null;
}

export interface PlanOwner {
  name: string;
  role: string;
  avatarInitials: string;
  avatar?: string;
}

export interface PlanStatus {
  label: string;
  updatedAt: string;
  tone: string;
  icon?: string;
}

export interface PlanSummary {
  id: string;
  /** Plan owner user id (for viewer-only affordances). */
  ownerUserId?: string;
  /** When true, plan has been reported (read-only / locked for planning edits). */
  isReported?: boolean;
  cadence: Cadence;
  owner: PlanOwner;
  status: PlanStatus;
  metricLabel: string;
  milestoneLabel: string;
  target: number;
  achieved: number;
  progress: number;
  summary: string;
  tasks: PlanTask[];
  keyResults?: KeyResult[]; // Add hierarchical structure
  commentCount: number;
  commentAvatars: string[];
  comments?: any[]; // Comments data
  notificationCount?: number;
  createdAt: string;
  reprimandCount?: number;
  appreciationCount?: number;
}
