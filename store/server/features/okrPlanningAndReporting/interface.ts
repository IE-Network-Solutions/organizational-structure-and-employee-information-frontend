export type IntervalLength = {
  days?: number;
  months?: number;
};

export type SubmissionDeadline = {
  days: number;
};

export type Item = {
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
  actionOnFailure: string | null;
};

export type Meta = {
  totalItems: number;
  itemCount: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
};

export type PlanningPeriod = {
  items: Item[];
  meta: Meta;
};

type Interval = {
  days: number;
};

type PlanPeriod = {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  name: string;
  tenantId: string;
  isActive: boolean;
  intervalLength: Interval;
  intervalType: string;
  submissionDeadline: Interval;
  actionOnFailure: string;
};

type AssignedPlanningPeriod = {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  userId: string;
  tenantId: string;
  planningPeriodId: string;
  planningPeriod: PlanPeriod;
  /** When true, reports for this period update KR progress. At most one per user. */
  canProgress?: boolean;
};

export type AssignedPlanningPeriodLogArray = AssignedPlanningPeriod[];

export type DataType = {
  userId: string[];
  sessionId?: string[];
  planPeriodId: string;
  page?: number;
  pageSize?: number;
  pageReporting?: number;
  pageSizeReporting?: number;
};

export type PlanningRequestBody = {
  userIds: string[];
  sessionIds?: string[];
};
