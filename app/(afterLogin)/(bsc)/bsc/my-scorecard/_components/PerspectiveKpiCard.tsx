'use client';

import React, { useEffect, useState } from 'react';
import { Button, Input, Tag } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { IoCheckmarkCircle } from 'react-icons/io5';
import CustomButton from '@/components/common/buttons/customButton';
import {
  EmployeeScorecard,
  KpiApprovalStatus,
  ScorecardStatus,
  TargetLogic,
} from '@/types/bsc';
import {
  useReportBscKpis,
  useSubmitBscFinal,
} from '@/store/server/features/bsc/mutation';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import { normalizeRatio } from '@/utils/bsc/scoring';

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

function formatTarget(kpi: ScorecardKpiRow): string {
  if (kpi.target == null) return '—';
  return String(kpi.target);
}

function formatMetric(kpi: ScorecardKpiRow): string {
  return kpi.unit?.trim() || '—';
}

function kpiResultLabel(kpi: ScorecardKpiRow): string {
  if (kpi.actual == null) return 'Pending';
  if (kpi.progress >= 100) return 'Achieved';
  return `${Math.round(kpi.progress)}%`;
}

function progressFromActual(
  actual: number | null | undefined,
  target: number | null | undefined,
  logic: TargetLogic,
): number {
  if (actual == null || target == null) return 0;
  const { ratio } = normalizeRatio(actual, target, logic);
  return Math.min(Math.max(ratio, 0), 1) * 100;
}

function canSubmitScorecard(scorecard?: EmployeeScorecard | null): boolean {
  return (
    scorecard?.status === ScorecardStatus.Active ||
    scorecard?.status === ScorecardStatus.NeedsResubmit
  );
}

function isRowEditable(
  kpi: ScorecardKpiRow,
  scorecard?: EmployeeScorecard | null,
): boolean {
  if (!canSubmitScorecard(scorecard)) return false;
  if (scorecard?.status === ScorecardStatus.NeedsResubmit) {
    if (!kpi.approvalStatus) return true;
    return kpi.approvalStatus === KpiApprovalStatus.Rejected;
  }
  return true;
}

function draftKey(kpi: ScorecardKpiRow): string {
  return kpi.targetId || kpi.id;
}

const reportButtonClassName =
  '!h-7 !min-h-7 !w-auto !min-w-0 !shrink-0 !rounded-md !px-2.5 !py-0 !bg-[#1E40AF] !text-white hover:!bg-[#1E3A8A]';

