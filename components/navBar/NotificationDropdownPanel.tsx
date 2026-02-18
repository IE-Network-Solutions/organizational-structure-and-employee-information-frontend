'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Spin, Button, message } from 'antd';
import { useQueryClient } from 'react-query';
import {
  useGetNotifications,
  useGetPushSubscriptionStatus,
} from '@/store/server/features/notification/queries';
import { NotificationType } from '@/store/server/features/notification/interface';
import {
  useUpdateNotificationStatus,
  useMarkAllAsRead,
} from '@/store/server/features/notification/mutation';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { getNotificationThemeClasses } from '@/store/server/features/notification/themeUtils';
import {
  EyeOutlined,
  FileTextOutlined,
  BellOutlined,
  DollarOutlined,
  UserAddOutlined,
  ClockCircleOutlined,
  BarChartOutlined,
  ReadOutlined,
  GiftOutlined,
  GlobalOutlined,
} from '@ant-design/icons';
import { requestAndRegisterPushSubscription } from '@/hooks/usePushSubscription';
import { VAPID_PUBLIC_KEY } from '@/utils/constants';

const toSlug = (v: string | number | null | undefined) =>
  String(v ?? 'na').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

function getNotificationIcon(item: NotificationType): React.ComponentType<{ className?: string }> {
  const s = (item.source_service ?? '').toLowerCase().replace(/_/g, '-');
  const r = (item.route ?? '').toLowerCase();
  if (s.includes('org-structure') || r.includes('quarter_completion')) return GlobalOutlined;
  if (s.includes('planning-and-reporting')) return BarChartOutlined;
  if (s.includes('time-and-attendance')) return ClockCircleOutlined;
  if (s.includes('training-and-learning')) return ReadOutlined;
  if (s.includes('recruitment')) return UserAddOutlined;
  if (s.includes('compensation-and-benefits') || (r.includes('compensationsetting') && r.includes('allowance'))) return GiftOutlined;
  if (s.includes('payroll')) return DollarOutlined;
  return FileTextOutlined;
}

const PANEL_WIDTH = 400;
const MAX_HEIGHT = 520;
const LIST_LIMIT = 100;
type FilterType = 'all' | 'unread' | 'seen';

function isUnread(item: NotificationType): boolean {
  return item.isRead !== true;
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  const hours = d.getHours();
  const mins = d.getMinutes();
  const am = hours < 12;
  const h = hours % 12 || 12;
  return `${h}:${mins.toString().padStart(2, '0')}${am ? 'AM' : 'PM'}`;
}

