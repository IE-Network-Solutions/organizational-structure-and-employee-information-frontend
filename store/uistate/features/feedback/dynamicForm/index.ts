import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

interface Question {
  id: number;
  fieldType: string;
  question: string;
  required: boolean;
  field: Record<string, string>[];
  answer?: string;
}

interface CustomField {
  name: string;
  selected: boolean;
  index?: number;
}

interface DynamicFormStore {
  questions: Question[];
  open: boolean;
  setOpen(value: boolean): void;
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
}

export const useDynamicFormStore = create<DynamicFormStore>((set) => ({
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
  isModalVisible: false,
  open: false,
  setOpen: (value) => set({ open: value }),
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
}));
