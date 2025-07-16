import { auth } from '@/utils/firebaseConfig';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';

/**
 * Helper function to get the current Firebase token and update the authentication store
 * This ensures you always have the most up-to-date token from Firebase
 * @returns Promise<string> - The current Firebase token
 */
export const getCurrentToken = async (): Promise<string> => {
  try {
    if (auth.currentUser) {
      const tokenResult = await auth.currentUser.getIdTokenResult();
      const currentToken = tokenResult.token;
      
      // Update the store with the fresh token
      useAuthenticationStore.getState().setToken(currentToken);
      
      return currentToken;
    }
    // Fallback to store token if no Firebase user
    return useAuthenticationStore.getState().tok;
  } catch (error) {
    // Fallback to store token on error
    return useAuthenticationStore.getState().tok;
  }
};

