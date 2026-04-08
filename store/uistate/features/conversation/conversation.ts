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

  openRecognitionCategoryModal: boolean;
  setOpenRecognitionCategoryModal: (value: boolean) => void;

  recognitionCategoryEditId: string;
  setRecognitionCategoryEditId: (value: string) => void;

  setCurrent: (value: number) => void;

  setOpen: (open: boolean) => void;
  setOpenModal: (open: boolean) => void;

  searchQuery: string;
  setSearchQuery: (searchQuery: string) => void;

  searchAppreciationQuery: string;
  setSearchAppreciationQuery: (searchAppreciationQuery: string) => void;

  searchReprimandQuery: string;
  setSearchReprimandQuery: (searchReprimandQuery: string) => void;

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

  totalWeight: number;
  setTotalWeight: (totalWeight: number) => void;

  recognitionTypeId: string;
  setRecognitionTypeId: (value: string) => void;

  parentRecognitionTypeId: string;
  setParentRecognitionTypeId: (value: string) => void;

  editType: string;
  setEditType: (value: string) => void;

  editingRecognitionCriteriaId: string;
  setEditingRecognitionCriteriaId: (value: string) => void;

  editingRowKeys: any;
  setEditingRowKeys: (valiue: any) => void;

  activeTab: string;
  setActiveTab: (activeTab: string) => void;

  settingActiveTab: string;
  setSettingActiveTab: (settingActiveTab: string) => void;

  empId: string;
  setEmpId: (empId: string) => void;

  givenDate: any;
  setGivenDate: (givenDate: any) => void;

  feedbackListPerspective: 'givenBy' | 'issuedTo' | null;
  setFeedbackListPerspective: (
    perspective: 'givenBy' | 'issuedTo' | null,
  ) => void;
  feedbackListTypeId: string | undefined;
  setFeedbackListTypeId: (id: string | undefined) => void;

  variantType: 'appreciation' | 'reprimand';
  setVariantType: (variantType: 'appreciation' | 'reprimand') => void;

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

  editingItem: any;
  setEditingItem: (editingItem: any) => void;

  selectedRowKeys: React.Key[];
  setSelectedRowKeys: (keys: React.Key[]) => void;

  feedbackModalType: 'Engagement' | 'KPI';
  setFeedbackModalType: (type: 'Engagement' | 'KPI') => void;

  perspectiveOpenDropdownId: string | null;
  setPerspectiveOpenDropdownId: (value: string | null) => void;

  perspectiveOpenDeleteConfirmId: string | null;
  setPerspectiveOpenDeleteConfirmId: (value: string | null) => void;

  feedbackOpenDropdownId: string | null;
  setFeedbackOpenDropdownId: (value: string | null) => void;

  recognitionOpenDropdownId: string | null;
  setRecognitionOpenDropdownId: (value: string | null) => void;
}
const initialSearchField: SearchField[] = [
  {
    key: 'employee',
    placeholder: 'Select Employee',
    options: [], // Empty initially, will be updated dynamically
    widthRatio: 0.5,
    onChange: () => {},
  },
  {
    key: 'department',
    placeholder: 'Select Department',
    options: [], // Empty initially, will be updated dynamically
    widthRatio: 0.5,
    onChange: () => {},
  },
];

export const ConversationStore = create<CategoriesUseState>((set) => ({
  open: false,
  current: 0,
  totalPages: 10,

  pageSize: 10,
  setPageSize: (pageSize: number) => set({ pageSize }),

  searchQuery: '',
  setSearchQuery: (searchQuery: string) => set({ searchQuery }),

  searchAppreciationQuery: '',
  setSearchAppreciationQuery: (searchAppreciationQuery: string) =>
    set({ searchAppreciationQuery }),

  searchReprimandQuery: '',
  setSearchReprimandQuery: (searchReprimandQuery: string) =>
    set({ searchReprimandQuery }),

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

  totalWeight: 0,
  setTotalWeight: (totalWeight: number) => set({ totalWeight }),

  selectedUserId: '',
  setSelectedUserId: (selectedUserId: string) => set({ selectedUserId }),

  selectedRecognitionType: '',
  setSelectedRecognitionType: (selectedRecognitionType: string) =>
    set({ selectedRecognitionType }),
  variantType: 'appreciation',
  setVariantType: (variantType: 'appreciation' | 'reprimand') =>
    set({ variantType }),

  selectedFeedback: null,
  setSelectedFeedback: (selectedFeedback: any) => set({ selectedFeedback }),

  selectedFeedbackRecord: null,
  setSelectedFeedbackRecord: (selectedFeedbackRecord: FeedbackRecord | null) =>
    set({ selectedFeedbackRecord }),

  activeTab: '1',
  setActiveTab: (activeTab: string) => set({ activeTab }),

  settingActiveTab: 'appreciation',
  setSettingActiveTab: (settingActiveTab: string) => set({ settingActiveTab }),

  empId: '',
  setEmpId: (empId: string) => set({ empId }),

  givenDate: [],
  setGivenDate: (givenDate: any) => set({ givenDate }),

  feedbackListPerspective: null,
  setFeedbackListPerspective: (perspective) =>
    set({ feedbackListPerspective: perspective }),

  feedbackListTypeId: undefined,
  setFeedbackListTypeId: (id) => set({ feedbackListTypeId: id }),

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

  editType: '',
  setEditType: (editType: string) => set({ editType }),

  editingRecognitionCriteriaId: '',
  setEditingRecognitionCriteriaId: (editingRecognitionCriteriaId: string) =>
    set({ editingRecognitionCriteriaId }),

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

  openRecognitionCategoryModal: false,
  setOpenRecognitionCategoryModal: (openRecognitionCategoryModal: boolean) =>
    set({ openRecognitionCategoryModal }),

  recognitionCategoryEditId: '',
  setRecognitionCategoryEditId: (recognitionCategoryEditId: string) =>
    set({ recognitionCategoryEditId }),

  editingItem: null,
  setEditingItem: (editingItem: any) => set({ editingItem }),

  setCurrent: (value) => set({ current: value }),
  setOpen: (open) => set({ open }),
  setOpenModal: (open) => set({ open }),

  selectedRowKeys: [],
  setSelectedRowKeys: (keys) => set({ selectedRowKeys: keys }),

  feedbackModalType: 'Engagement',
  setFeedbackModalType: (feedbackModalType: 'Engagement' | 'KPI') =>
    set({ feedbackModalType }),

  perspectiveOpenDropdownId: null,
  setPerspectiveOpenDropdownId: (perspectiveOpenDropdownId: string | null) =>
    set({ perspectiveOpenDropdownId }),

  perspectiveOpenDeleteConfirmId: null,
  setPerspectiveOpenDeleteConfirmId: (
    perspectiveOpenDeleteConfirmId: string | null,
  ) => set({ perspectiveOpenDeleteConfirmId }),

  feedbackOpenDropdownId: null,
  setFeedbackOpenDropdownId: (feedbackOpenDropdownId: string | null) =>
    set({ feedbackOpenDropdownId }),

  recognitionOpenDropdownId: null,
  setRecognitionOpenDropdownId: (recognitionOpenDropdownId: string | null) =>
    set({ recognitionOpenDropdownId }),
}));
