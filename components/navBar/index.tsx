'use client';
import React, { ReactNode, useState, useEffect, useRef } from 'react';
import '../../app/globals.css';
import { useRouter, usePathname } from 'next/navigation';
import {
  AppstoreOutlined,
  MenuOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { IoCloseOutline } from 'react-icons/io5';
import { Layout, Button, theme, Skeleton, message, Popover } from 'antd';

const { Header, Content, Sider } = Layout;
import NavBar from './topNavBar';
import { CiCalendar, CiSettings, CiStar } from 'react-icons/ci';
import { TbMessage2 } from 'react-icons/tb';
import { AiOutlineDollarCircle, AiOutlineRight } from 'react-icons/ai';
import { CiBookmark } from 'react-icons/ci';
import { PiMoneyLight, PiUserGearLight } from 'react-icons/pi';
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
}> = ({
  item,
  collapsed,
  selectedKeys,
  setSelectedKeys,
  router,
  pathname,
  triggerRouteLoaderStart,
}) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const hasChildren = item.children && item.children.length > 0;

  // Check if this item or any of its children matches the current specific active path
  const isDirectlyActive = selectedKeys.includes(item.key);
  const isChildActive =
    hasChildren &&
    item.children.some((child: any) => selectedKeys.includes(child.key));
  const isActive =
    isDirectlyActive || isChildActive || (hasChildren && isPopoverOpen);

  const popoverContent = (
    <div className="flex flex-col min-w-[220px] p-1 bg-white">
      {item.children?.map((child: any) => (
        <button
          key={child.key}
          onClick={() => {
            const path = String(child.key);
            setIsPopoverOpen(false);
            if (pathname !== path) {
              triggerRouteLoaderStart();
              router.push(path);
              setSelectedKeys([path]);
            }
          }}
          className="text-left py-2 px-4 hover:bg-[#F0F7FF] hover:text-[#3636F0] rounded-lg text-[13px] transition-colors text-gray-600 font-medium"
        >
          {child.label}
        </button>
      ))}
    </div>
  );

  return (
    <Popover
      key={item.key}
      content={hasChildren ? popoverContent : null}
      trigger={hasChildren ? (collapsed ? 'hover' : 'click') : []}
      onOpenChange={(open) => hasChildren && setIsPopoverOpen(open)}
      placement="rightTop"
      arrow={false}
      overlayClassName="nav-popover"
      rootClassName="nav-popover-root"
    >
      <div
        onClick={() => {
          if (!hasChildren) {
            const path = String(item.key);
            if (pathname !== path) {
              triggerRouteLoaderStart();
              router.push(path);
              setSelectedKeys([path]);
            }
          }
        }}
        className={`
          group relative flex items-center gap-3 px-3 py-[9px] cursor-pointer transition-all duration-200
          ${
            isActive
              ? 'bg-white border border-[#3636F0] rounded-xl shadow-sm'
              : 'hover:bg-[#EBF5FF] rounded-xl'
          }
          ${collapsed ? 'justify-center px-0 mx-[10px]' : 'ml-[-1px]'}
        `}
      >
        {isActive && (
          <div className="absolute top-1/2 -translate-y-1/2 w-[8px] h-[26px] bg-[#3636F0] rounded-r-full left-0" />
        )}

        <div
          className={`text-[19px] transition-colors ${
            isActive
              ? 'text-[#3636F0]'
              : 'text-[#475569] group-hover:text-[#3636F0]'
          } ${isActive && !collapsed ? 'ml-3' : ''}`}
        >
          {item.icon}
        </div>

        {!collapsed && (
          <>
            <span
              className={`flex-1 text-[13.5px] tracking-tight transition-colors ${
                isActive
                  ? 'text-[#3636F0] font-semibold'
                  : 'text-[#475569] font-medium group-hover:text-gray-900'
              }`}
            >
              {item.label}
            </span>
            {hasChildren && (
              <AiOutlineRight
                size={12}
                className={`transition-colors ${
                  isActive
                    ? 'text-[#3636F0]'
                    : 'text-[#94A3B8] group-hover:text-gray-600'
                }`}
              />
            )}
          </>
        )}
      </div>
    </Popover>
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
      icon: <AppstoreOutlined style={{ fontSize: 18 }} />,
      title: 'Dashboard',
      key: '/dashboard',
      className: 'font-bold',
      permissions: [], // Public or basic?
      moduleCode: 'DASHBOARD',
    },
    {
      icon: <CiSettings size={18} />,
      title: 'Organization',
      key: '/organization',
      className: 'font-bold',
      permissions: ['view_organization'],
      disabled: hasEndedFiscalYear,
      moduleCode: 'ORGANIZATION',
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
      icon: <LuUsers size={18} />,
      title: 'Employees',
      key: '/employees',
      className: 'font-bold',
      permissions: ['view_employees'],
      disabled: hasEndedFiscalYear,
      moduleCode: 'EMPLOYEES',
      children: [
        {
          title: <span>Manage Employees</span>,
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
          title: <span>Settings</span>,
          key: '/employees/settings',
          className: 'font-bold',
          permissions: ['manage_employee_settings'],
        },
      ],
    },
    {
      icon: <PiSuitcaseSimpleThin size={18} />,
      title: 'Talent Acquisition',
      key: '/recruitment',
      className: 'font-bold',
      permissions: ['view_recruitment'],
      disabled: hasEndedFiscalYear,
      moduleCode: 'RECRUITMENT',
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
        },
        {
          title: <span>AI Job Matching</span>,
          key: '/recruitment/ai-job-matching',
          className: 'font-bold',
          permissions: ['manage_recruitment_jobs'],
          disabled: hasEndedFiscalYear,
          //  || isSubscriptionExpired,
        },
        {
          title: <span>Candidates</span>,
          key: '/recruitment/candidate',
          className: 'font-bold',
          permissions: ['manage_recruitment_candidates'],
        },
        {
          title: <span>Talent Resource</span>,
          key: '/recruitment/talent-resource',
          className: 'font-bold',
          permissions: ['manage_recruitment_talent_pool'],
        },
        {
          title: <span className="font-bold">Settings</span>,
          key: '/recruitment/settings',
          className: 'font-bold',
          permissions: ['manage_recruitment_settings'],
        },
      ],
    },
    {
      icon: <CiStar size={18} />,
      title: 'OKR',
      key: '/okr-menu',
      className: 'font-bold',
      permissions: ['view_okr'],
      disabled: hasEndedFiscalYear,
      moduleCode: 'OKR',
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
      icon: <TbMessage2 size={18} />,
      title: 'CFR',
      key: 'feedback-menu',
      className: 'font-bold',
      permissions: ['view_feedback'],
      disabled: hasEndedFiscalYear,
      moduleCode: 'CFR',
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
      icon: <CiBookmark size={18} />,
      title: 'Learning & Growth',
      key: 'tna-menu',
      className: 'font-bold',
      permissions: ['view_learning_growth'],
      disabled: hasEndedFiscalYear,
      moduleCode: 'TNA',
      children: [
        // {
        //   title: <span>My-TNA</span>,
        //   key: '/tna/my-training',
        //   className: 'font-bold',
        //   permissions: ['view_my_training'],

        //   disabled: hasEndedFiscalYear || isSubscriptionExpired,

        // },
        {
          title: <span>Training Management</span>,
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
          title: <span>Settings</span>,
          key: '/tna/settings/course-category',
          className: 'font-bold',
          permissions: ['manage_tna_settings'],
        },
      ],
    },
    {
      icon: <AiOutlineDollarCircle size={18} />,
      title: 'Payroll',
      key: '/payroll-menu',
      className: 'font-bold',
      permissions: ['view_payroll_menu'],
      disabled: hasEndedFiscalYear,
      moduleCode: 'PAYROLL',
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
      icon: <CiCalendar size={18} />,
      title: 'Time & Attendance',
      key: 'timesheet-menu',
      className: 'font-bold',
      permissions: ['view_timesheet'],
      disabled: hasEndedFiscalYear,
      moduleCode: 'TIMESHEET',
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
      icon: <PiMoneyLight size={18} />,
      title: 'Compensation & Benefit',
      key: 'compensation-menu',
      className: 'font-bold',
      permissions: ['view_compensation'],
      disabled: hasEndedFiscalYear,
      moduleCode: 'COMPENSATION',
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
      icon: <LuCircleDollarSign size={18} />,
      title: 'Incentives',
      key: 'incentive-menu',
      className: 'font-bold',
      permissions: ['view_incentive'],
      disabled: hasEndedFiscalYear,
      moduleCode: 'INCENTIVE',
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
      icon: <FileTextOutlined style={{ fontSize: 18 }} />,
      title: 'Audit Log',
      key: '/audit-log',
      className: 'font-bold',
      permissions: ['view_audit_log'],
      disabled: hasEndedFiscalYear,
      moduleCode: 'AUDIT_LOG',
    },
    {
      icon: <CiSettings size={18} />,
      title: 'Admin',
      key: 'admin-menu',
      className: 'font-bold',
      permissions: ['view_admin_configuration'],
      disabled: hasEndedFiscalYear,
      moduleCode: 'ADMIN',
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
    } catch (error) {}
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
        label: (
          <span className="text-xs font-semibold text-gray-500 px-4">
            {parent.name}
          </span>
        ),
        children: groupChildren,
      });
    });

    return menuItems;
  }, [treeData, modulesData]);

  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    {},
  );
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
        <div className="my-2">{collapsed && <SimpleLogo />}</div>

        <div className="flex items-center justify-between px-4 pt-6 pb-0">
          <div className="flex items-center gap-2">
            {!collapsed && <Logo type="selamnew" />}
          </div>
        </div>

        <button
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
        <div className="flex-1 overflow-y-auto overflow-x-hidden hide-scrollbar">
          <div
            className={`${collapsed ? 'mt-1' : 'mt-2'} pb-20 ${collapsed ? 'px-0' : 'px-3'}`}
          >
            {!isMounted || isLoading ? (
              <div className="px-5 w-full h-full flex justify-center items-center my-5">
                <Skeleton active />
              </div>
            ) : (
              <div className="space-y-6">
                {groupedMenuItems.map((group: any) => {
                  const isExpanded = expandedGroups[group.key] ?? true;

                  return (
                    <div key={group.key} className="space-y-1">
                      <div className="px-2 mb-1">
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedGroups((prev) => ({
                              ...prev,
                              [group.key]: !isExpanded,
                            }))
                          }
                          className={`w-full flex items-center justify-between text-[13px] font-medium text-[#94A3B8] hover:text-gray-600 transition-colors ${
                            collapsed ? 'h-4' : ''
                          }`}
                        >
                          {!collapsed && (
                            <>
                              <span>{group.label}</span>
                              <span
                                className={`transition-transform duration-200 text-[#94A3B8] ${
                                  isExpanded ? 'rotate-180' : ''
                                }`}
                              >
                                <AiOutlineRight
                                  size={10}
                                  className="-rotate-90"
                                />
                              </span>
                            </>
                          )}
                        </button>
                        <div
                          className={`h-[1px] bg-[#E2E8F0] my-3 ${collapsed ? 'w-[50px] mx-auto' : 'w-full'}`}
                        />
                      </div>

                      <div
                        className={`space-y-1 transition-all duration-300 ${
                          isExpanded ? 'opacity-100' : 'hidden opacity-0'
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
          className={`absolute bottom-6 ${collapsed ? 'left-1/2 -translate-x-1/2' : 'left-4 right-4'}`}
        >
          <Button
            type="primary"
            size="large"
            icon={<PiUserGearLight size={22} />}
            className={`
              flex items-center justify-center bg-[#1D4ED8] hover:bg-[#1e40af] border-none shadow-lg shadow-blue-200/50 transition-all duration-300
              ${
                collapsed
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
          marginLeft: isMobile ? 2 : collapsed ? 10 : 20,
          transition: 'margin-left 0.3s ease',
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
            <div className="p-[10px] flex justify-center items-center">
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

          <NavBar handleLogout={handleLogout} />
        </Header>
        <Content
          className="overflow-y-hidden min-h-screen"
          style={{
            paddingInline: isMobile ? 8 : 24,
            paddingLeft: isMobile ? 0 : collapsed ? 80 : 280,
            transition: 'padding-left 0.3s ease',
          }}
        >
          {isMounted && isCheckingPermissions ? (
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
