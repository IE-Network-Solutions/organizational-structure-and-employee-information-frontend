'use client';
import React, { ReactNode, useState, useEffect, useRef } from 'react';
import '../../app/globals.css';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { MenuOutlined } from '@ant-design/icons';
import NavBar from './topNavBar';
import { IoCloseOutline } from 'react-icons/io5';
import {
  MdPeople,
  MdPersonSearch,
  MdSchool,
  MdAccountBalanceWallet,
  MdCardGiftcard,
  MdWidgets,
  MdAdminPanelSettings,
  MdSettings,
} from 'react-icons/md';
import AlbumIcon from '@mui/icons-material/Album';
import ChatBubbleOutlinedIcon from '@mui/icons-material/ChatBubbleOutlined';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import { Layout, Button, theme, Skeleton, message } from 'antd';

const { Header, Content, Sider } = Layout;
import { removeCookie } from '@/helpers/storageHelper';

// Helper function to match dynamic routes like [id] to UUIDs or any non-slash segment
const isRouteMatch = (routePattern: string, pathname: string) => {
  // Exact match
  if (routePattern === pathname) return true;

  // Conversation: surveys and category list live under /feedback/categories — keep nav item active
  if (routePattern === '/feedback/conversation') {
    if (
      pathname === '/feedback/categories' ||
      pathname.startsWith('/feedback/categories/')
    ) {
      return true;
    }
  }

  // Time & Attendance → Settings: one nav item should stay active for all settings sub-routes
  if (routePattern === '/timesheet/settings/closed-date') {
    return (
      pathname === '/timesheet/settings' ||
      pathname.startsWith('/timesheet/settings/')
    );
  }

  // Match [id] to UUIDs (or any non-slash segment)
  if (routePattern.includes('[id]')) {
    const regexPattern = routePattern.replace('[id]', '[0-9a-fA-F-]{36}');
    const regex = new RegExp('^' + regexPattern + '(/.*)?$');
    return regex.test(pathname);
  }

  // Generic dynamic segment: [something] => [^/]+
  if (routePattern.match(/\[.*?\]/g)) {
    const regexPattern = routePattern.replace(/\[.*?\]/g, '[^/]+');
    const regex = new RegExp('^' + regexPattern + '(/.*)?$');
    return regex.test(pathname);
  }

  // Prefix match for subpages
  return pathname === routePattern || pathname.startsWith(routePattern + '/');
};

import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import AccessGuard from '@/utils/permissionGuard';
import { useGetEmployee } from '@/store/server/features/employees/employeeManagment/queries';
import { useGetActiveFiscalYearsData } from '@/store/server/features/organizationStructure/fiscalYear/queries';
import { useGetDepartments } from '@/store/server/features/employees/employeeManagment/department/queries';

import { useEmployeeManagementStore } from '@/store/uistate/features/employees/employeeManagment';
// import { CreateEmployeeJobInformation } from '@/app/(afterLogin)/(employeeInformation)/employees/manage-employees/[id]/_components/job/addEmployeeJobInfrmation';
// import { useCreateEmployee } from '@/store/server/features/employees/employeeDetail/mutations';
// import dayjs from 'dayjs';
// import { useUpdateEmployeeInformation } from '@/store/server/features/employees/employeeDetail/mutations';
import JobInfoAccessModal from '@/app/(afterLogin)/dashboard/_components/modal';
import { useGetSubscriptionByTenant } from '@/store/server/features/tenant-management/manage-subscriptions/queries';
import { useGetSubscriptions } from '@/store/server/features/tenant-management/subscriptions/queries';

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
import { Module, Subscription } from '@/types/tenant-management';
import { AiOutlineRight } from 'react-icons/ai';
import Link from 'next/link';

interface MyComponentProps {
  children: ReactNode;
}

