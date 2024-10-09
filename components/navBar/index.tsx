'use client';
import React, { ReactNode, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  AppstoreOutlined,
  BarChartOutlined,
  UserOutlined,
  MenuOutlined,
} from '@ant-design/icons';
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
import { PiStarThin, PiSuitcaseSimpleThin } from 'react-icons/pi';
import { LuUsers2 } from 'react-icons/lu';
import { removeCookie } from '@/helpers/storageHelper';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';

type MenuItem = Required<MenuProps>['items'][number];

const items: MenuItem[] = [
  {
    key: '/organization',
    icon: <CiSettings />,
    label: 'Organization',
    className: 'font-bold',
    children: [
      {
        key: '/organization/chart',
        label: 'Org Structure',
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
    label: 'Talent Acquisition',
    children: [
      {
        key: '/recruitment/jobs',
        label: 'Jobs',
        icon: <UserOutlined />,
      },
      {
        key: '/recruitment/candidate',
        label: 'Candidates',
        icon: <UserOutlined />,
      },
      {
        key: '/recruitment/talent-pool',
        label: 'Talent Pool',
        icon: <UserOutlined />,
      },
      {
        key: '/recruitment/settings',
        label: 'Settings',
        icon: <FiSettings />,
      },
    ],
  },
  {
    key: '/okr-planning ',
    label: 'OKR',
    icon: <CiStar size={20} />,
    className: 'font-bold',
    children: [
      {
        key: '/okr/dashboard',
        label: 'Dashboard',
        className: 'font-bold',
      },
      {
        key: '/okr',
        label: 'OKR',
        className: 'font-bold',
      },
      {
        key: '/planning-and-reporting',
        label: 'Planning and Reporting',
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
  {
    key: '/feedback ',
    label: 'CFR',
    icon: <UserOutlined />,
    className: 'font-bold',
    children: [
      {
        key: '/feedback/categories',
        label: 'Form',
        icon: <UserOutlined />,
        className: 'font-bold',
      },
      {
        key: '/feedback/settings',
        label: 'Settings',
        className: 'font-bold',
        icon: <FiSettings />,
      },
    ],
  },

  {
    key: '/tna',
    icon: <BarChartOutlined />,
    className: 'font-bold',
    label: 'Learning & Growth',
    children: [
      {
        key: '/tna/management',
        className: 'font-bold',
        label: 'Training Management',
      },
      {
        key: '/tna/review',
        className: 'font-bold',
        label: 'TNA',
      },
      {
        key: '/tna/settings/course-category',
        className: 'font-bold',
        label: 'Settings',
      },
    ],
  },
  {
    key: '/timesheet',
    icon: <CiCalendar />,
    className: 'font-bold',
    label: 'Time & Attendance',
    children: [
      {
        key: '/timesheet/my-timesheet',
        label: 'My timesheet',
        className: 'font-bold',
      },
      {
        key: '/timesheet/employee-attendance',
        label: 'Employee Attendance',
        className: 'font-bold',
      },
      {
        key: '/timesheet/leave-management',
        label: 'Leave Management',
        className: 'font-bold',
      },
      {
        key: '/timesheet/settings/closed-date',
        label: 'Settings',
        className: 'font-bold',
      },
    ],
  },
];

const userItems: MenuItem[] = [
  {
    key: '/panning-and-reporting',
    label: 'Panning & Reporting',
    icon: <PiStarThin />,
    className: 'font-bold',
    children: [
      {
        key: '/feedback/dashboard',
        label: 'Dashboard',
        icon: <UserOutlined />,
        className: 'font-bold',
      },
      {
        key: '/feedback/okr',
        label: 'OKR',
        className: 'font-bold',
        icon: <FiSettings />,
      },
      {
        key: '/feedback/evaluation',
        label: 'monitoring & evaluation',
        icon: <UserOutlined />,
        className: 'font-bold',
      },
      {
        key: '/panning-and-reporting',
        label: 'Panning & Reporting',
        className: 'font-bold',
        icon: <FiSettings />,
      },
      {
        key: '/feedback/setting',
        label: 'Setting',
        icon: <FiSettings />,
        className: 'font-bold',
      },

      {
        key: '/okr-planning ',
        label: 'OKR',
        icon: <CiStar size={20} />,
        className: 'font-bold',
        children: [
          {
            key: '/okr/dashboard',
            label: 'Dashboard',
            className: 'font-bold',
          },
          {
            key: '/okr',
            label: 'OKR',
            className: 'font-bold',
          },
          {
            key: '/planning-and-reporting',
            label: 'Planning and Reporting',
            className: 'font-bold',
          },
          {
            key: '/monitoring-evaluation',
            label: 'Monitoring & Evaluation',
            className: 'font-bold',
          },
        ],
      },
      {
        key: '/feedback ',
        label: 'CFR',
        icon: <UserOutlined />,
        className: 'font-bold',
        children: [
          {
            key: '/feedback/categories',
            label: 'Form',
            icon: <UserOutlined />,
            className: 'font-bold',
          },
        ],
      },

      {
        key: '/tna',
        icon: <BarChartOutlined />,
        className: 'font-bold',
        label: 'Learning & Growth',
        children: [
          {
            key: '/tna/management',
            className: 'font-bold',
            label: 'Training Management',
          },
          {
            key: '/tna/review',
            className: 'font-bold',
            label: 'TNA',
          },
        ],
      },
      {
        key: '/timesheet',
        icon: <CiCalendar />,
        className: 'font-bold',
        label: 'Time & Attendance',
        children: [
          {
            key: '/timesheet/my-timesheet',
            label: 'My timesheet',
            className: 'font-bold',
          },
        ],
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
  const { userData, setLocalId, setTenantId, setToken, setUserId, setError } =
    useAuthenticationStore();
  const userRole = userData?.role?.slug || '';
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

  const handleLogout = () => {
    setToken('');
    setTenantId('');
    setLocalId('');
    removeCookie('token');
    router.push(`/authentication/login`);
    setUserId('');
    setLocalId('');
    setError('');
    removeCookie('token');
    removeCookie('tenantId');
    window.location.reload();
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
            <img className="w-40 " src="/icons/logo.svg" alt="Success" />
            <svg
              width="168"
              height="58"
              viewBox="0 0 168 58"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22.41 49.1694C22.41 49.1694 15.9718 41.8025 13.7429 34.3114C12.1004 28.7921 15.2288 26.0773 18.6952 31.8967C22.1617 37.7162 21.9759 37.2832 21.9759 37.2832L21.4392 15.1295C21.4176 14.2505 21.7059 13.3801 22.2912 12.7235C22.6476 12.324 23.1314 11.9698 23.7718 11.8369C25.5676 11.4655 27.1766 13.5701 27.1766 13.5701L27.4865 30.7812"
                stroke="#3636F0"
                stroke-width="1.94378"
                stroke-miterlimit="10"
                stroke-linecap="round"
              />
              <path
                d="M27.1758 13.5724C27.1758 13.5724 27.1758 9.67188 29.7761 9.67188C31.5169 9.67188 32.2868 11.0044 32.6054 11.8845C32.7447 12.269 32.8095 12.675 32.8095 13.0832V28.6777"
                stroke="#3636F0"
                stroke-width="1.94378"
                stroke-miterlimit="10"
                stroke-linecap="round"
              />
              <path
                d="M32.8086 13.7892C32.8086 13.7892 33.1336 11.3746 35.7804 11.4675C36.7199 11.5009 37.3095 12.0063 37.6702 12.5333C38.019 13.043 38.1929 13.652 38.2026 14.2697L38.4423 29.05"
                stroke="#3636F0"
                stroke-width="1.94378"
                stroke-miterlimit="10"
                stroke-linecap="round"
              />
              <path
                d="M38.4453 18.57C38.4453 18.57 38.5933 16.5117 41.3631 16.5117C43.1892 16.5117 43.7691 17.976 43.8361 18.7471C44.1903 22.7977 45.6341 42.8327 40.3027 49.664"
                stroke="#3636F0"
                stroke-width="1.94378"
                stroke-miterlimit="10"
                stroke-linecap="round"
              />
              <path
                d="M26.9258 36.293C26.9258 36.293 32.931 42.2366 31.5066 49.1705"
                stroke="#3636F0"
                stroke-width="1.94378"
                stroke-miterlimit="10"
                stroke-linecap="round"
              />
              <path
                d="M9.65581 25.7695C9.65581 25.7695 6.62243 28.1226 7.11702 32.6419"
                stroke="#3636F0"
                stroke-width="1.94378"
                stroke-miterlimit="10"
                stroke-linecap="round"
              />
              <path
                d="M6.74635 21.0625C6.74635 21.0625 1.48411 26.0148 2.04132 34.8687"
                stroke="#3636F0"
                stroke-width="1.94378"
                stroke-miterlimit="10"
                stroke-linecap="round"
              />
              <path
                d="M47.418 13.1406C47.418 13.1406 50.6371 14.7507 50.6986 19.5173"
                stroke="#3636F0"
                stroke-width="1.94378"
                stroke-miterlimit="10"
                stroke-linecap="round"
              />
              <path
                d="M49.7734 8C49.7734 8 55.2214 12.272 56.1501 20.7534"
                stroke="#3636F0"
                stroke-width="1.94378"
                stroke-miterlimit="10"
                stroke-linecap="round"
              />
              <path
                d="M58.9699 32.7854C58.9699 34.5036 57.8623 35.8242 55.4483 35.8242C53.6733 35.8242 52.4095 35.1142 51.6427 34.3758L52.7645 33.1546C53.5313 33.8078 54.3691 34.1912 55.4341 34.1912C56.8115 34.1912 57.1949 33.538 57.1949 32.9132C57.1949 30.5418 51.6711 31.9618 51.6711 28.426C51.6711 26.7646 52.8781 25.5718 55.1217 25.5718C56.6553 25.5718 57.9191 26.1398 58.8137 26.9066L57.7771 28.1988C56.8825 27.4746 56.0163 27.2048 55.1359 27.2048C53.9431 27.2048 53.4461 27.6876 53.4461 28.284C53.4461 30.2862 58.9699 28.9656 58.9699 32.7854ZM62.2972 31.124H65.8614C65.5632 30.4282 64.9242 30.0306 64.0722 30.0306C63.2344 30.0306 62.5954 30.4282 62.2972 31.124ZM64.0722 34.2338C64.7822 34.2338 65.336 33.964 65.6768 33.467H67.537C67.0684 34.9012 65.8046 35.7958 64.0864 35.7958C61.8854 35.7958 60.4086 34.319 60.4086 32.118C60.4086 29.9312 61.8854 28.4686 64.0864 28.4686C66.2874 28.4686 67.75 29.9312 67.75 32.118C67.75 32.3168 67.7358 32.5014 67.7216 32.686H62.1694C62.354 33.6658 63.064 34.2338 64.0722 34.2338ZM69.4008 35.668V25.728H71.1048V35.668H69.4008ZM76.403 28.4686C78.604 28.4686 80.0808 29.9454 80.0808 32.1464V35.668H78.3768V34.9864C78.036 35.4266 77.3118 35.7958 76.2752 35.7958C74.2162 35.7958 72.7394 34.319 72.7394 32.118C72.7394 29.9312 74.2162 28.4686 76.403 28.4686ZM78.3768 32.1322C78.3768 30.8116 77.5958 30.0306 76.4172 30.0306C75.2244 30.0306 74.4434 30.8116 74.4434 32.1322C74.4434 33.4528 75.2244 34.2338 76.4172 34.2338C77.5958 34.2338 78.3768 33.4528 78.3768 32.1322ZM85.192 28.4402C86.4274 28.4402 87.1658 28.9372 87.606 29.5762C88.0462 28.9372 88.7846 28.4402 90.02 28.4402C92.363 28.4402 93.286 30.201 93.286 31.4364V35.668H91.582V31.479C91.582 30.4708 90.8436 30.0164 90.02 30.0164C89.1964 30.0164 88.458 30.4708 88.458 31.479V35.668H86.754V31.479C86.754 30.4708 86.0156 30.0164 85.192 30.0164C84.3684 30.0164 83.63 30.4708 83.63 31.479V35.668H81.926V31.4364C81.926 30.201 82.849 28.4402 85.192 28.4402ZM100.709 35.668L96.918 28.8804V35.668H95.143V25.728H97.06L100.851 32.5156V25.728H102.626V35.668H100.709ZM106.167 31.124H109.731C109.433 30.4282 108.794 30.0306 107.942 30.0306C107.104 30.0306 106.465 30.4282 106.167 31.124ZM107.942 34.2338C108.652 34.2338 109.206 33.964 109.547 33.467H111.407C110.938 34.9012 109.674 35.7958 107.956 35.7958C105.755 35.7958 104.278 34.319 104.278 32.118C104.278 29.9312 105.755 28.4686 107.956 28.4686C110.157 28.4686 111.62 29.9312 111.62 32.118C111.62 32.3168 111.606 32.5014 111.591 32.686H106.039C106.224 33.6658 106.934 34.2338 107.942 34.2338ZM115.071 35.668L112.387 28.568H114.219L115.951 33.3818L117.684 28.568H119.515L118.99 29.9596L120.211 33.3818L121.944 28.568H123.775L121.092 35.668H119.331L118.081 32.3452L116.832 35.668H115.071ZM54.5688 49.668L51.4297 39.7252H53.262L55.4636 46.813L57.651 39.7252H59.4833L58.8584 41.6995L60.4492 46.813L62.6366 39.7252H64.4689L61.3299 49.668H59.5544L57.9493 44.5829L56.3443 49.668H54.5688ZM64.697 46.117C64.697 43.9296 66.1743 42.4666 68.3759 42.4666C70.5775 42.4666 72.0405 43.9296 72.0405 46.117C72.0405 48.3186 70.5775 49.7958 68.3759 49.7958C66.1743 49.7958 64.697 48.3186 64.697 46.117ZM66.4015 46.1312C66.4015 47.4521 67.1827 48.2334 68.3617 48.2334C69.5548 48.2334 70.336 47.4521 70.336 46.1312C70.336 44.8102 69.5548 44.029 68.3617 44.029C67.1827 44.029 66.4015 44.8102 66.4015 46.1312ZM73.6914 45.6909C73.6914 43.5318 75.055 42.4381 77.214 42.4381V44.0006C76.0777 44.0006 75.3959 44.5545 75.3959 45.6909V49.668H73.6914V45.6909ZM78.7973 49.668V39.7252H80.5018V46.9266L83.7119 42.566H85.743L83.1153 46.117L85.6862 49.668H83.6692L82.1068 47.4948L80.5018 49.668H78.7973ZM88.7124 44.4835C88.7124 45.5204 92.5759 44.867 92.5759 47.5232C92.5759 48.972 91.4253 49.7532 89.8061 49.7532C88.3005 49.7532 87.3346 49.0714 86.8943 48.6737L87.8033 47.3385C88.3999 47.9067 89.1527 48.1908 89.8487 48.1908C90.4311 48.1908 90.8714 47.9919 90.8714 47.58C90.8714 46.3584 87.0079 47.1113 87.0079 44.5119C87.0079 43.2052 87.988 42.4523 89.593 42.4523C90.9992 42.4523 91.9225 43.0205 92.5475 43.5318L91.6384 44.8528C90.8856 44.2278 90.147 44.0148 89.5646 44.0148C89.0107 44.0148 88.7124 44.1994 88.7124 44.4835ZM95.9293 52.5088H94.2248V46.1028C94.2248 43.8159 95.8583 42.4523 97.932 42.4523C100.091 42.4523 101.568 43.9154 101.568 46.1028C101.568 48.3044 100.091 49.7816 98.0173 49.7816C96.9946 49.7816 96.2702 49.4123 95.9293 48.972V52.5088ZM99.8638 46.117C99.8638 44.796 99.0826 44.0148 97.8894 44.0148C96.7105 44.0148 95.9293 44.796 95.9293 46.117C95.9293 47.4379 96.7105 48.2192 97.8894 48.2192C99.0826 48.2192 99.8638 47.4379 99.8638 46.117ZM106.804 42.4666C109.006 42.4666 110.483 43.9438 110.483 46.1454V49.668H108.779V48.9862C108.438 49.4265 107.714 49.7958 106.677 49.7958C104.617 49.7958 103.14 48.3186 103.14 46.117C103.14 43.9296 104.617 42.4666 106.804 42.4666ZM108.779 46.1312C108.779 44.8102 107.998 44.029 106.819 44.029C105.626 44.029 104.844 44.8102 104.844 46.1312C104.844 47.4521 105.626 48.2334 106.819 48.2334C107.998 48.2334 108.779 47.4521 108.779 46.1312ZM113.82 46.1312C113.82 47.4521 114.601 48.2334 115.78 48.2334C116.647 48.2334 117.286 47.8215 117.584 47.097H119.36C118.976 48.7447 117.655 49.7958 115.795 49.7958C113.593 49.7958 112.116 48.3186 112.116 46.117C112.116 43.9296 113.593 42.4666 115.795 42.4666C117.641 42.4666 118.976 43.5034 119.346 45.1227H117.57C117.272 44.4267 116.633 44.029 115.78 44.029C114.601 44.029 113.82 44.8102 113.82 46.1312ZM122.62 45.1227H126.186C125.887 44.4267 125.248 44.029 124.396 44.029C123.558 44.029 122.919 44.4267 122.62 45.1227ZM124.396 48.2334C125.106 48.2334 125.66 47.9635 126.001 47.4664H127.862C127.393 48.901 126.129 49.7958 124.41 49.7958C122.208 49.7958 120.731 48.3186 120.731 46.117C120.731 43.9296 122.208 42.4666 124.41 42.4666C126.612 42.4666 128.075 43.9296 128.075 46.117C128.075 46.3158 128.061 46.5005 128.046 46.6851H122.493C122.677 47.6652 123.387 48.2334 124.396 48.2334Z"
                fill="#111827"
              />
            </svg>
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
          <Button
            href="/dashboard"
            className="mt-12 flex justify-between items-center border-2 border-[#3636F0] px-4 py-5 mx-4 rounded-lg "
          >
            <div className="text-black font-bold font-['Manrope'] leading-normal">
              Dashboard
            </div>
            <AppstoreOutlined size={24} className="text-black" />
          </Button>
        )}

        <Menu
          mode="inline"
          defaultSelectedKeys={['/dashboard']}
          items={userRole === 'user' ? userItems : items}
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
            width: isMobile
              ? '100%'
              : collapsed
                ? 'calc(100% - 80px)'
                : 'calc(100% - 280px)',
            zIndex: 1000,
            top: 0,
            left: isMobile && mobileCollapsed ? 0 : collapsed ? 80 : 280,
            transition: 'left 0.3s ease, width 0.3s ease',
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

          <NavBar page="Home" handleLogout={handleLogout} />
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
