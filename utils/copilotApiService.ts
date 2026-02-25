import axios, { AxiosError } from 'axios';
import { getCurrentToken } from '@/utils/getCurrentToken';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { AZURE_APP_SERVICE } from './constants';

/** User-facing error messages for consistent Copilot UX */
export const COPILOT_ERROR_MESSAGES = {
  AUTH_REQUIRED: 'Please log in to continue using Copilot.',
  PERMISSION_DENIED:
    "You don't have permission for this action. Contact your administrator if needed.",
  TIMEOUT: 'Request timed out. Please try again.',
  SERVICE_UNAVAILABLE:
    'Copilot is temporarily unavailable. Please try again later.',
  NO_DATA:
    "I couldn't find any information on that. Try refining your question.",
  NETWORK: "We couldn't reach Copilot. Check your connection and try again.",
  INVALID_REQUEST:
    'Your request could not be processed. Please check your input.',
  UNEXPECTED: 'Something went wrong. Please try again.',
} as const;

/**
 * Maps backend, proxy, or axios errors to a single user-friendly message.
 * Use in catch blocks so users never see raw "Aborted", "Server error (503)", etc.
 */
export function normalizeCopilotError(error: unknown): string {
  if (error instanceof Error) {
    const msg = error.message;
    const lower = msg.toLowerCase();
    if (
      lower.includes('auth') ||
      lower.includes('log in') ||
      lower.includes('token') ||
      lower.includes('401')
    )
      return COPILOT_ERROR_MESSAGES.AUTH_REQUIRED;
    if (
      lower.includes('permission') ||
      lower.includes('403') ||
      lower.includes('access denied')
    )
      return COPILOT_ERROR_MESSAGES.PERMISSION_DENIED;
    if (
      lower.includes('timeout') ||
      lower.includes('timed out') ||
      lower.includes('abort') ||
      lower.includes('econnaborted')
    )
      return COPILOT_ERROR_MESSAGES.TIMEOUT;
    if (
      lower.includes('503') ||
      lower.includes('unavailable') ||
      lower.includes('service')
    )
      return COPILOT_ERROR_MESSAGES.SERVICE_UNAVAILABLE;
    if (
      lower.includes('network') ||
      lower.includes('connection') ||
      lower.includes('err_network') ||
      lower.includes('reach')
    )
      return COPILOT_ERROR_MESSAGES.NETWORK;
    if (lower.includes('400') || lower.includes('invalid request'))
      return COPILOT_ERROR_MESSAGES.INVALID_REQUEST;
    if (lower.includes("couldn't find") || lower.includes('no information'))
      return COPILOT_ERROR_MESSAGES.NO_DATA;
    return msg || COPILOT_ERROR_MESSAGES.UNEXPECTED;
  }
  return COPILOT_ERROR_MESSAGES.UNEXPECTED;
}

// Returns the full Azure App Service URL for copilot from constants (env variable)
const getCopilotUrl = () => AZURE_APP_SERVICE || '';

interface CopilotChatRequest {
  prompt: string;
  context?: Record<string, any>;
}

interface CopilotChatResponse {
  success: boolean;
  answer: string;
  data?: {
    table?: {
      type: string;
      title?: string;
      columns: Array<{ key: string; title: string; dataIndex: string }>;
      rows: Array<Record<string, any>>;
    };
    objectiveTitles?: string[];
    [key: string]: any;
  };
  intent?: string;
  error?: string;
  backend_errors?: string[];
}

/** Table shape used by frontend (matches backend data.table) */
export interface CopilotTableData {
  type: string;
  title?: string;
  columns: Array<{ key: string; title: string; dataIndex: string }>;
  rows: Array<Record<string, unknown>>;
}

/**
 * Normalized result of a Copilot API response for consistent UI handling.
 * Covers all backend response formats: success/error, permission_denied, empty table, data.table, data.items, etc.
 */
export interface NormalizedCopilotResponse {
  success: boolean;
  displayText: string;
  messageType?: 'permission_denied' | 'error';
  backend_errors?: string[];
  tableData?: CopilotTableData;
  rawData?: unknown;
  intent?: string;
  answerForMetadata?: string;
}

/**
 * Normalizes the parsed Copilot API response into a single shape for UI.
 * Backend returns: { success, answer (from response), data, intent, error, backend_errors }.
 * Handles: success false, permission_denied, empty table (answer-only), table with rows, malformed payloads.
 * Never exposes raw JSON or stack traces to the user.
 */
