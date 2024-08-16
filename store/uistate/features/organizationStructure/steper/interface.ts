export interface StepState {
  currentStep: number;
  loading:boolean, 
  toggleLoading:()=>void;
  nextStep: () => void;
  prevStep: () => void;

  isModalVisible:boolean, 
  togleIsModalVisible:()=>void

}
