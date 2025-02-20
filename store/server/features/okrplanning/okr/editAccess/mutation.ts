import NotificationMessage from '@/components/common/notification/notificationMessage';
import { requestHeader } from '@/helpers/requestHeader';
import { OKR_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useMutation, useQueryClient } from 'react-query';

const grantObjectiveEditPermission = async (data: any) => {
  return await crudRequest({
    url: `${OKR_URL}/objective/update-status`,
    method: 'PATCH',
    data,
    headers: requestHeader(),
  });
};

export const useGrantObjectiveEditAccess = () => {
  const queryClient = useQueryClient();

  return useMutation(grantObjectiveEditPermission, {
    onSuccess: () => {
      queryClient.invalidateQueries('grantPermission');
    },
    onError: (error) => {
      NotificationMessage.error({
        message: error + '',
        description: 'Granting Permission Failed.',
      });
    },
  });
};
