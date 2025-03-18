// useStore.ts
import {
  DeletedId,
  GroupPermissionkey,
  ModalType,
} from '@/types/dashboard/adminManagement';
import create from 'zustand';
import { devtools } from 'zustand/middleware';

interface StoreState {
  deletedId: DeletedId | null;
  pageSize: number;
  searchTerm: {
    termKey: string | null;
    searchTerm: string | null;
  };
  setSearchTerm: (newTerm: {
    termKey: string | null;
    searchTerm: string | null;
  }) => void;
  roleCurrentPage: number;
  permissonGroupCurrentPage: number;
  tabButton: string;
  setTabButton: (tabButton: string) => void;
  currentModal: ModalType;
  selectedPermissionGroup: GroupPermissionkey | null;
  selectedRole: any;
  permissionCurrentPage: number;
  selectedRowKeys: any;
  setSelectedRowKeys: (selectedRowKeys: any) => void;
  setPermissionGroupCurrentPage: (permissonGroupCurrentPage: number) => void;
  setPermissionCurrentPage: (permissonCurrentPage: number) => void;
  setPageSize: (pageSize: number) => void;
  setCurrentModal: (currentModal: ModalType) => void;
  setRoleCurrentPage: (roleCurrentPage: number) => void;
  setDeletedId: (deletedId: DeletedId | null) => void;
  setSelectedRole: (selectedRole: any) => void;
  setSelectedPermissionGroup: (
    selectedPermissionGroup: GroupPermissionkey | null,
  ) => void;

  selectedRoleOnList: any;
  setSelectedRoleOnList: (selectedRoleOnList: any) => void;

  selectedRoleOnOption: any;
  setSelectedRoleOnOption: (selectedRoleOnOption: any) => void;

  isModalVisible: boolean;
  setIsModalVisible: (value: any) => void;
  selectedGroup: any;
  setSelectedGroup: (value: any) => void;
  selectedPermissions: any;
  setSelectedPermissions: (value: any) => void;
}

export const useSettingStore = create<StoreState>()(
  devtools((set) => ({
    tabButton: 'Permission',
    deletedId: null,
    pageSize: 10,
    searchTerm: { termKey: null, searchTerm: null },
    setSearchTerm: (newTerm) => set({ searchTerm: newTerm }),
    roleCurrentPage: 1,
    permissionCurrentPage: 1,
    permissonGroupCurrentPage: 1,
    currentModal: null,
    selectedPermissionGroup: null,
    selectedRole: null,
    selectedRowKeys: null,

    selectedRoleOnList: null,
    setSelectedRoleOnList: (selectedRoleOnList: any) =>
      set({ selectedRoleOnList }),

    selectedRoleOnOption: null,
    setSelectedRoleOnOption: (selectedRoleOnOption: any) =>
      set({ selectedRoleOnOption }),

    setSelectedRowKeys: (selectedRowKeys) => set({ selectedRowKeys }),
    setTabButton: (tabButton) => set({ tabButton }),
    setSelectedRole: (selectedRole) => set({ selectedRole }),
    setDeletedId: (deletedId) => set({ deletedId }),
    setPermissionGroupCurrentPage: (permissonGroupCurrentPage) =>
      set({ permissonGroupCurrentPage }),
    setPageSize: (pageSize) => set({ pageSize }),
    setCurrentModal: (currentModal) => set({ currentModal }),
    setSelectedPermissionGroup: (selectedPermissionGroup) =>
      set({ selectedPermissionGroup }),
    setRoleCurrentPage: (roleCurrentPage) => set({ roleCurrentPage }),
    setPermissionCurrentPage: (permissionCurrentPage) =>
      set({ permissionCurrentPage }),

    isModalVisible: false,
    setIsModalVisible: (isModalVisible: boolean) => set({ isModalVisible }),
    selectedGroup: null,
    setSelectedGroup: (value) => set({ selectedGroup: value }),
    selectedPermissions: [],
    setSelectedPermissions: (selectedPermissions: any) =>
      set({ selectedPermissions }),
  })),
);
