import { create } from 'zustand';

interface SearchParams {
  employee_name: string | boolean;
}

export interface EditAccessTableProps {
  id: string;
  employee_name: string;
  grant_access: string;
}

interface ObjectiveEditAccessState {
  searchParams: SearchParams;
  setSearchParams: (key: keyof SearchParams, value: string | boolean) => void;

  currentPage: number;
  setCurrentPage: (value: number) => void;

  pageSize: number;
  setPageSize: (value: number) => void;

  checked: boolean;
  setChecked: (value: boolean) => void;

  switchStates: Record<string, boolean>;
  setSwitchStates: (userId: string, value: boolean) => void;
}

const useObjectiveEditAccessStore = create<ObjectiveEditAccessState>((set) => ({
  searchParams: {
    employee_name: '',
  },
  setSearchParams: (key, value) =>
    set((state) => ({
      searchParams: { ...state.searchParams, [key]: value },
    })),

  currentPage: 1,
  setCurrentPage: (value: number) => set({ currentPage: value }),

  pageSize: 10,
  setPageSize: (value: number) => set({ pageSize: value }),

  checked: true,
  setChecked: (checked: boolean) => set({ checked }),

  switchStates: {},
  setSwitchStates: (userId, value) =>
    set((state) => ({
      switchStates: { ...state.switchStates, [userId]: value },
    })),
}));

export default useObjectiveEditAccessStore;
