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
      className: 'h-[40px] sm:h-[56px] text-base',
      size: 'large',
      loading: isLoading,
      onClick: () => onClose(),
      id: 'time-attendance-settings-accrual-rule-sidebar-cancel-button',
      'data-cy': 'time-attendance-settings-accrual-rule-sidebar-cancel-button',
    },
    {
      label: 'Add',
      key: 'add',
      className: 'h-[40px] sm:h-[56px] text-base',
      size: 'large',
      type: 'primary',
      loading: isLoading,
      onClick: () => form.submit(),
      id: 'time-attendance-settings-accrual-rule-sidebar-add-button',
      'data-cy': 'time-attendance-settings-accrual-rule-sidebar-add-button',
    },
  ];

  const itemClass = 'font-semibold text-xs';
  const controlClass = 'mt-2.5 h-[40px] sm:h-[51px] w-full';

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
      id: 'AccrualRulePeriodDaily',
      value: AccrualRulePeriod.DAILY,
      label: 'Daily',
    },
    {
      id: 'AccrualRulePeriodMonthly',
      value: AccrualRulePeriod.MONTHLY,
      label: 'Monthly',
    },
    {
      id: 'AccrualRulePeriodQuarterly',
      value: AccrualRulePeriod.QUARTER,
      label: 'Quarter',
    },
    {
      id: 'AccrualRulePeriodYearly',
      value: AccrualRulePeriod.YEAR,
      label: 'Year',
    },
  ];

  return (
    isShow && (
      <CustomDrawerLayout
        open={isShow}
        onClose={() => onClose()}
        modalHeader={
          <div
            className="px-2"
            id="time-attendance-settings-accrual-rule-sidebar-header-container"
            data-cy="time-attendance-settings-accrual-rule-sidebar-header-container"
          >
            <CustomDrawerHeader data-cy="time-attendance-settings-accrual-rule-sidebar-header">
              Accrual Rule
            </CustomDrawerHeader>
          </div>
        }
        footer={
          <div
            className="p-4"
            id="time-attendance-settings-accrual-rule-sidebar-footer-container"
            data-cy="time-attendance-settings-accrual-rule-sidebar-footer-container"
          >
            <CustomDrawerFooterButton
              buttons={footerModalItems}
              data-cy="time-attendance-settings-accrual-rule-sidebar-footer-button"
            />
          </div>
        }
        width="400px"
        data-cy="time-attendance-settings-accrual-rule-sidebar"
      >
        <Spin
          spinning={isLoading}
          data-cy="time-attendance-settings-accrual-rule-sidebar-spin"
        >
          <Form
            layout="vertical"
            requiredMark={CustomLabel}
            autoComplete="off"
            form={form}
            className={itemClass}
            onFinish={onFinish}
            id="time-attendance-settings-accrual-rule-sidebar-form"
            data-cy="time-attendance-settings-accrual-rule-sidebar-form"
          >
            <Space.Compact
              direction="vertical"
              className="w-full  sm:px-0 "
              id="time-attendance-settings-accrual-rule-sidebar-form-fields"
              data-cy="time-attendance-settings-accrual-rule-sidebar-form-fields"
            >
              <Form.Item
                label="Accrual Name"
                id="time-attendance-settings-accrual-rule-sidebar-title"
                data-cy="time-attendance-settings-accrual-rule-sidebar-title"
                rules={[{ required: true, message: 'Required' }]}
                name="title"
              >
                <Input
                  className={controlClass}
                  id="time-attendance-settings-accrual-rule-sidebar-title-input"
                  data-cy="time-attendance-settings-accrual-rule-sidebar-title-input"
                />
              </Form.Item>
              <Form.Item
                label="Accrual Period"
                id="time-attendance-settings-accrual-rule-sidebar-period"
                data-cy="time-attendance-settings-accrual-rule-sidebar-period"
                rules={[{ required: true, message: 'Required' }]}
                name="period"
              >
                <Select
                  className={controlClass}
                  suffixIcon={
                    <MdKeyboardArrowDown
                      size={16}
                      className="text-gray-900"
                      data-cy="time-attendance-settings-accrual-rule-sidebar-period-select-icon"
                    />
                  }
                  options={periodOption}
                  id="time-attendance-settings-accrual-rule-sidebar-period-select"
                  data-cy="time-attendance-settings-accrual-rule-sidebar-period-select"
                />
              </Form.Item>
            </Space.Compact>
          </Form>
        </Spin>
      </CustomDrawerLayout>
    )
  );
};

export default AddTypesSidebar;
