import type { CompetencyImportance } from './steps/stepCompetencyDefinition';
import type { CriticalRole } from './criticalRoleModal';

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
