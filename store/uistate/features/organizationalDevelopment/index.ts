import create from 'zustand';
import { devtools } from 'zustand/middleware';

interface StoreState {
  open: boolean;
  setOpen: (error: boolean) => void;
  selectedAnswer:string[];
  setSelectedAnswer: (selectedAnswer: string) => void;
  activeTab: string;
  setActiveTab: (error: string) => void;
  numberOfActionPlan:number,
  setNumberOfActionPlan:(numberOfActionPlan:number)=>void,
   current:number,
  setCurrent:(current:number)=>void,

  numberOfRoleResponseblity:number,
  setNumberOfRoleResponseblity:(numberOfActionPlan:number)=>void,

}

export const useOrganizationalDevelopment = create<StoreState>()(
  devtools(
      (set) => ({
        current:1,
        setCurrent: (current: number) => set({ current }),
        open:false,
        setOpen: (open: boolean) => set({ open }),
        activeTab:"1",
        setActiveTab: (activeTab: string) => set({ activeTab }),
        selectedAnswer: [],
        setSelectedAnswer: (id: string) => set((state) => {
          const isSelected = state.selectedAnswer.includes(id);
          const updatedSelectedAnswer = isSelected
            ? state.selectedAnswer.filter(answer => answer !== id)
            : [...state.selectedAnswer, id];
          return { selectedAnswer: updatedSelectedAnswer };
        }),
        numberOfRoleResponseblity:0,
        setNumberOfRoleResponseblity:(numberOfRoleResponseblity:number)=>set({numberOfRoleResponseblity}),
        numberOfActionPlan:1,
        setNumberOfActionPlan:(numberOfActionPlan:number)=>set({numberOfActionPlan}),
      }),
  ),
);
