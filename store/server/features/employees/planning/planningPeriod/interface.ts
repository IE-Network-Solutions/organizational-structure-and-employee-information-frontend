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
  /** When true, reports for this period update KR progress. At most one per user. */
  canProgress?: boolean;
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

// New interface for the grouped user response with planningPeriods
export interface GroupedUserWithPlanningPeriods {
  userId: string;
  planningPeriod: PlanningPeriodUser[];
  profileImage?: string;
  lastUpdated?: string;
}

// Paginated response for grouped users
export type PaginatedGroupedUsers = {
  items: GroupedUserWithPlanningPeriods[];
  meta: MetaData;
};
export interface PlanningUserPayload {
  userIds: string[];
  /** Preferred field for update/create APIs that expect period ids. */
  planningPeriodIds?: string[];
  /** Form / assign endpoint field name (kept for backward compatibility). */
  planningPeriods?: string[];
  /**
   * Planning period id that should have canProgress=true for each user.
   * Must be one of the assigned period ids, or null/omitted for none.
   */
  canProgressPlanningPeriodId?: string | null;
  scoringConfigurationId?: string;
  okrRuleId?: string;
}

export type UpdatePlanningPeriodFunction = (
  userId: string,
  values: PlanningUserPayload,
) => Promise<any>;
