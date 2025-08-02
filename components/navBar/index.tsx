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
import SidebarSkeleton from './sidebarSkeleton';
import SubscriptionExpiredPage from './subscriptionExpiredPage';
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
import { CreateEmployeeJobInformation } from '@/app/(afterLogin)/(employeeInformation)/employees/manage-employees/[id]/_components/job/addEmployeeJobInfrmation';
import { useCreateEmployee } from '@/store/server/features/employees/employeeDetail/mutations';
import dayjs from 'dayjs';
import { useUpdateEmployeeInformation } from '@/store/server/features/employees/employeeDetail/mutations';
import { useGetSubscriptions } from '@/store/server/features/tenant-management/subscriptions/queries';

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
  const tenantId = useAuthenticationStore.getState().tenantId;

  const { data: subscriptionData, isLoading: subscriptionLoading } =
    useGetSubscriptions(
      {
        filter: {
          tenantId: [tenantId],
        },
      },
      true,
      true,
    );
  const activeSubscription = subscriptionData?.items?.find(
    (sub: any) => sub.isActive,
  );
  const availableModules = activeSubscription?.plan?.modules || [];
  const isSubscriptionExpired = activeSubscription?.endAt
    ? new Date(activeSubscription.endAt) < new Date()
    : false;
  // Check if user is admin
  const isAdmin =
    userData?.role?.slug?.toLowerCase() === 'owner' ||
    userData?.userPermissions?.some(
      (permission: any) =>
        permission.permission.slug === 'view_admin_configuration',
    );

  const hasEndedFiscalYear =
    !!activeFiscalYear?.isActive &&
    !!activeFiscalYear?.endDate &&
    new Date(activeFiscalYear?.endDate) <= new Date();
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
          <span>Organization</span>
        </span>
      ),
      key: '/organization',
      className: 'font-bold',
      permissions: ['view_organization'],
      disabled: hasEndedFiscalYear || isSubscriptionExpired,
      children: [
        {
          title: <span>Org Structure</span>,
          key: '/organization/chart',
          className: 'font-bold',
          permissions: ['view_organization_chart'],
          disabled: hasEndedFiscalYear || isSubscriptionExpired,
        },
        {
          title: <span>Settings</span>,
          key: '/organization/settings',
          className: 'font-bold',
          permissions: ['view_organization_settings'],
          disabled: hasEndedFiscalYear || isSubscriptionExpired,
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
      disabled: hasEndedFiscalYear || isSubscriptionExpired,
      children: [
        {
          title: <span>Manage Employees</span>,
          key: '/employees/manage-employees',
          className: 'font-bold',
          permissions: ['manage_employees'],
          disabled: hasEndedFiscalYear || isSubscriptionExpired,
        },
        {
          title: <span>Department Request</span>,
          key: '/employees/departmentRequest',
          className: 'font-bold',
          permissions: ['manage_department_requests'],
          disabled: hasEndedFiscalYear || isSubscriptionExpired,
        },
        {
          title: <span>Settings</span>,
          key: '/employees/settings',
          className: 'font-bold',
          permissions: ['manage_employee_settings'],
          disabled: hasEndedFiscalYear || isSubscriptionExpired,
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
      disabled: hasEndedFiscalYear || isSubscriptionExpired,
      children: [
        {
          title: <span>Dashboard</span>,
          key: '/recruitment/dashboard',
          className: 'font-bold',
          permissions: ['view_recruitment_dashboard'],
        },
        {
          title: <span>Jobs</span>,
          key: '/recruitment/jobs',
          className: 'font-bold',
          permissions: ['manage_recruitment_jobs'],
          disabled: hasEndedFiscalYear || isSubscriptionExpired,
        },
        {
          title: <span>Candidates</span>,
          key: '/recruitment/candidate',
          className: 'font-bold',
          permissions: ['manage_recruitment_candidates'],
          disabled: hasEndedFiscalYear || isSubscriptionExpired,
        },
        {
          title: <span>Talent Resource</span>,
          key: '/recruitment/talent-resource',
          className: 'font-bold',
          permissions: ['manage_recruitment_talent_pool'],
          disabled: hasEndedFiscalYear || isSubscriptionExpired,
        },
        {
          title: <span>Settings</span>,
          key: '/recruitment/settings',
          className: 'fon t-bold',
          permissions: ['manage_recruitment_settings'],
          disabled: hasEndedFiscalYear || isSubscriptionExpired,
        },
      ],
    },
    {
      title: (
        <span className="flex items-center gap-2 h-12">
          <CiStar
            size={18}
            className={expandedKeys.includes('/okr') ? 'text-blue' : ''}
          />
          <span>OKR</span>
        </span>
      ),
      key: '/okr',
      className: 'font-bold',
      permissions: ['view_okr'],
      disabled: hasEndedFiscalYear || isSubscriptionExpired,
      children: [
        {
          title: <span>Dashboard</span>,
          key: '/okr/dashboard',
          className: 'font-bold',
          permissions: ['view_okr_dashboard'],
          disabled: hasEndedFiscalYear || isSubscriptionExpired,
        },
        {
          title: <span>OKR</span>,
          key: '/okr',
          className: 'font-bold',
          permissions: ['view_okr_overview'],
          disabled: hasEndedFiscalYear || isSubscriptionExpired,
        },
        {
          title: <span>Planning and Reporting</span>,
          key: '/planning-and-reporting',
          className: 'font-bold',
          permissions: ['manage_planning_reporting'],
          disabled: hasEndedFiscalYear || isSubscriptionExpired,
        },
        {
          title: <span>Weekly Priority</span>,
          key: '/weekly-priority',
          className: 'font-bold h-8',
          permissions: ['view_weekly_priority'],
          disabled: hasEndedFiscalYear || isSubscriptionExpired,
        },
        {
          title: <span>Settings</span>,
          key: '/okr/settings',
          className: 'font-bold',
          permissions: ['manage_okr_settings'],
          disabled: hasEndedFiscalYear || isSubscriptionExpired,
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
          <span>CFR</span>
        </span>
      ),
      key: '/feedback',
      className: 'font-bold',
      permissions: ['view_feedback'],
      disabled: hasEndedFiscalYear || isSubscriptionExpired,
      children: [
        {
          title: <span>Conversation</span>,
          key: '/feedback/conversation',
          className: 'font-bold',
          permissions: ['view_feedback_conversation'],
          disabled: hasEndedFiscalYear || isSubscriptionExpired,
        },
        {
          title: <span>Feedback</span>,
          key: '/feedback/feedback',
          className: 'font-bold',
          permissions: ['view_feedback_list'],
          disabled: hasEndedFiscalYear || isSubscriptionExpired,
        },
        {
          title: <span>Recognition</span>,
          key: '/feedback/recognition',
          className: 'font-bold',
          permissions: ['view_feedback_recognition'],
          disabled: hasEndedFiscalYear || isSubscriptionExpired,
        },
        {
          title: 'Settings',
          key: '/feedback/settings',
          className: 'font-bold',
          permissions: ['manage_feedback_settings'],
          disabled: hasEndedFiscalYear || isSubscriptionExpired,
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
          <span>Learning & Growth</span>
        </span>
      ),
      key: '/tna',
      className: 'font-bold',
      permissions: ['view_learning_growth'],
      disabled: hasEndedFiscalYear || isSubscriptionExpired,
      children: [
        {
          title: <span>My-TNA</span>,
          key: '/tna/my-training',
          className: 'font-bold',
          permissions: ['view_my_training'],
          disabled: hasEndedFiscalYear || isSubscriptionExpired,
        },
        {
          title: <span>Training Management</span>,
          key: '/tna/management',
          className: 'font-bold',
          permissions: ['manage_training'],
          disabled: hasEndedFiscalYear || isSubscriptionExpired,
        },
        {
          title: <span>TNA</span>,
          key: '/tna/review',
          className: 'font-bold',
          permissions: ['view_tna_review'],
          disabled: hasEndedFiscalYear || isSubscriptionExpired,
        },
        {
          title: <span>Settings</span>,
          key: '/tna/settings/course-category',
          className: 'font-bold',
          permissions: ['manage_tna_settings'],
          disabled: hasEndedFiscalYear || isSubscriptionExpired,
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
          <span>Payroll</span>
        </span>
      ),
      key: '/payroll',
      className: 'font-bold',
      disabled: hasEndedFiscalYear || isSubscriptionExpired,
      children: [
        {
          title: <span>Employee Information</span>,
          key: '/employee-information',
          className: 'font-bold',
          permissions: ['view_employee_information'],
          disabled: hasEndedFiscalYear || isSubscriptionExpired,
        },
        {
          title: <span>Payroll</span>,
          key: 'payroll',
          className: 'font-bold',
          permissions: ['view_payroll_overview'],
          disabled: hasEndedFiscalYear || isSubscriptionExpired,
        },
        {
          title: <span>My Payroll</span>,
          key: '/myPayroll',
          className: 'font-bold',
          permissions: ['view_my_payroll'],
          disabled: hasEndedFiscalYear || isSubscriptionExpired,
        },
        {
          title: <span>Settings</span>,
          key: '/settings',
          className: 'font-bold',
          permissions: ['manage_payroll_settings'],
          disabled: hasEndedFiscalYear || isSubscriptionExpired,
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
          <span>Time & Attendance</span>
        </span>
      ),
      key: '/timesheet',
      className: 'font-bold',
      permissions: ['view_timesheet'],
      disabled: hasEndedFiscalYear || isSubscriptionExpired,
      children: [
        {
          title: <span>Dashboard</span>,
          key: '/timesheet/dashboard',
          className: 'font-bold',
          permissions: ['view_timesheet_dashboard'],
        },
        {
          title: <span>My Timesheet</span>,
          key: '/timesheet/my-timesheet',
          className: 'font-bold',
          permissions: ['view_my_timesheet'],
          disabled: hasEndedFiscalYear || isSubscriptionExpired,
        },
        {
          title: <span>Employee Attendance</span>,
          key: '/timesheet/employee-attendance',
          className: 'font-bold',
          permissions: ['view_employee_attendance'],
          disabled: hasEndedFiscalYear || isSubscriptionExpired,
        },
        {
          title: <span>Leave Management</span>,
          key: '/timesheet/leave-management/leaves',
          className: 'font-bold',
          permissions: ['manage_leave_management'],
          disabled: hasEndedFiscalYear || isSubscriptionExpired,
        },
        {
          title: <span>Settings</span>,
          key: '/timesheet/settings/closed-date',
          className: 'font-bold',
          permissions: ['manage_timesheet_settings'],
          disabled: hasEndedFiscalYear || isSubscriptionExpired,
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
          <span>Compensation & Benefit</span>
        </span>
      ),
      key: '/compensation',
      className: 'font-bold',
      permissions: ['view_compensation'],
      disabled: hasEndedFiscalYear || isSubscriptionExpired,
      children: [
        {
          title: <span>Allowance</span>,
          key: '/allowance',
          className: 'font-bold',
          permissions: ['view_allowance'],
          disabled: hasEndedFiscalYear || isSubscriptionExpired,
        },
        {
          title: <span>Benefit</span>,
          key: '/benefit',
          className: 'font-bold',
          permissions: ['view_benefit'],
          disabled: hasEndedFiscalYear || isSubscriptionExpired,
        },
        {
          title: <span>Deduction</span>,
          key: '/deduction',
          className: 'font-bold',
          permissions: ['view_deduction'],
          disabled: hasEndedFiscalYear || isSubscriptionExpired,
        },
        {
          title: <span>Settings</span>,
          key: '/compensationSetting',
          className: 'font-bold',
          permissions: ['manage_compensation_settings'],
          disabled: hasEndedFiscalYear || isSubscriptionExpired,
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
          <span>Incentives</span>
        </span>
      ),
      key: '/incentive',
      className: 'font-bold',
      permissions: ['view_incentive'],
      disabled: hasEndedFiscalYear || isSubscriptionExpired,
      children: [
        {
          title: <span>Incentive</span>,
          key: '/incentives',
          className: 'font-bold',
          permissions: ['view_incentive_page'],
          disabled: hasEndedFiscalYear || isSubscriptionExpired,
        },
        {
          title: <span>Variable Pay</span>,
          key: '/variable-pay',
          className: 'font-bold',
          permissions: ['view_variable_pay'],
          disabled: hasEndedFiscalYear || isSubscriptionExpired,
        },
        {
          title: <span>Settings</span>,
          key: '/incentives/settings',
          className: 'font-bold',
          permissions: ['manage_incentive_settings'],
          disabled: hasEndedFiscalYear || isSubscriptionExpired,
        },
      ],
    },
    {
      title: (
        <span className="flex items-center gap-2 h-12">
          <CiSettings
            size={18}
            className={expandedKeys.includes('admin-menu') ? 'text-blue' : ''}
          />
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
  // Get active subscription and its modules

  // Function to check if a menu item is available in the subscription
  const isMenuItemAvailable = (menuKey: string): boolean => {
    // Admin menu should always be visible for admin users
    if (menuKey === 'admin-menu' && isAdmin) {
      return true;
    }

    // If no subscription data or no modules, hide all items except admin menu for admins
    if (!activeSubscription || !availableModules.length) {
      return menuKey === 'admin-menu' && isAdmin;
    }

    // Map menu keys to module descriptions
    const menuToModuleMap: Record<string, string> = {
      '/organization': '/organization',
      '/employees': '/employees',
      '/recruitment': '/recruitment',
      '/okr': '/okr',
      '/feedback': '/feedback',
      '/tna': '/tna',
      '/payroll': '/payroll',
      '/timesheet': '/timesheet',
      '/compensation': '/compensation',
      '/incentive': '/incentive',
      '/admin': '/admin',
    };

    const modulePath = menuToModuleMap[menuKey];
    if (!modulePath) {
      return menuKey === 'admin-menu' && isAdmin; // Only show admin menu for admins if no mapping found
    }

    // Check if any module in the subscription matches the menu path
    return availableModules.some(
      (module) => module.module?.description === modulePath,
    );
  };

  // Filter treeData based on available modules
  const getFilteredTreeData = (): CustomMenuItem[] => {
    return treeData
      .map((item) => {
        // Check if the main menu item is available
        const isMainItemAvailable = isMenuItemAvailable(item.key);

        if (!isMainItemAvailable) {
          return null; // Don't show this menu item
        }

        // Filter children based on availability
        const filteredChildren = item.children?.filter(() => {
          // For child items, we can be more permissive or use the same logic
          // For now, if parent is available, show all children
          return true;
        });

        return {
          ...item,
          children: filteredChildren,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  };

  const filteredTreeData = getFilteredTreeData();

  // Check if we should show the sidebar at all

  useEffect(() => {
    refetch();
  }, [token]);

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
      permissions: [], // No permissions required
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
    // // Check if user has ALL required permissions for this route
    // const hasAllPermissions = matchingRoute.permissions.every(
    //   (requiredPermission: any) => {
    //     const found = userPermissions?.find(
    //       (permission: any) =>
    //         permission.permission.slug === requiredPermission,
    //     );
    //     return found;
    //   },
    // );
    return true;
  };
  const { data: departments } = useGetDepartments();
  const { data: employeeData } = useGetEmployee(userId);
  const { setIsNavBarJobInfoModalVisible, setNavBarJobInfoModalWidth } =
    useEmployeeManagementStore();
  useEffect(() => {
    if (!departments || !employeeData) return;

    if (departments.length === 0) {
      router.push('/onboarding');
    } else if (
      !employeeData.employeeJobInformation ||
      employeeData.employeeJobInformation.length === 0
    ) {
      setIsNavBarJobInfoModalVisible(true);
      setNavBarJobInfoModalWidth('100%');
    }
  }, [departments, employeeData, router]);

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

  const filteredMenuItems = filteredTreeData
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
      {isSubscriptionExpired && (isAdmin == true ? !isAdminPage : true) ? (
        <SubscriptionExpiredPage isAdmin={isAdmin} />
      ) : (
        <>
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
              transform:
                isMobile && mobileCollapsed ? 'translateX(-100%)' : 'none',
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
              {isLoading || subscriptionLoading ? (
                <SidebarSkeleton />
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
              {isCheckingPermissions ? (
                <div className="flex justify-center items-center h-screen">
                  <Skeleton active />
                </div>
              ) : (
                <div
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
            </Content>
          </Layout>
        </>
      )}
    </Layout>
  );
};

export default Nav;
