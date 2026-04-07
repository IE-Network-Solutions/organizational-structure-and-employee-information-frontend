import CustomDrawerLayout from '@/components/common/customDrawer';

import CustomDrawerFooterButton, {
  CustomDrawerFooterButtonProps,
} from '@/components/common/customDrawer/customDrawerFooterButton';
import CustomDrawerHeader from '@/components/common/customDrawer/customDrawerHeader';
import CustomLabel from '@/components/form/customLabel/customLabel';
import { useSetBreakType } from '@/store/server/features/timesheet/breakType/mutation';
import { useTimesheetSettingsStore } from '@/store/uistate/features/timesheet/settings';
import { Col, Form, Input, Row, Space, TimePicker } from 'antd';
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
  const controlClass = 'mt-2.5 h-[40px] sm:h-[51px] w-full';
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
  const footerModalItems: CustomDrawerFooterButtonProps[] = [
    {
      label: 'Cancel',
      key: 'cancel',
      className: 'h-[40px] sm:h-[56px] text-base',
      size: 'large',
      onClick: () => {
        (setIsShow(false), form.resetFields());
        setSelectedBreakType(null);
      },
      id: 'time-attendance-settings-break-type-sidebar-cancel-button',
      'data-cy': 'time-attendance-settings-break-type-sidebar-cancel-button',
    },
    {
      label: selectedBreakType ? 'Edit' : 'Add',
      key: 'add',
      className: 'h-[40px] sm:h-[56px] text-base',
      size: 'large',
      type: 'primary',
      onClick: () => form.submit(),
      id: 'time-attendance-settings-break-type-sidebar-submit-button',
      'data-cy': 'time-attendance-settings-break-type-sidebar-submit-button',
    },
  ];

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
      <CustomDrawerLayout
        open={isShow}
        onClose={() => setIsShow(false)}
        modalHeader={
          <div
            className="px-2"
            id="time-attendance-settings-break-type-sidebar-header-container"
            data-cy="time-attendance-settings-break-type-sidebar-header-container"
          >
            <CustomDrawerHeader data-cy="time-attendance-settings-break-type-sidebar-header">
              Break Type
            </CustomDrawerHeader>
          </div>
        }
        footer={
          <div
            className="p-4"
            id="time-attendance-settings-break-type-sidebar-footer-container"
            data-cy="time-attendance-settings-break-type-sidebar-footer-container"
          >
            <CustomDrawerFooterButton
              buttons={footerModalItems}
              data-cy="time-attendance-settings-break-type-sidebar-footer-button"
            />
          </div>
        }
        width="400px"
        data-cy="time-attendance-settings-break-type-sidebar"
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
          <Space.Compact
            direction="vertical"
            className="w-full px-3 sm:px-0 "
            id="time-attendance-settings-break-type-sidebar-form-fields"
            data-cy="time-attendance-settings-break-type-sidebar-form-fields"
          >
            <Form.Item
              id="breakTypeNameFieldId"
              data-cy="time-attendance-settings-break-type-sidebar-title-field-id"
              label="Break Type Name"
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
              id="BreakTypeDescriptionFieldId"
              data-cy="time-attendance-settings-break-type-sidebar-description-field-id"
              label="Break Type Description"
              name="description"
            >
              <Input.TextArea
                className="w-full h-36 px-5 mt-2.5"
                placeholder="Description"
                rows={6}
                id="time-attendance-settings-break-type-sidebar-description-textarea"
                data-cy="time-attendance-settings-break-type-sidebar-description-textarea"
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
                  label="Start At"
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
                  label="End At"
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
          </Space.Compact>
        </Form>
      </CustomDrawerLayout>
    )
  );
};

export default BreakTypeSidebar;
