import { useTimesheetSettingsStore } from '@/store/uistate/features/timesheet/settings';
import {
  Col,
  Form,
  Input,
  InputNumber,
  Radio,
  Row,
  Select,
  Space,
  Switch,
} from 'antd';
import CustomDrawerLayout from '@/components/common/customDrawer';
import CustomLabel from '@/components/form/customLabel/customLabel';
import React, { useEffect, useState } from 'react';
import CustomRadio from '@/components/form/customRadio';
import CustomDrawerFooterButton, {
  CustomDrawerFooterButtonProps,
} from '@/components/common/customDrawer/customDrawerFooterButton';
import CustomDrawerHeader from '@/components/common/customDrawer/customDrawerHeader';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { useCreateLeaveType } from '@/store/server/features/timesheet/leaveType/mutation';
import { useGetCarryOverRules } from '@/store/server/features/timesheet/carryOverRule/queries';
import { useGetAccrualRules } from '@/store/server/features/timesheet/accrualRule/queries';
import { formatToOptions } from '@/helpers/formatTo';
import { MdKeyboardArrowDown } from 'react-icons/md';

const TypesAndPoliciesSidebar = () => {
  const [isErrorPlan, setIsErrorPlan] = useState(false);
  const {
    isShowTypeAndPoliciesSidebar: isShow,
    setIsShowTypeAndPoliciesSidebar: setIsShow,
  } = useTimesheetSettingsStore();

  const { data: carryOverData } = useGetCarryOverRules();
  const { data: accrualRulesData } = useGetAccrualRules();

  const {
    mutate: createLeaveType,
    isLoading,
    isSuccess,
  } = useCreateLeaveType();

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
      onClick: () => {
        form.submit();
      },
    },
  ];

  const itemClass = 'font-semibold text-xs';
  const controlClass = 'mt-2.5 h-[54px] w-full';
  const inputNumberClass = 'w-full py-[11px] mt-2.5';

  const carryOverRuleOptions = () =>
    carryOverData ? formatToOptions(carryOverData.items, 'title', 'id') : [];

  const accrualRuleOptions = () =>
    accrualRulesData
      ? formatToOptions(accrualRulesData.items, 'title', 'id')
      : [];

  const onClose = () => {
    form.resetFields();
    setIsShow(false);
  };

  useEffect(() => {
    if (isSuccess) {
      onClose();
    }
  }, [isSuccess]);

  const onFinish = () => {
    const value = form.getFieldsValue();
    createLeaveType({
      title: value.title,
      isPaid: value.plan === 'paid',
      entitledDaysPerYear: value.entitled,
      isDeductible: !!value.isDeductible,
      minimumNotifyingDays: value.min,
      maximumAllowedConsecutiveDays: value.max,
      accrualRule: value.accrualRule,
      carryOverRule: value.carryOverRule,
      description: value.description,
    });
  };

  const onFinishFailed = () => {
    setIsErrorPlan(!!form.getFieldError('plan').length);
  };

  const onFieldChange = () => {
    setIsErrorPlan(!!form.getFieldError('plan').length);
  };

  return (
    isShow && (
      <CustomDrawerLayout
        open={isShow}
        onClose={() => onClose()}
        modalHeader={<CustomDrawerHeader>Leave Type</CustomDrawerHeader>}
        footer={<CustomDrawerFooterButton buttons={footerModalItems} />}
        width="400px"
      >
        <Form
          layout="vertical"
          form={form}
          requiredMark={CustomLabel}
          autoComplete="off"
          className={itemClass}
          onFieldsChange={onFieldChange}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
        >
          <Space direction="vertical" className="w-full" size={12}>
            <Form.Item
              id={`TypesAndPoliciesTitleFieldId`}
              label="Type Name"
              rules={[{ required: true, message: 'Required' }]}
              name="title"
            >
              <Input className={controlClass} />
            </Form.Item>
            <Form.Item
              label="Paid/Unpaid"
              id={`TypesAndPoliciesPaidOrUnpaidFieldId`}
              rules={[{ required: true, message: 'Required' }]}
              name="plan"
            >
              <Radio.Group className="w-full mt-2.5">
                <Row gutter={16}>
                  <Col span={12}>
                    <CustomRadio
                      label="Paid"
                      value="paid"
                      isError={isErrorPlan}
                    />
                  </Col>
                  <Col span={12}>
                    <CustomRadio
                      label="Unpaid"
                      value="unpaid"
                      isError={isErrorPlan}
                    />
                  </Col>
                </Row>
              </Radio.Group>
            </Form.Item>
            <Form.Item
              label="Entitled Days/year"
              id={`TypesAndPoliciesEntitledDaysYearFieldId`}
              rules={[{ required: true, message: 'Required' }]}
              name="entitled"
            >
              <InputNumber
                min={1}
                className={inputNumberClass}
                placeholder="Input entitled days"
              />
            </Form.Item>

            <div className="h-[54px] w-full flex items-center gap-2.5 border rounded-[10px] pl-[11px]">
              <Form.Item
                id={`TypesAndPoliciesIsDeductableFieldId`}
                name="isDeductible"
                className="m-0"
              >
                <Switch
                  checkedChildren={<CheckOutlined />}
                  unCheckedChildren={<CloseOutlined />}
                />
              </Form.Item>
              <span className="text-sm text-gray-900 font-medium">
                Is deductible ?
              </span>
            </div>

            <Form.Item
              id={`TypesAndPoliciesMinAllowedDaysFieldId`}
              label="Minimum notifying period(days)"
              rules={[{ required: true, message: 'Required' }]}
              name="min"
            >
              <InputNumber
                min={0}
                className={inputNumberClass}
                placeholder="Enter your days"
              />
            </Form.Item>
            <Form.Item
              id={`TypesAndPoliciesMaxConsecuativeAllowedDaysFieldId`}
              label="Maximum allowed consecutive days"
              rules={[{ required: true, message: 'Required' }]}
              name="max"
            >
              <InputNumber
                min={1}
                className={inputNumberClass}
                placeholder="Enter your days"
              />
            </Form.Item>
            <Form.Item
              label="Accrual Rule"
              id={`TypesAndPoliciesActualRuleFieldId`}
              rules={[{ required: true, message: 'Required' }]}
              name="accrualRule"
            >
              <Select
                className={controlClass}
                suffixIcon={
                  <MdKeyboardArrowDown size={16} className="text-gray-900" />
                }
                options={accrualRuleOptions()}
              />
            </Form.Item>
            <Form.Item
              label="Carry-Over Rule"
              id={`TypesAndPoliciesRuleCarryOverFieldldId`}
              rules={[{ required: true, message: 'Required' }]}
              name="carryOverRule"
            >
              <Select
                className={controlClass}
                options={carryOverRuleOptions()}
                suffixIcon={
                  <MdKeyboardArrowDown size={16} className="text-gray-900" />
                }
              />
            </Form.Item>
            <Form.Item
              label="Description"
              id={`TypesAndPoliciesDescriptionFieldId`}
              rules={[{ required: true, message: 'Required' }]}
              name="description"
            >
              <Input.TextArea
                className="w-full py-4 px-5 mt-2.5"
                placeholder="Input description"
                rows={6}
              />
            </Form.Item>
          </Space>
        </Form>
      </CustomDrawerLayout>
    )
  );
};

export default TypesAndPoliciesSidebar;
