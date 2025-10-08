// This file now re-exports from the store/server/features/ai structure
// to maintain backward compatibility with existing imports

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
  fetchWeeklyPlanSuggestions,
  fetchDailyPlanSuggestions,
  fetchOKRKeyResultSuggestions,
  useCopilotMutation,
  useWeeklyPlanMutation,
  useDailyPlanMutation,
  useOKRMutation,
} from '@/store/server/features/ai/mutations';
