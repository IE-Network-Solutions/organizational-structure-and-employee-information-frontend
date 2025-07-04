import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface UserState {
  recognitionType: string | '';
  setRecognitionType: (recognitionType: string | '') => void;
  status: boolean | null;
  setStatus: (status: boolean | null) => void;
}
export const useDashboardIncentiveStore = create<UserState>()(
  devtools((set) => ({
    recognitionType: '',
    setRecognitionType: (recognitionType: string | '') =>
      set({ recognitionType: recognitionType }),
    status: null,
    setStatus: (status: boolean | null) => set({ status: status }),
  })),
);
