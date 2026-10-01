import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface ObjectiveTypeAllocation {
  id: string;
  /** Backend objective id when available */
  objectiveId: string | null;
  /** Used to re-link when API create response has no id */
  title?: string | null;
  objectiveTypeId: string;
  bscPillarId?: string | null;
  weight: number;
}

interface ObjectiveTypeAllocationState {
  allocations: ObjectiveTypeAllocation[];
  addAllocation: (input: {
    objectiveTypeId: string;
    weight: number;
    objectiveId?: string | null;
    bscPillarId?: string | null;
    title?: string | null;
  }) => void;
  removeAllocationByObjectiveId: (objectiveId: string) => void;
  /** Bind a pending (null objectiveId) allocation to a real objective id via title. */
  linkAllocationToObjective: (objectiveId: string, title?: string | null) => void;
  getAllocationForObjective: (
    objectiveId?: string | null,
    title?: string | null,
  ) => ObjectiveTypeAllocation | undefined;
  getAllocatedForType: (objectiveTypeId: string) => number;
  getRemainingForType: (objectiveTypeId: string, typeBudget: number) => number;
}

const createId = () =>
  `obj-alloc-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const normalizeTitle = (title?: string | null) =>
  String(title || '')
    .trim()
    .toLowerCase();

export const useObjectiveTypeAllocationStore =
  create<ObjectiveTypeAllocationState>()(
    persist(
      (set, get) => ({
        allocations: [],
        addAllocation: ({
          objectiveTypeId,
          weight,
          objectiveId = null,
          bscPillarId = null,
          title = null,
        }) => {
          const w = Number(weight || 0);
          if (!objectiveTypeId || w < 1) return;
          set((state) => ({
            allocations: [
              ...state.allocations,
              {
                id: createId(),
                objectiveId: objectiveId ? String(objectiveId) : null,
                title: title?.trim() || null,
                objectiveTypeId,
                bscPillarId: bscPillarId || null,
                weight: w,
              },
            ],
          }));
        },
        removeAllocationByObjectiveId: (objectiveId) => {
          if (!objectiveId) return;
          set((state) => ({
            allocations: state.allocations.filter(
              (a) => a.objectiveId !== String(objectiveId),
            ),
          }));
        },
        linkAllocationToObjective: (objectiveId, title) => {
          if (!objectiveId) return;
          const normalized = normalizeTitle(title);
          set((state) => ({
            allocations: state.allocations.map((a) => {
              if (a.objectiveId) return a;
              if (normalized && normalizeTitle(a.title) === normalized) {
                return { ...a, objectiveId: String(objectiveId) };
              }
              return a;
            }),
          }));
        },
        getAllocationForObjective: (objectiveId, title) => {
          const list = get().allocations;
          if (objectiveId) {
            const byId = list.find(
              (a) => a.objectiveId === String(objectiveId),
            );
            if (byId) return byId;
          }
          const normalized = normalizeTitle(title);
          if (!normalized) return undefined;
          return list.find(
            (a) =>
              (!a.objectiveId || a.objectiveId === String(objectiveId || '')) &&
              normalizeTitle(a.title) === normalized,
          );
        },
        getAllocatedForType: (objectiveTypeId) =>
          get().allocations.reduce(
            (sum, a) =>
              a.objectiveTypeId === objectiveTypeId
                ? sum + Number(a.weight || 0)
                : sum,
            0,
          ),
        getRemainingForType: (objectiveTypeId, typeBudget) => {
          const allocated = get().getAllocatedForType(objectiveTypeId);
          return Math.max(0, Number(typeBudget || 0) - allocated);
        },
      }),
      {
        name: 'okr-objective-type-allocations-mock',
        storage: createJSONStorage(() =>
          typeof window !== 'undefined'
            ? localStorage
            : {
                getItem: () => null,
                setItem: () => undefined,
                removeItem: () => undefined,
              },
        ),
        partialize: (state) => ({ allocations: state.allocations }),
      },
    ),
  );

/** Best-effort extract of created objective id from various API shapes. */
export function extractCreatedObjectiveId(data: any): string | null {
  if (!data) return null;
  if (typeof data === 'string' || typeof data === 'number') return String(data);
  const candidates = [
    data.id,
    data.objectiveId,
    data?.data?.id,
    data?.data?.objectiveId,
    data?.item?.id,
    data?.items?.[0]?.id,
    data?.result?.id,
  ];
  for (const c of candidates) {
    if (c != null && c !== '') return String(c);
  }
  return null;
}
