'use client';
import React, { ReactNode, useState, useEffect } from 'react';
import '../../app/globals.css';
import { useRouter, usePathname } from 'next/navigation';
import { AppstoreOutlined, MenuOutlined } from '@ant-design/icons';
import {
  MdOutlineKeyboardDoubleArrowLeft,
  MdOutlineKeyboardDoubleArrowRight,
} from 'react-icons/md';
import { IoCloseOutline } from 'react-icons/io5';
import { Layout, Button, theme, Tree, Skeleton, Dropdown } from 'antd';

const { Header, Content, Sider } = Layout;
import NavBar from './topNavBar';
import { CiCalendar, CiSettings, CiStar } from 'react-icons/ci';
import { TbMessage2 } from 'react-icons/tb';
import { AiOutlineDollarCircle } from 'react-icons/ai';
import { CiBookmark } from 'react-icons/ci';
import { PiMoneyLight } from 'react-icons/pi';
import { PiSuitcaseSimpleThin } from 'react-icons/pi';
import { LuCircleDollarSign, LuUsers } from 'react-icons/lu';
import { removeCookie } from '@/helpers/storageHelper';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import Logo from '../common/logo';
import SimpleLogo from '../common/logo/simpleLogo';
import AccessGuard from '@/utils/permissionGuard';
import { useGetEmployee } from '@/store/server/features/employees/employeeManagment/queries';
import { useGetActiveFiscalYearsData } from '@/store/server/features/organizationStructure/fiscalYear/queries';

