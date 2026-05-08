export interface AverageOkrRuleAssignment {
  id?: string;
  userId?: string;
  averageOkrRuleId?: string;
  averageOkrRule?: {
    id?: string;
    title?: string;
  } | null;
  user?: {
    id?: string;
    firstName?: string;
    middleName?: string;
    lastName?: string;
    profileImage?: string;
    employee_status?: string;
    deletedAt?: string | null;
    employeeJobInformation?: Array<{
      isPositionActive?: boolean;
      departmentLeadOrNot?: boolean;
      position?: {
        name?: string;
      };
      department?: {
        name?: string;
      };
    }>;
  } | null;
}

export interface AverageOkrRuleAssignmentState {
  open: boolean;
  openDeleteModal: boolean;
  deletedId: string;
  assignment: AverageOkrRuleAssignment | null;
  setOpen: (value: boolean) => void;
  setOpenDeleteModal: (value: boolean) => void;
  setDeletedId: (value: string) => void;
  setAssignment: (value: AverageOkrRuleAssignment | null) => void;
}
