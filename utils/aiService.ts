import axios from 'axios';

// Use local API route to avoid browser CORS issues
const BASE_URL = '/api/ai';

export type WeeklyTaskSuggestion = {
  title: string;
  target?: number;
  weight: number;
  priority: string;
};

export type DailyTaskSuggestion = {
  title: string;
  weight: number;
  priority: string;
};

type WeeklyPlanResponse = {
  weekly_plan?: {
    WeeklyTasks?: WeeklyTaskSuggestion[];
  };
};

type DailyPlanResponse = {
  daily_plan?: {
    DailyTasks?: DailyTaskSuggestion[];
  };
};

export async function fetchWeeklyPlanSuggestions(keyResult: string) {
  const { data } = await axios.post<WeeklyPlanResponse>(
    `${BASE_URL}/weekly-plan`,
    { key_result: keyResult },
    { headers: { 'Content-Type': 'application/json' } },
  );

  return data?.weekly_plan?.WeeklyTasks ?? [];
}

export async function fetchDailyPlanSuggestions(weeklyPlan: string) {
  const { data } = await axios.post<DailyPlanResponse>(
    `${BASE_URL}/daily-plan`,
    { weekly_plan: weeklyPlan },
    { headers: { 'Content-Type': 'application/json' } },
  );

  const tasks = data?.daily_plan?.DailyTasks ?? [];

  // Ensure daily plan tasks have weights that sum to 100
  if (tasks.length > 0) {
    const totalWeight = tasks.reduce(
      (sum, task) => sum + (task.weight || 0),
      0,
    );

    if (totalWeight > 0) {
      // Normalize weights to sum to 100
      tasks.forEach((task) => {
        task.weight = Math.round((task.weight / totalWeight) * 100);
      });

      // Adjust the last task to ensure exact sum of 100
      const adjustedTotal = tasks.reduce((sum, task) => sum + task.weight, 0);
      if (adjustedTotal !== 100 && tasks.length > 0) {
        tasks[tasks.length - 1].weight += 100 - adjustedTotal;
      }
    } else {
      // If no weights provided, distribute equally
      const equalWeight = Math.floor(100 / tasks.length);
      const remainder = 100 - equalWeight * tasks.length;

      tasks.forEach((task, index) => {
        task.weight = equalWeight + (index < remainder ? 1 : 0);
      });
    }
  }

  return tasks;
}

export type KeyResultSuggestion = {
  title: string;
  metric_type: string;
  weight: number;
  initial_value?: number;
  target_value?: number;
};

type OKRResponse = {
  answer?: {
    'Key Results'?: KeyResultSuggestion[];
  };
};

export async function fetchOKRKeyResultSuggestions(
  objective: string,
): Promise<KeyResultSuggestion[]> {
  const { data } = await axios.post<OKRResponse>(
    `${BASE_URL}/okr`,
    { objective },
    { headers: { 'Content-Type': 'application/json' } },
  );

  return data?.answer?.['Key Results'] ?? [];
}

type CopilotResponse = {
  answer: string;
};

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

export async function fetchCopilotResponse(
  query: string,
  context?: ChatContext,
  options?: CopilotRequestOptions,
): Promise<string> {
  const payload = {
    query,
    context: context || { messages: [] },
    memory: options?.memory || [],
    top_k: options?.top_k || 3,
    userInfo: options?.userInfo,
    usage: options?.usage,
  };

  const { data } = await axios.post<CopilotResponse>(
    `${BASE_URL}/copilot`,
    payload,
    { headers: { 'Content-Type': 'application/json' } },
  );

  return data?.answer ?? '';
}
