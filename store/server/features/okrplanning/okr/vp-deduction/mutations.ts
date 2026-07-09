import NotificationMessage from '@/components/common/notification/notificationMessage';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { OKR_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { getCurrentToken } from '@/utils/getCurrentToken';
import { handleSuccessMessage } from '@/utils/showSuccessMessage';
import { useMutation, useQueryClient } from 'react-query';

const deleteVpDeductionById = async (id: string) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  const createdBy = useAuthenticationStore.getState().userId;

  return crudRequest({
    url: `${OKR_URL}/vp-deduction/${id}`,
    method: 'DELETE',
    headers: {
      tenantId,
      createdBy,
      Authorization: `Bearer ${token}`,
    },
  });
};

export const useDeleteVpDeduction = () => {
  const queryClient = useQueryClient();

  return useMutation((id: string) => deleteVpDeductionById(id), {
    onSuccess: () => {
      queryClient.invalidateQueries('vp-deduction-details');
      queryClient.invalidateQueries('vp-deduction-total');
      queryClient.invalidateQueries('VPScores');
      queryClient.invalidateQueries('attendance-rule-violations');
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || 'Failed to remove VP deduction.';
      NotificationMessage.error({
        message: 'Error',
        description: message,
      });
    },
  });
};

export const useBulkDeleteVpDeductions = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async (ids: string[]) => {
      await Promise.all(ids.map((id) => deleteVpDeductionById(id)));
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('vp-deduction-details');
        queryClient.invalidateQueries('vp-deduction-total');
        queryClient.invalidateQueries('VPScores');
        queryClient.invalidateQueries('attendance-rule-violations');
        handleSuccessMessage('DELETE', 'VP deductions updated successfully.');
      },
      onError: (error: unknown) => {
        const message =
          (error as { response?: { data?: { message?: string } } })?.response
            ?.data?.message || 'Failed to update VP deductions.';
        NotificationMessage.error({
          message: 'Error',
          description: message,
        });
      },
    },
  );
};
