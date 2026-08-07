import { create, StateCreator } from 'zustand';
import { TnaSourceType } from '@/types/tna/externalTna';

type ExternalTrainingState = {
  /** Which tab the "New Course / New TNA" modal opens on. */
  createModalTab: TnaSourceType;
  /** Internal / External / all filter on the Learning Management grid. */
  sourceTypeFilter: TnaSourceType | null;
  /** Training request being edited in the modal, if any. */
  trainingRequestId: string | null;
};

type ExternalTrainingAction = {
  setCreateModalTab: (createModalTab: TnaSourceType) => void;
  setSourceTypeFilter: (sourceTypeFilter: TnaSourceType | null) => void;
  setTrainingRequestId: (trainingRequestId: string | null) => void;
  resetExternalTrainingState: () => void;
};

const externalTrainingSlice: StateCreator<
  ExternalTrainingState & ExternalTrainingAction
> = (set) => ({
  createModalTab: TnaSourceType.INTERNAL,
  setCreateModalTab: (createModalTab) => set({ createModalTab }),

  sourceTypeFilter: null,
  setSourceTypeFilter: (sourceTypeFilter) => set({ sourceTypeFilter }),

  trainingRequestId: null,
  setTrainingRequestId: (trainingRequestId) => set({ trainingRequestId }),

  resetExternalTrainingState: () => set({ trainingRequestId: null }),
});

export const useExternalTrainingStore = create<
  ExternalTrainingState & ExternalTrainingAction
>(externalTrainingSlice);
