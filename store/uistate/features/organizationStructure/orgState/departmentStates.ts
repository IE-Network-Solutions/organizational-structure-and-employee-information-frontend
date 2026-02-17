import { create } from 'zustand';

export interface DepartmentToEdit {
  id: string;
  name: string;
  description?: string;
  branchId?: string;
}

/** Inline: ids reachable from rootId (source → target), then exclude root. Used for collapse. */
function getDescendantIds(
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
  ids.delete(rootId);
  return ids;
}

function computeVisibleNodesAndEdges<
  T extends { id: string },
  E extends { source: string; target: string },
>(
  fullNodes: T[],
  fullEdges: E[],
  collapsedIds: string[],
): { nodes: T[]; edges: E[] } {
  const hidden = new Set<string>();
  for (const id of collapsedIds) {
    getDescendantIds(fullEdges, id).forEach((x) => hidden.add(x));
  }
  const nodes = fullNodes.filter((n) => !hidden.has(n.id));
  const edges = fullEdges.filter(
    (e) => !hidden.has(e.source) && !hidden.has(e.target),
  );
  return { nodes, edges };
}

interface DepartmentState {
  rootDeptId: string | null;
  childDeptId: string | null;
  mergedDeptName: string;
  teamLeader: string | null;
  setRootDeptId: (id: string | null) => void;
  setChildDeptId: (id: string | null) => void;
  setMergedDeptName: (name: string) => void;
  setTeamLeader: (leader: string | null) => void;
  // Add/Edit department modal (org structure)
  addModalOpen: boolean;
  editModalOpen: boolean;
  parentIdForAdd: string | null;
  /** Anchor position for add modal (below the clicked Add button) */
  addModalAnchor: { top: number; left: number } | null;
  /** Anchor position for edit modal (below the clicked Edit button) */
  editModalAnchor: { top: number; left: number } | null;
  departmentToEdit: DepartmentToEdit | null;
  /** Cached full department after create; used when opening Edit before tree refetch has full data */
  lastCreatedDepartment: DepartmentToEdit | null;
  setAddModalOpen: (open: boolean) => void;
  setEditModalOpen: (open: boolean) => void;
  setParentIdForAdd: (id: string | null) => void;
  setAddModalAnchor: (anchor: { top: number; left: number } | null) => void;
  setEditModalAnchor: (anchor: { top: number; left: number } | null) => void;
  setDepartmentToEdit: (d: DepartmentToEdit | null) => void;
  setLastCreatedDepartment: (d: DepartmentToEdit | null) => void;
  /** Modal showing users/staff in a department (e.g. when clicking badge on leaf node) */
  usersModalOpen: boolean;
  usersModalDepartmentId: string | null;
  usersModalAnchor: { top: number; left: number } | null;
  setUsersModalOpen: (open: boolean) => void;
  setUsersModalDepartmentId: (id: string | null) => void;
  setUsersModalAnchor: (anchor: { top: number; left: number } | null) => void;
  /** Delete department: two-step modal (choose shift-to → confirm) */
  deleteModalOpen: boolean;
  deleteStep: 1 | 2;
  departmentTobeDeletedId: string | null;
  departmentTobeDeletedName: string | null;
  departmentTobeShiftedId: string | null;
  setDeleteModalOpen: (open: boolean) => void;
  setDeleteStep: (step: 1 | 2) => void;
  setDepartmentTobeDeleted: (id: string | null, name: string | null) => void;
  setDepartmentTobeShiftedId: (id: string | null) => void;
  /** Org chart: department ids whose children are collapsed (hidden) */
  collapsedDepartmentIds: string[];
  toggleCollapse: (departmentId: string) => void;
  /** Org chart flow: full graph and visible (filtered by collapse) */
  fullNodes: { id: string }[];
  fullEdges: { id?: string; source: string; target: string }[];
  nodes: unknown[];
  edges: unknown[];
  setFullGraph: (
    nodes: { id: string }[],
    edges: { id?: string; source: string; target: string }[],
  ) => void;
  setNodes: (nodes: unknown[] | ((prev: unknown[]) => unknown[])) => void;
  setEdges: (edges: unknown[] | ((prev: unknown[]) => unknown[])) => void;
  reset: () => void;
}

