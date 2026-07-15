'use client';
import React from 'react';
import { Avatar, Dropdown, Button } from 'antd';
import { useRouter } from 'next/navigation';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useGetEmployee } from '@/store/server/features/employees/employeeDetail/queries';
import { usePWA } from '@/hooks/usePWA';
import { DownloadOutlined, UserOutlined } from '@ant-design/icons';
import { AiOutlineDown } from 'react-icons/ai';
import NotificationBell from './NotificationBell';

interface NavBarProps {
  handleLogout: () => void;
  /** On mobile the notification bell renders on the left of the header instead. */
  isMobile?: boolean;
}

const NavBar = ({ handleLogout, isMobile = false }: NavBarProps) => {
  const router = useRouter();
  const { userId } = useAuthenticationStore();
  const { data: employeeData } = useGetEmployee(userId);
  const { isInstallable, isInstalled, isStandalone, installApp } = usePWA();

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

        {/* Notification Bell: on mobile this renders on the left of the header instead */}
        {!isMobile && <NotificationBell />}

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
                    : '')}
              </span>
              <span
                data-cy="top-nav-profile-title"
                className="text-[10.5px] text-[#64748B] font-semibold uppercase tracking-wide opacity-80"
              >
                {employeeData?.employeeJobInformation?.[0]?.position?.name ||
                  ''}
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
