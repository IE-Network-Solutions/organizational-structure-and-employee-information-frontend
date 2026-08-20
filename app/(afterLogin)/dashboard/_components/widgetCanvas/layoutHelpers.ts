import { DASHBOARD_GRID_COLS } from './types';
import type {
  DashboardLayoutItem,
  DashboardPlanView,
  DashboardWidgetId,
} from './types';

export interface DashboardWidgetMeta {
  id: DashboardWidgetId;
  title: string;
  minW: number;
  minH: number;
  maxW: number;
  maxH?: number;
  allowedPlans: DashboardPlanView[];
}

export const ALL_DASHBOARD_PLANS: DashboardPlanView[] = [
  'Performance Plan',
  'Essential Plan ',
  'Enterprise Plan',
];

const NOT_ESSENTIAL: DashboardPlanView[] = [
  'Performance Plan',
  'Enterprise Plan',
];

const HEADER_KPI_IDS: DashboardWidgetId[] = [
  'kpi-average-okr',
  'kpi-company-okr',
  'kpi-appreciation',
  'kpi-reprimand',
  'kpi-vp-score',
];

const ATTENDANCE_KPI_IDS: DashboardWidgetId[] = [
  'attendance-days-present',
  'attendance-late-arrivals',
  'attendance-leaves',
  'attendance-closed-days',
];

const LEGACY_WIDGET_IDS = new Set([
  'header-kpis',
  'attendance-stats',
  'events',
  'event-essentials',
]);

const KPI_MIN = { minW: 12, minH: 4, maxH: 4, maxW: 60 } as const;
const ATTENDANCE_KPI_MIN = { minW: 15, minH: 4, maxH: 4, maxW: 60 } as const;
const MAIN_CARD_MIN = { minW: 20, minH: 10, maxW: 60 } as const;
const EVENT_CARD_MIN = { minW: 15, minH: 5, maxW: 60 } as const;
const ESSENTIALS_CARD_MIN = { minW: 30, minH: 5, maxW: 60 } as const;

export const DASHBOARD_WIDGET_META: DashboardWidgetMeta[] = [
  {
    id: 'kpi-average-okr',
    title: 'Your Average OKR',
    ...KPI_MIN,
    allowedPlans: NOT_ESSENTIAL,
  },
  {
    id: 'kpi-company-okr',
    title: 'Company OKR',
    ...KPI_MIN,
    allowedPlans: NOT_ESSENTIAL,
  },
  {
    id: 'kpi-appreciation',
    title: 'Appreciation',
    ...KPI_MIN,
    allowedPlans: NOT_ESSENTIAL,
  },
  {
    id: 'kpi-reprimand',
    title: 'Reprimand',
    ...KPI_MIN,
    allowedPlans: NOT_ESSENTIAL,
  },
  {
    id: 'kpi-vp-score',
    title: 'Total Variable Pay',
    ...KPI_MIN,
    allowedPlans: NOT_ESSENTIAL,
  },
  {
    id: 'attendance-days-present',
    title: 'Days Present',
    ...ATTENDANCE_KPI_MIN,
    allowedPlans: ['Essential Plan '],
  },
  {
    id: 'attendance-late-arrivals',
    title: 'Late Arrivals',
    ...ATTENDANCE_KPI_MIN,
    allowedPlans: ['Essential Plan '],
  },
  {
    id: 'attendance-leaves',
    title: 'Leaves Taken',
    ...ATTENDANCE_KPI_MIN,
    allowedPlans: ['Essential Plan '],
  },
  {
    id: 'attendance-closed-days',
    title: 'Closed Days',
    ...ATTENDANCE_KPI_MIN,
    allowedPlans: ['Essential Plan '],
  },
  {
    id: 'plan',
    title: 'Plan',
    ...MAIN_CARD_MIN,
    allowedPlans: NOT_ESSENTIAL,
  },
  {
    id: 'attendance-review',
    title: "This week's attendance",
    ...MAIN_CARD_MIN,
    allowedPlans: ALL_DASHBOARD_PLANS,
  },
  {
    id: 'recent-feedbacks',
    title: 'Recent feedback',
    ...MAIN_CARD_MIN,
    allowedPlans: ['Performance Plan'],
  },
  {
    id: 'approvals',
    title: 'Approvals',
    ...MAIN_CARD_MIN,
    allowedPlans: ['Essential Plan ', 'Enterprise Plan'],
  },
  {
    id: 'event-birthday',
    title: "Today's Birthday",
    ...EVENT_CARD_MIN,
    allowedPlans: NOT_ESSENTIAL,
  },
  {
    id: 'event-anniversary',
    title: 'Work Anniversary',
    ...EVENT_CARD_MIN,
    allowedPlans: NOT_ESSENTIAL,
  },
  {
    id: 'event-leader',
    title: 'Leader of the Week',
    ...EVENT_CARD_MIN,
    allowedPlans: NOT_ESSENTIAL,
  },
  {
    id: 'event-employee',
    title: 'Employee of the Week',
    ...EVENT_CARD_MIN,
    allowedPlans: NOT_ESSENTIAL,
  },
  {
    id: 'event-essentials-birthday',
    title: "Today's Birthdays",
    ...ESSENTIALS_CARD_MIN,
    allowedPlans: ['Essential Plan '],
  },
  {
    id: 'event-essentials-anniversary',
    title: 'Work Anniversaries',
    ...ESSENTIALS_CARD_MIN,
    allowedPlans: ['Essential Plan '],
  },
  {
    id: 'calendar',
    title: 'Calendar',
    minW: 60,
    minH: 18,
    maxW: 60,
    allowedPlans: NOT_ESSENTIAL,
  },
];

