'use client';
import { useTimesheetSettingsStore } from '@/store/uistate/features/timesheet/settings';
import React, { useEffect } from 'react';
import CustomDrawerHeader from '@/components/common/customDrawer/customDrawerHeader';
import CustomDrawerLayout from '@/components/common/customDrawer';
import {
  Col,
  Form,
  Radio,
  Row,
  Space,
  Input,
  InputNumber,
  Switch,
  Select,
  Spin,
} from 'antd';
import CustomDrawerFooterButton, {
  CustomDrawerFooterButtonProps,
} from '@/components/common/customDrawer/customDrawerFooterButton';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { useGetLeaveTypeById } from '@/store/server/features/timesheet/leaveType/queries';
import CustomRadio from '@/components/form/customRadio';
import { MdKeyboardArrowDown } from 'react-icons/md';
import { useGetCarryOverRules } from '@/store/server/features/timesheet/carryOverRule/queries';
import { useGetAccrualRules } from '@/store/server/features/timesheet/accrualRule/queries';
import { formatToOptions } from '@/helpers/formatTo';
import CustomLabel from '@/components/form/customLabel/customLabel';
import { useUpdateLeaveType } from '@/store/server/features/timesheet/leaveType/mutation';

const TypesAndPoliciesEdit = () => {
  const {
    leaveTypeId,
    isErrorPlan,
    isShowTypeAndPoliciesSidebarEdit: isShow,
    setIsErrorPlan,
    setIsShowTypeAndPoliciesSidebarEdit: setIsShow,
  } = useTimesheetSettingsStore();
  const itemClass = 'font-semibold text-xs';
  const controlClass = 'mt-2.5 h-[54px] w-full';
  const inputNumberClass = 'w-full py-[11px] mt-2.5';

  const { data: getLeaveTypeById, isLoading: getIsLoading } =
    useGetLeaveTypeById(leaveTypeId ?? '');
  const { data: carryOverData } = useGetCarryOverRules();
  const { data: accrualRulesData } = useGetAccrualRules();
  const [form] = Form.useForm();
  const { mutate: updateLeaveType, isLoading } = useUpdateLeaveType();
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
      label: 'Update',
      key: 'update',
      className: 'h-[56px] text-base',
      size: 'large',
      type: 'primary',
      loading: isLoading,
      onClick: () => {
        form.submit();
      },
    },
  ];
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
    if (getLeaveTypeById?.items?.[0]) {
      form.setFieldsValue({
        title: getLeaveTypeById.items[0].title,
        plan: getLeaveTypeById.items[0].isPaid ? 'paid' : 'unpaid',
        entitled: getLeaveTypeById.items[0].entitledDaysPerYear,
        isDeductible: getLeaveTypeById.items[0].isDeductible,
        min: getLeaveTypeById.items[0].minimumNotifyingDays,
        max: getLeaveTypeById.items[0].maximumAllowedConsecutiveDays,
        accrualRule: getLeaveTypeById.items[0].accrualRuleId,
        carryOverRule: getLeaveTypeById.items[0].carryOverRuleId,
        description: getLeaveTypeById.items[0].description,
      });
    }
  }, [getLeaveTypeById, form]);

  const onFinish = (values: any) => {
    updateLeaveType(
      {
        id: leaveTypeId ?? '',
        values: {
          title: values.title,
          isPaid: values.plan === 'paid',
          entitledDaysPerYear: values.entitled,
          isDeductible: !!values.isDeductible,
          minimumNotifyingDays: values.min,
          maximumAllowedConsecutiveDays: values.max,
          accrualRule: values.accrualRule,
          carryOverRule: values.carryOverRule,
          description: values.description,
        },
      },
      {
        onSuccess: () => {
          onClose();
        },
      },
    );
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
        modalHeader={<CustomDrawerHeader>Leave Type Edit</CustomDrawerHeader>}
        footer={<CustomDrawerFooterButton buttons={footerModalItems} />}
        width="400px"
      >
        <Spin spinning={getIsLoading}>
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
                  disabled
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
                  disabled
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
        </Spin>
      </CustomDrawerLayout>
    )
  );
};

export default TypesAndPoliciesEdit;
