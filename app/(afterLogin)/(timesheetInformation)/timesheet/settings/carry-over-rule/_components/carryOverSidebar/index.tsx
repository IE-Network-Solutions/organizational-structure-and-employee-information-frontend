import { useTimesheetSettingsStore } from '@/store/uistate/features/timesheet/settings';
import {
  Button,
  Col,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Spin,
} from 'antd';
import CustomLabel from '@/components/form/customLabel/customLabel';
import React, { useEffect } from 'react';
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

  const itemClass = 'font-semibold text-xs';
  const controlClass = 'mt-2.5 h-[40px] w-full';

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
      <Modal
        open={isShow}
        onCancel={() => onClose()}
        title={
          <div
            className="text-lg font-semibold text-[#4d4d4d]"
            id="time-attendance-settings-carry-over-rule-sidebar-header-container"
            data-cy="time-attendance-settings-carry-over-rule-sidebar-header-container"
          >
            Carry-over Rule
          </div>
        }
        footer={
          <div
            className="flex items-center justify-end gap-3"
            id="time-attendance-settings-carry-over-rule-sidebar-footer-container"
            data-cy="time-attendance-settings-carry-over-rule-sidebar-footer-container"
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
            <Form.Item
              id="carryOverNameFieldId"
              data-cy="time-attendance-settings-carry-over-rule-sidebar-title-field-id"
              label={
                <span
                  data-cy="time-attendance-settings-carry-over-rule-sidebar-title-label"
                  className="text-sm font-normal text-[#4d4d4d] pr-1"
                >
                  Carry-over Name
                </span>
              }
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
              label={
                <span
                  data-cy="time-attendance-settings-carry-over-rule-sidebar-period-label"
                  className="text-sm font-normal text-[#4d4d4d] pr-1"
                >
                  Carry-over Period
                </span>
              }
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
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label={
                    <span
                      data-cy="time-attendance-settings-carry-over-rule-sidebar-limit-label"
                      className="text-sm font-normal text-[#4d4d4d] pr-1"
                    >
                      Carry-over Limit
                    </span>
                  }
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
              </Col>
              <Col span={12}>
                <Form.Item
                  label={
                    <span
                      data-cy="time-attendance-settings-carry-over-rule-sidebar-expiration-label"
                      className="text-sm font-normal text-[#4d4d4d] pr-1"
                    >
                      Carry-over Expiration
                    </span>
                  }
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
              </Col>
            </Row>
          </Form>
        </Spin>
      </Modal>
    )
  );
};

export default CarryOverSidebar;
