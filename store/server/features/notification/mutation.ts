import { NOTIFICATION_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { requestHeader } from '@/helpers/requestHeader';
import { useMutation, useQueryClient } from 'react-query';

export const markAsRead = async (id: string, userId: string) => {
  const headers = await requestHeader();
  return crudRequest({
    url: `${NOTIFICATION_URL}/notification/${id}/read`,
    method: 'PATCH',
    params: { userId },
    headers,
  });
};

export const markAllAsRead = async (userId: string) => {
  const headers = await requestHeader();
  return crudRequest({
    url: `${NOTIFICATION_URL}/notification/read-all`,
    method: 'PATCH',
    params: { userId },
    headers,
  });
};

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation(
    ({ id, userId }: { id: string; userId: string }) => markAsRead(id, userId),
    {
      onSuccess: (_, { userId }) => {
        queryClient.invalidateQueries(['notifications', userId]);
        queryClient.invalidateQueries(['notifications-unread-count', userId]);
      },
    },
  );
};

export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation(
    (userId: string) => markAllAsRead(userId),
    {
      onSuccess: (_, userId) => {
        queryClient.invalidateQueries(['notifications', userId]);
        queryClient.invalidateQueries(['notifications-unread-count', userId]);
      },
    },
  );
};

import { useAuthenticationStore } from '@/store/uistate/features/authentication';

/** @deprecated Use useMarkAsRead. Kept for backward compatibility. */
export const useUpdateNotificationStatus = () => {
  const queryClient = useQueryClient();
  return useMutation(
    (id: string) => {
      const userId = useAuthenticationStore.getState().userId;
      if (!userId) throw new Error('userId required');
      return markAsRead(id, userId);
    },
    {
      onSuccess: (_, id) => {
        const userId = useAuthenticationStore.getState().userId;
        queryClient.invalidateQueries(['notifications', userId]);
        queryClient.invalidateQueries(['notifications-unread-count', userId]);
      },
    },
  );
};
