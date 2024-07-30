import { Meta } from '../groupPermission/interface';

export interface DeleteGroupPermissionProps {
  deletedId: string;
  setCurrentModal: any;
  setDeletedId: any;
}
export interface Permission {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  name: string;
  slug: string;
  description: string;
  permissionGroupId: string | null;
}

export interface PermissionDataType {
  items: Permission[];
  meta: Meta;
}
