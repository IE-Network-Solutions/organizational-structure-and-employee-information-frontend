'use client';
import { QueryCache, QueryClient, QueryClientProvider, useQuery } from 'react-query';
import { ReactNode, Suspense } from 'react';
import { handleNetworkError } from '@/utils/showErrorResponse';
import { handleSuccessMessage } from '@/utils/showSuccessMessage';
import { ReactQueryDevtools } from 'react-query/devtools';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { setCookie } from '@/helpers/storageHelper';
import { Spin } from 'antd';
import { auth } from '@/utils/firebaseConfig';

interface ReactQueryWrapperProps {
  children: ReactNode;
}

let lastRefresh = 0;
const MIN_REFRESH_INTERVAL = 60 * 1000; // 1 minute throttle

const refreshToken = async () => {
  const now = Date.now();
  if (now - lastRefresh < MIN_REFRESH_INTERVAL) return null;
  lastRefresh = now;

  const getCookieFromDocument = (key: string): string | null => {
    const cookies = document.cookie.split('; ');
    const cookie = cookies.find((c) => c.startsWith(`${key}=`));
    return cookie ? cookie.split('=')[1] : null;
  };

  const token = getCookieFromDocument('token');
  if (token && auth.currentUser) {
    try {
      const refreshedToken = await auth.currentUser.getIdToken(true);
      if (refreshedToken !== token) {
        setCookie('token', refreshedToken, 30);
        useAuthenticationStore.getState().setToken(refreshedToken);
      }
      return refreshedToken;
    } catch (error) {
      handleNetworkError(error);
      return null;
    }
  }
  return null;
};

const FullPageSpinner = () => (
  <div className="w-full h-full fixed top-0 left-0 bg-white opacity-75 z-50 flex justify-center items-center">
    <Spin size="large" />
  </div>
);

const ReactQueryWrapper: React.FC<ReactQueryWrapperProps> = ({ children }) => {
  const { tenantId } = useAuthenticationStore();

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: (failureCount, error: any) => {
          if (error?.response?.status === 401) return false;
          return failureCount < 3;
        },
      },
      mutations: {
        onError: async (error: any) => {
          if (error?.response?.status === 401) {
            const newToken = await refreshToken();
            if (newToken) {
              queryClient.invalidateQueries();
            } else if (process.env.NODE_ENV !== 'production') {
              handleNetworkError(error);
            }
          } else if (process.env.NODE_ENV !== 'production') {
            handleNetworkError(error);
          }
        },
        onSuccess: (variables: any, context: any) => {
          const method = context?.method?.toUpperCase() || variables?.method?.toUpperCase();
          const customMessage = context?.customMessage || undefined;
          handleSuccessMessage(method, customMessage);
        },
      },
    },
    queryCache: new QueryCache({
      onError: async (error: any) => {
        if (error?.response?.status === 401) {
          const newToken = await refreshToken();
          if (newToken) {
            queryClient.invalidateQueries();
          } else if (process.env.NODE_ENV !== 'production') {
            handleNetworkError(error);
          }
        } else if (process.env.NODE_ENV !== 'production') {
          handleNetworkError(error);
        }
      },
    }),
  });

  // TokenRefresh handles periodic token renewal
  const TokenRefresh = () => {
    useQuery(['refreshToken', tenantId], refreshToken, {
      refetchInterval: 45 * 60 * 1000, // 45 minutes
      refetchIntervalInBackground: true,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: true,
      enabled: !!auth.currentUser && tenantId.length > 0,
    });

    return null;
  };

  return (
    <Suspense fallback={<FullPageSpinner />}>
      <QueryClientProvider client={queryClient}>
        <TokenRefresh />
        {children}
        <ReactQueryDevtools />
      </QueryClientProvider>
    </Suspense>
  );
};

export default ReactQueryWrapper;
