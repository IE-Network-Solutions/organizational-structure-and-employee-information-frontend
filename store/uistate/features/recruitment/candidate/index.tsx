import { create } from 'zustand';

interface CandidateState {
  documentFileList: any[];
  setDocumentFileList: (fileList: any[]) => void;
  removeDocument: (uid: string) => void;

  createJobDrawer: boolean;
  setCreateJobDrawer: (value: boolean) => void;

  isClient: boolean;
  setIsClient: (value: boolean) => void;
}

export const useCandidateState = create<CandidateState>((set) => ({
  documentFileList: [],
  setDocumentFileList: (fileList) => set({ documentFileList: fileList }),
  removeDocument: (uid) =>
    set((state) => ({
      documentFileList: state.documentFileList.filter(
        (file) => file.uid !== uid,
      ),
    })),

  createJobDrawer: false,
  setCreateJobDrawer: (value) => set({ createJobDrawer: value }),

  isClient: false,
  setIsClient: (value) => set({ isClient: value }),
}));
