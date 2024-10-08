import create from 'zustand';
import { AppreciationLog, AppreciationLogState } from './interface';

export const useAppreciationLogStore = create<AppreciationLogState>((set) => ({
  open: false,
  openDeleteModal: false,
  deletedId: '',
  setOpen: (value: boolean) => set({ open: value }),
  setOpenDeleteModal: (value: boolean) => set({ openDeleteModal: value }),
  setDeletedId: (value: string) => set({ deletedId: value }),
  appreciationLog: null,
  setAppreciationLog: (value: AppreciationLog | null) =>
    set({ appreciationLog: value }),
  openEdit: false,
  setOpenEdit: (value: boolean) => set({ openEdit: value }),
  userId: '',
  setUserId: (value: string) => set({ userId: value }),
  typeId: '',
  setTypeId: (value: string) => set({ typeId: value }),
  userIdAll: '',
  setUserIdAll: (value: string) => set({ userIdAll: value }),
  typeIdAll: '',
  setTypeIdAll: (value: string) => set({ typeIdAll: value }),
}));
