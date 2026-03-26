import type { Node, Edge } from '@xyflow/react';
import type { DepartmentUserTree } from '@/store/server/features/organizationStructure/organizationalChart/interface';

// =============================================================================
// BACKEND → NODE MAPPING LOGIC
// =============================================================================
// Backend returns a tree: DepartmentUserTree (root) with nested department[].
// Each node in the chart = one department. For each department we show:
//   - id, position, level, isRoot  → from layout (placeTree)
//   - displayName, title, subtitle, avatarUrl → from the department "lead" person
//   - directReportCount → number of direct child departments
//   - borderColor → deterministic color from department id (for UI only)
//
// Lead person per department: first employee where departmentLeadOrNot === true,
// else first employee in employeeJobInformation[]. Name from user (firstName +
// middleName + lastName), avatar from user.profileImage/profileImageDownload,
// subtitle from user.role.name.
// =============================================================================

// Card size (kept compact so vertical stacks don't overlap with STACK_VERTICAL_GAP)
export const NODE_WIDTH = 168;
export const NODE_HEIGHT = 120;

// Grid-based layout constants (in px)
export const HORIZONTAL_GAP = 280;
export const VERTICAL_GAP = 200;
export const STACK_VERTICAL_GAP = 180;
export const STACK_SPINE_OFFSET = 80;
export const STACK_OFFSET_X = 30;
export const CONNECTOR_HEIGHT = 20;

// Extra length for top-level connector lines (vertical and horizontal)
export const TOP_LEVEL_VERTICAL_EXTRA = 80;
export const TOP_LEVEL_HORIZONTAL_EXTRA = 60;

export type OrgNodeData = {
  id: string;
  department: DepartmentUserTree;
  isRoot: boolean;
  level: number;
  displayName: string;
  title: string;
  subtitle: string;
  avatarUrl: string | null;
  directReportCount: number;
  /** For last-level nodes: count of users without team lead (shown in badge). */
  usersWithoutTeamLeadCount?: number;
  borderColor: string;
};

const BORDER_COLORS = [
  '#3B82F6',
  '#8B5CF6',
  '#EF4444',
  '#84CC16',
  '#6D28D9',
  '#A16207',
  '#166534',
  '#1E3A8A',
  '#7C3AED',
];

/** Deterministic color per department id (hash-based). Used for card top border and edge stroke. */
function getBorderColor(departmentId: string): string {
  let hash = 0;
  for (let i = 0; i < departmentId.length; i++) {
    hash = (hash << 5) - hash + departmentId.charCodeAt(i);
    hash |= 0;
  }
  return BORDER_COLORS[Math.abs(hash) % BORDER_COLORS.length];
}

/** True if string is a valid hex color (#RGB or #RRGGBB). */
function isHexColor(s: string): boolean {
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(s);
}

/**
 * Map backend department → who to show on the card (lead person).
 * - Lead: employeeJobInformation where departmentLeadOrNot === true, else [0].
 * - displayName: user.firstName + middleName + lastName (or "Not Assigned" if no user).
 * - title: department name (dept.name).
 * - subtitle: employeeJobInformation[0].position.name (position name on all levels), fallback to user.role?.name.
 * - avatarUrl: user.profileImage || user.profileImageDownload.
 */
function getLeadFromDepartment(dept: DepartmentUserTree): {
  displayName: string;
  title: string;
  subtitle: string;
  avatarUrl: string | null;
} {
  const lead =
    dept.employeeJobInformation?.find((e) => e.departmentLeadOrNot) ||
    dept.employeeJobInformation?.[0];
  const user = lead?.user;
  if (!user) {
    return {
      displayName: 'Unassigned',
      title: dept.name,
      subtitle: '',
      avatarUrl: null,
    };
  }
  const parts = [user.firstName, user.middleName, user.lastName].filter(
    Boolean,
  );
  const displayName = parts.join(' ').trim() || 'Unassigned';
  const positionName = lead?.position?.name ?? user.role?.name ?? '';
  const subtitle = positionName ? `${positionName}` : '';
  return {
    displayName,
    title: dept.name,
    subtitle,
    avatarUrl: user.profileImage || user.profileImageDownload || null,
  };
}

