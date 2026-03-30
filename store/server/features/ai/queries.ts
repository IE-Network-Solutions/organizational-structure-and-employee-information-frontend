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

const BASE_URL =
  process.env.NEXT_PUBLIC_AI_BASE_URL || 'https://selamnew-ai.ienetworks.co';

/** Browser calls same-origin API routes to avoid CORS / mixed-content issues. */
const weeklyPlanUrl = () =>
  typeof window !== 'undefined'
    ? '/api/ai/weekly-plan'
    : `${BASE_URL}/weekly-plan`;
const dailyPlanUrl = () =>
  typeof window !== 'undefined'
    ? '/api/ai/daily-plan'
    : `${BASE_URL}/daily-plan`;

const postWeeklyPlan = async (payload: { keyResultReport: any[] }) => {
  const { data } = await axios.post<WeeklyPlanResponse>(
    weeklyPlanUrl(),
    payload,
    { headers: { 'Content-Type': 'application/json' } },
  );
  const raw = data?.weekly_plan?.WeeklyTasks ?? [];
  return Array.isArray(raw) ? raw : [];
};

const postDailyPlan = async (payload: { daily_plan_request: any }) => {
  const { data } = await axios.post<DailyPlanResponse>(
    dailyPlanUrl(),
    payload,
    { headers: { 'Content-Type': 'application/json' } },
  );

  const rawTasks = data?.daily_plan?.DailyTasks ?? [];
  const tasks = (
    Array.isArray(rawTasks) ? rawTasks : []
  ) as DailyTaskSuggestion[];

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
    } else if (totalWeight === 0 && tasks.length > 0) {
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
  payload: { keyResultReport: any[] },
  enabled = true,
) =>
  useQuery<WeeklyTaskSuggestion[]>(
    ['ai-weekly-plan', JSON.stringify(payload)],
    () => postWeeklyPlan(payload),
    {
      enabled:
        Array.isArray(payload.keyResultReport) &&
        payload.keyResultReport.length > 0 &&
        enabled,
    },
  );

export const useGetDailyPlanSuggestions = (
  payload: { daily_plan_request: any },
  enabled = true,
) =>
  useQuery<DailyTaskSuggestion[]>(
    ['ai-daily-plan', JSON.stringify(payload)],
    () => postDailyPlan(payload),
    { enabled: Boolean(payload.daily_plan_request) && enabled },
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
export const fetchWeeklyPlanSuggestions = (payload: {
  keyResultReport: any[];
}) => postWeeklyPlan(payload);
export const fetchDailyPlanSuggestions = (payload: {
  daily_plan_request: any;
}) => postDailyPlan(payload);
export const fetchOKRKeyResultSuggestions = (objective: string) =>
  postOKR(objective);
