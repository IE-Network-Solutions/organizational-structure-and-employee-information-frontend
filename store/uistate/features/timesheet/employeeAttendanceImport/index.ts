import create from 'zustand';

// Define Zustand store
interface AttendanceImportErrorModalState {
  isVisible: boolean;
  message: { line: number; error: string }[] | null;
  showModal: (message: { line: number; error: string }[]) => void;
  closeModal: () => void;
}

const useAttendanceImportErrorModalStore =
  create<AttendanceImportErrorModalState>((set) => ({
    isVisible: false,
    message: null,
    showModal: (message: { line: number; error: string }[]) =>
      set({ isVisible: true, message }),
    closeModal: () => set({ isVisible: false, message: null }),
  }));

export default useAttendanceImportErrorModalStore;
