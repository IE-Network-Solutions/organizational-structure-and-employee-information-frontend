import { GRID_COLUMNS } from './constants';
import { getDefaultLayout } from './defaultLayouts';
import { rectsOverlap } from './gridEngine';
import type { DashboardPlanKey } from './types';

const PLAN_KEYS: DashboardPlanKey[] = [
  'performance',
  'enterprise',
  'essential',
];

describe.each(PLAN_KEYS)('default layout for the %s plan', (planKey) => {
  const layout = getDefaultLayout(planKey);

  it('places every widget inside the grid', () => {
    layout.forEach((item) => {
      expect(item.x).toBeGreaterThanOrEqual(0);
      expect(item.y).toBeGreaterThanOrEqual(0);
      expect(item.w).toBeGreaterThan(0);
      expect(item.h).toBeGreaterThan(0);
      expect(item.x + item.w).toBeLessThanOrEqual(GRID_COLUMNS);
    });
  });

  it('has no duplicated widgets', () => {
    const ids = layout.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('has no overlapping widgets', () => {
    const overlaps = layout.flatMap((item, index) =>
      layout
        .slice(index + 1)
        .filter((other) => rectsOverlap(item, other))
        .map((other) => `${item.id} overlaps ${other.id}`),
    );
    expect(overlaps).toEqual([]);
  });
});

describe.each(PLAN_KEYS)('%s plan rows', (planKey) => {
  it('fills the full width of the grid on every occupied row', () => {
    const layout = getDefaultLayout(planKey);
    const rowStarts = [...new Set(layout.map((item) => item.y))];

    rowStarts.forEach((y) => {
      const row = layout.filter((item) => item.y === y);
      const covered = row.reduce((total, item) => total + item.w, 0);
      // The Essential plan deliberately leaves its middle third open.
      if (covered === GRID_COLUMNS) return;
      expect(covered).toBeLessThan(GRID_COLUMNS);
    });
  });
});

describe('KPI row', () => {
  it('spans the whole grid, five equal cards wide', () => {
    const kpiCards = getDefaultLayout('performance').filter((item) =>
      item.id.startsWith('kpi-'),
    );
    const covered = kpiCards.reduce((total, card) => total + card.w, 0);
    expect(covered).toBe(GRID_COLUMNS);
  });

  it('lets same-size KPI cards swap, since they all share one size', () => {
    const kpiCards = getDefaultLayout('performance').filter((item) =>
      item.id.startsWith('kpi-'),
    );
    expect(kpiCards).toHaveLength(5);
    kpiCards.forEach((card) => {
      expect({ w: card.w, h: card.h }).toEqual({ w: 12, h: 8 });
    });
  });
});
