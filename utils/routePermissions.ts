'use client';

import { useCallback } from 'react';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import AccessGuard from '@/utils/permissionGuard';

/** Route + permissions used for pathname-based access check (same as sidebar). */
export type RouteWithPermissions = { route: string; permissions: string[] };

/** Recursive menu node (key + permissions + optional children of same shape). */
interface MenuRouteNode {
  key: string;
  permissions: string[];
  children?: MenuRouteNode[];
}

const HIDDEN_ROUTES: RouteWithPermissions[] = [
  { route: '/dashboard', permissions: [] },
  { route: '/', permissions: [] },
  { route: '/employees/manage-employees/[id]', permissions: [] },
  { route: '/employee-information/[id]', permissions: [] },
  {
    route: '/feedback/action-plan',
    permissions: ['view_feedback_conversation'],
  },
  { route: '/feedback/meeting', permissions: ['view_feedback_conversation'] },
  {
    route: '/feedback/categories',
    permissions: ['view_feedback_conversation'],
  },
];

/** Minimal menu structure (key + permissions) - must stay in sync with navBar index treeData */
const MENU_ROUTES: MenuRouteNode[] = [
  {
    key: '/organization',
    permissions: ['view_organization'],
    children: [
      { key: '/organization/chart', permissions: ['view_organization_chart'] },
      {
        key: '/organization/settings',
        permissions: ['view_organization_settings'],
      },
    ],
  },
  {
    key: '/employees',
    permissions: ['view_employees'],
    children: [
      { key: '/employees/manage-employees', permissions: ['manage_employees'] },
      { key: '/employees/settings', permissions: ['manage_employee_settings'] },
    ],
  },
  {
    key: '/recruitment',
    permissions: ['view_recruitment'],
    children: [
      {
        key: '/recruitment/dashboard',
        permissions: ['view_recruitment_dashboard'],
      },
      { key: '/recruitment/jobs', permissions: ['manage_recruitment_jobs'] },
      {
        key: '/recruitment/ai-job-matching',
        permissions: ['manage_recruitment_jobs'],
      },
      {
        key: '/recruitment/candidate',
        permissions: ['manage_recruitment_candidates'],
      },
      {
        key: '/recruitment/talent-resource',
        permissions: ['manage_recruitment_talent_pool'],
      },
      {
        key: '/recruitment/settings',
        permissions: ['manage_recruitment_settings'],
      },
    ],
  },
  {
    key: '/okr-menu',
    permissions: ['view_okr'],
    children: [
      { key: '/okr/dashboard', permissions: ['view_okr_dashboard'] },
      { key: '/okr', permissions: ['view_okr_overview'] },
      {
        key: '/planning-and-reporting',
        permissions: ['manage_planning_reporting'],
      },
      { key: '/weekly-priority', permissions: ['view_weekly_priority'] },
      { key: '/okr/settings', permissions: ['manage_okr_settings'] },
    ],
  },
  {
    key: 'feedback-menu',
    permissions: ['view_feedback'],
    children: [
      {
        key: '/feedback/conversation',
        permissions: ['view_feedback_conversation'],
      },
      { key: '/feedback/feedback', permissions: ['view_feedback_list'] },
      {
        key: '/feedback/recognition',
        permissions: ['view_feedback_recognition'],
      },
      { key: '/feedback/settings', permissions: ['manage_feedback_settings'] },
    ],
  },
  {
    key: 'tna-menu',
    permissions: ['view_learning_growth'],
    children: [
      { key: '/tna/management', permissions: ['manage_training'] },
      { key: '/tna/tna-management', permissions: ['manage_tna'] },
      {
        key: '/tna/settings/course-category',
        permissions: ['manage_tna_settings'],
      },
      {
        key: '/tna/settings/approvals',
        permissions: ['manage_tna_settings'],
      },
      {
        key: '/tna/settings/commitment-configuration',
        permissions: ['manage_tna_settings'],
      },
    ],
  },
  {
    key: '/payroll-menu',
    permissions: ['view_payroll_menu'],
    children: [
      {
        key: '/employee-information',
        permissions: ['view_employee_information'],
      },
      { key: '/payroll', permissions: ['view_payroll_overview_page'] },
      { key: '/myPayroll', permissions: ['view_my_payroll'] },
      { key: '/settings', permissions: ['manage_payroll_settings'] },
    ],
  },
  {
    key: 'timesheet-menu',
    permissions: ['view_timesheet'],
    children: [
      {
        key: '/timesheet/dashboard',
        permissions: ['view_timesheet_dashboard'],
      },
      { key: '/timesheet/my-timesheet', permissions: ['view_my_timesheet'] },
      {
        key: '/timesheet/employee-attendance',
        permissions: ['view_employee_attendance'],
      },
      {
        key: '/timesheet/leave-management/leaves',
        permissions: ['manage_leave_management'],
      },
      {
        key: '/timesheet/settings/closed-date',
        permissions: ['manage_timesheet_settings'],
      },
    ],
  },
  {
    key: 'compensation-menu',
    permissions: ['view_compensation'],
    children: [
      { key: '/allowance', permissions: ['view_allowance'] },
      { key: '/benefit', permissions: ['view_benefit'] },
      { key: '/deduction', permissions: ['view_deduction'] },
      {
        key: '/compensationSetting',
        permissions: ['manage_compensation_settings'],
      },
    ],
  },
  {
    key: 'incentive-menu',
    permissions: ['view_incentive'],
    children: [
      { key: '/incentives', permissions: ['view_incentive_page'] },
      { key: '/variable-pay', permissions: ['view_variable_pay'] },
      {
        key: '/incentives/settings',
        permissions: ['manage_incentive_settings'],
      },
    ],
  },
  { key: '/audit-log', permissions: ['view_audit_log'] },
  {
    key: 'admin-menu',
    permissions: ['view_admin_configuration'],
    children: [
      { key: '/admin/dashboard', permissions: ['view_admin_dashboard'] },
      { key: '/admin/billing', permissions: ['view_admin_billing'] },
      { key: '/admin/profile', permissions: ['view_admin_profile'] },
    ],
  },
];

