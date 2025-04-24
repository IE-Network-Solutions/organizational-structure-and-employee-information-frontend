import { crudRequest } from '@/utils/crudRequest';
import { TENANT_MGMT_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';
import { useMutation, useQueryClient } from 'react-query';
import { handleSuccessMessage } from '@/utils/showSuccessMessage';
import { Subscription } from '@/types/tenant-management';
import {
  BuyAdditionalSlotsRequest,
  PrepaySubscriptionRequest,
  RenewSubscriptionRequest,
  UpgradeSubscriptionRequest,
} from './interface';

const createSubscription = async (data: Partial<Subscription>) => {
  return await crudRequest({
    url: `${TENANT_MGMT_URL}/subscription/manage/subscriptions/create`,
    method: 'POST',
    headers: requestHeader(),
    data,
  });
};

const upgradeSubscription = async (data: UpgradeSubscriptionRequest) => {
  return await crudRequest({
    url: `${TENANT_MGMT_URL}/subscription/manage/subscriptions/upgrade`,
    method: 'POST',
    headers: requestHeader(),
    data,
  });
};

const buyAdditionalSlots = async (data: BuyAdditionalSlotsRequest) => {
  return await crudRequest({
    url: `${TENANT_MGMT_URL}/subscription/manage/subscriptions/slots`,
    method: 'POST',
    headers: requestHeader(),
    data,
  });
};

const renewSubscription = async (data: RenewSubscriptionRequest) => {
  return await crudRequest({
    url: `${TENANT_MGMT_URL}/subscription/manage/subscriptions/renew`,
    method: 'POST',
    headers: requestHeader(),
    data,
  });
};

const prepaySubscription = async (data: PrepaySubscriptionRequest) => {
  return await crudRequest({
    url: `${TENANT_MGMT_URL}/subscription/manage/subscriptions/prepay`,
    method: 'POST',
    headers: requestHeader(),
    data,
  });
};

export const useCreateSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation(createSubscription, {
    onSuccess: () => {
      queryClient.invalidateQueries('subscriptions');
      handleSuccessMessage('PUT');
    },
  });
};

export const useUpgradeSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation(upgradeSubscription, {
    onSuccess: () => {
      queryClient.invalidateQueries('subscriptions');
      handleSuccessMessage('PUT');
    },
  });
};

export const useBuyAdditionalSlots = () => {
  const queryClient = useQueryClient();
  return useMutation(buyAdditionalSlots, {
    onSuccess: () => {
      queryClient.invalidateQueries('subscriptions');
      handleSuccessMessage('PUT');
    },
  });
};

export const useRenewSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation(renewSubscription, {
    onSuccess: () => {
      queryClient.invalidateQueries('subscriptions');
      handleSuccessMessage('PUT');
    },
  });
};

export const usePrepaySubscription = () => {
  const queryClient = useQueryClient();
  return useMutation(prepaySubscription, {
    onSuccess: () => {
      queryClient.invalidateQueries('subscriptions');
      handleSuccessMessage('PUT');
    },
  });
};
