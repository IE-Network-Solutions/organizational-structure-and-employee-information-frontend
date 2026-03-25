export interface OrgChart {
  id?: string;
  name: string;
  description: string;
  branchId: string;
  department: Department[];
  [key: string]: any;
}

export interface Department {
  id: string;
  branchId: string;
  name: string;
  description: string;
  department: Department[];
}

/** Child item in department[] for PATCH payload (minimal shape from API). */
export interface DepartmentChildItem {
  id?: string;
  name: string;
  branchId: string;
  description: string;
}

/** Full department body for PATCH /departments/:id (preserves API fields, department = children). */
export interface DepartmentPatchBody {
  id: string;
  name: string;
  description: string;
  branchId: string;
  department: DepartmentChildItem[];
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  createdBy?: string | null;
  updatedBy?: string | null;
  deletedBy?: string | null;
  tenantId?: string;
  level?: number;
  [key: string]: unknown;
}

export interface OrgChartResponse {
  data: OrgChart;
}

/** User-tree API: department with employee/role info */
export interface UserTreeRole {
  id: string;
  name: string;
  slug?: string;
  description?: string;
}

export interface UserTreeUser {
  id: string;
  firstName: string;
  middleName?: string | null;
  lastName?: string | null;
  profileImage?: string | null;
  profileImageDownload?: string | null;
  email?: string;
  role?: UserTreeRole | null;
}

export interface UserTreeEmployeeJob {
  id: string;
  userId: string;
  departmentId: string;
  departmentLeadOrNot?: boolean;
  user?: UserTreeUser | null;
  position?: { id?: string; name: string } | null;
}

export interface DepartmentUserTree {
  id: string;
  name: string;
  description?: string | null;
  branchId?: string | null;
  level?: number;
  employeeJobInformation?: UserTreeEmployeeJob[];
  department: DepartmentUserTree[];
  /** Count of users without team lead in this department (for last-level badge). */
  usersWithoutTeamLeadCount?: number;
  /** Hex color for card accent bar (e.g. #1E40AF). */
  departmentColor?: string | null;
}

/** User in department (users-without-team-lead response item) */
export interface DepartmentStaffUser {
  id?: string;
  userId?: string;
  firstName?: string;
  middleName?: string | null;
  lastName?: string | null;
  profileImage?: string | null;
  profileImageDownload?: string | null;
  email?: string;
  role?: { id: string; name: string } | null;
  position?: { id: string; name: string } | null;
  employeeJobInformation?: { position?: { id?: string; name: string } }[];
  [key: string]: unknown;
}
