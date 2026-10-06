import AccessGuard from '@/utils/permissionGuard';
import { IS_HOME_PROTOTYPE } from '@/config/homePrototype';

export const HOME_BASE = '/home';

/** A view inside a Home page (selected by query), shown as a banner tab. */
export type HomeSubTabDef = {
  key: string;
  label: string;
  href: string;
};

export type HomeTabDef = {
  key: string;
  label: string;
  href: string;
  permissions: string[];
  requireAny?: boolean;
  /** Matches navBar `moduleCode`; omitted for Overview (always available). */
  moduleCode?: string;
  /**
   * The workspace sidebar module (its nav tree key) the page sits in, as one
   * of that module's banner tabs. Pages without one are sidebar entries of
   * their own: Home, Approvals and My Profile.
   */
  menuKey?: string;
  /** The page's own views, shown as its banner tabs. */
  subTabs?: HomeSubTabDef[];
};

/** Approvals' inboxes, picked by `?module=`. */
export const APPROVAL_TABS: HomeSubTabDef[] = [
  {
    key: 'timesheet',
    label: 'Timesheet',
    href: `${HOME_BASE}/approvals?module=timesheet`,
  },
  {
    key: 'learning',
    label: 'Learning',
    href: `${HOME_BASE}/approvals?module=learning`,
  },
  {
    key: 'payroll',
    label: 'Payroll',
    href: `${HOME_BASE}/approvals?module=payroll`,
  },
];

/**
 * My Profile's sections, picked by `?tab=`. `itemKey` is the matching tab of
 * the employee details page.
 */
export const PROFILE_TABS: (HomeSubTabDef & { itemKey: string })[] = [
  { key: 'general', label: 'General', itemKey: '1' },
  { key: 'job', label: 'Job', itemKey: '2' },
  { key: 'documents', label: 'Documents', itemKey: '3' },
  { key: 'role-permission', label: 'Role Permission', itemKey: '4' },
  { key: 'offboarding', label: 'OffBoarding', itemKey: '5' },
  { key: 'probation', label: 'Probation', itemKey: '6' },
].map((tab) => ({ ...tab, href: `${HOME_BASE}/profile?tab=${tab.key}` }));

/** Tab order within each sidebar module follows this list. */
export const HOME_TABS: HomeTabDef[] = [
  {
    key: 'overview',
    label: 'Overview',
    href: `${HOME_BASE}/overview`,
    permissions: [],
  },
  {
    key: 'okr',
    label: 'My OKR',
    href: `${HOME_BASE}/okr`,
    permissions: ['view_okr_overview'],
    moduleCode: 'OKR',
    menuKey: '/okr-menu',
  },
  {
    key: 'plan',
    label: 'Plan & Report',
    href: `${HOME_BASE}/plan`,
    permissions: ['manage_planning_reporting'],
    moduleCode: 'OKR',
    menuKey: '/okr-menu',
  },
  {
    key: 'weekly-priority',
    label: 'Priorities',
    href: `${HOME_BASE}/weekly-priority`,
    permissions: ['view_weekly_priority'],
    moduleCode: 'OKR',
    menuKey: '/okr-menu',
  },
  {
    key: 'conversation',
    label: 'Conversations',
    href: `${HOME_BASE}/conversation`,
    permissions: ['view_feedback_conversation'],
    moduleCode: 'CFR',
    menuKey: 'feedback-menu',
  },
  {
    key: 'feedback',
    label: 'Feedback',
    href: `${HOME_BASE}/feedback`,
    permissions: ['view_feedback_list'],
    moduleCode: 'CFR',
    menuKey: 'feedback-menu',
  },
  {
    key: 'training',
    label: 'Learning',
    href: `${HOME_BASE}/training`,
    permissions: ['view_learning_growth'],
    moduleCode: 'TNA',
    menuKey: 'tna-menu',
  },
  {
    key: 'payroll',
    label: 'My Payroll',
    href: `${HOME_BASE}/payroll`,
    permissions: ['view_my_payroll'],
    moduleCode: 'PAYROLL',
    menuKey: '/payroll-menu',
  },
  {
    key: 'attendance',
    label: 'Attendance',
    href: `${HOME_BASE}/attendance`,
    permissions: ['view_my_timesheet'],
    moduleCode: 'TIMESHEET',
    menuKey: 'timesheet-menu',
  },
  {
    key: 'leave',
    label: 'Leave',
    href: `${HOME_BASE}/leave`,
    permissions: ['view_my_timesheet'],
    moduleCode: 'TIMESHEET',
    menuKey: 'timesheet-menu',
  },
  {
    key: 'schedule',
    label: 'Schedule',
    href: `${HOME_BASE}/schedule`,
    permissions: ['view_my_timesheet'],
    moduleCode: 'TIMESHEET',
    menuKey: 'timesheet-menu',
  },
  {
    key: 'approvals',
    label: 'Approvals',
    href: `${HOME_BASE}/approvals`,
    permissions: [
      'view_my_timesheet',
      'approve-employee-leave-request',
      'approve-tna',
      'approve-shift-swap-request',
      'approve-shift-swap-peer',
    ],
    requireAny: true,
    subTabs: APPROVAL_TABS,
  },
  {
    key: 'profile',
    label: 'My Profile',
    href: `${HOME_BASE}/profile`,
    permissions: [],
    subTabs: PROFILE_TABS,
  },
];

/** Map tenant module ids to module codes for subscription gating. */
export function buildSubscribedModuleCodes(
  modules: Array<{ id: string; isActive?: boolean; code?: string }>,
  subscribedModuleIds: Set<string>,
): Set<string> {
  const codes = new Set<string>(['DASHBOARD']);
  modules.forEach((module) => {
    if (!module.isActive || !subscribedModuleIds.has(module.id)) return;
    if (module.code) codes.add(module.code.toUpperCase());
  });
  return codes;
}

export function getVisibleHomeTabs(
  subscribedModuleCodes: Set<string>,
): HomeTabDef[] {
  if (IS_HOME_PROTOTYPE) {
    return HOME_TABS;
  }
  return HOME_TABS.filter((tab) => {
    if (tab.moduleCode && !subscribedModuleCodes.has(tab.moduleCode)) {
      return false;
    }
    if (!tab.permissions.length) return true;
    return AccessGuard.checkAccess({
      permissions: tab.permissions,
      requireAny: tab.requireAny,
    });
  });
}

export function getHomeTabFromPathname(pathname: string): string {
  if (!pathname.startsWith(HOME_BASE)) return 'overview';
  const segment = pathname.replace(HOME_BASE, '').split('/').filter(Boolean)[0];
  if (!segment) return 'overview';
  const match = HOME_TABS.find((tab) => tab.key === segment);
  return match?.key ?? 'overview';
}

export function getHomeTabHref(key: string): string {
  return (
    HOME_TABS.find((tab) => tab.key === key)?.href ?? `${HOME_BASE}/overview`
  );
}

export function getHomeTabByKey(key: string): HomeTabDef | undefined {
  return HOME_TABS.find((tab) => tab.key === key);
}

/** Overview uses "Home"; every other tab uses its label (e.g. "Leave"). */
export function getHomePageTitle(activeKey: string): string {
  if (activeKey === 'overview') return 'Home';
  return getHomeTabByKey(activeKey)?.label ?? 'Home';
}
