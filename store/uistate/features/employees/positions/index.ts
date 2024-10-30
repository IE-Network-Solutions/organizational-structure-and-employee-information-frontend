import { create } from 'zustand';

interface PositionFormValues {
  name: string;
  description: string;
}

interface PositionState {
  openPositionDrawer: boolean;
  setOpenPositionDrawer: (value: boolean) => void;

  pageSize: number;
  setPageSize: (value: number) => void;

  currentPage: number;
  setCurrentPage: (value: number) => void;

  selectedPosition: any | null;
  setSelectedPosition: (value: any | null) => void;

  selectedPositionId: string;
  setSelectedPositionId: (value: string) => void;

  editModal: boolean;
  setEditModal: (value: boolean) => void;

  deleteModal: boolean;
  setDeleteModal: (value: boolean) => void;
  deletedPositionId: string;
  setDeletePositionId: (value: string) => void;

  createNewPositionFormValues: PositionFormValues;
  setFormValues: (values: PositionFormValues) => void;
}

export const usePositionState = create<PositionState>((set) => ({
  openPositionDrawer: false,
  setOpenPositionDrawer: (value) => set({ openPositionDrawer: value }),

  pageSize: 5,
  setPageSize: (value) => set({ pageSize: value }),

  currentPage: 1,
  setCurrentPage: (value) => set({ currentPage: value }),

  selectedPosition: '',
  setSelectedPosition: (value) => set({ selectedPosition: value }),

  selectedPositionId: '',
  setSelectedPositionId: (value) => set({ selectedPositionId: value }),

  editModal: false,
  setEditModal: (value) => set({ editModal: value }),

  deleteModal: false,
  setDeleteModal: (value) => set({ deleteModal: value }),
  deletedPositionId: '',
  setDeletePositionId: (value) => set({ deletedPositionId: value }),

  createNewPositionFormValues: {
    name: '',
    description: '',
  },
  setFormValues: (values) =>
    set({
      createNewPositionFormValues: values,
    }),
}));
