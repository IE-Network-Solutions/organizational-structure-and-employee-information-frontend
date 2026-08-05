'use client';
import React, { FC, useMemo, useState } from 'react';
import { Button, DatePicker, Select, Skeleton, Space, Table } from 'antd';
import dayjs from 'dayjs';
import { Workbook } from 'exceljs';
import { saveAs } from 'file-saver';
import CustomPagination from '@/components/customPagination';
import EmptyState from '@/components/empty';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import { TableColumnsType } from '@/types/table/table';
import { DATE_FORMAT } from '@/utils/constants';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import {
  ExternalTrainingReportRow,
  ExternalTrainingStatus,
  ExternalTrainingStatusLabel,
  externalTrainingStatusOptions,
} from '@/types/tna/externalTna';
import { ExternalTrainingRequestBody } from '@/store/server/features/tna/externalTraining/interface';
import { useGetExternalTrainingReport } from '@/store/server/features/tna/externalTraining/queries';
import EmployeeName from '@/app/(afterLogin)/(tna)/tna/_components/employeeName';

const StatCard = ({
  label,
  value,
  dataCy,
}: {
  label: string;
  value: React.ReactNode;
  dataCy: string;
}) => (
  <div
    className="box-border flex flex-col gap-1 rounded-[8px] border border-[#D9D9D9] bg-white p-4"
    data-cy={dataCy}
  >
    <span
      data-cy="tna-admin-reports-stat-label"
      className="text-[11px] uppercase leading-4 tracking-wide text-black/45"
    >
      {label}
    </span>
    <span
      data-cy="tna-admin-reports-stat-value"
      className="text-xl font-bold leading-7 text-black"
    >
      {value}
    </span>
  </div>
);

