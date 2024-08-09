import { create } from "zustand";
import { GetState, SetState } from "zustand";
import { StepState } from "./interface";
// Create the slice for step management
const createStepSlice = (set: SetState<StepState>, get: GetState<StepState>) => ({
    currentStep: 0,
    nextStep: () => set((state: { currentStep: number }) => ({ currentStep: state.currentStep + 1 })),
    prevStep: () => set((state: { currentStep: number }) => ({ currentStep: state.currentStep - 1 })),
  });
  
  // Initialize the store
  const useStepStore = create<StepState>((set, get) => ({
    ...createStepSlice(set, get)
  }));
  
  export default useStepStore;