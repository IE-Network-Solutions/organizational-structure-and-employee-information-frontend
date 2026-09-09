import CustomLabel from '@/components/form/customLabel/customLabel';
import { useSetBreakType } from '@/store/server/features/timesheet/breakType/mutation';
import { useGetBreakType } from '@/store/server/features/timesheet/breakType/queries';
import { useFetchSchedule } from '@/store/server/features/organizationStructure/workSchedule/queries';
import { useTimesheetSettingsStore } from '@/store/uistate/features/timesheet/settings';
import { ORG_AND_EMP_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { getCurrentToken } from '@/utils/getCurrentToken';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import {
  BREAK_OUTSIDE_SHIFT_WARNING,
  doesBreakFitShiftWindow,
} from '@/helpers/breakShiftWindow';
import {
  Button,
  Col,
  Collapse,
  Form,
  Input,
  Modal,
  Row,
  Select,
  TimePicker,
} from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import React, { useMemo } from 'react';
import { useQuery } from 'react-query';

const parseTime = (value?: string | null) =>
  value ? dayjs(value, ['HH:mm:ss', 'HH:mm']) : undefined;

const formatTime = (value?: Dayjs | null) =>
  value ? value.format('HH:mm') : undefined;

type ShiftOption = {
  label: string;
  value: string;
  startTime?: string;
  endTime?: string;
  disabled?: boolean;
};

const unwrapShiftList = (payload: unknown): any[] => {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== 'object') return [];
  const data = payload as Record<string, unknown>;
  if (Array.isArray(data.items)) return data.items;
  if (Array.isArray(data.data)) return data.data;
  if (data.data && typeof data.data === 'object') {
    const nested = data.data as Record<string, unknown>;
    if (Array.isArray(nested.items)) return nested.items;
  }
  if (Array.isArray(data.shifts)) return data.shifts;
  return [];
};

const fetchShiftsForSchedule = async (scheduleId: string) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  return crudRequest({
    url: `${ORG_AND_EMP_URL}/work-schedules/${scheduleId}/shifts`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId,
    },
  });
};

const windowAfterValidator =
  (fromField: string, message: string) =>
  ({
    getFieldValue,
  }: {
    getFieldValue: (name: string) => Dayjs | undefined;
  }) => ({
    /* eslint-disable @typescript-eslint/naming-convention */
    validator(_: unknown, value: Dayjs | undefined) {
      /* eslint-enable @typescript-eslint/naming-convention */
      const from = getFieldValue(fromField);
      if (!value || !from || value.isAfter(from)) {
        return Promise.resolve();
      }
      return Promise.reject(new Error(message));
    },
  });

