import { AppreciationType } from '../appreciation-type/interface';

export interface AppreciationLog {
  id?: string;
  recipientIds: string[]; // An array of recipient IDs
  typeId: string; // The type of notification
  action: string; // The action associated with the notification
  cc: string[]; // An array of CC recipient IDs
  type: AppreciationType;
  recipientId: string;
  updatedAt: string;
  issuerId: string;
  totalNumberOfAppreciation: string;
  totalNumberOfRepremand: string;
}
export interface AppreciationLogState {
  open: boolean;
  openDeleteModal: boolean;
  setOpen: (value: boolean) => void;
  setOpenDeleteModal: (value: boolean) => void;
  deletedId: string;
  setDeletedId: (value: string) => void;
  appreciationLog?: AppreciationLog | null;
  setAppreciationLog: (appreciationLog: AppreciationLog | null) => void;
  openEdit: boolean;
  setOpenEdit: (value: boolean) => void;
  userId: string;
  setUserId: (value: string) => void;
  typeId: string;
  setTypeId: (value: string) => void;
  userIdAll: string;
  setUserIdAll: (value: string) => void;
  typeIdAll: string;
  setTypeIdAll: (value: string) => void;
}
