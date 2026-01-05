import NotificationMessage from '@/components/common/notification/notificationMessage';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { ORG_AND_EMP_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useMutation, useQueryClient } from 'react-query';
import { getCurrentToken } from '@/utils/getCurrentToken';

// const token = await getCurrentToken();
const tenantId = useAuthenticationStore.getState().tenantId;

const createBranchTransferRequest = async (values: any) => {
  const token = await getCurrentToken();
  return crudRequest({
    url: `${ORG_AND_EMP_URL}/branch-request`,
    method: 'POST',
    data: values,
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};
const deleteBranchTransferRequest = async (id: string) => {
  const token = await getCurrentToken();
  return crudRequest({
    url: `${ORG_AND_EMP_URL}/branch-request/${id}`,
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};
export const useAddBranchTransferRequest = () => {
  const queryClient = useQueryClient();
  return useMutation(createBranchTransferRequest, {
    onSuccess: () => {
      queryClient.invalidateQueries('transferRequest');
      NotificationMessage.success({
        message: 'Successfully Created',
        description: 'BranchTransferRequest successfully Created',
      });
    },
  });
};
export const useDeleteBranchTransferRequest = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteBranchTransferRequest, {
    onSuccess: () => {
      queryClient.invalidateQueries('transferApprovalRequest');
      queryClient.invalidateQueries('myTransferRequest');
      queryClient.invalidateQueries('transferRequest');
      NotificationMessage.success({
        message: 'Successfully Deleted',
        description: 'request successfully deleted',
      });
    },
    onError: () => {
      NotificationMessage.error({
        message: 'Deleting Failed',
        description: 'request deletion Failed',
      });
    },
  });
};
