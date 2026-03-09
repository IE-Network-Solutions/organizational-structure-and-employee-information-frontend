'use client';
import React, { ReactNode, useState, useEffect, useRef } from 'react';
import '../../app/globals.css';
import { useRouter, usePathname } from 'next/navigation';
import { MenuOutlined } from '@ant-design/icons';
import NavBar from './topNavBar';
import { IoCloseOutline } from 'react-icons/io5';
import {
  MdDashboard,
  MdGroups,
  MdPersonAdd,
  MdAccessTimeFilled,
  MdTrackChanges,
  MdChatBubble,
  MdSchool,
  MdPayments,
  MdRedeem,
  MdGridView,
  MdAdminPanelSettings,
  MdDomain,
} from 'react-icons/md';
import { Layout, Button, theme, Skeleton, message } from 'antd';

const { Header, Content, Sider } = Layout;
import { removeCookie } from '@/helpers/storageHelper';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import Logo from '../common/logo';
import SimpleLogo from '../common/logo/simpleLogo';
import AccessGuard from '@/utils/permissionGuard';
import { useGetEmployee } from '@/store/server/features/employees/employeeManagment/queries';
import { useGetActiveFiscalYearsData } from '@/store/server/features/organizationStructure/fiscalYear/queries';
import { useGetDepartments } from '@/store/server/features/employees/employeeManagment/department/queries';

import { useEmployeeManagementStore } from '@/store/uistate/features/employees/employeeManagment';
import { CreateEmployeeJobInformation } from '@/app/(afterLogin)/(employeeInformation)/employees/manage-employees/[id]/_components/job/addEmployeeJobInfrmation';
import { useCreateEmployee } from '@/store/server/features/employees/employeeDetail/mutations';
import dayjs from 'dayjs';
import { useUpdateEmployeeInformation } from '@/store/server/features/employees/employeeDetail/mutations';
import JobInfoAccessModal from '@/app/(afterLogin)/dashboard/_components/modal';

interface CustomMenuItem {
  key: string;
  icon?: React.ReactNode;
  title: React.ReactNode; // Changed from `label` to `title`
  className?: string;
  permissions?: string[];
  children?: CustomMenuItem[];
  disabled?: boolean;
  moduleCode?: string;
}

import { useGetModules } from '@/store/server/features/tenant-management/modules/queries';
import { Module } from '@/types/tenant-management';
import { AiOutlineRight } from 'react-icons/ai';

interface MyComponentProps {
  children: ReactNode;
}

