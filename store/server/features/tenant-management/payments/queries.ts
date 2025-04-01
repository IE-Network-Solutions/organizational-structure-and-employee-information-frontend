import { PaymentRequestBody } from './interface';
import { Payment } from '@/types/tenant-management';
import { crudRequest } from '@/utils/crudRequest';
import { TENANT_MGMT_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';
import { useQuery, useMutation } from 'react-query';
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

// Interface for the payment initiation request
interface InitiatePaymentRequest {
  paymentMethod: string;
  paymentProvider: string;
  returnUrl: string;
}

// Interface for the payment initiation response
interface InitiatePaymentResponse {
  payment: Record<string, any>;
  redirectUrl: string;
}

// Function to initiate a payment for an invoice
const initiatePayment = async (invoiceId: string, data: InitiatePaymentRequest) => {
  return await crudRequest({
    url: `${TENANT_MGMT_URL}/subscription/manage/payments/initiate/${invoiceId}`,
    method: 'POST',
    headers: requestHeader(),
    data,
  });
};

// Hook for initiating payment
export const useInitiatePayment = () => {
  return useMutation<ApiResponse<InitiatePaymentResponse>, Error, { invoiceId: string; data: InitiatePaymentRequest }>(
    ({ invoiceId, data }) => initiatePayment(invoiceId, data)
  );
};
