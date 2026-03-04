'use client';
import React, {
  ReactNode,
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import '../../app/globals.css';
import { useRouter, usePathname } from 'next/navigation';
import {
  AppstoreOutlined,
  MenuOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import {
  MdOutlineKeyboardDoubleArrowLeft,
  MdOutlineKeyboardDoubleArrowRight,
} from 'react-icons/md';
import { IoCloseOutline } from 'react-icons/io5';
import { Layout, Button, theme, Tree, Skeleton, Dropdown, message } from 'antd';
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
import { useGetDepartments } from '@/store/server/features/employees/employeeManagment/department/queries';

import { useEmployeeManagementStore } from '@/store/uistate/features/employees/employeeManagment';
import { useOKRStore } from '@/store/uistate/features/okrplanning/okr';
import { CreateEmployeeJobInformation } from '@/app/(afterLogin)/(employeeInformation)/employees/manage-employees/[id]/_components/job/addEmployeeJobInfrmation';
import { useCreateEmployee } from '@/store/server/features/employees/employeeDetail/mutations';
import dayjs from 'dayjs';
import { useUpdateEmployeeInformation } from '@/store/server/features/employees/employeeDetail/mutations';
import JobInfoAccessModal from '@/app/(afterLogin)/dashboard/_components/modal';

const { Header, Content, Sider } = Layout;

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
  const { userId, userData } = useAuthenticationStore();
  const { isLoading } = useGetEmployee(userId);
  const okrMode = useOKRStore((state) => state.okrMode);
  const { mutate: updateEmployeeInformation } = useUpdateEmployeeInformation();
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
    isCheckingPermissions,
    setIsCheckingPermissions,
  } = useAuthenticationStore();
  const isAdminPage = pathname.startsWith('/admin');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const pathName = usePathname();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const triggerRouteLoaderStart = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('__route_loader_start'));
    }
  };

  const loadExpandedKeysFromStorage = (): (string | number | bigint)[] => {
    if (typeof window === 'undefined') return [];

    try {
      const saved = localStorage.getItem('navBar-expandedKeys');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.slice(0, 1);
        }
      }
    } catch (error: any) {
      message.error('Error loading expandedKeys from localStorage:', error);
    }
    return [];
  };

  const saveExpandedKeysToStorage = (keys: (string | number | bigint)[]) => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem('navBar-expandedKeys', JSON.stringify(keys));
    } catch (error: any) {
      message.error('Error saving expandedKeys to localStorage:', error);
    }
  };

  const [expandedKeys, setExpandedKeys] = useState<
    (string | number | bigint)[]
  >(loadExpandedKeysFromStorage);
  const [selectedKeys, setSelectedKeys] = useState<
    (string | number | bigint)[]
  >([pathname]);
  const hasInitialized = useRef(false);

  // ===========> Fiscal Year Ended Section <=================

  const { token } = useAuthenticationStore();
  const { data: activeFiscalYear, refetch } = useGetActiveFiscalYearsData();

  useEffect(() => {
    refetch();
  }, [token, refetch]);

  const hasEndedFiscalYear =
    !!activeFiscalYear?.isActive &&
    !!activeFiscalYear?.endDate &&
    new Date(activeFiscalYear?.endDate) <= new Date();

  // ===========> Fiscal Year Ended Section <=================

  // Separate array for routes that should be accessible but not shown in navigation
  const hiddenRoutes: { key: string; permissions: string[] }[] = [
    { key: '/dashboard', permissions: [] },
    { key: '/', permissions: [] },
    { key: '/employees/manage-employees/[id]', permissions: [] },
    { key: '/employee-information/[id]', permissions: [] },
    {
      key: '/feedback/action-plan',
      permissions: ['view_feedback_conversation'],
    },
    {
      key: '/feedback/meeting',
      permissions: ['view_feedback_conversation'],
    },
    {
      key: '/feedback/categories',
      permissions: ['view_feedback_conversation'],
    },
  ];

  const getRoutesAndPermissions = (
    menuItems: CustomMenuItem[],
  ): { route: string; permissions: string[] }[] => {
    const routes: { route: string; permissions: string[] }[] = [];

    const traverse = (items: CustomMenuItem[]) => {
      items.forEach((item) => {
        if (item.key && item.permissions) {
          routes.push({
            route: item.key,
            permissions: item.permissions,
          });
        }
        if (item.children) {
          traverse(item.children);
        }
      });
    };

    hiddenRoutes.forEach((route) => {
      if (route.key && route.permissions) {
        routes.push({
          route: route.key,
          permissions: route.permissions,
        });
      }
    });

    traverse(menuItems);
    return routes;
  };

  const treeData: CustomMenuItem[] = [
    {
      title: (
        <span
          className="flex items-center gap-2 h-12"
          data-cy="nav-item-settings"
        >
          <CiSettings
            size={18}
            className={
              expandedKeys.includes('/organization') ? 'text-blue' : ''
            }
          />
          <span data-cy="organizational-structure-and-employee-information-frontend-components-navbar-index-tsx-index-span-230">
            Organization
          </span>
        </span>
      ),
      key: '/organization',
      className: 'font-bold',
      permissions: ['view_organization'],
      disabled: hasEndedFiscalYear,
      children: [
        {
          title: (
            <span data-cy="organizational-structure-and-employee-information-frontend-components-navbar-index-tsx-index-span-239">
              Org Structure
            </span>
          ),
          key: '/organization/chart',
          className: 'font-bold',
          permissions: ['view_organization_chart'],
          disabled: hasEndedFiscalYear,
        },
        {
          title: (
            <span data-cy="organizational-structure-and-employee-information-frontend-components-navbar-index-tsx-index-span-246">
              Settings
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
        <span
          data-cy="organizational-structure-and-employee-information-frontend-components-navbar-index-tsx-index-span-255"
          className="flex items-center gap-2 h-12"
        >
          <LuUsers
            size={18}
            className={expandedKeys.includes('/employees') ? 'text-blue' : ''}
          />
          <span data-cy="organizational-structure-and-employee-information-frontend-components-navbar-index-tsx-index-span-260">
            Employees
          </span>
        </span>
      ),
      key: '/employees',
      className: 'font-bold',
      permissions: ['view_employees'],
      disabled: hasEndedFiscalYear,
      children: [
        {
          title: (
            <span data-cy="organizational-structure-and-employee-information-frontend-components-navbar-index-tsx-index-span-269">
              Manage Employees
            </span>
          ),
          key: '/employees/manage-employees',
          className: 'font-bold',
          permissions: ['manage_employees'],
        },
        // {
        //   title: <span>Department Request</span>,
        //   key: '/employees/departmentRequest',
        //   className: 'font-bold',
        //   permissions: ['manage_department_requests'],
        // },
        {
          title: (
            <span data-cy="organizational-structure-and-employee-information-frontend-components-navbar-index-tsx-index-span-281">
              Settings
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
        <span
          data-cy="organizational-structure-and-employee-information-frontend-components-navbar-index-tsx-index-span-290"
          className="flex items-center gap-2 h-12"
        >
          <PiSuitcaseSimpleThin
            size={18}
            className={expandedKeys.includes('/recruitment') ? 'text-blue' : ''}
          />
          <span data-cy="organizational-structure-and-employee-information-frontend-components-navbar-index-tsx-index-span-295">
            Talent Acquisition
          </span>
        </span>
      ),
      key: '/recruitment',
      className: 'font-bold',
      permissions: ['view_recruitment'],
      disabled: hasEndedFiscalYear,
      children: [
        {
          title: (
            <span data-cy="organizational-structure-and-employee-information-frontend-components-navbar-index-tsx-index-span-304">
              Dashboard
            </span>
          ),
          key: '/recruitment/dashboard',
          className: 'font-bold',
          permissions: ['view_recruitment_dashboard'],
        },
        {
          title: (
            <span data-cy="organizational-structure-and-employee-information-frontend-components-navbar-index-tsx-index-span-310">
              Jobs
            </span>
          ),
          key: '/recruitment/jobs',
          className: 'font-bold',
          permissions: ['manage_recruitment_jobs'],
        },
        {
          title: (
            <span data-cy="organizational-structure-and-employee-information-frontend-components-navbar-index-tsx-index-span-316">
              AI Job Matching
            </span>
          ),
          key: '/recruitment/ai-job-matching',
          className: 'font-bold',
          permissions: ['manage_recruitment_jobs'],
          disabled: hasEndedFiscalYear,
          //  || isSubscriptionExpired,
        },
        {
          title: (
            <span data-cy="organizational-structure-and-employee-information-frontend-components-navbar-index-tsx-index-span-324">
              Candidates
            </span>
          ),
          key: '/recruitment/candidate',
          className: 'font-bold',
          permissions: ['manage_recruitment_candidates'],
        },
        {
          title: (
            <span data-cy="organizational-structure-and-employee-information-frontend-components-navbar-index-tsx-index-span-330">
              Talent Resource
            </span>
          ),
          key: '/recruitment/talent-resource',
          className: 'font-bold',
          permissions: ['manage_recruitment_talent_pool'],
        },
        {
          title: (
            <span
              data-cy="organizational-structure-and-employee-information-frontend-components-navbar-index-tsx-index-span-336"
              className="font-bold"
            >
              Settings
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
        <span
          data-cy="organizational-structure-and-employee-information-frontend-components-navbar-index-tsx-index-span-345"
          className="flex items-center gap-2 h-12"
        >
          <CiStar
            size={18}
            className={expandedKeys.includes('/okr-menu') ? 'text-blue' : ''}
          />
          <span data-cy="organizational-structure-and-employee-information-frontend-components-navbar-index-tsx-index-span-350">
            OKR
          </span>
        </span>
      ),
      key: '/okr-menu',
      className: 'font-bold',
      permissions: ['view_okr'],
      disabled: hasEndedFiscalYear,
      children: [
        {
          title: (
            <span data-cy="organizational-structure-and-employee-information-frontend-components-navbar-index-tsx-index-span-359">
              Dashboard
            </span>
          ),
          key: '/okr/dashboard',
          className: 'font-bold',
          permissions: ['view_okr_dashboard'],
        },
        {
          title: (
            <span data-cy="organizational-structure-and-employee-information-frontend-components-navbar-index-tsx-index-span-365">
              OKR
            </span>
          ),
          key: '/okr',
          className: 'font-bold',
          permissions: ['view_okr_overview'],
        },
        {
          title: (
            <span data-cy="organizational-structure-and-employee-information-frontend-components-navbar-index-tsx-index-span-371">
              Planning and Reporting
            </span>
          ),
          key: '/planning-and-reporting',
          className: 'font-bold',
          permissions: ['manage_planning_reporting'],
        },
        {
          title: (
            <span data-cy="organizational-structure-and-employee-information-frontend-components-navbar-index-tsx-index-span-377">
              Weekly Priority
            </span>
          ),
          key: '/weekly-priority',
          className: 'font-bold h-8',
          permissions: ['view_weekly_priority'],
        },
        {
          title: (
            <span data-cy="organizational-structure-and-employee-information-frontend-components-navbar-index-tsx-index-span-383">
              Settings
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
        <span
          data-cy="organizational-structure-and-employee-information-frontend-components-navbar-index-tsx-index-span-392"
          className="flex items-center gap-2 h-12"
        >
          <TbMessage2
            size={18}
            className={
              expandedKeys.includes('feedback-menu') ? 'text-blue' : ''
            }
          />
          <span data-cy="organizational-structure-and-employee-information-frontend-components-navbar-index-tsx-index-span-399">
            CFR
          </span>
        </span>
      ),
      key: 'feedback-menu',
      className: 'font-bold',
      permissions: ['view_feedback'],
      disabled: hasEndedFiscalYear,
      children: [
        {
          title: (
            <span data-cy="organizational-structure-and-employee-information-frontend-components-navbar-index-tsx-index-span-408">
              Conversation
            </span>
          ),
          key: '/feedback/conversation',
          className: 'font-bold',
          permissions: ['view_feedback_conversation'],
        },
        {
          title: (
            <span data-cy="organizational-structure-and-employee-information-frontend-components-navbar-index-tsx-index-span-414">
              Feedback
            </span>
          ),
          key: '/feedback/feedback',
          className: 'font-bold',
          permissions: ['view_feedback_list'],
        },
        {
          title: (
            <span data-cy="organizational-structure-and-employee-information-frontend-components-navbar-index-tsx-index-span-420">
              Recognition
            </span>
          ),
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
        <span
          data-cy="organizational-structure-and-employee-information-frontend-components-navbar-index-tsx-index-span-435"
          className="flex items-center gap-2 h-12"
        >
          <CiBookmark
            size={18}
            className={expandedKeys.includes('tna-menu') ? 'text-blue' : ''}
          />
          <span data-cy="organizational-structure-and-employee-information-frontend-components-navbar-index-tsx-index-span-440">
            Learning & Growth
          </span>
        </span>
      ),
      key: 'tna-menu',
      className: 'font-bold',
      permissions: ['view_learning_growth'],
      disabled: hasEndedFiscalYear,
      children: [
        // {
        //   title: <span>My-TNA</span>,
        //   key: '/tna/my-training',
        //   className: 'font-bold',
        //   permissions: ['view_my_training'],

        //   disabled: hasEndedFiscalYear || isSubscriptionExpired,

        // },
        {
          title: (
            <span data-cy="organizational-structure-and-employee-information-frontend-components-navbar-index-tsx-index-span-458">
              Training Management
            </span>
          ),
          key: '/tna/management',
          className: 'font-bold',
          permissions: ['manage_training'],
        },
        // {
        //   title: <span>TNA</span>,
        //   key: '/tna/review',
        //   className: 'font-bold',
        //   permissions: ['view_tna_review'],

        //   disabled: hasEndedFiscalYear || isSubscriptionExpired,

        // },
        {
          title: (
            <span data-cy="organizational-structure-and-employee-information-frontend-components-navbar-index-tsx-index-span-473">
              Settings
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
        <span
          data-cy="organizational-structure-and-employee-information-frontend-components-navbar-index-tsx-index-span-482"
          className="flex items-center gap-2 h-12"
        >
          <AiOutlineDollarCircle
            size={18}
            className={
              expandedKeys.includes('/payroll-menu') ? 'text-blue' : ''
            }
          />
          <span data-cy="organizational-structure-and-employee-information-frontend-components-navbar-index-tsx-index-span-489">
            Payroll
          </span>
        </span>
      ),
      key: '/payroll-menu',
      className: 'font-bold',
      permissions: ['view_payroll_menu'],
      disabled: hasEndedFiscalYear,
      children: [
        {
          title: (
            <span data-cy="organizational-structure-and-employee-information-frontend-components-navbar-index-tsx-index-span-498">
              Employee Information
            </span>
          ),
          key: '/employee-information',
          className: 'font-bold',
          permissions: ['view_employee_information'],
        },
        {
          title: (
            <span data-cy="organizational-structure-and-employee-information-frontend-components-navbar-index-tsx-index-span-504">
              Payroll
            </span>
          ),
          key: '/payroll',
          className: 'font-bold',
          permissions: ['view_payroll_overview'],
        },
        {
          title: (
            <span data-cy="organizational-structure-and-employee-information-frontend-components-navbar-index-tsx-index-span-510">
              My Payroll
            </span>
          ),
          key: '/myPayroll',
          className: 'font-bold',
          permissions: ['view_my_payroll'],
        },
        {
          title: (
            <span data-cy="organizational-structure-and-employee-information-frontend-components-navbar-index-tsx-index-span-516">
              Settings
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
        <span
          data-cy="organizational-structure-and-employee-information-frontend-components-navbar-index-tsx-index-span-525"
          className="flex items-center gap-2 h-12"
        >
          <CiCalendar
            size={18}
            className={
              expandedKeys.includes('timesheet-menu') ? 'text-blue' : ''
            }
          />
          <span data-cy="organizational-structure-and-employee-information-frontend-components-navbar-index-tsx-index-span-532">
            Time & Attendance
          </span>
        </span>
      ),
      key: 'timesheet-menu',
      className: 'font-bold',
      permissions: ['view_timesheet'],
      disabled: hasEndedFiscalYear,
      children: [
        {
          title: (
            <span data-cy="organizational-structure-and-employee-information-frontend-components-navbar-index-tsx-index-span-541">
              Dashboard
            </span>
          ),
          key: '/timesheet/dashboard',
          className: 'font-bold',
          permissions: ['view_timesheet_dashboard'],
        },
        {
          title: (
            <span data-cy="organizational-structure-and-employee-information-frontend-components-navbar-index-tsx-index-span-547">
              My Timesheet
            </span>
          ),
          key: '/timesheet/my-timesheet',
          className: 'font-bold',
          permissions: ['view_my_timesheet'],
        },
        {
          title: (
            <span data-cy="organizational-structure-and-employee-information-frontend-components-navbar-index-tsx-index-span-553">
              Employee Attendance
            </span>
          ),
          key: '/timesheet/employee-attendance',
          className: 'font-bold',
          permissions: ['view_employee_attendance'],
        },
        {
          title: (
            <span data-cy="organizational-structure-and-employee-information-frontend-components-navbar-index-tsx-index-span-559">
              Leave Management
            </span>
          ),
          key: '/timesheet/leave-management/leaves',
          className: 'font-bold',
          permissions: ['manage_leave_management'],
        },
        {
          title: (
            <span data-cy="organizational-structure-and-employee-information-frontend-components-navbar-index-tsx-index-span-565">
              Settings
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
        <span
          data-cy="organizational-structure-and-employee-information-frontend-components-navbar-index-tsx-index-span-574"
          className="flex items-center gap-2 h-12"
        >
          <PiMoneyLight
            size={18}
            className={
              expandedKeys.includes('compensation-menu') ? 'text-blue' : ''
            }
          />
          <span data-cy="organizational-structure-and-employee-information-frontend-components-navbar-index-tsx-index-span-581">
            Compensation & Benefit
          </span>
        </span>
      ),
      key: 'compensation-menu',
      className: 'font-bold',
      permissions: ['view_compensation'],
      disabled: hasEndedFiscalYear,
      children: [
        {
          title: (
            <span data-cy="organizational-structure-and-employee-information-frontend-components-navbar-index-tsx-index-span-590">
              Allowance
            </span>
          ),
          key: '/allowance',
          className: 'font-bold',
          permissions: ['view_allowance'],
        },
        {
          title: (
            <span data-cy="organizational-structure-and-employee-information-frontend-components-navbar-index-tsx-index-span-596">
              Benefit
            </span>
          ),
          key: '/benefit',
          className: 'font-bold',
          permissions: ['view_benefit'],
        },
        {
          title: (
            <span data-cy="organizational-structure-and-employee-information-frontend-components-navbar-index-tsx-index-span-602">
              Deduction
            </span>
          ),
          key: '/deduction',
          className: 'font-bold',
          permissions: ['view_deduction'],
        },
        {
          title: (
            <span data-cy="organizational-structure-and-employee-information-frontend-components-navbar-index-tsx-index-span-608">
              Settings
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
        <span
          data-cy="organizational-structure-and-employee-information-frontend-components-navbar-index-tsx-index-span-617"
          className="flex items-center gap-2 h-12"
        >
          <LuCircleDollarSign
            size={18}
            className={
              expandedKeys.includes('incentive-menu') ? 'text-blue' : ''
            }
          />
          <span data-cy="organizational-structure-and-employee-information-frontend-components-navbar-index-tsx-index-span-624">
            Incentives
          </span>
        </span>
      ),
      key: 'incentive-menu',
      className: 'font-bold',
      permissions: ['view_incentive'],
      disabled: hasEndedFiscalYear,
      children: [
        {
          title: (
            <span data-cy="organizational-structure-and-employee-information-frontend-components-navbar-index-tsx-index-span-633">
              Incentive
            </span>
          ),
          key: '/incentives',
          className: 'font-bold',
          permissions: ['view_incentive_page'],
        },
        {
          title: (
            <span data-cy="organizational-structure-and-employee-information-frontend-components-navbar-index-tsx-index-span-639">
              Variable Pay
            </span>
          ),
          key: '/variable-pay',
          className: 'font-bold',
          permissions: ['view_variable_pay'],
        },
        {
          title: (
            <span data-cy="organizational-structure-and-employee-information-frontend-components-navbar-index-tsx-index-span-645">
              Settings
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
        <span
          data-cy="organizational-structure-and-employee-information-frontend-components-navbar-index-tsx-index-span-654"
          className="flex items-center gap-2 h-12"
        >
          <FileTextOutlined
            style={{ fontSize: 18 }}
            className={expandedKeys.includes('/audit-log') ? 'text-blue' : ''}
          />
          <span data-cy="organizational-structure-and-employee-information-frontend-components-navbar-index-tsx-index-span-659">
            Audit Log
          </span>
        </span>
      ),
      key: '/audit-log',
      className: 'font-bold',
      permissions: ['view_audit_log'],
      disabled: hasEndedFiscalYear,
    },
    {
      title: (
        <span
          data-cy="organizational-structure-and-employee-information-frontend-components-navbar-index-tsx-index-span-669"
          className="flex items-center gap-2 h-12"
        >
          <CiSettings
            size={18}
            className={expandedKeys.includes('admin-menu') ? 'text-blue' : ''}
          />
          <span data-cy="organizational-structure-and-employee-information-frontend-components-navbar-index-tsx-index-span-674">
            Admin
          </span>
        </span>
      ),
      key: 'admin-menu',
      className: 'font-bold',
      permissions: ['view_admin_configuration'],
      disabled: hasEndedFiscalYear,
      children: [
        {
          title: (
            <span data-cy="organizational-structure-and-employee-information-frontend-components-navbar-index-tsx-index-span-683">
              Dashboard
            </span>
          ),
          key: '/admin/dashboard',
          className: 'font-bold',
          permissions: ['view_admin_dashboard'],
        },
        {
          title: (
            <span data-cy="organizational-structure-and-employee-information-frontend-components-navbar-index-tsx-index-span-689">
              Billing and Invoice
            </span>
          ),
          key: '/admin/billing',
          className: 'font-bold',
          permissions: ['view_admin_billing'],
        },
        {
          title: (
            <span data-cy="organizational-structure-and-employee-information-frontend-components-navbar-index-tsx-index-span-695">
              Update Profile
            </span>
          ),
          key: '/admin/profile',
          className: 'font-bold',
          permissions: ['view_admin_profile'],
        },
      ],
    },
  ];

  // Planning and Reporting link: Basic OKR -> /basic-okr/planning-and-reporting, Advanced -> /planning-and-reporting
  const menuTreeData = React.useMemo(() => {
    const planningKey =
      okrMode === 'Basic'
        ? '/basic-okr/planning-and-reporting'
        : '/planning-and-reporting';
    return treeData.map((item) => {
      if (item.key !== '/okr-menu' || !item.children) return item;
      return {
        ...item,
        children: item.children.map((child) =>
          child.key === '/planning-and-reporting'
            ? { ...child, key: planningKey }
            : child,
        ),
      };
    });
  }, [okrMode]);

  // Helper function to match dynamic routes like [id] to UUIDs or any non-slash segment
  const isRouteMatch = (routePattern: string, pathname: string) => {
    if (routePattern.includes('[id]')) {
      const regexPattern = routePattern.replace('[id]', '[0-9a-fA-F-]{36}');
      const regex = new RegExp('^' + regexPattern + '$');
      return regex.test(pathname);
    }
    if (routePattern.match(/\[.*?\]/g)) {
      const regexPattern = routePattern.replace(/\[.*?\]/g, '[^/]+');
      const regex = new RegExp('^' + regexPattern + '$');
      return regex.test(pathname);
    }
    return routePattern === pathname;
  };

  const checkPathnamePermissions = (pathname: string): boolean => {
    const routesWithPermissions = getRoutesAndPermissions(menuTreeData);

    const isOwner = userData?.role?.slug?.toLowerCase() === 'owner';
    if (isOwner) {
      return true;
    }

    const matchingRoute = routesWithPermissions.find((route) => {
      if (isRouteMatch(route.route, pathname)) {
        return true;
      }
      if (pathname.startsWith(route.route + '/')) {
        return true;
      }
      return false;
    });

    if (!matchingRoute) {
      const pathParts = pathname.split('/').filter(Boolean);

      for (let i = pathParts.length - 1; i > 0; i--) {
        const parentPath = '/' + pathParts.slice(0, i).join('/');
        const parentRoute = routesWithPermissions.find((route) =>
          isRouteMatch(route.route, parentPath),
        );

        if (parentRoute) {
          const userPermissions = userData?.userPermissions || [];
          const hasParentPermissions = parentRoute.permissions.every(
            (requiredPermission: any) => {
              const found = userPermissions?.find(
                (permission: any) =>
                  permission.permission.slug === requiredPermission,
              );
              return found;
            },
          );

          if (hasParentPermissions) {
            return true;
          }
        }
      }

      return false;
    }

    if (!matchingRoute.permissions || matchingRoute.permissions.length === 0) {
      return true;
    }

    const userPermissions = userData?.userPermissions || [];

    const hasAllPermissions = matchingRoute.permissions.every(
      (requiredPermission: any) => {
        const found = userPermissions?.find(
          (permission: any) =>
            permission.permission.slug === requiredPermission,
        );
        return found;
      },
    );
    return hasAllPermissions;
  };

  const { data: departments, isLoading: departmentsLoading } =
    useGetDepartments();
  const { data: employeeData, isLoading: employeeDataLoading } =
    useGetEmployee(userId);
  const { setIsAddEmployeeJobInfoModalVisible } = useEmployeeManagementStore();

  const isLoadingData =
    departmentsLoading || employeeDataLoading || !departments || !employeeData;

  useEffect(() => {
    if (isLoadingData) return;

    if (departments.length === 0 && !isLoadingData) {
      router.push('/onboarding');
    } else if (
      employeeData?.employeeJobInformation?.length === 0 &&
      pathName !== `/employees/manage-employees/${userId}`
    ) {
      setIsModalOpen(true);
    } else if (
      employeeData?.employeeJobInformation?.length === 0 &&
      pathName === `/employees/manage-employees/${userId}`
    ) {
      setIsAddEmployeeJobInfoModalVisible(true);
    }
  }, [
    departments,
    employeeData,
    router,
    isLoadingData,
    pathName,
    userId,
    setIsAddEmployeeJobInfoModalVisible,
  ]);

  const handleOk = () => {
    router.push(`/employees/manage-employees/${userId}`);
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  // ✅ Check permission on pathname change
  useEffect(() => {
    const checkPermissions = async () => {
      setIsCheckingPermissions(true);

      if (pathname === '/') {
        router.push('/dashboard');
      } else if (!checkPathnamePermissions(pathname)) {
        router.push('/unauthorized');
      }

      setIsCheckingPermissions(false);
    };

    checkPermissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, router, setIsCheckingPermissions]);

  const findParentMenuKey = useCallback(
    (pathname: string, menuItems: CustomMenuItem[]): string | null => {
      for (const item of menuItems) {
        if (item.children) {
          const matchesChild = item.children.some((child) => {
            const childKey = String(child.key);
            return (
              pathname === childKey ||
              pathname.startsWith(childKey + '/') ||
              (childKey.includes('[id]') &&
                pathname.match(new RegExp(childKey.replace('[id]', '[^/]+'))))
            );
          });

          if (matchesChild) {
            return String(item.key);
          }

          const nestedParent = findParentMenuKey(pathname, item.children);
          if (nestedParent) {
            return String(item.key);
          }
        }
      }
      return null;
    },
    [],
  );

  useEffect(() => {
    saveExpandedKeysToStorage(expandedKeys);
  }, [expandedKeys]);

  useEffect(() => {
    if (pathname === '/dashboard' || pathname === '/') {
      setExpandedKeys([]);
      return;
    }
    const parentKey = findParentMenuKey(pathname, menuTreeData);
    if (parentKey) {
      setExpandedKeys((prev) => {
        if (prev.length !== 1 || prev[0] !== parentKey) {
          return [parentKey];
        }
        return prev;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, findParentMenuKey]);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const savedKeys = loadExpandedKeysFromStorage();
    if (savedKeys.length > 0) {
      if (expandedKeys.length === 0) {
        setExpandedKeys(savedKeys);
      }
      return;
    }

    const parentKey = findParentMenuKey(pathname, menuTreeData);
    if (parentKey && expandedKeys.length === 0) {
      setExpandedKeys([parentKey]);
    }
  }, []);

  const handleSelect = (keys: (string | number | bigint)[], info: any) => {
    const selectedKey = info?.node?.key;
    if (!selectedKey) return;

    // Check if node has children - handle both undefined and empty arrays
    const hasChildren =
      info.node.children &&
      Array.isArray(info.node.children) &&
      info.node.children.length > 0;

    if (hasChildren) {
      setExpandedKeys((prev) =>
        prev.includes(selectedKey) ? [] : [selectedKey],
      );
      return;
    }

    const path = String(selectedKey);
    if (pathname !== path) {
      triggerRouteLoaderStart();
      router.push(path);
      setSelectedKeys([selectedKey]);
    }
  };

  const handleExpand = (expandedKeys: (string | number | bigint)[]) => {
    if (expandedKeys.length > 0) {
      setExpandedKeys([expandedKeys[expandedKeys.length - 1]]);
    } else {
      setExpandedKeys([]);
    }
  };

  const handleDoubleClick = (event: React.MouseEvent, node: any) => {
    const key = node?.key;
    if (!node.children && key) {
      triggerRouteLoaderStart();
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
      setUser2FA({ email: '', pass: '' });

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

  const filteredMenuItems = menuTreeData
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
          <div
            data-cy="organizational-structure-and-employee-information-frontend-components-navbar-index-tsx-index-div-1038"
            className="bg-white rounded-lg shadow-lg p-2 min-w-[200px] ml-12"
          >
            {children.map((child) => (
              <div
                key={child.key}
                className={`px-4 py-2 hover:bg-gray-100 rounded cursor-pointer ${
                  selectedKeys.includes(child.key) ? 'bg-gray-100' : ''
                }`}
                data-cy="organizational-structure-and-employee-information-frontend-components-navbar-index-tsx-index-div-1259"
                onClick={(e) => {
                  e.stopPropagation();
                  const path = String(child.key);
                  if (pathname !== path) {
                    triggerRouteLoaderStart();
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
            <div
              data-cy="organizational-structure-and-employee-information-frontend-components-navbar-index-tsx-index-div-1067"
              className="flex items-center justify-center w-full"
            >
              {icon}
            </div>
          );
        }
        return null;
      };

      return {
        ...item,
        title: collapsed ? (
          item.children && item.children.length > 0 ? (
            <Dropdown
              dropdownRender={() =>
                item.children ? renderSubMenu(item.children) : null
              }
              trigger={['click']}
              placement="bottomRight"
            >
              <div
                data-cy={`components-navbar-index-tsx-index-div-1306-${item.key}`}
                className="flex items-center justify-center w-full cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setExpandedKeys((prev) =>
                    prev.includes(item.key) ? [] : [item.key],
                  );
                }}
              >
                {renderTitle()}
              </div>
            </Dropdown>
          ) : (
            <div
              data-cy={`components-navbar-index-tsx-index-div-1319-${item.key}`}
              className="flex items-center justify-center w-full cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                const path = String(item.key);
                if (pathname !== path) {
                  triggerRouteLoaderStart();
                  router.push(path);
                }
                setSelectedKeys([item.key]);
              }}
            >
              {renderTitle()}
            </div>
          )
        ) : (
          item.title
        ),
        children: collapsed ? undefined : item.children,
        className: `${item.className} ${collapsed ? 'mobile-item' : ''}`,
      };
    });
  };
  const { mutate: employeeInfo } = useCreateEmployee();
  const handleUserInfoUpdate = () => {
    const fullName = employeeData?.firstName?.split(' ') || [];
    const payloadUser = {
      firstName: fullName[0] || '-',
      middleName: fullName[1] || '-',
      lastName: fullName[2] || '-',
    };
    const payloadEmp = {
      joinedDate: employeeData?.createdAt
        ? new Date(employeeData?.createdAt).toISOString()
        : new Date().toISOString(),
      dateOfBirth: dayjs().subtract(30, 'year'),
      employeeAttendanceId: 1,
      gender: 'male',
      maritalStatus: 'SINGLE',
      addresses: {},
      additionalInformation: {},
      bankInformation: {},
      userId: userId,
    };

    updateEmployeeInformation({
      id: userId,
      values: payloadUser,
    });
    employeeInfo({
      values: payloadEmp,
    });
  };

  // Render the component with the layout and navigation on the left

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
        <div
          data-cy="organizational-structure-and-employee-information-frontend-components-navbar-index-tsx-index-div-1182"
          className="my-2"
        >
          {collapsed && <SimpleLogo />}
        </div>

        <div
          data-cy="organizational-structure-and-employee-information-frontend-components-navbar-index-tsx-index-div-1184"
          className="flex justify-between px-4 my-4"
        >
          <div
            data-cy="organizational-structure-and-employee-information-frontend-components-navbar-index-tsx-index-div-1185"
            className=" flex items-center gap-2"
          >
            {!collapsed && <Logo type="selamnew" />}
          </div>

          <div
            data-cy="organizational-structure-and-employee-information-frontend-components-navbar-index-tsx-index-div-1189"
            onClick={toggleCollapsed}
            className="text-black text-xl"
          >
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
            <div
              data-cy="organizational-structure-and-employee-information-frontend-components-navbar-index-tsx-index-div-1202"
              className="text-black font-bold font-['Manrope'] leading-normal"
            >
              Dashboard
            </div>
            <AppstoreOutlined size={24} className="text-black" />
          </Button>
        )}

        <div
          data-cy="organizational-structure-and-employee-information-frontend-components-navbar-index-tsx-index-div-1209"
          className="relative"
        >
          <div
            data-cy="organizational-structure-and-employee-information-frontend-components-navbar-index-tsx-index-div-1210"
            className="absolute left-4 top-0 w-[10px] h-full bg-white z-10"
          ></div>
          {!isMounted || isLoading ? (
            <div
              data-cy="organizational-structure-and-employee-information-frontend-components-navbar-index-tsx-index-div-1212"
              className="px-5 w-full h-full flex justify-center items-center my-5"
            >
              <Skeleton active />
            </div>
          ) : (
            <Tree
              treeData={getResponsiveTreeData(filteredMenuItems, collapsed)}
              showLine={{ showLeafIcon: false }}
              defaultExpandAll={false}
              expandedKeys={expandedKeys}
              selectedKeys={selectedKeys}
              onSelect={handleSelect}
              onExpand={handleExpand}
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
            <div
              data-cy="organizational-structure-and-employee-information-frontend-components-navbar-index-tsx-index-div-1257"
              className="w-full h-full p-[10px] flex justify-center items-center"
            >
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
          {isMounted && isCheckingPermissions ? (
            <div
              data-cy="organizational-structure-and-employee-information-frontend-components-navbar-index-tsx-index-div-1289"
              className="flex justify-center items-center h-screen"
            >
              <Skeleton active />
            </div>
          ) : (
            <div
              data-cy="components-navbar-index-tsx-index-div-1548"
              className={`overflow-auto ${!isAdminPage ? 'bg-white' : ''}`}
              style={{
                borderRadius: borderRadiusLG,
                marginTop: `${isMobile ? '85px' : '94px'}`,
                marginRight: `${isMobile ? 0 : !isAdminPage ? '0px' : ''}`,
              }}
            >
              {children}
            </div>
          )}
          <CreateEmployeeJobInformation
            onInfoSubmition={() => {
              handleUserInfoUpdate();
            }}
            id={userId}
          />
          <JobInfoAccessModal
            open={isModalOpen}
            onClose={handleCancel}
            onConfirm={handleOk}
          />
        </Content>
      </Layout>
    </Layout>
  );
};

export default Nav;
