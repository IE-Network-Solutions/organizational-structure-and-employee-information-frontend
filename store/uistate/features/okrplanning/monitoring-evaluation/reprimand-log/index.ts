import create from 'zustand';
import { ReprimandLog, ReprimandLogState } from './interface';

export const useReprimandLogStore = create<ReprimandLogState>((set) => ({
  open: false,
  openDeleteModal: false,
  deletedId: '',
  setOpen: (value: boolean) => set({ open: value }),
  setOpenDeleteModal: (value: boolean) => set({ openDeleteModal: value }),
  setDeletedId: (value: string) => set({ deletedId: value }),
  reprimandLog: null,
  setReprimandLog: (value: ReprimandLog | null) => set({ reprimandLog: value }),
  openEdit: false,
  setOpenEdit: (value: boolean) => set({ openEdit: value }),
  userId: '',
  setUserId: (value: string) => set({ userId: value }),
  typeId: '',
  setTypeId: (value: string) => set({ typeId: value }),
}));