/** Leaf = department with no child departments (department[] empty or missing). */
function isLeaf(dept: DepartmentUserTree): boolean {
  return !dept.department || dept.department.length === 0;
}

/**
 * How many horizontal "columns" this subtree needs for layout.
 * Leaf or "all children are leaves" (vertical stack) → 1 column.
 * Otherwise → sum of children's column counts.
 */
function getWidthCols(
  dept: DepartmentUserTree,
  collapsedIds?: Set<string>,
): number {
  // If this department is collapsed, we treat it as a leaf for layout purposes.
  if (collapsedIds?.has(dept.id)) return 1;
  const children = dept.department ?? [];
  if (children.length === 0) return 1;
  const allChildrenAreLeaves = children.every(isLeaf);
  if (allChildrenAreLeaves) return 1;
  return children.reduce(
    (sum, child) => sum + getWidthCols(child, collapsedIds),
    0,
  );
}

interface PlacedNode {
  id: string;
  dept: DepartmentUserTree;
  x: number;
  y: number;
  level: number;
  isRoot: boolean;
}

export interface SpinePlacement {
  id: string;
  parentId: string;
  x: number;
  y: number;
}

/** Horizontal connector: one straight line below parent, then verticals to each child. */
export interface HorizontalConnectorPlacement extends Record<string, unknown> {
  id: string;
  parentId: string;
  x: number;
  y: number;
  width: number;
  /** Offset from connector left edge to parent's vertical drop (so parent→connector stays straight) */
  parentHandleOffset?: number;
  childIds: string[];
  childOffsets: number[]; // px from left of connector to each child's drop point
  color: string;
}

