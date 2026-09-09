'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import { Alert, Button, Input, Select, Switch, TimePicker } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import useScheduleStore from '@/store/uistate/features/organizationStructure/workSchedule/useStore';
import { ShiftDraft } from '@/store/uistate/features/organizationStructure/workSchedule/interface';
import { useGetBreakTypes } from '@/store/server/features/timesheet/breakType/queries';
import { BreakType } from '@/types/timesheet/breakType';
import {
  BREAK_OUTSIDE_SHIFT_WARNING,
  doesBreakFitShiftWindow,
} from '@/helpers/breakShiftWindow';

export const SHIFT_NAME_PRESETS = [
  'Morning',
  'Afternoon',
  'Evening',
  'Custom',
] as const;

export const WEEK_DAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

type ShiftBreak = NonNullable<ShiftDraft['breaks']>[number];

function enrichAndFilterBreaks(
  breaks: ShiftBreak[] | undefined,
  shiftStart: string | undefined,
  shiftEnd: string | undefined,
  breakTypes: BreakType[],
  dropOutsideWindow: boolean,
): ShiftBreak[] {
  const attached = breaks ?? [];
  const enriched = attached.map((br, index) => {
    const bt = breakTypes.find((item) => item.id === br.breakTypeId);
    return {
      ...br,
      sortOrder: br.sortOrder ?? index,
      startAt: br.startAt ?? bt?.startAt ?? null,
      endAt: br.endAt ?? bt?.endAt ?? null,
      startAtFrom: br.startAtFrom ?? bt?.startAtFrom ?? null,
      startAtTo: br.startAtTo ?? bt?.startAtTo ?? null,
      endAtFrom: br.endAtFrom ?? bt?.endAtFrom ?? null,
      endAtTo: br.endAtTo ?? bt?.endAtTo ?? null,
    };
  });

  if (!dropOutsideWindow || !shiftStart || !shiftEnd) {
    return enriched;
  }

  return enriched.filter((br) =>
    doesBreakFitShiftWindow(br.startAt, br.endAt, shiftStart, shiftEnd),
  );
}

function breaksSignature(breaks: ShiftBreak[] | undefined): string {
  return JSON.stringify(
    (breaks ?? []).map((br) => ({
      id: br.id,
      breakTypeId: br.breakTypeId,
      startAt: br.startAt,
      endAt: br.endAt,
    })),
  );
}

export function mapShiftsToApiPayload(shifts: ShiftDraft[]) {
  return shifts.map((shift) => ({
    ...(shift.id ? { id: shift.id } : {}),
    name: shift.name,
    startTime: shift.startTime,
    endTime: shift.endTime,
    isSwappable: !!shift.isSwappable,
    applyToAllDays: !!shift.applyToAllDays,
    days: shift.applyToAllDays ? [] : shift.days ?? [],
    breaks: (shift.breaks ?? [])
      .filter((br) => br.startAt && br.endAt)
      .map((br, index) => ({
        breakTypeId: br.breakTypeId,
        sortOrder: br.sortOrder ?? index,
        startAt: br.startAt,
        endAt: br.endAt,
        ...(br.startAtFrom != null ? { startAtFrom: br.startAtFrom } : {}),
        ...(br.startAtTo != null ? { startAtTo: br.startAtTo } : {}),
        ...(br.endAtFrom != null ? { endAtFrom: br.endAtFrom } : {}),
        ...(br.endAtTo != null ? { endAtTo: br.endAtTo } : {}),
      })),
  }));
}

type ShiftsSectionProps = {
  dataCyPrefix?: string;
};

