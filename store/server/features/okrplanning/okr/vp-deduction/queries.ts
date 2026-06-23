import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { OKR_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { getCurrentToken } from '@/utils/getCurrentToken';
import { useQuery } from 'react-query';

export type VpDeductionDetailItem = {
  id: string;
  userId: string;
  userViolationId: string;
  deductedAmount: number;
  monthId: string;
  monthName?: string;
  sessionId: string;
  attendanceRuleName?: string;
  createdAt: string;
};

export type VpDeductionDetailsResponse = {
  items: VpDeductionDetailItem[];
  meta?: {
    totalItems?: number;
    itemCount?: number;
    itemsPerPage?: number;
    totalPages?: number;
    currentPage?: number;
  };
};

const getVpDeductionDetails = async (params: {
  userId: string;
  monthId?: string;
  sessionId?: string;
  page?: number;
  limit?: number;
}) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  const searchParams = new URLSearchParams({
    userId: params.userId,
    page: String(params.page ?? 1),
    limit: String(params.limit ?? 100),
  });
  if (params.monthId) {
    searchParams.set('monthId', params.monthId);
  }
  if (params.sessionId) {
    searchParams.set('sessionId', params.sessionId);
  }

  return crudRequest({
    url: `${OKR_URL}/vp-deduction/details?${searchParams.toString()}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId,
    },
  }) as Promise<VpDeductionDetailsResponse>;
};

const getVpDeductionTotal = async (params: {
  userId: string;
  monthId: string;
  sessionId: string;
}) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  const searchParams = new URLSearchParams({
    userId: params.userId,
    monthId: params.monthId,
    sessionId: params.sessionId,
  });

  return crudRequest({
    url: `${OKR_URL}/vp-deduction/total?${searchParams.toString()}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId,
    },
  }) as Promise<{ totalVpDeductions: number }>;
};

type UseVpDeductionDetailsOptions = {
  userId: string;
  monthId?: string;
  sessionId?: string;
  enabled?: boolean;
};

export const useGetVpDeductionDetails = ({
  userId,
  monthId,
  sessionId,
  enabled = true,
}: UseVpDeductionDetailsOptions) =>
  useQuery<VpDeductionDetailsResponse>(
    ['vp-deduction-details', userId, monthId, sessionId],
    () => getVpDeductionDetails({ userId, monthId, sessionId }),
    {
      enabled: enabled && Boolean(userId),
      keepPreviousData: true,
    },
  );

type UseVpDeductionTotalOptions = {
  userId: string;
  monthId?: string;
  sessionId?: string;
  enabled?: boolean;
};

export const useGetVpDeductionTotal = ({
  userId,
  monthId,
  sessionId,
  enabled = true,
}: UseVpDeductionTotalOptions) =>
  useQuery<{ totalVpDeductions: number }>(
    ['vp-deduction-total', userId, monthId, sessionId],
    () =>
      getVpDeductionTotal({
        userId,
        monthId: monthId!,
        sessionId: sessionId!,
      }),
    {
      enabled: enabled && Boolean(userId && monthId && sessionId),
      keepPreviousData: true,
    },
  );
