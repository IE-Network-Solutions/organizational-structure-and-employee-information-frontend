import { useTimesheetSettingsStore } from '@/store/uistate/features/timesheet/settings';
import { Form, Input, Select, Space, Spin } from 'antd';
import CustomDrawerLayout from '@/components/common/customDrawer';
import CustomLabel from '@/components/form/customLabel/customLabel';
import CustomDrawerFooterButton, {
  CustomDrawerFooterButtonProps,
} from '@/components/common/customDrawer/customDrawerFooterButton';
import CustomDrawerHeader from '@/components/common/customDrawer/customDrawerHeader';
import { useSetAccrualRule } from '@/store/server/features/timesheet/accrualRule/mutation';
import { AccrualRulePeriod } from '@/types/timesheet/settings';
import React, { useEffect } from 'react';
import { MdKeyboardArrowDown } from 'react-icons/md';

const AddTypesSidebar = () => {
  const {
    isShowNewAccrualRuleSidebar: isShow,
    setIsShowNewAccrualRuleSidebar: setIsShow,
  } = useTimesheetSettingsStore();

  const {
    mutate: createAccrualRule,
    isLoading,
    isSuccess,
  } = useSetAccrualRule();

  useEffect(() => {
    if (isSuccess) {
      onClose();
    }
  }, [isSuccess]);

  const [form] = Form.useForm();

  const footerModalItems: CustomDrawerFooterButtonProps[] = [
    {
      label: 'Cancel',
      key: 'cancel',
      className: 'h-[56px] text-base',
      size: 'large',
      loading: isLoading,
      onClick: () => onClose(),
    },
    {
      label: 'Add',
      key: 'add',
      className: 'h-[56px] text-base',
      size: 'large',
      type: 'primary',
      loading: isLoading,
      onClick: () => form.submit(),
    },
  ];

  const itemClass = 'font-semibold text-xs';
  const controlClass = 'mt-2.5 h-[54px] w-full';

  const onFinish = () => {
    const value = form.getFieldsValue();
    createAccrualRule({
      title: value.title,
      period: value.period,
    });
  };

  const onClose = () => {
    form.resetFields();
    setIsShow(false);
  };

  const periodOption = [
    { 
      id:'AccrualRulePeriodMonthly',
      value: AccrualRulePeriod.MONTHLY,
      label: 'Monthly',
    },
    {
      id:'AccrualRulePeriodQuarterly',
      value: AccrualRulePeriod.QUARTER,
      label: 'Quarter',
    },
    {
      id:'AccrualRulePeriodYearly',
      value: AccrualRulePeriod.YEAR,
      label: 'Year',
    },
  ];

  return (
    isShow && (
      <CustomDrawerLayout
        open={isShow}
        onClose={() => onClose()}
        modalHeader={<CustomDrawerHeader>Accrual Rule</CustomDrawerHeader>}
        footer={<CustomDrawerFooterButton buttons={footerModalItems} />}
        width="400px"
      >
        <Spin spinning={isLoading}>
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
                label="Accrual Name"
                id='accrualNameId'
                rules={[{ required: true, message: 'Required' }]}
                name="title"
              >
                <Input className={controlClass} />
              </Form.Item>
              <Form.Item
                label="Accrual Period"
                id='accrualPeriodId'
                rules={[{ required: true, message: 'Required' }]}
                name="period"
              >
                <Select
                  className={controlClass}
                  suffixIcon={
                    <MdKeyboardArrowDown size={16} className="text-gray-900" />
                  }
                  options={periodOption}
                />
              </Form.Item>
            </Space>
          </Form>
        </Spin>
      </CustomDrawerLayout>
    )
  );
};

export default AddTypesSidebar;
