import axios, { AxiosError } from 'axios';
import { getCurrentToken } from '@/utils/getCurrentToken';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';

// Azure App Service URL for copilot
const AZURE_APP_SERVICE_URL =
  process.env.NEXT_PUBLIC_AZURE_APP_SERVICE ||
  'https://selamnew-copilot-dev-dbdcc9ahe7eqgbez.eastus-01.azurewebsites.net';

interface CopilotChatRequest {
  query: string;
}

interface CopilotChatResponse {
  answer: string;
  authenticated: boolean;
  tenant_id: string;
  user_id: string | null;
}

/**
 * Sends a chat request to the Azure App Service backend
 * The backend will:
 * 1. Authenticate the user using headers (Authorization, tenantId, userId)
 * 2. Process the query
 * 3. Return the AI response
 */
export const sendCopilotChatRequest = async (
  query: string
): Promise<string> => {
  // Get fresh token from Firebase
  const token = await getCurrentToken();
  
  // Get tenant and user info from store
  const { tenantId, userId } = useAuthenticationStore.getState();
  
  if (!tenantId || !token) {
    throw new Error('Authentication required. Please log in again.');
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

  try {
    const response = await axios.post<CopilotChatResponse>(
      `${AZURE_APP_SERVICE_URL}/api/copilot/chat`,
      { query: query.trim() } as CopilotChatRequest,
      {
        headers,
        timeout: 30000, // 30 seconds timeout
      }
    );

    return response.data.answer || 'No response received';
  } catch (error) {
    // Handle different error types
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ detail?: string }>;
      
      if (axiosError.response) {
        // Backend returned an error response
        const status = axiosError.response.status;
        const message =
          axiosError.response.data?.detail ||
          axiosError.response.data?.message ||
          axiosError.message;
        
        if (status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        } else if (status === 400) {
          throw new Error(message || 'Invalid request. Please check your input.');
        } else if (status === 503) {
          throw new Error('Service is temporarily unavailable. Please try again later.');
        } else {
          throw new Error(message || `Server error (${status}). Please try again.`);
        }
      } else if (axiosError.request) {
        // Request was made but no response received
        throw new Error('Unable to reach the server. Please check your connection.');
      }
    }
    
    // Something else happened
    throw new Error(
      error instanceof Error ? error.message : 'An unexpected error occurred.'
    );
  }
};