const NavMenuItem: React.FC<{
  item: any;
  collapsed: boolean;
  selectedKeys: (string | number | bigint)[];
  setSelectedKeys: React.Dispatch<
    React.SetStateAction<(string | number | bigint)[]>
  >;
  router: any;
  pathname: string;
  triggerRouteLoaderStart: () => void;
  expandedKeys: (string | number | bigint)[];
  setExpandedKeys: React.Dispatch<
    React.SetStateAction<(string | number | bigint)[]>
  >;
}> = ({
  item,
  collapsed,
  selectedKeys,
  setSelectedKeys,
  router,
  pathname,
  triggerRouteLoaderStart,
  expandedKeys,
  setExpandedKeys,
}) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedKeys.includes(item.key);

    // Check if this item or any of its children matches the current path
    const isDirectlyActive =
      selectedKeys.includes(item.key) || pathname === item.key;
    const isChildActive =
      hasChildren &&
      item.children.some(
        (child: any) => selectedKeys.includes(child.key) || pathname === child.key,
      );
    const isActive = isDirectlyActive || isChildActive;

    const handleToggle = () => {
      if (hasChildren) {
        setExpandedKeys((prev) =>
          prev.includes(item.key)
            ? prev.filter((k) => k !== item.key)
            : [...prev, item.key],
        );
      } else {
        const path = String(item.key);
        if (pathname !== path) {
          triggerRouteLoaderStart();
          router.push(path);
          setSelectedKeys([path]);
        }
      }
    };

    return (
      <div className="flex flex-col w-full" data-cy="nav-menu-item-wrapper">
        <div
          data-cy="nav-menu-item"
          onClick={handleToggle}
          className={`
          group flex items-center gap-3 px-3 py-2 cursor-pointer transition-all duration-200 rounded-xl
          ${isActive
              ? 'text-[#3630f0] font-bold'
              : 'text-black font-medium'
            }
          hover:bg-[#E1EFFF] hover:text-[#3630f0]
          ${collapsed ? 'justify-center px-0 mx-[10px]' : ''}
        `}
        >
          <div
            data-cy="nav-menu-item-icon"
            className={`text-[21px] transition-colors ${isActive
              ? 'text-[#3630f0]'
              : 'text-black group-hover:text-[#3630f0]'
              }`}
          >
            {item.icon}
          </div>

          {!collapsed && (
            <span
              data-cy="nav-menu-item-label"
              className="flex-1 text-[14.5px] transition-colors"
            >
              {item.label}
            </span>
          )}
        </div>

        {hasChildren && !collapsed && isExpanded && (
          <div
            className="flex flex-col mt-1 ml-9 space-y-1"
            data-cy="nav-menu-item-children-container"
          >
            {item.children.map((child: any) => {
              const isChildSelected =
                selectedKeys.includes(child.key) || pathname === child.key;
              return (
                <div
                  key={child.key}
                  data-cy="nav-menu-item-child"
                  onClick={() => {
                    const path = String(child.key);
                    if (pathname !== path) {
                      triggerRouteLoaderStart();
                      router.push(path);
                      setSelectedKeys([path]);
                    }
                  }}
                  className={`
                  py-2 px-3 cursor-pointer rounded-lg transition-all duration-200
                  ${isChildSelected
                      ? 'text-[#3630f0] font-bold text-[15.5px]'
                      : 'text-black font-medium text-[14.5px] hover:text-[#3630f0] hover:bg-[#E1EFFF]'
                    }
                `}
                >
                  {child.label}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

const Nav: React.FC<MyComponentProps> = ({ children }) => {
  const {
    token: { borderRadiusLG },
  } = theme.useToken();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileCollapsed, setMobileCollapsed] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { userId } = useAuthenticationStore();
  const { isLoading } = useGetEmployee(userId);
  const { userData } = useAuthenticationStore();
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
  }, [token]);

  const hasEndedFiscalYear =
    !!activeFiscalYear?.isActive &&
    !!activeFiscalYear?.endDate &&
    new Date(activeFiscalYear?.endDate) <= new Date();

  // ===========> Fiscal Year Ended Section <=================

  // Separate array for routes that should be accessible but not shown in navigation
  const hiddenRoutes: { key: string; permissions: string[] }[] = [
    {
      key: '/dashboard',
      permissions: [], // No permissions required
    },
    {
      key: '/',
      permissions: [], // No permissions required
    },
    {
      key: '/employees/manage-employees/[id]',
      permissions: [], // No permissions required
    },
    {
      key: '/employee-information/[id]',
      permissions: [], // Allow all users to access employee information
    },
    {
      key: '/feedback/action-plan',
      permissions: ['view_feedback_conversation'], // Same permission as conversation page
    },
    {
      key: '/feedback/meeting',
      permissions: ['view_feedback_conversation'], // Same permission as conversation page
    },
    {
      key: '/feedback/categories',
      permissions: ['view_feedback_conversation'], // Same permission as conversation page
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

    // First add hidden routes
    hiddenRoutes.forEach((route) => {
      if (route.key && route.permissions) {
        routes.push({
          route: route.key,
          permissions: route.permissions,
        });
      }
    });

    // Then add visible menu routes
    traverse(menuItems);
    return routes;
  };

  const treeData: CustomMenuItem[] = [
    {
      icon: <MdDashboard style={{ fontSize: 20 }} />,
      title: 'Dashboard',
      key: '/dashboard',
      className: 'font-bold',
      permissions: [],
      moduleCode: 'DASHBOARD',
    },
    {
      icon: <MdDomain style={{ fontSize: 20 }} />,
      title: 'Organization',
      key: '/organization',
      className: 'font-bold',
      permissions: ['view_organization'],
      disabled: hasEndedFiscalYear,
      moduleCode: 'ORGANIZATION',
      children: [
        {
          title: <span data-cy="nav-tree-org-structure">Org Structure</span>,
          key: '/organization/chart',
          className: 'font-bold',
          permissions: ['view_organization_chart'],
          disabled: hasEndedFiscalYear,
        },
        {
          title: <span data-cy="nav-tree-org-settings">Settings</span>,
          key: '/organization/settings',
          className: 'font-bold',
          permissions: ['view_organization_settings'],
        },
      ],
    },
    {
      icon: <MdGroups style={{ fontSize: 20 }} />,
      title: 'Employees',
      key: '/employees',
      className: 'font-bold',
      permissions: ['view_employees'],
      disabled: hasEndedFiscalYear,
      moduleCode: 'EMPLOYEES',
      children: [
        {
          title: (
            <span data-cy="nav-tree-manage-employees">Manage Employees</span>
          ),
          key: '/employees/manage-employees',
          className: 'font-bold',
          permissions: ['manage_employees'],
        },
        {
          title: <span data-cy="nav-tree-employees-settings">Settings</span>,
          key: '/employees/settings',
          className: 'font-bold',
          permissions: ['manage_employee_settings'],
        },
      ],
    },
    {
      icon: <MdPersonAdd style={{ fontSize: 20 }} />,
      title: 'Talent Acquisition',
      key: '/recruitment',
      className: 'font-bold',
      permissions: ['view_recruitment'],
      disabled: hasEndedFiscalYear,
      moduleCode: 'RECRUITMENT',
      children: [
        {
          title: (
            <span data-cy="nav-tree-recruitment-dashboard">Dashboard</span>
          ),
          key: '/recruitment/dashboard',
          className: 'font-bold',
          permissions: ['view_recruitment_dashboard'],
        },
        {
          title: <span data-cy="nav-tree-recruitment-jobs">Jobs</span>,
          key: '/recruitment/jobs',
          className: 'font-bold',
          permissions: ['manage_recruitment_jobs'],
        },
        {
          title: (
            <span data-cy="nav-tree-ai-job-matching">AI Job Matching</span>
          ),
          key: '/recruitment/ai-job-matching',
          className: 'font-bold',
          permissions: ['manage_recruitment_jobs'],
          disabled: hasEndedFiscalYear,
        },
        {
          title: <span data-cy="nav-tree-candidates">Candidates</span>,
          key: '/recruitment/candidate',
          className: 'font-bold',
          permissions: ['manage_recruitment_candidates'],
        },
        {
          title: (
            <span data-cy="nav-tree-talent-resource">Talent Resource</span>
          ),
          key: '/recruitment/talent-resource',
          className: 'font-bold',
          permissions: ['manage_recruitment_talent_pool'],
        },
        {
          title: (
            <span data-cy="nav-tree-recruitment-settings" className="font-bold">
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
      icon: <MdTrackChanges style={{ fontSize: 20 }} />,
      title: 'OKR',
      key: '/okr-menu',
      className: 'font-bold',
      permissions: ['view_okr'],
      disabled: hasEndedFiscalYear,
      moduleCode: 'OKR',
      children: [
        {
          title: <span data-cy="nav-tree-okr-dashboard">Dashboard</span>,
          key: '/okr/dashboard',
          className: 'font-bold',
          permissions: ['view_okr_dashboard'],
        },
        {
          title: <span data-cy="nav-tree-okr">OKR</span>,
          key: '/okr',
          className: 'font-bold',
          permissions: ['view_okr_overview'],
        },
        {
          title: (
            <span data-cy="nav-tree-planning-reporting">
              Planning and Reporting
            </span>
          ),
          key: '/planning-and-reporting',
          className: 'font-bold',
          permissions: ['manage_planning_reporting'],
        },
        {
          title: (
            <span data-cy="nav-tree-weekly-priority">Weekly Priority</span>
          ),
          key: '/weekly-priority',
          className: 'font-bold h-8',
          permissions: ['view_weekly_priority'],
        },
        {
          title: <span data-cy="nav-tree-okr-settings">Settings</span>,
          key: '/okr/settings',
          className: 'font-bold',
          permissions: ['manage_okr_settings'],
        },
      ],
    },
    {
      icon: <MdChatBubble style={{ fontSize: 20 }} />,
      title: 'CFR',
      key: 'feedback-menu',
      className: 'font-bold',
      permissions: ['view_feedback'],
      disabled: hasEndedFiscalYear,
      moduleCode: 'CFR',
      children: [
        {
          title: <span data-cy="nav-tree-conversation">Conversation</span>,
          key: '/feedback/conversation',
          className: 'font-bold',
          permissions: ['view_feedback_conversation'],
        },
        {
          title: <span data-cy="nav-tree-feedback">Feedback</span>,
          key: '/feedback/feedback',
          className: 'font-bold',
          permissions: ['view_feedback_list'],
        },
        {
          title: <span data-cy="nav-tree-recognition">Recognition</span>,
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
      icon: <MdSchool style={{ fontSize: 20 }} />,
      title: 'Learning & Growth',
      key: 'tna-menu',
      className: 'font-bold',
      permissions: ['view_learning_growth'],
      disabled: hasEndedFiscalYear,
      moduleCode: 'TNA',
      children: [
        {
          title: (
            <span data-cy="nav-tree-training-management">
              Training Management
            </span>
          ),
          key: '/tna/management',
          className: 'font-bold',
          permissions: ['manage_training'],
        },
        {
          title: <span data-cy="nav-tree-tna-settings">Settings</span>,
          key: '/tna/settings/course-category',
          className: 'font-bold',
          permissions: ['manage_tna_settings'],
        },
      ],
    },
    {
      icon: <MdPayments style={{ fontSize: 20 }} />,
      title: 'Payroll',
      key: '/payroll-menu',
      className: 'font-bold',
      permissions: ['view_payroll_menu'],
      disabled: hasEndedFiscalYear,
      moduleCode: 'PAYROLL',
      children: [
        {
          title: (
            <span data-cy="nav-tree-employee-information">
              Employee Information
            </span>
          ),
          key: '/employee-information',
          className: 'font-bold',
          permissions: ['view_employee_information'],
        },
        {
          title: <span data-cy="nav-tree-payroll">Payroll</span>,
          key: '/payroll',
          className: 'font-bold',
          permissions: ['view_payroll_overview'],
        },
        {
          title: <span data-cy="nav-tree-my-payroll">My Payroll</span>,
          key: '/myPayroll',
          className: 'font-bold',
          permissions: ['view_my_payroll'],
        },
        {
          title: <span data-cy="nav-tree-payroll-settings">Settings</span>,
          key: '/settings',
          className: 'font-bold',
          permissions: ['manage_payroll_settings'],
        },
      ],
    },
    {
      icon: <MdAccessTimeFilled style={{ fontSize: 20 }} />,
      title: 'Time & Attendance',
      key: 'timesheet-menu',
      className: 'font-bold',
      permissions: ['view_timesheet'],
      disabled: hasEndedFiscalYear,
      moduleCode: 'TIMESHEET',
      children: [
        {
          title: <span data-cy="nav-tree-timesheet-dashboard">Dashboard</span>,
          key: '/timesheet/dashboard',
          className: 'font-bold',
          permissions: ['view_timesheet_dashboard'],
        },
        {
          title: <span data-cy="nav-tree-my-timesheet">My Timesheet</span>,
          key: '/timesheet/my-timesheet',
          className: 'font-bold',
          permissions: ['view_my_timesheet'],
        },
        {
          title: (
            <span data-cy="nav-tree-employee-attendance">
              Employee Attendance
            </span>
          ),
          key: '/timesheet/employee-attendance',
          className: 'font-bold',
          permissions: ['view_employee_attendance'],
        },
        {
          title: (
            <span data-cy="nav-tree-leave-management">Leave Management</span>
          ),
          key: '/timesheet/leave-management/leaves',
          className: 'font-bold',
          permissions: ['manage_leave_management'],
        },
        {
          title: <span data-cy="nav-tree-timesheet-settings">Settings</span>,
          key: '/timesheet/settings/closed-date',
          className: 'font-bold',
          permissions: ['manage_timesheet_settings'],
        },
      ],
    },
    {
      icon: <MdGridView style={{ fontSize: 20 }} />,
      title: 'Compensation & Benefit',
      key: 'compensation-menu',
      className: 'font-bold',
      permissions: ['view_compensation'],
      disabled: hasEndedFiscalYear,
      moduleCode: 'COMPENSATION',
      children: [
        {
          title: <span data-cy="nav-tree-allowance">Allowance</span>,
          key: '/allowance',
          className: 'font-bold',
          permissions: ['view_allowance'],
        },
        {
          title: <span data-cy="nav-tree-benefit">Benefit</span>,
          key: '/benefit',
          className: 'font-bold',
          permissions: ['view_benefit'],
        },
        {
          title: <span data-cy="nav-tree-deduction">Deduction</span>,
          key: '/deduction',
          className: 'font-bold',
          permissions: ['view_deduction'],
        },
        {
          title: <span data-cy="nav-tree-compensation-settings">Settings</span>,
          key: '/compensationSetting',
          className: 'font-bold',
          permissions: ['manage_compensation_settings'],
        },
      ],
    },
    {
      icon: <MdRedeem style={{ fontSize: 20 }} />,
      title: 'Incentives',
      key: 'incentive-menu',
      className: 'font-bold',
      permissions: ['view_incentive'],
      disabled: hasEndedFiscalYear,
      moduleCode: 'INCENTIVE',
      children: [
        {
          title: <span data-cy="nav-tree-incentive">Incentive</span>,
          key: '/incentives',
          className: 'font-bold',
          permissions: ['view_incentive_page'],
        },
        {
          title: <span data-cy="nav-tree-variable-pay">Variable Pay</span>,
          key: '/variable-pay',
          className: 'font-bold',
          permissions: ['view_variable_pay'],
        },
        {
          title: <span data-cy="nav-tree-incentive-settings">Settings</span>,
          key: '/incentives/settings',
          className: 'font-bold',
          permissions: ['manage_incentive_settings'],
        },
      ],
    },
    {
      icon: <MdAdminPanelSettings style={{ fontSize: 20 }} />,
      title: 'Audit Log',
      key: '/audit-log',
      className: 'font-bold',
      permissions: ['view_audit_log'],
      disabled: hasEndedFiscalYear,
      moduleCode: 'AUDIT_LOG',
    },
    {
      icon: <MdAdminPanelSettings style={{ fontSize: 20 }} />,
      title: 'Admin',
      key: 'admin-menu',
      className: 'font-bold',
      permissions: ['view_admin_configuration'],
      disabled: hasEndedFiscalYear,
      moduleCode: 'ADMIN',
      children: [
        {
          title: <span data-cy="nav-tree-admin-dashboard">Dashboard</span>,
          key: '/admin/dashboard',
          className: 'font-bold',
          permissions: ['view_admin_dashboard'],
        },
        {
          title: (
            <span data-cy="nav-tree-admin-billing">Billing and Invoice</span>
          ),
          key: '/admin/billing',
          className: 'font-bold',
          permissions: ['view_admin_billing'],
        },
        {
          title: <span data-cy="nav-tree-admin-profile">Update Profile</span>,
          key: '/admin/profile',
          className: 'font-bold',
          permissions: ['view_admin_profile'],
        },
      ],
    },
  ];

  // Helper function to match dynamic routes like [id] to UUIDs or any non-slash segment
  const isRouteMatch = (routePattern: string, pathname: string) => {
    // Match [id] to UUIDs (or any non-slash segment)
    if (routePattern.includes('[id]')) {
      // UUID regex: [0-9a-fA-F-]{36} (simple version)
      const regexPattern = routePattern.replace('[id]', '[0-9a-fA-F-]{36}');
      const regex = new RegExp('^' + regexPattern + '$');
      return regex.test(pathname);
    }
    // Generic dynamic segment: [something] => [^/]+
    if (routePattern.match(/\[.*?\]/g)) {
      const regexPattern = routePattern.replace(/\[.*?\]/g, '[^/]+');
      const regex = new RegExp('^' + regexPattern + '$');
      return regex.test(pathname);
    }
    return routePattern === pathname;
  };

  const checkPathnamePermissions = (pathname: string): boolean => {
    // Get all routes and their permissions
    const routesWithPermissions = getRoutesAndPermissions(treeData);

    // Check if user is owner - owners have access to all routes
    const isOwner = userData?.role?.slug?.toLowerCase() === 'owner';
    if (isOwner) {
      return true;
    }

    // First check if the pathname matches any defined route (supporting dynamic segments)
    const matchingRoute = routesWithPermissions.find((route) => {
      if (isRouteMatch(route.route, pathname)) {
        return true;
      }
      // Check for parent-child relationship - allow any level of nesting
      if (pathname.startsWith(route.route + '/')) {
        return true;
      }
      return false;
    });

    // If no matching route found, check if it's a deeply nested route
    if (!matchingRoute) {
      // For deeply nested routes without explicit permissions,
      // check if any parent route exists and has permissions
      const pathParts = pathname.split('/').filter(Boolean);

      // Try to find a parent route that has permissions
      for (let i = pathParts.length - 1; i > 0; i--) {
        const parentPath = '/' + pathParts.slice(0, i).join('/');
        const parentRoute = routesWithPermissions.find((route) =>
          isRouteMatch(route.route, parentPath),
        );

        if (parentRoute) {
          // Check if user has permissions for parent route
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

      // If no parent route found or no permissions, deny access
      return false;
    }

    // If route exists but has no permissions, allow access
    if (!matchingRoute.permissions || matchingRoute.permissions.length === 0) {
      return true;
    }

    // Get user's permissions from the authentication store

    const userPermissions = userData?.userPermissions || [];

    // Check if user has ALL required permissions for this route

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
  const { data: modulesData, isLoading: modulesLoading } = useGetModules({
    filter: { isActive: true },
  });
  const { data: departments, isLoading: departmentsLoading } =
    useGetDepartments();
  const { data: employeeData, isLoading: employeeDataLoading } =
    useGetEmployee(userId);
  const { setIsAddEmployeeJobInfoModalVisible } = useEmployeeManagementStore();

  const isLoadingData =
    departmentsLoading ||
    employeeDataLoading ||
    modulesLoading ||
    !departments ||
    !employeeData;

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
  }, [departments, employeeData, router, isLoadingData, pathName, userId]);

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
  }, [pathname, router]);

  const findParentMenuKey = (
    pathname: string,
    menuItems: CustomMenuItem[],
  ): string | null => {
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
  };

  useEffect(() => {
    saveExpandedKeysToStorage(expandedKeys);
  }, [expandedKeys]);

  useEffect(() => {
    if (pathname === '/dashboard' || pathname === '/') {
      setExpandedKeys([]);
      return;
    }
    const parentKey = findParentMenuKey(pathname, treeData);
    if (parentKey) {
      setExpandedKeys((prev) => {
        if (prev.length !== 1 || prev[0] !== parentKey) {
          return [parentKey];
        }
        return prev;
      });
    }
  }, [pathname]);

  useEffect(() => {
    setSelectedKeys([pathname]);
  }, [pathname]);

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

    const parentKey = findParentMenuKey(pathname, treeData);
    if (parentKey && expandedKeys.length === 0) {
      setExpandedKeys([parentKey]);
    }
  }, []);

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
    } catch (error) { }
  };

  const groupedMenuItems = React.useMemo(() => {
    // 1. Filter treeData items by user permissions
    const accessibleTreeItems = treeData
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

    // 2. Map treeData items by title for easy lookup
    const treeItemMap = new Map<string, (typeof accessibleTreeItems)[0]>();
    accessibleTreeItems.forEach((item) => {
      treeItemMap.set(String(item.title).toLowerCase().trim(), item);
    });

    // Handles mismatches between backend names and sidebar titles
    const nameMapping: Record<string, string> = {
      overview: 'dashboard',
      people: 'employees',
      performance: 'okr',
      finance: 'payroll',
      administration: 'admin',
      organization: 'organization',
      employee: 'employees',
      'learning and growth': 'learning & growth',
      'time and attendance': 'time & attendance',
      incentive: 'incentives',
      'compensation & benefit': 'compensation & benefit',
      timesheet: 'time & attendance',
      'employee info': 'employees',
    };

    const modules: Module[] = modulesData?.items || [];

    // In the new API, items like "Overview", "People", "Performance", "Finance"
    // are the parents, and their `moduleGroup` is a comma‑separated list of
    // child module names. Leaf modules (Dashboard, Organization, Employee, ...)
    // have `moduleGroup: null`.
    const parentModules = modules
      .filter(
        (m) =>
          m.isActive &&
          m.moduleGroup &&
          typeof m.moduleGroup === 'string' &&
          (m.moduleGroup as unknown as string).trim().length > 0,
      )
      .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));

    const leafModules = modules.filter(
      (m) => m.isActive && (!m.moduleGroup || (m.moduleGroup as any) === null),
    );

    const menuItems: any[] = [];

    parentModules.forEach((parent) => {
      const rawGroup = (parent.moduleGroup as unknown as string) || '';
      const childNames = rawGroup
        .split(',')
        .map((n) => n.trim())
        .filter(Boolean);

      if (childNames.length === 0) {
        // moduleGroup effectively empty → do not show the parent
        return;
      }

      const groupChildren: any[] = [];

      childNames.forEach((childName) => {
        // Find the leaf module that corresponds to this child name
        const leaf = leafModules.find(
          (m) => m.name.toLowerCase().trim() === childName.toLowerCase().trim(),
        );

        // Even if we don't need `leaf` data directly, this guarantees the
        // child exists in the subscription; otherwise we skip it.
        if (!leaf) return;

        const normalized = childName.toLowerCase().trim();
        const mappedName = nameMapping[normalized] || normalized;
        const treeItem = treeItemMap.get(mappedName);

        if (!treeItem) return;

        groupChildren.push({
          key: treeItem.key,
          icon: treeItem.icon,
          label: treeItem.title,
          children:
            treeItem.children && treeItem.children.length > 0
              ? treeItem.children.map((child) => ({
                key: child.key,
                label: child.title,
              }))
              : undefined,
        });
      });

      // If this parent has no resolved children, skip it as requested
      if (groupChildren.length === 0) {
        return;
      }

      menuItems.push({
        type: 'group',
        key: parent.id,
        label: parent.name,
        children: groupChildren,
      });
    });

    return menuItems;
  }, [treeData, modulesData]);
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
    <Layout style={{ background: '#fff' }}>
      <Sider
        theme="light"
        width={280}
        style={{
          overflow: 'visible',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 1010,
          backgroundColor: '#F0F7FF',
          borderRight: '1px solid #E5E7EB',
          transform: isMobile && mobileCollapsed ? 'translateX(-100%)' : 'none',
          transition: 'transform 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
          paddingBottom: '24px',
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
        collapsedWidth={80}
      >
        <div data-cy="nav-sider-logo-collapsed" className="my-2">
          {collapsed && <SimpleLogo />}
        </div>

        <div
          data-cy="nav-sider-logo-wrap"
          className="flex items-center justify-between px-4 pt-6 pb-0"
        >
          <div data-cy="nav-sider-logo" className="flex items-center gap-2">
            {!collapsed && <Logo type="selamnew" />}
          </div>
        </div>

        <button
          data-cy="nav-sider-toggle"
          onClick={toggleCollapsed}
          className="absolute -right-3 top-[37px] -translate-y-1/2 flex items-center justify-center w-6 h-6 rounded-full bg-[#1D4ED8] text-white shadow-md hover:bg-[#1e40af] transition-all"
          style={{ zIndex: 10001 }}
        >
          {collapsed ? (
            <AiOutlineRight size={12} />
          ) : (
            <AiOutlineRight size={12} className="rotate-180" />
          )}
        </button>
        <div
          data-cy="nav-sider-menu-scroll"
          className="flex-1 overflow-y-auto overflow-x-hidden hide-scrollbar"
        >
          <div
            data-cy="nav-sider-menu-inner"
            className={`${collapsed ? 'mt-1' : 'mt-2'} pb-20 ${collapsed ? 'px-0' : 'pl-6 pr-3'}`}
          >
            {!isMounted || isLoading ? (
              <div
                data-cy="nav-sider-loading"
                className="px-5 w-full h-full flex justify-center items-center my-5"
              >
                <Skeleton active />
              </div>
            ) : (
              <div data-cy="nav-sider-groups" className="space-y-6">
                {groupedMenuItems.map((group: any) => {
                  const isExpanded = true;

                  return (
                    <div
                      data-cy="nav-sider-group"
                      key={group.key}
                      className="space-y-1"
                    >
                      <div
                        data-cy="nav-sider-group-header"
                        className="px-4 mb-2 mt-4 first:mt-2"
                      >
                        <div
                          data-cy="nav-sider-group-label-wrap"
                          className={`w-full text-[13px] font-light text-[#64748B] tracking-wide transition-colors ${collapsed ? 'hidden' : ''
                            }`}
                        >
                          {group.label}
                        </div>
                      </div>

                      <div
                        data-cy="nav-sider-group-children"
                        className={`space-y-1 transition-all duration-300 ${isExpanded ? 'opacity-100' : 'hidden opacity-0'
                          }`}
                      >
                        {group.children?.map((item: any) => (
                          <NavMenuItem
                            key={item.key}
                            item={item}
                            collapsed={collapsed}
                            selectedKeys={selectedKeys}
                            setSelectedKeys={setSelectedKeys}
                            router={router}
                            pathname={pathname}
                            triggerRouteLoaderStart={triggerRouteLoaderStart}
                            expandedKeys={expandedKeys}
                            setExpandedKeys={setExpandedKeys}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div
          data-cy="nav-sider-admin-wrap"
          className={`px-4 mt-auto ${collapsed ? 'flex justify-center' : ''}`}
        >
          <Button
            data-cy="nav-sider-admin-btn"
            type="primary"
            size="large"
            icon={<MdAdminPanelSettings size={22} />}
            className={`
            flex items-center justify-center bg-[#1D4ED8] hover:bg-[#1e40af] border-none shadow-lg transition-all duration-300
            ${collapsed
                ? 'w-[52px] h-[52px] rounded-xl'
                : 'w-full h-12 rounded-xl text-[14px] font-semibold gap-2'
              }
          `}
            onClick={() => router.push('/admin/dashboard')}
          >
            {!collapsed && 'Admin Console'}
          </Button>
        </div>
      </Sider>
      <Layout
        style={{
          marginLeft: 0,
          transition: 'margin-left 0.3s ease',
          background: '#ffffff',
        }}
      >
        <Header
          style={{
            padding: 0,
            background: '#fff',
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
            height: '74px',
            borderBottom: '1px solid #F1F5F9',
            boxShadow: 'none',
          }}
        >
          {isMobile && (
            <div
              data-cy="nav-header-mobile-toggle-wrap"
              className="p-[10px] flex justify-center items-center"
            >
              <Button
                data-cy="nav-header-mobile-toggle"
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

          <NavBar handleLogout={handleLogout} />
        </Header>
        <Content
          className="overflow-y-hidden min-h-screen"
          style={{
            paddingInline: 0,
            paddingLeft: isMobile ? 0 : collapsed ? 80 : 280,
            paddingRight: isMobile ? 0 : 24,
            paddingTop: '74px',
            transition: 'padding-left 0.3s ease',
            background: '#ffffff',
          }}
        >
          {isMounted && isCheckingPermissions ? (
            <div
              data-cy="nav-content-loading"
              className="flex justify-center items-center h-screen"
            >
              <Skeleton active />
            </div>
          ) : (
            <div
              data-cy="nav-content-inner"
              className="overflow-auto"
              style={{
                borderRadius: borderRadiusLG,
                marginTop: 0,
                marginRight: 24,
                marginLeft: 24,
                background: '#ffffff',
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
