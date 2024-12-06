import { create } from 'zustand';

interface ModalState {
  error: string;
  success: string;
  isModalOpen: boolean;
  setError: (error: string) => void;
  setSuccess: (success: string) => void;
  openModal: () => void;
  closeModal: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  error: '',
  success: '',
  isModalOpen: false,
  setError: (error) => set({ error }),
  setSuccess: (success) => set({ success }),
  openModal: () => set({ isModalOpen: true }),
  closeModal: () => set({ isModalOpen: false }),
}));
