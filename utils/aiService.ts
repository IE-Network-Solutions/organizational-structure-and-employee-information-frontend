// This file now re-exports from the store/server/features/ai structure
// to maintain backward compatibility with existing imports
//
// All AI requests are now sent directly to the backend at NEXT_PUBLIC_AI_BASE_URL
// without going through Next.js API proxy routes.

export {
  type WeeklyTaskSuggestion,
  type DailyTaskSuggestion,
  type KeyResultSuggestion,
  type ChatContext,
  type UserInfo,
  type UsageInfo,
  type CopilotRequestOptions,
} from '@/store/server/features/ai/interface';

export {
  fetchCopilotResponse,
  useCopilotMutation,
  useWeeklyPlanMutation,
  useDailyPlanMutation,
  useOKRMutation,
} from '@/store/server/features/ai/mutations';

export {
  fetchWeeklyPlanSuggestions,
  fetchDailyPlanSuggestions,
  fetchOKRKeyResultSuggestions,
  useGetWeeklyPlanSuggestions,
  useGetDailyPlanSuggestions,
  useGetOKRKeyResultSuggestions,
} from '@/store/server/features/ai/queries';
