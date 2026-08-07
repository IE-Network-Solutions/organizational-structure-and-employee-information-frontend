'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { Button, Empty, Input, Select, Table, Tag } from 'antd';
import type { TableColumnsType } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import CustomPagination from '@/components/customPagination';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import { useIsMobile } from '@/hooks/useIsMobile';
import type { CriticalRole } from '../../criticalRoleModal';
import {
  gapSeverityColor,
  importanceColor,
  readinessColor,
} from '../../tagColors';
import type {
  CompetencyImportance,
} from '../../steps/stepCompetencyDefinition';
import type {
  GapSeverity,
  SuccessorReadiness,
} from '../../successionTypes';
import { exportSuccessionReport } from '../exportReports';
import {
  buildDevelopmentPlanProgressRows,
  buildSkillGapAnalysisRows,
  buildSuccessorReadinessRows,
  SUCCESSION_REPORT_OPTIONS,
  type GapReportRow,
  type IdpReportRow,
  type ReadinessReportRow,
  type SuccessionReportKey,
} from '../reportData';

const headerClass = 'text-[#4d4d4d] text-base font-bold whitespace-nowrap';
const cellClass = 'text-sm text-[#4d4d4d]';
const PAGE_SIZE = 10;

interface ReportsViewProps {
  roles: CriticalRole[];
  reportKey: SuccessionReportKey;
  onReportKeyChange: (key: SuccessionReportKey) => void;
}

