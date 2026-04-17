'use client';
import React, { useEffect, useState } from 'react';
import { Avatar, Dropdown, Button, Badge } from 'antd';
import { useRouter } from 'next/navigation';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useNotificationStore } from '@/store/uistate/features/notification';
import { useGetEmployee } from '@/store/server/features/employees/employeeDetail/queries';
import { useGetUnreadCount } from '@/store/server/features/notification/queries';
import { usePWA } from '@/hooks/usePWA';
import { DownloadOutlined, UserOutlined } from '@ant-design/icons';
import { FiBell } from 'react-icons/fi';
import { AiOutlineDown } from 'react-icons/ai';
import { NotificationDropdownPanel } from './NotificationDropdownPanel';

interface NavBarProps {
  handleLogout: () => void;
}

const NavBar = ({ handleLogout }: NavBarProps) => {
  const router = useRouter();
  const { userId } = useAuthenticationStore();
  const { data: employeeData } = useGetEmployee(userId);
  const { notificationCount, setNotificationCount } = useNotificationStore();
  const [mounted, setMounted] = useState(false);
  const { data: unreadCount } = useGetUnreadCount(userId ?? '', mounted);
  const { isInstallable, isInstalled, isStandalone, installApp } = usePWA();
  const [notificationDropdownOpen, setNotificationDropdownOpen] =
    useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && typeof unreadCount === 'number')
      setNotificationCount(unreadCount);
  }, [mounted, unreadCount, setNotificationCount]);

  const handleProfileRoute = () => {
    router.push(`/employees/manage-employees/${userId}`);
  };

  const handleInstallClick = async () => {
    try {
      await installApp();
    } catch (error) {
      // Handle installation error silently
    }
  };

  const profileMenuItems = [
    {
      key: 'profile',
      label: (
        <div
          data-cy="top-nav-profile-label"
          onClick={handleProfileRoute}
          className="text-gray-600 font-medium px-1"
        >
          Profile
        </div>
      ),
      className: 'rounded-lg',
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      label: (
        <div
          data-cy="top-nav-logout-label"
          className="text-red-500 font-medium px-1"
        >
          Logout
        </div>
      ),
      onClick: handleLogout,
      className: 'rounded-lg',
    },
  ];

  const hasProfileImage = Boolean(employeeData?.profileImage);

  return (
    <div
      data-cy="top-nav-bar"
      className="flex justify-end items-center bg-white w-full h-full px-6"
    >
      <div data-cy="top-nav-actions" className="flex items-center gap-5">
        {/* PWA Install Button */}
        {isInstallable && !isInstalled && !isStandalone && (
          <Button
            data-cy="top-nav-install-app-btn"
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleInstallClick}
            size="middle"
            className="hidden md:flex rounded-xl bg-[#3636F0] border-none hover:bg-[#1e1eb9] shadow-sm font-semibold h-[40px]"
          >
            Install App
          </Button>
        )}

        {/* Notification Bell */}
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

        {/* User Profile */}
        <Dropdown
          menu={{ items: profileMenuItems }}
          trigger={['click']}
          placement="bottomRight"
          overlayClassName="profile-dropdown"
        >
          <div
            data-cy="top-nav-profile-trigger"
            className="flex items-center gap-3 px-3.5 py-2 bg-[#F0F7FF] rounded-xl cursor-pointer hover:bg-[#E1EFFF] transition-all border border-transparent hover:border-[#D0E6FF] group h-[52px]"
          >
            <Avatar
              size={36}
              src={hasProfileImage ? employeeData?.profileImage : undefined}
              icon={!hasProfileImage ? <UserOutlined /> : undefined}
              className="border-2 border-white shadow-sm transition-transform group-hover:scale-105"
            />
            <div
              data-cy="top-nav-profile-info"
              className="hidden lg:flex flex-col text-left leading-tight"
            >
              <span
                data-cy="top-nav-profile-name"
                className="text-[13.5px] font-bold text-[#1E293B] mb-0.5"
              >
                {employeeData?.fullName ||
                  (employeeData?.firstName
                    ? `${employeeData.firstName} ${employeeData.lastName}`
                    : 'Selam Belete')}
              </span>
              <span
                data-cy="top-nav-profile-title"
                className="text-[10.5px] text-[#64748B] font-semibold uppercase tracking-wide opacity-80"
              >
                {employeeData?.jobInformation?.jobTitle?.name ||
                  'Software Developer'}
              </span>
            </div>
            <AiOutlineDown
              size={14}
              className="text-[#94A3B8] ml-1 transition-transform group-hover:translate-y-0.5"
            />
          </div>
        </Dropdown>
      </div>
    </div>
  );
};

export default NavBar;