const BreakTypeSidebar = () => {
  const {
    isShowBreakTypeSidebar: isShow,
    setIsShowBreakTypeSidebar: setIsShow,
    selectedBreakType,
    setSelectedBreakType,
  } = useTimesheetSettingsStore();
  const [form] = Form.useForm();
  const { mutate: setBreakType } = useSetBreakType();
  const { data: scheduleData, isLoading: schedulesLoading } = useFetchSchedule(
    1,
    100,
  );
  const { data: breakTypeDetail } = useGetBreakType(
    selectedBreakType?.id || '',
  );
  const [startWindowOpen, setStartWindowOpen] = React.useState(false);
  const [endWindowOpen, setEndWindowOpen] = React.useState(false);
  const watchedStartAt = Form.useWatch('startAt', form) as Dayjs | undefined;
  const watchedEndAt = Form.useWatch('endAt', form) as Dayjs | undefined;
  const watchedShiftIds = Form.useWatch('shiftIds', form) as
    | string[]
    | undefined;
  const itemClass = 'font-semibold text-xs';
  const controlClass = 'mt-2.5 h-[40px] w-full';

  const scheduleItems = useMemo(() => {
    const raw =
      (scheduleData as any)?.items ??
      (scheduleData as any)?.data?.items ??
      (Array.isArray(scheduleData) ? scheduleData : []);
    return Array.isArray(raw) ? raw : [];
  }, [scheduleData]);

  const scheduleIdsKey = scheduleItems
    .map((s: any) => s?.id)
    .filter(Boolean)
    .join(',');

  const { data: shiftOptions = [], isLoading: shiftsLoading } = useQuery(
    ['break-type-shift-options', scheduleIdsKey],
    async () => {
      const options: ShiftOption[] = [];
      for (const schedule of scheduleItems) {
        const scheduleId = schedule?.id;
        const scheduleName = schedule?.name || 'Work Schedule';
        if (!scheduleId) continue;

        let shifts = Array.isArray(schedule?.shifts) ? schedule.shifts : [];
        if (!shifts.length) {
          try {
            const payload = await fetchShiftsForSchedule(scheduleId);
            shifts = unwrapShiftList(payload);
          } catch {
            shifts = [];
          }
        }

        for (const shift of shifts) {
          if (!shift?.id) continue;
          const hours =
            shift.startTime && shift.endTime
              ? ` · ${shift.startTime}–${shift.endTime}`
              : '';
          options.push({
            value: shift.id,
            label: `${shift.name || 'Shift'} (${scheduleName})${hours}`,
            startTime: shift.startTime,
            endTime: shift.endTime,
          });
        }
      }
      return options;
    },
    {
      enabled: isShow && scheduleItems.length > 0,
      keepPreviousData: true,
    },
  );

  const breakStart = formatTime(watchedStartAt);
  const breakEnd = formatTime(watchedEndAt);

  const shiftSelectOptions = useMemo(() => {
    return shiftOptions.map((option) => {
      if (!breakStart || !breakEnd) {
        return { ...option, disabled: false };
      }
      const fits = doesBreakFitShiftWindow(
        breakStart,
        breakEnd,
        option.startTime,
        option.endTime,
      );
      return {
        ...option,
        disabled: !fits,
        label: fits
          ? option.label
          : `${option.label} — break outside shift hours`,
      };
    });
  }, [shiftOptions, breakStart, breakEnd]);

  const incompatibleSelected = useMemo(() => {
    if (!breakStart || !breakEnd || !watchedShiftIds?.length) return [];
    return watchedShiftIds.filter((id) => {
      const option = shiftOptions.find((o) => o.value === id);
      if (!option) return false;
      return !doesBreakFitShiftWindow(
        breakStart,
        breakEnd,
        option.startTime,
        option.endTime,
      );
    });
  }, [watchedShiftIds, shiftOptions, breakStart, breakEnd]);

  React.useEffect(() => {
    if (!incompatibleSelected.length) return;
    const next = (watchedShiftIds || []).filter(
      (id) => !incompatibleSelected.includes(id),
    );
    form.setFieldsValue({ shiftIds: next });
  }, [incompatibleSelected, watchedShiftIds, form]);

  React.useEffect(() => {
    if (selectedBreakType) {
      const detailItem =
        (breakTypeDetail as any)?.item ??
        (breakTypeDetail as any)?.data?.item ??
        null;
      const shiftIds = detailItem?.shiftIds ?? selectedBreakType.shiftIds ?? [];
      const source = detailItem ?? selectedBreakType;
      const formattedBreakType = {
        ...source,
        shiftIds,
        startAt: parseTime(source.startAt),
        endAt: parseTime(source.endAt),
        startAtFrom: parseTime(source.startAtFrom),
        startAtTo: parseTime(source.startAtTo),
        endAtFrom: parseTime(source.endAtFrom),
        endAtTo: parseTime(source.endAtTo),
      };
      form.setFieldsValue(formattedBreakType);
      setStartWindowOpen(Boolean(source.startAtFrom || source.startAtTo));
      setEndWindowOpen(Boolean(source.endAtFrom || source.endAtTo));
    } else {
      form.resetFields();
      setStartWindowOpen(false);
      setEndWindowOpen(false);
    }
  }, [selectedBreakType, breakTypeDetail, form]);

  const onFinish = (values: any) => {
    const {
      startAt,
      endAt,
      startAtFrom,
      startAtTo,
      endAtFrom,
      endAtTo,
      shiftIds,
      ...otherValues
    } = values;

    const formattedStart = startAt.format('HH:mm');
    const formattedEnd = endAt.format('HH:mm');

    const compatibleShiftIds = (shiftIds as string[]).filter((id) => {
      const option = shiftOptions.find((o) => o.value === id);
      if (!option?.startTime || !option?.endTime) return false;
      return doesBreakFitShiftWindow(
        formattedStart,
        formattedEnd,
        option.startTime,
        option.endTime,
      );
    });

    if (!compatibleShiftIds.length) {
      form.setFields([
        {
          name: 'shiftIds',
          errors: [BREAK_OUTSIDE_SHIFT_WARNING],
        },
      ]);
      return;
    }

    const formattedValues = {
      ...otherValues,
      ...(selectedBreakType ? { id: selectedBreakType.id } : {}),
      shiftIds: compatibleShiftIds,
      startAt: formattedStart,
      endAt: formattedEnd,
      ...(formatTime(startAtFrom) && { startAtFrom: formatTime(startAtFrom) }),
      ...(formatTime(startAtTo) && { startAtTo: formatTime(startAtTo) }),
      ...(formatTime(endAtFrom) && { endAtFrom: formatTime(endAtFrom) }),
      ...(formatTime(endAtTo) && { endAtTo: formatTime(endAtTo) }),
    };

    setBreakType(formattedValues, {
      onSuccess: () => {
        setIsShow(false);
        form.resetFields();
        setSelectedBreakType(null);
        setStartWindowOpen(false);
        setEndWindowOpen(false);
      },
    });
  };

  return (
    isShow && (
      <Modal
        open={isShow}
        onCancel={() => setIsShow(false)}
        title={
          <div
            className="text-lg font-semibold text-[#4d4d4d]"
            id="time-attendance-settings-break-type-sidebar-header-container"
            data-cy="time-attendance-settings-break-type-sidebar-header-container"
          >
            Break Type
          </div>
        }
        footer={
          <div
            className="flex justify-end gap-2"
            id="time-attendance-settings-break-type-sidebar-footer-container"
            data-cy="time-attendance-settings-break-type-sidebar-footer-container"
          >
            <Button
              type="default"
              onClick={() => {
                setIsShow(false);
                form.resetFields();
                setSelectedBreakType(null);
                setStartWindowOpen(false);
                setEndWindowOpen(false);
              }}
              id="time-attendance-settings-break-type-sidebar-cancel-button"
              data-cy="time-attendance-settings-break-type-sidebar-cancel-button"
              className="border border-[#D9D9D9] text-base font-normal text-gray-900"
            >
              Cancel
            </Button>
            <Button type="primary" onClick={() => form.submit()}>
              Create
            </Button>
          </div>
        }
        data-cy="time-attendance-settings-break-type-sidebar"
        zIndex={10002}
        centered
      >
        <Form
          layout="vertical"
          requiredMark={CustomLabel}
          autoComplete="off"
          form={form}
          className={itemClass}
          onFinish={onFinish}
          id="time-attendance-settings-break-type-sidebar-form"
          data-cy="time-attendance-settings-break-type-sidebar-form"
        >
          <Form.Item
            id="breakTypeNameFieldId"
            data-cy="time-attendance-settings-break-type-sidebar-title-field-id"
            label={
              <span
                id="time-attendance-settings-break-type-sidebar-title-label"
                data-cy="time-attendance-settings-break-type-sidebar-title-label"
                className="text-sm font-normal text-gray-900 pr-1"
              >
                Break Type Name
              </span>
            }
            name="title"
            rules={[
              {
                required: true,
                message: 'Please enter the break type name',
              },
            ]}
          >
            <Input
              className={controlClass}
              id="time-attendance-settings-break-type-sidebar-title-input"
              data-cy="time-attendance-settings-break-type-sidebar-title-input"
            />
          </Form.Item>
          <Form.Item
            name="shiftIds"
            label={
              <span
                className="text-sm font-normal text-gray-900 pr-1"
                data-cy="time-attendance-settings-break-type-sidebar-shift-ids-label"
              >
                Apply to shifts
              </span>
            }
            extra={BREAK_OUTSIDE_SHIFT_WARNING}
            rules={[
              {
                required: true,
                type: 'array',
                min: 1,
                message: 'Please select at least one shift',
              },
            ]}
            data-cy="time-attendance-settings-break-type-sidebar-shift-ids"
          >
            <Select
              mode="multiple"
              allowClear
              showSearch
              optionFilterProp="label"
              placeholder={
                schedulesLoading || shiftsLoading
                  ? 'Loading shifts...'
                  : shiftOptions.length
                    ? 'Select shifts'
                    : 'No shifts found — create a work schedule shift first'
              }
              loading={schedulesLoading || shiftsLoading}
              className="w-full"
              options={shiftSelectOptions}
              notFoundContent={
                schedulesLoading || shiftsLoading
                  ? 'Loading...'
                  : 'No shifts available'
              }
              data-cy="time-attendance-settings-break-type-sidebar-shift-select"
            />
          </Form.Item>
          <div
            className="mb-4 rounded-lg border border-[#D9D9D9] p-3"
            id="time-attendance-settings-break-type-sidebar-start-group"
            data-cy="time-attendance-settings-break-type-sidebar-start-group"
          >
            <Form.Item
              id="startAtFieldId"
              data-cy="time-attendance-settings-break-type-sidebar-start-at-field-id"
              label={
                <span
                  id="time-attendance-settings-break-type-sidebar-start-at-label"
                  data-cy="time-attendance-settings-break-type-sidebar-start-at-label"
                  className="text-sm font-normal text-gray-900 pr-1"
                >
                  Start At
                </span>
              }
              name="startAt"
              rules={[
                { required: true, message: 'Please select the start time' },
              ]}
              className="mb-3"
            >
              <TimePicker
                className={controlClass}
                format="HH:mm"
                id="time-attendance-settings-break-type-sidebar-start-at-picker"
                data-cy="time-attendance-settings-break-type-sidebar-start-at-picker"
              />
            </Form.Item>
            <div
              id="time-attendance-settings-break-type-sidebar-start-window"
              data-cy="time-attendance-settings-break-type-sidebar-start-window"
            >
              <Collapse
                ghost
                size="small"
                activeKey={startWindowOpen ? ['start-window'] : []}
                onChange={(keys) =>
                  setStartWindowOpen(
                    (Array.isArray(keys) ? keys : [keys]).includes(
                      'start-window',
                    ),
                  )
                }
                className="bg-[#FAFAFA] rounded-md border border-[#E8E8E8] overflow-hidden [&_.ant-collapse-header]:!py-2 [&_.ant-collapse-header]:!px-3 [&_.ant-collapse-content-box]:!px-3 [&_.ant-collapse-content-box]:!pb-2"
                items={[
                  {
                    key: 'start-window',
                    label: (
                      <span
                        className="text-xs font-medium text-gray-500"
                        id="time-attendance-settings-break-type-sidebar-start-window-title"
                        data-cy="time-attendance-settings-break-type-sidebar-start-window-title"
                      >
                        Allowed start window (optional)
                      </span>
                    ),
                    children: (
                      <Row gutter={12}>
                        <Col span={12}>
                          <Form.Item
                            id="startAtFromFieldId"
                            data-cy="time-attendance-settings-break-type-sidebar-start-at-from-field-id"
                            label={
                              <span
                                id="time-attendance-settings-break-type-sidebar-start-at-from-label"
                                data-cy="time-attendance-settings-break-type-sidebar-start-at-from-label"
                                className="text-xs font-normal text-gray-700 pr-1"
                              >
                                From
                              </span>
                            }
                            name="startAtFrom"
                            className="mb-2"
                          >
                            <TimePicker
                              className={controlClass}
                              format="HH:mm"
                              id="time-attendance-settings-break-type-sidebar-start-at-from-picker"
                              data-cy="time-attendance-settings-break-type-sidebar-start-at-from-picker"
                            />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item
                            id="startAtToFieldId"
                            data-cy="time-attendance-settings-break-type-sidebar-start-at-to-field-id"
                            label={
                              <span
                                id="time-attendance-settings-break-type-sidebar-start-at-to-label"
                                data-cy="time-attendance-settings-break-type-sidebar-start-at-to-label"
                                className="text-xs font-normal text-gray-700 pr-1"
                              >
                                To
                              </span>
                            }
                            name="startAtTo"
                            className="mb-2"
                            rules={[
                              windowAfterValidator(
                                'startAtFrom',
                                'Start window to must be after start window from.',
                              ),
                            ]}
                          >
                            <TimePicker
                              className={controlClass}
                              format="HH:mm"
                              id="time-attendance-settings-break-type-sidebar-start-at-to-picker"
                              data-cy="time-attendance-settings-break-type-sidebar-start-at-to-picker"
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                    ),
                  },
                ]}
              />
            </div>
          </div>

          <div
            className="mb-4 rounded-lg border border-[#D9D9D9] p-3"
            id="time-attendance-settings-break-type-sidebar-end-group"
            data-cy="time-attendance-settings-break-type-sidebar-end-group"
          >
            <Form.Item
              id="endAtFieldId"
              data-cy="time-attendance-settings-break-type-sidebar-end-at-field-id"
              label={
                <span
                  id="time-attendance-settings-break-type-sidebar-end-at-label"
                  data-cy="time-attendance-settings-break-type-sidebar-end-at-label"
                  className="text-sm font-normal text-gray-900 pr-1"
                >
                  End At
                </span>
              }
              name="endAt"
              rules={[
                { required: true, message: 'Please select the end time' },
                windowAfterValidator(
                  'startAt',
                  'End time must be after start time.',
                ),
              ]}
              className="mb-3"
            >
              <TimePicker
                className={controlClass}
                format="HH:mm"
                id="time-attendance-settings-break-type-sidebar-end-at-picker"
                data-cy="time-attendance-settings-break-type-sidebar-end-at-picker"
              />
            </Form.Item>
            <div
              id="time-attendance-settings-break-type-sidebar-end-window"
              data-cy="time-attendance-settings-break-type-sidebar-end-window"
            >
              <Collapse
                ghost
                size="small"
                activeKey={endWindowOpen ? ['end-window'] : []}
                onChange={(keys) =>
                  setEndWindowOpen(
                    (Array.isArray(keys) ? keys : [keys]).includes(
                      'end-window',
                    ),
                  )
                }
                className="bg-[#FAFAFA] rounded-md border border-[#E8E8E8] overflow-hidden [&_.ant-collapse-header]:!py-2 [&_.ant-collapse-header]:!px-3 [&_.ant-collapse-content-box]:!px-3 [&_.ant-collapse-content-box]:!pb-2"
                items={[
                  {
                    key: 'end-window',
                    label: (
                      <span
                        className="text-xs font-medium text-gray-500"
                        id="time-attendance-settings-break-type-sidebar-end-window-title"
                        data-cy="time-attendance-settings-break-type-sidebar-end-window-title"
                      >
                        Allowed end window (optional)
                      </span>
                    ),
                    children: (
                      <Row gutter={12}>
                        <Col span={12}>
                          <Form.Item
                            id="endAtFromFieldId"
                            data-cy="time-attendance-settings-break-type-sidebar-end-at-from-field-id"
                            label={
                              <span
                                id="time-attendance-settings-break-type-sidebar-end-at-from-label"
                                data-cy="time-attendance-settings-break-type-sidebar-end-at-from-label"
                                className="text-xs font-normal text-gray-700 pr-1"
                              >
                                From
                              </span>
                            }
                            name="endAtFrom"
                            className="mb-2"
                          >
                            <TimePicker
                              className={controlClass}
                              format="HH:mm"
                              id="time-attendance-settings-break-type-sidebar-end-at-from-picker"
                              data-cy="time-attendance-settings-break-type-sidebar-end-at-from-picker"
                            />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item
                            id="endAtToFieldId"
                            data-cy="time-attendance-settings-break-type-sidebar-end-at-to-field-id"
                            label={
                              <span
                                id="time-attendance-settings-break-type-sidebar-end-at-to-label"
                                data-cy="time-attendance-settings-break-type-sidebar-end-at-to-label"
                                className="text-xs font-normal text-gray-700 pr-1"
                              >
                                To
                              </span>
                            }
                            name="endAtTo"
                            className="mb-2"
                            rules={[
                              windowAfterValidator(
                                'endAtFrom',
                                'End window to must be after end window from.',
                              ),
                            ]}
                          >
                            <TimePicker
                              className={controlClass}
                              format="HH:mm"
                              id="time-attendance-settings-break-type-sidebar-end-at-to-picker"
                              data-cy="time-attendance-settings-break-type-sidebar-end-at-to-picker"
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                    ),
                  },
                ]}
              />
            </div>
          </div>
          <Form.Item
            id="BreakTypeDescriptionFieldId"
            data-cy="time-attendance-settings-break-type-sidebar-description-field-id"
            label={
              <span
                id="time-attendance-settings-break-type-sidebar-description-label"
                data-cy="time-attendance-settings-break-type-sidebar-description-label"
                className="text-sm font-normal text-gray-900 pr-1"
              >
                Description
              </span>
            }
            name="description"
          >
            <Input.TextArea
              className="w-full h-14 px-5 mt-2.5"
              placeholder="Description"
              rows={6}
              id="time-attendance-settings-break-type-sidebar-description-textarea"
              data-cy="time-attendance-settings-break-type-sidebar-description-textarea"
            />
          </Form.Item>
        </Form>
      </Modal>
    )
  );
};

export default BreakTypeSidebar;
