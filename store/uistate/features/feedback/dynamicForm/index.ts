import { create } from 'zustand';

interface Question {
  id: number;
  type: string;
  question: string;
  options: string[];
  answer?: string;
}

interface CustomField {
  name: string;
  selected: boolean;
  index?: number;
}

interface DynamicFormStore {
  questions: Question[];
  customFields: CustomField[];
  isModalVisible: boolean;
  setIsModalVisible: (value: boolean) => void;
  addQuestion: () => void;
  updateQuestion: (id: number, updates: Partial<Question>) => void;
  updateOption: (
    questionId: number,
    optionIndex: number,
    value: string,
  ) => void;
  generatedUrl: string;
  deletedItem: string | null;
  current: number;
  pageSize: number;
  setGeneratedUrl: (url: string) => void;
  publishSurvey: () => void;
  deleteQuestion: (id: number) => void;
  deleteOption: (questionId: number, optionIndex: number) => void;
  setDeletedItem: (itemId: string | null) => void;
  setCurrent: (value: number) => void;
  setPageSize: (pageSize: number) => void;
}

export const useDynamicFormStore = create<DynamicFormStore>((set) => ({
  questions: [{ id: 1, type: 'multiple_choice', question: '', options: [] }],
  isModalVisible: false,
  current: 1,
  pageSize: 4,
  deletedItem: null,
  customFields: [],
  setIsModalVisible: (value) => set({ isModalVisible: value }),
  addQuestion: () =>
    set((state) => ({
      questions: [
        ...state.questions,
        {
          id: state.questions.length + 1,
          type: 'multiple_choice',
          question: '',
          options: [],
        },
      ],
    })),
  updateQuestion: (id, updates) =>
    set((state) => ({
      questions: state.questions.map((q) =>
        q.id === id ? { ...q, ...updates } : q,
      ),
    })),
  updateOption: (questionId, optionIndex, value) =>
    set((state) => ({
      questions: state.questions.map((q) =>
        q.id === questionId
          ? {
              ...q,
              options: q.options.map((opt, idx) =>
                idx === optionIndex ? value : opt,
              ),
            }
          : q,
      ),
    })),
  generatedUrl: '',
  setGeneratedUrl: (url) => set({ generatedUrl: url }),
  publishSurvey: () => {
    const uniqueId = Math.random().toString(36).substring(7);
    const url = `${window.location.origin}/questions/${uniqueId}`;
    set({ generatedUrl: url });
  },
  deleteQuestion: (id) =>
    set((state) => ({
      questions: state.questions.filter((q) => q.id !== id),
    })),
  deleteOption: (questionId, optionIndex) =>
    set((state) => ({
      questions: state.questions.map((q) =>
        q.id === questionId
          ? {
              ...q,
              // eslint-disable-next-line @typescript-eslint/naming-convention
              options: q.options.filter((_, index) => index !== optionIndex),
            }
          : q,
      ),
    })),
  setPageSize: (pageSize) => set({ pageSize }),
  setCurrent: (value) => set({ current: value }),
  setDeletedItem: (itemId) => set({ deletedItem: itemId }),
}));
