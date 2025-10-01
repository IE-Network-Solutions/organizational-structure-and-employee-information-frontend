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

  return data?.daily_plan?.DailyTasks ?? [];
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

export async function fetchOKRKeyResultSuggestions(objective: string): Promise<KeyResultSuggestion[]> {
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

export async function fetchCopilotResponse(query: string): Promise<string> {
  const { data } = await axios.post<CopilotResponse>(
    `${BASE_URL}/copilot`,
    { query },
    { headers: { 'Content-Type': 'application/json' } },
  );

  return data?.answer ?? '';
}

