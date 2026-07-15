'use client';
import React, { useEffect, useState } from 'react';
import { Dropdown, Badge } from 'antd';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useNotificationStore } from '@/store/uistate/features/notification';
import { useGetUnreadCount } from '@/store/server/features/notification/queries';
import { FiBell } from 'react-icons/fi';
import { NotificationDropdownPanel } from './NotificationDropdownPanel';

const NotificationBell = () => {
  const { userId } = useAuthenticationStore();
  const { notificationCount, setNotificationCount } = useNotificationStore();
  const [mounted, setMounted] = useState(false);
  const { data: unreadCount } = useGetUnreadCount(userId ?? '', mounted);
  const [notificationDropdownOpen, setNotificationDropdownOpen] =
    useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && typeof unreadCount === 'number')
      setNotificationCount(unreadCount);
  }, [mounted, unreadCount, setNotificationCount]);

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
