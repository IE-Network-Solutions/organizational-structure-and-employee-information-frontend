export interface DeleteGroupPermissionProps {
  deletedId: string;
  setCurrentModal: any;
  setDeletedId: any;
}

export interface UpdatePermissionGroupArgs {
  values: any;
  permissionGroupId: string;
}

export interface GroupPermissionItem {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  description: string;
  name: string;
  permissions: any[]; // Adjust this type if you have a specific structure for permissions
  tenantId: string;
}

export interface Meta {
  currentPage: number;
  itemCount: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}

export interface GroupPermissionType {
  items: GroupPermissionItem[];
  meta: Meta;
}
