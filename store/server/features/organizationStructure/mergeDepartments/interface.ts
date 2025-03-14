export interface UpdateDepartmentChild {
  id: string;
}

export interface MergingDepartment {
  id: string;
  name: string;
  description?: string;
  branchId: string;
  departmentToDelete: string[];
  department: UpdateDepartmentChild[];
}
