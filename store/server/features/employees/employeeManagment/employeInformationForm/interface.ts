import { MetaData } from "@/types/dashboard/tenant/clientAdministration";

export interface DeleteGroupPermissionProps {
  deletedId: string;
  setCurrentModal: any;
  setDeletedId: any;
}

export interface UpdatePermissionGroupArgs {
  values: any;
  permissionGroupId: string;
}

export type NationalityItem = {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  name: string;
  tenantId: string | null;
};


export type NationalityList = {
  items: NationalityItem[];
  meta: MetaData;
};
export type EmploymentTypeItem = {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  name: string;
  tenantId: string | null;
};


export type EmploymentTypeList = {
  items: EmploymentTypeItem[];
  meta: MetaData;
};