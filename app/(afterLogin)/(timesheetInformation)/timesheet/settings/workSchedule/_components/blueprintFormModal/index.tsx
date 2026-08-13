'use client';

import { useEffect, useMemo } from 'react';
import {
  Button,
  Checkbox,
  Form,
  Input,
  Modal,
  Radio,
  Select,
  TimePicker,
} from 'antd';
import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';
import {
  CreateBlueprintInput,
  SHIFT_NAME_PRESETS,
  ShiftNamePreset,
  WEEKDAYS,
  Weekday,
  WorkScheduleShift,
} from '@/types/timesheet/workSchedule';
import { useWorkScheduleUiStore } from '@/store/uistate/features/timesheet/workSchedule';
import {
  useCreateBlueprint,
  useUpdateBlueprint,
} from '@/store/server/features/timesheet/workSchedule/mutation';
import { useGetBlueprint } from '@/store/server/features/timesheet/workSchedule/queries';
import {
  durationHours,
  formatHours,
  formatTime,
  formatTimeRange,
  remainingHoursForWeekday,
  suggestShiftTimes,
  TIME_FORMAT,
  timesOverlap,
  unallocatedGaps,
} from '@/store/server/features/timesheet/workSchedule/helpers';

type ShiftFormValue = {
  id?: string;
  namePreset: ShiftNamePreset;
  customName?: string;
  startTime: dayjs.Dayjs;
  endTime: dayjs.Dayjs;
  applyTo: 'all' | 'specific';
  weekdays?: Weekday[];
};

type BlueprintFormValues = {
  title: string;
  isSwappable: boolean;
  activeWeekdays: Weekday[];
  defaultStartTime: dayjs.Dayjs;
  defaultEndTime: dayjs.Dayjs;
  shifts?: ShiftFormValue[];
};

const weekdayOptions = WEEKDAYS.map((day) => ({
  label: day.slice(0, 3),
  value: day,
}));

const presetOptions = SHIFT_NAME_PRESETS.map((name) => ({
  label: name,
  value: name,
}));

const shiftNameFromForm = (shift: ShiftFormValue): string => {
  if (shift.namePreset === 'Custom') {
    return (shift.customName || '').trim();
  }
  return shift.namePreset;
};

const shiftWeekdaysFromForm = (
  shift: ShiftFormValue,
  activeWeekdays: Weekday[],
): Weekday[] => {
  if (shift.applyTo === 'specific' && shift.weekdays?.length) {
    return shift.weekdays.filter((day) => activeWeekdays.includes(day));
  }
  return activeWeekdays;
};

