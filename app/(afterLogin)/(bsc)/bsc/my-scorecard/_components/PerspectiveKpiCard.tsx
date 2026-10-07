'use client';

import React from 'react';
import { Tag } from 'antd';
import { useRouter } from 'next/navigation';
import { EmployeeScorecard, KpiApprovalStatus, TargetLogic } from '@/types/bsc';
import ScoreProgressBar from '@/app/(afterLogin)/(bsc)/bsc/_components/ScoreProgressBar';
import { bscTableRowClassName } from '@/app/(afterLogin)/(bsc)/bsc/_components/bscToolbarStyles';
import { formatScore } from '@/utils/bsc/rollup';
import { useIsMobile } from '@/hooks/useIsMobile';

export type ScorecardKpiRow = {
  id: string;
  name: string;
  description?: string | null;
  perspective?: string;
  weight: number;
  target?: number | null;
  actual?: number | null;
  unit: string;
  targetLogic: TargetLogic;
  progress: number | null;
  /** Average achievement across periods for this KPI (0–100). */
  averageScore?: number | null;
  averageCaption?: string | null;
  targetId?: string;
  approvalStatus?: KpiApprovalStatus;
  dataSource?: string | null;
  acceptableThreshold?: number | null;
  /** Person-level source: shared scorecard KPI vs individually appended */
  assignmentSource?: 'shared' | 'individual';
};

function perspectiveSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

function targetLogicLabel(logic: TargetLogic): string {
  if (logic === TargetLogic.LowerBetter) return 'Lower is better';
  if (logic === TargetLogic.Bounded) return 'Bounded';
  return 'Higher is better';
}

function kpiResultLabel(kpi: ScorecardKpiRow): string {
  if (kpi.actual == null || kpi.progress == null) return 'Pending';
  if (kpi.progress >= 100) return 'Achieved';
  return `${Math.round(kpi.progress)}%`;
}

const blueTagClassName =
  'm-0 h-5 rounded border border-[#91caff] bg-[#e6f4ff] px-1.5 text-[11px] font-normal leading-5 text-[#1677ff]';
const mutedTagClassName =
  'm-0 h-5 rounded border border-gray-200 bg-white px-1.5 text-[11px] font-normal leading-5 text-gray-600';

function KpiRow({
  kpi,
  index,
  openKpi,
}: {
  kpi: ScorecardKpiRow;
  index: number;
  openKpi: (kpi: ScorecardKpiRow) => void;
}) {
  return (
    <tr
      key={kpi.targetId || kpi.id}
      className={bscTableRowClassName(index, 'cursor-pointer')}
      data-cy={`bsc-scorecard-kpi-row-${kpi.targetId || kpi.id}`}
      onClick={() => openKpi(kpi)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openKpi(kpi);
        }
      }}
      tabIndex={0}
      role="link"
    >
      <td
        data-cy="perspectivekpicard-td-74"
        className="px-3 py-3 align-top text-sm font-normal text-gray-900 sm:px-6 sm:py-4"
      >
        <div
          data-cy="perspectivekpicard-div-75"
          className="flex flex-col gap-1"
        >
          <span
            data-cy="perspectivekpicard-span-76"
            className="font-semibold text-gray-800"
          >
            {kpi.name}
          </span>
          <div
            data-cy="perspectivekpicard-div-77"
            className="flex flex-wrap items-center gap-1.5"
          >
            {kpi.assignmentSource === 'individual' ? (
              <Tag className={blueTagClassName}>Individual</Tag>
            ) : (
              <Tag className={mutedTagClassName}>Shared</Tag>
            )}
            <span
              data-cy="perspectivekpicard-span-83"
              className="text-xs text-gray-500 leading-snug"
            >
              {[
                kpi.perspective,
                kpi.description,
                kpi.dataSource ? `Source: ${kpi.dataSource}` : null,
                kpi.acceptableThreshold != null
                  ? `Threshold: ${kpi.acceptableThreshold}`
                  : null,
              ]
                .filter(Boolean)
                .join(' · ') || targetLogicLabel(kpi.targetLogic)}
            </span>
          </div>
        </div>
      </td>
      <td
        data-cy="perspectivekpicard-td-90"
        className="px-3 py-3 whitespace-nowrap text-sm text-gray-900 sm:px-6 sm:py-4"
      >
        {kpi.weight}%
      </td>
      <td
        data-cy="perspectivekpicard-td-93"
        className="px-3 py-3 whitespace-nowrap text-sm text-gray-900 sm:px-6 sm:py-4"
      >
        {kpi.actual == null || kpi.progress == null
          ? '—'
          : `${Math.round(kpi.progress)}%`}
      </td>
      <td
        data-cy="perspectivekpicard-td-96"
        className="px-3 py-3 whitespace-nowrap sm:px-6 sm:py-4 min-w-[160px]"
      >
        <div
          data-cy="perspectivekpicard-div-97"
          className="flex flex-col gap-1"
        >
          <ScoreProgressBar
            value={kpi.averageScore}
            dataCy={`bsc-my-scorecard-average-${kpi.id}`}
          />
          {kpi.averageCaption ? (
            <span
              data-cy="perspectivekpicard-span-103"
              className="text-[11px] text-gray-400 leading-tight"
            >
              {kpi.averageCaption}
            </span>
          ) : null}
        </div>
      </td>
      <td
        data-cy="perspectivekpicard-td-109"
        className="px-3 py-3 whitespace-nowrap text-sm text-gray-900 sm:px-6 sm:py-4"
      >
        {kpiResultLabel(kpi)}
      </td>
    </tr>
  );
}

