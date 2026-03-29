'use client';

import React, { useMemo, useState } from 'react';
import { Progress, Select } from 'antd';
import { OkrProgressCardSkeleton } from './PerformanceCardSkeletons';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useGetDepartments } from '@/store/server/features/employees/employeeManagment/department/queries';
import { useGetOkrDepartmentsOkrProgress } from '@/store/server/features/performance/okr-total-summary/queries';
import { useGetActiveSession } from '@/store/server/features/okrplanning/okr/target/queries';

ChartJS.register(ArcElement, Tooltip, Legend);

const STATUS_COLORS = {
  completed: '#52C41A',
  onTrack: '#FAAD14',
  behind: '#FF7875',
  critical: '#CF1322',
} as const;

const legendItems = [
  { label: 'Completed', color: STATUS_COLORS.completed },
  { label: 'On Track', color: STATUS_COLORS.onTrack },
  { label: 'Behind', color: STATUS_COLORS.behind },
  { label: 'Critical', color: STATUS_COLORS.critical },
];

function strokeColorForScore(percent: number): string {
  if (percent >= 66) return STATUS_COLORS.completed;
  if (percent >= 33) return STATUS_COLORS.onTrack;
  if (percent > 0) return STATUS_COLORS.behind;
  return STATUS_COLORS.critical;
}

type OkrProgressCardProps = {
  sessionId?: string | null;
};

export default function OkrProgressCard({
  sessionId: sessionIdProp,
}: OkrProgressCardProps) {
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<
    string | undefined
  >();

  const { data: activeSession, isLoading: activeSessionLoading } =
    useGetActiveSession();
  const { data: departmentsData, isLoading: departmentsLoading } =
    useGetDepartments();

  const resolvedSessionId =
    sessionIdProp ??
    (activeSession as { id?: string } | undefined)?.id ??
    undefined;

  const departmentsList = useMemo(
    () => (Array.isArray(departmentsData) ? departmentsData : []),
    [departmentsData],
  );

  const progressPayload = useMemo(() => {
    if (!resolvedSessionId) return null;
    if (selectedDepartmentId) {
      return {
        sessionId: resolvedSessionId,
        orgLevel: 3,
        departmentIds: [selectedDepartmentId],
      };
    }
    return {
      sessionId: resolvedSessionId,
      orgLevel: 1,
      departmentIds: [] as string[],
    };
  }, [resolvedSessionId, selectedDepartmentId]);

  const { data, isLoading: progressLoading, isError } =
    useGetOkrDepartmentsOkrProgress(progressPayload);

  const contextLoading = sessionIdProp == null && activeSessionLoading;
  const showSpinner =
    contextLoading || (Boolean(progressPayload) && progressLoading);

  const isLevel1 = !selectedDepartmentId;

  const pieData = useMemo(() => {
    const kr = data?.keyResultProgress;
    return {
      labels: legendItems.map((i) => i.label),
      datasets: [
        {
          data: [
            kr?.completed?.percent ?? 0,
            kr?.onTrack?.percent ?? 0,
            kr?.behind?.percent ?? 0,
            kr?.critical?.percent ?? 0,
          ],
          backgroundColor: legendItems.map((i) => i.color),
          borderWidth: 0,
          hoverOffset: 4,
        },
      ],
    };
  }, [data?.keyResultProgress]);

  const departmentRows = useMemo(() => {
    const list = [...(data?.departments ?? [])];
    list.sort((a, b) => b.okrScorePercent - a.okrScorePercent);
    return list.map((d) => ({
      key: d.departmentId,
      name: d.departmentName,
      percent: Math.round(d.okrScorePercent * 100) / 100,
      color: strokeColorForScore(d.okrScorePercent),
    }));
  }, [data?.departments]);

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
    },
  };

  const missingSession =
    !resolvedSessionId && !showSpinner
      ? 'Active session is not available.'
      : null;

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

      {showSpinner ? (
        <OkrProgressCardSkeleton />
      ) : missingSession ? (
        <p className="text-sm text-gray-500">{missingSession}</p>
      ) : isError ? (
        <p className="text-sm text-red-500">Failed to load OKR progress.</p>
      ) : (
        <>
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

          <div className="flex flex-col justify-center gap-[100px] md:flex-row md:items-center">
            <div className="mx-auto h-[284px] w-[284px] shrink-0 md:mx-0">
              <Pie data={pieData} options={pieOptions} />
            </div>
            <div className="scrollbar-none h-[281px] min-w-0 flex-1 space-y-7 overflow-y-auto">
              {departmentRows.length === 0 ? (
                <p className="text-sm text-gray-500">No department data.</p>
              ) : (
                departmentRows.map((dept) => (
                  <div key={dept.key}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="font-medium text-gray-800">
                        {dept.name}
                      </span>
                      <span className="text-gray-600">{dept.percent}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                      <div className="w-full">
                        <Progress
                          percent={dept.percent}
                          showInfo={false}
                          strokeColor={dept.color}
                          trailColor="#f3f4f6"
                          size="small"
                          className="!h-2 !rounded-full"
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
