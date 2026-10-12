'use client';

import React, { useMemo } from 'react';
import {
  Form,
  FormInstance,
  Input,
  InputNumber,
  Select,
  Tag,
  Tooltip,
} from 'antd';
import type { Dayjs } from 'dayjs';
import {
  BscCadence,
  BscSetupKind,
  KpiLibraryItem,
  TargetLogic,
} from '@/types/bsc';
import {
  checkInDayOptions,
  eligibleCheckInCadences,
  filterCheckInDayOptions,
  formatCheckInDate,
  isKpiCheckInCadence,
  KPI_CHECKIN_CADENCES,
  resolveFirstCheckInDate,
} from '@/utils/bsc/checkInSchedule';
import { validateAcceptableThreshold } from '@/utils/bsc/scoring';

const KPI_ROW_LAYOUT =
  'grid grid-cols-1 gap-y-3 px-3 py-3 sm:grid-cols-2 sm:gap-x-4 sm:px-4';

const TABLE_HEADER_LAYOUT =
  'grid grid-cols-1 gap-y-1 px-3 sm:grid-cols-2 sm:gap-x-4 sm:px-4';

const INPUT_FIELDS_GRID =
  'grid w-full max-w-full grid-cols-[minmax(60px,0.85fr)_minmax(72px,1fr)_minmax(72px,1fr)_minmax(72px,1fr)_minmax(100px,1.2fr)] grid-rows-[auto_auto] gap-x-2 gap-y-2';

const INPUT_HEADER_GRID =
  'grid grid-cols-[minmax(60px,0.85fr)_minmax(72px,1fr)_minmax(72px,1fr)_minmax(72px,1fr)_minmax(100px,1.2fr)] gap-x-2';

const headerCellClassName = 'py-2.5 text-xs font-semibold text-gray-500';

const fieldLabelClassName = 'mb-1 block text-[11px] font-medium text-gray-500';

const inputNumberClassName = '!w-full !h-8';

const selectClassName =
  '!w-full [&_.ant-select-selector]:!h-8 [&_.ant-select-selector]:!items-center';

const textInputClassName = '!w-full h-8 text-sm';

type Props = {
  form: FormInstance;
  selectedKpis: KpiLibraryItem[];
  measureWeights: Record<string, number | null | undefined>;
  measureTargets: Record<string, number | null | undefined>;
  measureStretchTargets: Record<string, number | null | undefined>;
  measureDataSources: Record<string, string | null | undefined>;
  measureAcceptableThresholds: Record<string, number | null | undefined>;
  measureWorstCases: Record<string, number | null | undefined>;
  measureBestCases: Record<string, number | null | undefined>;
  measureCadences: Record<string, BscCadence | null | undefined>;
  measureCheckInDays: Record<string, number | null | undefined>;
  setupKind?: BscSetupKind;
  effectiveFromWatch?: Dayjs;
  endDateWatch?: Dayjs;
  isTemporarySetup: boolean;
};

function targetLogicLabel(logic?: TargetLogic): string {
  if (logic === TargetLogic.LowerBetter) return 'Lower is better';
  if (logic === TargetLogic.Bounded) return 'Bounded';
  return 'Higher is better';
}