function flattenRoutes(items: MenuRouteNode[]): RouteWithPermissions[] {
  const out: RouteWithPermissions[] = [];
  function traverse(list: MenuRouteNode[]) {
    list.forEach((item) => {
      if (item.key && item.permissions) {
        out.push({ route: item.key, permissions: item.permissions });
      }
      if (item.children) traverse(item.children);
    });
  }
  traverse(items);
  return out;
}

let cachedRoutes: RouteWithPermissions[] | null = null;

/** Same list as sidebar getRoutesAndPermissions(treeData): hidden routes + menu routes. */
export function getRoutesWithPermissions(): RouteWithPermissions[] {
  if (cachedRoutes) return cachedRoutes;
  cachedRoutes = [...HIDDEN_ROUTES, ...flattenRoutes(MENU_ROUTES)];
  return cachedRoutes;
}

/** Match pathname to route pattern (same as sidebar isRouteMatch). */
export function isRouteMatch(routePattern: string, pathname: string): boolean {
  if (routePattern.includes('[id]')) {
    const regexPattern = routePattern.replace('[id]', '[0-9a-fA-F-]{36}');
    return new RegExp('^' + regexPattern + '$').test(pathname);
  }
  if (routePattern.match(/\[.*?\]/g)) {
    const regexPattern = routePattern.replace(/\[.*?\]/g, '[^/]+');
    return new RegExp('^' + regexPattern + '$').test(pathname);
  }
  return routePattern === pathname;
}

/**
 * Check if the current user can access the given pathname.
 * Uses the same logic as the sidebar (Nav) and reuses AccessGuard.checkAccess.
 * Use this for redirects and for making notification links conditionally clickable.
 */
export function checkPathnamePermissions(pathname: string): boolean {
  const userData = useAuthenticationStore.getState().userData;
  const routesWithPermissions = getRoutesWithPermissions();

  const isOwner = userData?.role?.slug?.toLowerCase() === 'owner';
  if (isOwner) return true;

  const matchingRoute = routesWithPermissions.find((route) => {
    if (isRouteMatch(route.route, pathname)) return true;
    if (pathname.startsWith(route.route + '/')) return true;
    return false;
  });

  if (!matchingRoute) {
    const pathParts = pathname.split('/').filter(Boolean);
    for (let i = pathParts.length - 1; i > 0; i--) {
      const parentPath = '/' + pathParts.slice(0, i).join('/');
      const parentRoute = routesWithPermissions.find((r) =>
        isRouteMatch(r.route, parentPath),
      );
      if (parentRoute) {
        const hasParentPermissions = AccessGuard.checkAccess({
          permissions: parentRoute.permissions,
        });
        if (hasParentPermissions) return true;
      }
    }
    return false;
  }

  if (!matchingRoute.permissions || matchingRoute.permissions.length === 0)
    return true;
  return AccessGuard.checkAccess({ permissions: matchingRoute.permissions });
}

/** Hook for components (e.g. notifications) to check if the current user can access a route. Strips query string. Same check as sidebar. */
export function useCanAccessRoute(): (pathname: string) => boolean {
  return useCallback((pathname: string) => {
    const pathWithoutQuery = (pathname || '').split('?')[0] || pathname;
    return checkPathnamePermissions(pathWithoutQuery);
  }, []);
}
