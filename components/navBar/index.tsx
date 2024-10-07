'use client';

import React, { ReactNode, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  AppstoreOutlined,
  BarChartOutlined,
  UserOutlined,
  MenuOutlined,
} from '@ant-design/icons';
import { FaStarOfLife } from 'react-icons/fa';
import {
  MdOutlineKeyboardDoubleArrowLeft,
  MdOutlineKeyboardDoubleArrowRight,
} from 'react-icons/md';
import { IoCloseOutline } from 'react-icons/io5';

import { Layout, Menu, Button, theme } from 'antd';
const { Header, Content, Sider } = Layout;
import type { MenuProps } from 'antd';
import NavBar from './topNavBar';
import { FiSettings } from 'react-icons/fi';
import { CiCalendar, CiSettings, CiStar } from 'react-icons/ci';
import { PiSuitcaseSimpleThin } from 'react-icons/pi';
import { LuUsers2 } from 'react-icons/lu';

type MenuItem = Required<MenuProps>['items'][number];

const items: MenuItem[] = [
  {
    key: '/organization',
    icon: <CiSettings />,
    label: 'Organization',
    className: 'font-bold',
    children: [
      {
        key: '/organization/org-structure',
        label: 'Org Structure',
      },
      {
        key: '/organization/org-chart',
        label: 'Org Chart',
      },
      {
        key: '/organization/settings',
        label: 'Settings',
      },
    ],
  },
  {
    key: '/employees',
    icon: <LuUsers2 />,
    label: 'Employees',
    className: 'font-bold',
    children: [
      {
        key: '/employees',
        label: 'Employees',
        className: 'font-bold',
      },
      {
        key: '/employees/manage-employees',
        className: 'font-bold',
        label: 'Manage Employees',
      },
      {
        key: '/employees/settings',
        className: 'font-bold',
        label: 'Settings',
      },
    ],
  },
  {
    key: '/recruitment',
    icon: <PiSuitcaseSimpleThin />,
    className: 'font-bold',
    label: 'Recruitment',
  },
  {
    key: '/timesheet',
    icon: <CiCalendar />,
    className: 'font-bold',
    label: 'Timesheet',
  },
  {
    key: '/activity',
    icon: <BarChartOutlined />,
    className: 'font-bold',
    label: 'Activity',
  },
  {
    key: '/feedback ',
    label: 'Feedback',
    icon: <UserOutlined />,
    className: 'font-bold',
    children: [
      {
        key: '/Chart',
        label: 'Clients',
        icon: <UserOutlined />,
        className: 'font-bold',
      },
      {
        key: '/client-management/settings',
        label: 'Settings',
        className: 'font-bold',
        icon: <FiSettings />,
      },
    ],
  },
  {
    key: '/okr-planning ',
    label: 'OKR & Planning',
    icon: <CiStar size={20} />,
    className: 'font-bold',
    children: [
      {
        key: '/dashboard',
        label: 'Dashboard',
        className: 'font-bold',
      },
      {
        key: '/okr',
        label: 'OKR',
        className: 'font-bold',
      },
      {
        key: '/monitoring-evaluation',
        label: 'Monitoring & Evaluation',
        className: 'font-bold',
      },
      {
        key: '/okr/settings',
        label: 'Settings',
        className: 'font-bold',
      },
    ],
  },
];

interface MyComponentProps {
  children: ReactNode;
}

const Nav: React.FC<MyComponentProps> = ({ children }) => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileCollapsed, setMobileCollapsed] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const toggleMobileCollapsed = () => {
    setMobileCollapsed(!mobileCollapsed);
  };

  const handleMenuClick = (e: { key: string }) => {
    router.push(e.key);
    if (isMobile) {
      setMobileCollapsed(true);
    }
  };

  return (
    <Layout>
      <Sider
        theme="light"
        width={280}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 1000,
          transform: isMobile && mobileCollapsed ? 'translateX(-100%)' : 'none',
          transition: 'transform 0.3s ease',
        }}
        trigger={null}
        collapsible
        collapsed={collapsed}
        breakpoint="md"
        onBreakpoint={(broken) => {
          setIsMobile(broken);
          if (broken) {
            setMobileCollapsed(true);
          }
        }}
        collapsedWidth={isMobile ? 80 : 80}
      >
        <div className="flex justify-between px-4 my-4">
          <div className=" flex items-center gap-2">
            <FaStarOfLife color="#3636F0" />{' '}
            {!collapsed && (
              <p className="text-xl text-black font-bold uppercase"> PEP</p>
            )}
          </div>

          <div onClick={toggleCollapsed} className="text-black text-xl">
            {collapsed ? (
              <MdOutlineKeyboardDoubleArrowRight />
            ) : (
              <MdOutlineKeyboardDoubleArrowLeft />
            )}
          </div>
        </div>
        {!collapsed && (
          <div className="mt-12 flex justify-between items-center border-2 border-[#3636F0] px-4 py-3 mx-4 rounded-lg">
            <div className="text-black font-bold font-['Manrope'] leading-normal">
              Dashboard
            </div>
            <AppstoreOutlined size={24} className="text-black" />
          </div>
        )}

        <Menu
          mode="inline"
          defaultSelectedKeys={['/dashboard']}
          items={items}
          inlineCollapsed={collapsed}
          className="my-5"
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout
        style={{
          marginLeft: isMobile ? 0 : collapsed ? 10 : 20,
          transition: 'margin-left 0.3s ease',
        }}
      >
        <Header
          style={{
            padding: 4,
            background: colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            position: 'fixed',
            width: '100%',
            zIndex: 1000,
            top: 0,
            left: isMobile && mobileCollapsed ? 0 : collapsed ? 80 : 280,
            transition: 'left 0.3s ease',
          }}
        >
          {isMobile && (
            <div className="w-full h-full p-[10px] flex justify-center items-center">
              <Button
                className="w-full h-full"
                onClick={toggleMobileCollapsed}
                icon={
                  !mobileCollapsed ? (
                    <IoCloseOutline
                      size={24}
                      className="text-gray-500 border-none"
                    />
                  ) : (
                    <MenuOutlined
                      size={24}
                      className="text-gray-500 border-none"
                    />
                  )
                }
              />
            </div>
          )}

          <NavBar page="Home" userid="12345" />
        </Header>
        <Content
          className="overflow-y-hidden min-h-screen"
          style={{
            paddingTop: isMobile ? 64 : 24,
            paddingLeft: isMobile ? 0 : collapsed ? 80 : 280,
            transition: 'padding-left 0.3s ease',
          }}
        >
          <div
            className="p-2 bg-white overflow-auto"
            style={{
              borderRadius: borderRadiusLG,
              marginTop: '3rem',
              marginRight: '1.3rem',
            }}
          >
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Nav;
