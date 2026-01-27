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

const ReactQueryWrapper: React.FC<ReactQueryWrapperProps> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        onError: async (error: any) => {
          // Check for tenant ID missing error first
          if (handleTenantIdError(error)) {
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
