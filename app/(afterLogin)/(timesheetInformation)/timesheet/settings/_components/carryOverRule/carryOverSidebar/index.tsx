import { useTimesheetSettingsStore } from '@/store/uistate/features/timesheet/settings';
import { Form, Input, InputNumber, Select, Space } from 'antd';
import CustomDrawerLayout from '@/components/common/customDrawer';
import CustomLabel from '@/components/form/customLabel/customLabel';
import React from 'react';
import CustomDrawerFooterButton, {
  CustomDrawerFooterButtonProps,
} from '@/components/common/customDrawer/customDrawerFooterButton';
import CustomDrawerHeader from '@/components/common/customDrawer/customDrawerHeader';
import { CarryOverPeriod } from '@/types/timesheet/settings';
import { useCreateCarryOverRule } from '@/store/server/features/timesheet/carryOverRule/mutation';

const CarryOverSidebar = () => {
  const {
    isShowCarryOverRuleSidebar: isShow,
    setIsShowCarryOverRuleSidebar: setIsShow,
  } = useTimesheetSettingsStore();

  const { mutate: createCarryOverRule } = useCreateCarryOverRule();

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

  const periodOption = [
    {
      value: CarryOverPeriod.DAYS,
      label: 'Days',
    },
    {
      value: CarryOverPeriod.MONTH,
      label: 'Month',
    },
    {
      value: CarryOverPeriod.YEARS,
      label: 'Years',
    },
  ];

  const onFinish = () => {
    const value = form.getFieldsValue();
    createCarryOverRule({
      title: value.title,
      limit: value.limit,
      expiration: value.expiration,
      expirationPeriod: value.expirationPeriod,
    });
    form.resetFields();
    setIsShow(false);
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
          form={form}
          className={itemClass}
          onFinish={onFinish}
        >
          <Space direction="vertical" className="w-full" size={24}>
            <Form.Item
              label="Carry-over Name"
              rules={[{ required: true, message: 'Required' }]}
              name="title"
            >
              <Input className={controlClass} />
            </Form.Item>
            <Form.Item
              label="Carry-over Limit"
              rules={[{ required: true, message: 'Required' }]}
              name="limit"
            >
              <InputNumber
                min={1}
                className="w-full py-[11px] mt-2.5"
                placeholder="Input entitled days"
              />
            </Form.Item>
            <Form.Item
              label="Carry-over Expiration"
              rules={[{ required: true, message: 'Required' }]}
              name="expiration"
            >
              <InputNumber
                min={1}
                className="w-full py-[11px] mt-2.5"
                placeholder="Enter your days"
              />
            </Form.Item>
            <Form.Item
              label="Carry-over Period"
              rules={[{ required: true, message: 'Required' }]}
              name="expirationPeriod"
            >
              <Select className={controlClass} options={periodOption} />
            </Form.Item>
          </Space>
        </Form>
      </CustomDrawerLayout>
    )
  );
};

export default CarryOverSidebar;
