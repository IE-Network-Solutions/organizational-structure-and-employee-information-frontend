import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface ObjectiveType {
  id: string;
  name: string;
  isStrategic: boolean;
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
}

const createId = () =>
  `obj-type-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const normalizeType = (
  t: Partial<ObjectiveType> & { weight?: number; name?: string },
): Omit<ObjectiveType, 'id'> => ({
  name: String(t.name || '').trim(),
  isStrategic: Boolean(t.isStrategic),
});

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
      addType: (type) => get().addTypes([type]),
      addTypes: (newTypes) => {
        if (!newTypes.length) {
          return { ok: false, message: 'Add at least one objective type' };
        }

        const normalized = newTypes.map(normalizeType);

        if (normalized.some((t) => !t.name)) {
          return { ok: false, message: 'Each type needs a name' };
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
        const normalized = normalizeType(type);
        if (!normalized.name) {
          return { ok: false, message: 'Please enter objective type name' };
        }
        set((state) => ({
          types: state.types.map((t) =>
            t.id === id ? { ...t, ...normalized } : t,
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
      merge: (persisted, current) => {
        const p = persisted as Partial<ObjectiveTypesState> | undefined;
        const rawTypes = Array.isArray(p?.types) ? p.types : [];
        const types: ObjectiveType[] = rawTypes.map((t: any) => ({
          id: String(t.id || createId()),
          name: String(t.name || '').trim(),
          isStrategic: Boolean(t.isStrategic),
        }));
        return {
          ...current,
          ...p,
          types,
        };
      },
    },
  ),
);
