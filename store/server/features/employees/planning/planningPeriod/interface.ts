export interface PlanningPeriod {
  name: string;
  intervalLength: string;
  intervalType: string;
  actionOnFailure?: string; // Optional property
  submissionDeadline: string;
}

type IntervalLength = {
  days?: number;
  seconds?: number;
};

type SubmissionDeadline = {
  days?: number;
};

export type PlanningPeriodItem = {
  name: string;
  intervalLength: IntervalLength;
  intervalType: string;
  submissionDeadline: SubmissionDeadline;
  actionOnFailure: string;
  isActive: boolean;
};
type Item = {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  name: string;
  tenantId: string;
  intervalLength: IntervalLength;
  intervalType: string;
  submissionDeadline: SubmissionDeadline;
  actionOnFailure: string;
  isActive: boolean;
};

type Meta = {
  totalItems: number;
  itemCount: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
};

export type ResponsePlanningPeriod = {
  items: Item[];
  meta: Meta;
};

export type PlanningPeriodUser = {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  userId: string;
  tenantId: string;
  planningPeriodId: string;
  planningPeriod?: PlanningPeriod;
};

// Type for the array of PlanningPeriodUser
export type PlanningPeriodUserArray = PlanningPeriodUser[];

type MetaData = {
  totalItems: number;
  itemCount: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
};

export type PaginatedPlanningPeriodUsers = {
  items: PlanningPeriodUser[];
  meta: MetaData;
};

export interface GroupedUser {
  userId: string;
  items: PlanningPeriodUser[];
}
export interface PlanningUserPayload {
  userIds: string[];
  planningPeriodIds: string[];
}

export type UpdatePlanningPeriodFunction = (
  userId: string,
  values: PlanningUserPayload,
) => Promise<any>;
