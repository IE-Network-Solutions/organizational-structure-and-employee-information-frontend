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
  <div className="w-full h-full fixed top-0 left-0 bg-white opacity-75 z-50 flex justify-center items-center">
    <Spin size="large" />
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
            } else if (process.env.NODE_ENV !== 'production') {
              handleNetworkError(error);
            }
          } else if (process.env.NODE_ENV !== 'production') {
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
    <Suspense fallback={<FullPageSpinner />}>
      <QueryClientProvider client={queryClient}>
        {children}
        <ReactQueryDevtools />
      </QueryClientProvider>
    </Suspense>
  );
};

export default ReactQueryWrapper;
