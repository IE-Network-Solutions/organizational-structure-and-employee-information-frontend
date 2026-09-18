import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { KpiApprovalStatus, PepAuditFlag, PepAuditRow } from '@/types/bsc';

function flagLabel(flag: PepAuditFlag): string {
  if (flag === PepAuditFlag.Unrealistic) return 'Unrealistic';
  if (flag === PepAuditFlag.PendingReview) return 'Pending review';
  return 'Approved';
}

function approvalLabel(status: KpiApprovalStatus): string {
  if (status === KpiApprovalStatus.Approved) return 'Approved';
  if (status === KpiApprovalStatus.Rejected) return 'Rejected';
  return 'Pending';
}

export async function exportPepAuditRows(rows: PepAuditRow[]): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('PEP Audit');
  sheet.columns = [
    { header: 'Employee', key: 'employee', width: 22 },
    { header: 'Department', key: 'department', width: 18 },
    { header: 'KPI', key: 'kpi', width: 28 },
    { header: 'Perspective', key: 'perspective', width: 18 },
    { header: 'Actual', key: 'actual', width: 12 },
    { header: 'Target', key: 'target', width: 12 },
    { header: 'Threshold', key: 'threshold', width: 12 },
    { header: 'Unit', key: 'unit', width: 12 },
    { header: 'PEP flag', key: 'flag', width: 16 },
    { header: 'Approval', key: 'approval', width: 14 },
    { header: 'Data source', key: 'dataSource', width: 36 },
    { header: 'Rejection reason', key: 'rejectionReason', width: 36 },
  ];

  rows.forEach((row) => {
    sheet.addRow({
      employee: row.employeeName,
      department: row.departmentName || '',
      kpi: row.kpiName,
      perspective: row.perspective,
      actual: row.actualValue ?? '',
      target: row.targetValue,
      threshold: row.acceptableThreshold ?? '',
      unit: row.measurementUnit,
      flag: flagLabel(row.pepAuditFlag),
      approval: approvalLabel(row.approvalStatus),
      dataSource: row.dataSource || '',
      rejectionReason: row.rejectionReason || '',
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(
    new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }),
    `pep-audit-${new Date().toISOString().split('T')[0]}.xlsx`,
  );
}
