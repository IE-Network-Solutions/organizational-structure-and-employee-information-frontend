import { useTimesheetSettingsStore } from '@/store/uistate/features/timesheet/settings';
import { Form, Input, InputNumber, Select, Space } from 'antd';
import CustomDrawerLayout from '@/components/common/customDrawer';
import CustomLabel from '@/components/form/customLabel/customLabel';
import React from 'react';
import CustomRadio from '@/components/form/customRadio';
import CustomDrawerFooterButton, {
  CustomDrawerFooterButtonProps,
} from '@/components/common/customDrawer/customDrawerFooterButton';
import CustomDrawerHeader from '@/components/common/customDrawer/customDrawerHeader';

const CarryOverSidebar = () => {
  const {
    isShowCarryOverRuleSidebar: isShow,
    setIsShowCarryOverRuleSidebar: setIsShow,
  } = useTimesheetSettingsStore();

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
      onClick: () => setIsShow(false),
    },
  ];

  const itemClass = 'font-semibold text-xs';
  const controlClass = 'mt-2.5 h-[54px] w-full';

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
        >
          <Space direction="vertical" className="w-full" size={24}>
            <Form.Item label="Carry-over Name" required name="name">
              <Input className={controlClass} />
            </Form.Item>
            <Form.Item label="Carry-over Limit" required name="limit">
              <InputNumber
                min={1}
                className="w-full py-[11px] mt-2.5"
                placeholder="Input entitled days"
              />
            </Form.Item>
            <Form.Item label="Carry-over Expiration" required name="expiration">
              <InputNumber
                min={1}
                className="w-full py-[11px] mt-2.5"
                placeholder="Enter your days"
              />
            </Form.Item>
            <Form.Item label="Carry-over Period" required name="period">
              <Select
                className={controlClass}
                options={[
                  { value: 'day', label: 'Day' },
                  { value: 'month', label: 'Month' },
                ]}
              />
            </Form.Item>
          </Space>
        </Form>
      </CustomDrawerLayout>
    )
  );
};

export default CarryOverSidebar;
