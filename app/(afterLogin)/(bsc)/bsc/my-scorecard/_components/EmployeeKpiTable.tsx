'use client';

import React, { useMemo, useState } from 'react';
import { Button, Popover, Progress, Select, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { CloseOutlined } from '@ant-design/icons';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import { useRouter } from 'next/navigation';
import CustomPagination from '@/components/customPagination';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import { TableSkeleton } from '@/components/tableSkeleton';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useGetBscScorecards } from '@/store/server/features/bsc/queries';
import { EmployeeScorecard } from '@/types/bsc';
import {
  computeRollup,
  departmentRollups,
  formatScore,
  isScorecardApproved,
  latestScorecardsByEmployee,
  scorecardTotal,
  type RollupSummary,
} from '@/utils/bsc/rollup';

const tableHeaderClassName = 'text-[#4d4d4d] text-base font-bold';
const tableCellClassName = 'text-[#4d4d4d] text-sm font-normal';

const rollupCardShellClass =
  'flex flex-col gap-4 h-[148px] min-w-[260px] flex-none rounded-lg border border-[#D9D9D9] bg-white p-4 text-left shadow-none transition-shadow hover:shadow-sm cursor-pointer';

type EmployeeKpiRow = EmployeeScorecard & {
  kpiScore: number;
  kpiCount: number;
  individualCount: number;
};

