import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
interface CopilotState {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  showBot: boolean;
  setShowBot: (showBot: boolean) => void;
}

export const useCopilotStore = create<CopilotState>()(
  devtools((set) => ({
    isOpen: false,
    setIsOpen: (isOpen: boolean) => set({ isOpen }),
    showBot: false,
    setShowBot: (showBot: boolean) => set({ showBot }),
  })),
);