interface CustomMenuItem {
  key: string;
  icon?: React.ReactNode;
  title: React.ReactNode; // Changed from `label` to `title`
  className?: string;
  permissions?: string[];
  children?: CustomMenuItem[];
  disabled?: boolean;
}

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
  const pathname = usePathname();
  const { userId } = useAuthenticationStore();
  const { isLoading } = useGetEmployee(userId);
  const {
    setLocalId,
    setTenantId,
    setToken,
    setUserId,
    setError,
    setActiveCalendar,
    setLoggedUserRole,
    setUserData,
    setIs2FA,
    setTwoFactorAuthEmail,
    setUser2FA,
  } = useAuthenticationStore();
  const isAdminPage = pathname.startsWith('/admin');

  const [expandedKeys, setExpandedKeys] = useState<
    (string | number | bigint)[]
  >([]);
  const [selectedKeys, setSelectedKeys] = useState<
    (string | number | bigint)[]
  >([pathname]);

  // ===========> Fiscal Year Ended Section <=================

  const { token } = useAuthenticationStore();
  const { data: activeFiscalYear, refetch } = useGetActiveFiscalYearsData();

  useEffect(() => {
    refetch();
  }, [token]);

  const hasEndedFiscalYear =
    !!activeFiscalYear?.isActive &&
    !!activeFiscalYear?.endDate &&
    new Date(activeFiscalYear?.endDate) <= new Date();

  // ===========> Fiscal Year Ended Section <=================

  const treeData: CustomMenuItem[] = [
    {
      title: (
        <span className="flex items-center gap-2 h-12">
          <CiSettings
            size={18}
            className={expandedKeys.includes('/dashboard') ? 'text-blue' : ''}
          />
          <span>Dashboard</span>
        </span>
      ),
      key: '/dashboard',
      className: 'font-bold',
      permissions: [],
    },
    {
      title: (
        <span className="flex items-center gap-2 h-12">
          <CiSettings
            size={18}
            className={
              expandedKeys.includes('/organization') ? 'text-blue' : ''
            }
          />
          <span>Organization</span>
        </span>
      ),
      key: '/organization',
      className: 'font-bold',
      permissions: ['view_organization'],
      disabled: hasEndedFiscalYear,
      children: [
        {
          title: <span>Org Structure</span>,
          key: '/organization/chart',
          className: 'font-bold',
          permissions: ['view_organization_chart'],
          disabled: hasEndedFiscalYear,
        },
        {
          title: <span>Settings</span>,
          key: '/organization/settings',
          className: 'font-bold',
          permissions: ['view_organization_settings'],
        },
      ],
    },
    {
      title: (
        <span className="flex items-center gap-2 h-12">
          <LuUsers
            size={18}
            className={expandedKeys.includes('/employees') ? 'text-blue' : ''}
          />
          <span>Employees</span>
        </span>
      ),
      key: '/employees',
      className: 'font-bold',
      permissions: ['view_employees'],
      disabled: hasEndedFiscalYear,
      children: [
        {
          title: <span>Manage Employees</span>,
          key: '/employees/manage-employees',
          className: 'font-bold',
          permissions: ['manage_employees'],
        },
        {
          title: <span>Department Request</span>,
          key: '/employees/departmentRequest',
          className: 'font-bold',
          permissions: ['manage_department_requests'],
        },
        {
          title: <span>Settings</span>,
          key: '/employees/settings',
          className: 'font-bold',
          permissions: ['manage_employee_settings'],
        },
      ],
    },
    {
      title: (
        <span className="flex items-center gap-2 h-12">
          <PiSuitcaseSimpleThin
            size={18}
            className={expandedKeys.includes('/recruitment') ? 'text-blue' : ''}
          />
          <span>Talent Acquisition</span>
        </span>
      ),
      key: '/recruitment',
      className: 'font-bold',
      permissions: ['view_recruitment'],
      disabled: hasEndedFiscalYear,
      children: [
        {
          title: <span>Jobs</span>,
          key: '/recruitment/jobs',
          className: 'font-bold',
          permissions: ['manage_recruitment_jobs'],
        },
        {
          title: <span>Candidates</span>,
          key: '/recruitment/candidate',
          className: 'font-bold',
          permissions: ['manage_recruitment_candidates'],
        },
        {
          title: <span>Talent Pool</span>,
          key: '/recruitment/talent-pool',
          className: 'font-bold',
          permissions: ['manage_recruitment_talent_pool'],
        },
        {
          title: <span>Settings</span>,
          key: '/recruitment/settings',
          className: 'font-bold',
          permissions: ['manage_recruitment_settings'],
        },
      ],
    },
    {
      title: (
        <span className="flex items-center gap-2 h-12">
          <CiStar
            size={18}
            className={expandedKeys.includes('okr-menu') ? 'text-blue' : ''}
          />
          <span>OKR</span>
        </span>
      ),
      key: 'okr-menu',
      className: 'font-bold',
      permissions: ['view_okr'],
      disabled: hasEndedFiscalYear,
      children: [
        {
          title: <span>Dashboard</span>,
          key: '/okr/dashboard',
          className: 'font-bold',
          permissions: ['view_okr_dashboard'],
        },
        {
          title: <span>OKR</span>,
          key: '/okr',
          className: 'font-bold',
          permissions: ['view_okr_overview'],
        },
        {
          title: <span>Planning and Reporting</span>,
          key: '/planning-and-reporting',
          className: 'font-bold',
          permissions: ['manage_planning_reporting'],
        },
        {
          title: <span>Weekly Priority</span>,
          key: '/weekly-priority',
          className: 'font-bold h-8',
          permissions: ['view_weekly_priority'],
        },
        {
          title: <span>Settings</span>,
          key: '/okr/settings',
          className: 'font-bold',
          permissions: ['manage_okr_settings'],
        },
      ],
    },
    {
      title: (
        <span className="flex items-center gap-2 h-12">
          <TbMessage2
            size={18}
            className={
              expandedKeys.includes('feedback-menu') ? 'text-blue' : ''
            }
          />
          <span>CFR</span>
        </span>
      ),
      key: 'feedback-menu',
      className: 'font-bold',
      permissions: ['view_feedback'],
      disabled: hasEndedFiscalYear,
      children: [
        {
          title: <span>Conversation</span>,
          key: '/feedback/conversation',
          className: 'font-bold',
          permissions: ['view_feedback_conversation'],
        },
        {
          title: <span>Feedback</span>,
          key: '/feedback/feedback',
          className: 'font-bold',
          permissions: ['view_feedback_list'],
        },
        {
          title: <span>Recognition</span>,
          key: '/feedback/recognition',
          className: 'font-bold',
          permissions: ['view_feedback_recognition'],
        },
        {
          title: 'Settings',
          key: '/feedback/settings',
          className: 'font-bold',
          permissions: ['manage_feedback_settings'],
        },
      ],
    },
    {
      title: (
        <span className="flex items-center gap-2 h-12">
          <CiBookmark
            size={18}
            className={expandedKeys.includes('tna-menu') ? 'text-blue' : ''}
          />
          <span>Learning & Growth</span>
        </span>
      ),
      key: 'tna-menu',
      className: 'font-bold',
      permissions: ['view_learning_growth'],
      disabled: hasEndedFiscalYear,
      children: [
        {
          title: <span>My-TNA</span>,
          key: '/tna/my-training',
          className: 'font-bold',
          permissions: ['view_my_training'],
        },
        {
          title: <span>Training Management</span>,
          key: '/tna/management',
          className: 'font-bold',
          permissions: ['manage_training'],
        },
        {
          title: <span>TNA</span>,
          key: '/tna/review',
          className: 'font-bold',
          permissions: ['view_tna_review'],
        },
        {
          title: <span>Settings</span>,
          key: '/tna/settings/course-category',
          className: 'font-bold',
          permissions: ['manage_tna_settings'],
        },
      ],
    },
    {
      title: (
        <span className="flex items-center gap-2 h-12">
          <AiOutlineDollarCircle
            size={18}
            className={expandedKeys.includes('payroll-menu') ? 'text-blue' : ''}
          />
          <span>Payroll</span>
        </span>
      ),
      key: 'payroll-menu',
      className: 'font-bold',
      disabled: hasEndedFiscalYear,
      children: [
        {
          title: <span>Employee Information</span>,
          key: '/employee-information',
          className: 'font-bold',
          permissions: ['view_employee_information'],
        },
        {
          title: <span>Payroll</span>,
          key: '/payroll',
          className: 'font-bold',
          permissions: ['view_payroll_overview'],
        },
        {
          title: <span>My Payroll</span>,
          key: '/myPayroll',
          className: 'font-bold',
          permissions: ['view_my_payroll'],
        },
        {
          title: <span>Settings</span>,
          key: '/settings',
          className: 'font-bold',
          permissions: ['manage_payroll_settings'],
        },
      ],
    },
    {
      title: (
        <span className="flex items-center gap-2 h-12">
          <CiCalendar
            size={18}
            className={
              expandedKeys.includes('timesheet-menu') ? 'text-blue' : ''
            }
          />
          <span>Time & Attendance</span>
        </span>
      ),
      key: 'timesheet-menu',
      className: 'font-bold',
      permissions: ['view_timesheet'],
      disabled: hasEndedFiscalYear,
      children: [
        {
          title: <span>My Timesheet</span>,
          key: '/timesheet/my-timesheet',
          className: 'font-bold',
          permissions: ['view_my_timesheet'],
        },
        {
          title: <span>Employee Attendance</span>,
          key: '/timesheet/employee-attendance',
          className: 'font-bold',
          permissions: ['view_employee_attendance'],
        },
        {
          title: <span>Leave Management</span>,
          key: '/timesheet/leave-management/leaves',
          className: 'font-bold',
          permissions: ['manage_leave_management'],
        },
        {
          title: <span>Settings</span>,
          key: '/timesheet/settings/closed-date',
          className: 'font-bold',
          permissions: ['manage_timesheet_settings'],
        },
      ],
    },
    {
      title: (
        <span className="flex items-center gap-2 h-12">
          <PiMoneyLight
            size={18}
            className={
              expandedKeys.includes('compensation-menu') ? 'text-blue' : ''
            }
          />
          <span>Compensation & Benefit</span>
        </span>
      ),
      key: 'compensation-menu',
      className: 'font-bold',
      permissions: ['view_compensation'],
      disabled: hasEndedFiscalYear,
      children: [
        {
          title: <span>Allowance</span>,
          key: '/allowance',
          className: 'font-bold',
          permissions: ['view_allowance'],
        },
        {
          title: <span>Benefit</span>,
          key: '/benefit',
          className: 'font-bold',
          permissions: ['view_benefit'],
        },
        {
          title: <span>Deduction</span>,
          key: '/deduction',
          className: 'font-bold',
          permissions: ['view_deduction'],
        },
        {
          title: <span>Settings</span>,
          key: '/compensationSetting',
          className: 'font-bold',
          permissions: ['manage_compensation_settings'],
        },
      ],
    },
    {
      title: (
        <span className="flex items-center gap-2 h-12">
          <LuCircleDollarSign
            size={18}
            className={
              expandedKeys.includes('incentive-menu') ? 'text-blue' : ''
            }
          />
          <span>Incentives</span>
        </span>
      ),
      key: 'incentive-menu',
      className: 'font-bold',
      permissions: ['view_incentive'],
      disabled: hasEndedFiscalYear,
      children: [
        {
          title: <span>Incentive</span>,
          key: '/incentives',
          className: 'font-bold',
          permissions: ['view_incentive_page'],
        },
        {
          title: <span>Variable Pay</span>,
          key: '/variable-pay',
          className: 'font-bold',
          permissions: ['view_variable_pay'],
        },
        {
          title: <span>Settings</span>,
          key: '/incentives/settings',
          className: 'font-bold',
          permissions: ['manage_incentive_settings'],
        },
      ],
    },
    {
      title: (
        <span className="flex items-center gap-2 h-12">
          <CiSettings size={18} />
          <span>Admin</span>
        </span>
      ),
      key: 'admin-menu',
      className: 'font-bold',
      permissions: ['view_admin_configuration'],
      disabled: hasEndedFiscalYear,
      children: [
        {
          title: <span>Dashboard</span>,
          key: '/admin/dashboard',
          className: 'font-bold',
          permissions: ['view_admin_dashboard'],
        },
        {
          title: <span>Billing and Invoice</span>,
          key: '/admin/billing',
          className: 'font-bold',
          permissions: ['view_admin_billing'],
        },
        {
          title: <span>Update Profile</span>,
          key: '/admin/profile',
          className: 'font-bold',
          permissions: ['view_admin_profile'],
        },
      ],
    },
  ];

  const handleSelect = (keys: (string | number | bigint)[], info: any) => {
    const selectedKey = info?.node?.key;
    if (!selectedKey) return;

    if (info.node.children) {
      setExpandedKeys((prev) =>
        prev.includes(selectedKey)
          ? prev.filter((key) => key !== selectedKey)
          : [...prev, selectedKey],
      );
      return;
    }

    const path = String(selectedKey);
    if (pathname !== path) {
      router.push(path);
      setSelectedKeys([selectedKey]);
    }
  };

  const handleDoubleClick = (event: React.MouseEvent, node: any) => {
    const key = node?.key;
    if (!node.children && key) {
      router.push(String(key));
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

  const handleLogout = async () => {
    try {
      // First step: clear all state that might trigger queries
      setUserData({});
      setLoggedUserRole('');
      setActiveCalendar('');
      setUserId('');
      setError('');
      setIs2FA(false);
      setTwoFactorAuthEmail('');
      setLocalId('');
      setTenantId('');
      setToken('');
      setUser2FA({ email: '', pass: '', recaptchaToken: '' });

      // Then remove cookies
      removeCookie('token');
      removeCookie('tenantId');
      removeCookie('activeCalendar');
      removeCookie('loggedUserRole');

      // Finally clear the remaining state
      setToken('');
      setTenantId('');
      setLocalId('');

      router.push('/authentication/login');
    } catch (error) {}
  };

  const filteredMenuItems = treeData
    .map((item) => {
      const hasAccess = AccessGuard.checkAccess({
        permissions: item.permissions,
      });

      if (!hasAccess) return null;

      return {
        ...item,
        children: item.children
          ? item.children.filter((child) =>
              AccessGuard.checkAccess({
                permissions: child.permissions,
              }),
            )
          : [],
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  const getResponsiveTreeData = (
    data: CustomMenuItem[],
    collapsed: boolean,
  ): CustomMenuItem[] => {
    return data.map((item) => {
      const renderSubMenu = (children: CustomMenuItem[]) => {
        return (
          <div className="bg-white rounded-lg shadow-lg p-2 min-w-[200px] ml-12">
            {children.map((child) => (
              <div
                key={child.key}
                className={`px-4 py-2 hover:bg-gray-100 rounded cursor-pointer ${
                  selectedKeys.includes(child.key) ? 'bg-gray-100' : ''
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  const path = String(child.key);
                  if (pathname !== path) {
                    router.push(path);
                  }
                  setSelectedKeys([child.key]);
                }}
              >
                {child.title}
              </div>
            ))}
          </div>
        );
      };

      const renderTitle = () => {
        if (React.isValidElement(item.title)) {
          const icon = (item.title.props as { children?: React.ReactNode[] })
            ?.children?.[0];
          return (
            <div className="flex items-center justify-center w-full">
              {icon}
            </div>
          );
        }
        return null;
      };

      return {
        ...item,
        title: collapsed ? (
          item.children ? (
            <Dropdown
              overlay={renderSubMenu(item.children)}
              trigger={['click']}
              placement="bottomRight"
            >
              <div
                className="flex items-center justify-center w-full cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setExpandedKeys((prev) =>
                    prev.includes(item.key)
                      ? prev.filter((key) => key !== item.key)
                      : [...prev, item.key],
                  );
                }}
              >
                {renderTitle()}
              </div>
            </Dropdown>
          ) : (
            renderTitle()
          )
        ) : (
          item.title
        ),
        children: collapsed ? undefined : item.children,
        className: `${item.className} ${collapsed ? 'mobile-item' : ''}`,
      };
    });
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
          overflowX: 'hidden',
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
          <div className="absolute left-4 top-0 w-[10px] h-full bg-white z-10"></div>
          {isLoading ? (
            <div className="px-5 w-full h-full flex justify-center items-center my-5">
              <Skeleton active />{' '}
            </div>
          ) : (
            <Tree
              treeData={getResponsiveTreeData(filteredMenuItems, collapsed)}
              showLine={{ showLeafIcon: false }}
              defaultExpandAll={false}
              expandedKeys={expandedKeys}
              selectedKeys={selectedKeys}
              onSelect={handleSelect}
              onDoubleClick={handleDoubleClick}
              className="my-5 [&_.ant-tree-node-selected]:!text-black h-full w-full [&_.ant-tree-list-holder-inner]:!bg-white [&_.ant-tree-list-holder-inner]:!rounded-lg [&_.ant-tree-list-holder-inner]: [&_.ant-tree-list-holder-inner]:!p-2 [&_.ant-tree-list-holder-inner]:!mt-2"
              switcherIcon={null}
            />
          )}
        </div>
      </Sider>
      <Layout
        style={{
          marginLeft: isMobile ? 2 : collapsed ? 10 : 20,
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
            boxShadow: isMobile ? 'none' : '0 2px 8px rgba(0, 0, 0, 0.15)', // Adjust shadow as needed
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
            paddingInline: isMobile ? 8 : 24,
            paddingLeft: isMobile ? 0 : collapsed ? 5 : 280,
            transition: 'padding-left 0.3s ease',
          }}
        >
          <div
            className={`overflow-auto ${!isAdminPage ? 'bg-white' : ''}`}
            style={{
              borderRadius: borderRadiusLG,
              marginTop: '94px',
              marginRight: `${isMobile ? 0 : !isAdminPage ? '0px' : ''}`,
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
