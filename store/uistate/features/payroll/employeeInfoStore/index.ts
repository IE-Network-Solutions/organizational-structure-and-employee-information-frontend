import create from 'zustand';


interface BankInformation {
  bankName: string;
  accountNumber: string;
}
interface VariablePay {
  amount:  string; 
  type: "VP"; 
}

interface Allowances {
  amount:  string; 
  type: string; 
}
interface TotalDeductionWithPension {
  amount:  string; 
  type: string; 
}
interface Merits {
  amount:  string; 
  type: string; 
}
interface Pension {
  amount:  string; 
  type: string; 
}


interface Breakdown {
  allowances: Allowances[]; 
  totalDeductionWithPension: TotalDeductionWithPension[]; 
  merits: Merits[]; 
  pension: Pension[]; 
  variablePay:VariablePay
  tax: any; 
  employeeId: string; 
  employeeInfo: EmployeeInfo;
  grossSalary: string; 
  id: string; 
  netPay: string; 
  payPeriodId: string; 
  status: "PENDING" | "COMPLETED" | "FAILED"; 
  totalAllowance: string; 
  totalDeductions: string; 
  totalMerit: string; 
  updatedAt: string; 
  updatedBy: string | null; 
}
interface Address {
  phoneNumber: string; 
  subCity: string; 
}

interface EmployeeJobInformation {
  id: string;
  positionId: string;
  userId: string;
  branchId: string;
  addresses:Address;
  isPositionActive: boolean;
  effectiveStartDate: string;
  effectiveEndDate: string | null;
  employementTypeId: string;
  departmentId: string;
  departmentLeadOrNot: boolean;
  jobAction: string;
  workScheduleId: string;
  tenantId: string;
  bankInformation:BankInformation;
  employementType: {
    id: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    createdBy: string | null;
    updatedBy: string | null;
    name: string;
    description: string | null;
    tenantId: string;
  };
  branch: {
    id: string;
    createdAt: string;
    updatedAt: string;
    name: string;
    description: string;
    location: string;
    contactNumber: string | null;
    contactEmail: string | null;
    tenantId: string;
  };
  position: {
    id: string;
    createdAt: string;
    updatedAt: string;
    name: string;
    description: string | null;
    tenantId: string;
  };
  department: {
    id: string;
    createdAt: string;
    updatedAt: string;
    name: string;
    description: string;
    branchId: string;
    tenantId: string;
    level: number;
  };
  workSchedule: {
    id: string;
    createdAt: string;
    updatedAt: string;
    name: string;
    detail: Array<{
      id: string;
      dayOfWeek: string;
      startTime: string;
      endTime: string;
      hours: number;
      status: boolean;
    }>;
    tenantId: string;
  };
}

interface BasicSalary {
  id: string;
  createdAt: string;
  updatedAt: string;
  basicSalary: string; 
  jobInfoId: string;
  status: boolean;
  userId: string;
  tenantId: string;
}



interface EmployeeInfo {
  email: string;
  phoneNumber: string;
  subCity: string;
  address?: string; 
  emergencyContact: {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    gender: string;
  } | null;
  bankInformation: {
    accountNumber: string;
    bankName: string;
  };
  basicSalaries:BasicSalary[];
  dateOfBirth: string;
  maritalStatus: string | null;
  nationalityId: string;
  joinedDate: string;
  employeeDocument: any[]; 
  additionalInformation?: any; 
  employeeAttendanceId: string;
  employeeInformation: EmployeeJobInformation;
  employeeJobInformation: EmployeeJobInformation[];
  gender: string;
  id: string;
  nationality: {
    id: string;
  };
  tenantId: string;
  updatedAt: string;
  updatedBy: string | null;
  userId: string;
  lastName: string;
  firstName: string;
  middleName: string;
  profileImage: string | null;
  profileImageDownload: string | null;
}


interface ActiveMergedPayroll {
  breakdown:Breakdown;
  createdAt: string;
  createdBy: string | null;
  deletedAt: string | null;
  employeeId: string;
  employeeInfo: EmployeeInfo;
  employeeJobInformation: EmployeeJobInformation[];
  firebaseId: string;
  firstName: string;
  lastName: string;
  middleName: string;
  profileImage: string;
  profileImageDownload: string;
  reportingTo: { id: string; name: string };
  role: { id: string; name: string };
  grossSalary: string;
  netPay: string;
  payPeriodId: string;
  status: string; // 'PENDING', 'COMPLETED', etc.
  totalAllowance: string;
  totalDeductions: string;
  totalMerit: string;
  tenantId: string;
  updatedAt: string;
  updatedBy: string | null;
  userPermissions: any[]; 
}
interface PayPeriod {
  id: string;
  startDate: string; 
  endDate: string; 
  status: "OPEN" | "CLOSED"; 
  activeFiscalYearId: string; 
  tenantId: string; 
}


interface PayrollState {
  activeMergedPayroll: ActiveMergedPayroll | null;
  mergedPayroll: ActiveMergedPayroll[];
  activePayPeriod: PayPeriod | null;
  setActiveMergedPayroll: (payroll: ActiveMergedPayroll) => void;
  setMergedPayroll: (payroll: ActiveMergedPayroll[]) => void;
  setActivePayPeriod: (payPeriod: PayPeriod) => void;
}

const useEmployeeStore = create<PayrollState>((set) => ({
  activeMergedPayroll: null,
  mergedPayroll: [],
  activePayPeriod: null,

  setActiveMergedPayroll: (data: ActiveMergedPayroll) =>
    set({ activeMergedPayroll: data }),
  setMergedPayroll: (data: ActiveMergedPayroll[]) =>
    set({ mergedPayroll: data }),
  setActivePayPeriod: (data: PayPeriod | null) =>
    set({ activePayPeriod: data }),
}));

export default useEmployeeStore;