export default function PerspectiveKpiCard({
  title,
  kpis,
  daysLeft,
  evaluated,
  scorecard,
}: {
  title: string;
  kpis: ScorecardKpiRow[];
  daysLeft: number | null;
  evaluated: boolean;
  scorecard?: EmployeeScorecard | null;
}) {
  const canSubmit = canSubmitScorecard(scorecard);
  const [reportingOpen, setReportingOpen] = useState(false);
  const [drafts, setDrafts] = useState<Record<string, number | null>>({});
  const { mutateAsync: reportAsync, isLoading: reporting } = useReportBscKpis();
  const { mutateAsync: submitAsync, isLoading: submitting } =
    useSubmitBscFinal();
  const saving = reporting || submitting;

  useEffect(() => {
    setReportingOpen(false);
  }, [scorecard?.id, scorecard?.status]);

  useEffect(() => {
    setDrafts(
      Object.fromEntries(
        kpis.map((kpi) => [draftKey(kpi), kpi.actual ?? null]),
      ),
    );
  }, [kpis, scorecard?.id]);

  const progressPct = reportingOpen
    ? Math.round(
        kpis.reduce((sum, kpi) => {
          const actual = drafts[draftKey(kpi)];
          const pct = progressFromActual(actual, kpi.target, kpi.targetLogic);
          return sum + (pct * kpi.weight) / 100;
        }, 0),
      )
    : evaluated
      ? Math.round(
          kpis.reduce((sum, kpi) => sum + (kpi.progress * kpi.weight) / 100, 0),
        )
      : Math.round(
          kpis.length
            ? kpis.reduce((sum, kpi) => sum + kpi.progress, 0) / kpis.length
            : 0,
        );

  const handleSubmit = async () => {
    if (!scorecard) return;
    const editableKpis = kpis.filter((kpi) => isRowEditable(kpi, scorecard));
    for (const kpi of editableKpis) {
      const actual = drafts[draftKey(kpi)];
      if (actual == null || !Number.isFinite(actual)) {
        NotificationMessage.error({
          message: `Enter an actual for ${kpi.name}`,
        });
        return;
      }
    }
    const reports = editableKpis.map((kpi) => {
      const actual = drafts[draftKey(kpi)] as number;
      return {
        targetId: draftKey(kpi),
        actualValue: actual,
        evidenceFileName: `${kpi.name.replace(/\s+/g, '-')}.pdf`,
        evidenceUrl: `https://mock.evidence/${scorecard.id}/${draftKey(kpi)}`,
      };
    });
    await reportAsync({ scorecardId: scorecard.id, reports });
    await submitAsync(scorecard.id);
    setReportingOpen(false);
  };

  const colSpan = reportingOpen ? 6 : 4;

  return (
    <div
      className="mb-6 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden"
      data-cy="bsc-kpi-progress-card"
    >
      <div
        data-cy="bsc-my-scorecard-components-perspectivekpicard-tsx-perspectivekpicard-div-188"
        className="px-4 pt-4 pb-2 sm:px-6 sm:pt-6 flex items-start justify-between gap-3"
      >
        <div data-cy="bsc-my-scorecard-components-perspectivekpicard-tsx-perspectivekpicard-div-189">
          <div
            data-cy="bsc-my-scorecard-components-perspectivekpicard-tsx-perspectivekpicard-div-190"
            className="flex flex-wrap items-center gap-2"
          >
            <span
              data-cy="bsc-my-scorecard-components-perspectivekpicard-tsx-perspectivekpicard-span-191"
              className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium bg-[#DBEAFE] text-blue-700 border border-[#BFDBFE] whitespace-nowrap"
            >
              {progressPct}% KPI Progress
            </span>
            <span
              data-cy="bsc-my-scorecard-components-perspectivekpicard-tsx-perspectivekpicard-span-194"
              className="hidden sm:inline-flex items-center px-2.5 py-1 rounded text-xs font-medium border border-gray-200 text-gray-600 bg-white whitespace-nowrap"
            >
              {daysLeft == null ? '—' : daysLeft} Days Left
            </span>
          </div>
          <h2
            data-cy="bsc-my-scorecard-components-perspectivekpicard-tsx-perspectivekpicard-h2-198"
            className="mt-3 mb-0 text-base sm:text-lg font-bold text-gray-900 leading-7 sm:leading-8"
          >
            {title}
          </h2>
        </div>
        {canSubmit && !reportingOpen ? (
          <CustomButton
            title="Report"
            id="bsc-my-scorecard-report"
            size="small"
            textClassName="text-[11px] font-semibold leading-tight sm:text-xs"
            style={{ paddingInline: 10 }}
            onClick={() => setReportingOpen(true)}
            className={reportButtonClassName}
          />
        ) : null}
        {canSubmit && reportingOpen ? (
          <div
            data-cy="bsc-my-scorecard-components-perspectivekpicard-tsx-perspectivekpicard-div-214"
            className="flex items-center gap-2"
          >
            <CustomButton
              title="Submit"
              id="bsc-my-scorecard-submit"
              size="small"
              loading={saving}
              textClassName="text-[11px] font-semibold leading-tight sm:text-xs"
              style={{ paddingInline: 10 }}
              onClick={() => {
                void handleSubmit();
              }}
              className={reportButtonClassName}
            />
            <Button
              type="text"
              icon={<CloseOutlined />}
              disabled={saving}
              onClick={() => setReportingOpen(false)}
              className="!p-0 !h-auto !w-auto text-gray-400 hover:text-gray-600"
              aria-label="Cancel report"
              data-cy="bsc-my-scorecard-report-cancel"
            />
          </div>
        ) : null}
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

      <div
        data-cy="bsc-my-scorecard-components-perspectivekpicard-tsx-perspectivekpicard-div-249"
        className="border-t border-gray-200 overflow-x-auto"
      >
        <table
          data-cy="bsc-my-scorecard-components-perspectivekpicard-tsx-perspectivekpicard-table-250"
          className="w-full min-w-[720px] table-auto divide-y divide-gray-200"
        >
          <thead
            data-cy="bsc-my-scorecard-components-perspectivekpicard-tsx-perspectivekpicard-thead-251"
            className="bg-gray-50"
          >
            <tr data-cy="bsc-my-scorecard-components-perspectivekpicard-tsx-perspectivekpicard-tr-252">
              <th
                data-cy="bsc-my-scorecard-components-perspectivekpicard-tsx-perspectivekpicard-th-253"
                className="px-3 py-2.5 text-left text-xs font-semibold text-gray-900 tracking-wider min-w-[220px] sm:px-6 sm:py-3"
              >
                KPI
              </th>
              {reportingOpen ? (
                <>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 tracking-wider whitespace-nowrap sm:px-6 sm:py-3">
                    Direction
                  </th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 tracking-wider w-[90px] whitespace-nowrap sm:px-6 sm:py-3">
                    Weight
                  </th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 tracking-wider min-w-[100px] whitespace-nowrap sm:px-6 sm:py-3">
                    Target
                  </th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 tracking-wider min-w-[120px] whitespace-nowrap sm:px-6 sm:py-3">
                    Metric
                  </th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 tracking-wider w-[130px] whitespace-nowrap sm:px-6 sm:py-3">
                    Actual
                  </th>
                </>
              ) : (
                <>
                  <th
                    data-cy="bsc-my-scorecard-components-perspectivekpicard-tsx-perspectivekpicard-th-256"
                    className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 tracking-wider w-[90px] whitespace-nowrap sm:px-6 sm:py-3"
                  >
                    Weight
                  </th>
                  <th
                    data-cy="bsc-my-scorecard-components-perspectivekpicard-tsx-perspectivekpicard-th-259"
                    className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 tracking-wider min-w-[180px] whitespace-nowrap sm:px-6 sm:py-3"
                  >
                    Progress
                  </th>
                  <th
                    data-cy="bsc-my-scorecard-components-perspectivekpicard-tsx-perspectivekpicard-th-262"
                    className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 tracking-wider w-[110px] whitespace-nowrap sm:px-6 sm:py-3"
                  >
                    Result
                  </th>
                </>
              )}
            </tr>
          </thead>
          <tbody
            data-cy="bsc-my-scorecard-components-perspectivekpicard-tsx-perspectivekpicard-tbody-267"
            className="bg-white divide-y divide-gray-200 text-sm"
          >
            {kpis.length === 0 ? (
              <tr data-cy="bsc-my-scorecard-components-perspectivekpicard-tsx-perspectivekpicard-tr-269">
                <td
                  data-cy="bsc-my-scorecard-components-perspectivekpicard-tsx-perspectivekpicard-td-270"
                  colSpan={colSpan}
                  className="px-3 py-6 text-center text-gray-400 sm:px-6"
                >
                  No KPIs assigned yet
                </td>
              </tr>
            ) : (
              kpis.map((kpi) => {
                const key = draftKey(kpi);
                const actual =
                  drafts[key] !== undefined ? drafts[key] : kpi.actual ?? null;
                const barPct = reportingOpen
                  ? progressFromActual(actual, kpi.target, kpi.targetLogic)
                  : kpi.progress;
                const editable = reportingOpen && isRowEditable(kpi, scorecard);
                return (
                  <tr
                    key={kpi.targetId || kpi.id}
                    className="hover:bg-gray-50"
                    data-cy={`bsc-scorecard-kpi-row-${kpi.targetId || kpi.id}`}
                  >
                    <td
                      data-cy="bsc-my-scorecard-components-perspectivekpicard-tsx-perspectivekpicard-td-299"
                      className="px-3 py-3 align-top text-sm font-normal text-gray-900 sm:px-6 sm:py-4"
                    >
                      <div
                        data-cy="bsc-my-scorecard-components-perspectivekpicard-tsx-perspectivekpicard-div-300"
                        className="flex flex-col gap-1"
                      >
                        <span data-cy="bsc-my-scorecard-components-perspectivekpicard-tsx-perspectivekpicard-span-301">
                          {kpi.name}
                        </span>
                        <div className="flex flex-wrap items-center gap-1.5">
                          {kpi.assignmentSource === 'individual' ? (
                            <Tag className="m-0 h-5 rounded border border-[#91caff] bg-[#e6f4ff] px-1.5 text-[11px] font-normal leading-5 text-[#1677ff]">
                              Individual
                            </Tag>
                          ) : null}
                          <span
                            data-cy="bsc-my-scorecard-components-perspectivekpicard-tsx-perspectivekpicard-span-302"
                            className="text-xs text-gray-500 leading-snug"
                          >
                            {[kpi.perspective, kpi.description]
                              .filter(Boolean)
                              .join(' · ') || targetLogicLabel(kpi.targetLogic)}
                          </span>
                        </div>
                      </div>
                    </td>
                    {reportingOpen ? (
                      <>
                        <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900 sm:px-6 sm:py-4">
                          {targetLogicLabel(kpi.targetLogic)}
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900 sm:px-6 sm:py-4">
                          {kpi.weight}%
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900 sm:px-6 sm:py-4">
                          {formatTarget(kpi)}
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900 sm:px-6 sm:py-4">
                          {formatMetric(kpi)}
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900 sm:px-6 sm:py-4">
                          {editable ? (
                            <Input
                              className="!w-[110px] h-8 text-sm"
                              placeholder={
                                kpi.target != null
                                  ? String(kpi.target)
                                  : 'Enter actual'
                              }
                              value={actual == null ? '' : String(actual)}
                              onChange={(e) => {
                                const raw = e.target.value.replace(
                                  /[^\d.-]/g,
                                  '',
                                );
                                if (raw === '' || raw === '-') {
                                  setDrafts((prev) => ({
                                    ...prev,
                                    [key]: null,
                                  }));
                                  return;
                                }
                                const next = Number(raw);
                                if (!Number.isFinite(next)) return;
                                setDrafts((prev) => ({
                                  ...prev,
                                  [key]: next,
                                }));
                              }}
                              data-cy={`bsc-my-scorecard-actual-${kpi.id}`}
                            />
                          ) : (
                            <span>{actual == null ? '—' : String(actual)}</span>
                          )}
                        </td>
                      </>
                    ) : (
                      <>
                        <td
                          data-cy="bsc-my-scorecard-components-perspectivekpicard-tsx-perspectivekpicard-td-313"
                          className="px-3 py-3 whitespace-nowrap text-sm text-gray-900 sm:px-6 sm:py-4"
                        >
                          {kpi.weight}%
                        </td>
                        <td
                          data-cy="bsc-my-scorecard-components-perspectivekpicard-tsx-perspectivekpicard-td-316"
                          className="px-3 py-3 whitespace-nowrap sm:px-6 sm:py-4"
                        >
                          {barPct >= 100 ? (
                            <div
                              data-cy="bsc-my-scorecard-components-perspectivekpicard-tsx-perspectivekpicard-div-318"
                              className="flex min-w-0 items-center gap-1"
                            >
                              <div
                                data-cy="bsc-my-scorecard-components-perspectivekpicard-tsx-perspectivekpicard-div-319"
                                className="h-2 w-[140px] overflow-hidden rounded-full bg-gray-200"
                              >
                                <div
                                  data-cy="bsc-my-scorecard-components-perspectivekpicard-tsx-perspectivekpicard-div-320"
                                  className="h-2 w-full rounded-full bg-success"
                                />
                              </div>
                              <IoCheckmarkCircle className="text-success text-lg" />
                            </div>
                          ) : (
                            <div
                              data-cy="bsc-my-scorecard-components-perspectivekpicard-tsx-perspectivekpicard-div-325"
                              className="flex min-w-0 items-center"
                            >
                              <div
                                data-cy="bsc-my-scorecard-components-perspectivekpicard-tsx-perspectivekpicard-div-326"
                                className="mr-3 h-2 w-[140px] overflow-hidden rounded-full bg-gray-200"
                              >
                                <div
                                  data-cy="bsc-my-scorecard-components-perspectivekpicard-tsx-perspectivekpicard-div-327"
                                  className="h-2 rounded-full bg-okr-primary transition-all"
                                  style={{
                                    width: `${Math.min(Math.max(barPct, 0), 100)}%`,
                                  }}
                                />
                              </div>
                              <span
                                data-cy="bsc-my-scorecard-components-perspectivekpicard-tsx-perspectivekpicard-span-334"
                                className="text-gray-500 text-xs"
                              >
                                {Math.round(barPct)}%
                              </span>
                            </div>
                          )}
                        </td>
                        <td
                          data-cy="bsc-my-scorecard-components-perspectivekpicard-tsx-perspectivekpicard-td-340"
                          className="px-3 py-3 whitespace-nowrap text-sm text-gray-900 sm:px-6 sm:py-4"
                        >
                          {kpiResultLabel(kpi)}
                        </td>
                      </>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
