'use client';
/**
 * The workspace UI shell for the `user` role (see providers/conditionalNav):
 * a flat module sidebar, and every Home / module page framed by the profile
 * banner whose tabs are that section's sub-modules.
 *
 * Built from develop's components/navBar/index.tsx — the classic shell every
 * other role gets, left untouched so develop's changes merge cleanly. Its menu
 * (treeData, hidden routes, permission checks) mirrors develop's: when develop
 * adds or changes a module there, mirror it here.
 */
import React, { ReactNode, useState, useEffect } from 'react';
import '../../app/globals.css';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/utils/firebaseConfig';
import Image from 'next/image';
import NavBar from './WorkspaceTopBar';
import './workspace.css';
import { getNodeText } from './AppBanner';
import WorkspaceShell, { WorkspaceSection } from './WorkspaceShell';
import AnnouncementMegaphoneIcon from '@/components/collaboration/AnnouncementMegaphoneIcon';
import {
  MdPeople,
  MdPersonSearch,
  MdSchool,
  MdAccountBalanceWallet,
  MdCardGiftcard,
  MdWidgets,
  MdAdminPanelSettings,
} from 'react-icons/md';
import AlbumIcon from '@mui/icons-material/Album';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import ChatBubbleOutlinedIcon from '@mui/icons-material/ChatBubbleOutlined';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import { Layout, Button, theme, Skeleton, Tooltip } from 'antd';

const { Header, Content, Sider } = Layout;
import { removeCookie } from '@/helpers/storageHelper';
import { useQueryClient } from 'react-query';
import { BSC_QUERY_KEYS } from '@/store/server/features/bsc/queries';

import { scorecardTabHref, splitMenuKey } from '@/utils/bsc/scorecardTab';

const menuKeyPath = (key: string) => splitMenuKey(String(key)).path;

// Helper function to match dynamic routes like [id] to UUIDs or any non-slash segment
const isRouteMatch = (routePattern: string, pathname: string) => {
  const pattern = menuKeyPath(routePattern);

  // Exact match
  if (pattern === pathname) return true;

  // Conversation: surveys and category list live under /feedback/categories — keep nav item active
  if (pattern === '/feedback/conversation') {
    if (
      pathname === '/feedback/categories' ||
      pathname.startsWith('/feedback/categories/')
    ) {
      return true;
    }
  }

  // Time & Attendance → Settings: one nav item should stay active for all settings sub-routes
  if (pattern === '/timesheet/settings/closed-date') {
    return (
      pathname === '/timesheet/settings' ||
      pathname.startsWith('/timesheet/settings/')
    );
  }

  // KPI → Settings: keep nav active for all BSC settings sub-routes
  if (pattern === '/bsc/settings') {
    return (
      pathname === '/bsc/settings' || pathname.startsWith('/bsc/settings/')
    );
  }

  // BSC → KPI admin: keep nav active for KPI catalog + scorecards tabs
  if (pattern === '/bsc/kpi') {
    return pathname === '/bsc/kpi' || pathname.startsWith('/bsc/kpi/');
  }

  // Match [id] to UUIDs (or any non-slash segment)
  if (pattern.includes('[id]')) {
    const regexPattern = pattern.replace('[id]', '[0-9a-fA-F-]{36}');
    const regex = new RegExp('^' + regexPattern + '(/.*)?$');
    return regex.test(pathname);
  }

  // Generic dynamic segment: [something] => [^/]+
  if (pattern.match(/\[.*?\]/g)) {
    const regexPattern = pattern.replace(/\[.*?\]/g, '[^/]+');
    const regex = new RegExp('^' + regexPattern + '(/.*)?$');
    return regex.test(pathname);
  }

  // Prefix match for subpages
  return pathname === pattern || pathname.startsWith(pattern + '/');
};

// A tab's route can land one level below the section it stands for (Settings →
// `/tna/settings/course-category`); match the whole section so sibling pages
// keep the tab active.
const getRouteSection = (route: string) => {
  const segments = route.split('/').filter(Boolean);
  return segments.length > 2 ? `/${segments.slice(0, 2).join('/')}` : route;
};

// Length of the most specific of `routes` that `pathname` falls under; 0 if none.
const getRouteMatchLength = (routes: string[], pathname: string) =>
  routes.reduce((best, route) => {
    if (!route.startsWith('/')) return best;
    const section = getRouteSection(route);
    return isRouteMatch(section, pathname)
      ? Math.max(best, section.length)
      : best;
  }, 0);

// How closely a banner tab's link matches the page: its route, plus a point
// when its query (Approvals' `?module=payroll`) matches as well.
const getTabMatchScore = (
  href: string,
  pathname: string,
  searchParams: URLSearchParams,
) => {
  const [route, query] = href.split('?');
  const length = getRouteMatchLength([route], pathname);
  if (!length || !query) return length;
  const matchesQuery = Array.from(new URLSearchParams(query)).every(
    ([key, value]) => searchParams.get(key) === value,
  );
  return matchesQuery ? length + 1 : length;
};

// Home's own sidebar entries; its other pages sit inside their modules.
const HOME_OVERVIEW_ROUTE = `${HOME_BASE}/overview`;
const HOME_ENTRY_ICONS: Record<string, React.ReactNode> = {
  approvals: <ClipboardCheck size={20} strokeWidth={2} />,
  profile: <CircleUserRound size={20} strokeWidth={2} />,
};

// An employee's own page puts that employee in the banner, as a profile would;
// everywhere else it is the signed-in user.
const getViewedEmployeeId = (pathname: string) =>
  pathname.match(
    /^\/employees\/manage-employees\/([0-9a-fA-F-]{36})(?:\/|$)/,
  )?.[1];

