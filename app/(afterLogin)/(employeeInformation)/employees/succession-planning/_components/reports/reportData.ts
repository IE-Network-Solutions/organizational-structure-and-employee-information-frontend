import type { CriticalRole } from '../criticalRoleModal';
import { formatYearsLabel } from '../educationCatalog';

export type SuccessionReportKey = 'readiness' | 'gaps' | 'idp';

export const SUCCESSION_REPORT_OPTIONS: {
  key: SuccessionReportKey;
  label: string;
}[] = [
  { key: 'readiness', label: 'Successor Readiness' },
  { key: 'gaps', label: 'Skill Gap Analysis' },
  { key: 'idp', label: 'Development Plan Progress' },
];

export type ReadinessReportRow = {
  key: string;
  role: string;
  department: string;
  successor: string;
  position: string;
  readiness: string;
  education: string;
  experience: string;
};

export type GapReportRow = {
  key: string;
  role: string;
  successor: string;
  competency: string;
  category: string;
  importance: string;
  required: string;
  current: string;
  severity: string;
  status: string;
};

export type IdpReportRow = {
  key: string;
  role: string;
  successor: string;
  idpStatus: string;
  type: string;
  activity: string;
  target: string;
  activityStatus: string;
  openActions: number;
  completedActions: number;
  progress: number;
};

export const buildSuccessorReadinessRows = (
  roles: CriticalRole[],
): ReadinessReportRow[] => {
  const rows: ReadinessReportRow[] = [];
  roles.forEach((role) => {
    (role.successors ?? []).forEach((successor) => {
      rows.push({
        key: `${role.id}-${successor.id}`,
        role: role.roleName,
        department: role.department,
        successor: successor.name,
        position: successor.currentPosition ?? successor.jobTitle,
        readiness: successor.readiness ?? '',
        education: successor.education ?? '',
        experience: formatYearsLabel(successor.relevantExperience),
      });
    });
  });
  return rows;
};

export const buildSkillGapAnalysisRows = (
  roles: CriticalRole[],
): GapReportRow[] => {
  const rows: GapReportRow[] = [];
  roles.forEach((role) => {
    (role.successors ?? []).forEach((successor) => {
      (successor.gaps ?? []).forEach((gap) => {
        rows.push({
          key: `${role.id}-${successor.id}-${gap.id}`,
          role: role.roleName,
          successor: successor.name,
          competency: gap.competencyName,
          category: gap.category,
          importance: gap.importance,
          required: gap.requiredLevel,
          current: gap.currentLevel,
          severity: gap.gapSeverity,
          status: gap.status,
        });
      });
    });
  });
  return rows;
};

export const buildDevelopmentPlanProgressRows = (
  roles: CriticalRole[],
): IdpReportRow[] => {
  const rows: IdpReportRow[] = [];
  roles.forEach((role) => {
    (role.successors ?? []).forEach((successor) => {
      const actions = successor.developmentActions ?? [];
      const completedActions = actions.filter(
        (a) => a.status === 'Completed',
      ).length;
      const openActions = actions.filter(
        (a) => a.status !== 'Completed',
      ).length;
      const progress =
        actions.length > 0
          ? Math.round((completedActions / actions.length) * 100)
          : successor.idp?.activities?.length
            ? Math.round(
                ((successor.idp.activities.filter((a) => a.status === 'Completed')
                  .length || 0) /
                  successor.idp.activities.length) *
                  100,
              )
            : 0;

      if (!successor.idp?.activities?.length) {
        rows.push({
          key: `${role.id}-${successor.id}-none`,
          role: role.roleName,
          successor: successor.name,
          idpStatus: successor.idp?.status ?? 'None',
          type: '',
          activity: '',
          target: '',
          activityStatus: '',
          openActions,
          completedActions,
          progress,
        });
        return;
      }

      successor.idp.activities.forEach((activity) => {
        rows.push({
          key: `${role.id}-${successor.id}-${activity.id}`,
          role: role.roleName,
          successor: successor.name,
          idpStatus: successor.idp?.status ?? '',
          type: activity.type,
          activity: activity.title,
          target: activity.targetDate ?? '',
          activityStatus: activity.status,
          openActions,
          completedActions,
          progress,
        });
      });
    });
  });
  return rows;
};
