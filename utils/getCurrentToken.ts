import { auth } from '@/utils/firebaseConfig';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';

/** Token from Zustand store or auth cookie (client-only). */
export const getStoredAuthToken = (): string | null => {
  const storeToken = useAuthenticationStore.getState().token;
  if (storeToken) return storeToken;

  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|;\s*)token=([^;]*)/);
  if (!match?.[1]) return null;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
};

/**
 * Returns a token when available; does not throw (for public API routes).
 */
export const getOptionalToken = async (): Promise<string | null> => {
  try {
    if (auth.currentUser) {
      const currentToken = await auth.currentUser.getIdToken(false);
      useAuthenticationStore.getState().setToken(currentToken);
      return currentToken;
    }
  } catch {
    // Fall through to stored token.
  }
  return getStoredAuthToken();
};

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
