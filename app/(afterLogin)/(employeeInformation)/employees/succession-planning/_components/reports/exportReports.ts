import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import type { CriticalRole } from '../criticalRoleModal';
import { formatYearsLabel } from '../educationCatalog';

const downloadWorkbook = async (
  workbook: ExcelJS.Workbook,
  filename: string,
) => {
  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(
    new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }),
    filename,
  );
};

export const exportSuccessorReadinessReport = async (roles: CriticalRole[]) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Successor Readiness');
  sheet.columns = [
    { header: 'Role', key: 'role', width: 28 },
    { header: 'Department', key: 'department', width: 18 },
    { header: 'Successor', key: 'successor', width: 22 },
    { header: 'Current Position', key: 'position', width: 24 },
    { header: 'Readiness', key: 'readiness', width: 22 },
    { header: 'Education', key: 'education', width: 28 },
    { header: 'Relevant Experience', key: 'experience', width: 36 },
  ];
  roles.forEach((role) => {
    (role.successors ?? []).forEach((successor) => {
      sheet.addRow({
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
  await downloadWorkbook(workbook, 'successor-readiness-report.xlsx');
};

export const exportSkillGapAnalysisReport = async (roles: CriticalRole[]) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Skill Gap Analysis');
  sheet.columns = [
    { header: 'Role', key: 'role', width: 28 },
    { header: 'Successor', key: 'successor', width: 22 },
    { header: 'Required Competency', key: 'competency', width: 28 },
    { header: 'Category', key: 'category', width: 14 },
    { header: 'Importance', key: 'importance', width: 14 },
    { header: 'Required Level', key: 'required', width: 22 },
    { header: 'Current Level', key: 'current', width: 16 },
    { header: 'Severity', key: 'severity', width: 12 },
    { header: 'Status', key: 'status', width: 14 },
  ];
  roles.forEach((role) => {
    (role.successors ?? []).forEach((successor) => {
      (successor.gaps ?? []).forEach((gap) => {
        sheet.addRow({
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
  await downloadWorkbook(workbook, 'skill-gap-analysis-report.xlsx');
};

export const exportDevelopmentPlanProgressReport = async (
  roles: CriticalRole[],
) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Development Plan Progress');
  sheet.columns = [
    { header: 'Role', key: 'role', width: 28 },
    { header: 'Successor', key: 'successor', width: 22 },
    { header: 'IDP Status', key: 'idpStatus', width: 12 },
    { header: 'Activity Type', key: 'type', width: 26 },
    { header: 'Activity', key: 'activity', width: 36 },
    { header: 'Target Date', key: 'target', width: 14 },
    { header: 'Activity Status', key: 'activityStatus', width: 16 },
    { header: 'Open Actions', key: 'openActions', width: 14 },
    { header: 'Completed Actions', key: 'completedActions', width: 16 },
    { header: 'Progress %', key: 'progress', width: 12 },
  ];
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
        sheet.addRow({
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
        sheet.addRow({
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
  await downloadWorkbook(workbook, 'development-plan-progress-report.xlsx');
};
