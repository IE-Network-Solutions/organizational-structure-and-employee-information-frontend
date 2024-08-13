export interface StepState {
    currentStep: number;
    nextStep: () => void;
    prevStep: () => void;
  }