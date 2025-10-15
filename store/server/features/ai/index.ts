/**
 * AI Feature - Main Export File
 *
 * This file serves as the central export point for all AI-related functionality.
 * It organizes exports into logical groups for easy importing throughout the application.
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
} from './queries';

export {
  // Mutation Hooks
  useCopilotMutation,
  useWeeklyPlanMutation,
  useDailyPlanMutation,
  useOKRMutation,
  // Direct Function Exports
  fetchCopilotResponse,
  fetchWeeklyPlanSuggestions,
  fetchDailyPlanSuggestions,
  fetchOKRKeyResultSuggestions,
} from './mutations';

// ===== Server-side API Handlers =====
export {
  handleCopilotRequest,
  handleOKRRequest,
  handleWeeklyPlanRequest,
  handleDailyPlanRequest,
} from './api';

// ===== Route Handlers =====
export {
  copilotRouteHandler,
  okrRouteHandler,
  weeklyPlanRouteHandler,
  dailyPlanRouteHandler,
} from './routes';