const BlueprintFormModal = () => {
  const {
    isBlueprintModalOpen,
    isBlueprintEditMode,
    selectedBlueprintId,
    closeBlueprintModal,
  } = useWorkScheduleUiStore();
  const [form] = Form.useForm<BlueprintFormValues>();
  const activeWeekdaysWatch = Form.useWatch('activeWeekdays', form);
  const defaultStartTime = Form.useWatch('defaultStartTime', form);
  const defaultEndTime = Form.useWatch('defaultEndTime', form);
  const shiftsWatchRaw = Form.useWatch('shifts', form);
  const activeWeekdays = useMemo(
    () => activeWeekdaysWatch || [],
    [activeWeekdaysWatch],
  );
  const shiftsWatch = useMemo(() => shiftsWatchRaw || [], [shiftsWatchRaw]);
  const { data: editingBlueprint } = useGetBlueprint(
    isBlueprintEditMode ? selectedBlueprintId : null,
  );
  const { mutate: createBlueprint, isLoading: isCreating } =
    useCreateBlueprint();
  const { mutate: updateBlueprint, isLoading: isUpdating } =
    useUpdateBlueprint();

  useEffect(() => {
    if (!isBlueprintModalOpen) {
      form.resetFields();
      return;
    }
    if (isBlueprintEditMode && editingBlueprint) {
      form.setFieldsValue({
        title: editingBlueprint.title,
        isSwappable: editingBlueprint.isSwappable,
        activeWeekdays: editingBlueprint.activeWeekdays,
        defaultStartTime: dayjs(editingBlueprint.defaultStartTime, TIME_FORMAT),
        defaultEndTime: dayjs(editingBlueprint.defaultEndTime, TIME_FORMAT),
        shifts: (editingBlueprint.shifts || []).map((shift) => {
          const preset = (SHIFT_NAME_PRESETS as readonly string[]).includes(
            shift.name,
          )
            ? (shift.name as ShiftNamePreset)
            : 'Custom';
          const appliesToAll =
            editingBlueprint.activeWeekdays.length === shift.weekdays.length &&
            editingBlueprint.activeWeekdays.every((day) =>
              shift.weekdays.includes(day),
            );
          return {
            id: shift.id,
            namePreset: preset,
            customName: preset === 'Custom' ? shift.name : undefined,
            startTime: dayjs(shift.startTime, TIME_FORMAT),
            endTime: dayjs(shift.endTime, TIME_FORMAT),
            applyTo: appliesToAll ? 'all' : 'specific',
            weekdays: shift.weekdays,
          };
        }),
      });
      return;
    }
    form.setFieldsValue({
      title: undefined,
      isSwappable: false,
      activeWeekdays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      defaultStartTime: dayjs('08:00', TIME_FORMAT),
      defaultEndTime: dayjs('17:00', TIME_FORMAT),
      shifts: [],
    });
  }, [isBlueprintModalOpen, isBlueprintEditMode, editingBlueprint, form]);

  const dayWindowHours =
    defaultStartTime && defaultEndTime
      ? durationHours(
          defaultStartTime.format(TIME_FORMAT),
          defaultEndTime.format(TIME_FORMAT),
        )
      : 0;

  const parsedShifts = useMemo(() => {
    return (shiftsWatch || [])
      .filter((shift) => shift?.startTime && shift?.endTime)
      .map((shift) => ({
        name: shiftNameFromForm(shift),
        startTime: shift.startTime.format(TIME_FORMAT),
        endTime: shift.endTime.format(TIME_FORMAT),
        weekdays: shiftWeekdaysFromForm(shift, activeWeekdays),
      }));
  }, [shiftsWatch, activeWeekdays]);

  const remainingByDay = useMemo(() => {
    if (!defaultStartTime || !defaultEndTime || !activeWeekdays.length) {
      return [];
    }
    const dayStart = defaultStartTime.format(TIME_FORMAT);
    const dayEnd = defaultEndTime.format(TIME_FORMAT);
    return activeWeekdays.map((weekday) => {
      const dayShifts = parsedShifts.filter((shift) =>
        shift.weekdays.includes(weekday),
      );
      const remaining = remainingHoursForWeekday(
        dayStart,
        dayEnd,
        parsedShifts,
        weekday,
      );
      const gaps = unallocatedGaps(dayStart, dayEnd, dayShifts);
      return { weekday, remaining, gaps };
    });
  }, [activeWeekdays, defaultStartTime, defaultEndTime, parsedShifts]);

  const applyPresetTimes = (index: number, preset: ShiftNamePreset) => {
    if (!defaultStartTime || !defaultEndTime) return;
    const suggested = suggestShiftTimes(
      preset,
      defaultStartTime.format(TIME_FORMAT),
      defaultEndTime.format(TIME_FORMAT),
    );
    const shifts = form.getFieldValue('shifts') || [];
    shifts[index] = {
      ...shifts[index],
      namePreset: preset,
      startTime: dayjs(suggested.startTime, TIME_FORMAT),
      endTime: dayjs(suggested.endTime, TIME_FORMAT),
    };
    form.setFieldsValue({ shifts: [...shifts] });
  };

  const toPayload = (values: BlueprintFormValues): CreateBlueprintInput => {
    const shifts: WorkScheduleShift[] = (values.shifts || [])
      .filter((shift) => shift?.startTime && shift?.endTime)
      .map((shift) => ({
        id: shift.id || uuidv4(),
        name: shiftNameFromForm(shift),
        startTime: formatTime(shift.startTime.format(TIME_FORMAT)),
        endTime: formatTime(shift.endTime.format(TIME_FORMAT)),
        weekdays: shiftWeekdaysFromForm(shift, values.activeWeekdays),
      }));

    return {
      title: values.title.trim(),
      hasShifts: shifts.length > 0,
      isSwappable: shifts.length > 0 ? Boolean(values.isSwappable) : false,
      activeWeekdays: values.activeWeekdays,
      defaultStartTime: values.defaultStartTime.format(TIME_FORMAT),
      defaultEndTime: values.defaultEndTime.format(TIME_FORMAT),
      shifts,
    };
  };

  const handleSubmit = () => {
    form
      .validateFields()
      .then((values) => {
        const payload = toPayload(values);
        if (isBlueprintEditMode && selectedBlueprintId) {
          updateBlueprint(
            { id: selectedBlueprintId, input: payload },
            { onSuccess: closeBlueprintModal },
          );
        } else {
          createBlueprint(payload, { onSuccess: closeBlueprintModal });
        }
      })
      .catch(() => undefined);
  };

  return (
    <Modal
      title={
        <h1
          className="text-[#4d4d4d] text-lg font-semibold mb-0"
          data-cy="time-attendance-settings-work-schedule-blueprint-modal-title"
        >
          {isBlueprintEditMode ? 'Edit Work Schedule' : 'Create Work Schedule'}
        </h1>
      }
      open={isBlueprintModalOpen}
      onCancel={closeBlueprintModal}
      width={760}
      centered
      destroyOnClose
      footer={
        <div
          className="flex justify-end gap-3 pt-2"
          data-cy="time-attendance-settings-work-schedule-blueprint-modal-footer"
        >
          <Button
            className="h-10 px-5"
            onClick={closeBlueprintModal}
            data-cy="time-attendance-settings-work-schedule-blueprint-modal-cancel"
          >
            Cancel
          </Button>
          <Button
            type="primary"
            className="h-10 px-5"
            loading={isCreating || isUpdating}
            onClick={handleSubmit}
            data-cy="time-attendance-settings-work-schedule-blueprint-modal-submit"
          >
            {isBlueprintEditMode ? 'Update' : 'Create'}
          </Button>
        </div>
      }
      data-cy="time-attendance-settings-work-schedule-blueprint-modal"
    >
      <Form
        form={form}
        layout="vertical"
        className="w-full"
        data-cy="time-attendance-settings-work-schedule-blueprint-form"
      >
        <fieldset
          className="border border-gray-200 rounded-xl p-4 mb-4"
          data-cy="time-attendance-settings-work-schedule-blueprint-general"
        >
          <legend
            className="px-1 text-sm font-semibold text-[#4d4d4d]"
            data-cy="time-attendance-settings-work-schedule-blueprint-general-legend"
          >
            General Info
          </legend>
          <Form.Item
            name="title"
            label={
              <span
                className="text-sm font-medium"
                data-cy="time-attendance-settings-work-schedule-blueprint-title-label"
              >
                Title
              </span>
            }
            rules={[
              { required: true, message: 'Please enter a work schedule name' },
            ]}
          >
            <Input
              size="large"
              placeholder="Office Hours"
              className="h-10"
              data-cy="time-attendance-settings-work-schedule-blueprint-title"
            />
          </Form.Item>
          <p
            className="text-xs text-gray-500 mb-0"
            data-cy="time-attendance-settings-work-schedule-blueprint-permanent-note"
          >
            This work schedule is permanent. It applies indefinitely until you
            edit or delete it.
          </p>
        </fieldset>

        <fieldset
          className="border border-gray-200 rounded-xl p-4 mb-4"
          data-cy="time-attendance-settings-work-schedule-blueprint-days"
        >
          <legend
            className="px-1 text-sm font-semibold text-[#4d4d4d]"
            data-cy="time-attendance-settings-work-schedule-blueprint-days-legend"
          >
            Work Days
          </legend>
          <Form.Item
            name="activeWeekdays"
            label={
              <span
                className="text-sm font-medium"
                data-cy="time-attendance-settings-work-schedule-blueprint-weekdays-label"
              >
                Active days
              </span>
            }
            rules={[
              { required: true, message: 'Select at least one weekday' },
              {
                validator: (rule, value: Weekday[]) =>
                  value?.length
                    ? Promise.resolve()
                    : Promise.reject(new Error('Select at least one weekday')),
              },
            ]}
          >
            <Select
              mode="multiple"
              options={weekdayOptions}
              className="w-full"
              placeholder="Select days"
              data-cy="time-attendance-settings-work-schedule-blueprint-weekdays"
            />
          </Form.Item>
          <div
            className="grid grid-cols-1 sm:grid-cols-2 gap-3"
            data-cy="time-attendance-settings-work-schedule-blueprint-default-times"
          >
            <Form.Item
              name="defaultStartTime"
              label={
                <span
                  className="text-sm font-medium"
                  data-cy="time-attendance-settings-work-schedule-blueprint-start-label"
                >
                  Day start time
                </span>
              }
              rules={[{ required: true, message: 'Start time is required' }]}
            >
              <TimePicker
                format={TIME_FORMAT}
                className="w-full h-10"
                data-cy="time-attendance-settings-work-schedule-blueprint-start"
              />
            </Form.Item>
            <Form.Item
              name="defaultEndTime"
              label={
                <span
                  className="text-sm font-medium"
                  data-cy="time-attendance-settings-work-schedule-blueprint-end-label"
                >
                  Day end time
                </span>
              }
              rules={[
                { required: true, message: 'End time is required' },
                ({ getFieldValue }) => ({
                  validator(rule, value) {
                    const start = getFieldValue('defaultStartTime');
                    if (!value || !start || value.isAfter(start)) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error('End time must be after start time'),
                    );
                  },
                }),
              ]}
            >
              <TimePicker
                format={TIME_FORMAT}
                className="w-full h-10"
                data-cy="time-attendance-settings-work-schedule-blueprint-end"
              />
            </Form.Item>
          </div>
          {dayWindowHours > 0 && (
            <p
              className="text-xs text-gray-500 mb-0"
              data-cy="time-attendance-settings-work-schedule-blueprint-window-hours"
            >
              {formatHours(dayWindowHours)} available on each selected day for
              shift setup.
            </p>
          )}
        </fieldset>

        <fieldset
          className="border border-gray-200 rounded-xl p-4"
          data-cy="time-attendance-settings-work-schedule-blueprint-shifts"
        >
          <legend
            className="px-1 text-sm font-semibold text-[#4d4d4d]"
            data-cy="time-attendance-settings-work-schedule-blueprint-shifts-legend"
          >
            Shifts
          </legend>
          <p
            className="text-xs text-gray-500 mb-3"
            data-cy="time-attendance-settings-work-schedule-blueprint-shifts-help"
          >
            Add Morning, Afternoon, or custom shifts inside the day window.
            Apply a shift to all work days or mark specific days only.
          </p>

          {remainingByDay.length > 0 && (
            <div
              className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4"
              data-cy="time-attendance-settings-work-schedule-blueprint-remaining"
            >
              {remainingByDay.map((item) => (
                <div
                  key={item.weekday}
                  className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2"
                  data-cy={`time-attendance-settings-work-schedule-blueprint-remaining-${item.weekday}`}
                >
                  <div
                    className="text-xs font-semibold text-[#4d4d4d]"
                    data-cy={`time-attendance-settings-work-schedule-blueprint-remaining-day-${item.weekday}`}
                  >
                    {item.weekday.slice(0, 3)}
                  </div>
                  <div
                    className="text-xs text-gray-600"
                    data-cy={`time-attendance-settings-work-schedule-blueprint-remaining-hours-${item.weekday}`}
                  >
                    {item.remaining > 0
                      ? `${formatHours(item.remaining)} remaining`
                      : 'Fully allocated'}
                  </div>
                  {item.gaps.length > 0 && (
                    <div
                      className="text-[11px] text-gray-500"
                      data-cy={`time-attendance-settings-work-schedule-blueprint-remaining-gaps-${item.weekday}`}
                    >
                      {item.gaps
                        .map((gap) =>
                          formatTimeRange(gap.startTime, gap.endTime),
                        )
                        .join(' · ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <Form.List
            name="shifts"
            rules={[
              {
                validator: async (rule, shifts: ShiftFormValue[]) => {
                  const items = shifts || [];
                  for (let i = 0; i < items.length; i += 1) {
                    for (let j = i + 1; j < items.length; j += 1) {
                      const left = items[i];
                      const right = items[j];
                      if (
                        !left?.startTime ||
                        !left?.endTime ||
                        !right?.startTime ||
                        !right?.endTime
                      ) {
                        continue;
                      }
                      const leftDays = shiftWeekdaysFromForm(
                        left,
                        activeWeekdays,
                      );
                      const rightDays = shiftWeekdaysFromForm(
                        right,
                        activeWeekdays,
                      );
                      const sharedDay = leftDays.find((day) =>
                        rightDays.includes(day),
                      );
                      if (
                        sharedDay &&
                        timesOverlap(
                          left.startTime.format(TIME_FORMAT),
                          left.endTime.format(TIME_FORMAT),
                          right.startTime.format(TIME_FORMAT),
                          right.endTime.format(TIME_FORMAT),
                        )
                      ) {
                        throw new Error(
                          `${shiftNameFromForm(left) || 'Shift'} and ${
                            shiftNameFromForm(right) || 'shift'
                          } overlap on ${sharedDay}.`,
                        );
                      }
                    }
                  }
                },
              },
            ]}
          >
            {(fields, { add, remove }, { errors }) => (
              <div data-cy="time-attendance-settings-work-schedule-blueprint-shift-list">
                <div
                  className="flex justify-between items-center mb-3"
                  data-cy="time-attendance-settings-work-schedule-blueprint-shift-list-header"
                >
                  <span
                    className="text-sm font-medium text-[#4d4d4d]"
                    data-cy="time-attendance-settings-work-schedule-blueprint-shift-list-label"
                  >
                    Daily shifts
                  </span>
                  <Button
                    type="dashed"
                    disabled={!activeWeekdays.length || !defaultStartTime}
                    onClick={() => {
                      const existingNames = (form.getFieldValue('shifts') || [])
                        .map((shift: ShiftFormValue) =>
                          shiftNameFromForm(shift),
                        )
                        .map((name: string) => name.toLowerCase());
                      const preset: ShiftNamePreset = existingNames.includes(
                        'morning',
                      )
                        ? existingNames.includes('afternoon')
                          ? 'Custom'
                          : 'Afternoon'
                        : 'Morning';
                      const suggested =
                        defaultStartTime && defaultEndTime
                          ? suggestShiftTimes(
                              preset,
                              defaultStartTime.format(TIME_FORMAT),
                              defaultEndTime.format(TIME_FORMAT),
                            )
                          : { startTime: '08:00', endTime: '12:00' };
                      add({
                        id: uuidv4(),
                        namePreset: preset,
                        startTime: dayjs(suggested.startTime, TIME_FORMAT),
                        endTime: dayjs(suggested.endTime, TIME_FORMAT),
                        applyTo: 'all',
                        weekdays: activeWeekdays,
                      });
                    }}
                    data-cy="time-attendance-settings-work-schedule-blueprint-add-shift"
                  >
                    + Add Shift
                  </Button>
                </div>
                {fields.map((field, index) => (
                  <div
                    key={field.key}
                    className="border border-gray-200 rounded-lg p-3 mb-3"
                    data-cy={`time-attendance-settings-work-schedule-blueprint-shift-${index}`}
                  >
                    <Form.Item {...field} name={[field.name, 'id']} hidden>
                      <Input />
                    </Form.Item>
                    <div
                      className="grid grid-cols-1 sm:grid-cols-3 gap-3"
                      data-cy={`time-attendance-settings-work-schedule-blueprint-shift-fields-${index}`}
                    >
                      <Form.Item
                        {...field}
                        name={[field.name, 'namePreset']}
                        label="Shift"
                        rules={[{ required: true, message: 'Select a shift' }]}
                      >
                        <Select
                          options={presetOptions}
                          onChange={(value: ShiftNamePreset) =>
                            applyPresetTimes(index, value)
                          }
                        />
                      </Form.Item>
                      <Form.Item
                        {...field}
                        name={[field.name, 'startTime']}
                        label="Start"
                        rules={[
                          { required: true, message: 'Required' },
                          ({ getFieldValue }) => ({
                            validator(rule, value) {
                              const dayStart =
                                getFieldValue('defaultStartTime');
                              const dayEnd = getFieldValue('defaultEndTime');
                              const end = getFieldValue([
                                'shifts',
                                field.name,
                                'endTime',
                              ]);
                              if (!value || !end) return Promise.resolve();
                              if (!value.isBefore(end)) {
                                return Promise.reject(
                                  new Error('Start must be before end'),
                                );
                              }
                              if (
                                dayStart &&
                                value.isBefore(dayStart, 'minute')
                              ) {
                                return Promise.reject(
                                  new Error('Must be after day start'),
                                );
                              }
                              if (dayEnd && end.isAfter(dayEnd, 'minute')) {
                                return Promise.reject(
                                  new Error('Must stay inside the day window'),
                                );
                              }
                              return Promise.resolve();
                            },
                          }),
                        ]}
                      >
                        <TimePicker format={TIME_FORMAT} className="w-full" />
                      </Form.Item>
                      <Form.Item
                        {...field}
                        name={[field.name, 'endTime']}
                        label="End"
                        rules={[
                          { required: true, message: 'Required' },
                          ({ getFieldValue }) => ({
                            validator(rule, value) {
                              const dayStart =
                                getFieldValue('defaultStartTime');
                              const dayEnd = getFieldValue('defaultEndTime');
                              const start = getFieldValue([
                                'shifts',
                                field.name,
                                'startTime',
                              ]);
                              if (!value || !start) return Promise.resolve();
                              if (!value.isAfter(start)) {
                                return Promise.reject(
                                  new Error('End must be after start'),
                                );
                              }
                              if (
                                dayStart &&
                                start.isBefore(dayStart, 'minute')
                              ) {
                                return Promise.reject(
                                  new Error('Must stay inside the day window'),
                                );
                              }
                              if (dayEnd && value.isAfter(dayEnd, 'minute')) {
                                return Promise.reject(
                                  new Error('Must be before day end'),
                                );
                              }
                              return Promise.resolve();
                            },
                          }),
                        ]}
                      >
                        <TimePicker format={TIME_FORMAT} className="w-full" />
                      </Form.Item>
                    </div>
                    <Form.Item
                      noStyle
                      shouldUpdate={(prev, next) =>
                        prev.shifts?.[field.name]?.namePreset !==
                        next.shifts?.[field.name]?.namePreset
                      }
                    >
                      {() =>
                        form.getFieldValue('shifts')?.[index]?.namePreset ===
                        'Custom' ? (
                          <Form.Item
                            {...field}
                            name={[field.name, 'customName']}
                            label="Custom name"
                            rules={[
                              {
                                required: true,
                                message: 'Enter a shift name',
                              },
                            ]}
                          >
                            <Input placeholder="Split shift" />
                          </Form.Item>
                        ) : null
                      }
                    </Form.Item>
                    <Form.Item
                      {...field}
                      name={[field.name, 'applyTo']}
                      label="Apply to"
                      rules={[{ required: true, message: 'Required' }]}
                    >
                      <Radio.Group
                        data-cy={`time-attendance-settings-work-schedule-blueprint-shift-apply-${index}`}
                      >
                        <Radio value="all">All selected days</Radio>
                        <Radio value="specific">Specific days</Radio>
                      </Radio.Group>
                    </Form.Item>
                    <Form.Item
                      noStyle
                      shouldUpdate={(prev, next) =>
                        prev.shifts?.[field.name]?.applyTo !==
                          next.shifts?.[field.name]?.applyTo ||
                        prev.activeWeekdays !== next.activeWeekdays
                      }
                    >
                      {() =>
                        form.getFieldValue('shifts')?.[index]?.applyTo ===
                        'specific' ? (
                          <Form.Item
                            {...field}
                            name={[field.name, 'weekdays']}
                            label="Mark days"
                            rules={[
                              {
                                required: true,
                                message: 'Mark at least one day',
                              },
                            ]}
                          >
                            <Checkbox.Group
                              options={activeWeekdays.map((day) => ({
                                label: day.slice(0, 3),
                                value: day,
                              }))}
                            />
                          </Form.Item>
                        ) : null
                      }
                    </Form.Item>
                    <Button
                      size="small"
                      danger
                      onClick={() => remove(field.name)}
                      data-cy={`time-attendance-settings-work-schedule-blueprint-shift-remove-${index}`}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Form.ErrorList errors={errors} />
                {fields.length === 0 && (
                  <p
                    className="text-xs text-gray-500 mb-0"
                    data-cy="time-attendance-settings-work-schedule-blueprint-no-shifts"
                  >
                    No shifts yet. Leave empty to keep day hours only, or add
                    shifts such as Morning and Afternoon.
                  </p>
                )}
              </div>
            )}
          </Form.List>

          {shiftsWatch.length > 0 && (
            <Form.Item
              name="isSwappable"
              valuePropName="checked"
              className="mb-0 mt-3"
            >
              <Checkbox data-cy="time-attendance-settings-work-schedule-blueprint-swappable">
                Enable Peer Swapping
              </Checkbox>
            </Form.Item>
          )}
        </fieldset>
      </Form>
    </Modal>
  );
};

export default BlueprintFormModal;
