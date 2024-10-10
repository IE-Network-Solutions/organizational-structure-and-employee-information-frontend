import create from 'zustand';
import { ReprimandType, RepTypeState } from './interface';

export const useRepTypeStore = create<RepTypeState>((set) => ({
  open: false,
  openDeleteModal: false,
  deletedId: '',
  setOpen: (value: boolean) => set({ open: value }),
  setOpenDeleteModal: (value: boolean) => set({ openDeleteModal: value }),
  setDeletedId: (value: string) => set({ deletedId: value }),
  repType: null,
  setRepType: (value: ReprimandType | null) => set({ repType: value }),
}));
