import { create } from 'zustand';

interface Question {
  fieldType: string;
  question: string;
  field: Record<string, string>[];
  customFieldName: string;
  required: boolean;
}

interface RecruitmentSettingsStore {
  isCustomFieldsDrawerOpen: boolean;
  setIsCustomFieldsDrawerOpen: (value: boolean) => void;

  customFieldsTemplate: Question;
  addCustomFieldsTemplate: (question: Question) => void;
}

export const useRecruitmentSettingsStore = create<RecruitmentSettingsStore>(
  (set) => ({
    isCustomFieldsDrawerOpen: false,
    setIsCustomFieldsDrawerOpen: (value: boolean) =>
      set({ isCustomFieldsDrawerOpen: value }),

    customFieldsTemplate: {
      fieldType: '',
      question: '',
      field: [],
      customFieldName: '',
      required: false,
    },
    addCustomFieldsTemplate: (question) =>
      set({ customFieldsTemplate: question }),
  }),
);
