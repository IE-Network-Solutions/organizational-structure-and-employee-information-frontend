import { create } from 'zustand';

export interface CategoriesUseState {
  open: boolean;
  current: number;
  pageSize: number;
  totalPages: number;
  setPageSize: (pageSize: number) => void;
  setCurrent: (value: number) => void;
  setOpen: (value: boolean) => void;

}

export const ConversationStore = create<CategoriesUseState>((set) => ({
  open: false,
  current: 0,
  pageSize: 4,
  totalPages: 1,  
  setTotalPages: (totalPages:number) => set({ totalPages }),
  setPageSize: (pageSize) => set({ pageSize }),
  setCurrent: (value) => set({ current: value }),
  setOpen: (open) => set({ open }),
}));
