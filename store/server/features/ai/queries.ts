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

const postWeeklyPlan = async (keyResult: string) => {
  const { data } = await axios.post<WeeklyPlanResponse>(
    `${BASE_URL}/weekly-plan`,
    { key_result: keyResult },
    { headers: { 'Content-Type': 'application/json' } },
  );
  return data?.weekly_plan?.WeeklyTasks ?? [];
};

const postDailyPlan = async (weeklyPlan: string) => {
  const { data } = await axios.post<DailyPlanResponse>(
    `${BASE_URL}/daily-plan`,
    { weekly_plan: weeklyPlan },
    { headers: { 'Content-Type': 'application/json' } },
  );

  const tasks = (data?.daily_plan?.DailyTasks ?? []) as DailyTaskSuggestion[];

  if (tasks.length > 0) {
    const totalWeight = tasks.reduce((sum, task) => sum + (task.weight || 0), 0);
    if (totalWeight > 0) {
      tasks.forEach((task) => {
        task.weight = Math.round((task.weight / totalWeight) * 100);
      });
      const adjustedTotal = tasks.reduce((sum, task) => sum + task.weight, 0);
      if (adjustedTotal !== 100 && tasks.length > 0) {
        tasks[tasks.length - 1].weight += 100 - adjustedTotal;
      }
    } else {
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

export const useGetWeeklyPlanSuggestions = (keyResult: string, enabled = true) =>
  useQuery<WeeklyTaskSuggestion[]>(
    ['ai-weekly-plan', keyResult],
    () => postWeeklyPlan(keyResult),
    { enabled: Boolean(keyResult) && enabled }
  );

export const useGetDailyPlanSuggestions = (weeklyPlan: string, enabled = true) =>
  useQuery<DailyTaskSuggestion[]>(
    ['ai-daily-plan', weeklyPlan],
    () => postDailyPlan(weeklyPlan),
    { enabled: Boolean(weeklyPlan) && enabled }
  );

export const useGetOKRKeyResultSuggestions = (objective: string, enabled = true) =>
  useQuery<KeyResultSuggestion[]>(
    ['ai-okr-keyresults', objective],
    () => postOKR(objective),
    { enabled: Boolean(objective) && enabled }
  );

// Compatibility exports matching previous utils/aiService API
export const fetchWeeklyPlanSuggestions = (keyResult: string) => postWeeklyPlan(keyResult);
export const fetchDailyPlanSuggestions = (weeklyPlan: string) => postDailyPlan(weeklyPlan);
export const fetchOKRKeyResultSuggestions = (objective: string) => postOKR(objective);
