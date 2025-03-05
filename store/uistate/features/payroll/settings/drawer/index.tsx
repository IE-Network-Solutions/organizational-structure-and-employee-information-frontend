import { create } from "zustand";

interface EditDrawerState {
  id: string;
  startDate: string;
  endDate: string;
  visible: boolean;
  setId: (id: string) => void;
  setStartDate: (startDate: string) => void;
  setEndDate: (endDate: string) => void;
  setVisible: (visible: boolean) => void;
  reset: () => void;
}

const useEditDrawerStore = create<EditDrawerState>((set) => ({
  id: "",
  startDate: "",
  endDate: "",
  visible: false,
  setId: (id) => set({ id }),
  setStartDate: (startDate) => set({ startDate }),
  setEndDate: (endDate) => set({ endDate }),
  setVisible: (visible) => set({ visible }),
  reset: () => set({ id: "", startDate: "", endDate: "", visible: false }),
}));

export default useEditDrawerStore;
