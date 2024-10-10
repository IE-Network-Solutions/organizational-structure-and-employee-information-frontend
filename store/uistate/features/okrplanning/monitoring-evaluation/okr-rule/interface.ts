export interface OkrRule {
  id?: string;
  title: string;
  myOkrPercentage: number | string;
  teamOkrPercentage: number | string;
}
export interface OkrRuleState {
  open: boolean;
  openDeleteModal: boolean;
  setOpen: (value: boolean) => void;
  setOpenDeleteModal: (value: boolean) => void;
  deletedId: string;
  setDeletedId: (value: string) => void;
  okrRule?: OkrRule | null;
  setOkrRule: (okrRule: OkrRule | null) => void;
}
