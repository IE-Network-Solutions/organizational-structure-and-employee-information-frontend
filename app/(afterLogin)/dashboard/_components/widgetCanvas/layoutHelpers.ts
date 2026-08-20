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

const itemsOverlap = (
  first: DashboardLayoutItem,
  second: DashboardLayoutItem,
) =>
  first.x < second.x + second.w &&
  first.x + first.w > second.x &&
  first.y < second.y + second.h &&
  first.y + first.h > second.y;

const firstFitY = (
  item: DashboardLayoutItem,
  blockers: DashboardLayoutItem[],
) => {
  for (let y = 0; y <= item.y; y += 1) {
    const candidate = { ...item, y };
    if (!blockers.some((blocker) => itemsOverlap(candidate, blocker))) {
      return y;
    }
  }
  return item.y;
};

export const compactUp = (
  items: DashboardLayoutItem[],
  options?: {
    skipIds?: DashboardLayoutItem['i'][];
    reserved?: DashboardLayoutItem[];
  },
): DashboardLayoutItem[] => {
  const skip = new Set(options?.skipIds ?? []);
  const reserved = options?.reserved ?? [];
  const next = items.map((item) => ({ ...item }));
  let changed = true;
  let guard = 0;
  while (changed && guard < 40) {
    changed = false;
    guard += 1;
    const ordered = next
      .filter((item) => item.hidden !== true && !skip.has(item.i))
      .sort((first, second) => first.y - second.y || first.x - second.x);
    for (const item of ordered) {
      const blockers = [
        ...next.filter(
          (other) => other.i !== item.i && other.hidden !== true,
        ),
        ...reserved,
      ];
      const y = firstFitY(item, blockers);
      if (y !== item.y) {
        item.y = y;
        changed = true;
      }
    }
  }
  return clampLayout(next);
};

export const packLayout = (items: DashboardLayoutItem[]) =>
  compactUp(clampLayout(items));

export const snapSize = (item: DashboardLayoutItem): DashboardLayoutItem => {
  const def = widgetMetaById[item.i];
  if (!def) return clampLayoutItem(item);
  const w = Math.round(item.w / def.minW) * def.minW;
  const h = Math.round(item.h / def.minH) * def.minH;
  return clampLayoutItem({ ...item, w, h });
};

export const snapPosition = (item: DashboardLayoutItem): DashboardLayoutItem => {
  const def = widgetMetaById[item.i];
  if (!def) return clampLayoutItem(item);
  const x = Math.round(item.x / def.minW) * def.minW;
  const y = Math.max(0, Math.round(item.y));
  return clampLayoutItem({ ...item, x, y });
};

const sameSize = (first: DashboardLayoutItem, second: DashboardLayoutItem) =>
  first.w === second.w && first.h === second.h;

const closestOverlap = (
  hits: DashboardLayoutItem[],
  snapped: DashboardLayoutItem,
) => {
  const cx = snapped.x + snapped.w / 2;
  const cy = snapped.y + snapped.h / 2;
  return hits.reduce((best, item) => {
    const dist =
      Math.abs(item.x + item.w / 2 - cx) + Math.abs(item.y + item.h / 2 - cy);
    const bestDist =
      Math.abs(best.x + best.w / 2 - cx) + Math.abs(best.y + best.h / 2 - cy);
    return dist < bestDist ? item : best;
  });
};

export const overlappingSameSize = (
  items: DashboardLayoutItem[],
  snapped: DashboardLayoutItem,
): DashboardLayoutItem | null => {
  const hits = items.filter(
    (item) =>
      item.i !== snapped.i &&
      item.hidden !== true &&
      itemsOverlap(item, snapped) &&
      sameSize(item, snapped),
  );
  if (hits.length === 0) return null;
  return closestOverlap(hits, snapped);
};

export const swapItems = (
  items: DashboardLayoutItem[],
  firstId: DashboardLayoutItem['i'],
  secondId: DashboardLayoutItem['i'],
): DashboardLayoutItem[] => {
  const first = items.find((item) => item.i === firstId);
  const second = items.find((item) => item.i === secondId);
  if (!first || !second) return items;
  return items.map((item) => {
    if (item.i === firstId) return { ...item, x: second.x, y: second.y };
    if (item.i === secondId) return { ...item, x: first.x, y: first.y };
    return { ...item };
  });
};