function placeTree(
  dept: DepartmentUserTree,
  x: number,
  y: number,
  level: number,
  isRoot: boolean,
  nodes: PlacedNode[],
  spines: SpinePlacement[],
  connectors: HorizontalConnectorPlacement[],
  edges: Edge[],
  colorMap: Map<string, string>,
  collapsedIds?: Set<string>,
): void {
  const nodeId = dept.id;
  const isCollapsed = !!collapsedIds?.has(nodeId);
  const children = isCollapsed ? [] : (dept.department ?? []);
  const nodeColor = colorMap.get(nodeId) || '#cbd5e0';

  nodes.push({ id: nodeId, dept, x, y, level, isRoot });

  if (!children.length) return; // no edges if there are no child departments

  const allChildrenAreLeaves = children.every(isLeaf);

  // Vertical stack case: all children are leaves (empty department arrays)
  // Last level requirement:
  // - NO shared vertical "spine" on the right.
  // - Each child gets its own smoothstep edge from the parent.
  if (allChildrenAreLeaves) {
    const stackX = x + STACK_OFFSET_X; // horizontal branch to the right
    const stackStartY = y + 180; // fixed offset from parent for first leaf

    // eslint-disable-next-line no-console
    console.log(
      `🔥 VERTICAL STACK for "${dept.name}" (${children.length} leaf children)`,
    );

    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      const childX = stackX;
      const childY = stackStartY + i * STACK_VERTICAL_GAP; // REQUIRED unique Y

      // eslint-disable-next-line no-console
      console.log(`  ↳ leaf "${child.name}" at x=${childX}, y=${childY}`);

      // direct parent -> leaf edge (colored with parent's border color)
      edges.push({
        id: `${nodeId}-${child.id}`,
        source: nodeId,
        target: child.id,
        type: 'smoothstep',
        sourceHandle: 'bottom',
        targetHandle: 'left',
        style: { stroke: '#E5E7EB', strokeWidth: 1.5 },
      });

      // leaf nodes are terminal: create them once, do NOT recurse
      nodes.push({
        id: child.id,
        dept: child,
        x: childX,
        y: childY,
        level: level + 1,
        isRoot: false,
      });
    }
    return;
  }

  // Normal horizontal layout: one straight line under parent, then verticals to each child
  const widths = children.map((c) => getWidthCols(c, collapsedIds));
  const totalCols = widths.reduce((sum, w) => sum + w, 0);

  // Left-most x position (centered under parent)
  let cursorX = x - ((totalCols - 1) * HORIZONTAL_GAP) / 2;
  // First two levels (0 and 1): same vertical line length as top level
  const verticalExtra = level < 2 ? TOP_LEVEL_VERTICAL_EXTRA : 0;
  const childY = y + VERTICAL_GAP + verticalExtra;

  const childIds: string[] = [];
  const childOffsets: number[] = [];
  const childPositions: { child: DepartmentUserTree; childX: number }[] = [];

  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    const cols = widths[i];
    const childWidth = (cols - 1) * HORIZONTAL_GAP;
    const childX = cursorX + childWidth / 2;
    childPositions.push({ child, childX });
    cursorX += cols * HORIZONTAL_GAP;
  }

  const firstX = childPositions[0].childX;
  const lastX = childPositions[childPositions.length - 1].childX;
  const connectorId = `connector-${nodeId}`;
  const parentCenterX = x + NODE_WIDTH / 2;
  // Span line from first child center to last child center: no extra on left, reaches 4th card
  const connectorX = firstX + NODE_WIDTH / 2;
  const connectorWidth = Math.max(0, lastX - firstX);
  const parentHandleOffset = parentCenterX - connectorX;
  const parentBottom = y + NODE_HEIGHT;
  const connectorY =
    parentBottom + (childY - parentBottom - CONNECTOR_HEIGHT) / 2;

  for (const { child, childX } of childPositions) {
    childIds.push(child.id);
    const childCenterX = childX + NODE_WIDTH / 2;
    childOffsets.push(childCenterX - connectorX);
  }

  connectors.push({
    id: connectorId,
    parentId: nodeId,
    x: connectorX,
    y: connectorY,
    width: connectorWidth,
    parentHandleOffset,
    childIds,
    childOffsets,
    color: nodeColor,
  });

  // Vertical edge: one straight-down line parent → connector
  edges.push({
    id: `${nodeId}-${connectorId}`,
    source: nodeId,
    target: connectorId,
    type: 'vertical',
    sourceHandle: 'bottom',
    targetHandle: 'top',
    style: { stroke: '#E5E7EB', strokeWidth: 1.5 },
  });

  // Vertical edges: one straight-down line connector → each child
  for (let i = 0; i < childPositions.length; i++) {
    const { child } = childPositions[i];
    edges.push({
      id: `${connectorId}-${child.id}`,
      source: connectorId,
      target: child.id,
      type: 'vertical',
      sourceHandle: String(i),
      targetHandle: 'top',
      style: { stroke: '#E5E7EB', strokeWidth: 1.5 },
    });
  }

  for (let i = 0; i < children.length; i++) {
    const { child, childX } = childPositions[i];
    placeTree(
      child,
      childX,
      childY,
      level + 1,
      false,
      nodes,
      spines,
      connectors,
      edges,
      colorMap,
      collapsedIds,
    );
  }
}

export type SpineNodeData = { id: string; parentId: string };

export type HorizontalConnectorNodeData = HorizontalConnectorPlacement;

/**
 * Recursively build a map of departmentId -> borderColor
 */
function buildColorMap(
  dept: DepartmentUserTree,
  map: Map<string, string>,
): void {
  const color =
    dept.departmentColor && isHexColor(dept.departmentColor)
      ? dept.departmentColor
      : getBorderColor(dept.id);
  map.set(dept.id, color);
  for (const child of dept.department ?? []) {
    buildColorMap(child, map);
  }
}

/**
 * Collect all node ids reachable from rootId by following edges (source → target).
 * Used for focus view (root + descendants) and collapse (descendants only).
 */
export function getSubtreeNodeIds(
  edges: { source: string; target: string }[],
  rootId: string,
): Set<string> {
  const ids = new Set<string>([rootId]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const e of edges) {
      if (ids.has(e.source) && !ids.has(e.target)) {
        ids.add(e.target);
        changed = true;
      }
    }
  }
  return ids;
}

/** Ids of nodes that are descendants of rootId (excluding rootId). */
export function getDescendantIds(
  edges: { source: string; target: string }[],
  rootId: string,
): Set<string> {
  const subtree = getSubtreeNodeIds(edges, rootId);
  subtree.delete(rootId);
  return subtree;
}