const useDepartmentStore = create<DepartmentState>((set) => ({
  rootDeptId: null,
  childDeptId: null,
  mergedDeptName: '',
  teamLeader: null,
  setRootDeptId: (id) => set({ rootDeptId: id }),
  setChildDeptId: (id) => set({ childDeptId: id }),
  setMergedDeptName: (name) => set({ mergedDeptName: name }),
  setTeamLeader: (leader) => set({ teamLeader: leader }),
  addModalOpen: false,
  editModalOpen: false,
  parentIdForAdd: null,
  addModalAnchor: null,
  editModalAnchor: null,
  departmentToEdit: null,
  lastCreatedDepartment: null,
  setAddModalOpen: (open) => set({ addModalOpen: open }),
  setEditModalOpen: (open) => set({ editModalOpen: open }),
  setParentIdForAdd: (id) => set({ parentIdForAdd: id }),
  setAddModalAnchor: (anchor) => set({ addModalAnchor: anchor }),
  setEditModalAnchor: (anchor) => set({ editModalAnchor: anchor }),
  setDepartmentToEdit: (d) => set({ departmentToEdit: d }),
  setLastCreatedDepartment: (d) => set({ lastCreatedDepartment: d }),
  usersModalOpen: false,
  usersModalDepartmentId: null,
  usersModalAnchor: null,
  setUsersModalOpen: (open) => set({ usersModalOpen: open }),
  setUsersModalDepartmentId: (id) => set({ usersModalDepartmentId: id }),
  setUsersModalAnchor: (anchor) => set({ usersModalAnchor: anchor }),
  deleteModalOpen: false,
  deleteStep: 1,
  departmentTobeDeletedId: null,
  departmentTobeDeletedName: null,
  departmentTobeShiftedId: null,
  setDeleteModalOpen: (open) => set({ deleteModalOpen: open }),
  setDeleteStep: (step) => set({ deleteStep: step }),
  setDepartmentTobeDeleted: (id, name) =>
    set({ departmentTobeDeletedId: id, departmentTobeDeletedName: name }),
  setDepartmentTobeShiftedId: (id) => set({ departmentTobeShiftedId: id }),
  collapsedDepartmentIds: [],
  toggleCollapse: (departmentId) =>
    set((s) => {
      const nextCollapsed = s.collapsedDepartmentIds.includes(departmentId)
        ? s.collapsedDepartmentIds.filter((id) => id !== departmentId)
        : [...s.collapsedDepartmentIds, departmentId];
      const { nodes, edges } = computeVisibleNodesAndEdges(
        s.fullNodes,
        s.fullEdges,
        nextCollapsed,
      );
      return {
        collapsedDepartmentIds: nextCollapsed,
        nodes,
        edges,
      };
    }),
  fullNodes: [],
  fullEdges: [],
  nodes: [],
  edges: [],
  setFullGraph: (nodes, edges) =>
    set((s) => {
      if (s.fullNodes === nodes && s.fullEdges === edges) return {};
      const { nodes: visibleNodes, edges: visibleEdges } =
        computeVisibleNodesAndEdges(nodes, edges, s.collapsedDepartmentIds);
      return {
        fullNodes: nodes,
        fullEdges: edges,
        nodes: visibleNodes,
        edges: visibleEdges,
      };
    }),
  setNodes: (arg) =>
    set((s) => ({
      nodes: typeof arg === 'function' ? arg(s.nodes) : arg,
    })),
  setEdges: (arg) =>
    set((s) => ({
      edges: typeof arg === 'function' ? arg(s.edges) : arg,
    })),
  reset: () =>
    set({
      rootDeptId: null,
      childDeptId: null,
      mergedDeptName: '',
      teamLeader: null,
      addModalOpen: false,
      editModalOpen: false,
      parentIdForAdd: null,
      addModalAnchor: null,
      editModalAnchor: null,
      departmentToEdit: null,
      lastCreatedDepartment: null,
      usersModalOpen: false,
      usersModalDepartmentId: null,
      usersModalAnchor: null,
      deleteModalOpen: false,
      deleteStep: 1,
      departmentTobeDeletedId: null,
      departmentTobeDeletedName: null,
      departmentTobeShiftedId: null,
      collapsedDepartmentIds: [],
      fullNodes: [],
      fullEdges: [],
      nodes: [],
      edges: [],
    }),
}));

export default useDepartmentStore;
