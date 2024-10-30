export interface ReprimandType {
  id?: string;
  name: string;
  description: string;
  weight: number;
  type: string;
}
export interface RepTypeState {
  open: boolean;
  openDeleteModal: boolean;
  setOpen: (value: boolean) => void;
  setOpenDeleteModal: (value: boolean) => void;
  deletedId: string;
  setDeletedId: (value: string) => void;
  repType?: ReprimandType | null;
  setRepType: (appType: ReprimandType | null) => void;
}