/** Monitoring and auditing view: headline numbers plus an exportable register. */
const ReportsTab: FC = () => {
  const [statuses, setStatuses] = useState<ExternalTrainingStatus[]>([]);
  const [dateRange, setDateRange] = useState<{ from?: string; to?: string }>(
    {},
  );
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isExporting, setIsExporting] = useState(false);

  const filterBody: Partial<ExternalTrainingRequestBody> = useMemo(() => {
    const filter: ExternalTrainingRequestBody['filter'] = {};
    if (statuses.length) filter.status = statuses;
    if (dateRange.from || dateRange.to) filter.createdAt = dateRange;
    return Object.keys(filter).length ? { filter } : {};
  }, [statuses, dateRange]);

  const { data: report, isLoading } = useGetExternalTrainingReport(filterBody);

  const rows = useMemo(() => report?.rows ?? [], [report]);
  const pagedRows = useMemo(
    () => rows.slice((page - 1) * limit, page * limit),
    [rows, page, limit],
  );

  const columns: TableColumnsType<ExternalTrainingReportRow> = [
    {
      title: 'Course',
      dataIndex: 'courseName',
      key: 'courseName',
    },
    {
      title: 'Employee',
      dataIndex: 'requestedBy',
      key: 'requestedBy',
      render: (value: string) => <EmployeeName userId={value} />,
    },
    {
      title: 'Provider',
      dataIndex: 'trainingProvider',
      key: 'trainingProvider',
      render: (value: string | null) => value || '-',
    },
    {
      title: 'Cost',
      dataIndex: 'cost',
      key: 'cost',
      render: (value: number) => Number(value ?? 0).toLocaleString(),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (value: ExternalTrainingStatus) =>
        ExternalTrainingStatusLabel[value] ?? value,
    },
    {
      title: 'Payment',
      dataIndex: 'isPaymentConfirmed',
      key: 'isPaymentConfirmed',
      render: (value: boolean) => (value ? 'Confirmed' : 'Pending'),
    },
    {
      title: 'Commitment ends',
      dataIndex: 'commitmentEndDate',
      key: 'commitmentEndDate',
      render: (value: string | null) =>
        value ? dayjs(value).format(DATE_FORMAT) : '-',
    },
    {
      title: 'Progress',
      dataIndex: 'commitmentProgress',
      key: 'commitmentProgress',
      render: (value: number | null) => (value === null ? '-' : `${value}%`),
    },
  ];

  const onExport = async () => {
    if (!rows.length) {
      NotificationMessage.warning({
        message: 'Nothing to export',
        description: 'No TNA records match the current filters.',
      });
      return;
    }

    setIsExporting(true);
    try {
      const workbook = new Workbook();
      const sheet = workbook.addWorksheet('TNA Report');

      sheet.columns = [
        { header: 'Course', key: 'courseName', width: 32 },
        { header: 'Provider', key: 'trainingProvider', width: 24 },
        { header: 'Employee ID', key: 'requestedBy', width: 38 },
        { header: 'Cost', key: 'cost', width: 14 },
        { header: 'Status', key: 'status', width: 20 },
        { header: 'Requested at', key: 'requestedAt', width: 18 },
        { header: 'Manager approved at', key: 'managerApprovedAt', width: 20 },
        {
          header: 'TNA officer approved at',
          key: 'tnaOfficerApprovedAt',
          width: 22,
        },
        { header: 'Payment confirmed', key: 'isPaymentConfirmed', width: 18 },
        { header: 'Payment reference', key: 'paymentReference', width: 22 },
        { header: 'Amount paid', key: 'paidAmount', width: 14 },
        { header: 'Commitment start', key: 'commitmentStartDate', width: 18 },
        { header: 'Commitment end', key: 'commitmentEndDate', width: 18 },
        { header: 'Commitment status', key: 'commitmentStatus', width: 18 },
        { header: 'Progress %', key: 'commitmentProgress', width: 12 },
        { header: 'Days remaining', key: 'commitmentDaysRemaining', width: 16 },
      ];

      rows.forEach((row) => {
        sheet.addRow({
          ...row,
          status: ExternalTrainingStatusLabel[row.status] ?? row.status,
          requestedAt: row.requestedAt
            ? dayjs(row.requestedAt).format(DATE_FORMAT)
            : '',
          managerApprovedAt: row.managerApprovedAt
            ? dayjs(row.managerApprovedAt).format(DATE_FORMAT)
            : '',
          tnaOfficerApprovedAt: row.tnaOfficerApprovedAt
            ? dayjs(row.tnaOfficerApprovedAt).format(DATE_FORMAT)
            : '',
          isPaymentConfirmed: row.isPaymentConfirmed ? 'Yes' : 'No',
          commitmentStartDate: row.commitmentStartDate
            ? dayjs(row.commitmentStartDate).format(DATE_FORMAT)
            : '',
          commitmentEndDate: row.commitmentEndDate
            ? dayjs(row.commitmentEndDate).format(DATE_FORMAT)
            : '',
        });
      });

      sheet.getRow(1).font = { bold: true };

      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(
        new Blob([buffer], { type: 'application/octet-stream' }),
        `TNA_Report_${dayjs().format('YYYY-MM-DD')}.xlsx`,
      );
    } catch (error) {
      NotificationMessage.error({
        message: 'Export failed',
        description: 'Could not generate the TNA report file.',
      });
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div data-cy="tna-admin-reports-loading">
        <Skeleton active paragraph={{ rows: 6 }} />
      </div>
    );
  }

  const summary = report?.summary;

  return (
    <div className="flex flex-col gap-4" data-cy="tna-admin-reports-tab">
      <div
        className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between"
        data-cy="tna-admin-reports-filters"
      >
        <Space wrap data-cy="tna-admin-reports-filter-controls">
          <Select
            mode="multiple"
            allowClear
            placeholder="Status"
            className="min-w-[220px]"
            options={externalTrainingStatusOptions}
            value={statuses}
            onChange={(value) => {
              setStatuses(value);
              setPage(1);
            }}
            data-cy="tna-admin-reports-status-filter"
          />
          <DatePicker.RangePicker
            format={DATE_FORMAT}
            className="h-10"
            onChange={(value) => {
              if (value && value[0] && value[1]) {
                setDateRange({
                  from: value[0].startOf('day').toISOString(),
                  to: value[1].endOf('day').toISOString(),
                });
              } else {
                setDateRange({});
              }
              setPage(1);
            }}
            data-cy="tna-admin-reports-date-filter"
          />
        </Space>
        <AccessGuard permissions={[Permissions.ExportTnaReport]}>
          <Button
            type="primary"
            className="h-10 rounded-lg border-[#1E40AF] bg-[#1E40AF] px-4"
            loading={isExporting}
            onClick={onExport}
            data-cy="tna-admin-reports-export"
          >
            Export report
          </Button>
        </AccessGuard>
      </div>

      <div
        className="grid grid-cols-2 gap-3 md:grid-cols-4"
        data-cy="tna-admin-reports-stats"
      >
        <StatCard
          label="Total requests"
          value={summary?.totalRequests ?? 0}
          dataCy="tna-admin-reports-stat-total"
        />
        <StatCard
          label="Payments confirmed"
          value={summary?.paymentsConfirmed ?? 0}
          dataCy="tna-admin-reports-stat-paid"
        />
        <StatCard
          label="Active commitments"
          value={summary?.activeCommitments ?? 0}
          dataCy="tna-admin-reports-stat-active"
        />
        <StatCard
          label="Completed commitments"
          value={summary?.completedCommitments ?? 0}
          dataCy="tna-admin-reports-stat-completed"
        />
        <StatCard
          label="Total requested cost"
          value={Number(summary?.totalRequestedCost ?? 0).toLocaleString()}
          dataCy="tna-admin-reports-stat-requested-cost"
        />
        <StatCard
          label="Total paid"
          value={Number(summary?.totalPaidAmount ?? 0).toLocaleString()}
          dataCy="tna-admin-reports-stat-paid-amount"
        />
        <StatCard
          label="Pending manager"
          value={
            summary?.byStatus?.[ExternalTrainingStatus.PENDING_MANAGER] ?? 0
          }
          dataCy="tna-admin-reports-stat-pending-manager"
        />
        <StatCard
          label="Pending TNA officer"
          value={
            summary?.byStatus?.[ExternalTrainingStatus.PENDING_TNA_OFFICER] ?? 0
          }
          dataCy="tna-admin-reports-stat-pending-officer"
        />
      </div>

      {!rows.length ? (
        <EmptyState
          compact
          title="No records for this period"
          description="Adjust the status or date filters to widen the report."
          data-cy="tna-admin-reports-empty"
        />
      ) : (
        <>
          <Table
            rowKey="id"
            columns={columns}
            dataSource={pagedRows}
            pagination={false}
            scroll={{ x: 'max-content' }}
            data-cy="tna-admin-reports-table"
          />
          <CustomPagination
            current={page}
            total={rows.length}
            pageSize={limit}
            onChange={(nextPage, nextSize) => {
              setPage(nextPage);
              if (nextSize) setLimit(nextSize);
            }}
            onShowSizeChange={(size) => {
              setLimit(size);
              setPage(1);
            }}
            data-cy="tna-admin-reports-pagination"
          />
        </>
      )}
    </div>
  );
};

export default ReportsTab;
