'use client';

import React, { useMemo, useState } from 'react';
import { Progress, Select, Table, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import RollupProgressCard from '@/app/(afterLogin)/(bsc)/bsc/_components/RollupProgressCard';
import { formatRollupAverage, type RollupSummary } from '@/utils/bsc/rollup';
import type { ResultsScope } from '@/utils/bsc/scorecardTab';

const tableHeaderClassName = 'text-[#4d4d4d] text-base font-bold';
const tableCellClassName = 'text-[#4d4d4d] text-sm font-normal';

type Props = {
  companyRollup: RollupSummary;
  deptRollups: RollupSummary[];
  resultsScope: ResultsScope;
  companyLabel: string;
  onCompanyClick: () => void;
  onDepartmentClick: (departmentName: string) => void;
};

export default function RollupHubCards({
  companyRollup,
  deptRollups,
  resultsScope,
  companyLabel,
  onCompanyClick,
  onDepartmentClick,
}: Props) {
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(
    null,
  );

  const departmentOptions = useMemo(
    () =>
      deptRollups.map((row) => {
        const name = row.departmentName || row.label;
        return { value: name, label: name };
      }),
    [deptRollups],
  );

  const filteredDepts = useMemo(() => {
    if (!selectedDepartment) return deptRollups;
    return deptRollups.filter(
      (row) => (row.departmentName || row.label) === selectedDepartment,
    );
  }, [deptRollups, selectedDepartment]);

  const columns: ColumnsType<RollupSummary> = [
    {
      title: (
        <span
          className={tableHeaderClassName}
          data-cy="bsc-rollup-hub-col-department"
        >
          Department
        </span>
      ),
      key: 'department',
      sorter: (a, b) =>
        (a.departmentName || a.label).localeCompare(
          b.departmentName || b.label,
        ),
      render: (unused: unknown, row) => {
        const name = row.departmentName || row.label;
        return (
          <Tooltip title={name}>
            <span
              className={`${tableCellClassName} block max-w-[280px] truncate`}
              data-cy="bsc-rollup-hub-dept-name"
            >
              {name}
            </span>
          </Tooltip>
        );
      },
    },
    {
      title: (
        <span className={tableHeaderClassName} data-cy="bsc-rollup-hub-col-avg">
          Avg score
        </span>
      ),
      key: 'averageScore',
      width: 200,
      defaultSortOrder: 'descend',
      sorter: (a, b) => {
        if (!a.evaluatedCount && !b.evaluatedCount) return 0;
        if (!a.evaluatedCount) return 1;
        if (!b.evaluatedCount) return -1;
        return a.averageScore - b.averageScore;
      },
      render: (unused: unknown, row) => {
        const hasScore = row.evaluatedCount > 0;
        const barPercent = hasScore
          ? Math.max(Number(row.averageScore) || 0, 0)
          : 0;
        return (
          <div
            className="flex min-w-0 items-center gap-2"
            data-cy="bsc-rollup-hub-avg-cell"
          >
            <span
              className={`${tableCellClassName} w-12 shrink-0`}
              data-cy="bsc-rollup-hub-avg-value"
            >
              {formatRollupAverage(row)}
            </span>
            <Progress
              size="small"
              percent={barPercent}
              showInfo={false}
              strokeColor="#1f4fd8"
              trailColor="#e5e7eb"
              className="!m-0 min-w-0 flex-1 [&_.ant-progress-outer]:!w-full"
            />
          </div>
        );
      },
    },
    {
      title: (
        <span
          className={tableHeaderClassName}
          data-cy="bsc-rollup-hub-col-evaluated"
        >
          Evaluated
        </span>
      ),
      key: 'evaluatedCount',
      width: 120,
      sorter: (a, b) => a.evaluatedCount - b.evaluatedCount,
      render: (unused: unknown, row) => (
        <span className={tableCellClassName} data-cy="bsc-rollup-hub-evaluated">
          {row.evaluatedCount}/{row.totalCount}
        </span>
      ),
    },
    {
      title: (
        <span
          className={tableHeaderClassName}
          data-cy="bsc-rollup-hub-col-pending"
        >
          Pending
        </span>
      ),
      key: 'pendingCount',
      width: 110,
      sorter: (a, b) => a.pendingCount - b.pendingCount,
      render: (unused: unknown, row) => (
        <span className={tableCellClassName} data-cy="bsc-rollup-hub-pending">
          {row.pendingCount}
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4" data-cy="bsc-rollup-hub-cards">
      <RollupProgressCard
        rollup={companyRollup}
        label={companyLabel}
        onClick={onCompanyClick}
        dataCy="bsc-rollup-hub-company"
      />

      {resultsScope === 'all' ? (
        <div
          className="rounded-xl border border-[#E5E7EB] bg-white overflow-hidden"
          data-cy="bsc-rollup-hub-dept-panel"
        >
          <div
            className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-[#F0F0F0]"
            data-cy="bsc-rollup-hub-dept-toolbar"
          >
            <div data-cy="bsc-rollup-hub-dept-title-block">
              <h2
                className="m-0 text-lg font-semibold text-[#262626]"
                data-cy="bsc-rollup-hub-dept-title"
              >
                Departments
              </h2>
              <p
                className="m-0 mt-1 text-sm text-[#8F94A3]"
                data-cy="bsc-rollup-hub-dept-subtitle"
              >
                Click a department to see contributing employees.
              </p>
            </div>
            <Select
              allowClear
              showSearch
              optionFilterProp="label"
              placeholder="Select department"
              value={selectedDepartment}
              options={departmentOptions}
              onChange={(value) => setSelectedDepartment(value ?? null)}
              className="w-full max-w-[280px]"
              data-cy="bsc-rollup-hub-dept-search"
            />
          </div>

          {!filteredDepts.length ? (
            <div
              className="px-4 py-10 text-center text-sm text-[#8F94A3]"
              data-cy="bsc-rollup-hub-dept-empty"
            >
              {selectedDepartment
                ? 'No departments match your selection'
                : 'No departments in this scope'}
            </div>
          ) : (
            <div
              className="overflow-x-auto"
              data-cy="bsc-rollup-hub-dept-table-wrap"
            >
              <Table
                className="w-full cursor-pointer"
                columns={columns}
                dataSource={filteredDepts}
                pagination={false}
                rowKey={(row) => row.departmentName || row.label}
                rowHoverable
                scroll={{ x: 640 }}
                onRow={(row) => ({
                  onClick: () => {
                    if (row.departmentName) {
                      onDepartmentClick(row.departmentName);
                    }
                  },
                })}
                rowClassName={(unused, index) =>
                  index % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]'
                }
                data-cy="bsc-rollup-hub-dept-table"
              />
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
