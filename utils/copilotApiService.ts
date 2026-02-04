import axios, { AxiosError } from 'axios';
import { getCurrentToken } from '@/utils/getCurrentToken';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';

// Azure App Service URL for copilot (used by server-side proxy)
// Use dev for local/testing; set NEXT_PUBLIC_AZURE_APP_SERVICE to prod for production
const AZURE_APP_SERVICE_URL =
  process.env.NEXT_PUBLIC_AZURE_APP_SERVICE ||
  'https://selamnew-copilot-dev-dbdcc9ahe7eqgbez.eastus-01.azurewebsites.net';

// In the browser we call our API route to avoid CORS; the server proxies to Azure
const getCopilotUrl = () =>
  typeof window !== 'undefined' ? '/api/copilot' : `${AZURE_APP_SERVICE_URL}/copilot`;

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

/**
 * Sends a chat request to the Azure App Service backend
 * The backend will:
 * 1. Authenticate the user using headers (Authorization, tenantId, userId)
 * 2. Process the query
 * 3. Return the AI response
 * 
 * @param query - The user's query/prompt
 * @param sessionId - Optional session ID for OKR session-specific queries
 */
export const sendCopilotChatRequest = async (
  query: string,
  sessionId?: string
): Promise<string> => {
  // Get fresh token from Firebase (force refresh to ensure it's valid)
  // forceRefresh=true ensures we always get a newly refreshed token
  const token = await getCurrentToken(true);
  
  // Get tenant and user info from store
  const { tenantId, userId } = useAuthenticationStore.getState();
  
  if (!tenantId || !token) {
    throw new Error('Authentication required. Please log in again.');
  }

  // Log token info in development (first 20 chars only for security)
  if (process.env.NODE_ENV === 'development') {
    console.log('🔑 Using refreshed token:', token.substring(0, 20) + '...');
    console.log('📋 Tenant ID:', tenantId);
    console.log('👤 User ID:', userId || 'not provided');
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
  
  // Add sessionId header if provided (for OKR session-specific queries)
  if (sessionId) {
    headers.sessionId = sessionId;
  }

  const copilotUrl = getCopilotUrl();
  // Log the URL being used in development
  if (process.env.NODE_ENV === 'development') {
    console.log('🌐 Copilot API URL:', copilotUrl);
  }

  try {
    const response = await axios.post<CopilotChatResponse>(
      copilotUrl,
      { prompt: query.trim() } as CopilotChatRequest,
      {
        headers,
        timeout: 60000, // 60 seconds timeout (increased for complex queries like daily plans)
      }
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
    // Handle different error types
    if (axios.isAxiosError(error)) {
      type ErrorPayload = { detail?: string; message?: string; answer?: string; error?: string };
      const axiosError = error as AxiosError<ErrorPayload>;

      if (axiosError.response) {
        // Backend returned an error response
        const data = axiosError.response.data;
        const status = axiosError.response.status;
        const message =
          data?.detail ||
          data?.message ||
          axiosError.message;

        if (status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        } else if (status === 400) {
          throw new Error(message || 'Invalid request. Please check your input.');
        } else if (status === 503) {
          const serviceMessage =
            data?.answer ||
            data?.error ||
            message;
          throw new Error(
            serviceMessage || 'Service is temporarily unavailable. Please try again later.'
          );
        } else {
          throw new Error(message || `Server error (${status}). Please try again.`);
        }
      } else if (axiosError.request) {
        // Request was made but no response received
        // This could be: network error, CORS issue, timeout, or server unreachable
        const targetLabel =
          typeof window !== 'undefined' ? 'the copilot service' : AZURE_APP_SERVICE_URL;
        const errorMessage = axiosError.code === 'ECONNABORTED'
          ? `Request timeout. The server took too long to respond (60s). This query may require processing large amounts of data. Please try again or contact support if the issue persists.`
          : axiosError.code === 'ERR_NETWORK'
          ? `Network error. Unable to connect to ${targetLabel}. Please check your internet connection and try again.`
          : `Unable to reach ${targetLabel}. Please check your connection and try again.`;
        
        // Log detailed error in development
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ Request failed:', {
            url: copilotUrl,
            code: axiosError.code,
            message: axiosError.message,
            request: axiosError.request,
          });
        }
        
        throw new Error(errorMessage);
      }
    }
    
    // Something else happened
    throw new Error(
      error instanceof Error ? error.message : 'An unexpected error occurred.'
    );
  }
};

