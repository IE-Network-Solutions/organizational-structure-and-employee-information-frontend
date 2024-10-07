import { create } from 'zustand';

interface Question {
  id?: number;
  fieldType: string;
  question: string;
  required: boolean;
  field: Record<string, string>[];
}

interface CustomField {
  name: string;
  selected: boolean;
  index?: number;
}

interface User {
  userId: string;
}

interface DynamicFormStore {
  isDrawerOpen: boolean;
  setIsDrawerOpen: (isDrawerOpen: boolean) => void;
  selectedUsers: User[];
  setSelectedUsers: (users: User[]) => void;
  clearSelectedUsers: () => void;
  questions: Question[];
  isEditQuestionModal: boolean;
  setEditQuestionsModal: (value: boolean) => void;
  isCopyURLModalOpen: boolean;
  setIsCopyModalOpen: (value: boolean) => void;
  customFields: CustomField[];
  isModalVisible: boolean;
  setIsModalVisible: (value: boolean) => void;
  addQuestion: (questions: Array<any>) => void;
  generatedUrl: string;
  deletedItem: string | null;
  current: number;
  pageSize: number;
  setGeneratedUrl: (url: string) => void;
  deleteQuestion: (id: number) => void;
  deleteOption: (questionId: number, optionIndex: number) => void;
  setDeletedItem: (itemId: string | null) => void;
  setCurrent: (value: number) => void;
  setPageSize: (pageSize: number) => void;
  deleteFormModal: boolean;
  setDeleteFormModal: (value: boolean) => void;
  isAddOpen: boolean;
  setIsAddOpen: (value: boolean) => void;

  isChecked: boolean;
  setIsChecked: (value: boolean) => void;
  selectedQuestions: string[];
  setSelectedQuestions: (value: string[]) => void;
  filteredQuestions: any[];
  setFilteredQuestions: (value: any[]) => void;

  rows: number;
}

export const useDynamicFormStore = create<DynamicFormStore>((set) => ({
  isDrawerOpen: false,
  setIsDrawerOpen: (value: boolean) => set({ isDrawerOpen: value }),
  selectedUsers: [],
  setSelectedUsers: (users) => set({ selectedUsers: users }),
  clearSelectedUsers: () => set({ selectedUsers: [] }),
  questions: [
    {
      id: 1,
      fieldType: '',
      question: '',
      required: false,
      field: [],
      answer: '',
    },
  ],
  isEditQuestionModal: false,
  setEditQuestionsModal: (value) => set({ isEditQuestionModal: value }),
  isCopyURLModalOpen: false,
  setIsCopyModalOpen: (value) => set({ isCopyURLModalOpen: value }),
  isModalVisible: false,
  isAddOpen: false,
  setIsAddOpen: (value) => set({ isAddOpen: value }),
  current: 1,
  pageSize: 4,
  deletedItem: null,
  customFields: [],
  setIsModalVisible: (value) => set({ isModalVisible: value }),
  addQuestion: (newQuestions) =>
    set({
      questions: newQuestions,
    }),
  generatedUrl: '',
  setGeneratedUrl: (url) => set({ generatedUrl: url }),
  deleteQuestion: (id) =>
    set((state) => ({
      questions: state.questions.filter((q) => q.id !== id),
    })),
  deleteOption: (questionId, optionIndex) =>
    set((state) => ({
      questions: state.questions.map(
        (q) =>
          q.id === questionId
            ? {
                ...q,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                field: q.field.filter((_, index) => index !== optionIndex),
              }
            : q,
        // eslint-enable-next-line @typescript-eslint/naming-convention
      ),
    })),
  setPageSize: (pageSize) => set({ pageSize }),
  setCurrent: (value) => set({ current: value }),
  setDeletedItem: (itemId) => set({ deletedItem: itemId }),
  deleteFormModal: false,
  setDeleteFormModal: (value) => set({ deleteFormModal: value }),

  isChecked: false,
  setIsChecked: (value) => set({ isChecked: value }),

  selectedQuestions: [],
  setSelectedQuestions: (value) => set({ selectedQuestions: value }),

  filteredQuestions: [],
  setFilteredQuestions: (value) => set({ filteredQuestions: value }),

  rows: 2,
}));
