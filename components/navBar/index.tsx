'use client';
import React, { ReactNode, useState, useEffect } from 'react';
import '../../app/globals.css';
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
import { Layout, Button, theme, Tree } from 'antd';

const { Header, Content, Sider } = Layout;
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

const treeData = [
  {
    title: (
      <span className="flex items-center gap-2 h-12 w-60">
        <CiSettings size={18} /> Organization
      </span>
    ),
    key: '/organization',
    className: 'font-bold',
    children: [
      {
        title: 'Org Structure',
        key: '/organization/chart',
        className: 'font-bold h-9',
      },
      {
        title: 'Settings',
        key: '/organization/settings',
        className: 'font-bold h-9',
      },
    ],
  },
  {
    title: (
      <span className="flex items-center gap-2 h-12 w-60">
        <LuUsers2 size={18} /> Employees
      </span>
    ),
    key: '/employees',
    className: 'font-bold',
    children: [
      {
        title: 'Manage Employees',
        key: '/employees/manage-employees',
        className: 'font-bold h-9',
      },
      {
        title: 'Department Request',
        key: '/employees/departmentRequest',
        className: 'font-bold h-9',
      },
      {
        title: 'Settings',
        key: '/employees/settings',
        className: 'font-bold h-9',
      },
    ],
  },
  {
    title: (
      <span className="flex items-center gap-2 h-12 w-60">
        <PiSuitcaseSimpleThin size={18} /> Talent Acquisition
      </span>
    ),
    key: '/recruitment',
    className: 'font-bold',
    children: [
      { title: 'Jobs', key: '/recruitment/jobs', className: 'font-bold h-9' },
      {
        title: 'Candidates',
        key: '/recruitment/candidate',
        className: 'font-bold h-9',
      },
      {
        title: 'Talent Pool',
        key: '/recruitment/talent-pool',
        className: 'font-bold h-9',
      },
      {
        title: 'Settings',
        key: '/recruitment/settings',
        className: 'font-bold h-9',
      },
    ],
  },
  {
    title: (
      <span className="flex items-center gap-2 h-12 w-60">
        <CiStar size={18} /> OKR
      </span>
    ),
    key: '/okr-planning',
    className: 'font-bold',
    children: [
      { title: 'Dashboard', key: '/okr/dashboard', className: 'font-bold h-9' },
      { title: 'OKR', key: '/okr', className: 'font-bold h-8' },
      {
        title: 'Planning and Reporting',
        key: '/planning-and-reporting',
        className: 'font-bold h-8',
      },
      { title: 'Settings', key: '/okr/settings', className: 'font-bold h-9' },
    ],
  },
  {
    title: (
      <span className="flex items-center gap-2 h-12 w-60">
        <TbMessage2 size={18} /> CFR
      </span>
    ),
    key: '/feedback',
    className: 'font-bold',
    children: [
      {
        title: 'Conversation',
        key: '/feedback/conversation',
        className: 'font-bold h-9',
      },
      {
        title: 'Feedback',
        key: '/feedback/feedback',
        className: 'font-bold h-9',
      },
      {
        title: 'Recognition',
        key: '/feedback/recognition',
        className: 'font-bold h-9',
      },
      {
        title: 'Form',
        key: '/feedback/categories',
        className: 'font-bold h-9',
      },
      {
        title: 'Settings',
        key: '/feedback/settings',
        className: 'font-bold h-9',
      },
    ],
  },
  {
    title: (
      <span className="flex items-center gap-2 h-12 w-60">
        <CiBookmark size={18} /> Learning & Growth
      </span>
    ),
    key: '/tna',
    className: 'font-bold',
    children: [
      { title: 'My-TNA', key: '/tna/my-training', className: 'font-bold h-9' },
      {
        title: 'Training Management',
        key: '/tna/management',
        className: 'font-bold h-9',
      },
      { title: 'TNA', key: '/tna/review', className: 'font-bold h-9' },
      {
        title: 'Settings',
        key: '/tna/settings/course-category',
        className: 'font-bold h-9',
      },
    ],
  },
  {
    title: (
      <span className="flex items-center gap-2 h-12 w-60">
        <AiOutlineDollarCircle size={18} /> Payroll
      </span>
    ),
    key: 'payroll',
    className: 'font-bold',
    children: [
      {
        title: 'Employee Information',
        key: '/employee-information',
        className: 'font-bold h-9',
      },
      { title: 'Payroll', key: '/payroll', className: 'font-bold h-9' },
      { title: 'My Payroll', key: '/myPayroll', className: 'font-bold h-9' },
      { title: 'Settings', key: '/settings', className: 'font-bold h-9' },
    ],
  },
  {
    title: (
      <span className="flex items-center gap-2 h-12 w-60">
        <CiCalendar size={18} /> Time & Attendance
      </span>
    ),
    key: '/timesheet',
    className: 'font-bold',
    children: [
      {
        title: 'My Timesheet',
        key: '/timesheet/my-timesheet',
        className: 'font-bold h-9',
      },
      {
        title: 'Employee Attendance',
        key: '/timesheet/employee-attendance',
        className: 'font-bold h-9',
      },
      {
        title: 'Leave Management',
        key: '/timesheet/leave-management/leaves',
        className: 'font-bold h-9',
      },
      {
        title: 'Settings',
        key: '/timesheet/settings/closed-date',
        className: 'font-bold h-9',
      },
    ],
  },
  {
    title: (
      <span className="flex items-center gap-2 h-12 w-60">
        <PiMoneyLight size={18} /> Compensation & Benefit
      </span>
    ),
    key: '/compensation',
    className: 'font-bold',
    children: [
      { title: 'Allowance', key: '/allowance', className: 'font-bold h-9' },
      { title: 'Benefit', key: '/benefit', className: 'font-bold h-9' },
      { title: 'Deduction', key: '/deduction', className: 'font-bold h-9' },
      {
        title: 'Settings',
        key: '/compensationSetting',
        className: 'font-bold h-9',
      },
    ],
  },
  {
    title: (
      <span className="flex items-center gap-2 h-12 w-60">
        <LuCircleDollarSign size={18} /> Incentive
      </span>
    ),
    key: '/incentive',
    className: 'font-bold',
    children: [
      {
        title: 'Incentive',
        key: '/incentive/incentivePage',
        className: 'font-bold h-9',
      },
      {
        title: 'Variable Pay',
        key: '/variable-pay',
        className: 'font-bold h-9',
      },
      {
        title: 'Settings',
        key: '/incentive/settings',
        className: 'font-bold h-9',
      },
    ],
  },
];

