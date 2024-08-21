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
  terminationType?: string;
  terminationReason?: string;
  eligibleForRehire?: string;
}
