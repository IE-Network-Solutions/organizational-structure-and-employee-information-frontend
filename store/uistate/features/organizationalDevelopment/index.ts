import create from 'zustand';
import { devtools } from 'zustand/middleware';

interface StoreState {
  open: boolean;
  setOpen: (error: boolean) => void;
  selectedAnswer:string|null;
  setSelectedAnswer: (error: string) => void;
  activeTab: string;
  setActiveTab: (error: string) => void;
  numberOfActionPlan:number,
  setNumberOfActionPlan:(numberOfActionPlan:number)=>void,
}

export const useOrganizationalDevelopment = create<StoreState>()(
  devtools(
      (set) => ({
        open:false,
        setOpen: (open: boolean) => set({ open }),
        activeTab:"1",
        setActiveTab: (activeTab: string) => set({ activeTab }),
        selectedAnswer:null,
        setSelectedAnswer: (selectedAnswer: string) => set({ selectedAnswer }),
        numberOfActionPlan:1,
        setNumberOfActionPlan:(numberOfActionPlan:number)=>set({numberOfActionPlan}),
      }),
  ),
);
