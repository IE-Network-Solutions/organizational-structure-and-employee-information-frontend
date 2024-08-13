// useStore.ts
import { MetaData } from '@/types/dashboard/tenant/clientAdministration';
import { UploadFile } from 'antd';
import create from 'zustand';
import { devtools } from 'zustand/middleware';
export interface CustomFieldsProps {
  customFormData: FormData;
  setCustomFormData: (customFormData: FormData) => void;
}

export interface FormField {
  fieldName: string;
  fieldType: 'input' | 'datePicker' | 'select' | 'toggle' | 'checkbox';
  isActive: boolean;
  id: string;
  options?: string[]; // Optional field for 'select' and 'checkbox' types
}

export interface Form {
  formTitle: string;
  form: FormField[];
}

export interface FormData {
  tenantId: string;
  forms: Form[];
}
export interface WorkScheduleDetail {
  id: string;
  dayOfWeek: string;
  startTime: string;
  breakStartTime: string;
  breakEndTime: string;
  endTime: string;
  hours: number;
  status: boolean;
}

export interface WorkSchedule {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  name: string;
  detail: WorkScheduleDetail[];
  standardHours: number;
  tenantId: string;
}
export interface WorkScheduleData {
  items: WorkSchedule[];
  meta: MetaData;
}
interface UserState {
  open: boolean;
  setOpen: (open: boolean) => void;
  userCurrentPage: number;
  setUserCurrentPage: (userCurrentPage: number) => void;
  pageSize: number;
  setPageSize: (pageSize: number) => void;
  modalType: string | null;
  setModalType: (modalType: string | null) => void;
  searchTerm: string | null;
  setSearchTerm: (searchTerm: string | null) => void;
  termKey: string | null;
  setTermKey: (termKey: string | null) => void;
  selectedItem: { key: string | null; id: string | null };
  setSelectedItem: (selectedItem: any) => void;
  deletedItem: string | null;
  setDeletedItem: (deletedItem: string | null) => void;
  setDeleteModal: (deleteModal: boolean) => void;
  deleteModal: boolean;
  prefix: string;
  setPrefix: (prefix: string) => void;
  current: number;
  setCurrent: (curren: number) => void;
  // customFormData: FormData | null;
  customFormData: any;
  setCustomFormData: (customFormData: FormData) => void;

  workSchedule: string | null;
  setWorkSchedule: (WorkSchedule: string | null) => void;

  selectedWorkSchedule: WorkSchedule | null;
  setSelectedWorkSchedule: (selectedWorkSchedule: WorkSchedule | null) => void;

  profileFileList: any;
  setProfileFileList: (profileFileList: any) => void;

  bankInfoForm: any;
  setBankInfoForm: (bankInfoForm: any) => void;

  emergencyContact: any;
  setEmergencyContact: (emergencyContact: any) => void;

  addressForm: any;
  setAddressForm: (address: any) => void;

  additionalInformation: any;
  setAdditionalInformation: (additionalInformation: any) => void;

  selectedPermissions: string[] | [];
  setSelectedPermissions: (selectedPermissions: string[] | []) => void;

  documentFileList: any[];
  setDocumentFileList: (fileList: any[]) => void;
  removeDocument: (uid: string) => void;
}

export const useEmployeeManagmentStore = create<UserState>()(
  devtools((set) => ({
    open: false,
    deleteModal: false,
    current: 0,

    customFormData: null,
    setCustomFormData: (customFormData: FormData) => set({ customFormData }),

    selectedWorkSchedule: null,
    setSelectedWorkSchedule: (selectedWorkSchedule: WorkSchedule | null) =>
      set({ selectedWorkSchedule }),

    workSchedule: null,
    setWorkSchedule: (workSchedule: string | null) => set({ workSchedule }),

    prefix: '251',
    setPrefix: (prefix: string) => set({ prefix }),
    deletedItem: null,
    setOpen: (open: boolean) => set({ open }),
    setDeletedItem: (deletedItem: string | null) => set({ deletedItem }),
    userCurrentPage: 1,
    setDeleteModal: (deleteModal: boolean) => set({ deleteModal }),
    setUserCurrentPage: (userCurrentPage: number) => set({ userCurrentPage }),
    pageSize: 10,
    selectedItem: { key: null, id: null },
    setSelectedItem: (selectedItem: any) => set({ selectedItem }),
    setPageSize: (pageSize: number) => set({ pageSize }),
    modalType: null,
    setModalType: (modalType: string | null) => set({ modalType }),
    searchTerm: null,
    setSearchTerm: (searchTerm: string | null) => set({ searchTerm }),
    termKey: null,
    setTermKey: (termKey: string | null) => set({ termKey }),
    setCurrent: (current: number) => set({ current }),

    profileFileList: [],
    setProfileFileList: (profileFileList: any) =>
      set({ profileFileList }),

    bankInfoForm: {},
    setBankInfoForm: (bankInfoForm: any) => ({ bankInfoForm }),

    emergencyContact: {},
    setEmergencyContact: (emergencyContact: any) => ({ emergencyContact }),

    addressForm: {},
    setAddressForm: (addressForm: any) => set({ addressForm }),

    additionalInformation: {},
    setAdditionalInformation: (additionalInformation: any) => ({
      additionalInformation,
    }),

    selectedPermissions: [],
    setSelectedPermissions: (selectedPermissions: string[] | []) =>
      set({ selectedPermissions }),

    documentFileList: [],
    setDocumentFileList: (fileList) => set({ documentFileList: fileList }),
    removeDocument: (uid) =>
      set((state) => ({
        documentFileList: state.documentFileList.filter((file) => file.uid !== uid),
      })),
  })),
);
