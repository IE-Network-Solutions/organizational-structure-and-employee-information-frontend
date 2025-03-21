'use client';
import { QueryCache, QueryClient, QueryClientProvider } from 'react-query';
import { ReactNode, Suspense, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { handleNetworkError } from '@/utils/showErrorResponse';
import { handleSuccessMessage } from '@/utils/showSuccessMessage';
import { ReactQueryDevtools } from 'react-query/devtools';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { removeCookie, setCookie } from '@/helpers/storageHelper';
import { Spin } from 'antd';
import { auth } from '@/utils/firebaseConfig';

interface ReactQueryWrapperProps {
  children: ReactNode;
}

const ReactQueryWrapper: React.FC<ReactQueryWrapperProps> = ({ children }) => {
  const router = useRouter();
  const { setLocalId, setTenantId, setToken, setUserId, setError } =
    useAuthenticationStore();

  const refreshToken = async () => {
    const getCookieFromDocument = (key: string): string | null => {
      const cookies = document.cookie.split('; ');
      const cookie = cookies.find((c) => c.startsWith(`${key}=`));
      return cookie ? cookie.split('=')[1] : null;
    };

    const token = getCookieFromDocument('token');
    if (token && auth.currentUser) {
      try {
        const refreshedToken = await auth.currentUser.getIdToken(true); // Force refresh
        if (refreshedToken !== token) {
          setCookie('token', refreshedToken, 30);
          useAuthenticationStore.getState().setToken(refreshedToken);
        }
        return refreshedToken;
      } catch (error) {
        handleNetworkError(error); // Show error but don't logout
        return null; // Return null to indicate failure without logging out
      }
    }
    return null; // No valid token or user, but no logout
  };

  const queryClient = new QueryClient({
    defaultOptions: {
      mutations: {
        onError: async (error: any) => {
          if (error?.response?.status === 401) {
            const newToken = await refreshToken();
            if (newToken) {
              queryClient.invalidateQueries(); // Retry with new token
            } else {
              handleNetworkError(error);
            }
          } else {
            handleNetworkError(error); 
          }
        },
        onSuccess: (variables: any, context: any) => {
          const method =
            context?.method?.toUpperCase() || variables?.method?.toUpperCase();
          const customMessage = context?.customMessage || undefined;
          handleSuccessMessage(method, customMessage);
        },
      },
    },
    queryCache: new QueryCache({
      onError: async (error: any, query) => {
        if (error?.response?.status === 401) {
          const newToken = await refreshToken();
          if (newToken) {
          } else {
            handleNetworkError(error); 
          }
        } else if (process.env.NODE_ENV !== 'production') {
          handleNetworkError(error); 
        }
      },
    }),
  });

  const FullPageSpinner = () => (
    <div className="w-full h-full fixed top-0 left-0 bg-white opacity-75 z-50 flex justify-center items-center">
      <Spin size="large" />
    </div>
  );

  useEffect(() => {
    refreshToken(); // Initial token refresh on mount
    const refreshInterval = setInterval(() => {
      refreshToken();
    }, 50 * 60 * 1000); // Refresh every 50 minutes

    return () => clearInterval(refreshInterval);
  }, []);

  return (
    <Suspense fallback={<FullPageSpinner />}>
      <QueryClientProvider client={queryClient}>
        {children}
        <ReactQueryDevtools />
      </QueryClientProvider>
    </Suspense>
  );
};

export default ReactQueryWrapper;