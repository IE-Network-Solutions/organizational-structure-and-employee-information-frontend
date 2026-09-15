import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import type { CriticalRole } from '../criticalRoleModal';
import {
  buildDevelopmentPlanProgressRows,
  buildSkillGapAnalysisRows,
  buildSuccessorReadinessRows,
  type SuccessionReportKey,
} from './reportData';

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
  buildSuccessorReadinessRows(roles).forEach((row) => {
    sheet.addRow({
      role: row.role,
      department: row.department,
      successor: row.successor,
      position: row.position,
      readiness: row.readiness,
      education: row.education,
      experience: row.experience,
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
  buildSkillGapAnalysisRows(roles).forEach((row) => {
    sheet.addRow({
      role: row.role,
      successor: row.successor,
      competency: row.competency,
      category: row.category,
      importance: row.importance,
      required: row.required,
      current: row.current,
      severity: row.severity,
      status: row.status,
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
  buildDevelopmentPlanProgressRows(roles).forEach((row) => {
    sheet.addRow({
      role: row.role,
      successor: row.successor,
      idpStatus: row.idpStatus,
      type: row.type,
      activity: row.activity,
      target: row.target,
      activityStatus: row.activityStatus,
      openActions: row.openActions,
      completedActions: row.completedActions,
      progress: row.progress,
    });
  });
  await downloadWorkbook(workbook, 'development-plan-progress-report.xlsx');
};

export const exportSuccessionReport = async (
  roles: CriticalRole[],
  reportKey: SuccessionReportKey,
) => {
  switch (reportKey) {
    case 'readiness':
      return exportSuccessorReadinessReport(roles);
    case 'gaps':
      return exportSkillGapAnalysisReport(roles);
    case 'idp':
      return exportDevelopmentPlanProgressReport(roles);
    default:
      return exportSuccessorReadinessReport(roles);
  }
};