const ReportsView: React.FC<ReportsViewProps> = ({
  roles,
  reportKey,
  onReportKeyChange,
}) => {
  const { isMobile, isTablet } = useIsMobile();
  const [searchValue, setSearchValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    setCurrentPage(1);
    setSearchValue('');
  }, [reportKey]);

  const readinessRows = useMemo(
    () => buildSuccessorReadinessRows(roles),
    [roles],
  );
  const gapRows = useMemo(() => buildSkillGapAnalysisRows(roles), [roles]);
  const idpRows = useMemo(
    () => buildDevelopmentPlanProgressRows(roles),
    [roles],
  );

  const q = searchValue.trim().toLowerCase();

  const filteredReadiness = useMemo(() => {
    if (!q) return readinessRows;
    return readinessRows.filter((row) =>
      [row.role, row.department, row.successor, row.position, row.readiness]
        .join(' ')
        .toLowerCase()
        .includes(q),
    );
  }, [readinessRows, q]);

  const filteredGaps = useMemo(() => {
    if (!q) return gapRows;
    return gapRows.filter((row) =>
      [row.role, row.successor, row.competency, row.severity, row.status]
        .join(' ')
        .toLowerCase()
        .includes(q),
    );
  }, [gapRows, q]);

  const filteredIdp = useMemo(() => {
    if (!q) return idpRows;
    return idpRows.filter((row) =>
      [row.role, row.successor, row.type, row.activity, row.idpStatus]
        .join(' ')
        .toLowerCase()
        .includes(q),
    );
  }, [idpRows, q]);

  const activeCount =
    reportKey === 'readiness'
      ? filteredReadiness.length
      : reportKey === 'gaps'
        ? filteredGaps.length
        : filteredIdp.length;

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(activeCount / pageSize) || 1);
    if (currentPage > maxPage) setCurrentPage(maxPage);
  }, [activeCount, pageSize, currentPage]);

  const pageSlice = <T,>(rows: T[]) => {
    const start = (currentPage - 1) * pageSize;
    return rows.slice(start, start + pageSize);
  };

  const onPageChange = (page: number, size?: number) => {
    setCurrentPage(page);
    if (size && size !== pageSize) {
      setPageSize(size);
      setCurrentPage(1);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportSuccessionReport(roles, reportKey);
      NotificationMessage.success({ message: 'Report downloaded' });
    } catch {
      NotificationMessage.error({ message: 'Export failed' });
    } finally {
      setExporting(false);
    }
  };

  const readinessColumns: TableColumnsType<ReadinessReportRow> = [
    {
      title: <span className={headerClass}>Role</span>,
      dataIndex: 'role',
      ellipsis: true,
      render: (v: string) => <span className={`${cellClass} font-medium`}>{v}</span>,
    },
    {
      title: <span className={headerClass}>Department</span>,
      dataIndex: 'department',
      ellipsis: true,
      render: (v: string) => <span className={cellClass}>{v}</span>,
    },
    {
      title: <span className={headerClass}>Successor</span>,
      dataIndex: 'successor',
      ellipsis: true,
      render: (v: string) => <span className={cellClass}>{v}</span>,
    },
    {
      title: <span className={headerClass}>Current Position</span>,
      dataIndex: 'position',
      ellipsis: true,
      render: (v: string) => <span className={cellClass}>{v || '—'}</span>,
    },
    {
      title: <span className={headerClass}>Readiness</span>,
      dataIndex: 'readiness',
      width: 170,
      render: (v: string) =>
        v ? (
          <Tag
            color={readinessColor[v as SuccessorReadiness] ?? 'default'}
            className="m-0"
          >
            {v}
          </Tag>
        ) : (
          <span className={cellClass}>—</span>
        ),
    },
    {
      title: <span className={headerClass}>Education</span>,
      dataIndex: 'education',
      ellipsis: true,
      render: (v: string) => <span className={cellClass}>{v || '—'}</span>,
    },
    {
      title: <span className={headerClass}>Relevant Experience</span>,
      dataIndex: 'experience',
      width: 160,
      render: (v: string) => <span className={cellClass}>{v || '—'}</span>,
    },
  ];

  const gapColumns: TableColumnsType<GapReportRow> = [
    {
      title: <span className={headerClass}>Role</span>,
      dataIndex: 'role',
      ellipsis: true,
      render: (v: string) => <span className={`${cellClass} font-medium`}>{v}</span>,
    },
    {
      title: <span className={headerClass}>Successor</span>,
      dataIndex: 'successor',
      ellipsis: true,
      render: (v: string) => <span className={cellClass}>{v}</span>,
    },
    {
      title: <span className={headerClass}>Required Competency</span>,
      dataIndex: 'competency',
      ellipsis: true,
      render: (v: string) => <span className={cellClass}>{v}</span>,
    },
    {
      title: <span className={headerClass}>Category</span>,
      dataIndex: 'category',
      width: 110,
      render: (v: string) => <span className={cellClass}>{v}</span>,
    },
    {
      title: <span className={headerClass}>Importance</span>,
      dataIndex: 'importance',
      width: 120,
      render: (v: string) => (
        <Tag
          color={importanceColor[v as CompetencyImportance] ?? 'default'}
          className="m-0"
        >
          {v}
        </Tag>
      ),
    },
    {
      title: <span className={headerClass}>Required Level</span>,
      dataIndex: 'required',
      ellipsis: true,
      render: (v: string) => <span className={cellClass}>{v || '—'}</span>,
    },
    {
      title: <span className={headerClass}>Current Level</span>,
      dataIndex: 'current',
      ellipsis: true,
      render: (v: string) => <span className={cellClass}>{v || '—'}</span>,
    },
    {
      title: <span className={headerClass}>Severity</span>,
      dataIndex: 'severity',
      width: 110,
      render: (v: string) => (
        <Tag
          color={gapSeverityColor[v as GapSeverity] ?? 'default'}
          className="m-0"
        >
          {v}
        </Tag>
      ),
    },
    {
      title: <span className={headerClass}>Status</span>,
      dataIndex: 'status',
      width: 120,
      render: (v: string) => <span className={cellClass}>{v}</span>,
    },
  ];

  const idpColumns: TableColumnsType<IdpReportRow> = [
    {
      title: <span className={headerClass}>Role</span>,
      dataIndex: 'role',
      ellipsis: true,
      render: (v: string) => <span className={`${cellClass} font-medium`}>{v}</span>,
    },
    {
      title: <span className={headerClass}>Successor</span>,
      dataIndex: 'successor',
      ellipsis: true,
      render: (v: string) => <span className={cellClass}>{v}</span>,
    },
    {
      title: <span className={headerClass}>IDP Status</span>,
      dataIndex: 'idpStatus',
      width: 110,
      render: (v: string) => <span className={cellClass}>{v || '—'}</span>,
    },
    {
      title: <span className={headerClass}>Activity Type</span>,
      dataIndex: 'type',
      ellipsis: true,
      render: (v: string) => <span className={cellClass}>{v || '—'}</span>,
    },
    {
      title: <span className={headerClass}>Activity</span>,
      dataIndex: 'activity',
      ellipsis: true,
      render: (v: string) => <span className={cellClass}>{v || '—'}</span>,
    },
    {
      title: <span className={headerClass}>Target Date</span>,
      dataIndex: 'target',
      width: 120,
      render: (v: string) => (
        <span className={`${cellClass} tabular-nums`}>{v || '—'}</span>
      ),
    },
    {
      title: <span className={headerClass}>Activity Status</span>,
      dataIndex: 'activityStatus',
      width: 130,
      render: (v: string) => <span className={cellClass}>{v || '—'}</span>,
    },
    {
      title: <span className={headerClass}>Open Actions</span>,
      dataIndex: 'openActions',
      width: 120,
      render: (v: number) => (
        <span className={`${cellClass} tabular-nums`}>{v}</span>
      ),
    },
    {
      title: <span className={headerClass}>Completed</span>,
      dataIndex: 'completedActions',
      width: 110,
      render: (v: number) => (
        <span className={`${cellClass} tabular-nums`}>{v}</span>
      ),
    },
    {
      title: <span className={headerClass}>Progress %</span>,
      dataIndex: 'progress',
      width: 110,
      render: (v: number) => (
        <span className={`${cellClass} tabular-nums`}>{v}%</span>
      ),
    },
  ];

  const emptyDescription =
    reportKey === 'readiness'
      ? 'No successor readiness data yet.'
      : reportKey === 'gaps'
        ? 'No skill gaps recorded yet.'
        : 'No development plan data yet.';

  return (
    <div className="pt-3" data-cy="succession-planning-reports-section">
      <div
        className="flex flex-wrap justify-between gap-3 mb-3 items-start"
        data-cy="succession-reports-toolbar"
      >
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Select
            value={reportKey}
            onChange={(value) => onReportKeyChange(value)}
            className="min-w-[220px] sm:min-w-[260px]"
            options={SUCCESSION_REPORT_OPTIONS.map((opt) => ({
              value: opt.key,
              label: opt.label,
            }))}
            data-cy="succession-report-type-select"
          />
          <Input
            placeholder="Search report"
            allowClear
            value={searchValue}
            onChange={(e) => {
              setSearchValue(e.target.value);
              setCurrentPage(1);
            }}
            className="w-[min(100%,280px)] pr-0 py-0 h-10 sm:h-8"
            data-cy="succession-reports-search-input"
            suffix={
              <div className="text-gray-400 border-l border-gray-300 py-1 px-2">
                <SearchOutlined />
              </div>
            }
          />
        </div>
        <Button
          type="default"
          className="h-10 sm:h-8 border border-[#D9D9D9] text-[#4d4d4d] font-normal"
          icon={
            <FileDownloadOutlinedIcon
              style={{ fontSize: 18, display: 'block' }}
            />
          }
          loading={exporting}
          onClick={handleExport}
          data-cy="succession-report-export-btn"
        >
          Export Excel
        </Button>
      </div>

      <p
        className="text-sm text-gray-500 mb-2"
        data-cy="succession-reports-row-count"
      >
        {activeCount} row{activeCount === 1 ? '' : 's'}
      </p>

      <div
        className="overflow-x-auto"
        data-cy="succession-reports-table-wrapper"
      >
        {reportKey === 'readiness' ? (
          <Table
            columns={readinessColumns}
            dataSource={pageSlice(filteredReadiness)}
            rowKey="key"
            pagination={false}
            size="middle"
            scroll={{ x: 'max-content' }}
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={emptyDescription}
                />
              ),
            }}
            rowClassName={(_, index) =>
              index % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]'
            }
            data-cy="succession-readiness-report-table"
          />
        ) : reportKey === 'gaps' ? (
          <Table
            columns={gapColumns}
            dataSource={pageSlice(filteredGaps)}
            rowKey="key"
            pagination={false}
            size="middle"
            scroll={{ x: 'max-content' }}
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={emptyDescription}
                />
              ),
            }}
            rowClassName={(_, index) =>
              index % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]'
            }
            data-cy="succession-gaps-report-table"
          />
        ) : (
          <Table
            columns={idpColumns}
            dataSource={pageSlice(filteredIdp)}
            rowKey="key"
            pagination={false}
            size="middle"
            scroll={{ x: 'max-content' }}
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={emptyDescription}
                />
              ),
            }}
            rowClassName={(_, index) =>
              index % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]'
            }
            data-cy="succession-idp-report-table"
          />
        )}
      </div>

      {activeCount > 0 &&
        (isMobile || isTablet ? (
          <CustomMobilePagination
            totalResults={activeCount}
            pageSize={pageSize}
            currentPage={currentPage}
            onChange={onPageChange}
            onShowSizeChange={onPageChange}
            data-cy="succession-reports-mobile-pagination"
          />
        ) : (
          <CustomPagination
            current={currentPage}
            total={activeCount}
            pageSize={pageSize}
            onChange={onPageChange}
            onShowSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
            data-cy="succession-reports-desktop-pagination"
          />
        ))}
    </div>
  );
};

export default ReportsView;
