'use client';
import React from 'react';
import { Avatar, Menu, Dropdown, Layout } from 'antd';
import { UserOutlined } from '@ant-design/icons';

const { Header } = Layout;

interface NavBarProps {
  page: string;
  handleLogout: () => void;
}


const NavBar = ({ page, handleLogout }: NavBarProps) => {
  const menu = (
    <Menu>
      <Menu.Item>
        <a target="_blank" rel="noopener noreferrer" href={`${URL}/profile`}>
          Profile
        </a>
      </Menu.Item>
      <Menu.Item>
        <a target="_blank" rel="noopener noreferrer" href={`${URL}/settings`}>
          Settings
        </a>
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
      <div className="flex items-center">
        <Dropdown overlay={menu} placement="bottomRight">
          <Avatar
            icon={<UserOutlined />}
            // src={`${URL}/user/${userid}`}
            className="cursor-pointer"
          />
        </Dropdown>
      </div>
    </Header>
  );
};

export default NavBar;
