'use client';

import React, { useMemo } from 'react';
import { Tag } from 'antd';
import { useRouter } from 'next/navigation';
import {
  EmployeeScorecard,
  KpiApprovalStatus,
  ScorecardStatus,
  TargetLogic,
} from '@/types/bsc';
import ScoreProgressBar from '@/app/(afterLogin)/(bsc)/bsc/_components/ScoreProgressBar';

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
  progress: number;
  /** Average achievement across periods for this KPI (0–100). */
  averageScore?: number | null;
  averageCaption?: string | null;
  targetId?: string;
  approvalStatus?: KpiApprovalStatus;
  /** Person-level source: shared scorecard KPI vs individually appended */
  assignmentSource?: 'shared' | 'individual';
};

function targetLogicLabel(logic: TargetLogic): string {
  if (logic === TargetLogic.LowerBetter) return 'Lower is better';
  if (logic === TargetLogic.Bounded) return 'Bounded';
  return 'Higher is better';
}

function kpiResultLabel(kpi: ScorecardKpiRow): string {
  if (kpi.actual == null) return 'Pending';
  if (kpi.progress >= 100) return 'Achieved';
  return `${Math.round(kpi.progress)}%`;
}

const blueTagClassName =
  'm-0 h-5 rounded border border-[#91caff] bg-[#e6f4ff] px-1.5 text-[11px] font-normal leading-5 text-[#1677ff]';
const mutedTagClassName =
  'm-0 h-5 rounded border border-gray-200 bg-white px-1.5 text-[11px] font-normal leading-5 text-gray-600';

function KpiRow({
  kpi,
  openKpi,
}: {
  kpi: ScorecardKpiRow;
  openKpi: (kpi: ScorecardKpiRow) => void;
}) {
  return (
    <tr
      key={kpi.targetId || kpi.id}
      className="hover:bg-gray-50 cursor-pointer"
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
      <td className="px-3 py-3 align-top text-sm font-normal text-gray-900 sm:px-6 sm:py-4">
        <div className="flex flex-col gap-1">
          <span className="text-[#1f4fd8] hover:underline">{kpi.name}</span>
          <div className="flex flex-wrap items-center gap-1.5">
            {kpi.assignmentSource === 'individual' ? (
              <Tag className={blueTagClassName}>Individual</Tag>
            ) : (
              <Tag className={mutedTagClassName}>Shared</Tag>
            )}
            <span className="text-xs text-gray-500 leading-snug">
              {[kpi.perspective, kpi.description].filter(Boolean).join(' · ') ||
                targetLogicLabel(kpi.targetLogic)}
            </span>
          </div>
        </div>
      </td>
      <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900 sm:px-6 sm:py-4">
        {kpi.weight}%
      </td>
      <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900 sm:px-6 sm:py-4">
        {kpi.actual == null ? '—' : `${Math.round(kpi.progress)}%`}
      </td>
      <td className="px-3 py-3 whitespace-nowrap sm:px-6 sm:py-4 min-w-[160px]">
        <div className="flex flex-col gap-1">
          <ScoreProgressBar
            value={kpi.averageScore}
            dataCy={`bsc-my-scorecard-average-${kpi.id}`}
          />
          {kpi.averageCaption ? (
            <span className="text-[11px] text-gray-400 leading-tight">
              {kpi.averageCaption}
            </span>
          ) : null}
        </div>
      </td>
      <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900 sm:px-6 sm:py-4">
        {kpiResultLabel(kpi)}
      </td>
    </tr>
  );
}

export default function PerspectiveKpiCard({
  title,
  kpis,
  scorecard,
  cadence,
  contextLabel,
}: {
  title: string;
  kpis: ScorecardKpiRow[];
  scorecard?: EmployeeScorecard | null;
  cadence?: string | null;
  contextLabel?: string | null;
}) {
  const router = useRouter();

  const openKpi = (kpi: ScorecardKpiRow) => {
    const params = new URLSearchParams();
    if (scorecard?.id) params.set('scorecard', scorecard.id);
    const qs = params.toString();
    router.push(
      `/bsc/my-scorecard/kpis/${encodeURIComponent(kpi.id)}${qs ? `?${qs}` : ''}`,
    );
  };

  const sharedKpis = useMemo(
    () => kpis.filter((k) => k.assignmentSource !== 'individual'),
    [kpis],
  );
  const individualKpis = useMemo(
    () => kpis.filter((k) => k.assignmentSource === 'individual'),
    [kpis],
  );
  const showSections = sharedKpis.length > 0 && individualKpis.length > 0;

  return (
    <div
      className="mb-6 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden"
      data-cy="bsc-kpi-progress-card"
    >
      <div className="px-4 pt-4 pb-2 sm:px-6 sm:pt-6 flex items-start justify-between gap-3">
        <div>
          <h2 className="mb-1 text-base sm:text-lg font-bold text-gray-900 leading-7 sm:leading-8">
            {title}
          </h2>
          {contextLabel ? (
            <p
              className="mb-0 text-sm text-gray-500"
              data-cy="bsc-my-scorecard-context-label"
            >
              {contextLabel}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          {cadence ? <Tag className={mutedTagClassName}>{cadence}</Tag> : null}
          {scorecard?.status === ScorecardStatus.PendingEval ? (
            <Tag data-cy="bsc-my-scorecard-status-pending">Pending</Tag>
          ) : null}
          {scorecard?.status === ScorecardStatus.Scored ||
          scorecard?.status === ScorecardStatus.Completed ? (
            <Tag color="green" data-cy="bsc-my-scorecard-status-approved">
              Approved
            </Tag>
          ) : null}
        </div>
      </div>

      <div className="border-t border-gray-200 overflow-x-auto">
        <table className="w-full min-w-[720px] table-auto divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-900 tracking-wider min-w-[220px] sm:px-6 sm:py-3">
                KPI
              </th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 tracking-wider w-[90px] whitespace-nowrap sm:px-6 sm:py-3">
                Weight
              </th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 tracking-wider w-[120px] whitespace-nowrap sm:px-6 sm:py-3">
                Current Score
              </th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 tracking-wider min-w-[180px] whitespace-nowrap sm:px-6 sm:py-3">
                Average Score
              </th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 tracking-wider w-[110px] whitespace-nowrap sm:px-6 sm:py-3">
                Result
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 text-sm">
            {kpis.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-3 py-6 text-center text-gray-400 sm:px-6"
                >
                  No KPIs assigned yet
                </td>
              </tr>
            ) : showSections ? (
              <>
                <tr className="bg-gray-50/80">
                  <td
                    colSpan={5}
                    className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500 sm:px-6"
                  >
                    Role / shared KPIs
                  </td>
                </tr>
                {sharedKpis.map((kpi) => (
                  <KpiRow key={kpi.targetId || kpi.id} kpi={kpi} openKpi={openKpi} />
                ))}
                <tr className="bg-gray-50/80">
                  <td
                    colSpan={5}
                    className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500 sm:px-6"
                  >
                    Individual KPIs
                  </td>
                </tr>
                {individualKpis.map((kpi) => (
                  <KpiRow key={kpi.targetId || kpi.id} kpi={kpi} openKpi={openKpi} />
                ))}
              </>
            ) : (
              kpis.map((kpi) => (
                <KpiRow key={kpi.targetId || kpi.id} kpi={kpi} openKpi={openKpi} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
