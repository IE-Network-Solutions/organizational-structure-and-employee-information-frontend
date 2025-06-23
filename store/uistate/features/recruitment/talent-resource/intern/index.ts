import { create } from 'zustand';

export interface InternData {
  fullName: string;
  email: string;
  phoneNumber: string;
  department: string;
  role: string;
  status: string;
  resumeUrl: string;
  id?: string;
}

interface SearchParams {
  fullName: string;
  dateRange: string;
  selectedDepartment: string;
}
interface InternState {
  documentFileList: any[];
  setDocumentFileList: (fileList: any[]) => void;
  removeDocument: (uid: string) => void;

  createInternDrawer: boolean;
  setCreateInternDrawer: (value: boolean) => void;

  currentPage: number;
  pageSize: number;
  setCurrentPage: (value: number) => void;
  setPageSize: (value: number) => void;

  searchParams: SearchParams;
  setSearchParams: (key: keyof SearchParams, value: string | boolean) => void;

  internDetailDrawer: boolean;
  setInternDetailDrawer: (value: boolean) => void;

  selectedIntern: any | null;
  setSelectedIntern: (intern: any | null) => void;

  selectedInternId: string;
  setSelectedInternID: (internId: string) => void;

  editInternModal: boolean;
  setEditInternModal: (value: boolean) => void;
  editIntern: any | null;
  setEditIntern: (intern: any | null) => void;

  deleteInternId: string;
  setDeleteInternId: (value: string) => void;
  deleteInternModal: boolean;
  setDeleteInternModal: (value: boolean) => void;

  isSmallScreen: boolean;
  setIsSmallScreen: (value: boolean) => void;

  showMobileFilter: boolean;
  setShowMobileFilter: (value: boolean) => void;

  selectedRowKeys: React.Key[];
  setSelectedRowKeys: (keys: React.Key[]) => void;
  clearSelectedRowKeys: () => void;

  isEdit: boolean;
  setIsEdit: (value: boolean) => void;

  editInternData: any;
  setEditInternData: (data: any) => void;

  itemToDelete: any;
  setItemToDelete: (data: any) => void;
  
}

export const useInternStore = create<InternState>((set) => ({
  documentFileList: [],
  setDocumentFileList: (fileList) => set({ documentFileList: fileList }),
  removeDocument: (uid) =>
    set((state) => ({
      documentFileList: state.documentFileList.filter(
        (file) => file.uid !== uid,
      ),
    })),

  createInternDrawer: false,
  setCreateInternDrawer: (value) => set({ createInternDrawer: value }),

  searchParams: {
    fullName: '',
    dateRange: '',
    selectedDepartment: '',
  },
  setSearchParams: (key, value) => {
    const stringValue = typeof value === 'boolean' ? String(value) : value;
    set((state) => ({
      searchParams: { ...state.searchParams, [key]: stringValue },
    }));
  },

  currentPage: 1,
  pageSize: 10,
  setCurrentPage: (value) => set({ currentPage: value }),
  setPageSize: (value) => set({ pageSize: value }),

  internDetailDrawer: false,
  setInternDetailDrawer: (value) => set({ internDetailDrawer: value }),

  selectedIntern: null,
  setSelectedIntern: (value) => set({ selectedIntern: value }),

  selectedInternId: '',
  setSelectedInternID: (value) => set({ selectedInternId: value }),

  editInternModal: false,
  setEditInternModal: (value) => set({ editInternModal: value }),
  editIntern: null,
  setEditIntern: (value) => set({ editIntern: value }),

  deleteInternId: '',
  setDeleteInternId: (value) => set({ deleteInternId: value }),
  deleteInternModal: false,
  setDeleteInternModal: (value) => set({ deleteInternModal: value }),

  isSmallScreen: false,
  setIsSmallScreen: (value) => set({ isSmallScreen: value }),

  showMobileFilter: false,
  setShowMobileFilter: (value: boolean) => set({ showMobileFilter: value }),

  selectedRowKeys: [],
  setSelectedRowKeys: (keys) => set({ selectedRowKeys: keys }),
  clearSelectedRowKeys: () => set({ selectedRowKeys: [] }),

  isEdit: false,
  setIsEdit: (value) => set({ isEdit: value }),

  editInternData: null,
  setEditInternData: (data) => set({ editInternData: data }),

  itemToDelete: null,
  setItemToDelete: (data) => set({ itemToDelete: data }),
}));
