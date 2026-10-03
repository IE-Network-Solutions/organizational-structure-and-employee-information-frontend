import { OKR_AND_PLANNING_URL } from '@/utils/constants';
import { useQuery, UseQueryOptions } from 'react-query';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { getCurrentToken } from '@/utils/getCurrentToken';
import { crudRequest } from '@/utils/crudRequest';
import { OkrReadinessResponse } from './interface';

export * from './interface';

export const getOkrReadiness = async ({
  userId,
  sessionId,
}: {
  userId: string;
  sessionId?: string;
}): Promise<OkrReadinessResponse> => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  const sessionQuery = sessionId
    ? `&sessionId=${encodeURIComponent(sessionId)}`
    : '';

  const response = (await crudRequest({
    url: `${OKR_AND_PLANNING_URL}/okr-readiness?userId=${encodeURIComponent(userId)}${sessionQuery}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  })) as OkrReadinessResponse;

  return response;
};

export const useGetOkrReadiness = (
  params: { userId?: string; sessionId?: string },
  options?: UseQueryOptions<OkrReadinessResponse>,
) => {
  return useQuery<OkrReadinessResponse>(
    ['okrReadiness', params?.userId, params?.sessionId],
    () =>
      getOkrReadiness({
        userId: params.userId as string,
        sessionId: params.sessionId,
      }),
    {
      enabled: Boolean(params?.userId),
      refetchOnWindowFocus: false,
      staleTime: 60_000,
      ...options,
    },
  );
};
