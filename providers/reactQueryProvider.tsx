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
    data-cy="full-page-spinner-container"
  >
    <Spin size="large" data-cy="full-page-spinner" />
  </div>
);

const ReactQueryWrapper: React.FC<ReactQueryWrapperProps> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        onError: async (error: any) => {
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
    <Suspense fallback={<FullPageSpinner />} data-cy="react-query-suspense">
      <QueryClientProvider client={queryClient} data-cy="react-query-provider">
        {children}
        <ReactQueryDevtools data-cy="react-query-devtools" />
      </QueryClientProvider>
    </Suspense>
  );
};

export default ReactQueryWrapper;
