/**
 * Geometry of the customizable dashboard grid.
 *
 * 60 columns is the smallest count that divides evenly by 3, 4 and 5, so every
 * row the dashboard uses — thirds, quarters and the five KPI cards — reaches
 * the full width with no leftover gutter. It also makes dragging and resizing
 * fine grained enough to feel like a canvas rather than a set of fixed slots.
 */
export const GRID_COLUMNS = 60;

/** Height of a single grid row, in pixels. */
export const GRID_ROW_HEIGHT = 4;

/** Gutter between two neighbouring slots, in pixels. */
export const GRID_GAP = 16;

/** Distance between the top of one row and the top of the next one. */
export const GRID_ROW_PITCH = GRID_ROW_HEIGHT + GRID_GAP;

/**
 * Guides are drawn every few columns/rows — one line per column would be noise
 * at this resolution.
 */
export const GRID_GUIDE_COLUMN_STEP = 5;
export const GRID_GUIDE_ROW_STEP = 4;

/** How close a dragged edge must get to another one before it snaps to it. */
export const GRID_SNAP_TOLERANCE = 2;

/** Below this container width the grid degrades to a single stacked column. */
export const GRID_STACKED_BREAKPOINT = 768;

/** Pixel height of a widget spanning `rows` grid rows. */
export const rowsToPixels = (rows: number) => rows * GRID_ROW_PITCH - GRID_GAP;
