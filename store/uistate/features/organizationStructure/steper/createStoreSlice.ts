import { GetState, SetState } from "zustand";
import { StepState } from "./interface";

const createStepSlice = (set: SetState<StepState>, get: GetState<StepState>) => ({
    currentStep: 0,
    nextStep: () => set((state: { currentStep: number }) => ({ currentStep: state.currentStep + 1 })),
    prevStep: () => set((state: { currentStep: number }) => ({ currentStep: state.currentStep - 1 })),
  });
  

  export default createStepSlice