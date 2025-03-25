'use client';
import React, { ReactNode, useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  AppstoreOutlined,
  BarChartOutlined,
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
import { CiCalendar, CiSettings, CiStar } from 'react-icons/ci';
import { TbMessage2 } from 'react-icons/tb';
import { AiOutlineDollarCircle } from 'react-icons/ai';
import { CiBookmark } from 'react-icons/ci';
import { PiMoneyLight } from 'react-icons/pi';

import { PiSuitcaseSimpleThin } from 'react-icons/pi';
import { LuCircleDollarSign, LuUsers2 } from 'react-icons/lu';
import { removeCookie } from '@/helpers/storageHelper';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import Logo from '../common/logo';
import SimpleLogo from '../common/logo/simpleLogo';

const menuItems: MenuProps['items'] = [
  {
    key: '/organization',
    icon: <CiSettings />,
    label: 'Organization',
    className: 'font-bold',
    children: [
      { key: '/organization/chart', label: 'Org Structure', className: 'h-8' },
      { key: '/organization/settings', label: 'Settings', className: 'h-8' },
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
        label: 'Manage Employees',
        className: 'font-bold h-8',
      },
      {
        key: '/employees/departmentRequest',
        label: 'Department Request',
        className: 'font-bold h-8',
      },
      {
        key: '/employees/settings',
        label: 'Settings',
        className: 'font-bold h-8',
      },
    ],
  },
  {
    key: '/recruitment',
    icon: <PiSuitcaseSimpleThin />,
    className: 'font-bold',
    label: 'Talent Acquisition',
    children: [
      { key: '/recruitment/jobs', label: 'Jobs' },
      {
        key: '/recruitment/candidate',
        label: 'Candidates',
        className: 'h-8',
      },
      {
        key: '/recruitment/talent-pool',
        label: 'Talent Pool',
        className: 'h-8',
      },
      { key: '/recruitment/settings', label: 'Settings', className: 'h-8' },
    ],
  },
  {
    key: '/okr-planning',
    label: 'OKR',
    icon: <CiStar size={20} />,
    className: 'font-bold',
    children: [
      { key: '/okr/dashboard', label: 'Dashboard', className: 'font-bold h-8' },
      { key: '/okr', label: 'OKR', className: 'font-bold h-8' },
      {
        key: '/planning-and-reporting',
        label: 'Planning and Reporting',
        className: 'font-bold h-8',
      },
      {
        key: '/weekly-priority',
        label: 'Weekly Priority',
        className: 'font-bold',
      },
      {
        key: '/weekly-priority',
        label: 'Weekly Priority',
        className: 'font-bold',
      },
      // {
      //   key: '/monitoring-evaluation',
      //   label: 'Monitoring & Evaluation',
      //   className: 'font-bold',
      // },
      { key: '/okr/settings', label: 'Settings', className: 'font-bold h-8' },
    ],
  },
  {
    key: '/feedback',
    label: 'CFR',
    icon: <TbMessage2 />,
    className: 'font-bold',
    children: [
      {
        key: '/feedback/conversation',
        label: 'Conversation',
        className: 'font-bold h-8',
      },
      {
        key: '/feedback/feedback',
        label: 'Feedback',
        className: 'font-bold h-8',
      },
      {
        key: '/feedback/recognition',
        label: 'Recognition',
        className: 'font-bold h-8',
      },
      {
        key: '/feedback/categories',
        label: 'Form',
        className: 'font-bold h-8',
      },
      {
        key: '/feedback/settings',
        label: 'Settings',
        className: 'font-bold h-8',
      },
    ],
  },
  {
    key: '/tna',
    icon: <CiBookmark />,
    className: 'font-bold',
    label: 'Learning & Growth',
    children: [
      { key: '/tna/my-training', label: 'My-TNA', className: 'font-bold' },

      {
        key: '/tna/management',
        label: 'Training Management',
        className: 'font-bold h-8',
      },
      { key: '/tna/review', label: 'TNA', className: 'font-bold h-8' },
      {
        key: '/tna/settings/course-category',
        label: 'Settings',
        className: 'font-bold h-8',
      },
    ],
  },
  // payroll
  {
    key: '/payroll',
    icon: <AiOutlineDollarCircle />,
    className: 'font-bold',
    label: 'Payroll',
    children: [
      {
        key: '/employee-information',
        label: 'Employee Information',
        className: 'font-bold h-8',
      },
      { key: '/payroll', label: 'Payroll', className: 'font-bold h-8' },
      { key: '/myPayroll', label: 'My Payroll', className: 'font-bold h-8' },
      {
        key: '/settings',
        label: 'Settings',
        className: 'font-bold h-8',
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
        className: 'font-bold h08',
      },
      {
        key: '/timesheet/employee-attendance',
        label: 'Employee Attendance',
        className: 'font-bold h-8',
      },
      {
        key: '/timesheet/leave-management/leaves',
        label: 'Leave Management',
        className: 'font-bold h-8',
      },
      {
        key: '/timesheet/settings/closed-date',
        label: 'Settings',
        className: 'font-bold h-8',
      },
    ],
  },
  {
    key: '/compensation',
    icon: <PiMoneyLight />,
    className: 'font-bold',
    label: 'Compensation & Benefit',
    children: [
      {
        key: '/allowance',
        label: 'Allowance',
        className: 'font-bold h-8',
      },
      {
        key: '/benefit',
        label: 'Benefit',
        className: 'font-bold h-8',
      },
      {
        key: '/deduction',
        label: 'Deduction',
        className: 'font-bold h-8',
      },
      {
        key: '/compensationSetting',
        label: 'Settings',
        className: 'font-bold h-8',
      },
    ],
  },
  {
    key: '/incentive',
    icon: <LuCircleDollarSign />,
    className: 'font-bold',
    label: 'Incentive',
    children: [
      {
        key: '/incentive/incentivePage',
        label: 'Incentive',
        className: 'font-bold',
      },
      {
        key: '/variable-pay',
        label: 'Variable Pay',
        className: 'font-bold h-8',
      },
      {
        key: '/incentive/settings',
        label: 'Settings',
        className: 'font-bold',
      },
    ],
  },
];

