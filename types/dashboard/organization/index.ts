// // Define the BranchType
// export interface BranchType {
//     id: string;
//     name: string;
//     location?: string;
//   }

//   // Define the DepartmentType
//   export interface DepartmentType {
//     id?: string;
//     name: string;
//     branchId: string;
//     description?: string;
//   }

//   export interface DepartmentFormProps {
//     onClose: () => void;
//     open: boolean;
//     submitAction: (values: any) => void;
//     departmentData?: DepartmentType | null;
//     title: string;
//     branches: BranchType[];
//   }

//   export interface OrgData {
//     name: string;
//     description: string;
//     branchId: string;
//     department: Department[];
//   }

// export interface Department {
//     branchId: string;
//     name: string;
//     description: string;
//     department: Department[];
//     collapsed?: boolean;
//   }

//   export interface OrganizationState {
//     orgData: OrgData;
//     isFormVisible: boolean;
//     isDeleteConfirmVisible: boolean;
//     selectedDepartment: Department | null;
//     parentId: string | null;

//     setOrgData: (orgData: OrgData) => void;
//     addDepartment: (parentId: string, department: Department) => void;
//     updateDepartment: (updatedDepartment: Department) => void;
//     deleteDepartment: (departmentId: string) => void;
//     setIsFormVisible: (isFormVisible: boolean) => void;
//     setSelectedDepartment: (department: Department | null) => void;
//     setParentId: (parentId: string | null) => void;
//     setIsDeleteConfirmVisible: (isFormVisible: boolean) => void;
//   }

// Define the BranchType
export interface BranchType {
  id: string;
  name: string;
  location?: string;
}

// Define the DepartmentType
export interface DepartmentType {
  id?: string; // Updated to id instead of branchId
  name: string;
  branchId: string;
  description?: string;
}

export interface DepartmentFormProps {
  onClose: () => void;
  open: boolean;
  submitAction: (values: any) => void;
  departmentData?: Department | null | undefined;
  title: string;
}

// Define OrgData
export interface OrgData {
  name: string;
  description: string;
  branchId?: string | null; // This should be updated if necessary to reflect the new structure
  department: Department[];
  [key: string]: any;
}

// Define Department with id
export interface Department {
  id: string;
  branchId?: string | null;
  name: string;
  description: string;
  department: Department[];
  collapsed?: boolean;
}

// Define OrganizationState
export interface OrganizationState {
  orgData: OrgData;
  isFormVisible: boolean;
  isDeleteConfirmVisible: boolean;
  selectedDepartment: Department | null;
  parentId: string | null;

  setOrgData: (orgData: OrgData) => void;
  addDepartment: (parentId: string, department: Omit<Department, 'id'>) => void; // Adjusted to omit id
  updateDepartment: (updatedDepartment: Department) => void;
  deleteDepartment: (departmentId: string) => void;
  setIsFormVisible: (isFormVisible: boolean) => void;
  setSelectedDepartment: (department: Department | null) => void;
  setParentId: (parentId: string | null) => void;
  setIsDeleteConfirmVisible: (isDeleteConfirmVisible: boolean) => void;
}
