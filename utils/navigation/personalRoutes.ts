import { HOME_BASE } from '@/config/homeTabs';

/** Routes moved into the Home hub — hidden from module sidebar children. */
export const PERSONAL_ROUTE_PREFIXES = [
  '/dashboard',
  HOME_BASE,
  '/timesheet/my-timesheet',
  '/myPayroll',
  '/planning-and-reporting',
  '/tna/my-training',
  '/feedback/feedback',
  '/feedback/conversation',
  '/feedback/recognition',
  '/weekly-priority',
] as const;

/** OKR objectives entry is personal when exactly `/okr` (team/company views stay in module nav). */
export function isPersonalRoute(routeKey: string): boolean {
  const key = String(routeKey).replace(/\/+$/, '') || '/';
  if (key === '/okr') return true;
  return PERSONAL_ROUTE_PREFIXES.some(
    (prefix) => key === prefix || key.startsWith(`${prefix}/`),
  );
}

export function isHomePath(pathname: string): boolean {
  return (
    pathname === '/dashboard' ||
    pathname === '/' ||
    pathname === HOME_BASE ||
    pathname.startsWith(`${HOME_BASE}/`)
  );
}
