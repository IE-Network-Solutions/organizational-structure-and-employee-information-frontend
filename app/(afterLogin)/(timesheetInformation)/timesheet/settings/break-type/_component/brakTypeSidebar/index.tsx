import CustomLabel from '@/components/form/customLabel/customLabel';
import { useSetBreakType } from '@/store/server/features/timesheet/breakType/mutation';
import { useTimesheetSettingsStore } from '@/store/uistate/features/timesheet/settings';
import {
  Button,
  Col,
  Collapse,
  Form,
  Input,
  Modal,
  Row,
  TimePicker,
} from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import React from 'react';

const parseTime = (value?: string | null) =>
  value ? dayjs(value, ['HH:mm:ss', 'HH:mm']) : undefined;

const formatTime = (value?: Dayjs | null) =>
  value ? value.format('HH:mm') : undefined;

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
  const [startWindowOpen, setStartWindowOpen] = React.useState(false);
  const [endWindowOpen, setEndWindowOpen] = React.useState(false);
  const itemClass = 'font-semibold text-xs';
  const controlClass = 'mt-2.5 h-[40px] w-full';
  React.useEffect(() => {
    if (selectedBreakType) {
      const formattedBreakType = {
        ...selectedBreakType,
        startAt: parseTime(selectedBreakType.startAt),
        endAt: parseTime(selectedBreakType.endAt),
        startAtFrom: parseTime(selectedBreakType.startAtFrom),
        startAtTo: parseTime(selectedBreakType.startAtTo),
        endAtFrom: parseTime(selectedBreakType.endAtFrom),
        endAtTo: parseTime(selectedBreakType.endAtTo),
      };
      form.setFieldsValue(formattedBreakType);
      setStartWindowOpen(
        Boolean(selectedBreakType.startAtFrom || selectedBreakType.startAtTo),
      );
      setEndWindowOpen(
        Boolean(selectedBreakType.endAtFrom || selectedBreakType.endAtTo),
      );
    } else {
      setStartWindowOpen(false);
      setEndWindowOpen(false);
    }
  }, [selectedBreakType, form]);

  const onFinish = (values: any) => {
    const {
      startAt,
      endAt,
      startAtFrom,
      startAtTo,
      endAtFrom,
      endAtTo,
      ...otherValues
    } = values;

    const formattedValues = {
      ...otherValues,
      ...(selectedBreakType ? { id: selectedBreakType.id } : {}),
      startAt: startAt.format('HH:mm'),
      endAt: endAt.format('HH:mm'),
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
