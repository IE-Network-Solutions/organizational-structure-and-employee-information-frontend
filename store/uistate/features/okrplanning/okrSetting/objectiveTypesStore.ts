import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface ObjectiveType {
  id: string;
  name: string;
  weight: number;
}

interface ObjectiveTypesState {
  types: ObjectiveType[];
  open: boolean;
  openDeleteModal: boolean;
  deletedId: string;
  selectedType: ObjectiveType | null;
  setOpen: (open: boolean) => void;
  setOpenDeleteModal: (open: boolean) => void;
  setDeletedId: (id: string) => void;
  setSelectedType: (type: ObjectiveType | null) => void;
  addType: (type: Omit<ObjectiveType, 'id'>) => {
    ok: boolean;
    message?: string;
  };
  addTypes: (types: Omit<ObjectiveType, 'id'>[]) => {
    ok: boolean;
    message?: string;
  };
  updateType: (
    id: string,
    type: Omit<ObjectiveType, 'id'>,
  ) => { ok: boolean; message?: string };
  removeType: (id: string) => void;
  getTotalWeight: (excludeId?: string) => number;
}

const createId = () =>
  `obj-type-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export const useObjectiveTypesStore = create<ObjectiveTypesState>()(
  persist(
    (set, get) => ({
      types: [],
      open: false,
      openDeleteModal: false,
      deletedId: '',
      selectedType: null,
      setOpen: (open) => set({ open }),
      setOpenDeleteModal: (openDeleteModal) => set({ openDeleteModal }),
      setDeletedId: (deletedId) => set({ deletedId }),
      setSelectedType: (selectedType) => set({ selectedType }),
      getTotalWeight: (excludeId) =>
        get().types.reduce(
          (sum, t) =>
            excludeId && t.id === excludeId ? sum : sum + Number(t.weight || 0),
          0,
        ),
      addType: (type) => get().addTypes([type]),
      addTypes: (newTypes) => {
        if (!newTypes.length) {
          return { ok: false, message: 'Add at least one objective type' };
        }

        const normalized = newTypes.map((t) => ({
          name: String(t.name || '').trim(),
          weight: Number(t.weight || 0),
        }));

        if (normalized.some((t) => !t.name)) {
          return { ok: false, message: 'Each type needs a name' };
        }
        if (normalized.some((t) => t.weight < 1)) {
          return { ok: false, message: 'Each weight must be at least 1%' };
        }

        const batchTotal = normalized.reduce((sum, t) => sum + t.weight, 0);
        const currentTotal = get().getTotalWeight();
        const nextTotal = currentTotal + batchTotal;

        if (nextTotal > 100) {
          return {
            ok: false,
            message: `Total weight cannot exceed 100%. Current: ${currentTotal}%, adding: ${batchTotal}%, remaining: ${100 - currentTotal}%`,
          };
        }

        set((state) => ({
          types: [
            ...state.types,
            ...normalized.map((t) => ({ ...t, id: createId() })),
          ],
        }));
        return { ok: true };
      },
      updateType: (id, type) => {
        const weight = Number(type.weight || 0);
        const currentTotal = get().getTotalWeight(id);
        const nextTotal = currentTotal + weight;
        if (nextTotal > 100) {
          return {
            ok: false,
            message: `Total weight cannot exceed 100%. Other types: ${currentTotal}%, remaining: ${100 - currentTotal}%`,
          };
        }
        set((state) => ({
          types: state.types.map((t) =>
            t.id === id ? { ...t, name: type.name.trim(), weight } : t,
          ),
        }));
        return { ok: true };
      },
      removeType: (id) =>
        set((state) => ({
          types: state.types.filter((t) => t.id !== id),
        })),
    }),
    {
      name: 'okr-objective-types-mock',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined'
          ? localStorage
          : {
              getItem: () => null,
              setItem: () => undefined,
              removeItem: () => undefined,
            },
      ),
      partialize: (state) => ({ types: state.types }),
    },
  ),
);
