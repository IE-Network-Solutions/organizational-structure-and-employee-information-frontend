import create from 'zustand';
import { AppreciationType, AppTypeState } from './interface';

export const useAppTypeStore = create<AppTypeState>((set) => ({
  open: false,
  openDeleteModal: false,
  deletedId: '',
  setOpen: (value: boolean) => set({ open: value }),
  setOpenDeleteModal: (value: boolean) => set({ openDeleteModal: value }),
  setDeletedId: (value: string) => set({ deletedId: value }),
  appType: null,
  setAppType: (value: AppreciationType | null) => set({ appType: value }),
}));
