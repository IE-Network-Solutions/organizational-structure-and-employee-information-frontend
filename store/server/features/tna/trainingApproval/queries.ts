import { crudRequest } from '@/utils/crudRequest';
import { TNA_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';
import { useQuery } from 'react-query';

/**
 * Training requests currently sitting with this user as approver. The
 * training-and-learning service proxies to the shared approver service, which
 * is the same contract time-and-attendance uses for leave.
 */
const getTrainingRequestsForApprover = async (
  userId: string,
  page: number,
  limit: number,
) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TNA_URL}/training-request/tna-currentApprover/${userId}?page=${page}&limit=${limit}`,
    method: 'GET',
    headers: requestHeaders,
  });
};

export const useGetTrainingRequestsForApprover = (
  userId: string,
  page: number,
  limit: number,
  isEnabled: boolean = true,
) => {
  return useQuery<any>(
    ['training-request-approvals', userId, page, limit],
    () => getTrainingRequestsForApprover(userId, page, limit),
    { keepPreviousData: true, enabled: isEnabled && !!userId },
  );
};

/**
 * The approver inbox across every status — what is waiting on this user plus
 * what they already decided — so the table can offer a status filter. Same
 * shape as the leave-request all-status feed.
 */
const getTrainingApprovalsAllStatus = async (
  userId: string,
  page: number,
  limit: number,
  requestUserId?: string,
  status?: string,
) => {
  const requestHeaders = await requestHeader();
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (requestUserId) params.set('requestUserId', requestUserId);
  if (status) params.set('status', status);

  return await crudRequest({
    url: `${TNA_URL}/training-request/approval/current-approver/all-status/${userId}?${params.toString()}`,
    method: 'GET',
    headers: requestHeaders,
  });
};

export const useGetTrainingApprovalsAllStatus = (
  userId: string,
  page: number,
  limit: number,
  requestUserId?: string,
  status?: string,
) => {
  return useQuery<any>(
    [
      'training-request-approvals-all-status',
      userId,
      page,
      limit,
      requestUserId ?? '',
      status ?? '',
    ],
    () =>
      getTrainingApprovalsAllStatus(userId, page, limit, requestUserId, status),
    {
      keepPreviousData: true,
      enabled: !!userId,
      // The feed round-trips to the approval service, so it is slow. Several
      // components read it (the list, and the buttons on every row), and this
      // keeps them on one shared result instead of refetching per mount.
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  );
};
