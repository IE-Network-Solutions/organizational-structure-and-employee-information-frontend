import { useEffect } from 'react';
import { useChatBotStore } from '@/store/uistate/features/chatbot/chatbot';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';

/**
 * Hook to automatically clear chatbot context when user logs out
 */
export const useChatBotContextCleanup = () => {
  const { clearContext } = useChatBotStore();
  const { token } = useAuthenticationStore();

  useEffect(() => {
    // Clear context when user is not authenticated (logged out)
    if (!token) {
      clearContext();
    }
  }, [token, clearContext]);

  // Also clear context when component unmounts (user navigates away)
  useEffect(() => {
    return () => {
      // Optional: Clear context on unmount
      // clearContext();
    };
  }, [clearContext]);
};
