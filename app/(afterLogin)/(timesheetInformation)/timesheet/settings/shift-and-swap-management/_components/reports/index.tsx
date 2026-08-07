'use client';

import { useMemo, useState } from 'react';
import { Button, Card, Segmented, Space, Table } from 'antd';
import dayjs from 'dayjs';
import * as ExcelJS from 'exceljs';
import jsPDF from 'jspdf';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import StatusBadge from '@/components/common/statusBadge/statusBadge';
import { useShiftSwapStore } from '@/store/uistate/features/timesheet/shiftSwap';
import {
  SHIFT_SWAP_STATUS_LABEL,
  ShiftSwapRequest,
} from '@/types/timesheet/shiftSwap';
import FilterBar from '../shared/FilterBar';
import {
  DirectoryPerson,
  formatShiftTime,
  matchesFilters,
  swapStatusTheme,
} from '../shared/utils';
import SectionHeader from '../shared/SectionHeader';

type ReportView = 'schedules' | 'swaps' | 'pending' | 'coverage';

type ReportsPanelProps = {
  people: DirectoryPerson[];
};

const downloadBlob = (blob: Blob, fileName: string) => {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  link.click();
};

const ReportsPanel = ({ people }: ReportsPanelProps) => {
  const [reportView, setReportView] = useState<ReportView>('schedules');
  const { templates, assignments, swapRequests, filters } = useShiftSwapStore();
  const templateMap = Object.fromEntries(
    templates.map((item) => [item.id, item]),
  );

  const scheduleRows = useMemo(
    () =>
      assignments
        .filter((item) =>
          matchesFilters(item, filters, templateMap[item.shiftTemplateId]),
        )
        .map((item) => ({
          ...item,
          shiftName: templateMap[item.shiftTemplateId]?.name || '—',
          shiftTime: formatShiftTime(templateMap[item.shiftTemplateId]),
        })),
    [assignments, filters, templateMap],
  );

  const swapRows = useMemo(() => {
    const query = filters.search.trim().toLowerCase();
    return swapRequests.filter((item) => {
      if (query) {
        const match = `${item.requesterName} ${item.counterpartName}`
          .toLowerCase()
          .includes(query);
        if (!match) return false;
      }
      return true;
    });
  }, [swapRequests, filters.search]);

  const pendingRows = swapRows.filter((item) =>
    item.status.startsWith('pending'),
  );

  const coverageRows = useMemo(() => {
    const grouped = scheduleRows.reduce<
      Record<string, { department: string; date: string; count: number }>
    >((acc, item) => {
      const key = `${item.departmentName || 'Unassigned'}|${item.date}`;
      if (!acc[key]) {
        acc[key] = {
          department: item.departmentName || 'Unassigned',
          date: item.date,
          count: 0,
        };
      }
      acc[key].count += 1;
      return acc;
    }, {});
    return Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date));
  }, [scheduleRows]);

  const exportRows = () => {
    if (reportView === 'schedules') {
      return scheduleRows.map((item) => ({
        Employee: item.employeeName,
        Date: item.date,
        Shift: item.shiftName,
        Time: item.shiftTime,
        Department: item.departmentName || '',
        Location: item.locationName || '',
        Team: item.teamName || '',
      }));
    }
    if (reportView === 'coverage') {
      return coverageRows.map((item) => ({
        Department: item.department,
        Date: item.date,
        Headcount: item.count,
      }));
    }
    const source = reportView === 'pending' ? pendingRows : swapRows;
    return source.map((item) => ({
      Requester: item.requesterName,
      Counterpart: item.counterpartName,
      Status: SHIFT_SWAP_STATUS_LABEL[item.status],
      Reason: item.reason || '',
      Submitted: dayjs(item.createdAt).format('YYYY-MM-DD HH:mm'),
    }));
  };

  const exportExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Shift & Swap Report');
    const rows = exportRows();
    if (!rows.length) {
      NotificationMessage.warning({ message: 'Nothing to export' });
      return;
    }
    sheet.columns = Object.keys(rows[0]).map((key) => ({
      header: key,
      key,
      width: 24,
    }));
    rows.forEach((row) => sheet.addRow(row));
    sheet.getRow(1).font = { bold: true };
    const buffer = await workbook.xlsx.writeBuffer();
    downloadBlob(
      new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      }),
      `shift-swap-${reportView}.xlsx`,
    );
    NotificationMessage.success({ message: 'Excel export ready' });
  };

  const exportPdf = () => {
    const rows = exportRows();
    if (!rows.length) {
      NotificationMessage.warning({ message: 'Nothing to export' });
      return;
    }
    const pdf = new jsPDF('l', 'mm', 'a4');
    pdf.setFontSize(14);
    pdf.text('Shift & Swap Management Report', 14, 16);
    pdf.setFontSize(10);
    pdf.text(reportView.replace('-', ' '), 14, 22);
    let y = 30;
    rows.slice(0, 40).forEach((row) => {
      pdf.text(Object.values(row).join(' | ').slice(0, 140), 14, y);
      y += 6;
      if (y > 190) {
        pdf.addPage();
        y = 20;
      }
    });
    pdf.save(`shift-swap-${reportView}.pdf`);
    NotificationMessage.success({ message: 'PDF export ready' });
  };

  return (
    <div
      id="time-attendance-settings-shift-swap-reports"
      data-cy="time-attendance-settings-shift-swap-reports"
    >
      <SectionHeader
        title="Reports"
        description="Review schedules, swap history, pending approvals, and workforce coverage."
        extra={
          <AccessGuard permissions={[Permissions.ViewShiftReports]}>
            <Space>
              <Button className="h-10" onClick={exportExcel}>
                Export Excel
              </Button>
              <Button className="h-10" onClick={exportPdf}>
                Export PDF
              </Button>
            </Space>
          </AccessGuard>
        }
      />

      <Card className="border-[#D9D9D9] mb-4">
        <FilterBar people={people} templates={templates} />
      </Card>

      <Segmented
        className="mb-4"
        value={reportView}
        onChange={(value) => setReportView(value as ReportView)}
        options={[
          { label: 'Shift schedules', value: 'schedules' },
          { label: 'Swap history', value: 'swaps' },
          { label: 'Pending approvals', value: 'pending' },
          { label: 'Workforce coverage', value: 'coverage' },
        ]}
      />

      {reportView === 'schedules' && (
        <Table
          rowKey="id"
          dataSource={scheduleRows}
          pagination={{ pageSize: 8 }}
          columns={[
            { title: 'Employee', dataIndex: 'employeeName' },
            {
              title: 'Date',
              dataIndex: 'date',
              render: (value) => dayjs(value).format('MMM D, YYYY'),
            },
            { title: 'Shift', dataIndex: 'shiftName' },
            { title: 'Time', dataIndex: 'shiftTime' },
            { title: 'Department', dataIndex: 'departmentName' },
            { title: 'Location', dataIndex: 'locationName' },
            { title: 'Team', dataIndex: 'teamName' },
          ]}
        />
      )}

      {(reportView === 'swaps' || reportView === 'pending') && (
        <Table
          rowKey="id"
          dataSource={reportView === 'pending' ? pendingRows : swapRows}
          pagination={{ pageSize: 8 }}
          columns={[
            { title: 'Requester', dataIndex: 'requesterName' },
            { title: 'Counterpart', dataIndex: 'counterpartName' },
            {
              title: 'Status',
              dataIndex: 'status',
              render: (status: ShiftSwapRequest['status']) => (
                <StatusBadge theme={swapStatusTheme(status)}>
                  {SHIFT_SWAP_STATUS_LABEL[status]}
                </StatusBadge>
              ),
            },
            { title: 'Reason', dataIndex: 'reason' },
            {
              title: 'Submitted',
              dataIndex: 'createdAt',
              render: (value) => dayjs(value).format('MMM D, YYYY HH:mm'),
            },
          ]}
        />
      )}

      {reportView === 'coverage' && (
        <Table
          rowKey={(row) => `${row.department}-${row.date}`}
          dataSource={coverageRows}
          pagination={{ pageSize: 8 }}
          columns={[
            { title: 'Department', dataIndex: 'department' },
            {
              title: 'Date',
              dataIndex: 'date',
              render: (value) => dayjs(value).format('MMM D, YYYY'),
            },
            { title: 'Scheduled headcount', dataIndex: 'count' },
          ]}
        />
      )}
    </div>
  );
};

export default ReportsPanel;