function NotificationItem({
  item,
  unread,
  onMarkAsRead,
  onClick,
  formatTime,
}: {
  item: NotificationType;
  unread: boolean;
  onMarkAsRead: (e: React.MouseEvent, id: string) => void;
  onClick: (item: NotificationType) => void;
  formatTime: (dateStr: string) => string;
}) {
  const IconComponent = getNotificationIcon(item);
  const themeClasses = getNotificationThemeClasses(item);
  return (
      <div
        id={`notification-item-${toSlug(item.id)}`}
        data-cy={`notification-item-${toSlug(item.id)}`}
      onClick={() => onClick(item)}
      className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors border-l-2 ${themeClasses.border} ${themeClasses.hover} ${unread ? 'opacity-100' : 'opacity-70'}`}
    >
      <div className="flex-shrink-0 relative mt-0.5" data-cy={`notification-item-avatar-wrapper-${toSlug(item.id)}`}>
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center ${themeClasses.bg}`}
          data-cy={`notification-item-icon-${toSlug(item.id)}`}
        >
          <IconComponent
            className={`text-sm ${themeClasses.icon}`}
          />
        </div>
        {unread && (
          <span
            data-cy="components-navbar-notificationdropdownpanel-tsx-notificationdropdownpanel-span-73"
            className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-red-500"
            aria-hidden
          />
        )}
      </div>
      <div
        data-cy="organizational-structure-and-employee-information-frontend-components-navbar-notificationdropdownpanel-tsx-notificationdropdownpanel-div-73"
        className="flex-1 min-w-0"
      >
        <div
          data-cy="organizational-structure-and-employee-information-frontend-components-navbar-notificationdropdownpanel-tsx-notificationdropdownpanel-div-74"
          className="text-sm font-medium text-gray-600 truncate"
        >
          {item.title}
        </div>
        <div
          data-cy="components-navbar-notificationdropdownpanel-tsx-notificationdropdownpanel-div-89"
          className="text-xs text-gray-500 mt-0.5 line-clamp-2"
          title={item.body}
        >
          {item.body?.length
            ? item.body.length > 60
              ? `${item.body.slice(0, 60)}...`
              : item.body
            : '—'}
        </div>
        <div
          data-cy="organizational-structure-and-employee-information-frontend-components-navbar-notificationdropdownpanel-tsx-notificationdropdownpanel-div-87"
          className="text-xs text-gray-400 mt-1"
        >
          {formatTime(item.createdAt ?? item.updatedAt ?? '')}
        </div>
      </div>
      <button
        type="button"
        id={`notification-item-mark-read-${toSlug(item.id)}`}
        data-cy={`notification-item-mark-read-${toSlug(item.id)}`}
        onClick={(e) => {
          e.stopPropagation();
          if (unread) onMarkAsRead(e, item.id);
        }}
        className={`flex-shrink-0 p-1.5 rounded transition-colors ${
          unread
            ? 'text-[#5B4FFF] hover:bg-[#5B4FFF]/10'
            : 'text-gray-300 cursor-default'
        }`}
        aria-label={unread ? 'Mark as read' : 'Seen'}
        disabled={!unread}
      >
        <EyeOutlined className="text-base" />
      </button>
    </div>
  );
}

