import NotificationMessage from '@/components/common/notification/notificationMessage';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { ORG_DEV_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { getCurrentToken } from '@/utils/getCurrentToken';
import { useMutation, useQueryClient } from 'react-query';

const submitResponseMutation = async (id: string, values: any) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  return crudRequest({
    url: `${ORG_DEV_URL}/responses/public/${id}`,
    method: 'post',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
    data: values,
  });
};

export const useSubmitFormResponse = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({ id, values }: { id: string; values: any }) =>
      submitResponseMutation(id, values),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('employee');
        NotificationMessage.success({
          message: 'Successfully Submitted',
          description: '',
        });
      },
    },
  );
};
