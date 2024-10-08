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