export default function PerspectiveKpiCard({
  title,
  kpis,
  scorecard,
  contextLabel,
  progressPercent,
}: {
  title: string;
  kpis: ScorecardKpiRow[];
  scorecard?: EmployeeScorecard | null;
  contextLabel?: string | null;
  progressPercent?: number | null;
}) {
  const router = useRouter();
  const { isMobile, isTablet } = useIsMobile();
  const slug = perspectiveSlug(title);
  const displayProgress =
    progressPercent != null ? Number(formatScore(progressPercent)) : 0;

  const openKpi = (kpi: ScorecardKpiRow) => {
    const params = new URLSearchParams();
    if (scorecard?.id) params.set('scorecard', scorecard.id);
    const qs = params.toString();
    router.push(
      `/bsc/my-scorecard/kpis/${encodeURIComponent(kpi.id)}${qs ? `?${qs}` : ''}`,
    );
  };

  return (
    <div
      className={isMobile || isTablet ? 'mb-4' : 'mb-6'}
      data-cy="bsc-kpi-progress-card"
    >
      <div
        className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden"
        data-cy={`bsc-perspective-kpi-card-wrapper-${slug}`}
      >
        <div
          className="p-4 pb-2 sm:p-6"
          data-cy={`bsc-perspective-kpi-card-body-${slug}`}
        >
          <div
            data-cy="auto-added"
            className="flex min-w-0 flex-col items-start gap-y-1"
          >
            <div
              data-cy="auto-added"
              className="flex w-full min-w-0 items-center justify-between gap-3"
            >
              <h2
                className="text-base sm:text-lg font-bold text-gray-900 m-0 min-w-0 leading-7 sm:leading-8"
                data-cy={`bsc-perspective-title-${slug}`}
              >
                {title}
              </h2>
              {progressPercent != null ? (
                <span
                  className="inline-flex shrink-0 items-center px-2.5 py-1 rounded text-xs font-medium bg-[#DBEAFE] text-blue-700 border border-[#BFDBFE] whitespace-nowrap"
                  data-cy="bsc-my-scorecard-kpi-progress-value"
                >
                  {displayProgress.toLocaleString()}% Scorecard Progress
                </span>
              ) : null}
            </div>
            {contextLabel ? (
              <p
                className="mb-0 text-sm text-gray-500"
                data-cy="bsc-my-scorecard-context-label"
              >
                {contextLabel}
              </p>
            ) : null}
          </div>
        </div>

        {kpis.length > 0 ? (
          <div
            className="mt-3 border-t border-gray-200 overflow-x-auto [-webkit-overflow-scrolling:touch] sm:mt-4"
            data-cy={`bsc-perspective-kpi-table-wrap-${slug}`}
          >
            <table
              data-cy={`bsc-perspective-kpi-table-${slug}`}
              className="w-full min-w-[720px] table-auto divide-y divide-gray-200 md:min-w-[900px]"
            >
              <thead
                data-cy="perspectivekpicard-thead-192"
                className="bg-gray-50"
              >
                <tr data-cy="perspectivekpicard-tr-193">
                  <th
                    scope="col"
                    data-cy="perspectivekpicard-th-194"
                    className="px-3 py-2.5 text-left text-xs font-semibold text-gray-900 tracking-wider min-w-[200px] sm:px-6 sm:py-3 sm:min-w-[240px] md:min-w-[280px]"
                  >
                    KPI
                  </th>
                  <th
                    scope="col"
                    data-cy="perspectivekpicard-th-197"
                    className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 tracking-wider w-[80px] whitespace-nowrap sm:px-6 sm:py-3 sm:w-[90px]"
                  >
                    Weight
                  </th>
                  <th
                    scope="col"
                    data-cy="perspectivekpicard-th-200"
                    className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 tracking-wider w-[100px] whitespace-nowrap sm:px-6 sm:py-3 sm:w-[120px]"
                  >
                    Current Score
                  </th>
                  <th
                    scope="col"
                    data-cy="perspectivekpicard-th-203"
                    className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 tracking-wider min-w-[160px] whitespace-nowrap sm:px-6 sm:py-3 sm:w-[220px]"
                  >
                    Average Score
                  </th>
                  <th
                    scope="col"
                    data-cy="perspectivekpicard-th-206"
                    className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 tracking-wider w-[100px] whitespace-nowrap sm:px-6 sm:py-3 sm:w-[110px]"
                  >
                    Result
                  </th>
                </tr>
              </thead>
              <tbody
                data-cy="perspectivekpicard-tbody-211"
                className="bg-white divide-y divide-gray-200 text-sm [&_.bsc-table-row-odd>td]:bg-white [&_.bsc-table-row-even>td]:bg-[#FAFAFA] [&_.bsc-table-row-odd:hover>td]:!bg-[#f5f5f5] [&_.bsc-table-row-even:hover>td]:!bg-[#f5f5f5]"
              >
                {kpis.map((kpi, index) => (
                  <KpiRow
                    key={kpi.targetId || kpi.id}
                    kpi={kpi}
                    index={index}
                    openKpi={openKpi}
                  />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div
            className="border-t border-gray-200 px-3 py-6 text-center text-sm text-gray-400 sm:px-6"
            data-cy={`bsc-perspective-kpi-empty-${slug}`}
          >
            No KPIs assigned yet
          </div>
        )}
      </div>
    </div>
  );
}
