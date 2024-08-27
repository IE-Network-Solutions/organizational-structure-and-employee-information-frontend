import { create } from 'zustand';
import { SetState } from 'zustand';
import { StepState } from './interface';
const createStepSlice = (set: SetState<StepState>) => ({
  currentStep: 0,
  loading: false,
  nextStep: () =>
    set((state: { currentStep: number }) => ({
      currentStep: state.currentStep + 1,
    })),
  prevStep: () =>
    set((state: { currentStep: number }) => ({
      currentStep: state.currentStep - 1,
    })),
  toggleLoading: () =>
    set((state: { loading: boolean }) => ({
      loading: !state.loading,
    })),
  isModalVisible: false,
  togleIsModalVisible: () =>
    set((state: { isModalVisible: boolean }) => ({
      isModalVisible: !state.isModalVisible,
    })),
});

const useStepStore = create<StepState>((set) => ({
  ...createStepSlice(set),
}));

export default useStepStore;
