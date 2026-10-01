import { NOTIFICATION_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { requestHeader } from '@/helpers/requestHeader';
import { useMutation, useQueryClient } from 'react-query';
import type {
  PushSubscriptionPayload,
  UpsertNotificationPreferencesPayload,
  NotificationPreferencesResponse,
} from './interface';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';

export const registerPushSubscription = async (
  payload: PushSubscriptionPayload,
) => {
  const headers = await requestHeader();
  return crudRequest({
    url: `${NOTIFICATION_URL}/push-subscriptions`,
    method: 'POST',
    data: payload,
    headers,
  });
};

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

export const upsertNotificationPreferences = async (
  payload: UpsertNotificationPreferencesPayload,
): Promise<NotificationPreferencesResponse> => {
  const headers = await requestHeader();
  const res = await crudRequest({
    url: `${NOTIFICATION_URL}/notification/preferences`,
    method: 'PUT',
    params: { userId: payload.userId },
    data: payload,
    headers,
  });
  return (res ?? payload) as NotificationPreferencesResponse;
};

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation(
    ({ id, userId }: { id: string; userId: string }) => markAsRead(id, userId),
    {
      onSuccess: (data, { userId }) => {
        queryClient.invalidateQueries(['notifications', userId]);
        queryClient.invalidateQueries(['notifications-unread-count', userId]);
      },
    },
  );
};

export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation((userId: string) => markAllAsRead(userId), {
    onSuccess: (data, userId) => {
      queryClient.invalidateQueries(['notifications', userId]);
      queryClient.invalidateQueries(['notifications-unread-count', userId]);
    },
  });
};

export const useUpsertNotificationPreferences = () => {
  const queryClient = useQueryClient();
  return useMutation(
    (payload: UpsertNotificationPreferencesPayload) =>
      upsertNotificationPreferences(payload),
    {
      onSuccess: (data, payload) => {
        queryClient.setQueryData(
          ['notification-preferences', payload.userId],
          data,
        );
      },
    },
  );
};

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
      onSuccess: () => {
        const userId = useAuthenticationStore.getState().userId;
        queryClient.invalidateQueries(['notifications', userId]);
        queryClient.invalidateQueries(['notifications-unread-count', userId]);
      },
    },
  );
};