// Where a sidebar module opens: its first tab, or its own page when it has none.
const getModuleLandingRoute = (item: {
  key: React.Key | bigint;
  children?: { key: React.Key | bigint }[];
}) => String(item.children?.[0]?.key ?? item.key);

import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useCollaboration } from '@/components/collaboration/collaboration-context';
import { COLLABORATION_SPACES_PATH } from '@/utils/collaboration';
import {
  CollaborationDock,
  useCollaborationPanelStore,
} from '@/components/collaboration/collaboration-dock';
import { fetchCurrentUserAndUpdateStore } from '@/store/server/features/employees/authentication/queries';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import {
  BSC_ADMIN_PERMISSIONS,
  BSC_SCORECARD_PERMISSIONS,
} from '@/utils/bsc/permissions';
import { useGetEmployee } from '@/store/server/features/employees/employeeManagment/queries';
import { useGetActiveFiscalYearsData } from '@/store/server/features/organizationStructure/fiscalYear/queries';
import { useGetDepartments } from '@/store/server/features/employees/employeeManagment/department/queries';
import { findMostSpecificMatchingRoute } from '@/utils/routePermissions';
import {
  filterAdminSidebarChildren,
  shouldShowModuleInSidebar,
} from '@/utils/navigation/sidebarVisibility';
import { isHomePath } from '@/utils/navigation/personalRoutes';
import { IS_HOME_PROTOTYPE } from '@/config/homePrototype';
import {
  homeSubTabLabel,
  homeTabLabel,
  useHomeBanner,
} from '@/app/(afterLogin)/home/_components/useHomeTabs';
import { HOME_BASE } from '@/config/homeTabs';

import { useEmployeeManagementStore } from '@/store/uistate/features/employees/employeeManagment';
// import { CreateEmployeeJobInformation } from '@/app/(afterLogin)/(employeeInformation)/employees/manage-employees/[id]/_components/job/addEmployeeJobInfrmation';
// import { useCreateEmployee } from '@/store/server/features/employees/employeeDetail/mutations';
// import dayjs from 'dayjs';
// import { useUpdateEmployeeInformation } from '@/store/server/features/employees/employeeDetail/mutations';
import JobInfoAccessModal from '@/app/(afterLogin)/dashboard/_components/modal';
import { useGetSubscriptionByTenant } from '@/store/server/features/tenant-management/manage-subscriptions/queries';
import { useGetSubscriptions } from '@/store/server/features/tenant-management/subscriptions/queries';
import { OfflineIndicator } from '@/components/PWA/OfflineIndicator';
import {
  COPILOT_SHARE_QUERY,
  COPILOT_SHARE_REF_QUERY,
} from '@/utils/copilotShare';

interface CustomMenuItem {
  key: string;
  icon?: React.ReactNode;
  title: React.ReactNode; // Changed from `label` to `title`
  className?: string;
  permissions?: string[];
  requireAny?: boolean;
  children?: CustomMenuItem[];
  disabled?: boolean;
  moduleCode?: string;
}

// The nav tree module a page outside Home belongs to. Every sub-route counts,
// including the personal ones hidden from the tabs, so e.g.
// `/feedback/categories` still resolves to CFR.
const findModuleKey = (
  treeData: CustomMenuItem[],
  pathname: string,
): string | undefined => {
  let matchedItem: CustomMenuItem | undefined;
  let matchedLength = 0;
  for (const item of treeData) {
    if (item.moduleCode === 'DASHBOARD') continue;
    const childRoutes = (item.children ?? []).map((child) => String(child.key));
    // Each sub-module's top-level URL area (`/feedback` for CFR) also counts,
    // at lower priority, so detail and form pages that are not a tab of their
    // own (`/feedback/categories/…`) still sit under their module.
    const areaRoutes = childRoutes
      .map((route) => route.split('/').filter(Boolean)[0])
      .filter(Boolean)
      .map((segment) => `/${segment}`);
    const routes = [String(item.key), ...childRoutes, ...areaRoutes];
    const length = getRouteMatchLength(routes, pathname);
    if (length > matchedLength) {
      matchedItem = item;
      matchedLength = length;
    }
  }
  return matchedItem ? String(matchedItem.key) : undefined;
};

// Home's pages sit in the sidebar entry that has them as tabs (Leave under
// Time & Attendance); one filed nowhere stays under Home.
const findHomeSidebarItem = (
  items: SidebarNavItem[],
  pathname: string,
): SidebarNavItem | undefined => {
  const route = pathname === HOME_BASE ? HOME_OVERVIEW_ROUTE : pathname;
  const routesOf = (item: SidebarNavItem) =>
    [item.key, ...(item.children ?? []).map((child) => child.key)].map(
      (key) => String(key).split('?')[0],
    );
  return (
    items.find((item) => routesOf(item).includes(route)) ??
    items.find((item) => String(item.key) === HOME_OVERVIEW_ROUTE)
  );
};

import { useGetModules } from '@/store/server/features/tenant-management/modules/queries';
import { Module, Subscription } from '@/types/tenant-management';
import {
  ChevronsLeft,
  ChevronsRight,
  CircleUserRound,
  ClipboardCheck,
} from 'lucide-react';
import Link from 'next/link';
import { MobileBottomNav } from './WorkspaceMobileNav';

interface MyComponentProps {
  children: ReactNode;
}

// Core host (SelamNew Core) provides its own top bar when this app is embedded inside it.
const IS_CORE = process.env.NEXT_PUBLIC_IS_CORE === 'true';

