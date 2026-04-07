'use client';
import { QueryCache, QueryClient, QueryClientProvider } from 'react-query';
import { ReactNode, Suspense } from 'react';
import { handleNetworkError } from '@/utils/showErrorResponse';
import { handleSuccessMessage } from '@/utils/showSuccessMessage';
import { ReactQueryDevtools } from 'react-query/devtools';
import { Spin } from 'antd';
import { getCurrentToken } from '@/utils/getCurrentToken';

interface ReactQueryWrapperProps {
  children: ReactNode;
}

const FullPageSpinner = () => (
  <div
    className="w-full h-full fixed top-0 left-0 bg-white opacity-75 z-50 flex justify-center items-center"
    data-cy="full-page-spinner"
  >
    <Spin size="large" />
  </div>
);

// Helper function to check for tenant ID missing error and redirect to login
const handleTenantIdError = (error: any): boolean => {
  const errorCode = error?.response?.data?.code;

  if (errorCode === 'TENANT_ID_MISSING') {
    window.location.href = '/authentication/login';
    return true;
  }
  return false;
};

// Public survey page uses its own friendly auth/forbidden UI.
const shouldSuppressGlobalErrorToast = (error: any): boolean => {
  if (typeof window === 'undefined') return false;
  const pathname = window.location?.pathname ?? '';
  const isPublicSurveyRoute = /^\/surveys\/[^/]+\/?$/.test(pathname);
  if (!isPublicSurveyRoute) return false;

  const status = error?.response?.status ?? error?.status;
  const msg = String(
    error?.response?.data?.message ??
      error?.response?.data?.error ??
      error?.message ??
      '',
  ).toLowerCase();

  return (
    status === 401 ||
    status === 403 ||
    msg.includes('forbidden') ||
    msg.includes('unauthorized') ||
    msg.includes('login')
  );
};

const ReactQueryWrapper: React.FC<ReactQueryWrapperProps> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        onError: async (error: any) => {
          // Check for tenant ID missing error first
          if (handleTenantIdError(error)) {
            return;
          }
          if (shouldSuppressGlobalErrorToast(error)) {
            return;
          }

          if (error?.response?.status === 401) {
            const newToken = await getCurrentToken();
            if (newToken) {
              queryClient.invalidateQueries();
            } else if (process.env.NODE_ENV !== 'production') {
              handleNetworkError(error);
            }
          } else if (process.env.NODE_ENV !== 'production') {
            handleNetworkError(error);
          }
        },
      },
      mutations: {
        onError: async (error: any) => {
          // Check for tenant ID missing error first
          if (handleTenantIdError(error)) {
            return;
          }
          if (shouldSuppressGlobalErrorToast(error)) {
            return;
          }

          if (error?.response?.status === 401) {
            const newToken = await getCurrentToken();
            if (newToken) {
              queryClient.invalidateQueries();
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
      onError: async (error: any) => {
        // Check for tenant ID missing error first
        if (handleTenantIdError(error)) {
          return;
        }
        if (shouldSuppressGlobalErrorToast(error)) {
          return;
        }

        if (error?.response?.status === 401) {
          const newToken = await getCurrentToken();
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
