'use client';

import React, { useMemo, useState } from 'react';
import { Select } from 'antd';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useGetDepartments } from '@/store/server/features/employees/employeeManagment/department/queries';

ChartJS.register(ArcElement, Tooltip, Legend);

const STATUS_COLORS = {
  completed: '#52C41A',
  onTrack: '#FAAD14',
  behind: '#FF7875',
  critical: '#CF1322',
} as const;

/** Placeholder breakdown when “Level 1” (no department) is selected */
const level1DepartmentRows = [
  { name: 'People & HR', percent: 73, color: STATUS_COLORS.completed },
  { name: 'Sales', percent: 60, color: STATUS_COLORS.onTrack },
  { name: 'Product Design', percent: 54, color: STATUS_COLORS.behind },
  { name: 'Marketing', percent: 40, color: STATUS_COLORS.critical },
  { name: 'Engineering', percent: 40, color: STATUS_COLORS.behind },
];

const legendItems = [
  { label: 'Completed', color: STATUS_COLORS.completed },
  { label: 'On Track', color: STATUS_COLORS.onTrack },
  { label: 'Behind', color: STATUS_COLORS.behind },
  { label: 'Critical', color: STATUS_COLORS.critical },
];

export default function OkrProgressCard() {
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<
    string | undefined
  >();
  const { data: departmentsData, isLoading: departmentsLoading } =
    useGetDepartments();

  const departmentsList = useMemo(
    () => (Array.isArray(departmentsData) ? departmentsData : []),
    [departmentsData],
  );

  const departmentRows = useMemo(() => {
    if (!selectedDepartmentId) return level1DepartmentRows;
    const d = departmentsList.find(
      (dept: { id: string }) => dept.id === selectedDepartmentId,
    );
    if (!d) return level1DepartmentRows;
    return [
      {
        name: d.name,
        percent: 54,
        color: STATUS_COLORS.onTrack,
      },
    ];
  }, [selectedDepartmentId, departmentsList]);

  const isLevel1 = !selectedDepartmentId;

  const pieData = {
    labels: legendItems.map((i) => i.label),
    datasets: [
      {
        data: [28, 32, 22, 18],
        backgroundColor: legendItems.map((i) => i.color),
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
    },
  };

  return (
    <section
      className="h-[406px] rounded-lg border border-gray-200 bg-white p-3 shadow-sm"
      data-cy="performance-okr-progress-card"
    >
      <div className="mb-4 flex justify-between gap-2">
        <p className="text-base font-bold text-black">OKR Progress</p>
        <div className="flex items-center gap-4 text-sm">
          <button
            type="button"
            onClick={() => setSelectedDepartmentId(undefined)}
            className={`h-[22px] rounded-md border px-3 text-xs font-normal transition-colors ${
              isLevel1
                ? 'border-blue-700 bg-blue-50 text-blue-800'
                : 'border-gray-200 bg-gray-50 text-gray-600'
            }`}
          >
            Level 1
          </button>
          <Select
            size="small"
            allowClear
            showSearch
            loading={departmentsLoading}
            placeholder="Department"
            value={selectedDepartmentId}
            optionFilterProp="label"
            onChange={(value) => setSelectedDepartmentId(value)}
            className="min-w-[168px] text-xs"
            popupMatchSelectWidth={false}
            data-cy="performance-okr-progress-select-department"
            options={departmentsList.map((dept: { id: string; name: string }) => ({
              value: dept.id,
              label: dept.name,
            }))}
          />
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-4">
        {legendItems.map((item) => (
          <div key={item.label} className="flex items-center gap-2 text-sm">
            <span
              className="h-2 w-2 rounded-none"
              style={{ backgroundColor: item.color }}
              aria-hidden
            />
            <span className="text-xs font-normal text-black/70">
              {item.label}
            </span>
          </div>
        ))}
      </div>

      <div className="flex flex-col justify-center gap-10 md:flex-row md:items-center">
        <div className="mx-auto h-[284px] w-[284px] shrink-0 md:mx-0">
          <Pie data={pieData} options={pieOptions} />
        </div>
        <div className="scrollbar-none h-[281px] min-w-0 flex-1 space-y-7 overflow-y-auto">
          {departmentRows.map((dept, index) => (
            <div
              key={
                selectedDepartmentId ?? `${dept.name}-${String(index)}`
              }
            >
              <div className="mb-1 flex justify-between text-sm">
                <span className="font-medium text-gray-800">{dept.name}</span>
                <span className="text-gray-600">{dept.percent}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${dept.percent}%`,
                    backgroundColor: dept.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
