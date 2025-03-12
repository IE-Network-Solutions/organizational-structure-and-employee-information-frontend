import { requestHeader } from '@/helpers/requestHeader';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { PAYROLL_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useQuery, UseQueryOptions } from 'react-query';

interface SettlementTrackingParams {
  page?: number;
  limit?: number;
  employeeId?: string;
  startDate?: string;
  endDate?: string;
  compensationTypeId?: string;
}

interface SettlementTrackingResponse {
  data: Array<{
    id: string;
    employeeId: string;
    employeeName: string;
    payPeriod: string;
    totalAmount: number;
    totalPaid: number;
    compensation: string[];
    status: 'PAID' | 'PENDING' | 'PARTIALLY_PAID';
    createdAt: string;
    updatedAt: string;
  }>;
  total: number;
  page: number;
  limit: number;
}

interface SettlementTrackingDetail
  extends Omit<SettlementTrackingResponse['data'][0], 'compensation'> {
  compensation: {
    type: string;
    amount: number;
    status: 'PAID' | 'PENDING';
    history: Array<{
      date: string;
      amount: number;
      status: 'PAID' | 'PENDING';
    }>;
  }[];
  employee: {
    id: string;
    name: string;
    email: string;
    phone: string;
    position: string;
    department: string;
    office: string;
    employmentType: string;
    avatar?: string;
  };
}

const getAllSettlementTracking = async (
  searchParams: SettlementTrackingParams,
) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;

 /* eslint-disable */
  const filteredParams = Object.fromEntries(
    Object.entries(searchParams).filter(
      ([notused, value]) => value !== undefined,
    ),
  );
          /* eslint-enable */

  const searchParamsString = new URLSearchParams(filteredParams).toString();

  return await crudRequest({
    url: `${PAYROLL_URL}/settlement-tracking/all-settlement-tracking?${searchParamsString}`,
    method: 'GET',
    headers: {
      ...requestHeader,
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};

export const useGetSettlementTracking = (
  searchParams: SettlementTrackingParams,
) => {
  return useQuery<any>('settlement-tracking', () =>
    getAllSettlementTracking(searchParams),
  );
};

export const useGetSettlementTrackingById = (
  id: string,
  options?: UseQueryOptions<SettlementTrackingDetail>,
) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;

  return useQuery<SettlementTrackingDetail>(
    ['settlement-tracking', id],
    async () => {
      const response = await fetch(`${PAYROLL_URL}/settlement-tracking/${id}`, {
        headers: {
          ...requestHeader,
          Authorization: `Bearer ${token}`,
          tenantId: tenantId,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || 'Failed to fetch settlement tracking details',
        );
      }

      return response.json();
    },
    {
      staleTime: 30000, // Consider data fresh for 30 seconds
      ...options,
    },
  );
};

// Helper function to check if settlement tracking exists
export const useCheckSettlementTrackingExists = (
  employeeId: string,
  payPeriod: string,
) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;

  return useQuery(
    ['settlement-tracking-exists', employeeId, payPeriod],
    async () => {
      const response = await fetch(
        `${PAYROLL_URL}/settlement-tracking/check-exists?employeeId=${employeeId}&payPeriod=${payPeriod}`,
        {
          headers: {
            ...requestHeader,
            Authorization: `Bearer ${token}`,
            tenantId: tenantId,
          },
        },
      );

      if (!response.ok) {
        throw new Error('Failed to check settlement tracking existence');
      }

      return response.json();
    },
    {
      enabled: !!employeeId && !!payPeriod, // Only run query if both params are provided
      staleTime: 0, // Always fetch fresh data for this query
    },
  );
};