export const resolvePushDown = (
  items: DashboardLayoutItem[],
  pinnedId: DashboardLayoutItem['i'],
): DashboardLayoutItem[] => {
  const next = items.map((item) => ({ ...item }));
  let changed = true;
  let guard = 0;
  while (changed && guard < 80) {
    changed = false;
    guard += 1;
    for (let index = 0; index < next.length; index += 1) {
      for (let other = index + 1; other < next.length; other += 1) {
        const first = next[index];
        const second = next[other];
        if (first.hidden || second.hidden || !itemsOverlap(first, second)) {
          continue;
        }
        const pinned =
          first.i === pinnedId ? first : second.i === pinnedId ? second : null;
        const moving = pinned
          ? pinned.i === first.i
            ? second
            : first
          : first.y <= second.y
            ? second
            : first;
        const stay = moving.i === first.i ? second : first;
        const newY = stay.y + stay.h;
        if (moving.y !== newY) {
          moving.y = newY;
          changed = true;
        }
      }
    }
  }
  return clampLayout(next);
};

export const placeAndPushDown = (
  items: DashboardLayoutItem[],
  next: DashboardLayoutItem,
): DashboardLayoutItem[] => {
  const snapped = snapPosition(next);
  const origin = items.find((item) => item.i === next.i);
  const swapTarget = overlappingSameSize(items, snapped);
  if (swapTarget && origin) {
    return packLayout(swapItems(items, next.i, swapTarget.i));
  }
  const placed = items.map((item) =>
    item.i === next.i ? snapped : { ...item },
  );
  return compactUp(resolvePushDown(placed, next.i));
};

export const previewPushDown = (
  items: DashboardLayoutItem[],
  placeholder: DashboardLayoutItem,
): DashboardLayoutItem[] => {
  const origin = items.find((item) => item.i === placeholder.i);
  const snapped = snapPosition(placeholder);
  const swapTarget = overlappingSameSize(items, snapped);
  if (swapTarget && origin) {
    return items.map((item) =>
      item.i === swapTarget.i ? { ...item, x: origin.x, y: origin.y } : item,
    );
  }
  const placed = items.map((item) =>
    item.i === placeholder.i ? snapped : { ...item },
  );
  const pushed = resolvePushDown(placed, placeholder.i);
  const compacted = compactUp(pushed, {
    skipIds: [placeholder.i],
    reserved: origin ? [origin] : [],
  });
  if (!origin) return compacted;
  return compacted.map((item) =>
    item.i === placeholder.i ? { ...origin } : item,
  );
};

export const placeInNearestSlot = (
  items: DashboardLayoutItem[],
  next: DashboardLayoutItem,
): DashboardLayoutItem[] => {
  const snapped = snapPosition(next);
  const others = items.filter(
    (item) => item.i !== next.i && item.hidden !== true,
  );
  const def = widgetMetaById[next.i];
  const stepX = def?.minW ?? 1;

  const isFree = (candidate: DashboardLayoutItem) =>
    !others.some((other) => itemsOverlap(candidate, other));

  if (isFree(snapped)) {
    return items.map((item) => (item.i === next.i ? snapped : item));
  }

  const maxX = DASHBOARD_GRID_COLS - snapped.w;
  const occupiedBottom = others.reduce(
    (max, item) => Math.max(max, item.y + item.h),
    snapped.y + snapped.h,
  );
  const maxY = occupiedBottom + snapped.h;

  let best = snapped;
  let bestDist = Number.POSITIVE_INFINITY;
  for (let y = 0; y <= maxY; y += 1) {
    for (let x = 0; x <= maxX; x += stepX) {
      const candidate = { ...snapped, x, y };
      if (!isFree(candidate)) continue;
      const dist = Math.abs(x - snapped.x) + Math.abs(y - snapped.y);
      if (dist < bestDist) {
        bestDist = dist;
        best = candidate;
      }
    }
  }

  return items.map((item) => (item.i === next.i ? best : item));
};

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
  return packLayout(filtered);
};
