import { create } from 'zustand';
interface SearchFieldOption {
  key: string;
  value: string;
}

interface SearchField {
  key: string;
  placeholder: string;
  options: SearchFieldOption[];
  widthRatio: number;
}
export interface CategoriesUseState {
  open: boolean;
  current: number;
  pageSize: number;
  totalPages: number;

  openRecognitionType: boolean;
  setOpenRecognitionType: (vlaue: boolean) => void;

  setPageSize: (pageSize: number) => void;
  setCurrent: (value: number) => void;

  setOpen: (value: boolean) => void;

  selectedDepartment: string[];
  setSelectedDepartment: (department: string[]) => void;

  userId: string;
  setUserId: (userId: string) => void;

  selectedUserId: string;
  setSelectedUserId: (selectedUserId: string) => void;

  selectedRecognitionType: string;
  setSelectedRecognitionType: (selectedRecognitionType: string) => void;

  recognitionTypeId: string;
  setRecognitionTypeId: (value: string) => void;

  parentRecognitionTypeId: string;
  setParentRecognitionTypeId: (value: string) => void;

  editingRowKeys: any;
  setEditingRowKeys: (valiue: any) => void;

  activeTab: string;
  setActiveTab: (activeTab: string) => void;

  departmentId: string;
  setDepartmentId: (departmentid: string) => void;

  setOfUser: any[];
  setSetOfUser: (setOfUser: any[]) => void;

  searchField: SearchField[];
  setSearchField: (fields: SearchField[]) => void;

  updateFieldOptions: (key: string, name: any) => void;
}
const initialSearchField: SearchField[] = [
  {
    key: 'employee',
    placeholder: 'Select Employee',
    options: [], // Empty initially, will be updated dynamically
    widthRatio: 0.5,
  },
  {
    key: 'department',
    placeholder: 'Select Department',
    options: [], // Empty initially, will be updated dynamically
    widthRatio: 0.5,
  },
];

export const ConversationStore = create<CategoriesUseState>((set) => ({
  open: false,
  current: 0,
  pageSize: 4,
  totalPages: 1,
  selectedDepartment: [],
  setSelectedDepartment: (selectedDepartment: string[]) =>
    set({ selectedDepartment }),

  setOfUser: [],
  setSetOfUser: (setOfUser: any[]) => set({ setOfUser }),

  userId: '',
  setUserId: (userId: string) => set({ userId }),

  selectedUserId: '',
  setSelectedUserId: (selectedUserId: string) => set({ selectedUserId }),

  selectedRecognitionType: '',
  setSelectedRecognitionType: (selectedRecognitionType: string) =>
    set({ selectedRecognitionType }),

  activeTab: '1',
  setActiveTab: (activeTab: string) => set({ activeTab }),

  departmentId: '',
  setDepartmentId: (departmentId: string) => set({ departmentId }),

  recognitionTypeId: '',
  setRecognitionTypeId: (recognitionTypeId: string) =>
    set({ recognitionTypeId }),

  parentRecognitionTypeId: '',
  setParentRecognitionTypeId: (parentRecognitionTypeId: string) =>
    set({ parentRecognitionTypeId }),

  editingRowKeys: {},
  setEditingRowKeys: (editingRowKeys: any) => set({ editingRowKeys }),

  searchField: initialSearchField, // Initial value
  setSearchField: (fields) => set({ searchField: fields }),

  updateFieldOptions: (key: string, newOptions: any) =>
    set((state) => ({
      searchField: state.searchField.map((field) =>
        field.key === key ? { ...field, options: newOptions } : field,
      ),
    })),

  setTotalPages: (totalPages: number) => set({ totalPages }),
  setPageSize: (pageSize) => set({ pageSize }),

  openRecognitionType: false,
  setOpenRecognitionType: (openRecognitionType: boolean) =>
    set({ openRecognitionType }),

  setCurrent: (value) => set({ current: value }),
  setOpen: (open) => set({ open }),
}));
