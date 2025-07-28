import { crudRequest } from '@/utils/crudRequest';
import { TENANT_MGMT_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';
import { useQuery } from 'react-query';
import { ApiResponse } from '@/types/commons/responseTypes';
import {
  CalculateSubscriptionPriceDto,
  CalculateSubscriptionPriceResponse,
  GetSubscriptionByTenantRequest,
} from './interface';
import { Subscription } from '@/types/tenant-management';
import { notification } from 'antd';

const getSubscriptionByTenant = async (
  data: GetSubscriptionByTenantRequest,
) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TENANT_MGMT_URL}/subscription/manage/subscriptions/get`,
    method: 'POST',
    headers: requestHeaders,
    data,
  });
};

export const useGetSubscriptionByTenant = (
  tenantId: string,
  isEnabled: boolean = true,
) => {
  return useQuery<ApiResponse<Subscription>>(
    ['subscription-by-tenant', tenantId],
    () => getSubscriptionByTenant({ tenantId }),
    {
      enabled: isEnabled && tenantId !== undefined,
    },
  );
};

// Add a function for calculating the subscription price
const calculateSubscriptionPrice = async (
  data: CalculateSubscriptionPriceDto,
) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TENANT_MGMT_URL}/subscription/rest/slot-transactions/calculation`,
    method: 'POST',
    headers: requestHeaders,
    data,
  });
};

export const useCalculateSubscriptionPrice = (
  data: CalculateSubscriptionPriceDto | null,
  isEnabled: boolean = false,
) => {
  return useQuery<ApiResponse<CalculateSubscriptionPriceResponse>>(
    [
      'calculate-subscription-price',
      data?.planId,
      data?.planPeriodId,
      data?.slotTotal,
      data?.subscriptionId,
    ],
    async () => {
      try {
        const response = await calculateSubscriptionPrice(
          data as CalculateSubscriptionPriceDto,
        );
        // Check the structure of the response. If the data came in the correct format even without .item,
        // convert them to the standard ApiResponse format
        if (
          response &&
          typeof response.periodInMonths === 'number' &&
          typeof response.totalAmount === 'number'
        ) {
          return {
            statusCode: 200,
            message: 'Success',
            error: '',
            item: response,
            items: [],
            meta: {
              totalItems: 1,
              itemCount: 1,
              itemsPerPage: 1,
              totalPages: 1,
              currentPage: 1,
            },
          } as ApiResponse<CalculateSubscriptionPriceResponse>;
        }

        return response;
      } catch (error) {
        notification.error({
          message: 'Calculation failed',
          description:
            error instanceof Error ? error.message : 'Please try again',
        });
        throw error;
      }
    },
    {
      enabled:
        isEnabled &&
        !!data?.planId &&
        !!data?.planPeriodId &&
        !!data?.slotTotal,
      cacheTime: 5 * 60 * 1000, // 5 minutes
      staleTime: 1 * 60 * 1000, // 1 minute
      retry: 1,
    },
  );
};
