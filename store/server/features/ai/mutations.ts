import { useMutation } from 'react-query';
import axios from 'axios';
import {
  CopilotPayload,
  CopilotResponse,
  WeeklyPlanPayload,
  WeeklyPlanResponse,
  DailyPlanPayload,
  DailyPlanResponse,
  OKRPayload,
  OKRResponse,
  ChatContext,
  CopilotRequestOptions,
  WeeklyTaskSuggestion,
  DailyTaskSuggestion,
  KeyResultSuggestion,
} from './interface';

// Use local API routes to avoid CORS issues
const BASE_URL = '/api/ai';

// Copilot mutation
const postCopilot = async (payload: CopilotPayload): Promise<string> => {
  const { data } = await axios.post<CopilotResponse>(
    `${BASE_URL}/copilot`,
    payload,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );
  return data?.answer ?? '';
};

// Weekly Plan mutation
const postWeeklyPlan = async (
  keyResult: string,
): Promise<WeeklyTaskSuggestion[]> => {
  const { data } = await axios.post<WeeklyPlanResponse>(
    `${BASE_URL}/weekly-plan`,
    { key_result: keyResult } as WeeklyPlanPayload,
    { headers: { 'Content-Type': 'application/json' } },
  );
  return data?.weekly_plan?.WeeklyTasks ?? [];
};

// Daily Plan mutation
const postDailyPlan = async (
  weeklyPlan: string,
): Promise<DailyTaskSuggestion[]> => {
  const { data } = await axios.post<DailyPlanResponse>(
    `${BASE_URL}/daily-plan`,
    { weekly_plan: weeklyPlan } as DailyPlanPayload,
    { headers: { 'Content-Type': 'application/json' } },
  );

  const tasks = (data?.daily_plan?.DailyTasks ?? []) as DailyTaskSuggestion[];

  // Ensure daily plan tasks have weights that sum to 100
  if (tasks.length > 0) {
    const totalWeight = tasks.reduce((sum, task) => sum + (task.weight || 0), 0);
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
};

// OKR mutation
const postOKR = async (objective: string): Promise<KeyResultSuggestion[]> => {
  const { data } = await axios.post<OKRResponse>(
    `${BASE_URL}/okr`,
    { objective } as OKRPayload,
    { headers: { 'Content-Type': 'application/json' } },
  );
  return (data?.answer?.['Key Results'] ?? []) as KeyResultSuggestion[];
};

// Custom hooks for mutations
export const useCopilotMutation = () => {
  return useMutation<
    string,
    Error,
    {
      query: string;
      context?: ChatContext;
      options?: CopilotRequestOptions;
    }
  >(async ({ query, context, options }) => {
    const payload: CopilotPayload = {
      query,
      context: context || { messages: [] },
      memory: options?.memory || [],
      top_k: options?.top_k || 3,
      userInfo: options?.userInfo
        ? {
            userId: options.userInfo.userId,
            tenantId: options.userInfo.tenantId,
            role: options.userInfo.role,
            timestamp: new Date().toISOString(),
          }
        : undefined,
      usage: options?.usage
        ? {
            sessionId: options.usage.sessionId,
            chatId: options.usage.chatId,
            messageCount: options.usage.messageCount,
            feature: 'chatbot',
            timestamp: new Date().toISOString(),
          }
        : undefined,
    };

    return postCopilot(payload);
  });
};

export const useWeeklyPlanMutation = () => {
  return useMutation<WeeklyTaskSuggestion[], Error, string>((keyResult) =>
    postWeeklyPlan(keyResult),
  );
};

export const useDailyPlanMutation = () => {
  return useMutation<DailyTaskSuggestion[], Error, string>((weeklyPlan) =>
    postDailyPlan(weeklyPlan),
  );
};

export const useOKRMutation = () => {
  return useMutation<KeyResultSuggestion[], Error, string>((objective) =>
    postOKR(objective),
  );
};

// Direct function exports for non-hook usage
export const fetchCopilotResponse = async (
  query: string,
  context?: ChatContext,
  options?: CopilotRequestOptions,
): Promise<string> => {
  const payload: CopilotPayload = {
    query,
    context: context || { messages: [] },
    memory: options?.memory || [],
    top_k: options?.top_k || 3,
    userInfo: options?.userInfo
      ? {
          userId: options.userInfo.userId,
          tenantId: options.userInfo.tenantId,
          role: options.userInfo.role,
          timestamp: new Date().toISOString(),
        }
      : undefined,
    usage: options?.usage
      ? {
          sessionId: options.usage.sessionId,
          chatId: options.usage.chatId,
          messageCount: options.usage.messageCount,
          feature: 'chatbot',
          timestamp: new Date().toISOString(),
        }
      : undefined,
  };

  return postCopilot(payload);
};

export const fetchWeeklyPlanSuggestions = (
  keyResult: string,
): Promise<WeeklyTaskSuggestion[]> => postWeeklyPlan(keyResult);

export const fetchDailyPlanSuggestions = (
  weeklyPlan: string,
): Promise<DailyTaskSuggestion[]> => postDailyPlan(weeklyPlan);

export const fetchOKRKeyResultSuggestions = (
  objective: string,
): Promise<KeyResultSuggestion[]> => postOKR(objective);
