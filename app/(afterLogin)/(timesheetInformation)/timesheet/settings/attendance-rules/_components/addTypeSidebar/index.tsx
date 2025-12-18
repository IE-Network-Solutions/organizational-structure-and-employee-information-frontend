import { useTimesheetSettingsStore } from '@/store/uistate/features/timesheet/settings';
import { Form, Input, Radio, Space, Spin } from 'antd';
import CustomDrawerLayout from '@/components/common/customDrawer';
import CustomLabel from '@/components/form/customLabel/customLabel';
import React, { useEffect, useState } from 'react';
import CustomRadio from '@/components/form/customRadio';
import CustomDrawerFooterButton, {
  CustomDrawerFooterButtonProps,
} from '@/components/common/customDrawer/customDrawerFooterButton';
import CustomDrawerHeader from '@/components/common/customDrawer/customDrawerHeader';
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

  const footerModalItems: CustomDrawerFooterButtonProps[] = [
    {
      label: 'Cancel',
      key: 'cancel',
      className: 'h-[40px] sm:h-[56px] text-base',
      size: 'large',
      loading: isLoading,
      onClick: () => onClose(),
      id: 'time-attendance-settings-attendance-rules-add-type-sidebar-cancel-button',
      'data-cy':
        'time-attendance-settings-attendance-rules-add-type-sidebar-cancel-button',
    },
    {
      label: attendanceTypeId ? 'Edit' : 'Add',
      key: 'add',
      className: 'h-[40px] sm:h-[56px] text-base',
      size: 'large',
      type: 'primary',
      loading: isLoading,
      onClick: () => form.submit(),
      id: 'time-attendance-settings-attendance-rules-add-type-sidebar-submit-button',
      'data-cy':
        'time-attendance-settings-attendance-rules-add-type-sidebar-submit-button',
    },
  ];

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
      <CustomDrawerLayout
        open={isShow}
        onClose={() => onClose()}
        modalHeader={
          <div
            className="px-2"
            id="time-attendance-settings-attendance-rules-add-type-sidebar-header-container"
            data-cy="time-attendance-settings-attendance-rules-add-type-sidebar-header-container"
          >
            <CustomDrawerHeader data-cy="time-attendance-settings-attendance-rules-add-type-sidebar-header">
              {attendanceTypeId ? 'Edit' : 'Add'} Type
            </CustomDrawerHeader>
          </div>
        }
        footer={
          <div
            className="p-4"
            id="time-attendance-settings-attendance-rules-add-type-sidebar-footer-container"
            data-cy="time-attendance-settings-attendance-rules-add-type-sidebar-footer-container"
          >
            <CustomDrawerFooterButton
              buttons={footerModalItems}
              data-cy="time-attendance-settings-attendance-rules-add-type-sidebar-footer-button"
            />
          </div>
        }
        width="400px"
        data-cy="time-attendance-settings-attendance-rules-add-type-sidebar"
      >
        <Spin
          spinning={isFetching || isLoading}
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
                label="Type Name"
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
                label="Unit"
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
        </Spin>
      </CustomDrawerLayout>
    )
  );
};

export default AddTypesSidebar;
