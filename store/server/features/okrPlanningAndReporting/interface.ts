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
