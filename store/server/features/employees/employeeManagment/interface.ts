export interface DeleteGroupPermissionProps {
  deletedId: string;
  setCurrentModal: any;
  setDeletedId: any;
}

export interface UpdatePermissionGroupArgs {
  values: any;
  permissionGroupId: string;
}

export interface CreateEmployeeJobInformationInterface {
  userId: string;
  branchId: string;
  departmentId: string;
  positionId: string;
  employementTypeId: string;
  departmentLeadOrNot: boolean;
  employmentContractType: string;
  employmentTypeId: string;
  jobTitle: string;
  workScheduleId: string;
  joinedDate: string;
  effectiveEndDate: string | null;
  basicSalary: number;
  positionId: string;
  employementTypeId: string;
}
