import CustomLabel from '@/components/form/customLabel/customLabel';
import { useSetBreakType } from '@/store/server/features/timesheet/breakType/mutation';
import { useTimesheetSettingsStore } from '@/store/uistate/features/timesheet/settings';
import { Button, Col, Form, Input, Modal, Row, TimePicker } from 'antd';
import dayjs from 'dayjs';
import React from 'react';

const BreakTypeSidebar = () => {
  const {
    isShowBreakTypeSidebar: isShow,
    setIsShowBreakTypeSidebar: setIsShow,
    selectedBreakType,
    setSelectedBreakType,
  } = useTimesheetSettingsStore();
  const [form] = Form.useForm();
  const { mutate: setBreakType } = useSetBreakType();
  const itemClass = 'font-semibold text-xs';
  const controlClass = 'mt-2.5 h-[40px] w-full';
  React.useEffect(() => {
    if (selectedBreakType) {
      const formattedBreakType = {
        ...selectedBreakType,
        startAt: dayjs(selectedBreakType.startAt, 'HH:mm:ss'),
        endAt: dayjs(selectedBreakType.endAt, 'HH:mm:ss'),
      };
      form.setFieldsValue(formattedBreakType);
    }
  }, [selectedBreakType, form]);

  const onFinish = (values: any) => {
    const { startAt, endAt, ...otherValues } = values;
    const formattedValues = {
      ...otherValues,
      ...(selectedBreakType ? { id: selectedBreakType.id } : {}),
      startAt: startAt.format('HH:mm'),
      endAt: endAt.format('HH:mm'),
    };

    if (selectedBreakType) {
      setBreakType(formattedValues, {
        onSuccess: () => {
          (setIsShow(false), form.resetFields());
          setSelectedBreakType(null);
        },
      });
    } else {
      setBreakType(formattedValues, {
        onSuccess: () => {
          (setIsShow(false), form.resetFields());
          setSelectedBreakType(null);
        },
      });
    }
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
          <Row
            gutter={16}
            id="time-attendance-settings-break-type-sidebar-time-row"
            data-cy="time-attendance-settings-break-type-sidebar-time-row"
          >
            <Col
              data-cy="time-attendance-settings-break-type-sidebar-start-at-column"
              span={12}
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
              >
                <TimePicker
                  className={controlClass}
                  format="HH:mm"
                  id="time-attendance-settings-break-type-sidebar-start-at-picker"
                  data-cy="time-attendance-settings-break-type-sidebar-start-at-picker"
                />
              </Form.Item>
            </Col>
            <Col
              span={12}
              data-cy="time-attendance-settings-break-type-sidebar-end-at-column"
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
                  ({ getFieldValue }) => ({
                    /* eslint-disable @typescript-eslint/naming-convention */
                    validator(_, value) {
                      /* eslint-enable @typescript-eslint/naming-convention */
                      const startAt = getFieldValue('startAt');
                      if (!value || !startAt || value.isAfter(startAt)) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error('End time must be after start time.'),
                      );
                    },
                  }),
                ]}
              >
                <TimePicker
                  className={controlClass}
                  format="HH:mm"
                  id="time-attendance-settings-break-type-sidebar-end-at-picker"
                  data-cy="time-attendance-settings-break-type-sidebar-end-at-picker"
                />
              </Form.Item>
            </Col>
          </Row>
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