/**
 * Map backend user-tree (DepartmentUserTree) → React Flow nodes + edges.
 * 1. buildColorMap(root): walk tree, assign each dept.id a color (for borders/edges).
 * 2. placeTree(root, ...): recursively assign (x,y), collect PlacedNode[] and SpinePlacement[], build edges.
 * 3. Convert each PlacedNode → React Flow node with data from getLeadFromDepartment(p.dept).
 * 4. Add spine nodes (invisible connection points for vertical stacks).
 */
export function buildFlowFromTree(
  root: DepartmentUserTree | null | undefined,
  opts?: { collapsedDepartmentIds?: string[] | Set<string> },
): {
  nodes: (
    | Node<OrgNodeData>
    | Node<SpineNodeData, 'spine'>
    | Node<HorizontalConnectorNodeData, 'horizontalConnector'>
  )[];
  edges: Edge[];
} {
  const nodes: (
    | Node<OrgNodeData>
    | Node<SpineNodeData, 'spine'>
    | Node<HorizontalConnectorNodeData, 'horizontalConnector'>
  )[] = [];
  const edges: Edge[] = [];
  if (!root) return { nodes, edges };

  const placed: PlacedNode[] = [];
  const spines: SpinePlacement[] = [];
  const connectors: HorizontalConnectorPlacement[] = [];

  const colorMap = new Map<string, string>();
  buildColorMap(root, colorMap);

  const collapsedIds =
    opts?.collapsedDepartmentIds instanceof Set
      ? opts.collapsedDepartmentIds
      : new Set(opts?.collapsedDepartmentIds ?? []);

  placeTree(
    root,
    0,
    0,
    0,
    true,
    placed,
    spines,
    connectors,
    edges,
    colorMap,
    collapsedIds,
  );

  // Debug aid: ensure no overlapping positions for development
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.table(
      placed.map((n) => ({
        id: n.id,
        x: n.x,
        y: n.y,
      })),
    );
  }

  for (const p of placed) {
    const lead = getLeadFromDepartment(p.dept);
    const children = p.dept.department ?? [];
    nodes.push({
      id: p.id,
      type: 'orgNode',
      position: { x: p.x, y: p.y },
      data: {
        id: p.id,
        department: p.dept,
        isRoot: p.isRoot,
        level: p.level,
        displayName: lead.displayName,
        title: lead.title,
        subtitle: lead.subtitle,
        avatarUrl: lead.avatarUrl,
        directReportCount: children.length,
        usersWithoutTeamLeadCount: p.dept.usersWithoutTeamLeadCount,
        borderColor: colorMap.get(p.id) ?? getBorderColor(p.id),
      },
    });
  }

  for (const s of spines) {
    nodes.push({
      id: s.id,
      type: 'spine',
      position: { x: s.x, y: s.y },
      data: { id: s.id, parentId: s.parentId },
      selectable: false,
      draggable: false,
    });
  }

  for (const c of connectors) {
    const w = Math.max(1, c.width);
    nodes.push({
      id: c.id,
      type: 'horizontalConnector',
      position: { x: c.x, y: c.y },
      data: c,
      style: { width: w, height: CONNECTOR_HEIGHT },
      selectable: false,
      draggable: false,
    });
  }

  // Center level zero (root) in the horizontal view: shift all nodes so root is at layout center
  let minX = Infinity;
  let maxX = -Infinity;
  for (const n of nodes) {
    const left = n.position.x;
    let width = 0;
    if (n.type === 'orgNode') width = NODE_WIDTH;
    else if (n.type === 'horizontalConnector')
      width = (n.data as HorizontalConnectorNodeData).width ?? 0;
    minX = Math.min(minX, left);
    maxX = Math.max(maxX, left + width);
  }
  const layoutCenterX = (minX + maxX) / 2;
  const rootCenterX = NODE_WIDTH / 2; // root is at x=0
  const shiftX = layoutCenterX - rootCenterX;
  for (const n of nodes) {
    n.position.x += shiftX;
  }

  return { nodes, edges };
}
