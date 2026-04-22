import { SubscriptionRequestBody } from './interface';
import { Subscription } from '@/types/tenant-management';
import { crudRequest } from '@/utils/crudRequest';
import { MANAGE_SUBSCRIPTION_API_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';
import { useQuery } from 'react-query';
import { ApiResponse } from '@/types/commons/responseTypes';

const getSubscriptions = async (data: Partial<SubscriptionRequestBody>) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${MANAGE_SUBSCRIPTION_API_URL}/subscription/rest/subscriptions`,
    method: 'POST',
    headers: requestHeaders,
    data,
  });
};

export const useGetSubscriptions = (
  data: Partial<SubscriptionRequestBody> = {},
  isKeepData: boolean = true,
  isEnabled: boolean = true,
) => {
  return useQuery<ApiResponse<Subscription>>(
    Object.keys(data).length ? ['subscriptions', data] : 'subscriptions',
    () => getSubscriptions(data),
    {
      keepPreviousData: isKeepData,
      enabled: isEnabled,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  );
};