function RollupProgressCard({
  rollup,
  onClick,
  dataCy,
}: {
  rollup: RollupSummary;
  onClick: () => void;
  dataCy: string;
}) {
  const percent = Number(rollup.averageScore || 0);
  return (
    <button
      type="button"
      onClick={onClick}
      className={rollupCardShellClass}
      data-cy={dataCy}
    >
      <div
        className="flex items-center justify-between"
        data-cy={`${dataCy}-header`}
      >
        <div
          className="rounded-[4px] bg-[#E6F4FF] flex items-center justify-center w-[34px] h-[34px]"
          data-cy={`${dataCy}-icon`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24px"
            viewBox="0 -960 960 960"
            width="24px"
            fill="#1677FF"
            aria-hidden
            data-cy={`${dataCy}-icon-svg`}
          >
            <path
              d="M160-160v-320h160v320H160Zm240 0v-560h160v560H400Zm240 0v-200h160v200H640Z"
              data-cy={`${dataCy}-icon-path`}
            />
          </svg>
        </div>
        <div
          className="font-semibold text-[27px] leading-7 tracking-normal text-gray-900"
          data-cy={`${dataCy}-value`}
        >
          {formatScore(percent)}%
        </div>
      </div>
      <div className="flex flex-col mt-3" data-cy={`${dataCy}-body`}>
        <div
          className="text-gray-500 w-full font-normal text-base text-start truncate"
          data-cy={`${dataCy}-label`}
        >
          {rollup.scope === 'company'
            ? 'Company-wide Scorecard'
            : `${rollup.label} Scorecard`}
        </div>
        <div className="flex gap-2 items-center" data-cy={`${dataCy}-progress`}>
          <Progress
            percent={percent}
            showInfo={false}
            strokeColor="#1f4fd8"
            trailColor="#e5e7eb"
          />
        </div>
      </div>
    </button>
  );
}

export default function EmployeeKpiTable() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | undefined>();
  const [department, setDepartment] = useState<string | undefined>();
  const [filterOpen, setFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { isMobile, isTablet } = useIsMobile();
  const { data: scorecards, isLoading } = useGetBscScorecards();

  const latestByEmployee = useMemo(
    () => latestScorecardsByEmployee(scorecards),
    [scorecards],
  );

  const companyRollup = useMemo(
    () => computeRollup(latestByEmployee, { scope: 'company' }),
    [latestByEmployee],
  );

  const deptRollups = useMemo(
    () => departmentRollups(latestByEmployee),
    [latestByEmployee],
  );

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
      .map((row) => ({
        ...row,
        kpiScore: scorecardTotal(row),
        kpiCount: row.targets.length,
        individualCount: row.targets.filter(
          (t) => t.assignmentSource === 'individual',
        ).length,
      }))
      .sort((a, b) => a.userName.localeCompare(b.userName));
  }, [latestByEmployee, userId, department]);

  const paged = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  const openEmployeeDetail = (row: EmployeeKpiRow) => {
    router.push(
      `/bsc/employees/${encodeURIComponent(row.userId)}?scorecard=${encodeURIComponent(row.id)}`,
    );
  };

  const openCompanyRollup = () => {
    router.push('/bsc/roll-up?scope=company');
  };

  const openDepartmentRollup = (name: string) => {
    router.push(
      `/bsc/roll-up?scope=department&department=${encodeURIComponent(name)}`,
    );
  };

  const columns: ColumnsType<EmployeeKpiRow> = [
    {
      title: (
        <span
          className={tableHeaderClassName}
          data-cy="bsc-all-employee-col-name"
        >
          Employee Name
        </span>
      ),
      dataIndex: 'userName',
      key: 'userName',
      width: 200,
      render: (name: string) => (
        <span className={tableCellClassName} data-cy="bsc-all-employee-name">
          {name}
        </span>
      ),
    },
    {
      title: (
        <span
          className={tableHeaderClassName}
          data-cy="bsc-all-employee-col-title"
        >
          Job Title
        </span>
      ),
      dataIndex: 'positionTitle',
      key: 'positionTitle',
      width: 220,
      render: (title: string) => (
        <span className={tableCellClassName} data-cy="bsc-all-employee-title">
          {title || '—'}
        </span>
      ),
    },
    {
      title: (
        <span
          className={tableHeaderClassName}
          data-cy="bsc-all-employee-col-dept"
        >
          Department
        </span>
      ),
      dataIndex: 'departmentName',
      key: 'departmentName',
      width: 180,
      render: (name: string) => (
        <span className={tableCellClassName} data-cy="bsc-all-employee-dept">
          {name || '—'}
        </span>
      ),
    },
    {
      title: (
        <span
          className={tableHeaderClassName}
          data-cy="bsc-all-employee-col-period"
        >
          Period
        </span>
      ),
      dataIndex: 'cycleLabel',
      key: 'cycleLabel',
      render: (label: string) => (
        <span className={tableCellClassName} data-cy="bsc-all-employee-period">
          {label}
        </span>
      ),
    },
    {
      title: (
        <span
          className={tableHeaderClassName}
          data-cy="bsc-all-employee-col-kpis"
        >
          KPIs
        </span>
      ),
      key: 'kpiCount',
      width: 120,
      render: (unused: unknown, row: EmployeeKpiRow) => (
        <div
          className="flex flex-wrap items-center gap-1"
          data-cy="bsc-all-employee-kpi-cell"
        >
          <span
            className={tableCellClassName}
            data-cy="bsc-all-employee-kpi-count"
          >
            {row.kpiCount}
          </span>
          {row.individualCount > 0 ? (
            <Tag
              className="m-0 h-5 rounded border border-[#91caff] bg-[#e6f4ff] px-1.5 text-[11px] font-normal leading-5 text-[#1677ff]"
              data-cy="bsc-all-employee-individual-tag"
            >
              {row.individualCount} individual
            </Tag>
          ) : null}
        </div>
      ),
    },
    {
      title: (
        <span
          className={tableHeaderClassName}
          data-cy="bsc-all-employee-col-score"
        >
          KPI Score
        </span>
      ),
      dataIndex: 'kpiScore',
      key: 'kpiScore',
      width: 110,
      render: (score: number) => (
        <span className={tableCellClassName} data-cy="bsc-all-employee-score">
          {formatScore(score)}%
        </span>
      ),
    },
    {
      title: (
        <span
          className={tableHeaderClassName}
          data-cy="bsc-all-employee-col-status"
        >
          Status
        </span>
      ),
      key: 'approval',
      width: 110,
      render: (unused: unknown, record: EmployeeKpiRow) =>
        isScorecardApproved(record) ? (
          <Tag color="green" data-cy="bsc-all-employee-status-approved">
            Approved
          </Tag>
        ) : (
          <Tag data-cy="bsc-all-employee-status-pending">Pending</Tag>
        ),
    },
  ];

  const handleReset = () => {
    setUserId(undefined);
    setDepartment(undefined);
    setCurrentPage(1);
  };

  const filterBody = (
    <div className="flex flex-col gap-4" data-cy="bsc-all-employee-filter-body">
      <div
        className="grid grid-cols-1 gap-4 sm:grid-cols-2"
        data-cy="bsc-all-employee-filter-grid"
      >
        <div
          className="flex flex-col gap-2"
          data-cy="bsc-all-employee-filter-employee"
        >
          <label
            className="text-sm font-medium text-gray-700"
            data-cy="bsc-all-employee-filter-employee-label"
          >
            Employee
          </label>
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
            data-cy="bsc-all-employee-filter-employee-select"
          />
        </div>
        <div
          className="flex flex-col gap-2"
          data-cy="bsc-all-employee-filter-dept"
        >
          <label
            className="text-sm font-medium text-gray-700"
            data-cy="bsc-all-employee-filter-dept-label"
          >
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
            data-cy="bsc-all-employee-filter-dept-select"
          />
        </div>
      </div>
    </div>
  );

  const filterPopover = (
    <div
      className="w-[460px] max-w-[460px]"
      data-cy="bsc-all-employee-filter-popover"
    >
      {filterBody}
      <div
        className="flex justify-end gap-2 pt-4 mt-4 border-t border-gray-100"
        data-cy="bsc-all-employee-filter-actions"
      >
        <Button
          onClick={handleReset}
          className="h-8 px-4 rounded-lg text-xs text-gray-700 border-gray-300"
          data-cy="bsc-all-employee-filter-reset"
        >
          Reset
        </Button>
        <Button
          type="primary"
          onClick={() => setFilterOpen(false)}
          className="h-8 px-4 rounded-lg text-xs bg-okr-primary border-okr-primary"
          data-cy="bsc-all-employee-filter-save"
        >
          Save Filter
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-4" data-cy="bsc-all-employee-kpi-table">
      <div
        className="w-full flex flex-nowrap gap-4 overflow-x-auto overflow-y-hidden scrollbar-none pb-1"
        data-cy="bsc-all-employee-rollup-summary"
      >
        <RollupProgressCard
          rollup={companyRollup}
          onClick={openCompanyRollup}
          dataCy="bsc-company-rollup-card"
        />
        {deptRollups.map((row) => (
          <RollupProgressCard
            key={row.departmentName}
            rollup={row}
            onClick={() => {
              if (row.departmentName) openDepartmentRollup(row.departmentName);
            }}
            dataCy={`bsc-department-rollup-card-${row.departmentName}`}
          />
        ))}
      </div>

      <div
        className="border border-[#D9D9D9] rounded-lg"
        data-cy="bsc-all-employee-table-card"
      >
        <div
          className="flex justify-between items-center gap-3 mb-2 px-3 pt-3"
          data-cy="bsc-all-employee-toolbar"
        >
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
              <div
                className="flex justify-between items-start"
                data-cy="bsc-all-employee-filter-title"
              >
                <div data-cy="bsc-all-employee-filter-title-text">
                  <h3
                    className="text-base font-bold text-gray-900 m-0"
                    data-cy="bsc-all-employee-filter-heading"
                  >
                    Filter
                  </h3>
                  <p
                    className="text-xs text-gray-500 mt-1 mb-0"
                    data-cy="bsc-all-employee-filter-hint"
                  >
                    Select all filters that apply
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setFilterOpen(false)}
                  className="text-gray-400 hover:text-gray-600 p-1 border-none bg-transparent cursor-pointer"
                  data-cy="bsc-all-employee-filter-close"
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

        <div
          className="overflow-x-auto mt-2"
          data-cy="bsc-all-employee-table-wrap"
        >
          {isLoading ? (
            <div data-cy="bsc-all-employee-kpi-table-skeleton">
              <TableSkeleton columns={columns} scroll={{ x: 1000 }} />
            </div>
          ) : (
            <Table
              className="w-full cursor-pointer [&_.ant-table]:!border-[#D9D9D9] [&_.ant-table-thead_.ant-table-cell]:!border-[#D9D9D9] [&_.ant-table-tbody_.ant-table-cell]:!border-[#D9D9D9]"
              columns={columns}
              dataSource={paged}
              pagination={false}
              loading={false}
              scroll={{ x: 1000 }}
              rowKey="id"
              rowHoverable={false}
              onRow={(row) => ({
                onClick: () => openEmployeeDetail(row),
              })}
              rowClassName={(unused, index) =>
                index % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]'
              }
              data-cy="bsc-all-employee-table"
            />
          )}
        </div>

        <div className="px-3 pb-3" data-cy="bsc-all-employee-kpi-pagination">
          {isMobile || isTablet ? (
            <CustomMobilePagination
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
    </div>
  );
}
