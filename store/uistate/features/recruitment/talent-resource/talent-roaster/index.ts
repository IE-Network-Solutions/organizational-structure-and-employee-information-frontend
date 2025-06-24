import { create } from 'zustand';

export interface TalentRoasterData {
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
interface TalentRoasterState {
  documentFileList: any[];
  setDocumentFileList: (fileList: any[]) => void;
  removeDocument: (uid: string) => void;

  createTalentRoasterDrawer: boolean;
  setCreateTalentRoasterDrawer: (value: boolean) => void;

  currentPage: number;
  pageSize: number;
  setCurrentPage: (value: number) => void;
  setPageSize: (value: number) => void;

  searchParams: SearchParams;
  setSearchParams: (key: keyof SearchParams, value: string | boolean) => void;

  talentRoasterDetailDrawer: boolean;
  setTalentRoasterDetailDrawer: (value: boolean) => void;

  selectedTalentRoaster: any | null;
  setSelectedTalentRoaster: (talentRoaster: any | null) => void;

  selectedTalentRoasterId: string;
  setSelectedTalentRoasterID: (talentRoasterId: string) => void;

  editTalentRoasterModal: boolean;
  setEditTalentRoasterModal: (value: boolean) => void;
  editTalentRoaster: any | null;
  setEditTalentRoaster: (talentRoaster: any | null) => void;

  deleteTalentRoasterId: string;
  setDeleteTalentRoasterId: (value: string) => void;
  deleteTalentRoasterModal: boolean;
  setDeleteTalentRoasterModal: (value: boolean) => void;

  isSmallScreen: boolean;
  setIsSmallScreen: (value: boolean) => void;

  showMobileFilter: boolean;
  setShowMobileFilter: (value: boolean) => void;

  selectedRowKeys: React.Key[];
  setSelectedRowKeys: (keys: React.Key[]) => void;
  clearSelectedRowKeys: () => void;

  isEdit: boolean;
  setIsEdit: (value: boolean) => void;

  editData: any;
  setEditData: (data: any) => void;

  itemToDelete: any;
  setItemToDelete: (data: any) => void;

  moveToJobPipelineModal: boolean;
  setMoveToJobPipelineModal: (value: boolean) => void;
}

export const useTalentRoasterStore = create<TalentRoasterState>((set) => ({
  documentFileList: [],
  setDocumentFileList: (fileList) => set({ documentFileList: fileList }),
  removeDocument: (uid) =>
    set((state) => ({
      documentFileList: state.documentFileList.filter(
        (file) => file.uid !== uid,
      ),
    })),

  createTalentRoasterDrawer: false,
  setCreateTalentRoasterDrawer: (value) =>
    set({ createTalentRoasterDrawer: value }),

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

  talentRoasterDetailDrawer: false,
  setTalentRoasterDetailDrawer: (value) =>
    set({ talentRoasterDetailDrawer: value }),

  selectedTalentRoaster: null,
  setSelectedTalentRoaster: (value) => set({ selectedTalentRoaster: value }),

  selectedTalentRoasterId: '',
  setSelectedTalentRoasterID: (value) =>
    set({ selectedTalentRoasterId: value }),

  editTalentRoasterModal: false,
  setEditTalentRoasterModal: (value) => set({ editTalentRoasterModal: value }),
  editTalentRoaster: null,
  setEditTalentRoaster: (value) => set({ editTalentRoaster: value }),

  deleteTalentRoasterId: '',
  setDeleteTalentRoasterId: (value) => set({ deleteTalentRoasterId: value }),
  deleteTalentRoasterModal: false,
  setDeleteTalentRoasterModal: (value) =>
    set({ deleteTalentRoasterModal: value }),

  isSmallScreen: false,
  setIsSmallScreen: (value) => set({ isSmallScreen: value }),

  showMobileFilter: false,
  setShowMobileFilter: (value: boolean) => set({ showMobileFilter: value }),

  selectedRowKeys: [],
  setSelectedRowKeys: (keys) => set({ selectedRowKeys: keys }),
  clearSelectedRowKeys: () => set({ selectedRowKeys: [] }),

  isEdit: false,
  setIsEdit: (value) => set({ isEdit: value }),

  editData: null,
  setEditData: (data) => set({ editData: data }),

  itemToDelete: null,
  setItemToDelete: (data) => set({ itemToDelete: data }),

  moveToJobPipelineModal: false,
  setMoveToJobPipelineModal: (value) => set({ moveToJobPipelineModal: value }),
}));
