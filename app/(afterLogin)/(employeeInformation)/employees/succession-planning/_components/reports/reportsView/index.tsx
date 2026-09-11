'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { Empty, Input, Select, Table, Tag } from 'antd';
import type { TableColumnsType } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import CustomPagination from '@/components/customPagination';
import { useIsMobile } from '@/hooks/useIsMobile';
import type { CriticalRole } from '../../criticalRoleModal';
import {
  gapSeverityColor,
  importanceColor,
  readinessColor,
} from '../../tagColors';
import type { CompetencyImportance } from '../../steps/stepCompetencyDefinition';
import type { GapSeverity, SuccessorReadiness } from '../../successionTypes';
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

  const readinessColumns: TableColumnsType<ReadinessReportRow> = [
    {
      title: (
        <span
          data-cy="-components-reports-reportsview-index-tsx-index-span-122"
          className={headerClass}
        >
          Role
        </span>
      ),
      dataIndex: 'role',
      ellipsis: true,
      render: (v: string) => (
        <span
          data-cy="-components-reports-reportsview-index-tsx-index-span-126"
          className={`${cellClass} font-medium`}
        >
          {v}
        </span>
      ),
    },
    {
      title: (
        <span
          data-cy="-components-reports-reportsview-index-tsx-index-span-130"
          className={headerClass}
        >
          Department
        </span>
      ),
      dataIndex: 'department',
      ellipsis: true,
      render: (v: string) => (
        <span
          data-cy="-components-reports-reportsview-index-tsx-index-span-133"
          className={cellClass}
        >
          {v}
        </span>
      ),
    },
    {
      title: (
        <span
          data-cy="-components-reports-reportsview-index-tsx-index-span-136"
          className={headerClass}
        >
          Successor
        </span>
      ),
      dataIndex: 'successor',
      ellipsis: true,
      render: (v: string) => (
        <span
          data-cy="-components-reports-reportsview-index-tsx-index-span-139"
          className={cellClass}
        >
          {v}
        </span>
      ),
    },
    {
      title: (
        <span
          data-cy="-components-reports-reportsview-index-tsx-index-span-142"
          className={headerClass}
        >
          Current Position
        </span>
      ),
      dataIndex: 'position',
      ellipsis: true,
      render: (v: string) => (
        <span
          data-cy="-components-reports-reportsview-index-tsx-index-span-145"
          className={cellClass}
        >
          {v || '—'}
        </span>
      ),
    },
    {
      title: (
        <span
          data-cy="-components-reports-reportsview-index-tsx-index-span-148"
          className={headerClass}
        >
          Readiness
        </span>
      ),
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
          <span
            data-cy="-components-reports-reportsview-index-tsx-index-span-160"
            className={cellClass}
          >
            —
          </span>
        ),
    },
    {
      title: (
        <span
          data-cy="-components-reports-reportsview-index-tsx-index-span-164"
          className={headerClass}
        >
          Education
        </span>
      ),
      dataIndex: 'education',
      ellipsis: true,
      render: (v: string) => (
        <span
          data-cy="-components-reports-reportsview-index-tsx-index-span-167"
          className={cellClass}
        >
          {v || '—'}
        </span>
      ),
    },
    {
      title: (
        <span
          data-cy="-components-reports-reportsview-index-tsx-index-span-170"
          className={headerClass}
        >
          Relevant Experience
        </span>
      ),
      dataIndex: 'experience',
      width: 160,
      render: (v: string) => (
        <span
          data-cy="-components-reports-reportsview-index-tsx-index-span-173"
          className={cellClass}
        >
          {v || '—'}
        </span>
      ),
    },
  ];

  const gapColumns: TableColumnsType<GapReportRow> = [
    {
      title: (
        <span
          data-cy="-components-reports-reportsview-index-tsx-index-span-179"
          className={headerClass}
        >
          Role
        </span>
      ),
      dataIndex: 'role',
      ellipsis: true,
      render: (v: string) => (
        <span
          data-cy="-components-reports-reportsview-index-tsx-index-span-183"
          className={`${cellClass} font-medium`}
        >
          {v}
        </span>
      ),
    },
    {
      title: (
        <span
          data-cy="-components-reports-reportsview-index-tsx-index-span-187"
          className={headerClass}
        >
          Successor
        </span>
      ),
      dataIndex: 'successor',
      ellipsis: true,
      render: (v: string) => (
        <span
          data-cy="-components-reports-reportsview-index-tsx-index-span-190"
          className={cellClass}
        >
          {v}
        </span>
      ),
    },
    {
      title: (
        <span
          data-cy="-components-reports-reportsview-index-tsx-index-span-193"
          className={headerClass}
        >
          Required Competency
        </span>
      ),
      dataIndex: 'competency',
      ellipsis: true,
      render: (v: string) => (
        <span
          data-cy="-components-reports-reportsview-index-tsx-index-span-196"
          className={cellClass}
        >
          {v}
        </span>
      ),
    },
    {
      title: (
        <span
          data-cy="-components-reports-reportsview-index-tsx-index-span-199"
          className={headerClass}
        >
          Category
        </span>
      ),
      dataIndex: 'category',
      width: 110,
      render: (v: string) => (
        <span
          data-cy="-components-reports-reportsview-index-tsx-index-span-202"
          className={cellClass}
        >
          {v}
        </span>
      ),
    },
    {
      title: (
        <span
          data-cy="-components-reports-reportsview-index-tsx-index-span-205"
          className={headerClass}
        >
          Importance
        </span>
      ),
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
      title: (
        <span
          data-cy="-components-reports-reportsview-index-tsx-index-span-218"
          className={headerClass}
        >
          Required Level
        </span>
      ),
      dataIndex: 'required',
      ellipsis: true,
      render: (v: string) => (
        <span
          data-cy="-components-reports-reportsview-index-tsx-index-span-221"
          className={cellClass}
        >
          {v || '—'}
        </span>
      ),
    },
    {
      title: (
        <span
          data-cy="-components-reports-reportsview-index-tsx-index-span-224"
          className={headerClass}
        >
          Current Level
        </span>
      ),
      dataIndex: 'current',
      ellipsis: true,
      render: (v: string) => (
        <span
          data-cy="-components-reports-reportsview-index-tsx-index-span-227"
          className={cellClass}
        >
          {v || '—'}
        </span>
      ),
    },
    {
      title: (
        <span
          data-cy="-components-reports-reportsview-index-tsx-index-span-230"
          className={headerClass}
        >
          Severity
        </span>
      ),
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
      title: (
        <span
          data-cy="-components-reports-reportsview-index-tsx-index-span-243"
          className={headerClass}
        >
          Status
        </span>
      ),
      dataIndex: 'status',
      width: 120,
      render: (v: string) => (
        <span
          data-cy="-components-reports-reportsview-index-tsx-index-span-246"
          className={cellClass}
        >
          {v}
        </span>
      ),
    },
  ];

  const idpColumns: TableColumnsType<IdpReportRow> = [
    {
      title: (
        <span
          data-cy="-components-reports-reportsview-index-tsx-index-span-252"
          className={headerClass}
        >
          Role
        </span>
      ),
      dataIndex: 'role',
      ellipsis: true,
      render: (v: string) => (
        <span
          data-cy="-components-reports-reportsview-index-tsx-index-span-256"
          className={`${cellClass} font-medium`}
        >
          {v}
        </span>
      ),
    },
    {
      title: (
        <span
          data-cy="-components-reports-reportsview-index-tsx-index-span-260"
          className={headerClass}
        >
          Successor
        </span>
      ),
      dataIndex: 'successor',
      ellipsis: true,
      render: (v: string) => (
        <span
          data-cy="-components-reports-reportsview-index-tsx-index-span-263"
          className={cellClass}
        >
          {v}
        </span>
      ),
    },
    {
      title: (
        <span
          data-cy="-components-reports-reportsview-index-tsx-index-span-266"
          className={headerClass}
        >
          IDP Status
        </span>
      ),
      dataIndex: 'idpStatus',
      width: 110,
      render: (v: string) => (
        <span
          data-cy="-components-reports-reportsview-index-tsx-index-span-269"
          className={cellClass}
        >
          {v || '—'}
        </span>
      ),
    },
    {
      title: (
        <span
          data-cy="-components-reports-reportsview-index-tsx-index-span-272"
          className={headerClass}
        >
          Activity Type
        </span>
      ),
      dataIndex: 'type',
      ellipsis: true,
      render: (v: string) => (
        <span
          data-cy="-components-reports-reportsview-index-tsx-index-span-275"
          className={cellClass}
        >
          {v || '—'}
        </span>
      ),
    },
    {
      title: (
        <span
          data-cy="-components-reports-reportsview-index-tsx-index-span-278"
          className={headerClass}
        >
          Activity
        </span>
      ),
      dataIndex: 'activity',
      ellipsis: true,
      render: (v: string) => (
        <span
          data-cy="-components-reports-reportsview-index-tsx-index-span-281"
          className={cellClass}
        >
          {v || '—'}
        </span>
      ),
    },
    {
      title: (
        <span
          data-cy="-components-reports-reportsview-index-tsx-index-span-284"
          className={headerClass}
        >
          Target Date
        </span>
      ),
      dataIndex: 'target',
      width: 120,
      render: (v: string) => (
        <span
          data-cy="-components-reports-reportsview-index-tsx-index-span-288"
          className={`${cellClass} tabular-nums`}
        >
          {v || '—'}
        </span>
      ),
    },
    {
      title: (
        <span
          data-cy="-components-reports-reportsview-index-tsx-index-span-292"
          className={headerClass}
        >
          Activity Status
        </span>
      ),
      dataIndex: 'activityStatus',
      width: 130,
      render: (v: string) => (
        <span
          data-cy="-components-reports-reportsview-index-tsx-index-span-295"
          className={cellClass}
        >
          {v || '—'}
        </span>
      ),
    },
    {
      title: (
        <span
          data-cy="-components-reports-reportsview-index-tsx-index-span-298"
          className={headerClass}
        >
          Open Actions
        </span>
      ),
      dataIndex: 'openActions',
      width: 120,
      render: (v: number) => (
        <span
          data-cy="-components-reports-reportsview-index-tsx-index-span-302"
          className={`${cellClass} tabular-nums`}
        >
          {v}
        </span>
      ),
    },
    {
      title: (
        <span
          data-cy="-components-reports-reportsview-index-tsx-index-span-306"
          className={headerClass}
        >
          Completed
        </span>
      ),
      dataIndex: 'completedActions',
      width: 110,
      render: (v: number) => (
        <span
          data-cy="-components-reports-reportsview-index-tsx-index-span-310"
          className={`${cellClass} tabular-nums`}
        >
          {v}
        </span>
      ),
    },
    {
      title: (
        <span
          data-cy="-components-reports-reportsview-index-tsx-index-span-314"
          className={headerClass}
        >
          Progress %
        </span>
      ),
      dataIndex: 'progress',
      width: 110,
      render: (v: number) => (
        <span
          data-cy="-components-reports-reportsview-index-tsx-index-span-318"
          className={`${cellClass} tabular-nums`}
        >
          {v}%
        </span>
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
        {/* Search leads; the report-type filter takes the slot the Export
            button used to occupy. Export now lives on the top bar. */}
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
            <div
              data-cy="-components-reports-reportsview-index-tsx-index-div-349"
              className="text-gray-400 border-l border-gray-300 py-1 px-2"
            >
              <SearchOutlined />
            </div>
          }
        />
        <Select
          value={reportKey}
          onChange={(value) => onReportKeyChange(value)}
          className="min-w-[220px] sm:min-w-[260px] h-10 sm:h-8"
          options={SUCCESSION_REPORT_OPTIONS.map((opt) => ({
            value: opt.key,
            label: opt.label,
          }))}
          data-cy="succession-report-type-select"
        />
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
            rowClassName={(unusedRecord, index) =>
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
            rowClassName={(unusedRecord, index) =>
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
            rowClassName={(unusedRecord, index) =>
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
