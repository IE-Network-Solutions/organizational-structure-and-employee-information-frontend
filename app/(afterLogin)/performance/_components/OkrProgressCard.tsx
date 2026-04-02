'use client';
/* eslint-disable local-rules/data-cy-required */

import React, { useMemo, useState } from 'react';
import { Progress, Select } from 'antd';
import { OkrProgressCardSkeleton } from './PerformanceCardSkeletons';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useGetDepartments } from '@/store/server/features/employees/employeeManagment/department/queries';
import { useGetDepartmentsLevels } from '@/store/server/features/performance/departments-levels/queries';
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
  const [selectedOrgLevel, setSelectedOrgLevel] = useState<number>(1);
  const [isLevelsListOpen, setIsLevelsListOpen] = useState(false);

  const { data: activeSession, isLoading: activeSessionLoading } =
    useGetActiveSession();
  const { data: departmentsData, isLoading: departmentsLoading } =
    useGetDepartments();
  const { data: departmentsLevelsData } = useGetDepartmentsLevels();

  const resolvedSessionId =
    sessionIdProp ??
    (activeSession as { id?: string } | undefined)?.id ??
    undefined;

  const departmentsList = useMemo(
    () => (Array.isArray(departmentsData) ? departmentsData : []),
    [departmentsData],
  );

  const filteredDepartmentsList = useMemo(() => {
    return departmentsList?.filter((d) => d.level === selectedOrgLevel);
  }, [departmentsList, selectedOrgLevel]);
  const levelsList = useMemo(() => {
    const rawLevels =
      (departmentsLevelsData as any)?.levels ||
      (departmentsLevelsData as any)?.items ||
      (departmentsLevelsData as any)?.data?.levels ||
      (departmentsLevelsData as any)?.data?.items ||
      departmentsLevelsData;

    const arr = Array.isArray(rawLevels) ? rawLevels : [];

    return arr
      .map((lvl: any, idx: number) => {
        const levelNumber = Number(
          lvl?.orgLevel ?? lvl?.level ?? lvl?.value ?? lvl?.number ?? idx + 1,
        );

        return {
          id: String(lvl?.id ?? levelNumber),
          levelNumber: Number.isFinite(levelNumber) ? levelNumber : idx + 1,
          label: String(
            lvl?.name ?? lvl?.label ?? lvl?.title ?? `Level ${levelNumber}`,
          ),
        };
      })
      .sort((a, b) => a.levelNumber - b.levelNumber);
  }, [departmentsLevelsData]);

  const selectedLevel = useMemo(
    () => levelsList.find((l) => l.levelNumber === selectedOrgLevel) ?? null,
    [levelsList, selectedOrgLevel],
  );

  const orderedLevels = useMemo(() => {
    if (!levelsList.length) return [];

    const hasSelected = levelsList.some(
      (l) => l.levelNumber === selectedOrgLevel,
    );

    if (!hasSelected) return levelsList;

    return [
      ...levelsList.filter((l) => l.levelNumber === selectedOrgLevel),
      ...levelsList.filter((l) => l.levelNumber !== selectedOrgLevel),
    ];
  }, [levelsList, selectedOrgLevel]);

  const progressPayload = useMemo(() => {
    if (!resolvedSessionId) return null;

    const orgLevel = selectedOrgLevel ?? 1;
    const departmentIds =
      orgLevel === 1
        ? []
        : selectedDepartmentId
          ? [selectedDepartmentId]
          : ([] as string[]);

    return {
      sessionId: resolvedSessionId,
      orgLevel,
      departmentIds,
    };
  }, [resolvedSessionId, selectedDepartmentId, selectedOrgLevel]);

  const {
    data,
    isLoading: progressLoading,
    isError,
  } = useGetOkrDepartmentsOkrProgress(progressPayload);

  const contextLoading = sessionIdProp == null && activeSessionLoading;
  const showSpinner =
    contextLoading || (Boolean(progressPayload) && progressLoading);

  const isLevel1 = selectedOrgLevel === 1;

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
      className="md:h-[406px] h-[700px] rounded-lg border border-gray-200 bg-white p-3 shadow-sm"
      data-cy="performance-okr-progress-card"
    >
      <div className="mb-4 flex md:flex-row flex-col justify-between gap-2">
        <p className="text-base font-bold text-black">OKR Progress</p>
        <div className="flex items-center gap-4 text-sm">
          <label htmlFor="performance-okr-level-select" className="sr-only">
            Select organization level
          </label>
          <Select
            size="small"
            id="performance-okr-level-select"
            data-cy="performance-okr-level-select"
            className="block sm:hidden w-[170px]"
            placeholder="Organization Level"
            value={orderedLevels.length ? selectedOrgLevel : undefined}
            onChange={(value) => {
              setSelectedOrgLevel(Number(value));
              setSelectedDepartmentId(undefined);
              setIsLevelsListOpen(false);
            }}
            disabled={!orderedLevels.length}
            options={orderedLevels.map((level) => ({
              value: level.levelNumber,
              label: `Org-${level.label}`,
            }))}
          />

          {!isLevelsListOpen && (
            <button
              type="button"
              onClick={() => setIsLevelsListOpen((prev) => !prev)}
              aria-expanded={isLevelsListOpen}
              aria-controls="performance-okr-level-items"
              className={`hidden sm:block px-3 py-1 text-xs rounded border transition flex-shrink-0 ${
                isLevel1
                  ? 'bg-blue-50 text-blue-800 border-blue-700 hover:bg-blue-50'
                  : 'bg-gray-100 text-gray-900 border-gray-300 hover:bg-gray-50'
              }`}
              id="performance-okr-level-active-toggle"
              data-cy="performance-okr-level-active-toggle"
            >
              Org-{selectedLevel?.label ?? `Level ${selectedOrgLevel}`}
            </button>
          )}

          {isLevelsListOpen && (
            <div
              id="performance-okr-level-items"
              data-cy="performance-okr-level-items"
              className="hidden sm:flex flex-nowrap items-center gap-2 justify-end overflow-x-auto"
            >
              {orderedLevels.length ? (
                orderedLevels.map((level) => (
                  <button
                    key={level.id}
                    type="button"
                    onClick={() => {
                      setSelectedOrgLevel(level.levelNumber);
                      setSelectedDepartmentId(undefined);
                      setIsLevelsListOpen(false);
                    }}
                    className={[
                      'px-3 py-1 text-xs rounded border transition flex-shrink-0',
                      selectedOrgLevel === level.levelNumber
                        ? 'bg-gray-100 text-gray-900 border-gray-300'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50',
                    ].join(' ')}
                    id={`performance-okr-level-item-${level.id}`}
                    data-cy={`performance-okr-level-item-${level.id}`}
                  >
                    Org-{level.label}
                  </button>
                ))
              ) : (
                <button
                  type="button"
                  className="px-3 py-1 text-xs rounded border transition flex-shrink-0 bg-white text-gray-600 border-gray-200"
                  onClick={() => setIsLevelsListOpen(false)}
                >
                  No Levels
                </button>
              )}
            </div>
          )}
          <Select
            size="small"
            allowClear
            showSearch
            loading={departmentsLoading}
            placeholder="Department"
            value={selectedDepartmentId}
            onChange={(value) => setSelectedDepartmentId(value)}
            className="md:w-[168px] w-full text-xs"
            style={{
              backgroundColor: selectedDepartmentId ? '#E6F4FF' : 'transparent',
            }}
            popupClassName="[&_.ant-select-item-option-selected:not(.ant-select-item-option-disabled)]:!bg-[#E6F4FF]"
            // popupMatchSelectWidth={false}
            data-cy="performance-okr-progress-select-department"
            options={filteredDepartmentsList.map(
              (dept: { id: string; name: string }) => ({
                value: dept.id,
                label: dept.name,
              }),
            )}
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

          <div className="flex flex-col  md:gap-[100px] gap-10 md:flex-row md:items-center">
            <div className=" md:mx-0 mx-auto h-[284px] w-[284px]">
              <Pie data={pieData} options={pieOptions} />
            </div>
            <div className=" md:space-y-7 space-y-2 w-full">
              {departmentRows.length === 0 ? (
                <p className="text-sm text-gray-500">No department data.</p>
              ) : (
                <div className="scrollbar-none h-[240px] min-w-0 flex-1 space-y-2 overflow-y-auto md:h-[280px] md:space-y-7 md:overflow-y-auto md:pr-2">
                  {departmentRows.map((dept) => (
                    <div key={dept.key}>
                      <div className="mb-1 flex justify-between text-sm">
                        <span className="font-medium text-gray-800">
                          {dept.name}
                        </span>
                        <span className="text-black font-bold">
                          {dept.percent}%
                        </span>
                      </div>
                      {/* <div className="h-2 overflow-hidden rounded-full bg-gray-100"> */}
                      <div className="w-full h-3">
                        <Progress
                          percent={dept.percent}
                          showInfo={false}
                          strokeColor={'#1E40AF'}
                          size={{ height: 12 }}
                          className="h-3"
                        />
                        {/* </div> */}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