// Sidebar, header and page share one surface; the banner carries the colour.
const SHELL_BACKGROUND = 'var(--app-shell-background, #ffffff)';
// Tailwind `brand` — the banner colour, reused for active navigation.
const SHELL_ACCENT = '#1E40AF';

interface SidebarNavItem {
  key: React.Key | bigint;
  icon?: React.ReactNode;
  label: React.ReactNode;
  children?: { key: React.Key | bigint; label: React.ReactNode }[];
}

// One sidebar module. Sub-modules are not listed here — they are the tabs in the
// module banner at the top of the page.
const NavMenuItem: React.FC<{
  item: SidebarNavItem;
  collapsed: boolean;
  active: boolean;
  fontSize: number;
  disabled?: boolean;
}> = ({ item, collapsed, active, fontSize, disabled }) => {
  const label = typeof item.label === 'string' ? item.label : undefined;
  const className = `
    flex w-full items-center gap-3 rounded-xl py-2.5 outline-none transition-colors duration-150
    ${collapsed ? 'justify-center px-0' : 'px-3'}
    ${
      active
        ? 'bg-brand-soft font-semibold text-brand hover:text-brand'
        : 'font-medium text-[#374151] hover:bg-[#F4F5F9] hover:text-[#111827] focus-visible:bg-[#F4F5F9]'
    }
    ${disabled ? 'cursor-not-allowed opacity-50 hover:bg-transparent' : 'cursor-pointer'}
  `;
  const content = (
    <>
      <span
        data-cy="nav-menu-item-icon"
        className="flex shrink-0 items-center text-[21px] leading-none"
      >
        {item.icon}
      </span>
      {!collapsed && (
        <span
          data-cy="nav-menu-item-label"
          className="min-w-0 flex-1 truncate"
          style={{ fontSize }}
        >
          {item.label}
        </span>
      )}
    </>
  );

  const row = disabled ? (
    <span
      data-cy="nav-menu-item"
      aria-disabled="true"
      aria-label={collapsed ? label : undefined}
      className={className}
    >
      {content}
    </span>
  ) : (
    <Link
      data-cy="nav-menu-item"
      href={getModuleLandingRoute(item)}
      prefetch={false}
      aria-current={active ? 'true' : undefined}
      aria-label={collapsed ? label : undefined}
      className={className}
    >
      {content}
    </Link>
  );

  return (
    <div className="flex w-full flex-col" data-cy="nav-menu-item-wrapper">
      {collapsed ? (
        <Tooltip placement="right" title={item.label}>
          {row}
        </Tooltip>
      ) : (
        row
      )}
    </div>
  );
};

