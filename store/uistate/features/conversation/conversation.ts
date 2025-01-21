import { FeedbackRecord } from '@/store/server/features/CFR/conversation/action-plan/interface';
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
  onChange: (value: string) => void; // Added the onChange handler
}
export interface CategoriesUseState {
  open: boolean;
  current: number;
  totalPages: number;
  pageSize: number;
  setPageSize: (pageSize: number) => void;

  page: number;
  setPage: (page: number) => void;

  openRecognitionType: boolean;
  setOpenRecognitionType: (vlaue: boolean) => void;

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

  empId?: string | null | undefined;
  setEmpId: (empId: string | null) => void;

  givenDate: any;
  setGivenDate: (givenDate: any) => void;

  variantType: string;
  setVariantType: (variantType: string) => void;

  selectedFeedbackRecord: FeedbackRecord | null;
  setSelectedFeedbackRecord: (
    selectedFeedbackRecord: FeedbackRecord | null,
  ) => void;

  selectedFeedback: any;
  setSelectedFeedback: (selectedFeedback: any) => void;

  editableData: any;
  setEditableData: (editableData: any) => void;

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
    onChange: (value: string) => {},
  },
  {
    key: 'department',
    placeholder: 'Select Department',
    options: [], // Empty initially, will be updated dynamically
    widthRatio: 0.5,
    onChange: (value: string) => {},
  },
];

export const ConversationStore = create<CategoriesUseState>((set) => ({
  open: false,
  current: 0,
  totalPages: 10,

  pageSize: 10,
  setPageSize: (pageSize: number) => set({ pageSize }),

  setTotalPages: (totalPages: number) => set({ totalPages }),

  page: 1,
  setPage: (page: number) => set({ page }),

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

  selectedRecognitionType: '',
  setSelectedRecognitionType: (selectedRecognitionType: string) =>
    set({ selectedRecognitionType }),
  variantType: 'appreciation',
  setVariantType: (variantType: string) => set({ variantType }),

  selectedFeedback: null,
  setSelectedFeedback: (selectedFeedback: any) => set({ selectedFeedback }),

  selectedFeedbackRecord: null,
  setSelectedFeedbackRecord: (selectedFeedbackRecord: FeedbackRecord | null) =>
    set({ selectedFeedbackRecord }),

  activeTab: '',
  setActiveTab: (activeTab: string) => set({ activeTab }),

  empId: null as string | null,
  setEmpId: (empId: string | null) => set({ empId }),

  givenDate: [],
  setGivenDate: (givenDate: any) => set({ givenDate }),

  editableData: null,
  setEditableData: (editableData: any) => set({ editableData }),

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

  openRecognitionType: false,
  setOpenRecognitionType: (openRecognitionType: boolean) =>
    set({ openRecognitionType }),

  setCurrent: (value) => set({ current: value }),
  setOpen: (open) => set({ open }),
}));
