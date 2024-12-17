import { Variants } from 'antd/es/config-provider';
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

  setPageSize: (pageSize: number) => void;
  setCurrent: (value: number) => void;
  setOpen: (value: boolean) => void;

  questions: any;
  setQuestions: (questions: any) => void;

  selectedDepartment: string[];
  setSelectedDepartment: (department: string[]) => void;

  userId: string;
  setUserId: (userId: string) => void;

  selectedUserId: string;
  setSelectedUserId: (selectedUserId: string) => void;

  activeTab: string;
  setActiveTab: (activeTab: string) => void;

  variantType: string;
  setVariantType: (variantType: string) => void;

  selectedFeedback: any;
  setSelectedFeedback: (selectedFeedback: any) => void;

  editableData: any;
  setEditableData: (activeTab: any) => void;

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

  questions: [],
  setQuestions: (questions: any) => set({ questions }),

  setOfUser: [],
  setSetOfUser: (setOfUser: any[]) => set({ setOfUser }),

  userId: '',
  setUserId: (userId: string) => set({ userId }),

  selectedUserId: '',
  setSelectedUserId: (selectedUserId: string) => set({ selectedUserId }),

  variantType: 'appreciation',
  setVariantType: (variantType: string) => set({variantType}),

  selectedFeedback: null,
  setSelectedFeedback: (selectedFeedback: any) => set({selectedFeedback}),

  activeTab: '1',
  setActiveTab: (activeTab: string) => set({ activeTab }),

  editableData: null,
  setEditableData: (editableData: any) => set({ editableData }),

  departmentId: '',
  setDepartmentId: (departmentId: string) => set({ departmentId }),

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
  setCurrent: (value) => set({ current: value }),
  setOpen: (open) => set({ open }),
}));
