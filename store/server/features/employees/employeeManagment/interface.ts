export interface DeleteGroupPermissionProps {
  deletedId: string;
  setCurrentModal: any;
  setDeletedId: any;
}

export interface UpdatePermissionGroupArgs {
  values: any;
  permissionGroupId: string;
}

export interface CreateEmployeeJobInformation {
  userId: string;
  branchId: string;
  departmentId: string;
  departmentLeadOrNot: boolean;
  employmentContractType: string;
  employmentTypeId: string;
  jobTitle: string;
  workScheduleId: string;
  joinedDate: string;
  effectiveEndDate: string | null;
}
