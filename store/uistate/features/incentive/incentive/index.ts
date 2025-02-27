import { create, StateCreator } from 'zustand';

export interface AllIncentiveData {
  recognition: string;
  employee_name: string;
  role: string;
  criteria: string;
  bonus: string;
  status: string;
}

export interface ProjectIncentiveData {
  recognition: string;
  employee_name: string;
  criteria: string;
  milestone_amount: number;
  project: string;
  earned_scheduled: number;
  at: number;
  spi: number;
}

export interface RecognitionData {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  recognitionTypeId: string;
  expression: string;
  tenantId: string;
}

export interface ProjectIncentiveSettingParams {
  id?: string;
  name: string;
  recognition_criteria?: React.ReactNode;
  action?: JSX.Element;
}
export interface IncentiveSettingParams {
  id: string;
  name: string;
  recognition_criteria: JSX.Element;
  action: JSX.Element;
}
export interface OtherIncentiveSettingParams {
  id?: string;
  name: string;
  recognition_criteria: React.ReactNode;
  action?: JSX.Element;
}

export interface RecordType {
  id: string;
  fiscalYear: string;
  status: string;
  categories: string[];
  totalAmount: string;
  employeeCount: number;
}
export interface Records {
  Records: RecordType[];
}
interface SearchParams {
  employee_name: string;
  byProject: string;
  byRecognition: string;
  byYear: string;
  bySession: string;
  byMonth: string;
}

export type CertificateDetails = {
  details: string;
  title: string;
};

export type RecognitionCriteria = {
  active: boolean;
  condition: string;
  createdAt: string;
  createdBy?: string | null;
  criterionKey: string;
  deletedAt?: string | null;
  id: string;
  operator: string;
  recognitionTypeId: string;
  tenantId: string;
  updatedAt: string;
  updatedBy?: string | null;
  value: number;
  weight: number;
};

export type RecognitionType = {
  details: string;
  title: string;
  createdAt: string;
  createdBy?: string | null;
  deletedAt?: string | null;
  departmentId: string;
  description: string;
  frequency: string;
  id: string;
  isMonetized: boolean;
  name: string;
  parentTypeId?: string | null;
  recognitionCriteria: RecognitionCriteria[];
};

export type IncentiveRecognitionParams = {
  calendarId: string;
  certificateDetails: CertificateDetails;
  createdAt: string;
  createdBy?: string | null;
  criteriaVerified: boolean;
  dataImportId?: string | null;
  dateIssued: string;
  deletedAt?: string | null;
  id: string;
  isAutomated: boolean;
  issuerId: string;
  monetizedValue?: number | null;
  monthId: string;
  recipientId: string;
  recognitionType: RecognitionType;
};

export interface ProjectData {
  createdAt: string;
  deletedAt: string | null;
  description: string;
  id: string;
  name: string;
  recognitionTypeId: string;
  sourceEndpoint: string | null;
  sourceType: string;
  updatedAt: string;
}

type IncentiveState = {
  searchParams: SearchParams;
  currentPage: number;
  pageSize: number;
  openIncentiveDrawer: boolean;
  file: any;
  activeKey: string;
  isPayrollView: boolean;
  showGenerateModal: boolean;
  projectDrawer: boolean;
  deleteIncentive: boolean;
  incentiveId: string;
  rockStarDrawer: boolean;
  otherIncentive: any;
  incentive: any;
  formula: any;
  value: string;
  menuItems: any[];
  currentItem: string;
  isSwitchOn: boolean;
};

type IncentiveActions = {
  setSearchParams: (key: keyof SearchParams, value: string | boolean) => void;
  setCurrentPage: (currentPage: number) => void;
  setPageSize: (pageSize: number) => void;
  setOpenIncentiveDrawer: (open: boolean) => void;
  setFile: (file: string) => void;
  setActiveKey: (key: string) => void;
  setIsPayrollView: (value: boolean) => void;
  setShowGenerateModal: (value: boolean) => void;
  setProjectDrawer: (value: boolean) => void;
  setDeleteIncentive: (value: boolean) => void;
  setIncentiveId: (value: string) => void;
  setRockStarDrawer: (value: boolean) => void;
  setOtherIncentive: (item: any) => void;
  setIncentive: (item: any) => void;
  setFormula: (item: any) => void;
  setValue: (item: string) => void;
  setCurrentItem: (item: string) => void;
  setMenuItems: (items: any[]) => void;
  setIsSwitchOn: (value: boolean) => void;
};

const incentiveSlice: StateCreator<IncentiveState & IncentiveActions> = (
  set,
) => ({
  searchParams: {
    employee_name: '',
    byProject: '',
    byRecognition: '',
    byYear: '',
    bySession: '',
    byMonth: '',
  },
  setSearchParams: (key, value) =>
    set((state) => ({
      searchParams: { ...state.searchParams, [key]: value },
    })),

  currentPage: 1,
  setCurrentPage: (currentPage) => set({ currentPage }),

  pageSize: 10,
  setPageSize: (pageSize) => set({ pageSize }),

  openIncentiveDrawer: false,
  setOpenIncentiveDrawer: (openIncentiveDrawer) => set({ openIncentiveDrawer }),

  file: null,
  setFile: (file) => set({ file }),

  activeKey: '1',
  setActiveKey: (activeKey) => set({ activeKey }),

  isPayrollView: false,
  setIsPayrollView: (isPayrollView) => set({ isPayrollView }),

  showGenerateModal: false,
  setShowGenerateModal: (showGenerateModal) => set({ showGenerateModal }),

  projectDrawer: false,
  setProjectDrawer: (projectDrawer) => set({ projectDrawer }),

  deleteIncentive: false,
  setDeleteIncentive: (deleteIncentive) => set({ deleteIncentive }),

  incentiveId: '',
  setIncentiveId: (incentiveId) => set({ incentiveId }),

  rockStarDrawer: false,
  setRockStarDrawer: (rockStarDrawer) => set({ rockStarDrawer }),

  otherIncentive: null,
  setOtherIncentive: (otherIncentive) => set({ otherIncentive }),

  incentive: null,
  setIncentive: (incentive) => set({ incentive }),

  formula: [],
  setFormula: (newFormula) => set({ formula: newFormula }),

  value: 'Fixed',
  setValue: (value) => set({ value }),

  menuItems: [],
  setMenuItems: (menuItems) => set({ menuItems }),

  currentItem: '',
  setCurrentItem: (currentItem) => set({ currentItem }),

  isSwitchOn: false,
  setIsSwitchOn: (isSwitchOn) => set({ isSwitchOn }),
});

export const useIncentiveStore = create<IncentiveState & IncentiveActions>(
  incentiveSlice,
);
