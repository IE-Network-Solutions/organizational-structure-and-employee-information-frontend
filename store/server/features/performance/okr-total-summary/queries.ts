import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { OKR_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { getCurrentToken } from '@/utils/getCurrentToken';
import { useQuery } from 'react-query';
import type {
  OkrDepartmentsOkrProgressRequest,
  OkrDepartmentsOkrProgressResponse,
  OkrTotalSummaryLeaderboard,
} from './interface';

function okrDepartmentsOkrProgressQueryKey(
  payload: OkrDepartmentsOkrProgressRequest,
) {
  return [
    'okrDepartmentsOkrProgress',
    payload.sessionId,
    payload.orgLevel,
    [...payload.departmentIds].slice().sort().join(','),
  ] as const;
}

const postOkrDepartmentsOkrProgress = async (
  body: OkrDepartmentsOkrProgressRequest,
): Promise<OkrDepartmentsOkrProgressResponse> => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  const res = await crudRequest({
    url: `${OKR_URL}/okr-total-summary/departments/okr-progress`,
    method: 'POST',
    data: body,
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId,
    },
  });
  return res as OkrDepartmentsOkrProgressResponse;
};

const getOkrTotalSummaryLeaderboard = async (
  sessionId: string,
): Promise<OkrTotalSummaryLeaderboard> => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  const params = new URLSearchParams({ sessionId });
  const res = await crudRequest({
    url: `${OKR_URL}/okr-total-summary/leaderboard?${params.toString()}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId,
    },
  });
  return res as OkrTotalSummaryLeaderboard;
};

export const useGetOkrTotalSummaryLeaderboard = (
  sessionId: string | null | undefined,
) => {
  return useQuery<OkrTotalSummaryLeaderboard>(
    ['okrTotalSummaryLeaderboard', sessionId],
    () => getOkrTotalSummaryLeaderboard(sessionId as string),
    {
      enabled: Boolean(sessionId),
    },
  );
};

export const useGetOkrDepartmentsOkrProgress = (
  payload: OkrDepartmentsOkrProgressRequest | null | undefined,
  options?: { enabled?: boolean },
) => {
  const canRun =
    Boolean(
      payload?.sessionId &&
        Array.isArray(payload.departmentIds) &&
        payload.orgLevel != null,
    ) && options?.enabled !== false;

  return useQuery<OkrDepartmentsOkrProgressResponse>(
    payload
      ? okrDepartmentsOkrProgressQueryKey(payload)
      : (['okrDepartmentsOkrProgress', 'disabled'] as const),
    () =>
      postOkrDepartmentsOkrProgress(
        payload as OkrDepartmentsOkrProgressRequest,
      ),
    {
      enabled: Boolean(payload) && canRun,
    },
  );
};

export { getOkrTotalSummaryLeaderboard, postOkrDepartmentsOkrProgress };
