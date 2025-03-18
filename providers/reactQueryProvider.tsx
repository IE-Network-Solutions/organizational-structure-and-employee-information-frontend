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

/**
 * Interface for the props of the ReactQueryWrapper component
 * @property children - The child components to be wrapped by the QueryClientProvider
 */

interface ReactQueryWrapperProps {
  children: ReactNode;
}
/**
 * ReactQueryWrapper component that provides the QueryClient to its children
 *
 * @param children The child components to be wrapped by the QueryClientProvider
 * @returns The QueryClientProvider wrapping the children
 */

const ReactQueryWrapper: React.FC<ReactQueryWrapperProps> = ({ children }) => {
  const router = useRouter();
  const { setLocalId, setTenantId, setToken, setUserId, setError } =
    useAuthenticationStore();

  const handleLogout = () => {
    setToken('');
    setTenantId('');
    setLocalId('');
    removeCookie('token');
    router.push(`/authentication/login`);
    setUserId('');
    setLocalId('');
    setError('');
    removeCookie('token');
    removeCookie('tenantId');
    window.location.reload();
  };

  const queryClient = new QueryClient({
    defaultOptions: {
      mutations: {
        onError(error: any) {
          if (error?.response?.status === 401) {
            sessionStorage.setItem(
              'redirectAfterLogin',
              window.location.pathname,
            );
            handleLogout();
          }
          handleNetworkError(error);
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
      onError(error: any) {
        if (error.response) {
          if (error.response.status === 401) {
            sessionStorage.setItem(
              'redirectAfterLogin',
              window.location.pathname,
            );
            handleLogout();
          }
        }
        if (process.env.NODE_ENV !== 'production') {
          handleNetworkError(error);
        }
      },
    }),
  });

  const FullPageSpinner = () => {
    return (
      <div className="w-full h-full fixed top-0 left-0 bg-white opacity-75 z-50 flex justify-center items-center">
        <Spin size="large" />
      </div>
    );
  };

  const refreshToken = async () => {
    const getCookieFromDocument = (key: string): string | null => {
      const cookies = document.cookie.split('; ');
      const cookie = cookies.find((c) => c.startsWith(`${key}=`));
      return cookie ? cookie.split('=')[1] : null;
    };

    const token = getCookieFromDocument('token');
    if (token) {
      const user = auth.currentUser;
      if (user) {
        try {
          const refreshedToken = await user.getIdToken(true); // Force refresh token
          if (refreshedToken !== token) {
            setCookie('token', refreshedToken, 30);
            useAuthenticationStore.getState().setToken(refreshedToken);
          }
        } catch (error) {
          handleNetworkError(error);
        }
      }
    }
  };
  useEffect(() => {
    refreshToken();
    const refreshInterval = setInterval(
      () => {
        refreshToken();
      },
      50 * 60 * 1000,
    );
    return () => {
      clearInterval(refreshInterval);
    };
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
