import { useTimesheetSettingsStore } from '@/store/uistate/features/timesheet/settings';
import { Button, Form, Input, Modal, Radio, Space, Skeleton } from 'antd';
import CustomLabel from '@/components/form/customLabel/customLabel';
import React, { useEffect, useState } from 'react';
import CustomRadio from '@/components/form/customRadio';
import { useSetAttendanceNotificationType } from '@/store/server/features/timesheet/attendanceNotificationType/mutation';
import { AttendanceTypeUnit } from '@/types/timesheet/attendance';
import { useGetAttendanceNotificationType } from '@/store/server/features/timesheet/attendanceNotificationType/queries';

const AddTypesSidebar = () => {
  const [isErrorUnit, setIsErrorUnit] = useState(false);
  const [typeId, setTypeId] = useState('');
  const {
    isShowRulesAddTypeSidebar: isShow,
    setIsShowRulesAddTypeSidebar: setIsShow,
    attendanceTypeId,
    setAttendanceTypeId,
  } = useTimesheetSettingsStore();
  const {
    data: attendanceTypeData,
    isFetching,
    refetch,
  } = useGetAttendanceNotificationType(typeId);
  const {
    mutate: setAttendanceType,
    isLoading,
    isSuccess,
  } = useSetAttendanceNotificationType();

  const [form] = Form.useForm();

  useEffect(() => {
    setTypeId(attendanceTypeId ?? '');
  }, [attendanceTypeId]);

  useEffect(() => {
    if (typeId) {
      refetch();
    }
  }, [typeId]);

  useEffect(() => {
    if (attendanceTypeData) {
      const item = attendanceTypeData.item;
      form.setFieldValue('title', item.title);
      form.setFieldValue('unit', item.unit);
    }
  }, [attendanceTypeData]);

  useEffect(() => {
    if (isSuccess) {
      onClose();
    }
  }, [isSuccess]);

  const itemClass = 'font-semibold text-xs';
  const controlClass = 'mt-2.5 h-[40px]  w-full';

  const unitOptions = [
    {
      value: AttendanceTypeUnit.HOURS,
      label: 'Hours',
    },
    {
      value: AttendanceTypeUnit.DAYS,
      label: 'Days',
    },
    {
      value: AttendanceTypeUnit.WEEKS,
      label: 'Weeks',
    },
    {
      value: AttendanceTypeUnit.QUARTALS,
      label: 'Quartals',
    },
    {
      value: AttendanceTypeUnit.YEARS,
      label: 'Years',
    },
  ];

  const onFinish = () => {
    const value = form.getFieldsValue();
    setAttendanceType({
      ...(attendanceTypeId && attendanceTypeData!.item),
      title: value.title,
      unit: value.unit,
    });
  };

  const onFinishFailed = () => {
    setIsErrorUnit(!!form.getFieldError('unit').length);
  };

  const onFieldChange = () => {
    setIsErrorUnit(!!form.getFieldError('unit').length);
  };

  const onClose = () => {
    form.resetFields();
    setAttendanceTypeId(null);
    setIsShow(false);
  };

  return (
    isShow && (
      <Modal
        open={isShow}
        onCancel={() => onClose()}
        title={
          <div
            className="text-lg font-semibold text-[#4d4d4d]"
            id="time-attendance-settings-attendance-rules-add-type-sidebar-header-container"
            data-cy="time-attendance-settings-attendance-rules-add-type-sidebar-header-container"
          >
            {attendanceTypeId ? 'Edit Type' : 'Add Type'}
          </div>
        }
        footer={
          <div
            className="flex justify-end gap-2"
            id="time-attendance-settings-attendance-rules-add-type-sidebar-footer-container"
            data-cy="time-attendance-settings-attendance-rules-add-type-sidebar-footer-container"
          >
            <Button
              type="default"
              onClick={() => onClose()}
              id="time-attendance-settings-attendance-rules-add-type-sidebar-cancel-button"
              data-cy="time-attendance-settings-attendance-rules-add-type-sidebar-cancel-button"
              className="border border-[#D9D9D9] text-base font-normal text-gray-900"
              disabled={isFetching || isLoading}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              onClick={() => form.submit()}
              loading={isLoading}
              id="time-attendance-settings-attendance-rules-add-type-sidebar-submit-button"
              data-cy="time-attendance-settings-attendance-rules-add-type-sidebar-submit-button"
            >
              {attendanceTypeId ? 'Save' : 'Add'}
            </Button>
          </div>
        }
        data-cy="time-attendance-settings-attendance-rules-add-type-sidebar"
        zIndex={10002}
        centered
        width={480}
      >
        <Skeleton
          loading={isFetching || isLoading}
          active
          data-cy="time-attendance-settings-attendance-rules-add-type-sidebar-spin"
        >
          <Form
            layout="vertical"
            requiredMark={CustomLabel}
            autoComplete="off"
            className={itemClass}
            form={form}
            onFieldsChange={onFieldChange}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            id="time-attendance-settings-attendance-rules-add-type-sidebar-form"
            data-cy="time-attendance-settings-attendance-rules-add-type-sidebar-form"
          >
            <Space.Compact
              direction="vertical"
              className="w-full px-3 sm:px-0 "
              id="time-attendance-settings-attendance-rules-add-type-sidebar-form-fields"
              data-cy="time-attendance-settings-attendance-rules-add-type-sidebar-form-fields"
            >
              <Form.Item
                id="createAddTypeNameFieldId"
                data-cy="time-attendance-settings-attendance-rules-add-type-sidebar-title-field-id"
                label={
                  <span
                    className="text-sm font-normal text-gray-900 pr-1"
                    data-cy="time-attendance-settings-attendance-rules-add-type-sidebar-title-label"
                  >
                    Type Name
                  </span>
                }
                rules={[{ required: true, message: 'Required' }]}
                name="title"
              >
                <Input
                  className={controlClass}
                  id="time-attendance-settings-attendance-rules-add-type-sidebar-title-input"
                  data-cy="time-attendance-settings-attendance-rules-add-type-sidebar-title-input"
                />
              </Form.Item>
              <Form.Item
                label={
                  <span
                    className="text-sm font-normal text-gray-900 pr-1"
                    data-cy="time-attendance-settings-attendance-rules-add-type-sidebar-unit-label"
                  >
                    Unit
                  </span>
                }
                id="createAddTypeUnitFieldId"
                data-cy="time-attendance-settings-attendance-rules-add-type-sidebar-unit-field-id"
                rules={[{ required: true, message: 'Required' }]}
                name="unit"
              >
                <Radio.Group
                  className={controlClass}
                  id="time-attendance-settings-attendance-rules-add-type-sidebar-unit-radio-group"
                  data-cy="time-attendance-settings-attendance-rules-add-type-sidebar-unit-radio-group"
                >
                  <Space
                    direction="vertical"
                    size={12}
                    className="w-full mb-4"
                    id="time-attendance-settings-attendance-rules-add-type-sidebar-unit-options"
                    data-cy="time-attendance-settings-attendance-rules-add-type-sidebar-unit-options"
                  >
                    {unitOptions.map((option) => (
                      <CustomRadio
                        key={option.value}
                        label={option.label}
                        value={option.value}
                        isError={isErrorUnit}
                        data-cy={`time-attendance-settings-attendance-rules-add-type-sidebar-unit-option-${option.value}`}
                      />
                    ))}
                  </Space>
                </Radio.Group>
              </Form.Item>
            </Space.Compact>
          </Form>
          </Skeleton>
      </Modal>
    )
  );
};

export default AddTypesSidebar;
