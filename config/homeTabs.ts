import AccessGuard from '@/utils/permissionGuard';
import { IS_HOME_PROTOTYPE } from '@/config/homePrototype';

export const HOME_BASE = '/home';

export type HomeTabDef = {
  key: string;
  label: string;
  href: string;
  permissions: string[];
  requireAny?: boolean;
  /** Matches navBar `moduleCode`; omitted for Overview (always available). */
  moduleCode?: string;
};

/** Sidebar module order: OKR → CFR → TNA → Payroll → Timesheet; Announcements & Profile last. */
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
  },
  {
    key: 'plan',
    label: 'Plan & Report',
    href: `${HOME_BASE}/plan`,
    permissions: ['manage_planning_reporting'],
    moduleCode: 'OKR',
  },
  {
    key: 'weekly-priority',
    label: 'Priorities',
    href: `${HOME_BASE}/weekly-priority`,
    permissions: ['view_weekly_priority'],
    moduleCode: 'OKR',
  },
  {
    key: 'conversation',
    label: 'Conversations',
    href: `${HOME_BASE}/conversation`,
    permissions: ['view_feedback_conversation'],
    moduleCode: 'CFR',
  },
  {
    key: 'feedback',
    label: 'Feedback',
    href: `${HOME_BASE}/feedback`,
    permissions: ['view_feedback_list'],
    moduleCode: 'CFR',
  },
  {
    key: 'training',
    label: 'Learning',
    href: `${HOME_BASE}/training`,
    permissions: ['view_learning_growth'],
    moduleCode: 'TNA',
  },
  {
    key: 'payroll',
    label: 'My Payroll',
    href: `${HOME_BASE}/payroll`,
    permissions: ['view_my_payroll'],
    moduleCode: 'PAYROLL',
  },
  {
    key: 'attendance',
    label: 'Attendance',
    href: `${HOME_BASE}/attendance`,
    permissions: ['view_my_timesheet'],
    moduleCode: 'TIMESHEET',
  },
  {
    key: 'leave',
    label: 'Leave',
    href: `${HOME_BASE}/leave`,
    permissions: ['view_my_timesheet'],
    moduleCode: 'TIMESHEET',
  },
  {
    key: 'schedule',
    label: 'Schedule',
    href: `${HOME_BASE}/schedule`,
    permissions: ['view_my_timesheet'],
    moduleCode: 'TIMESHEET',
  },
  {
    key: 'approvals',
    label: 'Approvals',
    href: `${HOME_BASE}/approvals`,
    permissions: ['view_my_timesheet'],
    moduleCode: 'TIMESHEET',
  },
  {
    key: 'announcement',
    label: 'Announcements',
    href: `${HOME_BASE}/announcement`,
    permissions: ['view_organization'],
    moduleCode: 'ORGANIZATION',
  },
  {
    key: 'profile',
    label: 'My Profile',
    href: `${HOME_BASE}/profile`,
    permissions: [],
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
