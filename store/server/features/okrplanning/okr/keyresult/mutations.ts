import NotificationMessage from '@/components/common/notification/notificationMessage';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { KeyResult } from '@/store/uistate/features/okrplanning/okr/interface';
import { OKR_AND_PLANNING_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useMutation, useQueryClient } from 'react-query';
import { getCurrentToken } from '@/utils/getCurrentToken';

const tenantId = useAuthenticationStore.getState().tenantId;

const restoreKeyResultMetric = async (id: string): Promise<KeyResult> => {
  const token = await getCurrentToken();
  const response = (await crudRequest({
    url: `${OKR_AND_PLANNING_URL}/key-results/${id}/restore-metric`,
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  })) as KeyResult;
  return response;
};

export const useRestoreKeyResultMetric = () => {
  const queryClient = useQueryClient();
  return useMutation(restoreKeyResultMetric, {
    onSuccess: () => {
      queryClient.invalidateQueries('ObjectiveInformation');
      queryClient.refetchQueries('ObjectiveDashboard');
      NotificationMessage.success({
        message: 'Restored',
        description: 'Key Result restored to previous metric type.',
      });
    },
    onError: (error: any) => {
      const status = error?.response?.status;
      const message =
        error?.response?.data?.message ||
        'No previous metric type to restore for this Key Result.';
      if (status === 404) {
        NotificationMessage.error({
          message: 'Cannot restore',
          description: message,
        });
      } else {
        NotificationMessage.error({
          message: 'Restore failed',
          description: message,
        });
      }
    },
  });
};
