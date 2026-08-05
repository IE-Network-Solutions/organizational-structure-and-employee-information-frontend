import { create, StateCreator } from 'zustand';
import { TnaSourceType } from '@/types/tna/externalTna';
import { ExternalTrainingRequest } from '@/types/tna/externalTna';

type ExternalTrainingState = {
  /** Which tab the "New Course / New TNA" modal opens on. */
  createModalTab: TnaSourceType;
  /** Internal / External / all filter on the Learning Management grid. */
  sourceTypeFilter: TnaSourceType | null;
  externalTrainingId: string | null;
  isShowManagerDecisionModal: boolean;
  isShowTnaOfficerDecisionModal: boolean;
  activeRequest: ExternalTrainingRequest | null;
};

type ExternalTrainingAction = {
  setCreateModalTab: (createModalTab: TnaSourceType) => void;
  setSourceTypeFilter: (sourceTypeFilter: TnaSourceType | null) => void;
  setExternalTrainingId: (externalTrainingId: string | null) => void;
  setIsShowManagerDecisionModal: (isShow: boolean) => void;
  setIsShowTnaOfficerDecisionModal: (isShow: boolean) => void;
  setActiveRequest: (activeRequest: ExternalTrainingRequest | null) => void;
  resetExternalTrainingState: () => void;
};

const externalTrainingSlice: StateCreator<
  ExternalTrainingState & ExternalTrainingAction
> = (set) => ({
  createModalTab: TnaSourceType.INTERNAL,
  setCreateModalTab: (createModalTab) => set({ createModalTab }),

  sourceTypeFilter: null,
  setSourceTypeFilter: (sourceTypeFilter) => set({ sourceTypeFilter }),

  externalTrainingId: null,
  setExternalTrainingId: (externalTrainingId) => set({ externalTrainingId }),

  isShowManagerDecisionModal: false,
  setIsShowManagerDecisionModal: (isShowManagerDecisionModal) =>
    set({ isShowManagerDecisionModal }),

  isShowTnaOfficerDecisionModal: false,
  setIsShowTnaOfficerDecisionModal: (isShowTnaOfficerDecisionModal) =>
    set({ isShowTnaOfficerDecisionModal }),

  activeRequest: null,
  setActiveRequest: (activeRequest) => set({ activeRequest }),

  resetExternalTrainingState: () =>
    set({
      externalTrainingId: null,
      isShowManagerDecisionModal: false,
      isShowTnaOfficerDecisionModal: false,
      activeRequest: null,
    }),
});

export const useExternalTrainingStore = create<
  ExternalTrainingState & ExternalTrainingAction
>(externalTrainingSlice);
