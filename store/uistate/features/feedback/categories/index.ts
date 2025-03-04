import { create } from 'zustand';

interface CustomField {
  name: string;
  selected: boolean;
}

interface User {
  userId: string;
}
interface Category {
  id: string;
  name: string;
  description: string;
}

interface SearchParams {
  category_name: string;
  category_description: string;
  createdBy: string;
}
interface SearchFormParams {
  form_name: string;
  form_description: string;
  createdBy: string;
}

interface SearchUserParams {
  user_name: string;
}
export interface CategoriesUseState {
  expanded: boolean;
  open: boolean;
  isAddOpen: boolean;
  current: number;
  pageSize: number;
  totalPages: number;
  selectedGroups: string[];
  customFields: CustomField[];
  editModal: boolean;
  editingCategory: any | null;
  selectedCategory: Category | null;
  isEditModalVisible: boolean;
  selectedFormId: string;
  setSelectedFormId: (value: string) => void;
  setIsEditModalVisible: (value: boolean) => void;
  setSelectedCategory: (category: Category | null) => void;
  setIsAddOpen: (isAddOpen: boolean) => void;
  toggleCustomField: (index: number) => void;
  setCustomFields: (fields: CustomField[]) => void;
  setSelectedGroups: (selectedGroups: string[]) => void;
  setPageSize: (pageSize: number) => void;
  setCurrent: (value: number) => void;
  setOpen: (value: boolean) => void;
  setExpanded: (value: boolean) => void;

  setSelectedUsers: (users: User[]) => void;

  clearSelectedUsers: () => void;
  deleteModal: boolean;
  deletedItem: string | null;
  deleteFormModal: boolean;
  deletedFormItem: string | null;
  setDeleteFormModal: (isOpen: boolean) => void;
  setDeletedFormItem: (itemId: string | null) => void;
  setDeleteModal: (isOpen: boolean) => void;
  setDeletedItem: (itemId: string | null) => void;
  setEditModal: (open: boolean) => void;
  setEditingCategory: (category: any | null) => void;
  searchParams: SearchParams;
  setSearchParams: (key: keyof SearchParams, value: string | boolean) => void;
  searchFormParams: SearchFormParams;
  setSearchFormParams: (
    key: keyof SearchFormParams,
    value: string | boolean,
  ) => void;

  rows: number;
  isAllSelected: boolean;
  selectedUsers: User[];
  selectAllUsers: (userIds: User[]) => void;
  toggleUserSelection: (userId: string) => void;
  deselectAllUsers: () => void;
  clearSelections: () => void;
  selectedDepartmentIds: string[];
  toggleDepartmentSelection: (departmentId: string) => void;

  searchUserParams: SearchUserParams;
  setSearchUserParams: (key: keyof SearchUserParams, value: string) => void;
  activeKey: string[];
  setActiveKey: (key: string[]) => void;
}

export const CategoriesManagementStore = create<CategoriesUseState>((set) => ({
  isAllSelected: false,
  selectedUsers: [],
  selectedDepartmentIds: [],

  selectAllUsers: (userIds: User[]) =>
    set((state) => ({
      ...state,
      selectedUsers: userIds,
      isAllSelected: true,
    })),
  toggleUserSelection: (userId) =>
    set((state) => ({
      selectedUsers: state.selectedUsers.some((user) => user.userId === userId)
        ? state.selectedUsers.filter((user) => user.userId !== userId)
        : [...state.selectedUsers, { userId }],
      isAllSelected: false,
    })),
  toggleDepartmentSelection: (departmentId: string) =>
    set((state) => ({
      selectedDepartmentIds: state.selectedDepartmentIds?.includes(departmentId)
        ? state.selectedDepartmentIds.filter((id) => id !== departmentId)
        : [...state?.selectedDepartmentIds, departmentId], // Directly push departmentId
      isAllSelected: false,
    })),

  deselectAllUsers: () =>
    set(() => ({
      selectedUsers: [],
      isAllSelected: false,
    })),
  clearSelections: () =>
    set({
      selectedDepartmentIds: [],
      selectedUsers: [],
      isAllSelected: false,
    }),

  expanded: false,
  open: false,
  isAddOpen: false,
  current: 1,
  pageSize: 4,
  totalPages: 1,
  selectedGroups: [],
  customFields: [
    { name: 'Custom Field One', selected: false },
    { name: 'Custom Field Two', selected: false },
    { name: 'Custom Field Three', selected: false },
  ],
  selectedFormId: '',
  setSelectedFormId: (value) => set({ selectedFormId: value }),
  deleteModal: false,
  deletedItem: null,
  deleteFormModal: false,
  deletedFormItem: null,
  editModal: false,
  editingCategory: null,
  selectedCategory: null,
  isEditModalVisible: false,

  setIsEditModalVisible: (value) => set({ isEditModalVisible: value }),
  setIsAddOpen: (isAddOpen) => set({ isAddOpen }),
  setSelectedGroups: (value) => set({ selectedGroups: value }),
  setPageSize: (pageSize) => set({ pageSize }),
  setCurrent: (value) => set({ current: value }),
  setOpen: (open) => set({ open }),
  setExpanded: (value) => set({ expanded: value }),
  toggleCustomField: (index) =>
    set((state) => ({
      customFields: state.customFields.map((field, i) =>
        i === index ? { ...field, selected: !field.selected } : field,
      ),
    })),
  setCustomFields: (fields) => set({ customFields: fields }),

  setSelectedUsers: (users) => set({ selectedUsers: users }),
  clearSelectedUsers: () => set({ selectedUsers: [] }),
  setDeleteModal: (isOpen) => set({ deleteModal: isOpen }),
  setDeletedFormItem: (itemId) => set({ deletedItem: itemId }),
  setDeleteFormModal: (isOpen) => set({ deleteModal: isOpen }),
  setDeletedItem: (itemId) => set({ deletedItem: itemId }),
  setEditModal: (open) => set({ editModal: open }),
  setEditingCategory: (category) => set({ editingCategory: category }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  searchParams: {
    category_name: '',
    category_description: '',
    createdBy: '',
  },
  setSearchParams: (key, value) =>
    set((state) => ({
      searchParams: { ...state.searchParams, [key]: value },
    })),
  searchFormParams: {
    form_name: '',
    form_description: '',
    createdBy: '',
  },

  setSearchFormParams: (key, value) =>
    set((state) => ({
      searchFormParams: { ...state.searchFormParams, [key]: value },
    })),
  rows: 2,

  searchUserParams: {
    user_name: '',
  },
  setSearchUserParams: (key: keyof SearchUserParams, value: string) => {
    set((state) => {
      if (state.activeKey.length === 0) {
        return { searchUserParams: { [key]: value }, activeKey: ['0'] };
      }
      return { searchUserParams: { [key]: value } };
    });
  },

  activeKey: [],
  setActiveKey: (key) => set({ activeKey: key }),
}));
