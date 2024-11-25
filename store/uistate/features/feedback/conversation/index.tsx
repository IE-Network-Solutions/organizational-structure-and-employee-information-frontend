import { create } from 'zustand';
interface FieldOption {
  key: string;
  value: string;
}

interface Field {
  key: string;
  label: string;
  placeholder: string;
  options: FieldOption[];
  widthRatio: number;
}

export interface CategoriesUseState {
  open: boolean;
  current: number;
  pageSize: number;
  totalPages: number;
  setPageSize: (pageSize: number) => void;
  setCurrent: (value: number) => void;
  setOpen: (value: boolean) => void;

  searchField: Field[];
  setSearchField: (fields: Field[]) => void;
  // handleSearchChange:(item:string,value:any)=>void;
}

export const ConversationStore = create<CategoriesUseState>((set) => ({
  open: false,
  current: 0,
  pageSize: 4,
  totalPages: 1,

  searchField: [],
  setSearchField: (searchField: any[]) => set({ searchField }),

  setTotalPages: (totalPages: number) => set({ totalPages }),
  setPageSize: (pageSize) => set({ pageSize }),
  setCurrent: (value) => set({ current: value }),
  setOpen: (open) => set({ open }),
}));
