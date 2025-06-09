import { create } from 'zustand';

interface Question {
  fieldType: string;
  question: string;
  field: Record<string, string>[];
  customFieldName: string;
  required: boolean;
}

export interface CustomTemplates {
  isOpen: boolean;
  setIsOpen: (Value: boolean) => void;
  templateQuestions: Question;
  addTemplateQuestion: (question: Question) => void;
  templatePageSize: number;
  templateCurrentPage: number;
  setTemplateCurrentPage: (value: number) => void;
  setTemplatePageSize: (page: number) => void;
  editingQuestion: any;
  setEditingQuestion: (value: any) => void;
  deletingQuestionId: string | null;
  setDeletingQuestionId: (value: string | null) => void;
  questionModal: boolean;
  setQuestionModal: (value: boolean) => void;
  deleteModal: boolean;
  setDeleteModal: (value: boolean) => void;

  isModalVisible: boolean;
  setIsModalVisible: (isModalVisible: boolean) => void;
}

export const useCustomQuestionTemplateStore = create<CustomTemplates>(
  (set) => ({
    isOpen: false,
    templatePageSize: 4,
    templateCurrentPage: 1,
    setTemplateCurrentPage: (value) => set({ templateCurrentPage: value }),
    setTemplatePageSize: (page) => set({ templatePageSize: page }),
    setIsOpen: (value) => set({ isOpen: value }),
    templateQuestions: {
      fieldType: '',
      question: '',
      field: [],
      customFieldName: '',
      required: false,
    },
    addTemplateQuestion: (question) => set({ templateQuestions: question }),
    editingQuestion: null,
    setEditingQuestion: (value) => set({ editingQuestion: value }),
    deletingQuestionId: null,
    setDeletingQuestionId: (value) => set({ deletingQuestionId: value }),
    questionModal: false,
    setQuestionModal: (value) => set({ questionModal: value }),
    deleteModal: false,
    setDeleteModal: (value) => set({ deleteModal: value }),
    isModalVisible: false,
    setIsModalVisible: (isModalVisible: boolean) =>
      set({ isModalVisible }),
  }),
);