const ShiftsSection: React.FC<ShiftsSectionProps> = ({
  dataCyPrefix = 'work-schedule-shifts',
}) => {
  const { shifts, addShift, updateShift, removeShift } = useScheduleStore();
  const { data: breakTypeData, isLoading: breakTypesLoading } =
    useGetBreakTypes();
  const enrichedOnce = useRef(false);

  const breakTypes = useMemo(
    () => breakTypeData?.items ?? [],
    [breakTypeData],
  );

  // Stamp catalog times onto loaded attachments and drop ones outside the
  // shift window once break types are available.
  useEffect(() => {
    if (!breakTypes.length || enrichedOnce.current) return;
    let didUpdate = false;
    for (const shift of shifts) {
      const next = enrichAndFilterBreaks(
        shift.breaks,
        shift.startTime,
        shift.endTime,
        breakTypes,
        true,
      );
      if (breaksSignature(next) !== breaksSignature(shift.breaks)) {
        updateShift(shift.key, { breaks: next });
        didUpdate = true;
      }
    }
    if (didUpdate || shifts.every((s) => !(s.breaks ?? []).length)) {
      enrichedOnce.current = true;
    }
  }, [breakTypes, shifts, updateShift]);

  return (
    <div className="mt-6" data-cy={`${dataCyPrefix}-section`}>
      <div
        className="flex items-center justify-between mb-3"
        data-cy={`${dataCyPrefix}-header`}
      >
        <h2
          className="text-base font-semibold m-0"
          data-cy={`${dataCyPrefix}-title`}
        >
          Shifts
        </h2>
        <Button
          type="dashed"
          icon={<PlusOutlined />}
          onClick={() => addShift()}
          data-cy={`${dataCyPrefix}-add-btn`}
        >
          Add Shift
        </Button>
      </div>

      <div className="flex flex-col gap-4" data-cy={`${dataCyPrefix}-list`}>
        {shifts.map((shift, index) => {
          const isPreset = SHIFT_NAME_PRESETS.includes(
            shift.name as (typeof SHIFT_NAME_PRESETS)[number],
          );
          const selectValue = isPreset ? shift.name : 'Custom';
          const selectedBreakIds = (shift.breaks ?? []).map(
            (br) => br.breakTypeId,
          );

          const breakOptions = breakTypes.map((bt) => {
            const fits =
              !!shift.startTime &&
              !!shift.endTime &&
              !!bt.startAt &&
              !!bt.endAt &&
              doesBreakFitShiftWindow(
                bt.startAt,
                bt.endAt,
                shift.startTime,
                shift.endTime,
              );
            return {
              value: bt.id ?? '',
              label: fits
                ? `${bt.title} (${bt.startAt}–${bt.endAt})`
                : `${bt.title} (${bt.startAt}–${bt.endAt}) — outside shift hours`,
              disabled: !fits,
            };
          });

          const applyShiftHours = (patch: Partial<ShiftDraft>) => {
            const startTime = patch.startTime ?? shift.startTime;
            const endTime = patch.endTime ?? shift.endTime;
            const breaks = enrichAndFilterBreaks(
              shift.breaks,
              startTime,
              endTime,
              breakTypes,
              true,
            );
            updateShift(shift.key, { ...patch, breaks });
          };

          return (
            <div
              key={shift.key}
              className="border border-gray-200 rounded-lg p-4"
              data-cy={`${dataCyPrefix}-card-${index}`}
            >
              <div
                className="flex flex-wrap gap-3 items-start"
                data-cy={`${dataCyPrefix}-card-row-${index}`}
              >
                <div className="min-w-[140px] flex-1">
                  <label
                    className="text-xs text-gray-600 block mb-1"
                    data-cy={`${dataCyPrefix}-name-label-${index}`}
                  >
                    Shift Name
                  </label>
                  <Select
                    className="w-full"
                    value={selectValue}
                    onChange={(value) => {
                      if (value === 'Custom') {
                        updateShift(shift.key, {
                          name:
                            isPreset || !shift.name ? 'Custom' : shift.name,
                        });
                      } else {
                        updateShift(shift.key, { name: value });
                      }
                    }}
                    options={SHIFT_NAME_PRESETS.map((name) => ({
                      label: name,
                      value: name,
                    }))}
                    data-cy={`${dataCyPrefix}-name-select-${index}`}
                  />
                  {selectValue === 'Custom' && (
                    <Input
                      className="mt-2"
                      placeholder="Custom shift name"
                      value={shift.name === 'Custom' ? '' : shift.name}
                      onChange={(e) =>
                        updateShift(shift.key, {
                          name: e.target.value || 'Custom',
                        })
                      }
                      data-cy={`${dataCyPrefix}-custom-name-${index}`}
                    />
                  )}
                </div>

                <div className="min-w-[120px]">
                  <label
                    className="text-xs text-gray-600 block mb-1"
                    data-cy={`${dataCyPrefix}-start-label-${index}`}
                  >
                    Start
                  </label>
                  <TimePicker
                    className="w-full"
                    format="h:mm A"
                    use12Hours
                    value={
                      shift.startTime
                        ? dayjs(shift.startTime, 'h:mm A')
                        : null
                    }
                    onChange={(time) =>
                      applyShiftHours({
                        startTime: time ? dayjs(time).format('h:mm A') : '',
                      })
                    }
                    data-cy={`${dataCyPrefix}-start-${index}`}
                  />
                </div>

                <div className="min-w-[120px]">
                  <label
                    className="text-xs text-gray-600 block mb-1"
                    data-cy={`${dataCyPrefix}-end-label-${index}`}
                  >
                    End
                  </label>
                  <TimePicker
                    className="w-full"
                    format="h:mm A"
                    use12Hours
                    value={
                      shift.endTime ? dayjs(shift.endTime, 'h:mm A') : null
                    }
                    onChange={(time) =>
                      applyShiftHours({
                        endTime: time ? dayjs(time).format('h:mm A') : '',
                      })
                    }
                    data-cy={`${dataCyPrefix}-end-${index}`}
                  />
                </div>

                <div className="pt-5">
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    disabled={shifts.length <= 1}
                    onClick={() => removeShift(shift.key)}
                    data-cy={`${dataCyPrefix}-remove-${index}`}
                  >
                    Remove
                  </Button>
                </div>
              </div>

              <div
                className="flex flex-wrap gap-6 mt-4"
                data-cy={`${dataCyPrefix}-switches-${index}`}
              >
                <div className="flex items-center gap-2">
                  <Switch
                    size="small"
                    checked={!!shift.isSwappable}
                    onChange={(checked) =>
                      updateShift(shift.key, { isSwappable: checked })
                    }
                    data-cy={`${dataCyPrefix}-swappable-${index}`}
                  />
                  <span className="text-sm text-gray-700">Swappable</span>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    size="small"
                    checked={!!shift.applyToAllDays}
                    onChange={(checked) =>
                      updateShift(shift.key, {
                        applyToAllDays: checked,
                        days: checked ? [] : shift.days,
                      })
                    }
                    data-cy={`${dataCyPrefix}-all-days-${index}`}
                  />
                  <span className="text-sm text-gray-700">
                    Apply to all days
                  </span>
                </div>
              </div>

              {!shift.applyToAllDays && (
                <div className="mt-3" data-cy={`${dataCyPrefix}-days-${index}`}>
                  <label className="text-xs text-gray-600 block mb-1">
                    Days
                  </label>
                  <Select
                    mode="multiple"
                    className="w-full"
                    placeholder="Select days"
                    value={shift.days ?? []}
                    onChange={(days) => updateShift(shift.key, { days })}
                    options={WEEK_DAYS.map((day) => ({
                      label: day,
                      value: day,
                    }))}
                    data-cy={`${dataCyPrefix}-days-select-${index}`}
                  />
                </div>
              )}

              <div className="mt-4" data-cy={`${dataCyPrefix}-breaks-${index}`}>
                <label className="text-xs text-gray-600 block mb-1">
                  Breaks
                </label>
                <Select
                  mode="multiple"
                  className="w-full"
                  placeholder={
                    !shift.startTime || !shift.endTime
                      ? 'Set shift hours first'
                      : 'Select break types that fit this shift'
                  }
                  loading={breakTypesLoading}
                  value={selectedBreakIds}
                  options={breakOptions}
                  optionFilterProp="label"
                  onChange={(ids: string[]) => {
                    const nextBreaks = ids
                      .map((id, sortOrder) => {
                        const bt = breakTypes.find((item) => item.id === id);
                        if (!bt?.startAt || !bt?.endAt) return null;
                        if (
                          !doesBreakFitShiftWindow(
                            bt.startAt,
                            bt.endAt,
                            shift.startTime,
                            shift.endTime,
                          )
                        ) {
                          return null;
                        }
                        const existing = (shift.breaks ?? []).find(
                          (br) => br.breakTypeId === id,
                        );
                        return {
                          id: existing?.id,
                          breakTypeId: id,
                          sortOrder,
                          startAt: existing?.startAt ?? bt.startAt,
                          endAt: existing?.endAt ?? bt.endAt,
                          startAtFrom:
                            existing?.startAtFrom ?? bt.startAtFrom ?? null,
                          startAtTo:
                            existing?.startAtTo ?? bt.startAtTo ?? null,
                          endAtFrom:
                            existing?.endAtFrom ?? bt.endAtFrom ?? null,
                          endAtTo: existing?.endAtTo ?? bt.endAtTo ?? null,
                        };
                      })
                      .filter(Boolean) as ShiftBreak[];
                    updateShift(shift.key, { breaks: nextBreaks });
                  }}
                  data-cy={`${dataCyPrefix}-breaks-select-${index}`}
                />
                <Alert
                  type="info"
                  showIcon
                  className="mt-2"
                  message={BREAK_OUTSIDE_SHIFT_WARNING}
                  data-cy={`${dataCyPrefix}-breaks-warning-${index}`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ShiftsSection;
