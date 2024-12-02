export enum FieldType {
  MULTIPLE_CHOICE = 'multiple_choice',
  CHECKBOX = 'checkbox',
  SHORT_TEXT = 'short_text',
  PARAGRAPH = 'paragraph',
  TIME = 'time',
  DROPDOWN = 'dropdown',
  RADIO = 'radio',
}
export const PlanningType = [
  { key: 'myPlan', value: 'my plan' },
  { key: 'allPlan', value: 'all Plan' },
];
export const ReportingType = [
  { key: 'myReport', value: 'my Report' },
  { key: 'allReport', value: 'all Report' },
];

export enum LocationType {
  ONSITE = 'OnSite',
  HYBRID = 'Hybrid',
  REMOTE = 'Remote',
}

export enum EmploymentType {
  FULLTIME = 'Full-time',
  PARTTIME = 'Part-time',
}

export enum JobType {
  PERMANENT = 'Permanent',
  TEMPORARY = 'Temporary',
  FULL_TIME = 'Full-time',
  PART_TIME = 'Part-time',
  INTERN = 'Intern',
  CONTRACT = 'Contract',
}

export enum CandidateType {
  GRADUATE = 'Graduate',
  EXPERIENCED = 'Experienced',
  INTERN = 'Intern',
  FREELANCER = 'Freelancer',
  CONTRACTOR = 'Contractor',
}

export enum JobStatus {
  OPEN = 'Open',
  CLOSED = 'Closed',
}

export enum NAME {
  MILESTONE = 'Milestone',
  ACHIEVE = 'Achieve',
  CURRENCY = 'Currency',
  NUMERIC = 'Numeric',
  PERCENTAGE = 'Percentage',
  KPI = 'KPI',
}

export const SelectData = [
  { key: '1', value: 'weekly', label: 'Weekly' },
  { key: '2', value: 'monthly', label: 'Monthly' },
  { key: '3', value: 'quarterly', label: 'Quarterly' },
];

export enum APPROVALTYPES {
  LEAVE = 'Leave',
  BRANCHREQUEST = 'BranchRequest',
}

// Enum for aggregate operators
export enum AggregateOperator {
  ADDITION = "ADDITION",
  SUBTRACTION = "SUBTRACTION",
}

// Enum for condition operators
export enum ConditionOperator {
  EQUALS = "EQUALS",
  GREATER_THAN = "GREATER_THAN",
  LESS_THAN = "LESS_THAN",
  RANGE = "RANGE",
}

