export interface EmployeeData {
  id: string;
  name: string;
  position: string;
  manager: string;
  avatar: string;
}

export interface EmploymentStatusUpdate {
  effectiveDate: string;
  status: string;
  type: string;
  reason: string;
  eligibleForRehire: string;
  comment?: string;
  userId: string;
}

export interface EmployeeOffBoardingTasks {
  approverId: string;
  description: string;
  title: string;
  employeeeTerminationId: string;
}

export interface EmployeeOffBoardingTemplateTasks {
  approverId: string;
  description: string;
  title: string;
}
export interface OffBoardingTasksUpdateStatus {
  id: string;
  isCompleted: boolean;
}
