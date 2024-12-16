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
export const JobActionStatus = [
  { id: 'New', name: 'New' },
  { id: 'Promotion', name: 'Promotion' },
  { id: 'Transfer', name: 'Transfer' },
];
export const FilterOptions = [
  { key: '1', value: 'monthly', label: 'Monthly' },
  { key: '2', value: 'session', label: 'Session' },
  { key: '3', value: 'yearly', label: 'Yearly' },
  { key: '4', value: 'all-time', label: 'All-Time' },
];


export const commonClass='text-sm text-gray-950'