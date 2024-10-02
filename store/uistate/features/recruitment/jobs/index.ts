import { create } from 'zustand';

interface Question {
  id: string;
  fieldType: string;
  question: string;
  required: boolean;
  field: Record<string, string>[];
}
interface JobFormValues {
  compensation: string;
  department: string;
  description: string;
  employmentType: string;
  jobDeadline: string;
  jobTitle: string;
  jobStatus: string;
  jobLocation: string;
  quantity: string;
  questions: Question[];
  yearOfExperience: string;
}

interface JobState {
  addNewDrawer: boolean;
  setAddNewDrawer: (value: boolean) => void;

  currentStep: number;
  setCurrentStep: (step: number) => void;

  addJobModalResult: boolean;
  setAddJobModalResult: (value: boolean) => void;

  isChecked: boolean;
  setIsChecked: (value: boolean) => void;

  selectedJobId: string;
  setSelectedJobId: (value: string) => void;

  generatedUrl: string;
  setGeneratedUrl: (url: string) => void;

  createNewJobFormValues: JobFormValues;
  setFormValues: (values: JobFormValues) => void;

  shareModalOpen: boolean;
  setShareModalOpen: (Value: boolean) => void;

  isChangeStatusModalVisible: boolean;
  setChangeStatusModalVisible: (Value: boolean) => void;

  isEditModalVisible: boolean;
  setEditModalVisible: (Value: boolean) => void;

  selectedQuestions: string[];
  setSelectedQuestions: (value: string[]) => void;

  filteredQuestions: any[];
  setFilteredQuestions: (value: any[]) => void;

  currentPage: number;
  pageSize: number;
  setCurrentPage: (value: number) => void;
  setPageSize: (value: number) => void;

  editingJob: any | null;
  setEditingJob: (category: any | null) => void;

  selectedJob: any | null;
  setSelectedJob: (job: any | null) => void;
}

export const useJobState = create<JobState>((set) => ({
  addNewDrawer: false,
  setAddNewDrawer: (value) => set({ addNewDrawer: value }),

  currentStep: 0,
  setCurrentStep: (step: number) => set(() => ({ currentStep: step })),

  addJobModalResult: false,
  setAddJobModalResult: (value) => set({ addJobModalResult: value }),

  isChecked: false,
  setIsChecked: (value) => set({ isChecked: value }),

  selectedJobId: '',
  setSelectedJobId: (value) => set({ selectedJobId: value }),
  generatedUrl: '',
  setGeneratedUrl: (url) => set({ generatedUrl: url }),

  createNewJobFormValues: {
    compensation: '',
    department: '',
    description: '',
    employmentType: '',
    jobDeadline: '',
    jobTitle: '',
    jobStatus: '',
    jobLocation: '',
    quantity: '',
    questions: [
      {
        id: '',
        fieldType: '',
        question: '',
        required: false,
        field: [],
      },
    ],
    yearOfExperience: '',
  },
  setFormValues: (values) =>
    set({
      createNewJobFormValues: values,
    }),

  shareModalOpen: false,
  setShareModalOpen: (value) => set({ shareModalOpen: value }),

  isChangeStatusModalVisible: false,
  setChangeStatusModalVisible: (value) =>
    set({ isChangeStatusModalVisible: value }),

  isEditModalVisible: false,
  setEditModalVisible: (variable) => set({ isEditModalVisible: variable }),

  selectedQuestions: [],
  setSelectedQuestions: (value) => set({ selectedQuestions: value }),

  filteredQuestions: [],
  setFilteredQuestions: (value) => set({ filteredQuestions: value }),

  currentPage: 1,
  pageSize: 4,
  setCurrentPage: (value) => set({ currentPage: value }),
  setPageSize: (value) => set({ pageSize: value }),

  editingJob: null,
  setEditingJob: (job) => set({ editingJob: job }),

  selectedJob: null,
  setSelectedJob: (job) => set({ selectedJob: job }),
}));
