import create from 'zustand';
import { OkrRule, OkrRuleState } from './interface';

export const useOkrRuleStore = create<OkrRuleState>((set) => ({
  open: false,
  openDeleteModal: false,
  deletedId: '',
  setOpen: (value: boolean) => set({ open: value }),
  setOpenDeleteModal: (value: boolean) => set({ openDeleteModal: value }),
  setDeletedId: (value: string) => set({ deletedId: value }),
  okrRule: null,
  setOkrRule: (value: OkrRule | null) => set({ okrRule: value }),
}));
