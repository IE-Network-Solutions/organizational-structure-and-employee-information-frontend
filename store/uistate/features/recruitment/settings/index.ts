import { create } from 'zustand';

interface Question {
  id: string;
  fieldType: string;
  question: string;
  field: Record<string, string>[];
  title: string;
  required: boolean;
}

interface RecruitmentSettingsStore {
  isCustomFieldsDrawerOpen: boolean;
  setIsCustomFieldsDrawerOpen: (value: boolean) => void;

  customFieldsTemplate: Question;
  addCustomFieldsTemplate: (question: Question) => void;

  editCustomFieldsModalOpen: boolean;
  setEditCustomFieldsModalOpen: (value: boolean) => void;

  editingQuestion: any;
  setEditingQuestion: (value: any) => void;

  deletingQuestionId: string;
  setDeletingQuestionId: (value: string) => void;
  deleteModal: boolean;
  setDeleteModal: (value: boolean) => void;

  templateCurrentPage: number;
  setTemplateCurrentPage: (value: number) => void;
  templatePageSize: number;
  setTemplatePageSize: (value: number) => void;
}

export const useRecruitmentSettingsStore = create<RecruitmentSettingsStore>(
  (set) => ({
    isCustomFieldsDrawerOpen: false,
    setIsCustomFieldsDrawerOpen: (value: boolean) =>
      set({ isCustomFieldsDrawerOpen: value }),

    customFieldsTemplate: {
      id: '',
      fieldType: '',
      question: '',
      field: [],
      title: '',
      required: false,
    },
    addCustomFieldsTemplate: (question) =>
      set({ customFieldsTemplate: question }),

    editCustomFieldsModalOpen: false,
    setEditCustomFieldsModalOpen: (value) =>
      set({ editCustomFieldsModalOpen: value }),

    editingQuestion: null,
    setEditingQuestion: (value) => set({ editingQuestion: value }),

    deletingQuestionId: '',
    setDeletingQuestionId: (value) => set({ deletingQuestionId: value }),
    deleteModal: false,
    setDeleteModal: (value) => set({ deleteModal: value }),

    templateCurrentPage: 1,
    setTemplateCurrentPage: (value) => set({ templateCurrentPage: value }),
    templatePageSize: 4,
    setTemplatePageSize: (value) => set({ templatePageSize: value }),
  }),
);