export function normalizeCopilotResponse(
  parsed: unknown,
): NormalizedCopilotResponse {
  if (parsed == null || typeof parsed !== 'object') {
    return {
      success: false,
      displayText: COPILOT_ERROR_MESSAGES.UNEXPECTED,
      messageType: 'error',
    };
  }

  const p = parsed as Record<string, unknown>;
  const success = p.success === true;
  const errorVal = p.error;
  const errorStr =
    errorVal != null && errorVal !== '' ? String(errorVal).trim() : '';
  const answer = String(p.answer ?? p.response ?? '').trim();
  const data = p.data;
  const intent = typeof p.intent === 'string' ? p.intent : undefined;
  const backend_errors = Array.isArray(p.backend_errors)
    ? (p.backend_errors as string[]).filter(
      (e): e is string => typeof e === 'string',
    )
    : undefined;

  if (!success || errorStr) {
    const isPermissionDenied = errorStr === 'permission_denied';
    const displayText =
      answer ||
      (isPermissionDenied
        ? COPILOT_ERROR_MESSAGES.PERMISSION_DENIED
        : errorStr || COPILOT_ERROR_MESSAGES.UNEXPECTED);
    return {
      success: false,
      displayText,
      messageType: isPermissionDenied ? 'permission_denied' : 'error',
      backend_errors: backend_errors?.length ? backend_errors : undefined,
    };
  }

  const dataObj =
    data && typeof data === 'object'
      ? (data as Record<string, unknown>)
      : undefined;
  const table = dataObj?.table;
  const tableObj =
    table && typeof table === 'object'
      ? (table as Record<string, unknown>)
      : undefined;
  const rows = tableObj?.rows;
  const rowsArray = Array.isArray(rows) ? rows : [];
  const isEmptyTable = tableObj && rowsArray.length === 0;
  const hasMeaningfulAnswer = answer && answer !== 'No response received';

  let tableData: CopilotTableData | undefined;
  if (tableObj && !isEmptyTable && Array.isArray(tableObj.columns)) {
    tableData = {
      type: String(tableObj.type ?? 'table'),
      title: typeof tableObj.title === 'string' ? tableObj.title : undefined,
      columns: (
        tableObj.columns as Array<{
          key: string;
          title: string;
          dataIndex: string;
        }>
      ).filter(
        (c) =>
          c && typeof c === 'object' && c.key != null && c.dataIndex != null,
      ),
      rows: rowsArray as Array<Record<string, unknown>>,
    };
    if (tableData.columns.length === 0) tableData = undefined;
  }

  const displayText = tableData
    ? ''
    : hasMeaningfulAnswer
      ? answer
      : COPILOT_ERROR_MESSAGES.NO_DATA;

  return {
    success: true,
    displayText,
    tableData,
    rawData: dataObj,
    intent,
    answerForMetadata: answer || undefined,
  };
}

/**
 * Safely parses the raw Copilot API response string.
 * Returns null if parsing fails and response looks like JSON; otherwise returns parsed object or fallback.
 */
export function parseCopilotResponse(responseText: string): {
  parsed: Record<string, unknown>;
  parseError: boolean;
} {
  const trimmed = typeof responseText === 'string' ? responseText.trim() : '';
  try {
    const parsed = JSON.parse(trimmed) as Record<string, unknown>;
    return { parsed: parsed ?? {}, parseError: false };
  } catch {
    const looksLikeJson = trimmed.startsWith('{');
    return {
      parsed: looksLikeJson
        ? {}
        : { success: true, answer: trimmed, data: null },
      parseError: looksLikeJson,
    };
  }
}

/**
 * Sends a chat request to the Azure App Service backend
 * The backend will:
 * 1. Authenticate the user using headers (Authorization, tenantId, userId)
 * 2. Process the query
 * 3. Return the AI response
 *
 * @param query - The user's query/prompt
 * @param sessionId - Optional session ID for OKR session-specific queries
 * @param signal - Optional AbortSignal to cancel the request (e.g. when user clicks Stop)
 */
