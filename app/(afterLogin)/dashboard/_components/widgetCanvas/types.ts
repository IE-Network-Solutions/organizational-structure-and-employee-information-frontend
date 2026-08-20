export type DashboardPlanView =
  | 'Performance Plan'
  | 'Essential Plan '
  | 'Enterprise Plan';

export type DashboardWidgetId =
  | 'kpi-average-okr'
  | 'kpi-company-okr'
  | 'kpi-appreciation'
  | 'kpi-reprimand'
  | 'kpi-vp-score'
  | 'attendance-days-present'
  | 'attendance-late-arrivals'
  | 'attendance-leaves'
  | 'attendance-closed-days'
  | 'plan'
  | 'attendance-review'
  | 'recent-feedbacks'
  | 'approvals'
  | 'event-birthday'
  | 'event-anniversary'
  | 'event-leader'
  | 'event-employee'
  | 'event-essentials-birthday'
  | 'event-essentials-anniversary'
  | 'calendar';

export interface DashboardLayoutItem {
  i: DashboardWidgetId;
  x: number;
  y: number;
  w: number;
  h: number;
  hidden?: boolean;
}

/** LCM of 3, 4, and 5 so KPI / main / event rows all divide evenly. */
export const DASHBOARD_GRID_COLS = 60;
export const DASHBOARD_ROW_HEIGHT = 20;
export const DASHBOARD_GRID_MARGIN: readonly [number, number] = [16, 16];

export const layoutStorageKey = (userId: string, plan: DashboardPlanView) =>
  `${userId}::${plan}::v6`;
