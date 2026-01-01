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
  status?: 'completed' | 'pending' | 'failed';
}

export interface Milestone {
  id: string;
  name?: string;
  title?: string;
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
  targetValue?: string | number;
  currentValue?: string | number;
  progress?: string | number;
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


