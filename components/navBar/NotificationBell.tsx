'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { Dropdown, Badge } from 'antd';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useNotificationStore } from '@/store/uistate/features/notification';
import {
  useGetNotifications,
  useGetUnreadCount,
} from '@/store/server/features/notification/queries';
import { FiBell } from 'react-icons/fi';
import { NotificationDropdownPanel } from './NotificationDropdownPanel';
import { filterNotificationsByPreferences } from '@/store/server/features/notification/preferenceCatalog';
import { useNotificationPreferencesStore } from '@/store/uistate/features/notification/preferences';
import type { NotificationType } from '@/store/server/features/notification/interface';

const NotificationBell = () => {
  const { userId } = useAuthenticationStore();
  const { notificationCount, setNotificationCount } = useNotificationStore();
  const [mounted, setMounted] = useState(false);
  const { data: unreadCount } = useGetUnreadCount(userId ?? '', mounted);
  const { data: notificationsData } = useGetNotifications(
    userId ?? '',
    { page: 1, limit: 100 },
    mounted && !!userId,
  );
  const [notificationDropdownOpen, setNotificationDropdownOpen] =
    useState(false);

  const enabledById = useNotificationPreferencesStore(
    (s) => s.byUserId[userId ?? '']?.enabledById,
  );
  const prefsHydrated = useNotificationPreferencesStore((s) => s.hasHydrated);

  const preferenceAwareUnread = useMemo(() => {
    if (!prefsHydrated) return null;
    if (enabledById?.channel_in_app === false) return 0;
    const raw = Array.isArray(notificationsData)
      ? (notificationsData as NotificationType[])
      : ((notificationsData as { data?: NotificationType[] } | undefined)
          ?.data ?? []);
    if (!raw.length) return null;
    const allowed = filterNotificationsByPreferences(raw, enabledById ?? {});
    return allowed.filter((item) => item.isRead !== true).length;
  }, [notificationsData, enabledById, prefsHydrated]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (typeof preferenceAwareUnread === 'number') {
      setNotificationCount(preferenceAwareUnread);
      return;
    }
    if (typeof unreadCount === 'number') setNotificationCount(unreadCount);
  }, [
    mounted,
    unreadCount,
    preferenceAwareUnread,
    setNotificationCount,
  ]);

  return (
    <Dropdown
      open={notificationDropdownOpen}
      onOpenChange={setNotificationDropdownOpen}
      trigger={['click']}
      placement="bottom"
      dropdownRender={() =>
        mounted ? (
          <NotificationDropdownPanel
            open={notificationDropdownOpen}
            onRequestClose={() => setNotificationDropdownOpen(false)}
          />
        ) : (
          <div data-cy="top-nav-notification-placeholder" />
        )
      }
    >
      <div
        data-cy="top-nav-notification-trigger"
        className="relative flex items-center justify-center cursor-pointer hover:bg-gray-50 p-2.5 rounded-full transition-all active:scale-95 group"
      >
        <Badge count={notificationCount} size="small" offset={[-2, 2]}>
          <FiBell
            size={23}
            className="text-[#475569] group-hover:text-[#3636F0] transition-colors"
          />
        </Badge>
      </div>
    </Dropdown>
  );
};

export default NotificationBell;
