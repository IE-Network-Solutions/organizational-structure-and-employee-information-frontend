'use client';
import React from 'react';
import { Avatar, Menu, Dropdown, Layout } from 'antd';
import { useRouter } from 'next/navigation';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import NotificationBar from './notificationBar';
import { useGetEmployee } from '@/store/server/features/employees/employeeDetail/queries';

const { Header } = Layout;

interface NavBarProps {
  page: string;
  handleLogout: () => void;
}

const NavBar = ({ page, handleLogout }: NavBarProps) => {
  const router = useRouter();

  const { userId } = useAuthenticationStore();
  const { data: employeeData } = useGetEmployee(userId);

  const handleProfileRoute = () => {
    router.push(`/employees/manage-employees/${userId}`);
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
      className="flex justify-between items-center bg-white shadow-md w-full"
      style={{
        padding: '0 20px',
      }}
    >
      <p>{page}</p>
      <div className="flex items-center gap-5">
        <NotificationBar />
        <Dropdown overlay={menu} placement="bottomRight">
          <Avatar
            src={employeeData?.profileImage}
            className="cursor-pointer border-gray-300 rounded-full"
          />
        </Dropdown>
      </div>
    </Header>
  );
};

export default NavBar;