export const widgetMetaById = Object.fromEntries(
  DASHBOARD_WIDGET_META.map((widget) => [widget.id, widget]),
) as Record<DashboardWidgetId, DashboardWidgetMeta>;

export const widgetsForPlan = (plan: DashboardPlanView) =>
  DASHBOARD_WIDGET_META.filter((widget) => widget.allowedPlans.includes(plan));

const EVENT_ROW_IDS: DashboardWidgetId[] = [
  'event-birthday',
  'event-anniversary',
  'event-leader',
  'event-employee',
];

const headerKpiLayout = (): DashboardLayoutItem[] =>
  HEADER_KPI_IDS.map((id, index) => ({
    i: id,
    x: index * 12,
    y: 0,
    w: 12,
    h: 4,
  }));

const attendanceKpiLayout = (): DashboardLayoutItem[] =>
  ATTENDANCE_KPI_IDS.map((id, index) => ({
    i: id,
    x: index * 15,
    y: 0,
    w: 15,
    h: 4,
  }));

const eventRowLayout = (): DashboardLayoutItem[] =>
  EVENT_ROW_IDS.map((id, index) => ({
    i: id,
    x: index * 15,
    y: 14,
    w: 15,
    h: 5,
  }));

export const defaultLayoutForPlan = (
  plan: DashboardPlanView,
): DashboardLayoutItem[] => {
  if (plan === 'Essential Plan ') {
    return [
      ...attendanceKpiLayout(),
      { i: 'attendance-review', x: 0, y: 4, w: 20, h: 10 },
      { i: 'approvals', x: 40, y: 4, w: 20, h: 10 },
      { i: 'event-essentials-birthday', x: 0, y: 14, w: 30, h: 5 },
      { i: 'event-essentials-anniversary', x: 30, y: 14, w: 30, h: 5 },
    ];
  }

  const mainRowThird: DashboardLayoutItem =
    plan === 'Enterprise Plan'
      ? { i: 'approvals', x: 40, y: 4, w: 20, h: 10 }
      : { i: 'recent-feedbacks', x: 40, y: 4, w: 20, h: 10 };

  return [
    ...headerKpiLayout(),
    { i: 'plan', x: 0, y: 4, w: 20, h: 10 },
    { i: 'attendance-review', x: 20, y: 4, w: 20, h: 10 },
    mainRowThird,
    ...eventRowLayout(),
    { i: 'calendar', x: 0, y: 19, w: 60, h: 18 },
  ];
};

export const clampLayoutItem = (
  item: DashboardLayoutItem,
): DashboardLayoutItem => {
  const def = widgetMetaById[item.i];
  if (!def) return item;
  const w = Math.max(def.minW, Math.min(def.maxW, item.w));
  const maxH = def.maxH ?? Number.POSITIVE_INFINITY;
  const h = Math.max(def.minH, Math.min(maxH, item.h));
  return {
    ...item,
    w,
    h,
    x: Math.max(0, Math.min(DASHBOARD_GRID_COLS - w, item.x)),
    y: Math.max(0, item.y),
    hidden: item.hidden === true,
  };
};

export const clampLayout = (items: DashboardLayoutItem[]) =>
  items.map(clampLayoutItem);

export const resolveLayout = (
  saved: DashboardLayoutItem[] | undefined,
  plan: DashboardPlanView,
): DashboardLayoutItem[] => {
  const defaults = defaultLayoutForPlan(plan);
  if (!saved || saved.length === 0) return defaults;
  const allowedIds = new Set(widgetsForPlan(plan).map((widget) => widget.id));
  const filtered = clampLayout(
    saved.filter(
      (item) => allowedIds.has(item.i) && !LEGACY_WIDGET_IDS.has(item.i),
    ),
  );
  if (filtered.length === 0) return defaults;
  return filtered;
};
