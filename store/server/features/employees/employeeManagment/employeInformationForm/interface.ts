import { MetaData } from '@/types/dashboard/tenant/clientAdministration';
import { Meta } from '../../settings/groupPermission/interface';

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

interface FormField {
  fieldName: string;
  fieldType: string;
  isActive: boolean;
  id: string;
  options?: string[];
}

interface FormFieldWithFieldProperty {
  field: {
    fieldName: string;
    fieldType: string;
    isActive: boolean;
    options?: string[];
  };
  id: string;
}

export interface FormItem {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  formTitle: string;
  form: (FormField | FormFieldWithFieldProperty)[];
  tenantId: string;
}

export interface EmployeeInformationForm {
  items: FormItem[];
  meta: Meta;
}
