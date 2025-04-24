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
import { Layout, Button, theme, Tree, Skeleton, Tooltip } from 'antd';

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
import AccessGuard from '@/utils/permissionGuard';
import { useGetEmployee } from '@/store/server/features/employees/employeeManagment/queries';

interface CustomMenuItem {
  key: string;
  icon?: React.ReactNode;
  title: React.ReactNode; // Changed from `label` to `title`
  className?: string;
  permissions?: string[];
  children?: CustomMenuItem[];
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
  const { setLocalId, setTenantId, setToken, setUserId, setError } =
    useAuthenticationStore();
  const isAdminPage = pathname.startsWith('/admin');

  const [expandedKeys, setExpandedKeys] = useState<
    (string | number | bigint)[]
  >([]);
  const [selectedKeys, setSelectedKeys] = useState<
    (string | number | bigint)[]
  >([pathname]);

  const treeData: CustomMenuItem[] = [
    {
      title: (
        <span className="flex items-center gap-2 h-12">
          <CiSettings
            size={18}
            className={
              expandedKeys.includes('/organization') ? 'text-blue' : ''
            }
          />
          <span className={`${collapsed ? 'hidden' : 'block'}`}>
            Organization
          </span>
        </span>
      ),
      key: '/organization',
      className: 'font-bold',
      permissions: ['view_organization'],
      children: [
        {
          title: (
            <span className="flex items-center gap-2 h-9">
              <CiSettings size={16} />
              <span className={`${collapsed ? 'hidden' : 'block'}`}>
                Org Structure
              </span>
            </span>
          ),
          key: '/organization/chart',
          className: 'font-bold',
          permissions: ['view_organization_chart'],
        },
        {
          title: (
            <span className="flex items-center gap-2 h-9">
              <CiSettings size={16} />
              <span className={`${collapsed ? 'hidden' : 'block'}`}>
                Settings
              </span>
            </span>
          ),
          key: '/organization/settings',
          className: 'font-bold',
          permissions: ['view_organization_settings'],
        },
      ],
    },
    {
      title: (
        <span className="flex items-center gap-2 h-12">
          <LuUsers2
            size={18}
            className={expandedKeys.includes('/employees') ? 'text-blue' : ''}
          />
          <span className={`${collapsed ? 'hidden' : 'block'}`}>Employees</span>
        </span>
      ),
      key: '/employees',
      className: 'font-bold',
      permissions: ['view_employees'],
      children: [
        {
          title: (
            <span className="flex items-center gap-2 h-9">
              <LuUsers2 size={16} />
              <span className={`${collapsed ? 'hidden' : 'block'}`}>
                Manage Employees
              </span>
            </span>
          ),
          key: '/employees/manage-employees',
          className: 'font-bold',
          permissions: ['manage_employees'],
        },
        {
          title: (
            <span className="flex items-center gap-2 h-9">
              <CiSettings size={16} />
              <span className={`${collapsed ? 'hidden' : 'block'}`}>
                Department Request
              </span>
            </span>
          ),
          key: '/employees/departmentRequest',
          className: 'font-bold',
          permissions: ['manage_department_requests'],
        },
        {
          title: (
            <span className="flex items-center gap-2 h-9">
              <CiSettings size={16} />
              <span className={`${collapsed ? 'hidden' : 'block'}`}>
                Settings
              </span>
            </span>
          ),
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
          <span className={`${collapsed ? 'hidden' : 'block'}`}>
            Talent Acquisition
          </span>
        </span>
      ),
      key: '/recruitment',
      className: 'font-bold',
      permissions: ['view_recruitment'],
      children: [
        {
          title: (
            <span className="flex items-center gap-2 h-9">
              <CiSettings size={16} />
              <span className={`${collapsed ? 'hidden' : 'block'}`}>Jobs</span>
            </span>
          ),
          key: '/recruitment/jobs',
          className: 'font-bold',
          permissions: ['manage_recruitment_jobs'],
        },
        {
          title: (
            <span className="flex items-center gap-2 h-9">
              <CiSettings size={16} />
              <span className={`${collapsed ? 'hidden' : 'block'}`}>
                Candidates
              </span>
            </span>
          ),
          key: '/recruitment/candidate',
          className: 'font-bold',
          permissions: ['manage_recruitment_candidates'],
        },
        {
          title: (
            <span className="flex items-center gap-2 h-9">
              <CiSettings size={16} />
              <span className={`${collapsed ? 'hidden' : 'block'}`}>
                Talent Pool
              </span>
            </span>
          ),
          key: '/recruitment/talent-pool',
          className: 'font-bold',
          permissions: ['manage_recruitment_talent_pool'],
        },
        {
          title: (
            <span className="flex items-center gap-2 h-9">
              <CiSettings size={16} />
              <span className={`${collapsed ? 'hidden' : 'block'}`}>
                Settings
              </span>
            </span>
          ),
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
            className={
              expandedKeys.includes('/okr-planning') ? 'text-blue' : ''
            }
          />
          <span className={`${collapsed ? 'hidden' : 'block'}`}>OKR</span>
        </span>
      ),
      key: '/okr-planning',
      className: 'font-bold',
      permissions: ['view_okr'],
      children: [
        {
          title: (
            <span className="flex items-center gap-2 h-9">
              <CiSettings size={16} />
              <span className={`${collapsed ? 'hidden' : 'block'}`}>
                Dashboard
              </span>
            </span>
          ),
          key: '/okr/dashboard',
          className: 'font-bold',
          permissions: ['view_okr_dashboard'],
        },
        {
          title: (
            <span className="flex items-center gap-2 h-9">
              <CiSettings size={16} />
              <span className={`${collapsed ? 'hidden' : 'block'}`}>OKR</span>
            </span>
          ),
          key: '/okr',
          className: 'font-bold',
          permissions: ['view_okr_overview'],
        },
        {
          title: (
            <span className="flex items-center gap-2 h-9">
              <CiSettings size={16} />
              <span className={`${collapsed ? 'hidden' : 'block'}`}>
                Planning and Reporting
              </span>
            </span>
          ),
          key: '/planning-and-reporting',
          className: 'font-bold',
          permissions: ['manage_planning_reporting'],
        },
        {
          title: 'Weekly Priority',
          key: '/weekly-priority',
          className: 'font-bold h-8',
          permissions: ['view_weekly_priority'],
        },
        {
          title: (
            <span className="flex items-center gap-2 h-9">
              <CiSettings size={16} />
              <span className={`${collapsed ? 'hidden' : 'block'}`}>
                Settings
              </span>
            </span>
          ),
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
            className={expandedKeys.includes('/feedback') ? 'text-blue' : ''}
          />
          <span className={`${collapsed ? 'hidden' : 'block'}`}>CFR</span>
        </span>
      ),
      key: '/feedback',
      className: 'font-bold',
      permissions: ['view_feedback'],
      children: [
        {
          title: (
            <span className="flex items-center gap-2 h-9">
              <CiSettings size={16} />
              <span className={`${collapsed ? 'hidden' : 'block'}`}>
                Conversation
              </span>
            </span>
          ),
          key: '/feedback/conversation',
          className: 'font-bold',
          permissions: ['view_feedback_conversation'],
        },
        {
          title: (
            <span className="flex items-center gap-2 h-9">
              <CiSettings size={16} />
              <span className={`${collapsed ? 'hidden' : 'block'}`}>
                Feedback
              </span>
            </span>
          ),
          key: '/feedback/feedback',
          className: 'font-bold',
          permissions: ['view_feedback_list'],
        },
        {
          title: (
            <span className="flex items-center gap-2 h-9">
              <CiSettings size={16} />
              <span className={`${collapsed ? 'hidden' : 'block'}`}>
                Recognition
              </span>
            </span>
          ),
          key: '/feedback/recognition',
          className: 'font-bold',
          permissions: ['view_feedback_recognition'],
        },
        {
          title: (
            <span className="flex items-center gap-2 h-9">
              <CiSettings size={16} />
              <span className={`${collapsed ? 'hidden' : 'block'}`}>
                Settings
              </span>
            </span>
          ),
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
            className={expandedKeys.includes('/tna') ? 'text-blue' : ''}
          />
          <span className={`${collapsed ? 'hidden' : 'block'}`}>
            Learning & Growth
          </span>
        </span>
      ),
      key: '/tna',
      className: 'font-bold',
      permissions: ['view_learning_growth'],
      children: [
        {
          title: (
            <span className="flex items-center gap-2 h-9">
              <CiSettings size={16} />
              <span className={`${collapsed ? 'hidden' : 'block'}`}>
                My-TNA
              </span>
            </span>
          ),
          key: '/tna/my-training',
          className: 'font-bold',
          permissions: ['view_my_training'],
        },
        {
          title: (
            <span className="flex items-center gap-2 h-9">
              <CiSettings size={16} />
              <span className={`${collapsed ? 'hidden' : 'block'}`}>
                Training Management
              </span>
            </span>
          ),
          key: '/tna/management',
          className: 'font-bold',
          permissions: ['manage_training'],
        },
        {
          title: (
            <span className="flex items-center gap-2 h-9">
              <CiSettings size={16} />
              <span className={`${collapsed ? 'hidden' : 'block'}`}>TNA</span>
            </span>
          ),
          key: '/tna/review',
          className: 'font-bold',
          permissions: ['view_tna_review'],
        },
        {
          title: (
            <span className="flex items-center gap-2 h-9">
              <CiSettings size={16} />
              <span className={`${collapsed ? 'hidden' : 'block'}`}>
                Settings
              </span>
            </span>
          ),
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
            className={expandedKeys.includes('/payroll') ? 'text-blue' : ''}
          />
          <span className={`${collapsed ? 'hidden' : 'block'}`}>Payroll</span>
        </span>
      ),
      key: 'payroll',
      className: 'font-bold',
      children: [
        {
          title: (
            <span className="flex items-center gap-2 h-9">
              <CiSettings size={16} />
              <span className={`${collapsed ? 'hidden' : 'block'}`}>
                Employee Information
              </span>
            </span>
          ),
          key: '/employee-information',
          className: 'font-bold',
          permissions: ['view_employee_information'],
        },
        {
          title: (
            <span className="flex items-center gap-2 h-9">
              <CiSettings size={16} />
              <span className={`${collapsed ? 'hidden' : 'block'}`}>
                Payroll
              </span>
            </span>
          ),
          key: '/payroll',
          className: 'font-bold',
          permissions: ['view_payroll_overview'],
        },
        {
          title: (
            <span className="flex items-center gap-2 h-9">
              <CiSettings size={16} />
              <span className={`${collapsed ? 'hidden' : 'block'}`}>
                My Payroll
              </span>
            </span>
          ),
          key: '/myPayroll',
          className: 'font-bold',
          permissions: ['view_my_payroll'],
        },
        {
          title: (
            <span className="flex items-center gap-2 h-9">
              <CiSettings size={16} />
              <span className={`${collapsed ? 'hidden' : 'block'}`}>
                Settings
              </span>
            </span>
          ),
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
            className={expandedKeys.includes('/timesheet') ? 'text-blue' : ''}
          />
          <span className={`${collapsed ? 'hidden' : 'block'}`}>
            Time & Attendance
          </span>
        </span>
      ),
      key: '/timesheet',
      className: 'font-bold',
      permissions: ['view_timesheet'],
      children: [
        {
          title: (
            <span className="flex items-center gap-2 h-9">
              <CiSettings size={16} />
              <span className={`${collapsed ? 'hidden' : 'block'}`}>
                My Timesheet
              </span>
            </span>
          ),
          key: '/timesheet/my-timesheet',
          className: 'font-bold',
          permissions: ['view_my_timesheet'],
        },
        {
          title: (
            <span className="flex items-center gap-2 h-9">
              <CiSettings size={16} />
              <span className={`${collapsed ? 'hidden' : 'block'}`}>
                Employee Attendance
              </span>
            </span>
          ),
          key: '/timesheet/employee-attendance',
          className: 'font-bold',
          permissions: ['view_employee_attendance'],
        },
        {
          title: (
            <span className="flex items-center gap-2 h-9">
              <CiSettings size={16} />
              <span className={`${collapsed ? 'hidden' : 'block'}`}>
                Leave Management
              </span>
            </span>
          ),
          key: '/timesheet/leave-management/leaves',
          className: 'font-bold',
          permissions: ['manage_leave_management'],
        },
        {
          title: (
            <span className="flex items-center gap-2 h-9">
              <CiSettings size={16} />
              <span className={`${collapsed ? 'hidden' : 'block'}`}>
                Settings
              </span>
            </span>
          ),
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
              expandedKeys.includes('/compensation') ? 'text-blue' : ''
            }
          />
          <span className={`${collapsed ? 'hidden' : 'block'}`}>
            Compensation & Benefit
          </span>
        </span>
      ),
      key: '/compensation',
      className: 'font-bold',
      permissions: ['view_compensation'],
      children: [
        {
          title: (
            <span className="flex items-center gap-2 h-9">
              <CiSettings size={16} />
              <span className={`${collapsed ? 'hidden' : 'block'}`}>
                Allowance
              </span>
            </span>
          ),
          key: '/allowance',
          className: 'font-bold',
          permissions: ['view_allowance'],
        },
        {
          title: (
            <span className="flex items-center gap-2 h-9">
              <CiSettings size={16} />
              <span className={`${collapsed ? 'hidden' : 'block'}`}>
                Benefit
              </span>
            </span>
          ),
          key: '/benefit',
          className: 'font-bold',
          permissions: ['view_benefit'],
        },
        {
          title: (
            <span className="flex items-center gap-2 h-9">
              <CiSettings size={16} />
              <span className={`${collapsed ? 'hidden' : 'block'}`}>
                Deduction
              </span>
            </span>
          ),
          key: '/deduction',
          className: 'font-bold',
          permissions: ['view_deduction'],
        },
        {
          title: (
            <span className="flex items-center gap-2 h-9">
              <CiSettings size={16} />
              <span className={`${collapsed ? 'hidden' : 'block'}`}>
                Settings
              </span>
            </span>
          ),
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
            className={expandedKeys.includes('/incentive') ? 'text-blue' : ''}
          />
          <span className={`${collapsed ? 'hidden' : 'block'}`}>
            Incentives
          </span>
        </span>
      ),
      key: '/incentive',
      className: 'font-bold',
      permissions: ['view_incentive'],
      children: [
        {
          key: '/incentives',
          title: (
            <span className="flex items-center gap-2 h-9">
              <CiSettings size={16} />
              <span className={`${collapsed ? 'hidden' : 'block'}`}>
                Incentive
              </span>
            </span>
          ),
          className: 'font-bold',
          permissions: ['view_incentive_page'],
        },
        {
          title: (
            <span className="flex items-center gap-2 h-9">
              <CiSettings size={16} />
              <span className={`${collapsed ? 'hidden' : 'block'}`}>
                Variable Pay
              </span>
            </span>
          ),
          key: '/variable-pay',
          className: 'font-bold',
          permissions: ['view_variable_pay'],
        },
        {
          title: (
            <span className="flex items-center gap-2 h-9">
              <CiSettings size={16} />
              <span className={`${collapsed ? 'hidden' : 'block'}`}>
                Settings
              </span>
            </span>
          ),
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
          <span className={`${collapsed ? 'hidden' : 'block'}`}>Admin</span>
        </span>
      ),
      key: '/admin',
      className: 'font-bold',
      permissions: ['view_admin_configuration'],
      children: [
        {
          title: (
            <span className="flex items-center gap-2 h-9">
              <AppstoreOutlined size={16} />
              <span className={`${collapsed ? 'hidden' : 'block'}`}>
                Dashboard
              </span>
            </span>
          ),
          key: '/admin/dashboard',
          className: 'font-bold',
          permissions: ['view_admin_dashboard'],
        },
        {
          title: (
            <span className="flex items-center gap-2 h-9">
              <LuCircleDollarSign size={16} />
              <span className={`${collapsed ? 'hidden' : 'block'}`}>
                Billing and Invoice
              </span>
            </span>
          ),
          key: '/admin/billing',
          className: 'font-bold',
          permissions: ['view_admin_billing'],
        },
        {
          title: (
            <span className="flex items-center gap-2 h-9">
              <CiSettings size={16} />
              <span className={`${collapsed ? 'hidden' : 'block'}`}>
                Update Profile
              </span>
            </span>
          ),
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
    } else {
      const path = String(selectedKey);
      if (pathname !== path) {
        router.push(path);
      }

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

  const handleLogout = () => {
    setToken('');
    setTenantId('');
    setLocalId('');
    removeCookie('token');
    router.push(`/authentication/login`);
    setUserId('');
    setLocalId('');
    setError('');
    removeCookie('tenantId');
    window.location.reload();
  };

  const filteredMenuItems: any = treeData
    .map((item) => {
      const hasAccess = AccessGuard.checkAccess({
        permissions: item.permissions, // Specify permissions needed
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
    .filter(Boolean);

  const getResponsiveTreeData = (
    data: CustomMenuItem[],
    collapsed: boolean,
  ): CustomMenuItem[] => {
    return data.map((item) => ({
      ...item,
      title:
        typeof item.title === 'string' ? (
          <span className="flex items-center gap-2">
            {item.icon}
            <span className={`${collapsed ? 'hidden' : 'block'}`}>
              {item.title}
            </span>
          </span>
        ) : collapsed ? (
          <Tooltip
            title={
              typeof item.title === 'string'
                ? item.title
                : // @ts-expect-error linter issue handler
                  item.title.props.children[1].props.children
            }
            placement="right"
          >
            {item.title}
          </Tooltip>
        ) : (
          item.title
        ),
      children: item.children
        ? getResponsiveTreeData(item.children, collapsed)
        : undefined,
      className: `${item.className} ${collapsed ? 'mobile-item' : ''}`,
    }));
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
          <div className="absolute left-2 top-0 w-[10px] h-full bg-white z-10"></div>
          {isLoading ? (
            <div className="px-5 w-full h-full flex justify-center items-center my-5">
              <Skeleton active />{' '}
            </div>
          ) : (
            <Tree
              treeData={getResponsiveTreeData(filteredMenuItems, collapsed)}
              showLine={{ showLeafIcon: false }} // Only show lines for child nodes
              defaultExpandAll={false}
              expandedKeys={expandedKeys}
              selectedKeys={selectedKeys}
              onSelect={handleSelect}
              onDoubleClick={handleDoubleClick}
              className="my-5 [&_.ant-tree-node-selected]:!text-black h-full w-full"
              switcherIcon={null}
            />
          )}
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
            paddingTop: isMobile ? 4 : 24,
            paddingLeft: isMobile ? 0 : collapsed ? 5 : 280,
            transition: 'padding-left 0.3s ease',
          }}
        >
          <div
            className={`overflow-auto ${!isAdminPage ? 'bg-white' : ''}`}
            style={{
              borderRadius: borderRadiusLG,
              marginTop: '3rem',
              marginRight: `${isMobile ? 0 : !isAdminPage ? '1.3rem' : ''}`,
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
