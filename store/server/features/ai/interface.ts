// AI Service Interface Types

export interface WeeklyTaskSuggestion {
  title: string;
  target?: number;
  weight: number;
  priority: string;
}

export interface DailyTaskSuggestion {
  title: string;
  weight: number;
  priority: string;
}

export interface KeyResultSuggestion {
  title: string;
  metric_type: string;
  weight: number;
  initial_value?: number;
  target_value?: number;
  // Optional milestones coming from AI for milestone-type key results
  milestones?: Array<{
    title: string;
    weight: number;
  }>;
}

export interface WeeklyPlanResponse {
  weekly_plan?: {
    WeeklyTasks?: WeeklyTaskSuggestion[];
  };
}

export interface DailyPlanResponse {
  daily_plan?: {
    DailyTasks?: DailyTaskSuggestion[];
  };
}

export interface OKRResponse {
  answer?: {
    'Key Results'?: KeyResultSuggestion[];
  };
}

export interface CopilotResponse {
  answer: string;
}

export interface ChatContext {
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

export interface UserInfo {
  userId: string;
  tenantId: string;
  role?: string;
}

export interface UsageInfo {
  sessionId?: string;
  chatId?: string;
  messageCount?: number;
}

export interface CopilotRequestOptions {
  memory?: Array<Record<string, any>>;
  top_k?: number;
  userInfo?: UserInfo;
  usage?: UsageInfo;
}

export interface CopilotPayload {
  query: string;
  context: ChatContext;
  memory: Array<Record<string, any>>;
  top_k: number;
  userInfo?: {
    userId: string;
    tenantId: string;
    role?: string;
    timestamp: string;
  };
  usage?: {
    sessionId?: string;
    chatId?: string;
    messageCount?: number;
    feature: string;
    timestamp: string;
  };
}

export interface WeeklyPlanPayload {
  key_result: string;
}

export interface DailyPlanPayload {
  weekly_plan: string;
}

export interface OKRPayload {
  objective: string;
}

