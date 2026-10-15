import { GRID_COLUMNS, GRID_SNAP_TOLERANCE } from './constants';
import type { DashboardWidgetLayoutItem } from './types';

/**
 * Pure layout maths for the dashboard grid.
 *
 * The grid never compacts: a slot left behind by a removed or moved widget
 * stays empty so the widgets around it can be grown into the gap.
 */

/** Safety net so a pathological layout can never spin the push-down loop. */
const MAX_PUSH_ITERATIONS = 500;

type Rect = Pick<DashboardWidgetLayoutItem, 'x' | 'y' | 'w' | 'h'>;

export function rectsOverlap(a: Rect, b: Rect) {
  return (
    a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
  );
}

export function cloneLayout(layout: DashboardWidgetLayoutItem[]) {
  return layout.map((item) => ({ ...item }));
}

/** Number of grid rows the layout currently occupies. */
export function layoutRowCount(layout: DashboardWidgetLayoutItem[]) {
  return layout.reduce((rows, item) => Math.max(rows, item.y + item.h), 0);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), Math.max(min, max));
}

/**
 * Moves every widget that overlaps `anchorId` straight down, cascading to the
 * widgets they in turn collide with. Only the colliding widgets move, so the
 * rest of the layout — including empty slots — is left untouched.
 */
export function pushCollidingWidgetsDown(
  layout: DashboardWidgetLayoutItem[],
  anchorId: string,
) {
  const next = cloneLayout(layout);
  const anchor = next.find((item) => item.id === anchorId);
  if (!anchor) return next;

  const queue: DashboardWidgetLayoutItem[] = [anchor];
  let iterations = 0;

  while (queue.length > 0 && iterations < MAX_PUSH_ITERATIONS) {
    iterations += 1;
    const current = queue.shift() as DashboardWidgetLayoutItem;

    next.forEach((other) => {
      if (other.id === current.id) return;
      if (!rectsOverlap(current, other)) return;
      const pushedY = current.y + current.h;
      if (pushedY <= other.y) return;
      other.y = pushedY;
      queue.push(other);
    });
  }

  return next;
}

/**
 * Drops the widget at the requested slot.
 *
 * Same size onto a single neighbour swaps the two widgets. Any other overlap
 * keeps the dragged widget where it was dropped and pushes the widgets it
 * covers downwards.
 */
export function moveWidget(
  layout: DashboardWidgetLayoutItem[],
  id: string,
  targetX: number,
  targetY: number,
) {
  const source = layout.find((item) => item.id === id);
  if (!source) return cloneLayout(layout);

  const x = clamp(targetX, 0, GRID_COLUMNS - source.w);
  const y = Math.max(0, targetY);
  if (x === source.x && y === source.y) return cloneLayout(layout);

  const moved = { ...source, x, y };
  const overlapping = layout.filter(
    (item) => item.id !== id && rectsOverlap(moved, item),
  );

  if (overlapping.length === 1) {
    const target = overlapping[0];
    const isSameSize = target.w === source.w && target.h === source.h;
    if (isSameSize) {
      return layout.map((item) => {
        if (item.id === id) return { ...item, x: target.x, y: target.y };
        if (item.id === target.id) return { ...item, x: source.x, y: source.y };
        return { ...item };
      });
    }
  }

  const next = layout.map((item) => (item.id === id ? moved : { ...item }));
  return pushCollidingWidgetsDown(next, id);
}

/** Resizes a widget, never letting it drop below its own minimum size. */
export function resizeWidget(
  layout: DashboardWidgetLayoutItem[],
  id: string,
  targetW: number,
  targetH: number,
  minW: number,
  minH: number,
) {
  const source = layout.find((item) => item.id === id);
  if (!source) return cloneLayout(layout);

  const w = clamp(targetW, minW, GRID_COLUMNS - source.x);
  const h = Math.max(minH, targetH);
  if (w === source.w && h === source.h) return cloneLayout(layout);

  const next = layout.map((item) =>
    item.id === id ? { ...item, w, h } : { ...item },
  );
  return pushCollidingWidgetsDown(next, id);
}

/**
 * First empty slot that fits a `w` x `h` widget, scanning top-left to
 * bottom-right so an added widget reuses a hole before extending the grid.
 */
export function findFreeSlot(
  layout: DashboardWidgetLayoutItem[],
  w: number,
  h: number,
) {
  const rows = layoutRowCount(layout);
  const width = Math.min(w, GRID_COLUMNS);

  for (let y = 0; y <= rows; y += 1) {
    for (let x = 0; x + width <= GRID_COLUMNS; x += 1) {
      const candidate = { x, y, w: width, h };
      const isFree = layout.every((item) => !rectsOverlap(candidate, item));
      if (isFree) return { x, y };
    }
  }

  return { x: 0, y: rows };
}

function nearestCandidate(target: number, candidates: number[]) {
  let best = target;
  let bestDistance = GRID_SNAP_TOLERANCE + 1;

  candidates.forEach((candidate) => {
    const distance = Math.abs(candidate - target);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = candidate;
    }
  });

  return bestDistance <= GRID_SNAP_TOLERANCE ? best : target;
}

/**
 * Pulls a dragged widget's corner onto a neighbour's edge when it lands close
 * to one. At this grid resolution a free drop can sit a few pixels out of line;
 * snapping keeps rows and columns visually flush without locking the user to
 * coarse slots.
 */
export function snapDragPosition(
  layout: DashboardWidgetLayoutItem[],
  id: string,
  target: Rect,
) {
  const xCandidates = [0, GRID_COLUMNS - target.w];
  const yCandidates = [0];

  layout.forEach((item) => {
    if (item.id === id) return;
    xCandidates.push(
      item.x,
      item.x + item.w,
      item.x - target.w,
      item.x + item.w - target.w,
    );
    yCandidates.push(
      item.y,
      item.y + item.h,
      item.y - target.h,
      item.y + item.h - target.h,
    );
  });

  return {
    x: nearestCandidate(
      target.x,
      xCandidates.filter(
        (value) => value >= 0 && value + target.w <= GRID_COLUMNS,
      ),
    ),
    y: nearestCandidate(
      target.y,
      yCandidates.filter((value) => value >= 0),
    ),
  };
}

/** The resize equivalent: snaps the right and bottom edges onto neighbours. */
export function snapResizeSize(
  layout: DashboardWidgetLayoutItem[],
  id: string,
  origin: Pick<DashboardWidgetLayoutItem, 'x' | 'y'>,
  target: Pick<DashboardWidgetLayoutItem, 'w' | 'h'>,
) {
  const rightCandidates = [GRID_COLUMNS];
  const bottomCandidates: number[] = [];

  layout.forEach((item) => {
    if (item.id === id) return;
    rightCandidates.push(item.x, item.x + item.w);
    bottomCandidates.push(item.y, item.y + item.h);
  });

  const right = nearestCandidate(
    origin.x + target.w,
    rightCandidates.filter(
      (value) => value > origin.x && value <= GRID_COLUMNS,
    ),
  );
  const bottom = nearestCandidate(
    origin.y + target.h,
    bottomCandidates.filter((value) => value > origin.y),
  );

  return { w: right - origin.x, h: bottom - origin.y };
}
