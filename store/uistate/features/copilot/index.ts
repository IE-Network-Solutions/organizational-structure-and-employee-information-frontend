import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface CopilotState {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const useCopilotStore = create<CopilotState>()(
  devtools((set) => ({
    isOpen: false,
    setIsOpen: (isOpen: boolean) => set({ isOpen }),
  })),
);
