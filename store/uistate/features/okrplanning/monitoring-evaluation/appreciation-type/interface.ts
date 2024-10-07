export interface AppreciationType {
  id?: string;
  name: string;
  description: string;
  weight: number | string;
  type: string;
}
export interface AppTypeState {
  open: boolean;
  openDeleteModal: boolean;
  setOpen: (value: boolean) => void;
  setOpenDeleteModal: (value: boolean) => void;
  deletedId: string;
  setDeletedId: (value: string) => void;
  appType?: AppreciationType | null;
  setAppType: (appType: AppreciationType | null) => void;
}
