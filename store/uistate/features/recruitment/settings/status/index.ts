import { create } from 'zustand';

interface RecruitmentStatusStore {
  isDrawerOPen: boolean;
  setIsDrawerOpen: (value: boolean) => void;

  isEditMode: boolean;
  setEditMode: (isEdit: boolean) => void;

  selectedStatus: any | null;
  setSelectedStatus: (selectedStatus: any) => void;

  isDeleteModalOpen: boolean;
  setIsDeleteModalOpen: (value: boolean) => void;

  statusCurrentPage: number;
  setStatusCurrentPage: (value: number) => void;

  statusPageSize: number;
  setStatusPageSize: (value: number) => void;

  currentPage: number;
  setCurrentPage: (value: number) => void;

  pageSize: number;
  setPage: (value: number) => void;
}

export const useRecruitmentStatusStore = create<RecruitmentStatusStore>(
  (set) => ({
    isDrawerOPen: false,
    setIsDrawerOpen: (isDrawerOPen) => set({ isDrawerOPen: isDrawerOPen }),

    isEditMode: false,
    setEditMode: (isEdit) => set({ isEditMode: isEdit }),

    selectedStatus: null,
    setSelectedStatus: (value) => set({ selectedStatus: value }),

    isDeleteModalOpen: false,
    setIsDeleteModalOpen: (value) => set({ isDeleteModalOpen: value }),

    statusCurrentPage: 1,
    setStatusCurrentPage: (value) => set({ statusCurrentPage: value }),

    statusPageSize: 4,
    setStatusPageSize: (value) => set({ statusPageSize: value }),

    currentPage: 1,
    setCurrentPage: (value) => set({ currentPage: value }),

    pageSize: 4,
    setPage: (value) => set({ pageSize: value }),
  }),
);
