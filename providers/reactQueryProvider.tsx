'use client';

import { QueryCache, QueryClient, QueryClientProvider } from 'react-query';
import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { handleNetworkError } from '@/utils/showErrorResponse';
import { handleSuccessMessage } from '@/utils/showSuccessMessage';

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

  const queryClient = new QueryClient({
    defaultOptions: {
      mutations: {
        onError(error: any) {
          if (error?.response?.status === 401) {
            router.replace('/authentication/login');
          }
          handleNetworkError(error);
        },
        onSuccess: (data: any, variables: any, context: any) => {
          console.log(variables, context);
          const method =
            context?.method?.toUpperCase() || variables?.method?.toUpperCase();
          const customMessage = context?.customMessage || undefined;

          handleSuccessMessage(method, customMessage);
        },
      },
    },
    queryCache: new QueryCache({
      onError(error: any) {
        if (error?.response?.status === 401) {
          router.replace('/authentication/login');
        }
        handleNetworkError(error);
      },
    }),
  });
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

export default ReactQueryWrapper;
