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
}
export interface User {
  firstName: string;
  lastName: string;
  email: string;
  profileImage: string;
  employeeJobInformation: JobInformation[];
}

export interface Milestone {
  id?: string;
  title: string;
  weight: number;
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
  title: string;
  weight: number;
  deadline: any;
  progress?: number;
  initialValue: number;
  targetValue: number | string;
  milestones: Milestone[];
}

export interface Objective {
  id?: string;
  allignedKeyResultId?: string;
  title: string;
  deadline: string;
  userId: string;
  daysLeft?: number;
  completedKeyResults?: number;
  objectiveProgress?: number;
  keyResults?: KeyResult[] | any;
  user?: User;
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
};
interface SearchObjParams {
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

  keyResultValue?: KeyResult[] | any;
  setKeyResultValue: (keyResultValue: KeyResult[]) => void;
  keyResults?: KeyResult[];
  objective: Objective;
  objectiveValue: Objective;
  setObjective: (objective: Objective) => void;
  setObjectiveValue: (objectiveValue: Objective) => void;
  setKeyResult: (keyResult: KeyResult[]) => void;
  addKeyResult: () => void;
  addKeyResultValue: (value: any) => void;
  handleKeyResultChange: (value: any, index: number, field: string) => void;
  handleSingleKeyResultChange: (value: any, field: string) => void;
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
  removeKeyResult: (index: number) => void;
  removeKeyResultValue: (index: number) => void;
  searchObjParams: SearchObjParams;
  setSearchObjParams: (key: keyof SearchObjParams, value: string) => void;
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
  okrTab: number | string;
  setOkrTab: (okrTab: number | string) => void;
}
