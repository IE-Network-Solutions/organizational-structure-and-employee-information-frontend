import { getCurrentToken } from '@/utils/getCurrentToken';
import { PAYROLL_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useQuery } from 'react-query';

export interface ReconciliationDetailParams {
  previousPayPeriodId?: string;
  currentPayPeriodId?: string;
  componentType?: string;
  pageSize?: number;
  currentPage?: number;
  search?: string;
}

export interface ReconciliationDetailResponse<T = any> {
  data: T[];
  total: number;
  pageSize: number;
  currentPage: number;
}

interface ReconciliationParams {
  previousPayPeriodId?: string;
  currentPayPeriodId?: string;
}

export interface ReconciliationSummary {
  totalPayrollCost: number;
  previousPayrollCost: number;
  netVariance: number;
  netVariancePercentage: string;
  headcount: number;
  previousHeadcount: number;
  terminations: number;
}

export interface ReconciliationComponent {
  label: string;
  previous: number | string;
  current: number | string;
  variance: number | string;
  variancePercentage: string;
  impact: string;
  type: string;
}

const getReconciliation = async ({
  previousPayPeriodId,
  currentPayPeriodId,
}: ReconciliationParams) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  return crudRequest({
    url: `${PAYROLL_URL}/payroll/reconciliation?previousPayPeriodId=${previousPayPeriodId}&currentPayPeriodId=${currentPayPeriodId}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId,
    },
  });
};

export const useGetReconciliation = ({
  previousPayPeriodId,
  currentPayPeriodId,
}: ReconciliationParams) => {
  return useQuery({
    queryKey: ['reconciliation', previousPayPeriodId, currentPayPeriodId],
    queryFn: () =>
      getReconciliation({ previousPayPeriodId, currentPayPeriodId }),
    enabled: Boolean(previousPayPeriodId && currentPayPeriodId),
    staleTime: 30_000,
  });
};

const getReconciliationDetails = async ({
  previousPayPeriodId,
  currentPayPeriodId,
  componentType,
  pageSize,
  currentPage,
  search,
}: ReconciliationDetailParams) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  const searchParam = search ? `&search=${encodeURIComponent(search)}` : '';
  const componentTypeParam = componentType
    ? `&componentType=${encodeURIComponent(componentType)}`
    : '';
  return crudRequest({
    url: `${PAYROLL_URL}/payroll/reconciliation?previousPayPeriodId=${previousPayPeriodId}&currentPayPeriodId=${currentPayPeriodId}${componentTypeParam}&page=${currentPage}&limit=${pageSize}${searchParam}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId,
    },
  });
};

export const useGetReconciliationDetails = ({
  previousPayPeriodId,
  currentPayPeriodId,
  componentType,
  pageSize,
  currentPage,
  search,
}: ReconciliationDetailParams) =>
  useQuery({
    queryKey: [
      'reconciliation-details',
      previousPayPeriodId,
      currentPayPeriodId,
      componentType,
      pageSize,
      currentPage,
      search,
    ],
    queryFn: () =>
      getReconciliationDetails({
        previousPayPeriodId,
        currentPayPeriodId,
        componentType,
        pageSize,
        currentPage,
        search,
      }),
    enabled: Boolean(
      previousPayPeriodId &&
        currentPayPeriodId &&
        componentType &&
        pageSize &&
        currentPage,
    ),
    keepPreviousData: true,
    staleTime: 30_000,
  });
