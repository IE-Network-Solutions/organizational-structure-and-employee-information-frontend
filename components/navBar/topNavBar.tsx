'use client';
import React, { useEffect, useState } from 'react';
import { Avatar, Menu, Dropdown, Layout, Button, Badge } from 'antd';
import { useRouter } from 'next/navigation';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useNotificationStore } from '@/store/uistate/features/notification';
import { useGetEmployee } from '@/store/server/features/employees/employeeDetail/queries';
import { useGetUnreadCount } from '@/store/server/features/notification/queries';
import { usePWA } from '@/hooks/usePWA';
import { BellOutlined, DownloadOutlined } from '@ant-design/icons';
import DefaultAvatar from '@/public/gender_neutral_avatar.jpg';
import Copilot from '@/components/copilot';
import { NotificationDropdownPanel } from './NotificationDropdownPanel';

const { Header } = Layout;

interface NavBarProps {
  page: string;
  handleLogout: () => void;
}

const NavBar = ({ page, handleLogout }: NavBarProps) => {
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

  const menu = (
    <Menu>
      <Menu.Item>
        <a
          data-cy="organizational-structure-and-employee-information-frontend-components-navbar-topnavbar-tsx-topnavbar-a-56"
          onClick={handleProfileRoute}
        >
          Profile
        </a>
      </Menu.Item>
      <Menu.Item onClick={handleLogout}>Logout</Menu.Item>
    </Menu>
  );

  return (
    <Header
      className="flex justify-between items-center bg-white w-[90%] md:w-full"
      style={{
        padding: '0 20px',
      }}
    >
      <p data-cy="organizational-structure-and-employee-information-frontend-components-navbar-topnavbar-tsx-topnavbar-p-69">
        {page}
      </p>
      <div
        data-cy="organizational-structure-and-employee-information-frontend-components-navbar-topnavbar-tsx-topnavbar-div-70"
        className="flex items-center gap-5"
      >
        {/* PWA Install Button - Show when installable and not installed */}
        {isInstallable && !isInstalled && !isStandalone && (
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleInstallClick}
            size="small"
            className="hidden md:flex"
            title="Install App"
          >
            Install
          </Button>
        )}

        {/* Mobile Install Button */}
        {isInstallable && !isInstalled && !isStandalone && (
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleInstallClick}
            size="small"
            className="md:hidden"
            title="Install App"
          />
        )}

        {/* Copilot Button */}
        <Copilot />

        {/* Notification Bell */}
        <Dropdown
          open={notificationDropdownOpen}
          onOpenChange={setNotificationDropdownOpen}
          trigger={['click']}
          placement="bottomRight"
          overlay={
            mounted ? (
              <NotificationDropdownPanel open={notificationDropdownOpen} />
            ) : (
              <div data-cy="organizational-structure-and-employee-information-frontend-components-navbar-topnavbar-tsx-topnavbar-div-107" />
            )
          }
        >
          <div
            data-cy="organizational-structure-and-employee-information-frontend-components-navbar-topnavbar-tsx-topnavbar-div-111"
            className="relative inline-block"
          >
            <Badge count={notificationCount} size="small" offset={[-2, 2]}>
              <Button type="text" icon={<BellOutlined />} />
            </Badge>
          </div>
        </Dropdown>

        <Dropdown overlay={menu} placement="bottomRight">
          <Avatar
            src={
              employeeData?.profileImage ||
              (DefaultAvatar as any).src ||
              (DefaultAvatar as unknown as string)
            }
            className="cursor-pointer border-gray-300 rounded-full"
          />
        </Dropdown>
      </div>
    </Header>
  );
};

export default NavBar;
