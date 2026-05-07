import { crudRequest } from '@/utils/crudRequest';
import { TENANT_MGMT_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { handleSuccessMessage } from '@/utils/showSuccessMessage';
import { Subscription } from '@/types/tenant-management';
import {
  BuyAdditionalSlotsRequest,
  PrepaySubscriptionRequest,
  RenewSubscriptionRequest,
  UpgradeSubscriptionRequest,
} from './interface';
import { ApiResponse } from '@/types/commons/responseTypes';

const createSubscription = async (data: Partial<Subscription>) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TENANT_MGMT_URL}/subscription/manage/subscriptions/create`,
    method: 'POST',
    headers: requestHeaders,
    data,
  });
};

const upgradeSubscription = async (data: UpgradeSubscriptionRequest) => {
  const requestHeaders = await requestHeader();

  return await crudRequest({
    url: `${TENANT_MGMT_URL}/subscription/manage/subscriptions/upgrade`,
    method: 'POST',
    headers: requestHeaders,
    data,
  });
};

const buyAdditionalSlots = async (data: BuyAdditionalSlotsRequest) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TENANT_MGMT_URL}/subscription/manage/subscriptions/slots`,
    method: 'POST',
    headers: requestHeaders,
    data,
  });
};

const renewSubscription = async (data: RenewSubscriptionRequest) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TENANT_MGMT_URL}/subscription/manage/subscriptions/renew`,
    method: 'POST',
    headers: requestHeaders,
    data,
  });
};

const prepaySubscription = async (data: PrepaySubscriptionRequest) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TENANT_MGMT_URL}/subscription/manage/subscriptions/prepay`,
    method: 'POST',
    headers: requestHeaders,
    data,
  });
};

export const useCreateSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation(createSubscription, {
    onSuccess: () => {
      queryClient.invalidateQueries('subscriptions');
      queryClient.invalidateQueries('invoices');
      handleSuccessMessage('PUT');
    },
  });
};

export const useUpgradeSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation(upgradeSubscription, {
    onSuccess: () => {
      queryClient.invalidateQueries('subscriptions');
      queryClient.invalidateQueries('invoices');
      handleSuccessMessage('PUT');
    },
  });
};

export const useBuyAdditionalSlots = () => {
  const queryClient = useQueryClient();
  return useMutation(buyAdditionalSlots, {
    onSuccess: () => {
      queryClient.invalidateQueries('subscriptions');
      queryClient.invalidateQueries('invoices');
      handleSuccessMessage('PUT');
    },
  });
};

export const useRenewSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation(renewSubscription, {
    onSuccess: () => {
      queryClient.invalidateQueries('subscriptions');
      queryClient.invalidateQueries('invoices');
      handleSuccessMessage('PUT');
    },
  });
};

export const usePrepaySubscription = () => {
  const queryClient = useQueryClient();
  return useMutation(prepaySubscription, {
    onSuccess: () => {
      queryClient.invalidateQueries('subscriptions');
      queryClient.invalidateQueries('invoices');
      handleSuccessMessage('PUT');
    },
  });
};

const getAllPlans = async (currencyId?: string) => {
  const requestHeaders = await requestHeader();
  const url = currencyId
    ? `${TENANT_MGMT_URL}/subscription/rest/modules/all?currencyId=${currencyId}`
    : `${TENANT_MGMT_URL}/subscription/rest/modules/all`;
  return await crudRequest({
    url,
    method: 'GET',
    headers: requestHeaders,
  });
};

export const useGetAllPlans = (currencyId?: string) => {
  return useQuery<ApiResponse<any>>(['plans', currencyId], () =>
    getAllPlans(currencyId),
  );
};
