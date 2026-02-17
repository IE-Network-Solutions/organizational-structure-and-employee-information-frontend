import { auth } from '@/utils/firebaseConfig';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';

/**
 * Helper function to get the current Firebase token and update the authentication store
 * This ensures you always have the most up-to-date token from Firebase
 * @param forceRefresh - If true, forces a token refresh (default: false)
 * @returns Promise<string> - The current Firebase token
 */
export const getCurrentToken = async (
  forceRefresh: boolean = false,
): Promise<string> => {
  try {
    if (auth.currentUser) {
      // Use getIdToken with forceRefresh to get a fresh token
      // forceRefresh=true forces Firebase to get a new token even if current one is valid
      const currentToken = await auth.currentUser.getIdToken(forceRefresh);

      // Update the store with the fresh token
      useAuthenticationStore.getState().setToken(currentToken);

      if (forceRefresh && process.env.NODE_ENV === 'development') {
        /* eslint-disable no-console */
        console.log('🔄 Token refreshed (forceRefresh=true)');
        /* eslint-enable no-console */
      }

      return currentToken;
    }
    // Fallback to store token if no Firebase user
    const fallbackToken = useAuthenticationStore.getState().token;
    if (!fallbackToken) {
      throw new Error('No Firebase user and no token in store');
    }
    return fallbackToken;
  } catch (error) {
    /* eslint-disable no-console */
    console.error('Error getting token:', error);
    /* eslint-enable no-console */
    // Fallback to store token on error
    const fallbackToken = useAuthenticationStore.getState().token;
    if (!fallbackToken) {
      throw new Error('Failed to get token and no fallback available');
    }
    return fallbackToken;
  }
};
