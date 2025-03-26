import { PaymentRequestBody } from './interface';
import { Payment } from '@/types/tenant-management';
import { crudRequest } from '@/utils/crudRequest';
import { TENANT_MGMT_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';
import { useQuery } from 'react-query';
import { ApiResponse } from '@/types/commons/responseTypes';

const getPayments = async (data: Partial<PaymentRequestBody>) => {
  return await crudRequest({
    url: `${TENANT_MGMT_URL}/subscription/rest/payments`,
    method: 'POST',
    headers: requestHeader(),
    data,
  });
};

export const useGetPayments = (
  data: Partial<PaymentRequestBody> = {},
  isKeepData: boolean = true,
  isEnabled: boolean = true,
) => {
  return useQuery<ApiResponse<Payment>>(
    Object.keys(data).length ? ['payments', data] : 'payments',
    () => getPayments(data),
    {
      keepPreviousData: isKeepData,
      enabled: isEnabled,
    },
  );
};