const userItems = [
  {
    title: (
      <span className="flex items-center gap-2 h-12 w-60">
        <CiStar size={20} /> OKR
      </span>
    ),
    key: '/okr-planning',
    className: 'font-bold',
    children: [
      { title: 'Dashboard', key: '/okr/dashboard', className: 'font-bold h-9' },
      { title: 'OKR', key: '/okr', className: 'font-bold h-9' },
      {
        title: 'Planning and Reporting',
        key: '/planning-and-reporting',
        className: 'font-bold h-9',
      },
    ],
  },

  {
    title: (
      <span className="flex items-center gap-2 h-12 w-60">
        <BarChartOutlined /> Learning & Growth
      </span>
    ),
    key: '/tna',
    className: 'font-bold',
    children: [
      {
        title: 'Training Management',
        key: '/tna/management',
        className: 'font-bold h-9',
      },
    ],
  },
  {
    title: (
      <span className="flex items-center gap-2 h-12 w-60">
        <CiCalendar /> Time & Attendance
      </span>
    ),
    key: '/timesheet',
    className: 'font-bold',
    children: [
      {
        title: 'My timesheet',
        key: '/timesheet/my-timesheet',
        className: 'font-bold h-9',
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
  const pathname = usePathname(); // Add this hook
  const { userData, setLocalId, setTenantId, setToken, setUserId, setError } =
    useAuthenticationStore();
  const userRole = userData?.role?.slug || '';
  // const { pathname } = router;
  const [expandedKeys, setExpandedKeys] = useState<
    (string | number | bigint)[]
  >([]); // Include bigint
  const [selectedKeys, setSelectedKeys] = useState<
    (string | number | bigint)[]
  >([pathname]); // Include bigint

  const handleSelect = (keys: (string | number | bigint)[], info: any) => {
    // Include bigint
    const selectedKey = keys[0]; // Now using (string | number | bigint)

    if (info.node.children) {
      // If it's a parent, toggle expand/collapse
      setExpandedKeys((prev) =>
        prev.includes(selectedKey)
          ? prev.filter((key) => key !== selectedKey)
          : [...prev, selectedKey],
      );
    } else {
      // If it's a child, navigate
      router.push(selectedKey + '');
      setSelectedKeys(keys); // Update the selected key for navigation
    }
  };

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

        <div className="relative">
          <div className="absolute left-2 top-0 w-[10px] h-full bg-white z-10"></div>
          <Tree
            treeData={userRole === 'user' ? userItems : treeData}
            showLine={{ showLeafIcon: false }} // Only show lines for child nodes
            defaultExpandAll={false}
            expandedKeys={expandedKeys}
            selectedKeys={selectedKeys}
            onSelect={handleSelect}
            className="my-5 [&_.ant-tree-node-selected]:!bg-gray-200 [&_.ant-tree-node-selected]:!text-black h-full w-full"
            switcherIcon={null}
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
