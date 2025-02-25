import { Sessions } from '@/types/dashboard/organization/session';
import { create, StateCreator } from 'zustand';

type SessionState = {
  isDeleteModalOpen: boolean;
  selectedSession: Sessions | null;
  isEditModalOpen: boolean;
  sessionId: string | null;
};

type SessionAction = {
  setIsDeleteModalOpen: (value: boolean) => void;
  setSelectedSession: (value: Sessions) => void;
  setIsEditModalOpen: (value: boolean) => void;
  setSessionId: (value: string | null) => void;
};

const sessionManagementSlice: StateCreator<SessionState & SessionAction> = (
  set,
) => ({
  isDeleteModalOpen: false,
  setIsDeleteModalOpen: (value: boolean) => set({ isDeleteModalOpen: value }),

  selectedSession: null,
  setSelectedSession: (value: Sessions | null) =>
    set({ selectedSession: value }),

  isEditModalOpen: false,
  setIsEditModalOpen: (value: boolean) => value,

  sessionId: null,
  setSessionId: (value: string | null) => value,
});

export const useSessionStore = create<SessionState & SessionAction>(
  sessionManagementSlice,
);
