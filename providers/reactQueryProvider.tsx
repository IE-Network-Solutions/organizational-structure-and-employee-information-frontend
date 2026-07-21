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
    // Core owns login at the origin root; standalone / redesign uses in-app login.
    const isCore =
      (process.env.NEXT_PUBLIC_IS_CORE ?? '').trim().toLowerCase() === 'true';
    window.location.href = isCore ? '/login' : '/authentication/login';
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

/**
 * Planning header queries (`find-all-plans`, `parent-hierarchy`) — backend may return 400 while UI still works.
 * QueryCache passes `query`; merged default `queries.onError` may only receive `error`, so also match URL.
 */
const shouldSuppressPlanningHeaderFetchError = (
  error: any,
  query?: { queryKey?: unknown },
) => {
  const key = query?.queryKey;
  if (Array.isArray(key)) {
    const k0 = key[0];
    if (k0 === 'okrUserPlans' || k0 === 'planningPeriodsHierarchy') {
      return true;
    }
  }
  const url = String(error?.config?.url ?? error?.response?.config?.url ?? '');
  return (
    url.includes('/plan/find-all-plans/') ||
    url.includes('/planning-periods/parent-hierarchy/')
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
          if (shouldSuppressPlanningHeaderFetchError(error)) {
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
      onError: async (error: any, query: any) => {
        // Check for tenant ID missing error first
        if (handleTenantIdError(error)) {
          return;
        }
        if (shouldSuppressPlanningHeaderFetchError(error, query)) {
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
