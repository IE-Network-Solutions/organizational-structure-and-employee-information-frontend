import axios from 'axios';
import { AI_BASE_URL } from '@/utils/constants';
import {
  CopilotPayload,
  CopilotResponse,
  WeeklyPlanPayload,
  WeeklyPlanResponse,
  DailyPlanPayload,
  DailyPlanResponse,
  OKRPayload,
  OKRResponse,
} from './interface';

/**
 * Server-side API handlers for AI features
 * These functions handle the server-to-server communication with the AI backend
 * avoiding CORS issues by acting as a proxy
 */

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

// Copilot API Handler
export async function handleCopilotRequest(
  body: any,
): Promise<ApiResponse<CopilotResponse>> {
  try {
    const { query, context, memory, top_k: topK, userInfo, usage } = body;

    if (!query) {
      return {
        error: 'Query is required',
        status: 400,
      };
    }

    // Prepare context for the AI backend
    const contextData = context?.messages || [];

    // Limit context to last 10 messages to avoid token limits
    const limitedContext = contextData.slice(-10);

    // Prepare enhanced payload with copilot usage information
    const payload: CopilotPayload = {
      query,
      memory: memory || [],
      top_k: topK || 3,
      context: { messages: limitedContext },
      // Include user context for personalized responses
      userInfo: userInfo
        ? {
            userId: userInfo.userId,
            tenantId: userInfo.tenantId,
            role: userInfo.role,
            timestamp: new Date().toISOString(),
          }
        : undefined,
      // Track copilot usage analytics
      usage: usage
        ? {
            sessionId: usage.sessionId,
            chatId: usage.chatId,
            messageCount: usage.messageCount,
            feature: 'chatbot',
            timestamp: new Date().toISOString(),
          }
        : undefined,
    };

    // Forward the request to the AI backend with enhanced payload
    const response = await axios.post<CopilotResponse>(
      `${AI_BASE_URL}/copilot`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    return {
      data: response.data,
      status: 200,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        error:
          error.response?.data?.message || 'Failed to get response from AI',
        status: error.response?.status || 500,
      };
    }

    return {
      error: 'Internal server error',
      status: 500,
    };
  }
}

// OKR API Handler
export async function handleOKRRequest(
  body: OKRPayload,
): Promise<ApiResponse<OKRResponse>> {
  try {
    const response = await fetch(`${AI_BASE_URL}/okr`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      // Ensure no caching while experimenting
      cache: 'no-store',
    });

    const data = await response.json().catch(() => ({}));

    return {
      data,
      status: response.status,
    };
  } catch (error: any) {
    return {
      error: 'Failed to fetch OKR key result suggestions',
      status: 500,
    };
  }
}

// Weekly Plan API Handler
export async function handleWeeklyPlanRequest(
  body: WeeklyPlanPayload,
): Promise<ApiResponse<WeeklyPlanResponse>> {
  try {
    const response = await fetch(`${AI_BASE_URL}/weekly-plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      // Ensure no caching while experimenting
      cache: 'no-store',
    });

    const data = await response.json().catch(() => ({}));

    return {
      data,
      status: response.status,
    };
  } catch (error: any) {
    return {
      error: 'Failed to fetch weekly plan suggestions',
      status: 500,
    };
  }
}

// Daily Plan API Handler
export async function handleDailyPlanRequest(
  body: DailyPlanPayload,
): Promise<ApiResponse<DailyPlanResponse>> {
  try {
    const response = await fetch(`${AI_BASE_URL}/daily-plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    const data = await response.json().catch(() => ({}));

    return {
      data,
      status: response.status,
    };
  } catch (error: any) {
    return {
      error: 'Failed to fetch daily plan suggestions',
      status: 500,
    };
  }
}
