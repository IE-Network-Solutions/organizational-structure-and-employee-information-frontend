import { create } from 'zustand';

interface CustomField {
  name: string;
  selected: boolean;
}

interface User {
  userId: string;
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
  setIsAddOpen: (isAddOpen: boolean) => void;
  toggleCustomField: (index: number) => void;
  setCustomFields: (fields: CustomField[]) => void;
  setSelectedGroups: (selectedGroups: string[]) => void;
  setPageSize: (pageSize: number) => void;
  setCurrent: (value: number) => void;
  setOpen: (value: boolean) => void;
  setExpanded: (value: boolean) => void;
  selectedUsers: User[];
  setSelectedUsers: (users: User[]) => void;
  addUser: (userId: string) => void;
  removeUser: (userId: string) => void;
  clearSelectedUsers: () => void;
  deleteModal: boolean;
  deletedItem: string | null;
  setDeleteModal: (isOpen: boolean) => void;
  setDeletedItem: (itemId: string | null) => void;
  setEditModal: (open: boolean) => void;
  setEditingCategory: (category: any | null) => void;
}

export const CategoriesManagementStore = create<CategoriesUseState>((set) => ({
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
  deleteModal: false,
  deletedItem: null,
  editModal: false,
  editingCategory: null,
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
  selectedUsers: [],
  setSelectedUsers: (users) => set({ selectedUsers: users }),
  addUser: (userId) =>
    set((state) => ({
      selectedUsers: [...state.selectedUsers, { userId }],
    })),
  removeUser: (userId) =>
    set((state) => ({
      selectedUsers: state.selectedUsers.filter(
        (user) => user.userId !== userId,
      ),
    })),
  clearSelectedUsers: () => set({ selectedUsers: [] }),
  setDeleteModal: (isOpen) => set({ deleteModal: isOpen }),
  setDeletedItem: (itemId) => set({ deletedItem: itemId }),
  setEditModal: (open) => set({ editModal: open }),
  setEditingCategory: (category) => set({ editingCategory: category }),
}));
