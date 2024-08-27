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

export type Permissions = {
  id: string;
  createdAt: string; // ISO 8601 format date string
  updatedAt: string; // ISO 8601 format date string
  deletedAt: string | null; // ISO 8601 format date string or null
  name: string;
  slug: string;
  description: string;
  permissionGroupId: string;
};

export type Role = {
  id: string;
  createdAt: string; // ISO 8601 format date string
  updatedAt: string; // ISO 8601 format date string
  deletedAt: string | null; // ISO 8601 format date string or null
  name: string;
  description: string;
  tenantId: string;
  permissions: Permissions[]; // Array of permissions
};