const WorkspaceNav: React.FC<MyComponentProps> = ({ children }) => {
  const {
    token: { borderRadiusLG, fontSize, fontSizeSM },
  } = theme.useToken();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams?.toString() ?? '';
  const { userId, tenantId, hasHydrated, userData } = useAuthenticationStore();
  const {
    enabled: collaborationEnabled,
    isOpen: collaborationOpen,
    toggle: toggleCollaboration,
  } = useCollaboration();
  const collaborationPanelWidth = useCollaborationPanelStore(
    (state) => state.panelWidth,
  );
  useGetEmployee(userId);
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
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (
      params.get(COPILOT_SHARE_QUERY) ||
      params.get(COPILOT_SHARE_REF_QUERY)
    ) {
      if (pathname !== '/copilot') {
        router.replace(`/copilot?${params.toString()}`);
      }
    }
  }, [isMounted, pathname, router]);

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
  const hiddenRoutes: {
    key: string;
    permissions: string[];
    requireAny?: boolean;
  }[] = [
    {
      key: '/dashboard',
      permissions: [], // No permissions required
    },
    {
      key: '/home/overview',
      permissions: [],
    },
    {
      key: '/home',
      permissions: [],
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
    // BSC detail pages reached from tables/cards (not in the sidebar). Without
    // these, the permission check below finds no route and sends non-owners to
    // /unauthorized (e.g. Results → Review/View → pep-audit).
    // BSC uses its own "BSC and KPI" permission group (like OKR), not OKR's.
    {
      key: '/bsc/employees',
      permissions: [Permissions.ViewBsc], // Employee KPI detail + PEP audit review
    },
    {
      key: '/bsc/kpis',
      permissions: [Permissions.ViewBsc],
    },
    {
      key: '/bsc/perspectives',
      permissions: [Permissions.ViewBsc],
    },
    {
      key: '/bsc/roll-up',
      permissions: [Permissions.ViewBsc],
    },
    {
      key: '/bsc/setup',
      permissions: BSC_SCORECARD_PERMISSIONS,
      requireAny: true,
    },
    {
      key: '/bsc/cycles',
      permissions: BSC_SCORECARD_PERMISSIONS,
      requireAny: true,
    },
  ];

  const getRoutesAndPermissions = React.useCallback(
    (
      menuItems: CustomMenuItem[],
    ): { route: string; permissions: string[]; requireAny?: boolean }[] => {
      const routes: {
        route: string;
        permissions: string[];
        requireAny?: boolean;
      }[] = [];

      const traverse = (items: CustomMenuItem[]) => {
        items.forEach((item) => {
          if (item.key && item.permissions) {
            routes.push({
              route: item.key,
              permissions: item.permissions,
              ...(item.requireAny ? { requireAny: true } : {}),
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
            ...(route.requireAny ? { requireAny: true } : {}),
          });
        }
      });

      // Then add visible menu routes
      traverse(menuItems);
      return routes;
    },
    [hiddenRoutes],
  );

  const treeData: CustomMenuItem[] = React.useMemo(() => {
    const kpiTabChildren: CustomMenuItem[] = [
      {
        title: <span data-cy="nav-tree-bsc-kpis">KPI</span>,
        key: '/bsc/kpi',
        className: 'font-bold',
        // KPI library + scorecard setup (like OKR settings: admin only).
        permissions: BSC_ADMIN_PERMISSIONS,
        requireAny: true,
      },
      {
        title: <span data-cy="nav-tree-bsc-my-scorecard">My Scorecard</span>,
        key: scorecardTabHref('mine'),
        className: 'font-bold',
        permissions: [Permissions.ViewBsc],
      },
      {
        title: <span data-cy="nav-tree-bsc-settings">Settings</span>,
        key: '/bsc/settings',
        className: 'font-bold',
        permissions: [Permissions.CreateBscPerspective],
      },
    ];

    return [
      {
        icon: <DashboardIcon style={{ fontSize: 20 }} />,
        title: 'Home',
        key: '/home/overview',
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
              <span data-cy="nav-tree-manage-employees">Manage Employees</span>
            ),
            key: '/employees/manage-employees',
            className: 'font-bold',
            permissions: ['manage_employees'],
          },
          {
            title: (
              <span data-cy="nav-tree-succession-planning">
                Succession Planning
              </span>
            ),
            key: '/employees/succession-planning',
            className: 'font-bold',
            permissions: [
              Permissions.ViewSuccessionPlanning,
              Permissions.SubmitSuccessionEvaluation,
            ],
            requireAny: true,
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
              <span data-cy="nav-tree-recruitment-settings">Settings</span>
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
        icon: <AssessmentOutlinedIcon style={{ fontSize: 20 }} />,
        title: 'BSC',
        key: 'bsc-menu',
        className: 'font-bold',
        permissions: [Permissions.ViewBsc],
        disabled: hasEndedFiscalYear,
        moduleCode: 'OKR',
        children: kpiTabChildren,
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
            title: (
              <span data-cy="nav-tree-tna-management">TNA Management</span>
            ),
            key: '/tna/tna-management',
            className: 'font-bold',
            permissions: ['manage_tna'],
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
            permissions: ['view_payroll_overview_page'],
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
    ];
  }, [hasEndedFiscalYear, userData]);

  // Helper function moved to global scope

  const checkPathnamePermissions = React.useCallback(
    (pathname: string): boolean => {
      if (IS_HOME_PROTOTYPE && isHomePath(pathname)) {
        return true;
      }

      // Get all routes and their permissions
      const routesWithPermissions = getRoutesAndPermissions(treeData);

      // Check if user is owner - owners have access to all routes
      const isOwner = userData?.role?.slug?.toLowerCase() === 'owner';
      if (isOwner) {
        return true;
      }

      // Prefer the deepest, most-specific policy over an earlier parent route.
      const matchingRoute = findMostSpecificMatchingRoute(
        routesWithPermissions,
        pathname,
      );

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
            const hasParentPermissions = AccessGuard.checkAccess({
              permissions: parentRoute.permissions,
              requireAny: parentRoute.requireAny,
            });

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

      // Check if user has the required permission(s) for this route
      return AccessGuard.checkAccess({
        permissions: matchingRoute.permissions,
        requireAny: matchingRoute.requireAny,
      });
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
      pathname !== `/employees/manage-employees/${userId}`
    ) {
      setIsModalOpen(true);
    } else if (
      employeeData?.employeeJobInformation?.length === 0 &&
      pathname === `/employees/manage-employees/${userId}`
    ) {
      setIsAddEmployeeJobInfoModalVisible(true);
    }
  }, [
    departments,
    employeeData,
    router,
    isLoadingData,
    pathname,
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
  // Wait for persisted auth (token, userPermissions) before checking access.
  // Without this, reload can run the check with empty store state and redirect to /unauthorized.
  useEffect(() => {
    if (!hasHydrated) {
      setIsCheckingPermissions(false);
      return;
    }

    let cancelled = false;

    const checkPermissions = async () => {
      setIsCheckingPermissions(true);
      try {
        if (pathname === '/') {
          router.push('/home/overview');
          return;
        }

        const state = useAuthenticationStore.getState();
        const isOwner = state.userData?.role?.slug?.toLowerCase() === 'owner';

        const hasNoPermissions =
          !state.userData?.userPermissions ||
          (Array.isArray(state.userData.userPermissions) &&
            state.userData.userPermissions.length === 0);

        if (state.token && state.localId && !isOwner && hasNoPermissions) {
          const success = await fetchCurrentUserAndUpdateStore();
          if (cancelled) return;
          if (!success) {
            const refreshed = useAuthenticationStore.getState();
            const stillNoPerms =
              !refreshed.userData?.userPermissions ||
              (Array.isArray(refreshed.userData.userPermissions) &&
                refreshed.userData.userPermissions.length === 0);
            if (stillNoPerms) {
              return;
            }
          }
        }

        if (!checkPathnamePermissions(pathname)) {
          router.push('/unauthorized');
        }
      } finally {
        if (!cancelled) {
          setIsCheckingPermissions(false);
        }
      }
    };

    checkPermissions();
    return () => {
      cancelled = true;
    };
  }, [
    pathname,
    router,
    checkPathnamePermissions,
    setIsCheckingPermissions,
    hasHydrated,
    userData,
  ]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Only reachable on desktop: mobile navigates from the bottom bar instead.
  const toggleCollapsed = () => {
    setCollapsed((value) => !value);
  };

  useEffect(() => {
    // Ensure we never show the mini-collapsed sidebar on mobile.
    if (isMobile && collapsed) {
      setCollapsed(false);
    }
  }, [collapsed, isMobile]);

  const clearBrowserSessionArtifacts = () => {
    if (typeof window === 'undefined') return;

    try {
      const clearStorage = (storage: Storage) => {
        const keys = Object.keys(storage);
        keys.forEach((key) => storage.removeItem(key));
      };
      clearStorage(window.localStorage);
      clearStorage(window.sessionStorage);
    } catch {
      // ignore storage cleanup errors
    }

    try {
      document.cookie.split(';').forEach((cookie) => {
        const name = cookie.split('=')[0]?.trim();
        if (!name) return;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
      });
    } catch {
      // ignore cookie cleanup errors
    }
  };

  const handleLogout = async () => {
    try {
      // Sign out of the shared Firebase session first so logout propagates to
      // Core and the other products on this origin; otherwise AuthBridge would
      // immediately re-populate the token from the still-active session.
      try {
        await signOut(auth);
      } catch {
        // Still clear local state if Firebase sign-out fails.
      }

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

      // Drop user-scoped BSC cache so the next login cannot reuse My Scorecard data.
      Object.values(BSC_QUERY_KEYS).forEach((key) => {
        queryClient.removeQueries(key);
      });

      // Then remove cookies
      removeCookie('token');
      removeCookie('tenantId');
      removeCookie('activeCalendar');
      removeCookie('loggedUserRole');
      removeCookie('canManageFiscalYear');

      // Finally clear the remaining state
      setToken('');
      setTenantId('');
      setLocalId('');
      clearBrowserSessionArtifacts();

      // Core owns login at the origin root; standalone / redesign uses in-app login.
      window.location.assign(IS_CORE ? '/login' : '/authentication/login');
    } catch (error) {}
  };

  const groupRouteMap: Record<string, string> = {
    performance: '/performance',
    finance: '/finance-bashboard',
    people: '/employees/dashboard',
  };

  // Home's pages this user can open, and the action beside their tabs.
  const homeBanner = useHomeBanner();
  const visibleHomeTabs = homeBanner.visibleTabs;

  const groupedMenuItems = React.useMemo(() => {
    const normalizeRoute = (value?: string | null) => {
      if (!value) return '';
      const v = String(value).toLowerCase().trim();
      if (!v) return '';
      return v.replace(/\/+$/, '') || '/';
    };

    const isOwner = userData?.role?.slug?.toLowerCase() === 'owner';
    type GroupedMenuChild = {
      key: string;
      label: React.ReactNode;
    };

    // Home's personal pages lead their module's tabs (My OKR under OKR, Leave
    // under Time & Attendance), ahead of the module's own pages.
    const personalPagesByModule = new Map<string, CustomMenuItem[]>();
    visibleHomeTabs.forEach((tab) => {
      if (!tab.menuKey) return;
      const pages = personalPagesByModule.get(tab.menuKey) ?? [];
      pages.push({ key: tab.href, title: homeTabLabel(tab.key, tab.label) });
      personalPagesByModule.set(tab.menuKey, pages);
    });

    const accessibleTreeItems = treeData
      .map((item) => {
        if (item.moduleCode === 'DASHBOARD') {
          return { ...item, children: [] };
        }

        const personalPages = personalPagesByModule.get(String(item.key)) ?? [];
        const showModulePages =
          AccessGuard.checkAccess({
            permissions: item.permissions,
            requireAny: item.requireAny,
          }) && shouldShowModuleInSidebar(item, isOwner);
        if (!showModulePages && !personalPages.length) return null;

        const permittedChildren =
          showModulePages && item.children
            ? item.children.filter((child) =>
                AccessGuard.checkAccess({
                  permissions: child.permissions,
                  requireAny: child.requireAny,
                }),
              )
            : [];

        return {
          ...item,
          children: [
            ...personalPages,
            ...filterAdminSidebarChildren(permittedChildren),
          ],
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
      overview: 'home',
      dashboard: 'home',
      home: 'home',
      people: 'employees',
      performance: 'okr',
      okr: 'okr',
      kpi: 'kpi',
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
      bsc: 'kpi',
      scorecard: 'kpi',
      feedback: 'cfr',
      cfr: 'cfr',
      recruitment: 'talent acquisition',
    };

    const mapTreeItemToMenuChild = (
      treeItem: CustomMenuItem,
    ): {
      key: string;
      icon?: React.ReactNode;
      label: React.ReactNode;
      children?: GroupedMenuChild[];
    } => ({
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
      // Home is pinned above the groups rather than filed under one.
      if (!treeItem || treeItem.moduleCode === 'DASHBOARD') return;

      const groupLabelRaw = String(module.moduleGroup).trim();
      if (!groupLabelRaw) return;
      const groupKey = groupLabelRaw.toLowerCase();

      if (!groupedByParent.has(groupKey)) {
        groupedByParent.set(groupKey, {
          type: 'group',
          key: `group-${groupKey}`,
          label: groupLabelRaw,
          linkKey: groupRouteMap[groupKey] || '',
          children: [],
        });
      }

      const currentGroup = groupedByParent.get(groupKey)!;
      const alreadyAdded = currentGroup.children.some(
        (child) => String(child.key) === String(treeItem.key),
      );
      if (alreadyAdded) return;

      currentGroup.children.push(mapTreeItemToMenuChild(treeItem));
    });

    // BSC shares the OKR subscription (no separate BSC module yet). When OKR
    // is present, insert BSC beside it like CFR — accordion children = scorecard tabs.
    for (const group of groupedByParent.values()) {
      const okrIndex = group.children.findIndex(
        (child) => String(child.key) === '/okr-menu',
      );
      const hasBsc = group.children.some(
        (child) => String(child.key) === 'bsc-menu',
      );
      if (okrIndex === -1 || hasBsc) continue;

      const bscTreeItem = treeItemMap.get('bsc') || treeItemMap.get('kpi');
      if (!bscTreeItem) continue;

      group.children.splice(
        okrIndex + 1,
        0,
        mapTreeItemToMenuChild(bscTreeItem),
      );
    }

    const homeTreeItem = treeData.find(
      (item) => item.moduleCode === 'DASHBOARD',
    );
    const homeGroup = {
      type: 'group' as const,
      key: 'group-home',
      label: '',
      linkKey: HOME_OVERVIEW_ROUTE,
      children: [
        {
          key: HOME_OVERVIEW_ROUTE,
          icon: homeTreeItem?.icon ?? (
            <DashboardIcon style={{ fontSize: 20 }} />
          ),
          label: 'Home',
          children: [
            {
              key: HOME_OVERVIEW_ROUTE,
              label: homeTabLabel('overview', 'Overview'),
            },
          ],
        },
      ],
    };

    // Approvals and My Profile belong to no module: each is an entry of its
    // own, with its views (inboxes, profile sections) as its tabs.
    const ownEntries = visibleHomeTabs
      .filter((tab) => !tab.menuKey && tab.href !== HOME_OVERVIEW_ROUTE)
      .map((tab) => ({
        key: tab.href,
        icon: HOME_ENTRY_ICONS[tab.key],
        label: tab.label,
        children: tab.subTabs?.map((subTab) => ({
          key: subTab.href,
          label: homeSubTabLabel(tab.key, subTab),
        })),
      }));
    const ownGroup = {
      type: 'group' as const,
      key: 'group-own',
      label: '',
      linkKey: '',
      children: ownEntries,
    };

    return [
      homeGroup,
      ...Array.from(groupedByParent.values()).filter(
        (group) => group.children.length > 0,
      ),
      ...(ownEntries.length ? [ownGroup] : []),
    ];
  }, [
    treeData,
    modulesData,
    subscriptionData,
    subscriptionsData,
    userData,
    visibleHomeTabs,
  ]);

  // The sidebar entry the current page belongs to, with the pages this user
  // can open in it as its tabs.
  const activeModule = React.useMemo(() => {
    const sidebarItems: SidebarNavItem[] = groupedMenuItems.flatMap(
      (group) => group.children,
    );
    let sidebarItem: SidebarNavItem | undefined;
    if (isHomePath(pathname)) {
      sidebarItem = findHomeSidebarItem(sidebarItems, pathname);
    } else {
      const moduleKey = findModuleKey(treeData, pathname);
      // Not in this user's sidebar (no access, or not subscribed): no banner.
      sidebarItem = sidebarItems.find(
        (item) => moduleKey && String(item.key) === moduleKey,
      );
    }
    if (!sidebarItem) return null;

    // A module without sub-modules is its own single tab.
    const moduleKey = String(sidebarItem.key);
    const tabSources = sidebarItem.children?.length
      ? sidebarItem.children
      : moduleKey.startsWith('/')
        ? [{ key: moduleKey, label: sidebarItem.label }]
        : [];
    const tabs = tabSources.map((child) => {
      const route = String(child.key);
      return {
        key: route,
        label: child.label,
        title: getNodeText(child.label),
        href: route,
        disabled: subscriptionExpired && !route.startsWith('/admin'),
      };
    });
    const currentSearch = new URLSearchParams(search);
    const activeTab = tabs.reduce<{ key?: string; score: number }>(
      (best, tab) => {
        const score = getTabMatchScore(tab.href, pathname, currentSearch);
        return score > best.score ? { key: tab.key, score } : best;
      },
      { score: 0 },
    );

    return {
      key: moduleKey,
      icon: sidebarItem.icon,
      title: sidebarItem.label,
      tabs,
      activeTabKey: activeTab.key,
    };
  }, [pathname, search, treeData, groupedMenuItems, subscriptionExpired]);

  const activeSidebarKey = activeModule?.key;

  // Every sidebar entry shares one page frame; only its tabs differ. Pages
  // outside all of them (e.g. Copilot) keep the whole content area.
  const onHomePage = isHomePath(pathname);
  const shellSection: WorkspaceSection | null = activeModule
    ? {
        title: activeModule.title,
        tabs: activeModule.tabs,
        activeKey: activeModule.activeTabKey,
        // Home's actions depend on the signed-in user; see shellEmployeeId.
        extra: onHomePage && isMounted ? homeBanner.extra : undefined,
        tabsLabel: `${getNodeText(activeModule.title) || 'Module'} sections`,
        tabsIdPrefix: onHomePage ? 'home-tabs' : 'module-tabs',
        // Home's pages bring their own top spacing and scroll in the frame.
        spaceBelowBanner: !onHomePage,
        fixedFrame: onHomePage && !IS_CORE,
        profilePanel: pathname === `${HOME_BASE}/profile`,
      }
    : null;
  // The session lives in localStorage, so the server renders with no user
  // while the browser's first render already has one. Show the profile from
  // mount on so both renders match and hydration doesn't fail.
  const shellEmployeeId = isMounted
    ? (getViewedEmployeeId(pathname) ?? (userId || undefined))
    : undefined;

  // Fallback skeleton structure used while modules data is not yet available
  const skeletonMenuItems = React.useMemo(
    () =>
      groupedMenuItems.length > 1
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

  const pageContent =
    isMounted && isCheckingPermissions ? (
      <div
        data-cy="nav-content-loading"
        className="flex items-center justify-center py-16"
      >
        <Skeleton active />
      </div>
    ) : (
      children
    );

  // Render the component with the layout and navigation on the left
  const siderOffset = isMobile ? 0 : collapsed ? 80 : 280;
  // Core embeds this app under its own top bar.
  const showTopHeader = !IS_CORE;
  // The header logo, the banner and the page content share one left edge.
  const contentGutter = isMobile ? 8 : 24;

  return (
    <Layout
      style={{
        background: SHELL_BACKGROUND,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'row',
        transition: 'opacity 0.3s ease',
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
          zIndex: 100,
          backgroundColor: SHELL_BACKGROUND,
          // On mobile the bottom nav handles navigation — slide the sidebar fully off-screen.
          transform: isMobile ? 'translateX(-100%)' : 'none',
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
          }
        }}
        collapsedWidth={80}
      >
        <div
          data-cy="nav-sider-children-wrap"
          className="relative flex flex-col flex-1 min-h-0"
        >
          <div
            data-cy="nav-sider-menu-scroll"
            className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide"
            style={{ minHeight: 0 }}
          >
            {/* Top padding lines Home up with the logo in the header row. */}
            <nav
              data-cy="nav-sider-menu-inner"
              aria-label="Main navigation"
              className="px-4 pb-8 pt-4"
            >
              {!isMounted || isLoadingData ? (
                <div data-cy="nav-sider-loading" className="space-y-5">
                  {skeletonMenuItems.map((group: any) => (
                    <div
                      data-cy="nav-sider-group-skeleton"
                      key={group.key}
                      className="space-y-1"
                    >
                      {group.label ? (
                        <div
                          data-cy="nav-sider-group-header-skeleton"
                          className={
                            collapsed ? 'mb-2 flex justify-center' : 'mb-1 px-3'
                          }
                        >
                          {collapsed ? (
                            <div
                              data-cy="nav-sider-group-divider-skeleton"
                              className="h-px w-8 bg-[#E5E7EB]"
                            />
                          ) : (
                            <div
                              data-cy="nav-sider-group-label-skeleton"
                              className="font-light tracking-wide text-[#64748B]"
                              style={{ fontSize: fontSizeSM }}
                            >
                              {group.label}
                            </div>
                          )}
                        </div>
                      ) : null}

                      <div
                        data-cy="nav-sider-group-children-skeleton"
                        className="space-y-1"
                      >
                        {group.children?.map((item: any) => (
                          <div
                            key={item.key}
                            data-cy="nav-sider-menu-item-skeleton"
                            className={`flex items-center py-3 ${
                              collapsed ? 'justify-center' : 'px-3'
                            }`}
                          >
                            <div
                              data-cy="nav-sider-menu-item-skeleton-bar"
                              className={`h-4 rounded-md bg-gray-200 ${
                                collapsed ? 'w-6' : 'w-full'
                              }`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div data-cy="nav-sider-groups" className="space-y-5">
                  {groupedMenuItems.map((group: any) => (
                    <div
                      data-cy="nav-sider-group"
                      key={group.key}
                      className="space-y-1"
                    >
                      {group.label && collapsed ? (
                        <div
                          data-cy="nav-sider-group-divider"
                          className="mx-auto mb-2 h-px w-8 bg-[#E5E7EB]"
                        />
                      ) : null}
                      {group.label && !collapsed ? (
                        <div
                          data-cy="nav-sider-group-header"
                          className="mb-1 px-3"
                        >
                          <Link
                            href={
                              group.linkKey || `/${group.label.toLowerCase()}`
                            }
                            data-cy="nav-sider-group-label-wrap"
                            className="font-light tracking-wide text-[#64748B] transition-colors hover:text-brand"
                            style={{ fontSize: fontSizeSM }}
                          >
                            {group.label}
                          </Link>
                        </div>
                      ) : null}

                      <div
                        data-cy="nav-sider-group-children"
                        className="space-y-1"
                      >
                        {group.children?.map((item: any) => (
                          <NavMenuItem
                            key={item.key}
                            item={item}
                            collapsed={collapsed}
                            active={String(item.key) === activeSidebarKey}
                            fontSize={fontSize}
                            disabled={
                              subscriptionExpired &&
                              !getModuleLandingRoute(item).startsWith('/admin')
                            }
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </nav>
          </div>

          {/* Permissions come from localStorage, which the server can't see:
              wait for mount so both renders agree. */}
          {isMounted &&
            collaborationEnabled &&
            AccessGuard.checkAccess({
              permissions: ['view_organization'],
            }) && (
              <div
                data-cy="nav-sider-announcement-wrap"
                className="w-full shrink-0 border-t border-[#EEF0F4] px-4 pb-1 pt-3"
              >
                <div data-cy="nav-sider-announcement-inner">
                  {(() => {
                    // Opens the embedded collaboration iframe (post channels only).
                    const isAnnouncementActive = collaborationOpen && !isMobile;
                    const announcementButton = (
                      <Button
                        data-cy="nav-sider-announcement-btn"
                        type="text"
                        block
                        aria-label={collapsed ? 'Announcement' : undefined}
                        disabled={hasEndedFiscalYear}
                        icon={
                          <span
                            data-cy="nav-sider-announcement-icon-wrap"
                            className="relative flex items-center justify-center text-[21px] leading-none"
                          >
                            <AnnouncementMegaphoneIcon
                              size={21}
                              data-cy="nav-sider-announcement-icon"
                            />
                          </span>
                        }
                        className={`
                        !h-auto !min-h-0 !w-full flex items-center gap-3 !rounded-xl !border-0 !py-2.5 !shadow-none transition-colors duration-150
                        ${
                          isAnnouncementActive
                            ? '!bg-brand-soft !font-semibold !text-brand'
                            : '!font-medium !text-[#374151] hover:!bg-[#F4F5F9] hover:!text-[#111827]'
                        }
                        ${collapsed ? '!justify-center !px-0' : '!justify-start !px-3'}
                      `}
                        onClick={() => {
                          if (hasEndedFiscalYear) return;
                          // Panel is desktop-only (`md+`); on mobile the dock is hidden.
                          if (isMobile) return;
                          toggleCollaboration({
                            title: 'Announcement',
                            module: 'announcement',
                            path: COLLABORATION_SPACES_PATH,
                          });
                        }}
                      >
                        {!collapsed && (
                          <span
                            data-cy="nav-sider-announcement-label"
                            className="flex flex-1 items-center justify-start gap-1 text-left"
                            style={{ fontSize }}
                          >
                            <span
                              className="leading-none"
                              data-cy="nav-sider-announcement-text"
                            >
                              Announcement
                            </span>
                          </span>
                        )}
                      </Button>
                    );
                    return collapsed ? (
                      <Tooltip
                        placement="right"
                        trigger={['hover', 'focus']}
                        title="Announcement"
                      >
                        {announcementButton}
                      </Tooltip>
                    ) : (
                      announcementButton
                    );
                  })()}
                </div>
              </div>
            )}
        </div>

        {!isMobile && (
          <div
            data-cy="nav-sider-collapse-footer"
            className="w-full shrink-0 px-4 pb-3"
          >
            <button
              type="button"
              data-cy="nav-sider-toggle"
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-expanded={!collapsed}
              onClick={toggleCollapsed}
              className={`flex w-full cursor-pointer items-center gap-3 rounded-xl border-0 bg-transparent py-2.5 font-medium text-[#6B7280] transition-colors duration-150 hover:bg-[#F4F5F9] hover:text-[#111827] ${
                collapsed ? 'justify-center px-0' : 'px-3'
              }`}
            >
              <span
                data-cy="nav-sider-collapse-icon"
                className="flex shrink-0 items-center text-[21px] leading-none"
              >
                {collapsed ? (
                  <ChevronsRight size={21} />
                ) : (
                  <ChevronsLeft size={21} />
                )}
              </span>
              {!collapsed && (
                <span
                  data-cy="nav-sider-collapse-label"
                  className="flex-1 text-left"
                  style={{ fontSize }}
                >
                  Collapse
                </span>
              )}
            </button>
          </div>
        )}
      </Sider>
      <Layout
        style={{
          marginLeft: 0,
          transition: 'margin-left 0.3s ease',
          background: SHELL_BACKGROUND,
          flex: 1,
          minWidth: 0,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {showTopHeader && (
          <Header
            style={{
              padding: 0,
              background: SHELL_BACKGROUND,
              display: 'flex',
              alignItems: 'center',
              position: 'fixed',
              // Fixed, so it is sized off the viewport rather than off its flex
              // parent — the collaboration panel's width has to come out by hand
              // or the header runs underneath it.
              width: `calc(100% - ${siderOffset}px${
                collaborationOpen ? ` - ${collaborationPanelWidth}px` : ''
              })`,
              zIndex: 40,
              top: 0,
              left: siderOffset,
              transition: 'left 0.3s ease, width 0.3s ease',
              height: '74px',
              boxShadow: 'none',
            }}
          >
            <Link
              href="/home/overview"
              className="flex shrink-0 items-center"
              style={{ paddingLeft: contentGutter }}
              data-cy="nav-header-logo-link"
            >
              <Image
                unoptimized
                src="/image/selamnew-workspace-logo.svg"
                alt="SelamNew Workspace Logo"
                width={isMobile ? 120 : 150}
                height={40}
                style={{ objectFit: 'contain' }}
                data-cy="nav-header-logo"
              />
            </Link>

            <NavBar handleLogout={handleLogout} />
          </Header>
        )}

        <Content
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
          style={{
            paddingInline: 0,
            paddingLeft: siderOffset,
            paddingRight: 0,
            paddingTop: showTopHeader ? '74px' : 0,
            paddingBottom: isMobile ? 68 : 0,
            transition: 'padding-left 0.3s ease',
            background: SHELL_BACKGROUND,
          }}
        >
          <div
            data-cy="nav-content-inner"
            className="scrollbar-hide min-h-0 flex-1 overflow-x-hidden overflow-y-auto"
            style={{
              borderRadius: borderRadiusLG,
              marginTop: 0,
              width: '100%',
              maxWidth: '100%',
              paddingInline: contentGutter,
              background: SHELL_BACKGROUND,
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            <OfflineIndicator variant="content" showNotifications={false} />
            {/* The frame stays up while permissions re-check, so switching tabs
                does not flash it. */}
            <WorkspaceShell section={shellSection} employeeId={shellEmployeeId}>
              {pageContent}
            </WorkspaceShell>
          </div>
          <JobInfoAccessModal
            open={isModalOpen}
            onClose={handleCancel}
            onConfirm={handleOk}
          />
        </Content>

        {/* Mobile bottom navigation — replaces the sidebar on small screens */}
        {isMobile && (
          <MobileBottomNav
            groups={groupedMenuItems}
            colorPrimary={SHELL_ACCENT}
          />
        )}
      </Layout>

      {/* Inline collaboration panel — a flex sibling of the content column
          above, so opening it narrows the page instead of covering it. */}
      <CollaborationDock />
    </Layout>
  );
};

export default WorkspaceNav;
