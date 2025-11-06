/**
 * AI Feature - Main Export File
 *
 * This file serves as the central export point for all AI-related functionality.
 * All AI requests now go directly to the backend using NEXT_PUBLIC_AI_BASE_URL.
 * 
 * Architecture:
 * Browser → mutations.ts/queries.ts → AI Backend (https://selamnew-ai.ienetworks.co)
 */

// ===== Type Definitions =====
export type {
  WeeklyTaskSuggestion,
  DailyTaskSuggestion,
  KeyResultSuggestion,
  WeeklyPlanResponse,
  DailyPlanResponse,
  OKRResponse,
  CopilotResponse,
  ChatContext,
  UserInfo,
  UsageInfo,
  CopilotRequestOptions,
  CopilotPayload,
  WeeklyPlanPayload,
  DailyPlanPayload,
  OKRPayload,
} from './interface';

// ===== React Query Hooks (Client-side) =====
export {
  // Query Hooks
  useGetWeeklyPlanSuggestions,
  useGetDailyPlanSuggestions,
  useGetOKRKeyResultSuggestions,
  // Direct Function Exports for queries
  fetchWeeklyPlanSuggestions,
  fetchDailyPlanSuggestions,
  fetchOKRKeyResultSuggestions,
} from './queries';

export {
  // Mutation Hooks
  useCopilotMutation,
  useWeeklyPlanMutation,
  useDailyPlanMutation,
  useOKRMutation,
  // Direct Function Exports for mutations
  fetchCopilotResponse,
} from './mutations';