export default function BscSetupWeightsStep({
  form,
  selectedKpis,
  measureWeights,
  measureTargets,
  measureStretchTargets,
  measureDataSources,
  measureAcceptableThresholds,
  measureWorstCases,
  measureBestCases,
  measureCadences,
  measureCheckInDays,
  setupKind,
  effectiveFromWatch,
  endDateWatch,
  isTemporarySetup,
}: Props) {
  const eligibleCadenceOptions = useMemo(() => {
    if (
      setupKind === BscSetupKind.Temporary &&
      effectiveFromWatch &&
      endDateWatch
    ) {
      return eligibleCheckInCadences(effectiveFromWatch, endDateWatch)
        .filter(isKpiCheckInCadence)
        .map((cadence) => ({ value: cadence, label: cadence }));
    }
    return KPI_CHECKIN_CADENCES.map((cadence) => ({
      value: cadence,
      label: cadence,
    }));
  }, [setupKind, effectiveFromWatch, endDateWatch]);

  if (!selectedKpis.length) {
    return (
      <p
        className="text-[13px] text-[#94A3B8]"
        data-cy="bsc-setup-weights-empty"
      >
        No KPIs selected. Go back and select KPIs first.
      </p>
    );
  }

  return (
    <>
      <p
        className="mb-1 text-[13px] font-semibold text-[#262626]"
        data-cy="bsc-setup-weights-title"
      >
        Weights & targets
      </p>
      <p
        className="mb-3 text-[12px] text-[#8F94A3]"
        data-cy="bsc-setup-weights-desc"
      >
        Assign weights (must sum to 100%), targets, validation fields, and
        check-in schedule for each KPI.
        {isTemporarySetup
          ? ' Cadences are limited to periods that fit the effective–end date window.'
          : null}
      </p>

      <Form.Item name="perspectiveRows" hidden>
        <Input />
      </Form.Item>
      <Form.Item name="measureWeights" hidden>
        <Input />
      </Form.Item>
      <Form.Item name="measureTargets" hidden>
        <Input />
      </Form.Item>
      <Form.Item name="measureStretchTargets" hidden>
        <Input />
      </Form.Item>
      <Form.Item name="measureWorstCases" hidden>
        <Input />
      </Form.Item>
      <Form.Item name="measureBestCases" hidden>
        <Input />
      </Form.Item>
      <Form.Item name="measureCadences" hidden>
        <Input />
      </Form.Item>
      <Form.Item name="measureCheckInDays" hidden>
        <Input />
      </Form.Item>
      <Form.Item name="measureDataSources" hidden>
        <Input />
      </Form.Item>
      <Form.Item name="measureAcceptableThresholds" hidden>
        <Input />
      </Form.Item>

      <div
        className="overflow-hidden rounded-lg border border-[#D9D9D9] bg-white shadow-none"
        data-cy="bsc-setup-weights-table"
      >
        <div
          data-cy="auto-added"
          className="sticky top-0 z-[1] border-b border-[#E5E7EB] bg-white"
        >
          <div data-cy="auto-added" className={TABLE_HEADER_LAYOUT}>
            <span data-cy="auto-added" className={headerCellClassName}>
              KPI
            </span>
            <div data-cy="auto-added" className={INPUT_HEADER_GRID}>
              <span data-cy="auto-added" className={headerCellClassName}>
                Weight
              </span>
              <span data-cy="auto-added" className={headerCellClassName}>
                Target
              </span>
              <span data-cy="auto-added" className={headerCellClassName}>
                Threshold
              </span>
              <span data-cy="auto-added" className={headerCellClassName}>
                Stretch
              </span>
              <span data-cy="auto-added" className={headerCellClassName}>
                Cadence
              </span>
            </div>
          </div>
        </div>

        <div
          data-cy="auto-added"
          className="max-h-[min(52vh,520px)] overflow-y-auto"
        >
          {selectedKpis.map((kpi) => {
            const isBounded = kpi.targetLogic === TargetLogic.Bounded;
            const kpiCadence = measureCadences[kpi.id];
            const dayOptions =
              isTemporarySetup && effectiveFromWatch && endDateWatch
                ? filterCheckInDayOptions(
                    kpiCadence,
                    effectiveFromWatch,
                    endDateWatch,
                  )
                : checkInDayOptions(kpiCadence);
            const firstCheckInDate = resolveFirstCheckInDate(
              kpiCadence,
              measureCheckInDays[kpi.id],
              effectiveFromWatch,
            );
            const thresholdCheck =
              measureTargets[kpi.id] != null &&
              measureAcceptableThresholds[kpi.id] != null
                ? validateAcceptableThreshold(
                    Number(measureTargets[kpi.id]),
                    Number(measureAcceptableThresholds[kpi.id]),
                    kpi.targetLogic,
                  )
                : { valid: true as const };
            const showThreshold =
              kpi.targetLogic === TargetLogic.HigherBetter ||
              kpi.targetLogic === TargetLogic.LowerBetter;

            return (
              <div
                key={kpi.id}
                className="border-b border-[#F0F0F0] bg-white last:border-b-0"
                data-cy={`bsc-scorecard-weight-kpi-${kpi.id}`}
              >
                <div
                  className={`${KPI_ROW_LAYOUT} [&_.ant-input-number]:self-center [&_.ant-select]:self-center`}
                  data-cy={`bsc-setup-weights-kpi-block-${kpi.id}`}
                >
                  <div
                    data-cy="auto-added"
                    className="flex min-w-0 items-center self-center"
                  >
                    <div
                      data-cy="auto-added"
                      className="flex min-w-0 flex-col gap-1"
                    >
                      <p
                        data-cy="auto-added"
                        className="m-0 min-w-0 truncate text-base font-semibold leading-6 text-gray-900"
                      >
                        {kpi.name}
                      </p>
                      <div
                        data-cy="auto-added"
                        className="flex flex-wrap items-center gap-x-3 gap-y-1.5"
                      >
                        {kpi.perspective ? (
                          <Tag className="m-0 h-5 shrink-0 rounded border border-[#91caff] bg-[#e6f4ff] px-1.5 text-[10px] font-normal leading-5 text-[#1677ff]">
                            {kpi.perspective}
                          </Tag>
                        ) : null}
                        <span
                          data-cy="auto-added"
                          className="shrink-0 text-[10px] text-gray-500"
                        >
                          {targetLogicLabel(kpi.targetLogic)}
                        </span>
                        {firstCheckInDate ? (
                          <span
                            data-cy="auto-added"
                            className="shrink-0 text-[10px] text-gray-500"
                          >
                            First check-in:{' '}
                            {formatCheckInDate(firstCheckInDate)}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div
                    className={`${INPUT_FIELDS_GRID} min-w-0 justify-self-stretch sm:max-w-full`}
                    data-cy={`bsc-setup-weights-secondary-${kpi.id}`}
                  >
                    <InputNumber
                      className={inputNumberClassName}
                      min={1}
                      max={100}
                      placeholder="%"
                      value={measureWeights[kpi.id] ?? undefined}
                      onChange={(value) => {
                        form.setFieldsValue({
                          measureWeights: {
                            ...measureWeights,
                            [kpi.id]: value,
                          },
                        });
                      }}
                      data-cy={`bsc-scorecard-kpi-weight-${kpi.id}`}
                    />

                    <InputNumber
                      className={inputNumberClassName}
                      placeholder={
                        kpi.defaultTarget != null
                          ? String(kpi.defaultTarget)
                          : 'Target'
                      }
                      value={measureTargets[kpi.id] ?? undefined}
                      onChange={(value) => {
                        form.setFieldsValue({
                          measureTargets: {
                            ...measureTargets,
                            [kpi.id]: value,
                          },
                        });
                      }}
                      data-cy={`bsc-scorecard-kpi-target-${kpi.id}`}
                    />

                    {showThreshold ? (
                      <Tooltip
                        title={
                          !thresholdCheck.valid
                            ? thresholdCheck.message
                            : kpi.targetLogic === TargetLogic.HigherBetter
                              ? 'Must be ≤ target'
                              : 'Must be ≥ target'
                        }
                      >
                        <InputNumber
                          className={inputNumberClassName}
                          placeholder="Min/max"
                          status={!thresholdCheck.valid ? 'error' : undefined}
                          value={
                            measureAcceptableThresholds[kpi.id] ?? undefined
                          }
                          onChange={(value) => {
                            form.setFieldsValue({
                              measureAcceptableThresholds: {
                                ...measureAcceptableThresholds,
                                [kpi.id]: value,
                              },
                            });
                          }}
                          data-cy={`bsc-kpi-assignment-threshold-${kpi.id}`}
                        />
                      </Tooltip>
                    ) : (
                      <span
                        data-cy="auto-added"
                        className="self-center text-sm text-gray-400"
                      >
                        —
                      </span>
                    )}

                    <Tooltip title="Optional aspirational target beyond the standard target">
                      <InputNumber
                        className={inputNumberClassName}
                        placeholder="Stretch"
                        value={measureStretchTargets[kpi.id] ?? undefined}
                        onChange={(value) => {
                          form.setFieldsValue({
                            measureStretchTargets: {
                              ...measureStretchTargets,
                              [kpi.id]: value,
                            },
                          });
                        }}
                        data-cy={`bsc-scorecard-kpi-stretch-${kpi.id}`}
                      />
                    </Tooltip>

                    <Select
                      className={selectClassName}
                      placeholder="Cadence"
                      options={eligibleCadenceOptions}
                      disabled={!eligibleCadenceOptions.length}
                      value={kpiCadence ?? undefined}
                      onChange={(value: BscCadence) => {
                        form.setFieldsValue({
                          measureCadences: {
                            ...measureCadences,
                            [kpi.id]: value,
                          },
                          measureCheckInDays: {
                            ...measureCheckInDays,
                            [kpi.id]: undefined,
                          },
                        });
                      }}
                      data-cy={`bsc-scorecard-kpi-cadence-${kpi.id}`}
                    />

                    <div data-cy="auto-added" className="col-span-4 min-w-0">
                      <label
                        data-cy="auto-added"
                        className={fieldLabelClassName}
                      >
                        Data source
                      </label>
                      <Input
                        className={textInputClassName}
                        type="url"
                        placeholder="https://example.com/report"
                        value={measureDataSources[kpi.id] ?? ''}
                        onChange={(event) => {
                          form.setFieldsValue({
                            measureDataSources: {
                              ...measureDataSources,
                              [kpi.id]: event.target.value.trim() || null,
                            },
                          });
                        }}
                        data-cy={`bsc-kpi-assignment-data-source-${kpi.id}`}
                      />
                    </div>

                    <div data-cy="auto-added" className="min-w-0">
                      <label
                        data-cy="auto-added"
                        className={fieldLabelClassName}
                      >
                        Check-in day
                      </label>
                      <Select
                        className={selectClassName}
                        placeholder="Day"
                        options={dayOptions}
                        disabled={!kpiCadence}
                        value={measureCheckInDays[kpi.id] ?? undefined}
                        onChange={(value: number) => {
                          form.setFieldsValue({
                            measureCheckInDays: {
                              ...measureCheckInDays,
                              [kpi.id]: value,
                            },
                          });
                        }}
                        data-cy={`bsc-scorecard-kpi-checkin-day-${kpi.id}`}
                      />
                    </div>

                    {isBounded ? (
                      <div
                        data-cy="auto-added"
                        className="col-span-5 flex flex-wrap items-center gap-3 pt-1"
                      >
                        <div
                          data-cy="auto-added"
                          className="flex items-center gap-2"
                        >
                          <span
                            data-cy="auto-added"
                            className="text-[11px] font-medium text-gray-500"
                          >
                            Worst
                          </span>
                          <InputNumber
                            className="w-24"
                            value={measureWorstCases[kpi.id] ?? undefined}
                            onChange={(value) => {
                              form.setFieldsValue({
                                measureWorstCases: {
                                  ...measureWorstCases,
                                  [kpi.id]: value,
                                },
                              });
                            }}
                            data-cy={`bsc-scorecard-kpi-worst-${kpi.id}`}
                          />
                        </div>
                        <div
                          data-cy="auto-added"
                          className="flex items-center gap-2"
                        >
                          <span
                            data-cy="auto-added"
                            className="text-[11px] font-medium text-gray-500"
                          >
                            Best
                          </span>
                          <InputNumber
                            className="w-24"
                            value={measureBestCases[kpi.id] ?? undefined}
                            onChange={(value) => {
                              form.setFieldsValue({
                                measureBestCases: {
                                  ...measureBestCases,
                                  [kpi.id]: value,
                                },
                              });
                            }}
                            data-cy={`bsc-scorecard-kpi-best-${kpi.id}`}
                          />
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
