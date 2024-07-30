import { Meta } from '../groupPermission/interface';
import { Permission } from '../permission/interface';

export interface DeleteGroupPermissionProps {
  deletedId: string;
  setCurrentModal: any;
  setDeletedId: any;
}
export type RoleType = {
  items: RolePermissionkey[];
  meta?: Meta;
  handleButtonClick?: (id: string) => void;
  visibleEditCardId?: string | null;
};
export interface RolePermissionkey {
  id: string;
  name: string;
  description: string;
  permissions?: Permission[];
  rolePermissions?: Permission;
}
