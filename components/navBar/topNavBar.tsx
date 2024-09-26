'use client';
import React from 'react';
import { Badge, Avatar, Menu, Dropdown, Layout } from 'antd';
import { MailOutlined, BellOutlined, UserOutlined } from '@ant-design/icons';

const { Header } = Layout;

interface NavBarProps {
  page: string;
  userid: string;
  handleLogout: () => void;
}

const NavBar = ({ page, userid, handleLogout }: NavBarProps) => {

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
      <Menu.Item onClick={handleLogout}>
        Logout
      </Menu.Item>
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
        <Badge count={5} className="mx-4">
          <MailOutlined style={{ fontSize: '20px' }} />
        </Badge>
        <Badge count={10} className="mx-4">
          <BellOutlined style={{ fontSize: '20px' }} />
        </Badge>
        <Dropdown overlay={menu} placement="bottomRight">
          <Avatar
            icon={<UserOutlined />}
            src={`${URL}/user/${userid}`}
            className="cursor-pointer"
          />
        </Dropdown>
      </div>
    </Header>
  );
};

export default NavBar;
