import { useTimesheetSettingsStore } from '@/store/uistate/features/timesheet/settings';
import { Form, Input, InputNumber, Select, Space, Spin } from 'antd';
import CustomDrawerLayout from '@/components/common/customDrawer';
import CustomLabel from '@/components/form/customLabel/customLabel';
import React, { useEffect } from 'react';
import CustomDrawerFooterButton, {
  CustomDrawerFooterButtonProps,
} from '@/components/common/customDrawer/customDrawerFooterButton';
import CustomDrawerHeader from '@/components/common/customDrawer/customDrawerHeader';
import { CarryOverPeriod } from '@/types/timesheet/settings';
import { useCreateCarryOverRule } from '@/store/server/features/timesheet/carryOverRule/mutation';
import { MdKeyboardArrowDown } from 'react-icons/md';

const CarryOverSidebar = () => {
  const {
    isShowCarryOverRuleSidebar: isShow,
    setIsShowCarryOverRuleSidebar: setIsShow,
  } = useTimesheetSettingsStore();

  const {
    mutate: createCarryOverRule,
    isLoading,
    isSuccess,
  } = useCreateCarryOverRule();

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
      id: 'time-attendance-settings-carry-over-rule-sidebar-cancel-button',
      'data-cy': 'time-attendance-settings-carry-over-rule-sidebar-cancel-button',
    },
    {
      label: 'Add',
      key: 'add',
      className: 'h-[40px] sm:h-[56px] text-base',
      size: 'large',
      type: 'primary',
      loading: isLoading,
      onClick: () => form.submit(),
      id: 'time-attendance-settings-carry-over-rule-sidebar-add-button',
      'data-cy': 'time-attendance-settings-carry-over-rule-sidebar-add-button',
    },
  ];

  const itemClass = 'font-semibold text-xs';
  const controlClass = 'mt-2.5 h-[40px] sm:h-[51px] w-full';

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

  const onClose = () => {
    form.resetFields();
    setIsShow(false);
  };

  const onFinish = () => {
    const value = form.getFieldsValue();
    createCarryOverRule({
      title: value.title,
      limit: value.limit,
      expiration: value.expiration,
      expirationPeriod: value.expirationPeriod,
    });
  };

  return (
    isShow && (
      <CustomDrawerLayout
        open={isShow}
        onClose={() => onClose()}
        modalHeader={
          <div
            className="px-2"
            id="time-attendance-settings-carry-over-rule-sidebar-header-container"
            data-cy="time-attendance-settings-carry-over-rule-sidebar-header-container"
          >
            <CustomDrawerHeader data-cy="time-attendance-settings-carry-over-rule-sidebar-header">
              Carry-over Rule
            </CustomDrawerHeader>
          </div>
        }
        footer={
          <div
            className="p-4"
            id="time-attendance-settings-carry-over-rule-sidebar-footer-container"
            data-cy="time-attendance-settings-carry-over-rule-sidebar-footer-container"
          >
            <CustomDrawerFooterButton
              buttons={footerModalItems}
              data-cy="time-attendance-settings-carry-over-rule-sidebar-footer-button"
            />
          </div>
        }
        width="400px"
        data-cy="time-attendance-settings-carry-over-rule-sidebar"
      >
        <Spin
          spinning={isLoading}
          data-cy="time-attendance-settings-carry-over-rule-sidebar-spin"
        >
          <Form
            layout="vertical"
            requiredMark={CustomLabel}
            autoComplete="off"
            form={form}
            className={itemClass}
            onFinish={onFinish}
            id="time-attendance-settings-carry-over-rule-sidebar-form"
            data-cy="time-attendance-settings-carry-over-rule-sidebar-form"
          >
            <Space.Compact
              direction="vertical"
              className="w-full px-3 sm:px-0 "
              id="time-attendance-settings-carry-over-rule-sidebar-form-fields"
              data-cy="time-attendance-settings-carry-over-rule-sidebar-form-fields"
            >
              <Form.Item
                id="carryOverNameFieldId"
                data-cy="time-attendance-settings-carry-over-rule-sidebar-title-field-id"
                label="Carry-over Name"
                rules={[{ required: true, message: 'Required' }]}
                name="title"
              >
                <Input
                  className={controlClass}
                  id="time-attendance-settings-carry-over-rule-sidebar-title-input"
                  data-cy="time-attendance-settings-carry-over-rule-sidebar-title-input"
                />
              </Form.Item>
              <Form.Item
                label="Carry-over Limit"
                id="carryOverLimitFieldId"
                data-cy="time-attendance-settings-carry-over-rule-sidebar-limit-field-id"
                rules={[{ required: true, message: 'Required' }]}
                name="limit"
              >
                <InputNumber
                  min={0}
                  className={controlClass}
                  placeholder="Input entitled days"
                  id="time-attendance-settings-carry-over-rule-sidebar-limit-input"
                  data-cy="time-attendance-settings-carry-over-rule-sidebar-limit-input"
                />
              </Form.Item>
              <Form.Item
                label="Carry-over Expiration"
                id="carryOverExpirationFieldId"
                data-cy="time-attendance-settings-carry-over-rule-sidebar-expiration-field-id"
                rules={[{ required: true, message: 'Required' }]}
                name="expiration"
              >
                <InputNumber
                  min={0}
                  className={controlClass}
                  placeholder="Enter your days"
                  id="time-attendance-settings-carry-over-rule-sidebar-expiration-input"
                  data-cy="time-attendance-settings-carry-over-rule-sidebar-expiration-input"
                />
              </Form.Item>
              <Form.Item
                label="Carry-over Period"
                id="carryOverPeriodFieldId"
                data-cy="time-attendance-settings-carry-over-rule-sidebar-period-field-id"
                rules={[{ required: true, message: 'Required' }]}
                name="expirationPeriod"
              >
                <Select
                  className={controlClass}
                  suffixIcon={
                    <MdKeyboardArrowDown
                      size={16}
                      className="text-gray-900"
                      data-cy="time-attendance-settings-carry-over-rule-sidebar-period-select-icon"
                    />
                  }
                  options={periodOption}
                  id="time-attendance-settings-carry-over-rule-sidebar-period-select"
                  data-cy="time-attendance-settings-carry-over-rule-sidebar-period-select"
                />
              </Form.Item>
            </Space.Compact>
          </Form>
        </Spin>
      </CustomDrawerLayout>
    )
  );
};

export default CarryOverSidebar;
