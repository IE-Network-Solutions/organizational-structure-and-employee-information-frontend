export interface OKRProps {
  keyValue: KeyResult;
  index: number;
  objective: any;
  isEdit: boolean;
  form?: any;
}

export interface JobInformation {
  id: string;
  departmentId: string;
  department?: { name: string };
  position?: { name: string };
}
export interface User {
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  profileImage: string;
  employeeJobInformation: JobInformation[];
}

export interface Milestone {
  id?: string;
  title: string;
  weight: number;
  status?: string;
}

export interface MetricType {
  id: string | number;
  name: string;
  description: number;
}

export interface KeyResult {
  id: string;
  key_type: string;
  metricTypeId: string;
  metricType?: MetricType;
  previousMetricTypeId?: string;
  title: string;
  weight: number;
  deadline: any;
  progress?: number;
  initialValue: number;
  currentValue?: number;
  targetValue: number | string;
  milestones: Milestone[];
  isAISuggestion?: boolean;
}

export interface Objective {
  id?: string;
  allignedKeyResultId?: string | null;
  title: string;
  deadline: string;
  userId: string;
  daysLeft?: number;
  completedKeyResults?: number;
  objectiveProgress?: number;
  keyResults?: KeyResult[] | any;
  user?: User;
  keyResultValue?: KeyResult[] | any;
  isClosed: boolean;
  sessionId?: string;
}
export const defaultObjective: Objective = {
  allignedKeyResultId: '',
  title: '',
  deadline: '',
  userId: '',
  daysLeft: 0,
  completedKeyResults: 0,
  objectiveProgress: 0,
  keyResults: [],
  keyResultValue: [],
  isClosed: false,
};
interface SearchObjParams {
  userId: string;
  metricTypeId: string;
  departmentId: string;
}
interface EmployeeSearchObjParams {
  userId: string;
  metricTypeId: string;
  departmentId: string;
}
export interface OKRProps {
  keyValue: KeyResult;
  index: number;
  objective: any;
  isEdit: boolean;
  form?: any;
}

export interface OKRFormProps {
  keyItem: KeyResult;
  index: number;
  updateKeyResult: (index: number, field: keyof KeyResult, value: any) => void;
  removeKeyResult: (index: number) => void;
  addKeyResultValue: (value: any) => void;
  keyResults?: KeyResult;
  /** When true, on mobile render the form inline (e.g. inside OKR Create Objective bottom sheet) instead of card + separate drawer */
  embedInOkrSheet?: boolean;
  /** When true, weight input is disabled (e.g. in Edit KR modal) */
  disableWeightEdit?: boolean;
  /** Called when Save succeeds (e.g. to collapse inline edit back to card view) */
  onSaveSuccess?: () => void;
}
export interface ObjectiveProps {
  objective: Objective;
  myOkr: boolean;
}
export interface OKRState {
  isVP: boolean;
  toggleDashboard: () => void;

  revenue: number;
  financialSales: number;
  progressRevenue: number;
  progressSales: number;

  selectedPeriodId: string;
  setSelectedPeriodId: (value: string) => void;

  selectedCard: string | null;
  setSelectedCard: (selectedCard: string | null) => void;

  keyResultValue?: KeyResult[] | any;
  setKeyResultValue: (keyResultValue: KeyResult[]) => void;
  keyResults?: KeyResult[];
  objective: Objective;
  objectiveValue: Objective;
  keyResultId: string;
  objectiveId: string;
  setObjective: (objective: Objective) => void;
  setObjectiveValue: (objectiveValue: Objective) => void;
  setKeyResult: (keyResult: KeyResult[]) => void;
  setKeyResultId: (keyResultId: string) => void;
  setObjectiveId: (objectiveId: string) => void;
  addKeyResult: (
    keyType?: string,
    metricTypeId?: string,
    suggestion?: Partial<KeyResult> & { milestones?: Milestone[] },
  ) => void;
  addKeyResultValue: (value: any) => void;
  handleKeyResultChange: (value: any, index: number, field: string) => void;
  handleSingleKeyResultChange: (value: any, field: string) => void;

  selectedMetric: any;
  setSelectedMetric: (selectedMetric: any) => void;

  handleMilestoneChange: (
    value: any,
    keyResultIndex: number,
    milestoneId: any,
    field: string,
  ) => void;
  handleMilestoneSingleChange: (
    value: any,
    milestoneId: any,
    field: string,
  ) => void;
  updateKeyResult: (index: number, field: keyof KeyResult, value: any) => void;
  updateKeyResultFields: (index: number, fields: Partial<KeyResult>) => void;
  removeKeyResult: (index: number) => void;
  removeKeyResultValue: (index: number) => void;
  searchObjParams: SearchObjParams;
  setSearchObjParams: (key: keyof SearchObjParams, value: string) => void;
  employeeSearchObjParams: EmployeeSearchObjParams;
  setEmployeeSearchObjParams: (
    key: keyof EmployeeSearchObjParams,
    value: string,
  ) => void;
  pageSize: number;
  currentPage: number;
  setPageSize: (pageSize: number) => void;
  teamPageSize: number;
  setTeamPageSize: (teamPageSize: number) => void;
  teamCurrentPage: number;
  setTeamCurrentPage: (teamCurrentPage: number) => void;
  setCurrentPage: (currentPage: number) => void;
  teamUserId?: number;
  setTeamUserId?: (teamUserId: number) => void;

  companyPageSize: number;
  companyCurrentPage: number;
  setCompanyPageSize: (companyPageSize: number) => void;
  setCompanyCurrentPage: (companyCurrentPage: number) => void;
  employeePageSize: number;
  employeeCurrentPage: number;
  setEmployeePageSize: (employeePageSize: number) => void;
  setEmployeeCurrentPage: (employeeCurrentPage: number) => void;
  okrTab: number | string;
  setOkrTab: (okrTab: number | string) => void;
  alignment: boolean;
  setAlignment: (alignment: boolean) => void;
  fiscalYearId: string;
  setFiscalYearId: (fiscalYearId: string) => void;
  sessionIds: string[];
  setSessionIds: (sessionId: string[]) => void;
  employeeFiscalYearId: string;
  setEmployeeFiscalYearId: (employeeFiscalYearId: string) => void;
  employeeSessionIds: string[];
  setEmployeeSessionIds: (sessionIds: string[]) => void;
  deletedKeyResultIds: string[];
  setDeletedKeyResultIds: (ids: string[]) => void;
  deletedMilestoneIds: string[];
  setDeletedMilestoneIds: (ids: string[]) => void;
  okrMode: 'Basic' | 'Advanced' | null;
  setOkrMode: (mode: 'Basic' | 'Advanced' | null) => void;
  okrModalSelectedMode: 'Basic' | 'Advanced' | null;
  setOkrModalSelectedMode: (mode: 'Basic' | 'Advanced' | null) => void;
  okrModalIsSaving: boolean;
  setOkrModalIsSaving: (isSaving: boolean) => void;
}
