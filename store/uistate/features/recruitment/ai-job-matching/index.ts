import { create } from 'zustand';

interface AIJobMatchingState {
  // Sidebar state
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;

  // Selected job for matching
  selectedJobId: string | null;
  setSelectedJobId: (id: string | null) => void;

  // Match filters
  minMatchScore: number;
  setMinMatchScore: (score: number) => void;

  // View mode
  viewMode: 'jobs' | 'candidates' | 'details';
  setViewMode: (mode: 'jobs' | 'candidates' | 'details') => void;

  // Selected candidate for details
  selectedCandidateId: string | null;
  setSelectedCandidateId: (id: string | null) => void;

  // Match details drawer
  matchDetailsDrawerOpen: boolean;
  setMatchDetailsDrawerOpen: (open: boolean) => void;

  // Batch matching
  isBatchMatching: boolean;
  setIsBatchMatching: (value: boolean) => void;

  // Active tab in sidebar
  activeTab: 'overview' | 'matches' | 'analysis';
  setActiveTab: (tab: 'overview' | 'matches' | 'analysis') => void;
}

export const useAIJobMatchingStore = create<AIJobMatchingState>((set) => ({
  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  selectedJobId: null,
  setSelectedJobId: (id) => set({ selectedJobId: id }),

  minMatchScore: 70, // Default 70% match score
  setMinMatchScore: (score) => set({ minMatchScore: score }),

  viewMode: 'jobs',
  setViewMode: (mode) => set({ viewMode: mode }),

  selectedCandidateId: null,
  setSelectedCandidateId: (id) => set({ selectedCandidateId: id }),

  matchDetailsDrawerOpen: false,
  setMatchDetailsDrawerOpen: (open) => set({ matchDetailsDrawerOpen: open }),

  isBatchMatching: false,
  setIsBatchMatching: (value) => set({ isBatchMatching: value }),

  activeTab: 'overview',
  setActiveTab: (tab) => set({ activeTab: tab }),
}));
