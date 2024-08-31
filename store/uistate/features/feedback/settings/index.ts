import { create } from 'zustand';

interface Question {
  id: number;
  type: string;
  question: string;
  options: string[];
  answer?: string;
}

interface OrganizationalDevelopmentSettings {
  isOpen: boolean;
  setIsOpen: (Value: boolean) => void;
  questions: Question[];
  addQuestion: () => void;
  updateQuestion: (id: number, updates: Partial<Question>) => void;
  updateOption: (
    questionId: number,
    optionIndex: number,
    value: string,
  ) => void;
}

export const OrganizationalDevelopmentSettingsStore =
  create<OrganizationalDevelopmentSettings>((set) => ({
    isOpen: false,
    setIsOpen: (value) => set({ isOpen: value }),
    questions: [],
    addQuestion: () =>
      set((state) => ({
        questions: [
          ...state.questions,
          {
            id: state.questions.length + 1,
            type: 'Multiple Choice',
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
  }));
