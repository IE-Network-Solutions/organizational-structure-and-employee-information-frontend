export interface CarbonCopies {
  id?: string;
  userId: string;
}
export interface ReprimandLog {
  id?: string;
  recipientIds: string[]; // An array of recipient IDs
  typeId: string; // The type of notification
  action: string; // The action associated with the notification
  cc: string[]; // An array of CC recipient IDs
  recipientId: string;
  updatedAt: string;
  issuerId: string;
  totalNumberOfAppreciation: string;
  totalNumberOfRepremand: string;
  carbonCopies?: CarbonCopies[];
}
export interface ReprimandLogState {
  open: boolean;
  openDeleteModal: boolean;
  setOpen: (value: boolean) => void;
  setOpenDeleteModal: (value: boolean) => void;
  deletedId: string;
  setDeletedId: (value: string) => void;
  reprimandLog?: ReprimandLog | null;
  setReprimandLog: (reprimandLog: ReprimandLog | null) => void;
  openEdit: boolean;
  setOpenEdit: (value: boolean) => void;
  userId: string;
  setUserId: (value: string) => void;
  typeId: string;
  setTypeId: (value: string) => void;
}
