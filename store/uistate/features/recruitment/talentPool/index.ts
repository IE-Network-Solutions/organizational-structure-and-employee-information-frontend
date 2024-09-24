// talentPoolStore.ts
import { create } from 'zustand';

export interface Candidate {
  id: string;
  name: string;
  phoneNumber: string;
  email:string;
  appliedFor: string;
  cgpa: number;
  cv: string;
  dateAdded: string;
  stage: string;
}

interface Pagination {
  currentPage: number;
  pageSize: number;
  totalCandidates: number;
}

interface Filters {
  job: string;
  department: string;
  stage: string;
  dateRange: [string | null, string | null];
}

interface TalentPoolState {
  candidates: Candidate[];
  filters: Filters;
  pagination: Pagination;
  setCandidates: (candidates: Candidate[]) => void;
  setFilters: (filters: Partial<Filters>) => void;
  setPagination: (pagination: Partial<Pagination>) => void;
}

export const useTalentPoolStore = create<TalentPoolState>((set) => ({
  candidates: [
    {
      id: "1",
      name: 'John Doe',
      phoneNumber: '555-1234',
      email:"email@mail.com",
      appliedFor: 'Engineering',
      cgpa: 3.8,
      cv: 'john-doe-cv.pdf',
      dateAdded: '2023-09-10',
      stage: 'Interview',
    },
  ],
  filters: {
    job: '',
    department: '',
    stage: '',
    dateRange: ["", ""],
  },
  pagination: {
    currentPage: 1,
    pageSize: 10,
    totalCandidates: 1,
  },
  setCandidates: (candidates) => set({ candidates }),
  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),
  setPagination: (pagination) =>
    set((state) => ({
      pagination: { ...state.pagination, ...pagination },
    })),
}));
