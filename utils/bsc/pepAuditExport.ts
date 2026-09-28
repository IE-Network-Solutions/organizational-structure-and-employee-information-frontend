import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import {
  KpiApprovalStatus,
  PepAuditFlag,
  PepAuditRow,
  TargetLogic,
} from '@/types/bsc';
import { formatTargetDisplay } from '@/utils/bsc/measurementUnit';
import { normalizeRatio } from '@/utils/bsc/scoring';

/**
 * Layout of the approved "IE-Export Report Sample V.0.1": title, intro,
 * one table (Type / Role … Audit Report), then Feedback / Recommendation.
 */
export const PEP_AUDIT_REPORT_TITLE = 'Monthly KPIs Evaluation Audit Report';
export const PEP_AUDIT_REPORT_INTRO =
  'This report is prepared after the direct manager has reviewed, evaluated, and approved the KPIs. ' +
  'Following the manager’s approval, the PEP team conducts an audit of the KPI scores against the attached ' +
  'supporting data sources to verify their accuracy and identify any inaccurate scores or false reporting. ' +
  'The audit findings are then submitted for final review and approval.';

export const PEP_AUDIT_REPORT_COLUMNS = [
  { header: 'Type / Role', width: 30 },
  { header: 'KPI Name', width: 32 },
  { header: 'Actual', width: 12 },
  { header: 'Target', width: 12 },
  { header: 'Perf. %', width: 10 },
  { header: 'Manager Score', width: 14 },
  { header: 'Manager Comment', width: 28 },
  { header: 'Audit Comment', width: 28 },
  { header: 'Audit Report', width: 22 },
] as const;

function formatValue(
  value: number | null | undefined,
  row: PepAuditRow,
): string {
  if (value == null || !Number.isFinite(value)) return '';
  const { primary, unitTag } = formatTargetDisplay(value, row.measurementUnit, {
    worstCase: row.worstCase,
    bestCase: row.bestCase,
  });
  return unitTag ? `${primary} (${unitTag})` : primary;
}

/** "≤4 hrs" for lower-is-better targets, as in the sample. */
function formatTarget(row: PepAuditRow): string {
  const value = formatValue(row.targetValue, row);
  if (!value) return '';
  return row.targetLogic === TargetLogic.LowerBetter ? `≤ ${value}` : value;
}

/** Achievement % with the same threshold gate as scoring. */
function performancePercent(row: PepAuditRow): string {
  if (row.actualValue == null || row.targetValue == null) return '';
  const { ratio } = normalizeRatio(
    row.actualValue,
    row.targetValue,
    row.targetLogic,
    {
      worstCase: row.worstCase,
      bestCase: row.bestCase,
      acceptableThreshold: row.acceptableThreshold,
    },
  );
  return `${Math.round(ratio * 100)}%`;
}

/** Manager's value: their adjustment, else the approved report. */
function managerScore(row: PepAuditRow): string {
  if (row.adjustedValue != null) return formatValue(row.adjustedValue, row);
  if (row.approvalStatus === KpiApprovalStatus.Approved) {
    return formatValue(row.reportedValue ?? row.actualValue, row);
  }
  return '';
}

/** Sample format: "<Risk> — <Outcome>" (e.g. "High — Flagged"). */
function auditReport(row: PepAuditRow): string {
  if (row.approvalStatus === KpiApprovalStatus.Rejected) {
    return 'High — Rejected';
  }
  if (row.pepAuditFlag === PepAuditFlag.Unrealistic) return 'High — Flagged';
  if (row.pepAuditFlag === PepAuditFlag.PendingReview) {
    return 'Medium — Pending review';
  }
  return 'Low — Approved';
}

function typeRole(row: PepAuditRow): string {
  const role = row.positionTitle?.trim() || row.departmentName?.trim() || '';
  const name = row.employeeName?.trim();
  const base = role ? `Individual / ${role}` : 'Individual';
  return name ? `${base} (${name})` : base;
}

const BORDER: Partial<ExcelJS.Borders> = {
  top: { style: 'thin', color: { argb: 'FFBFBFBF' } },
  left: { style: 'thin', color: { argb: 'FFBFBFBF' } },
  bottom: { style: 'thin', color: { argb: 'FFBFBFBF' } },
  right: { style: 'thin', color: { argb: 'FFBFBFBF' } },
};

export async function buildPepAuditReportWorkbook(
  rows: PepAuditRow[],
): Promise<ExcelJS.Workbook> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Audit Report');
  const lastColumn = PEP_AUDIT_REPORT_COLUMNS.length;

  PEP_AUDIT_REPORT_COLUMNS.forEach((column, index) => {
    sheet.getColumn(index + 1).width = column.width;
  });

  // Title
  sheet.mergeCells(1, 1, 1, lastColumn);
  const title = sheet.getCell(1, 1);
  title.value = PEP_AUDIT_REPORT_TITLE;
  title.font = { bold: true, size: 16 };

  // Intro paragraph
  sheet.mergeCells(2, 1, 2, lastColumn);
  const intro = sheet.getCell(2, 1);
  intro.value = PEP_AUDIT_REPORT_INTRO;
  intro.alignment = { wrapText: true, vertical: 'top' };
  sheet.getRow(2).height = 48;

  // Table header (row 4)
  const headerRowNumber = 4;
  const header = sheet.getRow(headerRowNumber);
  PEP_AUDIT_REPORT_COLUMNS.forEach((column, index) => {
    const cell = header.getCell(index + 1);
    cell.value = column.header;
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E40AF' },
    };
    cell.alignment = { vertical: 'middle', wrapText: true };
    cell.border = BORDER;
  });

  rows.forEach((row, index) => {
    const sheetRow = sheet.getRow(headerRowNumber + 1 + index);
    const values = [
      typeRole(row),
      row.kpiName,
      formatValue(row.reportedValue ?? row.actualValue, row),
      formatTarget(row),
      performancePercent(row),
      managerScore(row),
      row.approvalStatus === KpiApprovalStatus.Rejected
        ? row.rejectionReason || ''
        : '',
      row.pepReturnReason || '',
      auditReport(row),
    ];
    values.forEach((value, col) => {
      const cell = sheetRow.getCell(col + 1);
      cell.value = value;
      cell.alignment = { vertical: 'top', wrapText: true };
      cell.border = BORDER;
    });
  });

  // Feedback / Recommendation (free text, as in the sample)
  const footerStart = headerRowNumber + rows.length + 2;
  ['Feedback:', 'Recommendation:'].forEach((label, index) => {
    const rowNumber = footerStart + index * 2;
    sheet.mergeCells(rowNumber, 1, rowNumber, lastColumn);
    const cell = sheet.getCell(rowNumber, 1);
    cell.value = label;
    cell.font = { bold: true };
  });

  return workbook;
}

export async function exportPepAuditRows(rows: PepAuditRow[]): Promise<void> {
  const workbook = await buildPepAuditReportWorkbook(rows);
  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(
    new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }),
    `kpi-evaluation-audit-report-${new Date().toISOString().split('T')[0]}.xlsx`,
  );
}
