import type { DashboardPlanKey, DashboardWidgetLayoutItem } from './types';

/**
 * Out-of-the-box arrangement per plan. These mirror the dashboard as it looked
 * before it became customizable, and are what "Reset" restores.
 *
 * The KPI cards are individual widgets, so the top row can be rearranged card
 * by card. Every row spans the full 60 columns: five KPI cards at 12, four at
 * 15, thirds at 20.
 *
 * The middle third of the Essential plan's second row is intentionally empty —
 * nothing packs into it until a widget is dropped or grown there.
 */
const DEFAULT_LAYOUTS: Record<DashboardPlanKey, DashboardWidgetLayoutItem[]> = {
  performance: [
    { id: 'kpi-average-okr', x: 0, y: 0, w: 12, h: 8 },
    { id: 'kpi-company-okr', x: 12, y: 0, w: 12, h: 8 },
    { id: 'kpi-appreciation', x: 24, y: 0, w: 12, h: 8 },
    { id: 'kpi-reprimand', x: 36, y: 0, w: 12, h: 8 },
    { id: 'kpi-variable-pay', x: 48, y: 0, w: 12, h: 8 },
    { id: 'my-plan', x: 0, y: 8, w: 20, h: 16 },
    { id: 'attendance-review', x: 20, y: 8, w: 20, h: 20 },
    { id: 'recent-feedbacks', x: 40, y: 8, w: 20, h: 16 },
    { id: 'birthdays', x: 0, y: 28, w: 15, h: 10 },
    { id: 'work-anniversaries', x: 15, y: 28, w: 15, h: 10 },
    { id: 'leader-of-the-week', x: 30, y: 28, w: 15, h: 10 },
    { id: 'employee-of-the-week', x: 45, y: 28, w: 15, h: 10 },
    { id: 'calendar', x: 0, y: 38, w: 60, h: 32 },
  ],
  enterprise: [
    { id: 'kpi-average-okr', x: 0, y: 0, w: 12, h: 8 },
    { id: 'kpi-company-okr', x: 12, y: 0, w: 12, h: 8 },
    { id: 'kpi-appreciation', x: 24, y: 0, w: 12, h: 8 },
    { id: 'kpi-reprimand', x: 36, y: 0, w: 12, h: 8 },
    { id: 'kpi-variable-pay', x: 48, y: 0, w: 12, h: 8 },
    { id: 'my-plan', x: 0, y: 8, w: 20, h: 16 },
    { id: 'attendance-review', x: 20, y: 8, w: 20, h: 20 },
    { id: 'approval-status', x: 40, y: 8, w: 20, h: 18 },
    { id: 'birthdays', x: 0, y: 28, w: 15, h: 10 },
    { id: 'work-anniversaries', x: 15, y: 28, w: 15, h: 10 },
    { id: 'leader-of-the-week', x: 30, y: 28, w: 15, h: 10 },
    { id: 'employee-of-the-week', x: 45, y: 28, w: 15, h: 10 },
    { id: 'calendar', x: 0, y: 38, w: 60, h: 32 },
  ],
  essential: [
    { id: 'kpi-days-present', x: 0, y: 0, w: 15, h: 8 },
    { id: 'kpi-late-arrivals', x: 15, y: 0, w: 15, h: 8 },
    { id: 'kpi-leaves-taken', x: 30, y: 0, w: 15, h: 8 },
    { id: 'kpi-closed-days', x: 45, y: 0, w: 15, h: 8 },
    { id: 'attendance-review', x: 0, y: 8, w: 20, h: 20 },
    { id: 'approval-status', x: 40, y: 8, w: 20, h: 18 },
    { id: 'event-essentials', x: 0, y: 28, w: 60, h: 10 },
  ],
};

export function getDefaultLayout(planKey: DashboardPlanKey) {
  return DEFAULT_LAYOUTS[planKey].map((item) => ({ ...item }));
}