export function NotificationDropdownPanel({ open: isOpen }: { open?: boolean } = {}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const userId = useAuthenticationStore.getState().userId ?? '';
  const tenantId = useAuthenticationStore.getState().tenantId ?? undefined;
  const [filter, setFilter] = useState<FilterType>('all');
  const [pushPermission, setPushPermission] =
    useState<NotificationPermission | null>(null);
  const [pushEnabling, setPushEnabling] = useState(false);

  useEffect(() => {
    setPushPermission(
      typeof window !== 'undefined' && 'Notification' in window
        ? Notification.permission
        : null,
    );
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPushPermission(Notification.permission);
    }
  }, [isOpen]);

  const { data: subscriptionStatus } = useGetPushSubscriptionStatus(
    userId,
    !!isOpen && !!userId,
  );
  const isSubscribed =
    subscriptionStatus?.subscribed === true ||
    subscriptionStatus?.hasSubscription === true;

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      !('serviceWorker' in navigator) ||
      !VAPID_PUBLIC_KEY ||
      !userId
    ) {
      return;
    }
    navigator.serviceWorker.getRegistration('/').then((existing) => {
      if (!existing || !existing.active) {
        navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          updateViaCache: 'imports',
        });
      }
    });
    navigator.serviceWorker.getRegistration('/push/').then((existing) => {
      if (!existing || !existing.active) {
        navigator.serviceWorker.register('/sw-push.js', {
          scope: '/push/',
          updateViaCache: 'imports',
        });
      }
    });
  }, [userId, pushPermission]);

  const handleEnablePush = async () => {
    if (!userId) return;
    setPushEnabling(true);
    try {
      const ok = await requestAndRegisterPushSubscription(userId, tenantId);
      if (ok) {
        setPushPermission('granted');
        queryClient.invalidateQueries(['push-subscription-status', userId]);
        message.success(
          'Notifications enabled. You’ll receive important updates.',
        );
      } else {
        message.warning(
          'Please click “Allow” in your browser to enable notifications.',
        );
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      message.error(
        msg.includes('401') || msg.includes('403')
          ? 'Your session has expired. Please sign in again.'
          : 'We couldn’t enable notifications. Please try again.',
      );
    } finally {
      setPushEnabling(false);
    }
  };

  const showEnablePush =
    !!VAPID_PUBLIC_KEY &&
    !!userId &&
    (pushPermission !== 'granted' || !isSubscribed);

  const showPushNotConfigured = !!userId && !VAPID_PUBLIC_KEY;

  const { data, isLoading } = useGetNotifications(userId, {
    page: 1,
    limit: LIST_LIMIT,
  });
  const { mutate: markAsRead } = useUpdateNotificationStatus();
  const { mutate: markAllAsRead } = useMarkAllAsRead();

  const list = useMemo(
    () => (Array.isArray(data) ? data : ((data as any)?.data ?? [])),
    [data],
  );
  const unreadList = useMemo(() => list.filter(isUnread), [list]);
  const readList = useMemo(
    () => list.filter((i: NotificationType) => !isUnread(i)),
    [list],
  );
  const filtered = useMemo(() => {
    if (filter === 'unread') return unreadList;
    if (filter === 'seen') return readList;
    return list;
  }, [list, filter, unreadList, readList]);

  const handleMarkAsRead = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    markAsRead(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead(userId);
  };

  const handleItemClick = (item: NotificationType) => {
    const routeStr =
      item.route?.trim() || `/employees/notification?id=${item.id}`;
    const path = routeStr.startsWith('/') ? routeStr : `/${routeStr}`;
    if (isUnread(item)) markAsRead(item.id);
    router.push(path);
  };

  return (
    <>
      <div
        id="notification-dropdown-panel"
        data-cy="notification-dropdown-panel"
        className="bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden"
        style={{ width: PANEL_WIDTH, maxHeight: MAX_HEIGHT }}
      >
        {/* Header */}
        <div
          id="notification-panel-header"
          data-cy="notification-panel-header"
          className="flex items-center justify-between px-4 py-3 border-b border-gray-100"
        >
          <span
            data-cy="organizational-structure-and-employee-information-frontend-components-navbar-notificationdropdownpanel-tsx-notificationdropdownpanel-span-261"
            className="font-semibold text-gray-900 text-base"
          >
            Notifications
          </span>
          <button
            type="button"
            id="notification-mark-all-read"
            data-cy="notification-mark-all-read"
            onClick={handleMarkAllAsRead}
            className="text-sm font-medium text-[#5B4FFF] hover:underline"
          >
            Mark all as read
          </button>
        </div>

        {/* Filters - selected tab: solid blue bg + white text (match design) */}
        <div
          id="notification-filters"
          data-cy="notification-filters"
          className="flex items-center gap-2 px-4 py-2 border-b border-gray-100"
        >
          <button
            type="button"
            id="notification-filter-all"
            data-cy="notification-filter-all"
            onClick={() => setFilter('all')}
            className={`text-sm font-medium py-2 px-3 rounded transition-colors ${
              filter === 'all'
                ? 'bg-[#5B4FFF] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            type="button"
            id="notification-filter-unread"
            data-cy="notification-filter-unread"
            onClick={() => setFilter('unread')}
            className={`text-sm font-medium py-2 px-3 rounded transition-colors ${
              filter === 'unread'
                ? 'bg-[#5B4FFF] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Unread
          </button>
          <button
            type="button"
            id="notification-filter-seen"
            data-cy="notification-filter-seen"
            onClick={() => setFilter('seen')}
            className={`text-sm font-medium py-2 px-3 rounded transition-colors ${
              filter === 'seen'
                ? 'bg-[#5B4FFF] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Seen
          </button>
        </div>

        {/* Push not configured (no VAPID key) - show nothing to avoid exposing dev details */}
        {showPushNotConfigured && (
          <div
            id="notification-push-not-available"
            data-cy="notification-push-not-available"
            className="px-4 py-2 border-b border-gray-100 bg-gray-50/50"
          >
            <p
              data-cy="organizational-structure-and-employee-information-frontend-components-navbar-notificationdropdownpanel-tsx-notificationdropdownpanel-p-329"
              className="text-xs text-gray-600"
            >
              Push notifications are not available right now.
            </p>
          </div>
        )}

        {/* Enable push notifications - when permission not yet granted */}
        {showEnablePush && (
          <div
            id="notification-enable-push-section"
            data-cy="notification-enable-push-section"
            className="px-4 py-3 border-b border-gray-100 bg-gray-50/50"
          >
            <p
              data-cy="organizational-structure-and-employee-information-frontend-components-navbar-notificationdropdownpanel-tsx-notificationdropdownpanel-p-342"
              className="text-xs text-gray-600 mb-2"
            >
              Stay in the loop. Get notified about important updates even when
              you&apos;re not in the app.
            </p>
            <Button
              type="primary"
              size="small"
              icon={<BellOutlined />}
              loading={pushEnabling}
              onClick={handleEnablePush}
              className="w-full"
              id="notification-allow-notifications-btn"
              data-cy="notification-allow-notifications-btn"
            >
              Allow notifications
            </Button>
          </div>
        )}

        {/* List */}
        <div
          id="notification-list"
          data-cy="notification-list"
          className="overflow-y-auto"
          style={{ maxHeight: MAX_HEIGHT - 140 }}
        >
          {isLoading ? (
            <div
              id="notification-list-loading"
              data-cy="notification-list-loading"
              className="flex justify-center py-8"
            >
              <Spin size="small" />
            </div>
          ) : filtered.length === 0 ? (
            <div
              id="notification-list-empty"
              data-cy="notification-list-empty"
              className="py-10 text-center text-gray-500 text-sm"
            >
              {filter === 'all'
                ? 'No notifications'
                : filter === 'unread'
                  ? 'No unread notifications'
                  : 'No seen notifications'}
            </div>
          ) : filter === 'all' &&
            (unreadList.length > 0 || readList.length > 0) ? (
            <div className="p-2 space-y-4" id="notification-all-sections" data-cy="notification-all-sections">
              {unreadList.length > 0 && (
                <div id="notification-unread-section" data-cy="notification-unread-section">
                  <h3 id="notification-unread-heading" data-cy="notification-unread-heading" className="text-xs font-bold text-gray-500 uppercase tracking-wide px-3 mb-2">
                    Unread
                  </h3>
                  <div className="space-y-3" id="notification-unread-list" data-cy="notification-unread-list">
                    {unreadList.map((item: NotificationType) => (
                      <NotificationItem
                        key={item.id}
                        item={item}
                        unread
                        onMarkAsRead={handleMarkAsRead}
                        onClick={handleItemClick}
                        formatTime={formatTime}
                      />
                    ))}
                  </div>
                </div>
              )}
              {readList.length > 0 && (
                <div id="notification-previous-section" data-cy="notification-previous-section">
                  <h3 id="notification-previous-heading" data-cy="notification-previous-heading" className="text-xs font-bold text-gray-500 uppercase tracking-wide px-3 mb-2 border-t border-gray-200 pt-3 mt-1">
                    Previous notifications
                  </h3>
                  <div className="space-y-3" id="notification-previous-list" data-cy="notification-previous-list">
                    {readList.map((item: NotificationType) => (
                      <NotificationItem
                        key={item.id}
                        item={item}
                        unread={false}
                        onMarkAsRead={handleMarkAsRead}
                        onClick={handleItemClick}
                        formatTime={formatTime}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-2 space-y-3" id="notification-filtered-list" data-cy="notification-filtered-list">
              {filtered.map((item: NotificationType) => (
                <NotificationItem
                  key={item.id}
                  item={item}
                  unread={isUnread(item)}
                  onMarkAsRead={handleMarkAsRead}
                  onClick={handleItemClick}
                  formatTime={formatTime}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
