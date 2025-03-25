import { TalentPoolState } from '@/types/dashboard/recruitment/talentPool';
import { create } from 'zustand';

export const useTalentPoolStore = create<TalentPoolState>((set) => ({
  candidates: [
    {
      id: '1',
      name: 'John Doe',
      phoneNumber: '555-1234',
      email: 'email@mail.com',
      appliedFor: 'Engineering',
      cgpa: 3.8,
      cv: 'john-doe-cv.pdf',
      movedIndDte: '2023-09-10',
      stage: 'Interview',
    },
  ],
  filters: {
    job: '',
    department: '',
    stage: '',
    dateRange: ['', ''],
  },
  pagination: {
    currentPage: 1,
    pageSize: 10,
  },
  visibleOnboard: false,
  addedCandidate: { candidateId: '', reason: '', talentPoolId: '' },
  setCandidates: (candidates) => set({ candidates }),
  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),
  setPagination: (pagination) =>
    set((state) => ({
      pagination: { ...state.pagination, ...pagination },
    })),
  setStage: (id: string, stage: string) =>
    set((state) => ({
      candidates: state.candidates.map((candidate) =>
        candidate.id === id ? { ...candidate, stage } : candidate,
      ),
    })),
  setAddCandidate: (value) => set({ addedCandidate: value }),
  setVisibleOnboardState: (visible) => set({ visibleOnboard: visible }),

  page: 8,
  currentPage: 1,
  setCurrentPage: (currentPage: number) => set({ currentPage }),
  setPage: (page: number) => set({ page }),

  searchParams: {
    date_range: '',
    department: '',
    job: '',
    stages: '',
  },
  setSearchParams: (key, value) =>
    set((state) => ({
      searchParams: { ...state.searchParams, [key]: value },
    })),
}));
