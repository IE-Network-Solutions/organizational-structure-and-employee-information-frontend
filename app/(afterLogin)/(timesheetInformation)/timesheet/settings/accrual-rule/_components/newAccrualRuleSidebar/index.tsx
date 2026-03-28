import { useTimesheetSettingsStore } from '@/store/uistate/features/timesheet/settings';
import { Button, Col, Form, Input, Modal, Row, Select, Spin } from 'antd';
import CustomLabel from '@/components/form/customLabel/customLabel';
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

  const itemClass = 'font-semibold text-xs';
  const controlClass = 'mt-2.5 h-[40px] w-full';

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
      <Modal
        open={isShow}
        onCancel={() => onClose()}
        title={
          <div
            className="text-lg font-semibold text-[#4d4d4d]"
            id="time-attendance-settings-accrual-rule-sidebar-header-container"
            data-cy="time-attendance-settings-accrual-rule-sidebar-header-container"
          >
            Accrual Rule
          </div>
        }
        footer={
          <div
            className="flex items-center justify-end gap-3"
            id="time-attendance-settings-accrual-rule-sidebar-footer-container"
            data-cy="time-attendance-settings-accrual-rule-sidebar-footer-container"
          >
            <Button 
            type="default" 
            className="font-normal h-8 border border-[#D9D9D9] text-[#4d4d4d]"
            onClick={() => onClose()}>
              Cancel
            </Button>
            <Button 
            type="primary" 
            className="font-normal h-8"
            onClick={() => form.submit()}>
              Create
            </Button>
          </div>
        }
        width={660}
        zIndex={10002}
        centered
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
            <Row gutter={[24, 24]}>
              <Col span={16}>
                <Form.Item
                  label={
                    <span
                      id="time-attendance-settings-accrual-rule-sidebar-title-label"
                      data-cy="time-attendance-settings-accrual-rule-sidebar-title-label"
                      className="text-sm font-normal text-[#4d4d4d] pr-1"
                    >
                      Name
                    </span>
                  }
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
              </Col>
              <Col span={8}>
                <Form.Item
                  label={
                    <span
                      id="time-attendance-settings-accrual-rule-sidebar-period-label"
                      data-cy="time-attendance-settings-accrual-rule-sidebar-period-label"
                      className="text-sm font-normal text-[#4d4d4d] pr-1"
                    >
                      Period
                    </span>
                  }
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
              </Col>
            </Row>
          </Form>
        </Spin>
      </Modal>
    )
  );
};

export default AddTypesSidebar;