export const sendCopilotChatRequest = async (
  query: string,
  sessionId?: string,
  signal?: AbortSignal,
): Promise<string> => {
  // Get fresh token from Firebase (force refresh to ensure it's valid)
  // forceRefresh=true ensures we always get a newly refreshed token
  const token = await getCurrentToken(true);

  // Get tenant, user and role from store (role used for copilot access: only owner allowed)
  const { tenantId, userId, loggedUserRole, userData } =
    useAuthenticationStore.getState();
  const userRole = (loggedUserRole || userData?.role?.slug || '')
    .toString()
    .trim()
    .toLowerCase();

  if (!tenantId || !token) {
    throw new Error(COPILOT_ERROR_MESSAGES.AUTH_REQUIRED);
  }

  // Log token info in development (first 20 chars only for security)
  if (process.env.NODE_ENV === 'development') {
    /* eslint-disable no-console */
    console.log('🔑 Using refreshed token:', token.substring(0, 20) + '...');
    console.log('📋 Tenant ID:', tenantId);
    console.log('👤 User ID:', userId || 'not provided');
    /* eslint-enable no-console */
  }

  // Prepare headers exactly as frontend does for other API calls
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    tenantId: tenantId,
  };

  if (userId) {
    headers.userId = userId;
  }

  // Send user role so backend can restrict copilot to owner only
  if (userRole) {
    headers['user-role'] = userRole;
  }

  // Add sessionId header if provided (for OKR session-specific queries)
  if (sessionId) {
    headers.sessionId = sessionId;
  }

  const copilotUrl = getCopilotUrl();
  // Log the URL being used in development
  if (process.env.NODE_ENV === 'development') {
    /* eslint-disable no-console */
    console.log('🌐 Copilot API URL:', copilotUrl);
    /* eslint-enable no-console */
  }

  try {
    const response = await axios.post<CopilotChatResponse>(
      copilotUrl,
      { prompt: query.trim() } as CopilotChatRequest,
      {
        headers,
        timeout: 60000, // 60 seconds timeout (increased for complex queries like daily plans)
        signal,
      },
    );

    // Return the full response object so frontend can access table data and error status
    return JSON.stringify({
      success: response.data.success !== false, // Default to true if not explicitly false
      answer: response.data.answer || 'No response received',
      data: response.data.data, // Includes data.table for table-capable intents
      intent: response.data.intent,
      error: response.data.error || null,
      backend_errors: response.data.backend_errors || null,
    });
  } catch (error) {
    if (axios.isAxiosError(error) && error.code === 'ERR_CANCELED') {
      throw error;
    }
    // Handle different error types
    if (axios.isAxiosError(error)) {
      type ErrorPayload = {
        detail?: string;
        message?: string;
        answer?: string;
        error?: string;
      };
      const axiosError = error as AxiosError<ErrorPayload>;

      if (axiosError.response) {
        // Backend returned an error response
        const data = axiosError.response.data;
        const status = axiosError.response.status;
        const message = data?.detail || data?.message || axiosError.message;

        if (status === 401) {
          throw new Error(COPILOT_ERROR_MESSAGES.AUTH_REQUIRED);
        } else if (status === 403) {
          throw new Error(COPILOT_ERROR_MESSAGES.PERMISSION_DENIED);
        } else if (status === 400) {
          throw new Error(message || COPILOT_ERROR_MESSAGES.INVALID_REQUEST);
        } else if (status === 503) {
          const serviceMessage = data?.answer || data?.error || message;
          throw new Error(
            serviceMessage && !/^\d+$/.test(String(serviceMessage).trim())
              ? String(serviceMessage).trim()
              : COPILOT_ERROR_MESSAGES.SERVICE_UNAVAILABLE,
          );
        } else {
          throw new Error(
            status >= 500
              ? COPILOT_ERROR_MESSAGES.SERVICE_UNAVAILABLE
              : message || COPILOT_ERROR_MESSAGES.UNEXPECTED,
          );
        }
      } else if (axiosError.request) {
        // Request was made but no response received (network, timeout, CORS, etc.)
        const errorMessage =
          axiosError.code === 'ECONNABORTED'
            ? COPILOT_ERROR_MESSAGES.TIMEOUT
            : axiosError.code === 'ERR_NETWORK'
              ? COPILOT_ERROR_MESSAGES.NETWORK
              : COPILOT_ERROR_MESSAGES.NETWORK;

        // Log detailed error in development
        if (process.env.NODE_ENV === 'development') {
          /* eslint-disable no-console */
          console.error('❌ Request failed:', {
            url: copilotUrl,
            code: axiosError.code,
            message: axiosError.message,
            request: axiosError.request,
          });
          /* eslint-enable no-console */
        }

        throw new Error(errorMessage);
      }
    }

    throw new Error(normalizeCopilotError(error));
  }
};
