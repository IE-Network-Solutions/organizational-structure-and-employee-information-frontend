import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type AssigneeType = 'role' | 'department' | 'individual';

export interface ObjectiveTypeAssignmentItem {
  objectiveTypeId: string;
  weight: number;
}

export interface ObjectiveTypeAssignment {
  id: string;
  assigneeType: AssigneeType;
  assigneeId: string;
  assigneeLabel: string;
  items: ObjectiveTypeAssignmentItem[];
}

interface ObjectiveTypeAssignmentState {
  assignments: ObjectiveTypeAssignment[];
  open: boolean;
  openDeleteModal: boolean;
  deletedId: string;
  selectedAssignment: ObjectiveTypeAssignment | null;
  setOpen: (open: boolean) => void;
  setOpenDeleteModal: (open: boolean) => void;
  setDeletedId: (id: string) => void;
  setSelectedAssignment: (assignment: ObjectiveTypeAssignment | null) => void;
  addAssignment: (input: Omit<ObjectiveTypeAssignment, 'id'>) => {
    ok: boolean;
    message?: string;
  };
  addAssignments: (inputs: Omit<ObjectiveTypeAssignment, 'id'>[]) => {
    ok: boolean;
    message?: string;
    created?: number;
  };
  updateAssignment: (
    id: string,
    input: Omit<ObjectiveTypeAssignment, 'id'>,
  ) => { ok: boolean; message?: string };
  removeAssignment: (id: string) => void;
  getAssignmentForAssignee: (
    assigneeType: AssigneeType,
    assigneeId: string,
  ) => ObjectiveTypeAssignment | undefined;
  /**
   * Resolve assignment for create-objective: prefer individual → department → role.
   */
  resolveAssignmentForUser: (params: {
    userId?: string | null;
    departmentId?: string | null;
    roleId?: string | null;
  }) => ObjectiveTypeAssignment | undefined;
}

