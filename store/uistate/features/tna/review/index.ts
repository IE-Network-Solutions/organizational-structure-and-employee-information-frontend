import { create, StateCreator } from 'zustand';
import { TrainingNeedCategory } from '@/types/tna/tna';

type TnaReviewState = {
  isShowTnaReviewSidebar: boolean;
  isShowTnaUpdateSidebar: boolean;
  tnaId: string | null;
  tnaCategory: TrainingNeedCategory[];
  userCurrentPage: number;
  pageSize: number;
};

type TnaReviewAction = {
  setIsShowTnaReviewSidebar: (isShowTnaReviewSidebar: boolean) => void;
  setIsShowTnaUpdateSidebar: (isShowTnaUpdateSidebar: boolean) => void;
  setTnaId: (tnaId: string | null) => void;
  setTnaCategory: (tnaCategory: TrainingNeedCategory[]) => void;
  setUserCurrentPage: (userCurrentPage: number) => void;
  setPageSize: (pageSize: number) => void;

  searchQuery: string;
  setSearchQuery: (searchQuery: string) => void;

  sessionId: string;
  setSessionId: (sessionId: string) => void;

  yearId: string;
  setYearId: (yearId: string) => void;

  monthId: string;
  setMonthId: (monthId: string) => void;
};

const tnaReviewSlice: StateCreator<TnaReviewState & TnaReviewAction> = (
  set,
) => ({
  isShowTnaReviewSidebar: false,
  setIsShowTnaReviewSidebar: (isShowTnaReviewSidebar: boolean) => {
    set({ isShowTnaReviewSidebar });
  },

  isShowTnaUpdateSidebar: false,
  setIsShowTnaUpdateSidebar: (isShowTnaUpdateSidebar) => {
    set({ isShowTnaUpdateSidebar });
  },

  searchQuery: '',
  setSearchQuery: (searchQuery: string) => set({ searchQuery }),
  tnaId: null,
  setTnaId: (tnaId) => {
    set({ tnaId });
  },

  tnaCategory: [],
  setTnaCategory: (tnaCategory: TrainingNeedCategory[]) => {
    set({ tnaCategory });
  },
  userCurrentPage: 1,
  setUserCurrentPage: (userCurrentPage: number) => set({ userCurrentPage }),
  pageSize: 5,

  setPageSize: (pageSize: number) => set({ pageSize }),
  branchRequestSidebarData: '',

  sessionId: '',
  setSessionId: (sessionId: string) => set({ sessionId }),

  yearId: '',
  setYearId: (yearId: string) => set({ yearId }),

  monthId: '',
  setMonthId: (monthId: string) => set({ monthId }),
});

export const useTnaReviewStore = create<TnaReviewState & TnaReviewAction>(
  tnaReviewSlice,
);