import { create } from 'zustand';

interface Question {
  id?: number;
  fieldType: string;
  question: string;
  required: boolean;
  field: Record<string, string>[];
}

interface JobState {
  addNewDrawer: boolean;
  setAddNewDrawer: (value: boolean) => void;

  currentStep: number;
  setCurrentStep: (step: number) => void;

  expandedKeys: React.Key[];
  setExpandedKeys: (keys: React.Key[]) => void;

  questions: Question[];
  addQuestion: (questions: Array<any>) => void;

  addJobModalResult: boolean;
  setAddJobModalResult: (value: boolean) => void;

  isChecked: boolean;
  setIsChecked: (value: boolean) => void;

  generatedUrl: string;
  setGeneratedUrl: (url: string) => void;
}

export const useJobState = create<JobState>((set) => ({
  addNewDrawer: false,
  setAddNewDrawer: (value) => set({ addNewDrawer: value }),

  currentStep: 0,
  setCurrentStep: (step: number) => set(() => ({ currentStep: step })),

  expandedKeys: [],
  setExpandedKeys: (value: React.Key[]) => set({ expandedKeys: value }),

  questions: [
    {
      id: 1,
      fieldType: '',
      question: '',
      required: false,
      field: [],
    },
  ],
  addQuestion: (newQuestions) =>
    set({
      questions: newQuestions,
    }),

  addJobModalResult: false,
  setAddJobModalResult: (value) => set({ addJobModalResult: value }),

  isChecked: false,
  setIsChecked: (value) => set({ isChecked: value }),

  generatedUrl: '',
  setGeneratedUrl: (url) => set({ generatedUrl: url }),
}));
