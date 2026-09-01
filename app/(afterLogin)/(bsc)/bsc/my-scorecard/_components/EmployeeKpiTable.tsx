'use client';

import React, { useMemo, useState } from 'react';
import { Button, Popover, Select, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { CloseOutlined } from '@ant-design/icons';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import CustomPagination from '@/components/customPagination';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import { TableSkeleton } from '@/components/tableSkeleton';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useGetBscScorecards } from '@/store/server/features/bsc/queries';
import {
  EmployeeScorecard,
  KpiApprovalStatus,
  ScorecardStatus,
} from '@/types/bsc';
import { computeCompositeScore } from '@/utils/bsc/scoring';

const tableHeaderClassName = 'text-[#4d4d4d] text-base font-bold';
const tableCellClassName = 'text-[#4d4d4d] text-sm font-normal';

function scorecardTotal(scorecard: EmployeeScorecard): number {
  const evaluated =
    scorecard.status === ScorecardStatus.Scored ||
    scorecard.status === ScorecardStatus.Completed ||
    scorecard.finalEvaluation?.compositeScore != null;
  if (!evaluated) return 0;
  const result = computeCompositeScore(scorecard.targets);
  let total = 0;
  for (const t of scorecard.targets) {
    const item = result.items.find((b) => b.targetId === t.id);
    const ratio = item ? Math.min(item.ratio, 1) : 0;
    total += ratio * t.weightPercentage;
  }
  return Math.min(total, 100);
}

function formatScore(value: number): string {
  if (!Number.isFinite(value)) return '0';
  return Math.abs(value % 1) < 1e-9
    ? String(Math.round(value))
    : value.toFixed(1);
}

function isScorecardApproved(scorecard: EmployeeScorecard): boolean {
  if (
    scorecard.status === ScorecardStatus.Scored ||
    scorecard.status === ScorecardStatus.Completed
  ) {
    return true;
  }
  return (
    scorecard.targets.length > 0 &&
    scorecard.targets.every((t) => t.approvalStatus === KpiApprovalStatus.Approved)
  );
}

type EmployeeKpiRow = EmployeeScorecard & { kpiScore: number };

