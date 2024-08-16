import { create } from 'zustand';
import { SetState } from 'zustand';
import { StepState } from './interface';
const createStepSlice = (set: SetState<StepState>) => ({
  currentStep: 0,
  nextStep: () =>
    set((state: { currentStep: number }) => ({
      currentStep: state.currentStep + 1,
    })),
  prevStep: () =>
    set((state: { currentStep: number }) => ({
      currentStep: state.currentStep - 1,
    })),
});

// Initialize the store
const useStepStore = create<StepState>((set) => ({
  ...createStepSlice(set),
}));

export default useStepStore;
