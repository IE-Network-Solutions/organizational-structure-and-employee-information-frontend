import NotificationMessage from '@/components/common/notification/notificationMessage';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { OKR_AND_PLANNING_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { getCurrentToken } from '@/utils/getCurrentToken';
import { useMutation, useQueryClient } from 'react-query';
import { FinalizeOkrPayload } from './interface';

export const finalizeOkr = async (
  payload: FinalizeOkrPayload,
): Promise<any> => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  try {
    const response = await crudRequest({
      url: `${OKR_AND_PLANNING_URL}/okr-readiness/finalize`,
      method: 'POST',
      data: payload,
      headers: {
        Authorization: `Bearer ${token}`,
        tenantId: tenantId,
      },
    });

    NotificationMessage.success({
      message: 'OKR Finalized',
      description: 'OKRs have been successfully finalized.',
    });

    return response;
  } catch (error: any) {
    NotificationMessage.error({
      message: 'Cannot Finalize OKRs',
      description:
        error?.response?.data?.message ||
        error?.message ||
        'Failed to finalize OKRs.',
    });
    throw error;
  }
};

export const useFinalizeOkr = () => {
  const queryClient = useQueryClient();
  return useMutation(finalizeOkr, {
    onSuccess: () => {
      queryClient.invalidateQueries('okrReadiness');
      queryClient.invalidateQueries('okrSetting');
      queryClient.invalidateQueries('objectives');
      queryClient.invalidateQueries('fetchObjective');
      queryClient.invalidateQueries('allObjectives');
    },
  });
};
