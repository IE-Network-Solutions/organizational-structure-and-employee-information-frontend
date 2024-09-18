import create from 'zustand';
import { devtools } from 'zustand/middleware';

interface StoreState {
  open: boolean;
  setOpen: (error: boolean) => void;
  selectedAnswer: string[];
  setSelectedAnswer: (selectedAnswer: string) => void;
  activeTab: string;
  setActiveTab: (error: string) => void;
  numberOfActionPlan: number;
  setNumberOfActionPlan: (numberOfActionPlan: number) => void;
  current: number;
  setCurrent: (current: number) => void;

  pageSize: number;
  setPageSize: (pageSize: number) => void;

  numberOfRoleResponseblity: number;
  setNumberOfRoleResponseblity: (numberOfActionPlan: number) => void;

  selectedUser: string | null;
  setSelectedUser: (selectedUser: string) => void;

  selectedActionPlan: string | null;
  setSelectedActionPlan: (selectedActionPlan: string | null) => void;

  searchTitle: string | null;
  setSearchTitle: (questionTitle: string | null) => void;

  isEditModalOpen: boolean;
  setIsEditModalOpen: (value: boolean) => void;
  editItemId: string;
  setEditItemId: (itemId: string) => void;

  isDeleteModalOpen: boolean;
  setIsDeleteModalOpen: (value: boolean) => void;
  deleteItemId: string;
  setDeleteItemId: (itemId: string) => void;
}

export const useOrganizationalDevelopment = create<StoreState>()(
  devtools((set) => ({
    current: 1,
    setCurrent: (current: number) => set({ current }),
    pageSize: 10,
    setPageSize: (pageSize: number) => set({ pageSize }),

    selectedActionPlan: null,
    setSelectedActionPlan: (selectedActionPlan: string | null) =>
      set({ selectedActionPlan }),

    searchTitle: '',
    setSearchTitle: (searchTitle: string | null) => set({ searchTitle }),

    selectedUser: null,
    setSelectedUser: (selectedUser: string | null) => set({ selectedUser }),
    open: false,
    setOpen: (open: boolean) => set({ open }),
    activeTab: '1',
    setActiveTab: (activeTab: string) => set({ activeTab }),
    selectedAnswer: [],
    setSelectedAnswer: (id: string) =>
      set((state) => {
        const isSelected = state.selectedAnswer.includes(id);
        const updatedSelectedAnswer = isSelected
          ? state.selectedAnswer.filter((answer) => answer !== id)
          : [...state.selectedAnswer, id];
        return { selectedAnswer: updatedSelectedAnswer };
      }),
    numberOfRoleResponseblity: 0,
    setNumberOfRoleResponseblity: (numberOfRoleResponseblity: number) =>
      set({ numberOfRoleResponseblity }),
    numberOfActionPlan: 1,
    setNumberOfActionPlan: (numberOfActionPlan: number) =>
      set({ numberOfActionPlan }),

    isEditModalOpen: false,
    setIsEditModalOpen: (value) => set({ isEditModalOpen: value }),
    editItemId: '',
    setEditItemId: (itemId: string) => set({ editItemId: itemId }),

    isDeleteModalOpen: false,
    setIsDeleteModalOpen: (value) => set({ isDeleteModalOpen: value }),
    deleteItemId: '',
    setDeleteItemId: (itemId: string) => set({ deleteItemId: itemId }),
  })),
);
