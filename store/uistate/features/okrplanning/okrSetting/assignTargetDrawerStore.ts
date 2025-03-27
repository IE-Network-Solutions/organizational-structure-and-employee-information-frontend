import { create } from 'zustand';

interface DrawerState {
  isDrawerVisible: boolean;
  currentId: string | null;
  selectedMonths: string[];
  openDrawer: (id?: string) => void;
  closeDrawer: () => void;
  setSelectedMonths: (months: string[]) => void;
  resetSelectedMonths: () => void;
  selectedAllowance: any;
  setSelectedAllowance: (selectedAllowance: any) => void;
  selectedPayrollData: any;
  setSelectedPayrollData: (selectedPayrollData: any) => void;
  isEditMode: boolean;
  setIsEditMode: (isEdit: boolean) => void;
  searchText: string;
  setSearchText: (text: string) => void;
}

const useDrawerStore = create<DrawerState>((set) => ({
  selectedPayrollData: null,
  setSelectedPayrollData: (selectedPayrollData: any) =>
    set({ selectedPayrollData }),
  selectedAllowance: null,
  setSelectedAllowance: (selectedAllowance: any) => set({ selectedAllowance }),
  isDrawerVisible: false,
  currentId: null,
  selectedMonths: [],
  openDrawer: (id?: string) =>
    set({ isDrawerVisible: true, currentId: id ?? null }),
  closeDrawer: () => set({ isDrawerVisible: false, currentId: null }),
  setSelectedMonths: (months: string[]) => set({ selectedMonths: months }),
  resetSelectedMonths: () => set({ selectedMonths: [] }),
  isEditMode: false,
  setIsEditMode: (isEdit: boolean) => set({ isEditMode: isEdit }),
  searchText: '',
  setSearchText: (text: string) => set({ searchText: text }),
}));

export default useDrawerStore;
