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
import { Layout, Button, theme, Tree, Skeleton } from 'antd';

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
  const { setLocalId, setTenantId, setToken, setUserId, setError } =
    useAuthenticationStore();
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
    activeFiscalYear?.isActive &&
    new Date(activeFiscalYear?.endDate) < new Date();

  const isInFiscalEndedRoute = pathname.startsWith(
    '/organization/settings/fiscalYear/fiscalYearCard',
  );
  const isRestrictedMode = hasEndedFiscalYear && isInFiscalEndedRoute;

  // ===========> Fiscal Year Ended Section <=================

  const treeData: CustomMenuItem[] = isRestrictedMode
    ? [
        {
          title: (
            <span className="flex items-center gap-2 h-12 w-60">
              <CiSettings
                size={18}
                className={
                  expandedKeys.includes('/organization') ? 'text-blue' : ''
                }
              />{' '}
              Organization
            </span>
          ),
          key: '/organization',
          className: 'font-bold',
          permissions: ['view_organization'],
          disabled: hasEndedFiscalYear,
          children: [
            {
              title: 'Org Structure',
              key: '/organization/chart',
              className: 'font-bold h-9',
              permissions: ['view_organization_chart'],
              disabled: hasEndedFiscalYear,
            },
            {
              title: 'Settings',
              key: '/organization/settings',
              className: 'font-bold h-9',
              permissions: ['view_organization_settings'],
            },
          ],
        },
        {
          title: (
            <span className="flex items-center gap-2 h-12 w-60">
              <LuUsers2
                size={18}
                className={
                  expandedKeys.includes('/employees') ? 'text-blue' : ''
                }
              />{' '}
              Employees
            </span>
          ),
          key: '/employees',
          className: 'font-bold',
          permissions: ['view_employees'],
          disabled: hasEndedFiscalYear,
          children: [
            {
              title: 'Manage Employees',
              key: '/employees/manage-employees',
              className: 'font-bold h-9',
              permissions: ['manage_employees'],
            },
            {
              title: 'Department Request',
              key: '/employees/departmentRequest',
              className: 'font-bold h-9',
              permissions: ['manage_department_requests'],
            },
            {
              title: 'Settings',
              key: '/employees/settings',
              className: 'font-bold h-9',
              permissions: ['manage_employee_settings'],
            },
          ],
        },
        {
          title: (
            <span className="flex items-center gap-2 h-12 w-60">
              <PiSuitcaseSimpleThin
                size={18}
                className={
                  expandedKeys.includes('/recruitment') ? 'text-blue' : ''
                }
              />{' '}
              Talent Acquisition
            </span>
          ),
          key: '/recruitment',
          className: 'font-bold',
          permissions: ['view_recruitment'],
          disabled: hasEndedFiscalYear,
          children: [
            {
              title: 'Jobs',
              key: '/recruitment/jobs',
              className: 'font-bold h-9',
              permissions: ['manage_recruitment_jobs'],
            },
            {
              title: 'Candidates',
              key: '/recruitment/candidate',
              className: 'font-bold h-9',
              permissions: ['manage_recruitment_candidates'],
            },
            {
              title: 'Talent Pool',
              key: '/recruitment/talent-pool',
              className: 'font-bold h-9',
              permissions: ['manage_recruitment_talent_pool'],
            },
            {
              title: 'Settings',
              key: '/recruitment/settings',
              className: 'font-bold h-9',
              permissions: ['manage_recruitment_settings'],
            },
          ],
        },
        {
          title: (
            <span className="flex items-center gap-2 h-12 w-60">
              <CiStar
                size={18}
                className={
                  expandedKeys.includes('/okr-planning') ? 'text-blue' : ''
                }
              />{' '}
              OKR
            </span>
          ),
          key: '/okr-planning',
          className: 'font-bold',
          permissions: ['view_okr'],
          disabled: hasEndedFiscalYear,
          children: [
            {
              title: 'Dashboard',
              key: '/okr/dashboard',
              className: 'font-bold h-9',
              permissions: ['view_okr_dashboard'],
            },
            {
              title: 'OKR',
              key: '/okr',
              className: 'font-bold h-8',
              permissions: ['view_okr_overview'],
            },
            {
              title: 'Planning and Reporting',
              key: '/planning-and-reporting',
              className: 'font-bold h-8',
              permissions: ['manage_planning_reporting'],
            },
            {
              key: '/okr/settings',
              title: 'Settings',
              className: 'font-bold h-8',
              permissions: ['manage_okr_settings'],
            },
          ],
        },
        {
          title: (
            <span className="flex items-center gap-2 h-12 w-60">
              <TbMessage2
                size={18}
                className={
                  expandedKeys.includes('/feedback') ? 'text-blue' : ''
                }
              />{' '}
              CFR
            </span>
          ),
          key: '/feedback',
          className: 'font-bold',
          permissions: ['view_feedback'],
          disabled: hasEndedFiscalYear,
          children: [
            {
              title: 'Conversation',
              key: '/feedback/conversation',
              className: 'font-bold h-9',
              permissions: ['view_feedback_conversation'],
            },
            {
              title: 'Feedback',
              key: '/feedback/feedback',
              className: 'font-bold h-9',
              permissions: ['view_feedback_list'],
            },
            {
              title: 'Recognition',
              key: '/feedback/recognition',
              className: 'font-bold h-9',
              permissions: ['view_feedback_recognition'],
            },

            {
              title: 'Settings',
              key: '/feedback/settings',
              className: 'font-bold h-9',
              permissions: ['manage_feedback_settings'],
            },
          ],
        },
        {
          title: (
            <span className="flex items-center gap-2 h-12 w-60">
              <CiBookmark
                size={18}
                className={expandedKeys.includes('/tna') ? 'text-blue' : ''}
              />{' '}
              Learning & Growth
            </span>
          ),
          key: '/tna',
          className: 'font-bold',
          permissions: ['view_learning_growth'],
          disabled: hasEndedFiscalYear,
          children: [
            {
              title: 'My-TNA',
              key: '/tna/my-training',
              className: 'font-bold h-9',
              permissions: ['view_my_training'],
            },
            {
              title: 'Training Management',
              key: '/tna/management',
              className: 'font-bold h-9',
              permissions: ['manage_training'],
            },
            {
              title: 'TNA',
              key: '/tna/review',
              className: 'font-bold h-9',
              permissions: ['view_tna_review'],
            },
            {
              title: 'Settings',
              key: '/tna/settings/course-category',
              className: 'font-bold h-9',
              permissions: ['manage_tna_settings'],
            },
          ],
        },
        {
          title: (
            <span className="flex items-center gap-2 h-12 w-60">
              <AiOutlineDollarCircle
                size={18}
                className={expandedKeys.includes('/payroll') ? 'text-blue' : ''}
              />{' '}
              Payroll
            </span>
          ),
          key: 'payroll',
          className: 'font-bold',
          disabled: hasEndedFiscalYear,
          children: [
            {
              title: 'Employee Information',
              key: '/employee-information',
              className: 'font-bold h-9',
              permissions: ['view_employee_information'],
            },
            {
              title: 'Payroll',
              key: '/payroll',
              className: 'font-bold h-9',
              permissions: ['view_payroll_overview'],
            },
            {
              title: 'My Payroll',
              key: '/myPayroll',
              className: 'font-bold h-9',
              permissions: ['view_my_payroll'],
            },
            {
              title: 'Settings',
              key: '/settings',
              className: 'font-bold h-9',
              permissions: ['manage_payroll_settings'],
            },
          ],
        },
        {
          title: (
            <span className="flex items-center gap-2 h-12 w-60">
              <CiCalendar
                size={18}
                className={
                  expandedKeys.includes('/timesheet') ? 'text-blue' : ''
                }
              />{' '}
              Time & Attendance
            </span>
          ),
          key: '/timesheet',
          className: 'font-bold',
          permissions: ['view_timesheet'],
          disabled: hasEndedFiscalYear,
          children: [
            {
              title: 'My Timesheet',
              key: '/timesheet/my-timesheet',
              className: 'font-bold h-9',
              permissions: ['view_my_timesheet'],
            },
            {
              title: 'Employee Attendance',
              key: '/timesheet/employee-attendance',
              className: 'font-bold h-9',
              permissions: ['view_employee_attendance'],
            },
            {
              title: 'Leave Management',
              key: '/timesheet/leave-management/leaves',
              className: 'font-bold h-9',
              permissions: ['manage_leave_management'],
            },
            {
              title: 'Settings',
              key: '/timesheet/settings/closed-date',
              className: 'font-bold h-9',
              permissions: ['manage_timesheet_settings'],
            },
          ],
        },
        {
          title: (
            <span className="flex items-center gap-2 h-12 w-60">
              <PiMoneyLight
                size={18}
                className={
                  expandedKeys.includes('/compensation') ? 'text-blue' : ''
                }
              />{' '}
              Compensation & Benefit
            </span>
          ),
          key: '/compensation',
          className: 'font-bold',
          permissions: ['view_compensation'],
          disabled: hasEndedFiscalYear,
          children: [
            {
              title: 'Allowance',
              key: '/allowance',
              className: 'font-bold h-9',
              permissions: ['view_allowance'],
            },
            {
              title: 'Benefit',
              key: '/benefit',
              className: 'font-bold h-9',
              permissions: ['view_benefit'],
            },
            {
              title: 'Deduction',
              key: '/deduction',
              className: 'font-bold h-9',
              permissions: ['view_deduction'],
            },
            {
              title: 'Settings',
              key: '/compensationSetting',
              className: 'font-bold h-9',
              permissions: ['manage_compensation_settings'],
            },
          ],
        },
        {
          title: (
            <span className="flex items-center gap-2 h-12 w-60">
              <LuCircleDollarSign
                size={18}
                className={
                  expandedKeys.includes('/incentive') ? 'text-blue' : ''
                }
              />{' '}
              Incentives
            </span>
          ),
          key: '/incentive',
          className: 'font-bold',
          permissions: ['view_incentive'],
          disabled: hasEndedFiscalYear,
          children: [
            {
              key: '/incentives',
              title: 'Incentive',
              className: 'font-bold h-9',
              permissions: ['view_incentive_page'],
            },
            {
              title: 'Variable Pay',
              key: '/variable-pay',
              className: 'font-bold h-9',
              permissions: ['view_variable_pay'],
            },
            {
              title: 'Settings',
              key: '/incentives/settings',
              className: 'font-bold h-9',
              permissions: ['manage_incentive_settings'],
            },
          ],
        },
        {
          key: '/admin',
          title: (
            <span className="flex items-center gap-2 h-12 w-60">
              <CiSettings size={18} /> Admin
            </span>
          ),
          className: 'font-bold',
          permissions: ['view_admin_configuration'],
          disabled: hasEndedFiscalYear,
          children: [
            {
              key: '/admin/dashboard',
              title: 'Dashboard',
              className: 'font-bold h-9',
              permissions: ['view_admin_dashboard'],
            },
            {
              key: '/admin/billing',
              title: 'Billing and Invoice',
              className: 'font-bold h-9',
              permissions: ['view_admin_billing'],
            },
            {
              key: '/admin/profile',
              title: 'Update Profile',
              className: 'font-bold h-9',
              permissions: ['view_admin_profile'],
            },
          ],
        },
      ]
    : [
        {
          title: (
            <span className="flex items-center gap-2 h-12 w-60">
              <CiSettings
                size={18}
                className={
                  expandedKeys.includes('/organization') ? 'text-blue' : ''
                }
              />{' '}
              Organization
            </span>
          ),
          key: '/organization',
          className: 'font-bold',
          permissions: ['view_organization'],
          children: [
            {
              title: 'Org Structure',
              key: '/organization/chart',
              className: 'font-bold h-9',
              permissions: ['view_organization_chart'],
            },
            {
              title: 'Settings',
              key: '/organization/settings',
              className: 'font-bold h-9',
              permissions: ['view_organization_settings'],
            },
          ],
        },
        {
          title: (
            <span className="flex items-center gap-2 h-12 w-60">
              <LuUsers2
                size={18}
                className={
                  expandedKeys.includes('/employees') ? 'text-blue' : ''
                }
              />{' '}
              Employees
            </span>
          ),
          key: '/employees',
          className: 'font-bold',
          permissions: ['view_employees'],
          children: [
            {
              title: 'Manage Employees',
              key: '/employees/manage-employees',
              className: 'font-bold h-9',
              permissions: ['manage_employees'],
            },
            {
              title: 'Department Request',
              key: '/employees/departmentRequest',
              className: 'font-bold h-9',
              permissions: ['manage_department_requests'],
            },
            {
              title: 'Settings',
              key: '/employees/settings',
              className: 'font-bold h-9',
              permissions: ['manage_employee_settings'],
            },
          ],
        },
        {
          title: (
            <span className="flex items-center gap-2 h-12 w-60">
              <PiSuitcaseSimpleThin
                size={18}
                className={
                  expandedKeys.includes('/recruitment') ? 'text-blue' : ''
                }
              />{' '}
              Talent Acquisition
            </span>
          ),
          key: '/recruitment',
          className: 'font-bold',
          permissions: ['view_recruitment'],
          children: [
            {
              title: 'Jobs',
              key: '/recruitment/jobs',
              className: 'font-bold h-9',
              permissions: ['manage_recruitment_jobs'],
            },
            {
              title: 'Candidates',
              key: '/recruitment/candidate',
              className: 'font-bold h-9',
              permissions: ['manage_recruitment_candidates'],
            },
            {
              title: 'Talent Pool',
              key: '/recruitment/talent-pool',
              className: 'font-bold h-9',
              permissions: ['manage_recruitment_talent_pool'],
            },
            {
              title: 'Settings',
              key: '/recruitment/settings',
              className: 'font-bold h-9',
              permissions: ['manage_recruitment_settings'],
            },
          ],
        },
        {
          title: (
            <span className="flex items-center gap-2 h-12 w-60">
              <CiStar
                size={18}
                className={
                  expandedKeys.includes('/okr-planning') ? 'text-blue' : ''
                }
              />{' '}
              OKR
            </span>
          ),
          key: '/okr-planning',
          className: 'font-bold',
          permissions: ['view_okr'],
          children: [
            {
              title: 'Dashboard',
              key: '/okr/dashboard',
              className: 'font-bold h-9',
              permissions: ['view_okr_dashboard'],
            },
            {
              title: 'OKR',
              key: '/okr',
              className: 'font-bold h-8',
              permissions: ['view_okr_overview'],
            },
            {
              title: 'Planning and Reporting',
              key: '/planning-and-reporting',
              className: 'font-bold h-8',
              permissions: ['manage_planning_reporting'],
            },
            {
              key: '/okr/settings',
              title: 'Settings',
              className: 'font-bold h-8',
              permissions: ['manage_okr_settings'],
            },
          ],
        },
        {
          title: (
            <span className="flex items-center gap-2 h-12 w-60">
              <TbMessage2
                size={18}
                className={
                  expandedKeys.includes('/feedback') ? 'text-blue' : ''
                }
              />{' '}
              CFR
            </span>
          ),
          key: '/feedback',
          className: 'font-bold',
          permissions: ['view_feedback'],
          children: [
            {
              title: 'Conversation',
              key: '/feedback/conversation',
              className: 'font-bold h-9',
              permissions: ['view_feedback_conversation'],
            },
            {
              title: 'Feedback',
              key: '/feedback/feedback',
              className: 'font-bold h-9',
              permissions: ['view_feedback_list'],
            },
            {
              title: 'Recognition',
              key: '/feedback/recognition',
              className: 'font-bold h-9',
              permissions: ['view_feedback_recognition'],
            },

            {
              title: 'Settings',
              key: '/feedback/settings',
              className: 'font-bold h-9',
              permissions: ['manage_feedback_settings'],
            },
          ],
        },
        {
          title: (
            <span className="flex items-center gap-2 h-12 w-60">
              <CiBookmark
                size={18}
                className={expandedKeys.includes('/tna') ? 'text-blue' : ''}
              />{' '}
              Learning & Growth
            </span>
          ),
          key: '/tna',
          className: 'font-bold',
          permissions: ['view_learning_growth'],
          children: [
            {
              title: 'My-TNA',
              key: '/tna/my-training',
              className: 'font-bold h-9',
              permissions: ['view_my_training'],
            },
            {
              title: 'Training Management',
              key: '/tna/management',
              className: 'font-bold h-9',
              permissions: ['manage_training'],
            },
            {
              title: 'TNA',
              key: '/tna/review',
              className: 'font-bold h-9',
              permissions: ['view_tna_review'],
            },
            {
              title: 'Settings',
              key: '/tna/settings/course-category',
              className: 'font-bold h-9',
              permissions: ['manage_tna_settings'],
            },
          ],
        },
        {
          title: (
            <span className="flex items-center gap-2 h-12 w-60">
              <AiOutlineDollarCircle
                size={18}
                className={expandedKeys.includes('/payroll') ? 'text-blue' : ''}
              />{' '}
              Payroll
            </span>
          ),
          key: 'payroll',
          className: 'font-bold',
          children: [
            {
              title: 'Employee Information',
              key: '/employee-information',
              className: 'font-bold h-9',
              permissions: ['view_employee_information'],
            },
            {
              title: 'Payroll',
              key: '/payroll',
              className: 'font-bold h-9',
              permissions: ['view_payroll_overview'],
            },
            {
              title: 'My Payroll',
              key: '/myPayroll',
              className: 'font-bold h-9',
              permissions: ['view_my_payroll'],
            },
            {
              title: 'Settings',
              key: '/settings',
              className: 'font-bold h-9',
              permissions: ['manage_payroll_settings'],
            },
          ],
        },
        {
          title: (
            <span className="flex items-center gap-2 h-12 w-60">
              <CiCalendar
                size={18}
                className={
                  expandedKeys.includes('/timesheet') ? 'text-blue' : ''
                }
              />{' '}
              Time & Attendance
            </span>
          ),
          key: '/timesheet',
          className: 'font-bold',
          permissions: ['view_timesheet'],
          children: [
            {
              title: 'My Timesheet',
              key: '/timesheet/my-timesheet',
              className: 'font-bold h-9',
              permissions: ['view_my_timesheet'],
            },
            {
              title: 'Employee Attendance',
              key: '/timesheet/employee-attendance',
              className: 'font-bold h-9',
              permissions: ['view_employee_attendance'],
            },
            {
              title: 'Leave Management',
              key: '/timesheet/leave-management/leaves',
              className: 'font-bold h-9',
              permissions: ['manage_leave_management'],
            },
            {
              title: 'Settings',
              key: '/timesheet/settings/closed-date',
              className: 'font-bold h-9',
              permissions: ['manage_timesheet_settings'],
            },
          ],
        },
        {
          title: (
            <span className="flex items-center gap-2 h-12 w-60">
              <PiMoneyLight
                size={18}
                className={
                  expandedKeys.includes('/compensation') ? 'text-blue' : ''
                }
              />{' '}
              Compensation & Benefit
            </span>
          ),
          key: '/compensation',
          className: 'font-bold',
          permissions: ['view_compensation'],
          children: [
            {
              title: 'Allowance',
              key: '/allowance',
              className: 'font-bold h-9',
              permissions: ['view_allowance'],
            },
            {
              title: 'Benefit',
              key: '/benefit',
              className: 'font-bold h-9',
              permissions: ['view_benefit'],
            },
            {
              title: 'Deduction',
              key: '/deduction',
              className: 'font-bold h-9',
              permissions: ['view_deduction'],
            },
            {
              title: 'Settings',
              key: '/compensationSetting',
              className: 'font-bold h-9',
              permissions: ['manage_compensation_settings'],
            },
          ],
        },
        {
          title: (
            <span className="flex items-center gap-2 h-12 w-60">
              <LuCircleDollarSign
                size={18}
                className={
                  expandedKeys.includes('/incentive') ? 'text-blue' : ''
                }
              />{' '}
              Incentives
            </span>
          ),
          key: '/incentive',
          className: 'font-bold',
          permissions: ['view_incentive'],
          children: [
            {
              key: '/incentives',
              title: 'Incentive',
              className: 'font-bold h-9',
              permissions: ['view_incentive_page'],
            },
            {
              title: 'Variable Pay',
              key: '/variable-pay',
              className: 'font-bold h-9',
              permissions: ['view_variable_pay'],
            },
            {
              title: 'Settings',
              key: '/incentives/settings',
              className: 'font-bold h-9',
              permissions: ['manage_incentive_settings'],
            },
          ],
        },
        {
          key: '/admin',
          title: (
            <span className="flex items-center gap-2 h-12 w-60">
              <CiSettings size={18} /> Admin
            </span>
          ),
          className: 'font-bold',
          permissions: ['view_admin_configuration'],
          children: [
            {
              key: '/admin/dashboard',
              title: 'Dashboard',
              className: 'font-bold h-9',
              permissions: ['view_admin_dashboard'],
            },
            {
              key: '/admin/billing',
              title: 'Billing and Invoice',
              className: 'font-bold h-9',
              permissions: ['view_admin_billing'],
            },
            {
              key: '/admin/profile',
              title: 'Update Profile',
              className: 'font-bold h-9',
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
              treeData={filteredMenuItems}
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
            className={`overflow-auto ${!isAdminPage ? 'bg-white' : ''} overflow-auto`}
            style={{
              borderRadius: borderRadiusLG,
              marginTop: '3rem',
              marginRight: `${!isAdminPage ? '1.3rem' : ''}`,
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
