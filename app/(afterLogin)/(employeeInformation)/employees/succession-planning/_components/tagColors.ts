import type { CompetencyImportance } from './steps/stepCompetencyDefinition';
import type { CriticalRole } from './criticalRoleModal';
import type {
  DevelopmentActionStatus,
  GapSeverity,
  IdpActivityStatus,
  SuccessorReadiness,
} from './successionTypes';

/** Ant Design Tag colors — same pattern as competency need tags. */
export const importanceColor: Record<CompetencyImportance, string> = {
  Required: 'red',
  Preferred: 'blue',
  'Nice to Have': 'default',
};

export const riskLevelColor: Record<CriticalRole['riskLevel'], string> = {
  High: 'red',
  Medium: 'orange',
  Low: 'default',
};

export const priorityColor: Record<CriticalRole['priority'], string> = {
  Critical: 'red',
  High: 'orange',
  Medium: 'blue',
};

export const readinessColor: Record<SuccessorReadiness, string> = {
  'Ready Now': 'green',
  'Ready within 6 Months': 'blue',
  'Ready within 1 Year': 'orange',
  'Ready within 2 Years': 'volcano',
  'Ready within 3+ Years': 'red',
};

export const gapSeverityColor: Record<GapSeverity, string> = {
  None: 'default',
  Minor: 'blue',
  Major: 'orange',
  Critical: 'red',
};

export const actionStatusColor: Record<DevelopmentActionStatus, string> = {
  'Not Started': 'default',
  'In Progress': 'blue',
  Completed: 'green',
  Overdue: 'red',
};

export const idpActivityStatusColor: Record<IdpActivityStatus, string> = {
  'Not Started': 'default',
  'In Progress': 'blue',
  Completed: 'green',
};
