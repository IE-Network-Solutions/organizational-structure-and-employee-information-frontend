'use client';
import React, { useEffect, useState } from 'react';
import { Avatar, Dropdown, Button, Badge } from 'antd';
import { useRouter } from 'next/navigation';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useNotificationStore } from '@/store/uistate/features/notification';
import { useGetEmployee } from '@/store/server/features/employees/employeeDetail/queries';
import { useGetUnreadCount } from '@/store/server/features/notification/queries';
import { usePWA } from '@/hooks/usePWA';
import { DownloadOutlined } from '@ant-design/icons';
import { FiSearch, FiBell } from 'react-icons/fi';
import { AiOutlineDown } from 'react-icons/ai';
import DefaultAvatar from '@/public/gender_neutral_avatar.jpg';
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
      label: <div className="text-red-500 font-medium px-1">Logout</div>,
      onClick: handleLogout,
      className: 'rounded-lg',
    },
  ];

  return (
    <div className="flex justify-between items-center bg-white w-full h-full px-6">
      {/* Left side: Search Bar */}
      <div className="flex-1 max-w-[420px] flex items-center pr-4">
        <div className="relative w-full group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <FiSearch className="h-4.5 w-4.5 text-gray-400 group-focus-within:text-[#3636F0] transition-colors" />
          </div>
          <input
            type="text"
            className="block w-full h-[44px] pl-11 pr-12 bg-[#F9FBFF] border border-gray-200 rounded-xl text-[14.5px] placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#3636F0]/20 focus:border-[#3636F0] transition-all"
            placeholder="Search"
          />
          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
            <div className="flex items-center justify-center w-6 h-6 border border-gray-200 rounded-md text-[11px] font-bold text-gray-400 bg-white">
              S
            </div>
          </div>
        </div>
      </div>

      {/* Right side: Actions & User Profile */}
      <div className="flex items-center gap-5">
        {/* PWA Install Button */}
        {isInstallable && !isInstalled && !isStandalone && (
          <Button
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
          placement="bottomRight"
          dropdownRender={() =>
            mounted ? (
              <NotificationDropdownPanel open={notificationDropdownOpen} />
            ) : (
              <div />
            )
          }
        >
          <div className="relative flex items-center justify-center cursor-pointer hover:bg-gray-50 p-2.5 rounded-full transition-all active:scale-95 group">
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
          <div className="flex items-center gap-3 px-3.5 py-2 bg-[#F0F7FF] rounded-xl cursor-pointer hover:bg-[#E1EFFF] transition-all border border-transparent hover:border-[#D0E6FF] group h-[52px]">
            <Avatar
              size={36}
              src={
                employeeData?.profileImage ||
                (DefaultAvatar as any).src ||
                (DefaultAvatar as unknown as string)
              }
              className="border-2 border-white shadow-sm transition-transform group-hover:scale-105"
            />
            <div className="hidden lg:flex flex-col text-left leading-tight">
              <span className="text-[13.5px] font-bold text-[#1E293B] mb-0.5">
                {employeeData?.fullName ||
                  (employeeData?.firstName
                    ? `${employeeData.firstName} ${employeeData.lastName}`
                    : 'Selam Belete')}
              </span>
              <span className="text-[10.5px] text-[#64748B] font-semibold uppercase tracking-wide opacity-80">
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
