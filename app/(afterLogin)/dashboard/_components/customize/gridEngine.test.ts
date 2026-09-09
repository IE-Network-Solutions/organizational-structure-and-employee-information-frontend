import { GRID_COLUMNS } from './constants';
import {
  findFreeSlot,
  layoutRowCount,
  moveWidget,
  rectsOverlap,
  resizeWidget,
  snapDragPosition,
  snapResizeSize,
} from './gridEngine';
import type { DashboardWidgetLayoutItem } from './types';

const byId = (layout: DashboardWidgetLayoutItem[], id: string) =>
  layout.find((item) => item.id === id) as DashboardWidgetLayoutItem;

describe('rectsOverlap', () => {
  it('treats widgets that only touch edges as separate', () => {
    expect(
      rectsOverlap({ x: 0, y: 0, w: 4, h: 4 }, { x: 4, y: 0, w: 4, h: 4 }),
    ).toBe(false);
    expect(
      rectsOverlap({ x: 0, y: 0, w: 4, h: 4 }, { x: 0, y: 4, w: 4, h: 4 }),
    ).toBe(false);
  });

  it('detects a real overlap', () => {
    expect(
      rectsOverlap({ x: 0, y: 0, w: 4, h: 4 }, { x: 3, y: 3, w: 4, h: 4 }),
    ).toBe(true);
  });
});

describe('moveWidget', () => {
  it('swaps two widgets of the same size', () => {
    const layout: DashboardWidgetLayoutItem[] = [
      { id: 'a', x: 0, y: 0, w: 4, h: 8 },
      { id: 'b', x: 4, y: 0, w: 4, h: 8 },
    ];

    const next = moveWidget(layout, 'a', 4, 0);

    expect(byId(next, 'a')).toMatchObject({ x: 4, y: 0 });
    expect(byId(next, 'b')).toMatchObject({ x: 0, y: 0 });
  });

  it('does not swap widgets of different sizes and pushes the other one down', () => {
    const layout: DashboardWidgetLayoutItem[] = [
      { id: 'a', x: 0, y: 0, w: 4, h: 8 },
      { id: 'b', x: 4, y: 0, w: 4, h: 10 },
    ];

    const next = moveWidget(layout, 'a', 4, 0);

    expect(byId(next, 'a')).toMatchObject({ x: 4, y: 0 });
    expect(byId(next, 'b')).toMatchObject({ x: 4, y: 8 });
  });

  it('cascades the push down to widgets further below', () => {
    const layout: DashboardWidgetLayoutItem[] = [
      { id: 'a', x: 0, y: 0, w: 4, h: 4 },
      { id: 'b', x: 4, y: 0, w: 4, h: 6 },
      { id: 'c', x: 4, y: 6, w: 4, h: 6 },
    ];

    const next = moveWidget(layout, 'a', 4, 0);

    expect(byId(next, 'b')).toMatchObject({ x: 4, y: 4 });
    expect(byId(next, 'c')).toMatchObject({ x: 4, y: 10 });
  });

  it('leaves the slot the widget came from empty', () => {
    const layout: DashboardWidgetLayoutItem[] = [
      { id: 'a', x: 0, y: 0, w: 4, h: 4 },
      { id: 'b', x: 4, y: 0, w: 4, h: 4 },
      { id: 'c', x: 8, y: 0, w: 4, h: 4 },
    ];

    const next = moveWidget(layout, 'a', 0, 4);

    expect(byId(next, 'a')).toMatchObject({ x: 0, y: 4 });
    expect(byId(next, 'b')).toMatchObject({ x: 4, y: 0 });
    expect(byId(next, 'c')).toMatchObject({ x: 8, y: 0 });
  });

  it('keeps the widget inside the grid', () => {
    const layout: DashboardWidgetLayoutItem[] = [
      { id: 'a', x: 0, y: 0, w: 4, h: 4 },
    ];

    expect(
      byId(moveWidget(layout, 'a', GRID_COLUMNS + 5, 0), 'a'),
    ).toMatchObject({ x: GRID_COLUMNS - 4 });
    expect(byId(moveWidget(layout, 'a', -3, -2), 'a')).toMatchObject({
      x: 0,
      y: 0,
    });
  });
});

