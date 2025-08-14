export type PlanningPeriod = {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  name: string;
  tenantId: string;
  isActive: boolean;
  intervalLength: number;
  intervalType: string;
  submissionDeadline: string;
  actionOnFailure: string;
};

export type PlanningPeriodItem = {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  userId: string;
  tenantId: string;
  planningPeriodId: string;
  planningPeriod: PlanningPeriod;
};

export type PlanningUser = {
  userId: string;
  planningPeriod: PlanningPeriodItem[];
};
