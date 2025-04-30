import { create } from 'zustand';

export interface CandidateData {
  phoneNumber: string;
  candidateName: string;
  cgpa: string;
  internal_external: string;
  cv: string;
  createdAt: string;
  stages: string;
  action: string;
  id?: string;
}

interface SearchParams {
  whatYouNeed: string;
  dateRange: string;
  selectedJob: string;
  selectedStage: string;
  selectedDepartment: string;
}
interface CandidateState {
  documentFileList: any[];
  setDocumentFileList: (fileList: any[]) => void;
  removeDocument: (uid: string) => void;

  createJobDrawer: boolean;
  setCreateJobDrawer: (value: boolean) => void;

  isClient: boolean;
  setIsClient: (value: boolean) => void;

  currentPage: number;
  pageSize: number;
  setCurrentPage: (value: number) => void;
  setPageSize: (value: number) => void;

  searchParams: SearchParams;
  setSearchParams: (key: keyof SearchParams, value: string | boolean) => void;

  candidateDetailDrawer: boolean;
  setCandidateDetailDrawer: (value: boolean) => void;

  selectedCandidate: any | null;
  setSelectedCandidate: (candidate: any | null) => void;

  selectedCandidateId: string;
  setSelectedCandidateID: (candidateId: string) => void;

  editCandidateModal: boolean;
  setEditCandidateModal: (value: boolean) => void;
  editCandidate: any | null;
  setEditCandidate: (candidate: any | null) => void;

  deleteCandidateId: string;
  setDeleteCandidateId: (value: string) => void;
  deleteCandidateModal: boolean;
  setDeleteCandidateModal: (value: boolean) => void;

  moveToTalentPoolModal: boolean;
  setMoveToTalentPoolModal: (value: boolean) => void;

  isSmallScreen: boolean;
  setIsSmallScreen: (value: boolean) => void;

  moveToTalentPool: boolean;
  setMoveToTalentPool: (value: boolean) => void;

  showMobileFilter: boolean;
  setShowMobileFilter: (value: boolean) => void;
}

export const useCandidateState = create<CandidateState>((set) => ({
  documentFileList: [],
  setDocumentFileList: (fileList) => set({ documentFileList: fileList }),
  removeDocument: (uid) =>
    set((state) => ({
      documentFileList: state.documentFileList.filter(
        (file) => file.uid !== uid,
      ),
    })),

  createJobDrawer: false,
  setCreateJobDrawer: (value) => set({ createJobDrawer: value }),

  isClient: false,
  setIsClient: (value) => set({ isClient: value }),

  searchParams: {
    whatYouNeed: '',
    dateRange: '',
    selectedJob: '',
    selectedStage: '',
    selectedDepartment: '',
  },
  setSearchParams: (key, value) => {
    const stringValue = typeof value === 'boolean' ? String(value) : value;
    set((state) => ({
      searchParams: { ...state.searchParams, [key]: stringValue },
    }));
  },

  currentPage: 1,
  pageSize: 10,
  setCurrentPage: (value) => set({ currentPage: value }),
  setPageSize: (value) => set({ pageSize: value }),

  candidateDetailDrawer: false,
  setCandidateDetailDrawer: (value) => set({ candidateDetailDrawer: value }),

  selectedCandidate: null,
  setSelectedCandidate: (value) => set({ selectedCandidate: value }),

  selectedCandidateId: '',
  setSelectedCandidateID: (value) => set({ selectedCandidateId: value }),

  editCandidateModal: false,
  setEditCandidateModal: (value) => set({ editCandidateModal: value }),
  editCandidate: null,
  setEditCandidate: (value) => set({ editCandidate: value }),

  deleteCandidateId: '',
  setDeleteCandidateId: (value) => set({ deleteCandidateId: value }),
  deleteCandidateModal: false,
  setDeleteCandidateModal: (value) => set({ deleteCandidateModal: value }),

  moveToTalentPoolModal: false,
  setMoveToTalentPoolModal: (value) => set({ moveToTalentPoolModal: value }),

  isSmallScreen: false,
  setIsSmallScreen: (value) => set({ isSmallScreen: value }),

  moveToTalentPool: false,
  setMoveToTalentPool: (value) => set({ moveToTalentPool: value }),

  showMobileFilter: false,
  setShowMobileFilter: (value: boolean) => set({ showMobileFilter: value }),
}));