export default function EmployeeKpiTable() {
  const [userId, setUserId] = useState<string | undefined>();
  const [department, setDepartment] = useState<string | undefined>();
  const [filterOpen, setFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { isMobile, isTablet } = useIsMobile();
  const { data: scorecards, isLoading } = useGetBscScorecards();

  const latestByEmployee = useMemo(() => {
    const map = new Map<string, EmployeeScorecard>();
    for (const card of scorecards || []) {
      const existing = map.get(card.userId);
      if (!existing) {
        map.set(card.userId, card);
        continue;
      }
      if ((card.updatedAt || '') > (existing.updatedAt || '')) {
        map.set(card.userId, card);
      }
    }
    return Array.from(map.values());
  }, [scorecards]);

  const employeeOptions = useMemo(
    () =>
      latestByEmployee.map((row) => ({
        value: row.userId,
        label: row.userName,
      })),
    [latestByEmployee],
  );

  const departmentOptions = useMemo(() => {
    const set = new Set<string>();
    latestByEmployee.forEach((row) => {
      if (row.departmentName) set.add(row.departmentName);
    });
    return Array.from(set).sort();
  }, [latestByEmployee]);

  const filtered = useMemo(() => {
    return latestByEmployee
      .filter((row) => !userId || row.userId === userId)
      .filter((row) => !department || row.departmentName === department)
      .map((row) => ({ ...row, kpiScore: scorecardTotal(row) }))
      .sort((a, b) => a.userName.localeCompare(b.userName));
  }, [latestByEmployee, userId, department]);

  const paged = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  const columns: ColumnsType<EmployeeKpiRow> = [
    {
      title: <span className={tableHeaderClassName}>Employee Name</span>,
      dataIndex: 'userName',
      key: 'userName',
      width: 200,
      render: (name: string) => (
        <span className={tableCellClassName}>{name}</span>
      ),
    },
    {
      title: <span className={tableHeaderClassName}>Job Title</span>,
      dataIndex: 'positionTitle',
      key: 'positionTitle',
      width: 240,
      render: (title: string) => (
        <span className={tableCellClassName}>{title || '—'}</span>
      ),
    },
    {
      title: <span className={tableHeaderClassName}>Department</span>,
      dataIndex: 'departmentName',
      key: 'departmentName',
      width: 200,
      render: (name: string) => (
        <span className={tableCellClassName}>{name || '—'}</span>
      ),
    },
    {
      title: <span className={tableHeaderClassName}>Period</span>,
      dataIndex: 'cycleLabel',
      key: 'cycleLabel',
      render: (label: string) => (
        <span className={tableCellClassName}>{label}</span>
      ),
    },
    {
      title: <span className={tableHeaderClassName}>KPI Score</span>,
      dataIndex: 'kpiScore',
      key: 'kpiScore',
      render: (score: number) => (
        <span className={tableCellClassName}>{formatScore(score)}%</span>
      ),
    },
    {
      title: <span className={tableHeaderClassName}>Status</span>,
      key: 'approval',
      render: (_: unknown, record: EmployeeKpiRow) =>
        isScorecardApproved(record) ? (
          <Tag color="green">Approved</Tag>
        ) : (
          <Tag>Pending</Tag>
        ),
    },
  ];

  const handleReset = () => {
    setUserId(undefined);
    setDepartment(undefined);
    setCurrentPage(1);
  };

  const filterBody = (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">Employee</label>
          <Select
            showSearch
            allowClear
            placeholder="Select employee"
            className="w-full h-10 rounded-lg"
            value={userId}
            onChange={(value) => {
              setUserId(value);
              setCurrentPage(1);
            }}
            options={employeeOptions}
            optionFilterProp="label"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">
            Department
          </label>
          <Select
            allowClear
            showSearch
            placeholder="Filter by department"
            className="w-full h-10 rounded-lg"
            value={department}
            onChange={(value) => {
              setDepartment(value);
              setCurrentPage(1);
            }}
            options={departmentOptions.map((name) => ({
              value: name,
              label: name,
            }))}
          />
        </div>
      </div>
    </div>
  );

  const filterPopover = (
    <div className="w-[460px] max-w-[460px]">
      {filterBody}
      <div className="flex justify-end gap-2 pt-4 mt-4 border-t border-gray-100">
        <Button
          onClick={handleReset}
          className="h-8 px-4 rounded-lg text-xs text-gray-700 border-gray-300"
        >
          Reset
        </Button>
        <Button
          type="primary"
          onClick={() => setFilterOpen(false)}
          className="h-8 px-4 rounded-lg text-xs bg-okr-primary border-okr-primary"
        >
          Save Filter
        </Button>
      </div>
    </div>
  );

  return (
    <div
      className="border border-[#D9D9D9] rounded-lg"
      data-cy="bsc-all-employee-kpi-table"
    >
      <div className="flex justify-between items-center gap-3 mb-2 px-3 pt-3">
        <Select
          showSearch
          allowClear
          placeholder="Search Employee"
          value={userId}
          onChange={(value) => {
            setUserId(value);
            setCurrentPage(1);
          }}
          className="h-10 w-full sm:w-[300px]"
          options={employeeOptions}
          optionFilterProp="label"
          data-cy="bsc-all-employee-search"
        />
        <Popover
          content={filterPopover}
          title={
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-base font-bold text-gray-900 m-0">
                  Filter
                </h3>
                <p className="text-xs text-gray-500 mt-1 mb-0">
                  Select all filters that apply
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFilterOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 border-none bg-transparent cursor-pointer"
              >
                <CloseOutlined />
              </button>
            </div>
          }
          trigger="click"
          open={filterOpen}
          onOpenChange={setFilterOpen}
          placement="bottomRight"
          arrow={false}
        >
          <Button
            type="default"
            className="inline-flex items-center gap-2 px-3 py-1.5 border border-[#D9D9D9] rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 h-10"
            icon={<FilterAltOutlinedIcon className="py-1" />}
            data-cy="bsc-all-employee-filter"
          >
            Filter
          </Button>
        </Popover>
      </div>

      <div className="overflow-x-auto mt-2">
        {isLoading ? (
          <div data-cy="bsc-all-employee-kpi-table-skeleton">
            <TableSkeleton columns={columns} scroll={{ x: 1000 }} />
          </div>
        ) : (
          <Table
            className="w-full [&_.ant-table]:!border-[#D9D9D9] [&_.ant-table-thead_.ant-table-cell]:!border-[#D9D9D9] [&_.ant-table-tbody_.ant-table-cell]:!border-[#D9D9D9]"
            columns={columns}
            dataSource={paged}
            pagination={false}
            loading={false}
            scroll={{ x: 1000 }}
            rowKey="id"
            rowHoverable={false}
            rowClassName={(_record, index) =>
              index % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]'
            }
          />
        )}
      </div>

      <div className="px-3 pb-3" data-cy="bsc-all-employee-kpi-pagination">
        {isMobile || isTablet ? (
          <CustomMobilePagination
            data-cy="bsc-all-employee-kpi-mobile-pagination"
            totalResults={filtered.length}
            pageSize={pageSize}
            currentPage={currentPage}
            onChange={(page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            }}
          />
        ) : (
          <CustomPagination
            data-cy="bsc-all-employee-kpi-desktop-pagination"
            current={currentPage}
            total={filtered.length || 1}
            pageSize={pageSize}
            onChange={(page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            }}
            onShowSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
          />
        )}
      </div>
    </div>
  );
}