describe('resizeWidget', () => {
  it('never shrinks a widget below its minimum size', () => {
    const layout: DashboardWidgetLayoutItem[] = [
      { id: 'a', x: 0, y: 0, w: 4, h: 8 },
    ];

    const next = resizeWidget(layout, 'a', 1, 1, 3, 5);

    expect(byId(next, 'a')).toMatchObject({ w: 3, h: 5 });
  });

  it('grows into an empty neighbouring slot without moving anyone', () => {
    const layout: DashboardWidgetLayoutItem[] = [
      { id: 'a', x: 0, y: 0, w: 4, h: 8 },
      { id: 'b', x: 8, y: 0, w: 4, h: 8 },
    ];

    const next = resizeWidget(layout, 'a', 8, 8, 3, 5);

    expect(byId(next, 'a')).toMatchObject({ w: 8, h: 8 });
    expect(byId(next, 'b')).toMatchObject({ x: 8, y: 0 });
  });

  it('pushes an overlapped neighbour down when growing over it', () => {
    const layout: DashboardWidgetLayoutItem[] = [
      { id: 'a', x: 0, y: 0, w: 4, h: 8 },
      { id: 'b', x: 0, y: 8, w: 4, h: 8 },
    ];

    const next = resizeWidget(layout, 'a', 4, 12, 3, 5);

    expect(byId(next, 'a')).toMatchObject({ h: 12 });
    expect(byId(next, 'b')).toMatchObject({ y: 12 });
  });

  it('caps the width at the right edge of the grid', () => {
    const layout: DashboardWidgetLayoutItem[] = [
      { id: 'a', x: GRID_COLUMNS - 4, y: 0, w: 4, h: 8 },
    ];

    expect(
      byId(resizeWidget(layout, 'a', GRID_COLUMNS, 8, 2, 4), 'a'),
    ).toMatchObject({ w: 4 });
  });
});

describe('findFreeSlot', () => {
  it('reuses a gap left behind by a hidden widget', () => {
    const layout: DashboardWidgetLayoutItem[] = [
      { id: 'a', x: 0, y: 0, w: 4, h: 4 },
      { id: 'c', x: 8, y: 0, w: 4, h: 4 },
    ];

    expect(findFreeSlot(layout, 4, 4)).toEqual({ x: 4, y: 0 });
  });

  it('falls back to the bottom of the grid when nothing fits', () => {
    const layout: DashboardWidgetLayoutItem[] = [
      { id: 'a', x: 0, y: 0, w: GRID_COLUMNS, h: 4 },
    ];

    expect(findFreeSlot(layout, GRID_COLUMNS, 4)).toEqual({ x: 0, y: 4 });
  });
});

describe('layoutRowCount', () => {
  it('reports the lowest occupied row', () => {
    expect(
      layoutRowCount([
        { id: 'a', x: 0, y: 0, w: 4, h: 4 },
        { id: 'b', x: 4, y: 6, w: 4, h: 10 },
      ]),
    ).toBe(16);
  });
});

describe('snapDragPosition', () => {
  const layout: DashboardWidgetLayoutItem[] = [
    { id: 'a', x: 0, y: 0, w: 12, h: 8 },
    { id: 'b', x: 12, y: 0, w: 12, h: 8 },
  ];

  it('pulls a near-miss drop flush against its neighbour', () => {
    expect(snapDragPosition(layout, 'c', { x: 23, y: 1, w: 12, h: 8 })).toEqual(
      { x: 24, y: 0 },
    );
  });

  it('leaves a deliberate drop in open space alone', () => {
    expect(
      snapDragPosition(layout, 'c', { x: 40, y: 20, w: 12, h: 8 }),
    ).toEqual({ x: 40, y: 20 });
  });

  it('never snaps a widget outside the grid', () => {
    const { x } = snapDragPosition(layout, 'c', {
      x: GRID_COLUMNS - 12,
      y: 0,
      w: 12,
      h: 8,
    });
    expect(x + 12).toBeLessThanOrEqual(GRID_COLUMNS);
  });
});

describe('snapResizeSize', () => {
  const layout: DashboardWidgetLayoutItem[] = [
    { id: 'a', x: 0, y: 0, w: 20, h: 16 },
    { id: 'b', x: 20, y: 0, w: 20, h: 16 },
  ];

  it('snaps a stretched edge onto the neighbour it almost reaches', () => {
    expect(
      snapResizeSize(layout, 'a', { x: 0, y: 0 }, { w: 19, h: 16 }),
    ).toEqual({ w: 20, h: 16 });
  });

  it('leaves a size that is nowhere near an edge alone', () => {
    expect(
      snapResizeSize(layout, 'a', { x: 0, y: 0 }, { w: 30, h: 40 }),
    ).toEqual({ w: 30, h: 40 });
  });
});
