import { NOTIFICATION_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useMutation, useQueryClient } from 'react-query';

const updateNotificationStatus = async (id: string) => {
  return crudRequest({
    url: `${NOTIFICATION_URL}/notification/deactivate/${id}`,
    method: 'patch',
  });
};
export const useUpdateNotificationStatus = () => {
  const queryClient = useQueryClient();
  return useMutation(updateNotificationStatus, {
    onSuccess: () => {
      queryClient.invalidateQueries('notifications');
    },
  });
};
