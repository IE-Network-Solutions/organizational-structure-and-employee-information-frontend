'use client';
import React, { useEffect, useState } from 'react';
import { Avatar, Menu, Dropdown, Layout, Button, Badge, Drawer, Typography } from 'antd';
import { useRouter } from 'next/navigation';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useNotificationStore } from '@/store/uistate/features/notification';
import { useGetEmployee } from '@/store/server/features/employees/employeeDetail/queries';
import { usePWA } from '@/hooks/usePWA';
import {
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  UserAddOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import NotificationBar from './notificationBar';

const { Header } = Layout;

interface NavBarProps {
  page: string;
  handleLogout: () => void;
}

const NavBar = ({ page, handleLogout }: NavBarProps) => {
  const router = useRouter();
  const { userId } = useAuthenticationStore();
  const { data: employeeData } = useGetEmployee(userId);
  const { setNotificationCount } = useNotificationStore();
  const { isInstallable, isInstalled, isStandalone, installApp } = usePWA();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const handleProfileRoute = () => {
    router.push(`/employees/manage-employees/${userId}`);
  };

  const handleInstallClick = async () => {
    try {
      await installApp();
    } catch (error) {
      console.error('Installation failed:', error);
    }
  };

  const menu = (
    <Menu>
      <Menu.Item>
        <a onClick={handleProfileRoute}>Profile</a>
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
      <p>{page}</p>
      <div className="flex items-center gap-5">
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

        {/* Notification Bell */}
        <div className="relative">
          <Badge count={setNotificationCount} size="small">
            <Button
              type="text"
              icon={<BellOutlined />}
              onClick={() => setIsNotificationOpen(true)}
            />
          </Badge>
        </div>

        <Dropdown overlay={menu} placement="bottomRight">
          <Avatar
            src={employeeData?.profileImage}
            className="cursor-pointer border-gray-300 rounded-full"
          />
        </Dropdown>
      </div>

      {/* Notification Drawer */}
      <Drawer
        title="Notifications"
        placement="right"
        onClose={() => setIsNotificationOpen(false)}
        open={isNotificationOpen}
        width={400}
      >
        <NotificationBar />
      </Drawer>
    </Header>
  );
};

export default NavBar;
