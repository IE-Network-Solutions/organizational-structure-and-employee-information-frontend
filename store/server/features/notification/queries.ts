import { NOTIFICATION_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { requestHeader } from '@/helpers/requestHeader';
import { useQuery } from 'react-query';
import type {
  PushSubscriptionStatusResponse,
  NotificationType,
} from './interface';


function parseThemeFromRoute(routeStr: string): string | null {
  const s = (routeStr ?? '').trim();
  if (!s) return null;
  const [, searchPart] = s.includes('?') ? s.split('?') : ['', ''];
  const params = new URLSearchParams(searchPart || '');
  return params.get('theme') || null;
}

function normalizeNotificationItem(item: any): NotificationType {
  const raw = item?.isRead ?? item?.read ?? item?.is_read;
  const isRead = raw === true || raw === 'true';
  const theme = item?.theme ?? parseThemeFromRoute(item?.route ?? '');
  return { ...item, isRead, theme: theme || undefined };
}

export interface GetNotificationsOptions {
  page?: number;
  limit?: number;
}

const getNotifications = async (
  userId: string,
  options: GetNotificationsOptions = {},
) => {
  const { page = 1, limit = 100 } = options;
  const headers = await requestHeader();
  const res = await crudRequest({
    url: `${NOTIFICATION_URL}/notification`,
    method: 'GET',
    params: { userId, page, limit },
    headers,
  });
  if (Array.isArray(res)) {
    const normalized = res.map((item: any) => normalizeNotificationItem(item));
    return { data: normalized, total: normalized.length };
  }
  // Backend (nestjs-typeorm-paginate) returns { items, meta }
  const list = (res as any)?.items ?? (res as any)?.data;
  const arr = Array.isArray(list) ? list.map(normalizeNotificationItem) : [];
  const total =
    (res as any)?.meta?.itemCount ?? (res as any)?.total ?? arr.length;
  return { data: arr, total };
};

export const useGetNotifications = (
  userId: string,
  options: GetNotificationsOptions = {},
  enabled = true,
) =>
  useQuery(
    ['notifications', userId, options.page, options.limit],
    () => getNotifications(userId, options),
    { keepPreviousData: true, enabled: !!userId && enabled },
  );

const getUnreadCount = async (userId: string) => {
  const headers = await requestHeader();
  const res = await crudRequest({
    url: `${NOTIFICATION_URL}/notification/unread-count`,
    method: 'GET',
    params: { userId },
    headers,
  });
  return typeof res === 'number'
    ? res
    : ((res as { count?: number })?.count ?? 0);
};

export const useGetUnreadCount = (userId: string, enabled = true) =>
  useQuery(
    ['notifications-unread-count', userId],
    () => getUnreadCount(userId),
    { enabled: !!userId && enabled },
  );

const getPushSubscriptionStatus = async (
  userId: string,
): Promise<PushSubscriptionStatusResponse> => {
  const headers = await requestHeader();
  const res = await crudRequest({
    url: `${NOTIFICATION_URL}/push-subscriptions/status`,
    method: 'GET',
    params: { userId },
    headers,
  });
  return (res ?? {}) as PushSubscriptionStatusResponse;
};

export const useGetPushSubscriptionStatus = (userId: string, enabled: boolean) =>
  useQuery(
    ['push-subscription-status', userId],
    () => getPushSubscriptionStatus(userId),
    { enabled: !!userId && enabled },
  );