const createId = () =>
  `obj-type-assign-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const validateItems = (
  items: ObjectiveTypeAssignmentItem[],
): { ok: boolean; message?: string } => {
  if (!items.length) {
    return { ok: false, message: 'Add at least one objective type' };
  }

  const typeIds = items.map((i) => i.objectiveTypeId);
  if (typeIds.some((id) => !id)) {
    return { ok: false, message: 'Each row needs an objective type' };
  }
  if (new Set(typeIds).size !== typeIds.length) {
    return { ok: false, message: 'Duplicate objective types are not allowed' };
  }
  if (items.some((i) => Number(i.weight || 0) < 1)) {
    return { ok: false, message: 'Each weight must be at least 1%' };
  }

  const total = items.reduce((sum, i) => sum + Number(i.weight || 0), 0);
  if (total !== 100) {
    return {
      ok: false,
      message: `Weights must total 100% (currently ${total}%)`,
    };
  }

  return { ok: true };
};

export const useObjectiveTypeAssignmentStore =
  create<ObjectiveTypeAssignmentState>()(
    persist(
      (set, get) => ({
        assignments: [],
        open: false,
        openDeleteModal: false,
        deletedId: '',
        selectedAssignment: null,
        setOpen: (open) => set({ open }),
        setOpenDeleteModal: (openDeleteModal) => set({ openDeleteModal }),
        setDeletedId: (deletedId) => set({ deletedId }),
        setSelectedAssignment: (selectedAssignment) =>
          set({ selectedAssignment }),
        addAssignment: (input) => {
          if (!input.assigneeId || !input.assigneeType) {
            return { ok: false, message: 'Please select an assignee' };
          }
          const itemsCheck = validateItems(input.items || []);
          if (!itemsCheck.ok) return itemsCheck;

          const exists = get().assignments.some(
            (a) =>
              a.assigneeType === input.assigneeType &&
              a.assigneeId === input.assigneeId,
          );
          if (exists) {
            return {
              ok: false,
              message: 'An assignment already exists for this assignee',
            };
          }

          set((state) => ({
            assignments: [
              ...state.assignments,
              {
                ...input,
                id: createId(),
                items: input.items.map((i) => ({
                  objectiveTypeId: i.objectiveTypeId,
                  weight: Number(i.weight),
                })),
              },
            ],
          }));
          return { ok: true };
        },
        addAssignments: (inputs) => {
          if (!inputs.length) {
            return {
              ok: false,
              message: 'Please select at least one assignee',
            };
          }
          const itemsCheck = validateItems(inputs[0]?.items || []);
          if (!itemsCheck.ok) return itemsCheck;

          const duplicates: string[] = [];
          const toCreate: Omit<ObjectiveTypeAssignment, 'id'>[] = [];

          for (const input of inputs) {
            if (!input.assigneeId || !input.assigneeType) {
              return { ok: false, message: 'Please select an assignee' };
            }
            const exists = get().assignments.some(
              (a) =>
                a.assigneeType === input.assigneeType &&
                a.assigneeId === input.assigneeId,
            );
            if (
              exists ||
              toCreate.some((t) => t.assigneeId === input.assigneeId)
            ) {
              duplicates.push(input.assigneeLabel || input.assigneeId);
              continue;
            }
            toCreate.push(input);
          }

          if (!toCreate.length) {
            return {
              ok: false,
              message:
                duplicates.length === 1
                  ? 'An assignment already exists for this assignee'
                  : 'Assignments already exist for the selected assignees',
            };
          }

          set((state) => ({
            assignments: [
              ...state.assignments,
              ...toCreate.map((input) => ({
                ...input,
                id: createId(),
                items: input.items.map((i) => ({
                  objectiveTypeId: i.objectiveTypeId,
                  weight: Number(i.weight),
                })),
              })),
            ],
          }));

          if (duplicates.length) {
            return {
              ok: true,
              created: toCreate.length,
              message: `Created ${toCreate.length}; skipped existing: ${duplicates.join(', ')}`,
            };
          }
          return { ok: true, created: toCreate.length };
        },
        updateAssignment: (id, input) => {
          if (!input.assigneeId || !input.assigneeType) {
            return { ok: false, message: 'Please select an assignee' };
          }
          const itemsCheck = validateItems(input.items || []);
          if (!itemsCheck.ok) return itemsCheck;

          const exists = get().assignments.some(
            (a) =>
              a.id !== id &&
              a.assigneeType === input.assigneeType &&
              a.assigneeId === input.assigneeId,
          );
          if (exists) {
            return {
              ok: false,
              message: 'An assignment already exists for this assignee',
            };
          }

          set((state) => ({
            assignments: state.assignments.map((a) =>
              a.id === id
                ? {
                    ...a,
                    ...input,
                    items: input.items.map((i) => ({
                      objectiveTypeId: i.objectiveTypeId,
                      weight: Number(i.weight),
                    })),
                  }
                : a,
            ),
          }));
          return { ok: true };
        },
        removeAssignment: (id) =>
          set((state) => ({
            assignments: state.assignments.filter((a) => a.id !== id),
          })),
        getAssignmentForAssignee: (assigneeType, assigneeId) =>
          get().assignments.find(
            (a) =>
              a.assigneeType === assigneeType && a.assigneeId === assigneeId,
          ),
        resolveAssignmentForUser: ({ userId, departmentId, roleId }) => {
          const { getAssignmentForAssignee } = get();
          if (userId) {
            const individual = getAssignmentForAssignee('individual', userId);
            if (individual) return individual;
          }
          if (departmentId) {
            const dept = getAssignmentForAssignee('department', departmentId);
            if (dept) return dept;
          }
          if (roleId) {
            const role = getAssignmentForAssignee('role', roleId);
            if (role) return role;
          }
          return undefined;
        },
      }),
      {
        name: 'okr-objective-type-assignments-mock',
        storage: createJSONStorage(() =>
          typeof window !== 'undefined'
            ? localStorage
            : {
                getItem: () => null,
                setItem: () => undefined,
                removeItem: () => undefined,
              },
        ),
        partialize: (state) => ({ assignments: state.assignments }),
      },
    ),
  );