const userItems: MenuProps['items'] = [
  {
    key: '/okr-planning',
    label: 'OKR',
    icon: <CiStar size={20} />,
    className: 'font-bold',
    children: [
      { key: '/okr/dashboard', label: 'Dashboard', className: 'font-bold h-8' },
      { key: '/okr', label: 'OKR', className: 'font-bold h-8' },
      {
        key: '/planning-and-reporting',
        label: 'Planning and Reporting',
        className: 'font-bold h-8',
      },
    ],
  },
  //   {
  //     key: '/feedback',
  //     label: 'CFR',
  //     icon: <UserOutlined />,
  //     className: 'font-bold',
  //     children: [
  //       {
  //         key: '/feedback/categories',
  //         label: 'Form',
  //         icon: <UserOutlined />,
  //         className: 'font-bold',
  //       },
  //     ],
  //   },
  {
    key: '/tna',
    icon: <BarChartOutlined />,
    className: 'font-bold',
    label: 'Learning & Growth',
    children: [
      {
        key: '/tna/management',
        label: 'Training Management',
        className: 'font-bold h-8',
      },
      // { key: '/tna/review', label: 'TNA', className: 'font-bold' },
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
        className: 'font-bold h-8',
      },
    ],
  },
  // {
  //   key: '/incentive',
  //   icon: <CiCalendar />,
  //   className: 'font-bold',
  //   label: 'Incentive',
  //   children: [
  //     {
  //       key: '/variable-pay',
  //       label: 'Variable Pay',
  //       className: 'font-bold',
  //     }

  //   ],
  // },
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
  const pathname = usePathname(); // Add this hook

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
        <div className="my-2">{collapsed && <SimpleLogo />}</div>

        <div className="flex justify-between px-4 my-4">
          <div className=" flex items-center gap-2">
            {!collapsed && <Logo type="selamnew" />}
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

        <div className="menu-with-lines">
          <Menu
            mode="inline"
            defaultSelectedKeys={['/dashboard']}
            items={userRole === 'user' ? userItems : menuItems}
            inlineCollapsed={collapsed}
            onClick={handleMenuClick}
            selectedKeys={[pathname]}
            className={`my-5 [&_.ant-menu-item-selected]:!bg-gray-200 [&_.ant-menu-item-selected]:!text-black h-96`}
          />
        </div>
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

          <NavBar page="" handleLogout={handleLogout} />
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
            className=" bg-white overflow-auto"
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
