import { crudRequest } from '@/utils/crudRequest';
import { TENANT_MGMT_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';
import { useQuery } from 'react-query';
import { ApiResponse } from '@/types/commons/responseTypes';
import { GetSubscriptionByTenantRequest } from './interface';
import { Subscription } from '@/types/tenant-management';

const getSubscriptionByTenant = async (
  data: GetSubscriptionByTenantRequest,
) => {
  return await crudRequest({
    url: `${TENANT_MGMT_URL}/subscription/manage/subscriptions/get`,
    method: 'POST',
    headers: requestHeader(),
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
