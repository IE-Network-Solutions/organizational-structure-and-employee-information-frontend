import { useQuery } from 'react-query';
import axios from 'axios';
import {
  DailyPlanResponse,
  DailyTaskSuggestion,
  KeyResultSuggestion,
  OKRResponse,
  WeeklyPlanResponse,
  WeeklyTaskSuggestion,
} from './interface';

// Call AI backend directly now that CORS is fixed
const BASE_URL = process.env.NEXT_PUBLIC_AI_BASE_URL || 'https://selamnew-ai.ienetworks.co';

const postWeeklyPlan = async (payload: { key_result: string; progress?: number; completed_tasks?: string[]; report?: any[] }) => {
  const { data } = await axios.post<WeeklyPlanResponse>(
    `${BASE_URL}/weekly-plan`,
    payload,
    { headers: { 'Content-Type': 'application/json' } },
  );
  return data?.weekly_plan?.WeeklyTasks ?? [];
};

const postDailyPlan = async (payload: { weekly_plan: string; progress?: number; completed_tasks?: string[]; report?: any[] }) => {
  const { data } = await axios.post<DailyPlanResponse>(
    `${BASE_URL}/daily-plan`,
    payload,
    { headers: { 'Content-Type': 'application/json' } },
  );

  const tasks = (data?.daily_plan?.DailyTasks ?? []) as DailyTaskSuggestion[];

  if (tasks.length > 0) {
    const totalWeight = tasks.reduce(
      (sum, task) => sum + (task.weight || 0),
      0,
    );
    if (totalWeight > 0 && totalWeight !== 100) {
      tasks.forEach((task) => {
        task.weight = Math.round((task.weight / totalWeight) * 100);
      });
      const adjustedTotal = tasks.reduce((sum, task) => sum + task.weight, 0);
      if (adjustedTotal !== 100 && tasks.length > 0) {
        tasks[0].weight += 100 - adjustedTotal;
      }
    } else if (totalWeight === 0) {
      const equalWeight = Math.floor(100 / tasks.length);
      const remainder = 100 - equalWeight * tasks.length;
      tasks.forEach((task, index) => {
        task.weight = equalWeight + (index < remainder ? 1 : 0);
      });
    }
  }

  return tasks;
};

const postOKR = async (objective: string) => {
  const { data } = await axios.post<OKRResponse>(
    `${BASE_URL}/okr`,
    { objective },
    { headers: { 'Content-Type': 'application/json' } },
  );
  return (data?.answer?.['Key Results'] ?? []) as KeyResultSuggestion[];
};

export const useGetWeeklyPlanSuggestions = (
  payload: { key_result: string; progress?: number; completed_tasks?: string[]; report?: any[] },
  enabled = true,
) =>
  useQuery<WeeklyTaskSuggestion[]>(
    ['ai-weekly-plan', JSON.stringify(payload)],
    () => postWeeklyPlan(payload),
    { enabled: Boolean(payload.key_result) && enabled },
  );

export const useGetDailyPlanSuggestions = (
  payload: { weekly_plan: string; progress?: number; completed_tasks?: string[]; report?: any[] },
  enabled = true,
) =>
  useQuery<DailyTaskSuggestion[]>(
    ['ai-daily-plan', JSON.stringify(payload)],
    () => postDailyPlan(payload),
    { enabled: Boolean(payload.weekly_plan) && enabled },
  );

export const useGetOKRKeyResultSuggestions = (
  objective: string,
  enabled = true,
) =>
  useQuery<KeyResultSuggestion[]>(
    ['ai-okr-keyresults', objective],
    () => postOKR(objective),
    { enabled: Boolean(objective) && enabled },
  );

// Compatibility exports matching previous utils/aiService API
export const fetchWeeklyPlanSuggestions = (payload: { key_result: string; progress?: number; completed_tasks?: string[]; report?: any[] }) =>
  postWeeklyPlan(payload);
export const fetchDailyPlanSuggestions = (payload: { weekly_plan: string; progress?: number; completed_tasks?: string[]; report?: any[] }) =>
  postDailyPlan(payload);
export const fetchOKRKeyResultSuggestions = (objective: string) =>
  postOKR(objective);
