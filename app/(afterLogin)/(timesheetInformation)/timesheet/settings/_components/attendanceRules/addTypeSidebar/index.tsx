import { useTimesheetSettingsStore } from '@/store/uistate/features/timesheet/settings';
import { Form, Input, Radio, Space } from 'antd';
import CustomDrawerLayout from '@/components/common/customDrawer';
import CustomLabel from '@/components/form/customLabel/customLabel';
import React, { useState } from 'react';
import CustomRadio from '@/components/form/customRadio';
import CustomDrawerFooterButton, {
  CustomDrawerFooterButtonProps,
} from '@/components/common/customDrawer/customDrawerFooterButton';
import CustomDrawerHeader from '@/components/common/customDrawer/customDrawerHeader';
import { useSetAttendanceNotificationType } from '@/store/server/features/timesheet/attendanceNotificationType/mutation';
import { AttendanceTypeUnit } from '@/types/timesheet/attendance';

const AddTypesSidebar = () => {
  const [isErrorUnit, setIsErrorUnit] = useState(false);
  const {
    isShowRulesAddTypeSidebar: isShow,
    setIsShowRulesAddTypeSidebar: setIsShow,
  } = useTimesheetSettingsStore();

  const { mutate: setAttendanceType } = useSetAttendanceNotificationType();

  const [form] = Form.useForm();

  const footerModalItems: CustomDrawerFooterButtonProps[] = [
    {
      label: 'Cancel',
      key: 'cancel',
      className: 'h-[56px] text-base',
      size: 'large',
      onClick: () => setIsShow(false),
    },
    {
      label: 'Add',
      key: 'add',
      className: 'h-[56px] text-base',
      size: 'large',
      type: 'primary',
      onClick: () => form.submit(),
    },
  ];

  const itemClass = 'font-semibold text-xs';
  const controlClass = 'mt-2.5 h-[54px] w-full';

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
      title: value.title,
      unit: value.unit,
    });
    form.resetFields();
    setIsShow(false);
  };

  const onFinishFailed = () => {
    setIsErrorUnit(!!form.getFieldError('unit').length);
  };

  const onFieldChange = () => {
    setIsErrorUnit(!!form.getFieldError('unit').length);
  };

  return (
    isShow && (
      <CustomDrawerLayout
        open={isShow}
        onClose={() => setIsShow(false)}
        modalHeader={<CustomDrawerHeader>Add Type</CustomDrawerHeader>}
        footer={<CustomDrawerFooterButton buttons={footerModalItems} />}
        width="400px"
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
        >
          <Space direction="vertical" className="w-full" size={24}>
            <Form.Item
              label="Type Name"
              rules={[{ required: true, message: 'Required' }]}
              name="title"
            >
              <Input className={controlClass} />
            </Form.Item>
            <Form.Item
              label="Unit"
              rules={[{ required: true, message: 'Required' }]}
              name="unit"
            >
              <Radio.Group className="w-full mt-2.5">
                <Space direction="vertical" size={12} className="w-full">
                  {unitOptions.map((option) => (
                    <CustomRadio
                      key={option.value}
                      label={option.label}
                      value={option.value}
                      isError={isErrorUnit}
                    />
                  ))}
                </Space>
              </Radio.Group>
            </Form.Item>
          </Space>
        </Form>
      </CustomDrawerLayout>
    )
  );
};

export default AddTypesSidebar;