const NavMenuItem: React.FC<{
  item: any;
  collapsed: boolean;
  colorPrimary: string;
  fontSize: number;
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
  navigationDisabled?: boolean;
  /** Mobile: close off-canvas sidebar after navigating to a route */
  onNavigate?: () => void;
}> = ({
  item,
  collapsed,
  colorPrimary,
  fontSize,
  selectedKeys,
  setSelectedKeys,
  router,
  pathname,
  triggerRouteLoaderStart,
  expandedKeys,
  setExpandedKeys,
  navigationDisabled,
  onNavigate,
}) => {
  const hasChildren = item.children && item.children.length > 0;
  const isExpanded = expandedKeys.includes(item.key);
  const isItemDisabled = Boolean(item.disabled) || Boolean(navigationDisabled);

  const bestMatchingChildKey = React.useMemo(() => {
    if (!hasChildren) return undefined;
    const matches = item.children
      .map((child: any) => String(child.key))
      .filter((key: string) => isRouteMatch(key, pathname));
    if (matches.length === 0) return undefined;
    return matches.sort((a: string, b: string) => b.length - a.length)[0];
  }, [hasChildren, item.children, pathname]);

  // Check if this item or any of its children matches the current path
  const isDirectlyActive =
    selectedKeys.includes(item.key) || isRouteMatch(String(item.key), pathname);
  const isChildActive = Boolean(bestMatchingChildKey);
  const isActive =
    isDirectlyActive || isChildActive || (hasChildren && isExpanded);

  const handleToggle = () => {
    if (isItemDisabled) return;
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
      onNavigate?.();
    }
  };

  return (
    <div className="flex flex-col w-full" data-cy="nav-menu-item-wrapper">
      <div
        data-cy="nav-menu-item"
        onClick={handleToggle}
        className={`
          group flex items-center gap-3 py-2 transition-all duration-200 rounded-[6px]
          ${
            isActive ? 'font-bold' : 'text-black font-medium hover:bg-[#E6F4FF]'
          }
          ${isItemDisabled ? 'opacity-50 cursor-not-allowed hover:bg-transparent' : 'cursor-pointer'}
          ${collapsed ? 'justify-center px-0 mx-[10px]' : 'pl-[5px] -ml-[5px]'}
        `}
        style={isActive ? { color: colorPrimary } : undefined}
      >
        <div
          data-cy="nav-menu-item-icon"
          className={`text-[21px] transition-colors ${
            isActive ? '' : 'text-black'
          }`}
          style={isActive ? { color: colorPrimary } : undefined}
        >
          {item.icon}
        </div>

        {!collapsed && (
          <span
            data-cy="nav-menu-item-label"
            className="flex-1 transition-colors"
            style={{ fontSize }}
          >
            {item.label}
          </span>
        )}
      </div>

      {hasChildren && !collapsed && isExpanded && (
        <div
          className="flex flex-col mt-1 ml-[33px] space-y-1"
          data-cy="nav-menu-item-children-container"
        >
          {item.children.map((child: any) => {
            const isChildSelected =
              selectedKeys.includes(child.key) ||
              String(child.key) === bestMatchingChildKey;
            return (
              <div
                key={child.key}
                data-cy="nav-menu-item-child"
                onClick={() => {
                  if (isItemDisabled) return;
                  const path = String(child.key);
                  if (pathname !== path) {
                    triggerRouteLoaderStart();
                    router.push(path);
                    setSelectedKeys([path]);
                  }
                  onNavigate?.();
                }}
                className={`
                  py-2 rounded-[6px] transition-all duration-200 pl-[33px] -ml-[33px]
                  ${
                    isChildSelected
                      ? 'font-normal'
                      : 'text-black font-medium hover:bg-[#E6F4FF]'
                  }
                  ${isItemDisabled ? 'opacity-50 cursor-not-allowed hover:bg-transparent' : 'cursor-pointer'}
                `}
                style={{
                  fontSize,
                  ...(isChildSelected ? { color: colorPrimary } : {}),
                }}
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
    token: { borderRadiusLG, colorPrimary, fontSize, fontSizeSM },
  } = theme.useToken();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileCollapsed, setMobileCollapsed] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { userId, tenantId } = useAuthenticationStore();
  useGetEmployee(userId);
  const { userData } = useAuthenticationStore();
  // const { mutate: updateEmployeeInformation } = useUpdateEmployeeInformation();
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
  }, [token, refetch]);

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

  const getRoutesAndPermissions = React.useCallback(
    (
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
    },
    [hiddenRoutes],
  );

  const treeData: CustomMenuItem[] = React.useMemo(
    () => [
      {
        icon: <DashboardIcon style={{ fontSize: 20 }} />,
        title: 'Dashboard',
        key: '/dashboard',
        className: 'font-bold',
        permissions: [],
        moduleCode: 'DASHBOARD',
      },
      {
        icon: <AccountTreeIcon style={{ fontSize: 20 }} />,
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
        icon: <MdPeople style={{ fontSize: 20 }} />,
        title: 'Employees',
        key: '/employees',
        className: 'font-bold',
        permissions: ['view_employees'],
        disabled: hasEndedFiscalYear,
        moduleCode: 'EMPLOYEES',
        children: [
          {
            title: (
              <span data-cy="nav-tree-manage-employees-dashboard">
                Dashboard
              </span>
            ),
            key: '/employees/dashboard',
            className: 'font-bold',
            permissions: ['view_employees_dashboard'],
          },
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
        icon: <MdPersonSearch style={{ fontSize: 20 }} />,
        title: 'Talent Acquisition',
        key: '/recruitment',
        className: 'font-bold',
        permissions: ['view_recruitment'],
        disabled: hasEndedFiscalYear,
        moduleCode: 'RECRUITMENT',
        children: [
          {
            title: <span data-cy="nav-tree-recruitment-jobs">Jobs</span>,
            key: '/recruitment/jobs',
            className: 'font-bold',
            permissions: ['manage_recruitment_jobs'],
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
              <span
                data-cy="nav-tree-recruitment-settings"
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
        icon: <AlbumIcon style={{ fontSize: 20 }} />,
        title: 'OKR',
        key: '/okr-menu',
        className: 'font-bold',
        permissions: ['view_okr'],
        disabled: hasEndedFiscalYear,
        moduleCode: 'OKR',
        children: [
          {
            title: <span data-cy="nav-tree-okr">OKR</span>,
            key: '/okr',
            className: 'font-bold',
            permissions: ['view_okr_overview'],
          },
          {
            title: (
              <span data-cy="nav-tree-planning-reporting">Plan & Report</span>
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
        icon: <ChatBubbleOutlinedIcon style={{ fontSize: 20 }} />,
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
        icon: <MdAccountBalanceWallet style={{ fontSize: 20 }} />,
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
        icon: <AccessTimeFilledIcon style={{ fontSize: 20 }} />,
        title: 'Time & Attendance',
        key: 'timesheet-menu',
        className: 'font-bold',
        permissions: ['view_timesheet'],
        disabled: hasEndedFiscalYear,
        moduleCode: 'TIMESHEET',
        children: [
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
        icon: <MdWidgets style={{ fontSize: 20 }} />,
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
          // {
          //   title: (
          //     <span data-cy="nav-tree-compensation-settings">Settings</span>
          //   ),
          //   key: '/compensationSetting',
          //   className: 'font-bold',
          //   permissions: ['manage_compensation_settings'],
          // },
        ],
      },
      {
        icon: <MdCardGiftcard style={{ fontSize: 20 }} />,
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
          // {
          //   title: <span data-cy="nav-tree-incentive-settings">Settings</span>,
          //   key: '/incentives/settings',
          //   className: 'font-bold',
          //   permissions: ['manage_incentive_settings'],
          // },
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
    ],
    [hasEndedFiscalYear],
  );

  // Helper function moved to global scope

  const checkPathnamePermissions = React.useCallback(
    (pathname: string): boolean => {
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
      if (
        !matchingRoute.permissions ||
        matchingRoute.permissions.length === 0
      ) {
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
    },
    [treeData, userData],
  );
  const { data: modulesData, isLoading: modulesLoading } = useGetModules({
    filter: { isActive: true },
  });
  const { data: subscriptionData } = useGetSubscriptionByTenant(
    tenantId,
    !!tenantId,
  );
  const { data: subscriptionsData, isLoading: subscriptionsLoading } =
    useGetSubscriptions({
      filter: {
        ...(tenantId ? { tenantId: [tenantId] } : {}),
      },
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
    subscriptionsLoading ||
    !departments ||
    !employeeData;

  const subscriptionExpired = React.useMemo(() => {
    const items = subscriptionsData?.items as Subscription[] | undefined;
    if (!Array.isArray(items) || items.length === 0) return false;
    const sorted = [...items].sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime(),
    );
    const latest = sorted[0];
    if (!latest) return false;
    if (latest.isActive) return false;
    const endAtMs = latest.endAt ? new Date(latest.endAt).getTime() : NaN;
    return Number.isFinite(endAtMs) && endAtMs < Date.now();
  }, [subscriptionsData]);

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
  }, [pathname, router, checkPathnamePermissions, setIsCheckingPermissions]);

  const findParentMenuKey = React.useCallback(
    (pathname: string, menuItems: CustomMenuItem[]): string | null => {
      for (const item of menuItems) {
        if (item.children) {
          const matchesChild = item.children.some((child) => {
            const childKey = String(child.key);
            return isRouteMatch(childKey, pathname);
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
    const parentKey = findParentMenuKey(pathname, treeData);
    if (parentKey) {
      setExpandedKeys((prev) => {
        if (prev.length !== 1 || prev[0] !== parentKey) {
          return [parentKey];
        }
        return prev;
      });
    }
  }, [pathname, findParentMenuKey, treeData]);

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
  }, [expandedKeys.length, findParentMenuKey, pathname, treeData]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleCollapsed = () => {
    // On mobile the sidebar behaves like an off-canvas drawer.
    // We never want the "mini collapsed" (80px) variant there.
    if (isMobile) {
      setMobileCollapsed((v) => !v);
      setCollapsed(false);
      return;
    }
    setCollapsed(!collapsed);
  };

  const toggleMobileCollapsed = () => {
    setMobileCollapsed(!mobileCollapsed);
  };

  useEffect(() => {
    // Ensure we never show the mini-collapsed sidebar on mobile.
    if (isMobile && collapsed) {
      setCollapsed(false);
    }
  }, [collapsed, isMobile]);

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

  const groupRouteMap: Record<string, string> = {
    performance: '/performance',
    finance: '/finance',
  };

  const groupedMenuItems = React.useMemo(() => {
    const normalizeRoute = (value?: string | null) => {
      if (!value) return '';
      const v = String(value).toLowerCase().trim();
      if (!v) return '';
      return v.replace(/\/+$/, '') || '/';
    };

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

    const treeItemMap = new Map<string, (typeof accessibleTreeItems)[0]>();
    const treeItemByRouteMap = new Map<
      string,
      (typeof accessibleTreeItems)[0]
    >();
    accessibleTreeItems.forEach((item) => {
      treeItemMap.set(String(item.title).toLowerCase().trim(), item);

      const itemKey = normalizeRoute(String(item.key));
      if (itemKey.startsWith('/')) {
        treeItemByRouteMap.set(itemKey, item);
      }

      item.children?.forEach((child) => {
        const childKey = normalizeRoute(String(child.key));
        if (!childKey.startsWith('/')) return;
        const firstSegment = childKey.split('/').filter(Boolean)[0];
        if (!firstSegment) return;
        const parentRoute = `/${firstSegment}`;
        if (!treeItemByRouteMap.has(parentRoute)) {
          treeItemByRouteMap.set(parentRoute, item);
        }
      });
    });

    const nameMapping: Record<string, string> = {
      overview: 'dashboard',
      people: 'employees',
      performance: 'okr',
      finance: 'payroll',
      administration: 'admin',
      organization: 'organization',
      'org structure': 'organization',
      employee: 'employees',
      'learning and growth': 'learning & growth',
      tna: 'learning & growth',
      'talent acquisition': 'talent acquisition',
      'talent aquisation': 'talent acquisition',
      'talent aquisatiom': 'talent acquisition',
      'time and attendance': 'time & attendance',
      incentive: 'incentives',
      compensation: 'compensation & benefit',
      'compensation & benefit': 'compensation & benefit',
      timesheet: 'time & attendance',
      'employee info': 'employees',
      'okr and planning': 'okr',
      feedback: 'cfr',
      cfr: 'cfr',
      recruitment: 'talent acquisition',
    };

    const modules: Module[] = modulesData?.items || [];
    const activeSubscriptionFromTenant =
      subscriptionData?.items?.find((subscription) => subscription?.isActive) ||
      subscriptionData?.item;

    const subscriptionsList = (subscriptionsData?.items ??
      []) as Subscription[];
    const activeSubscriptionFromList = subscriptionsList.find(
      (subscription) => subscription?.isActive,
    );
    const latestSubscriptionFromList = subscriptionsList.length
      ? [...subscriptionsList].sort(
          (a, b) =>
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime(),
        )[0]
      : undefined;

    // For sidebar visibility we fall back to the latest subscription even if inactive,
    // so module gating still reflects the tenant's most recent plan instead of showing an empty nav.
    const activeSubscription =
      activeSubscriptionFromTenant ||
      activeSubscriptionFromList ||
      latestSubscriptionFromList;
    const subscriptionPlanModules = activeSubscription?.plan?.modules || [];
    const subscribedModuleIds = new Set(
      subscriptionPlanModules
        .map((planModule: any) => planModule.moduleId || planModule?.module?.id)
        .filter(Boolean),
    );

    const groupedByParent = new Map<
      string,
      {
        type: 'group';
        key: string;
        label: string;
        linkKey: string;
        children: any[];
      }
    >();

    const sortedModules = modules
      .filter(
        (m) =>
          m.isActive && m.moduleGroup && subscribedModuleIds.has((m as any).id),
      )
      .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));

    sortedModules.forEach((module) => {
      const normalizedModuleName = module.name.toLowerCase().trim();
      const mappedName =
        nameMapping[normalizedModuleName] || normalizedModuleName;
      const normalizedDescription = normalizeRoute((module as any).description);
      const treeItemFromDescription = normalizedDescription
        ? treeItemByRouteMap.get(normalizedDescription)
        : undefined;
      const treeItem = treeItemFromDescription || treeItemMap.get(mappedName);
      if (!treeItem) return;

      const groupLabelRaw = String(module.moduleGroup).trim();
      if (!groupLabelRaw) return;
      const groupKey = groupLabelRaw.toLowerCase();

      if (!groupedByParent.has(groupKey)) {
        groupedByParent.set(groupKey, {
          type: 'group',
          key: `group-${groupKey}`,
          label: groupLabelRaw,
          linkKey: groupRouteMap[groupKey] || `/${groupKey}`,
          children: [],
        });
      }

      const currentGroup = groupedByParent.get(groupKey)!;
      const alreadyAdded = currentGroup.children.some(
        (child) => String(child.key) === String(treeItem.key),
      );
      if (alreadyAdded) return;

      currentGroup.children.push({
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

    return Array.from(groupedByParent.values()).filter(
      (group) => group.children.length > 0,
    );
  }, [treeData, modulesData, subscriptionData, subscriptionsData]);

  // Fallback skeleton structure used while modules data is not yet available
  const skeletonMenuItems = React.useMemo(
    () =>
      groupedMenuItems.length > 0
        ? groupedMenuItems
        : [
            {
              type: 'group',
              key: 'skeleton-overview',
              label: 'Overview',
              // Dashboard, Organization
              children: [
                { key: 'skeleton-overview-item-1' },
                { key: 'skeleton-overview-item-2' },
              ],
            },
            {
              type: 'group',
              key: 'skeleton-people',
              label: 'People',
              children: [
                { key: 'skeleton-people-item-1' },
                { key: 'skeleton-people-item-2' },
                { key: 'skeleton-people-item-3' },
              ],
            },
            {
              type: 'group',
              key: 'skeleton-performance',
              label: 'Performance',
              children: [
                { key: 'skeleton-performance-item-1' },
                { key: 'skeleton-performance-item-2' },
                { key: 'skeleton-performance-item-3' },
                { key: 'skeleton-performance-item-4' },
              ],
            },
            {
              type: 'group',
              key: 'skeleton-finance',
              label: 'Finance',
              children: [
                { key: 'skeleton-finance-item-1' },
                { key: 'skeleton-finance-item-2' },
                { key: 'skeleton-finance-item-3' },
              ],
            },
          ],
    [groupedMenuItems],
  );
  // const { mutate: employeeInfo } = useCreateEmployee();

  // const handleUserInfoUpdate = () => {
  //   const fullName = employeeData?.firstName?.split(' ') || [];
  //   const payloadUser = {
  //     firstName: fullName[0] || '-',
  //     middleName: fullName[1] || '-',
  //     lastName: fullName[2] || '-',
  //   };
  //   const payloadEmp = {
  //     joinedDate: employeeData?.createdAt
  //       ? new Date(employeeData?.createdAt).toISOString()
  //       : new Date().toISOString(),
  //     dateOfBirth: dayjs().subtract(30, 'year'),
  //     employeeAttendanceId: 1,
  //     gender: 'male',
  //     maritalStatus: 'SINGLE',
  //     addresses: {},
  //     additionalInformation: {},
  //     bankInformation: {},
  //     userId: userId,
  //   };

  //   updateEmployeeInformation({
  //     id: userId,
  //     values: payloadUser,
  //   });
  //   employeeInfo({
  //     values: payloadEmp,
  //   });
  // };

  // Render the component with the layout and navigation on the left

  return (
    <Layout
      style={{
        background: '#fff',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'row',
      }}
    >
      <Sider
        theme="light"
        width={280}
        className="scrollbar-hide flex flex-col"
        style={{
          overflow: 'visible',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          // On mobile, the drawer overlays the whole viewport above header.
          zIndex: isMobile ? 300 : 100,
          backgroundColor: '#F5fbff',
          transform: isMobile && mobileCollapsed ? 'translateX(-100%)' : 'none',
          transition: 'transform 0.3s ease',
        }}
        trigger={null}
        collapsible
        collapsed={isMobile ? false : collapsed}
        breakpoint="md"
        onBreakpoint={(broken) => {
          setIsMobile(broken);
          if (broken) {
            setCollapsed(false);
            setMobileCollapsed(true);
          }
        }}
        collapsedWidth={80}
      >
        <div
          data-cy="nav-sider-children-wrap"
          className="relative flex flex-col flex-1 min-h-0"
        >
          <div
            data-cy="nav-sider-logo-wrap"
            className={`flex items-center pt-6 mb-10 ${collapsed ? 'justify-center pl-0' : 'pl-10'}`}
          >
            <div
              data-cy="nav-sider-logo"
              className="relative h-10 w-full flex items-center"
            >
              {collapsed ? (
                <div
                  data-cy="nav-sider-logo-collapsed-container"
                  className="w-full flex justify-center"
                >
                  <Image
                    src="/image/selamnew-workspace-logo-collapsed.svg"
                    alt="SelamNew Workspace Logo"
                    width={32}
                    height={32}
                    style={{ objectFit: 'contain' }}
                  />
                </div>
              ) : (
                <Image
                  src="/image/selamnew-workspace-logo.svg"
                  alt="SelamNew Workspace Logo"
                  width={150}
                  height={40}
                  style={{ objectFit: 'contain' }}
                />
              )}
            </div>
          </div>

          {!isMobile && (
            <button
              type="button"
              data-cy="nav-sider-toggle"
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              onClick={toggleCollapsed}
              className="absolute -right-3 top-[37px] z-[101] flex h-6 w-6 min-h-6 min-w-6 shrink-0 -translate-y-1/2 items-center justify-center rounded-full border-0 bg-[#1E40AF] text-white shadow-md transition-colors hover:bg-[#1E3A8A] hover:opacity-100"
            >
              {collapsed ? (
                <AiOutlineRight size={12} />
              ) : (
                <AiOutlineRight size={12} className="rotate-180" />
              )}
            </button>
          )}

          <div
            data-cy="nav-sider-menu-scroll"
            className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide"
            style={{ minHeight: 0 }}
          >
            <div
              data-cy="nav-sider-menu-inner"
              className={`${collapsed ? 'mt-1' : 'mt-2'} pb-10 ${collapsed ? 'px-0' : 'pl-10 pr-3'}`}
            >
              {!isMounted || isLoadingData ? (
                <div
                  data-cy="nav-sider-loading"
                  className="space-y-4 max-w-[209px]"
                >
                  {skeletonMenuItems.map((group: any) => (
                    <div
                      data-cy="nav-sider-group-skeleton"
                      key={group.key}
                      className="space-y-1"
                    >
                      <div
                        data-cy="nav-sider-group-header-skeleton"
                        className="mb-2 mt-4 first:mt-2"
                      >
                        <div
                          data-cy="nav-sider-group-label-skeleton"
                          className={`w-full font-light text-[#64748B] tracking-wide ${
                            collapsed ? 'text-center truncate' : ''
                          }`}
                          style={{ fontSize: fontSizeSM }}
                        >
                          {group.label}
                        </div>
                      </div>

                      <div
                        data-cy="nav-sider-group-children-skeleton"
                        className={`space-y-1 ${collapsed ? '' : 'pl-2'}`}
                      >
                        {group.children?.map((item: any) => (
                          <div
                            key={item.key}
                            data-cy="nav-sider-menu-item-skeleton"
                            className={`
                              group flex items-center py-2 rounded-xl
                              ${collapsed ? 'justify-center mx-[10px]' : ''}
                            `}
                          >
                            <div
                              data-cy="nav-sider-menu-item-skeleton-bar"
                              className="h-[16px] w-full rounded-md bg-gray-200"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  data-cy="nav-sider-groups"
                  className="space-y-4 max-w-[209px]"
                >
                  {groupedMenuItems.map((group: any) => (
                    <div
                      data-cy="nav-sider-group"
                      key={group.key}
                      className="space-y-1"
                    >
                      <div
                        data-cy="nav-sider-group-header"
                        className="mb-2 mt-4 first:mt-2"
                      >
                        <Link
                          href={group.linkKey || `/${group.label.toLowerCase()}`}
                          data-cy="nav-sider-group-label-wrap"
                          className={`w-full font-light text-[#64748B] tracking-wide transition-colors ${
                            collapsed ? 'text-center truncate' : ''
                          }`}
                          style={{ fontSize: fontSizeSM }}
                        >
                          {group.label} 
                        </Link>
                      </div>

                      <div
                        data-cy="nav-sider-group-children"
                        className={`space-y-1 transition-all duration-300 opacity-100 ${
                          collapsed ? '' : 'pl-2'
                        }`}
                      >
                        {group.children?.map((item: any) => (
                          <NavMenuItem
                            key={item.key}
                            item={item}
                            collapsed={collapsed}
                            colorPrimary={colorPrimary}
                            fontSize={fontSize}
                            selectedKeys={selectedKeys}
                            setSelectedKeys={setSelectedKeys}
                            router={router}
                            pathname={pathname}
                            triggerRouteLoaderStart={triggerRouteLoaderStart}
                            expandedKeys={expandedKeys}
                            setExpandedKeys={setExpandedKeys}
                            navigationDisabled={
                              subscriptionExpired &&
                              !String(item.key).startsWith('/admin')
                            }
                            onNavigate={
                              isMobile
                                ? () => setMobileCollapsed(true)
                                : undefined
                            }
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {AccessGuard.checkAccess({
            permissions: ['view_admin_configuration'],
          }) && (
            <div
              data-cy="nav-sider-admin-wrap"
              className={`mt-2 w-full shrink-0 border-t border-[#E2E8F0] bg-white/40 pt-3 pb-2 ${
                collapsed ? 'flex justify-center px-0' : 'pl-10 pr-3'
              }`}
            >
              <div
                data-cy="nav-sider-admin-inner"
                className={`max-w-[209px] ${collapsed ? '' : 'pl-2'}`}
              >
                <Button
                  data-cy="nav-sider-admin-btn"
                  type="text"
                  block={!collapsed}
                  icon={
                    <span
                      data-cy="nav-sider-admin-icon-wrap"
                      className={`flex items-center justify-center text-[21px] leading-none transition-colors ${
                        pathname.startsWith('/admin') ? '' : 'text-black'
                      }`}
                      style={
                        pathname.startsWith('/admin')
                          ? { color: colorPrimary }
                          : undefined
                      }
                    >
                      <MdSettings size={21} />
                    </span>
                  }
                  className={`
                  !h-auto !min-h-0 flex items-center gap-3 !rounded-[6px] !shadow-none transition-all duration-200
                  ${
                    pathname.startsWith('/admin')
                      ? '!font-bold'
                      : '!font-medium !text-black hover:!bg-[#E6F4FF]'
                  }
                  ${
                    collapsed
                      ? '!flex !w-[52px] !justify-center !px-0 !py-2 mx-[10px]'
                      : '!w-full !max-w-none !justify-start !py-2 !pl-[5px] -ml-[5px]'
                  }
                `}
                  style={
                    pathname.startsWith('/admin')
                      ? { color: colorPrimary }
                      : undefined
                  }
                  onClick={() => {
                    triggerRouteLoaderStart();
                    router.push('/admin/dashboard');
                    if (isMobile) {
                      setMobileCollapsed(true);
                    }
                  }}
                >
                  {!collapsed && (
                    <span
                      data-cy="nav-sider-admin-label"
                      className="flex-1 text-left transition-colors"
                      style={{ fontSize }}
                    >
                      Admin Console
                    </span>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </Sider>
      <Layout
        style={{
          marginLeft: 0,
          transition: 'margin-left 0.3s ease',
          background: '#ffffff',
          flex: 1,
          minWidth: 0,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
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
            zIndex: 40,
            top: 0,
            left: isMobile ? 0 : collapsed ? 80 : 280,
            transition: 'left 0.3s ease, width 0.3s ease',
            height: '74px',
            borderBottom: '1px solid #F1F5F9',
            boxShadow: 'none',
          }}
        >
          {isMobile && mobileCollapsed && (
            <div
              data-cy="nav-header-mobile-toggle-wrap"
              className="pl-3 pr-1 flex justify-center items-center h-full flex-shrink-0"
            >
              <Button
                data-cy="nav-header-mobile-toggle"
                type="text"
                aria-label="Open menu"
                className="h-10 w-10 flex items-center justify-center rounded-xl flex-shrink-0"
                onClick={toggleMobileCollapsed}
                icon={<MenuOutlined className="text-gray-600 text-[20px]" />}
              />
            </div>
          )}

          <NavBar handleLogout={handleLogout} />
        </Header>

        {/* Mobile drawer close button: on the right edge of the drawer, aligned with header */}
        {isMobile && !mobileCollapsed && (
          <button
            type="button"
            data-cy="nav-mobile-drawer-close"
            onClick={toggleMobileCollapsed}
            className="fixed z-[320] flex h-8 w-8 min-h-8 min-w-8 shrink-0 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-0 bg-[#1E40AF] text-white shadow-md transition-colors hover:bg-[#1E3A8A]"
            style={{
              top: 30,
              // Position the close button outside the right edge of the 280px drawer.
              left: 302,
            }}
            aria-label="Close menu"
          >
            <IoCloseOutline size={20} />
          </button>
        )}
        <Content
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
          style={{
            paddingInline: 0,
            paddingLeft: isMobile ? 0 : collapsed ? 80 : 280,
            paddingRight: 0,
            paddingTop: '74px',
            transition: 'padding-left 0.3s ease',
            background: '#ffffff',
          }}
        >
          {isMounted && isCheckingPermissions ? (
            <div
              data-cy="nav-content-loading"
              className="flex min-h-0 flex-1 items-center justify-center"
            >
              <Skeleton active />
            </div>
          ) : (
            <div
              data-cy="nav-content-inner"
              className="scrollbar-hide min-h-0 flex-1 overflow-x-hidden overflow-y-auto"
              style={{
                borderRadius: borderRadiusLG,
                marginTop: 0,
                width: '100%',
                maxWidth: '100%',
                paddingInline: isMobile ? 8 : 24,
                background: '#ffffff',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              {children}
            </div>
          )}
          {/* <CreateEmployeeJobInformation
            onInfoSubmition={() => {
              handleUserInfoUpdate();
            }}
            id={userId}
          /> */}
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
