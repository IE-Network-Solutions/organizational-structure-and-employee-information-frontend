// useStore.ts
import create from 'zustand';
import { devtools } from 'zustand/middleware';

interface searchParams {
  employee_name: string;
  allOffices: string;
  allJobs: string;
  allStatus: string;
}
interface UserState {
  open: boolean;
  setOpen: (open: boolean) => void;
  userCurrentPage: number;
  setUserCurrentPage: (userCurrentPage: number) => void;
  pageSize: number;
  setPageSize: (pageSize: number) => void;
  modalType: string | null;
  setModalType: (modalType: string | null) => void;
  searchTerm: string | null;
  setSearchTerm: (searchTerm: string | null) => void;
  termKey: string | null;
  setTermKey: (termKey: string | null) => void;
  selectedItem: { key: string | null; id: string | null };
  setSelectedItem: (selectedItem: any) => void;
  deletedItem: string | null;
  setDeletedItem: (deletedItem: string | null) => void;
  setDeleteModal: (deleteModal: boolean) => void;
  deleteModal: boolean;
  prefix: string;
  setPrefix: (prefix: string) => void;
  selectionType: 'checkbox' | 'radio';
  setSelectionType: (selectionType: 'checkbox' | 'radio') => void;
  searchParams: searchParams;
  setSearchParams: (key: keyof searchParams, value: string) => void;
}

export const useEmployeeManagementStore = create<UserState>()(
  devtools((set) => ({
    open: false,
    deleteModal: false,
    prefix: '251',
    setPrefix: (prefix: string) => set({ prefix }),
    deletedItem: null,
    setOpen: (open: boolean) => set({ open }),
    setDeletedItem: (deletedItem: string | null) => set({ deletedItem }),
    userCurrentPage: 1,
    setDeleteModal: (deleteModal: boolean) => set({ deleteModal }),
    setUserCurrentPage: (userCurrentPage: number) => set({ userCurrentPage }),
    pageSize: 10,
    selectedItem: { key: null, id: null },
    setSelectedItem: (selectedItem: any) => set({ selectedItem }),
    setPageSize: (pageSize: number) => set({ pageSize }),
    modalType: null,
    setModalType: (modalType: string | null) => set({ modalType }),
    searchTerm: null,
    setSearchTerm: (searchTerm: string | null) => set({ searchTerm }),
    termKey: null,
    setTermKey: (termKey: string | null) => set({ termKey }),
    selectionType: 'checkbox',
    setSelectionType: (selectionType) => set({ selectionType }),
    searchParams: {
      employee_name: '',
      allOffices: '',
      allJobs: '',
      allStatus: '',
    },
    setSearchParams: (key, value) =>
      set((state) => ({
        searchParams: { ...state.searchParams, [key]: value },
      })),
  })),
);
