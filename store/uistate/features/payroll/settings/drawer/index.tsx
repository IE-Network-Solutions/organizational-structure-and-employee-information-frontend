import { create } from 'zustand';

interface EditDrawerState {
  id: string;
  startDate: string;
  endDate: string;
  status: string;
  visible: boolean;
  setId: (id: string) => void;
  setStartDate: (startDate: string) => void;
  setEndDate: (endDate: string) => void;
  setStatus: (status: string) => void;
  setVisible: (visible: boolean) => void;
  reset: () => void;
}

const useEditDrawerStore = create<EditDrawerState>((set) => ({
  id: '',
  startDate: '',
  endDate: '',
  status: '',
  visible: false,
  setId: (id) => set({ id }),
  setStartDate: (startDate) => set({ startDate }),
  setEndDate: (endDate) => set({ endDate }),
  setStatus: (status) => set({ status }),
  setVisible: (visible) => set({ visible }),
  reset: () =>
    set({ id: '', startDate: '', endDate: '', status: '', visible: false }),
}));

export default useEditDrawerStore;
