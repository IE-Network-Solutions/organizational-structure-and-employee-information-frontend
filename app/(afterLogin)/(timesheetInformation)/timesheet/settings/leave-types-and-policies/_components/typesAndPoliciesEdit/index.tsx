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
  Popover,
} from 'antd';
import CustomDrawerFooterButton, {
  CustomDrawerFooterButtonProps,
} from '@/components/common/customDrawer/customDrawerFooterButton';
import {
  CheckOutlined,
  CloseOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
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
    setIsFixed,
    isFixed,
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
      className: 'h-[40px] sm:h-[56px] text-base',
      size: 'large',
      loading: isLoading,
      onClick: () => onClose(),
      id: 'time-attendance-settings-leave-types-and-policies-edit-sidebar-cancel-button',
      'data-cy':
        'time-attendance-settings-leave-types-and-policies-edit-sidebar-cancel-button',
    },
    {
      label: 'Update',
      key: 'update',
      className: 'h-[40px] sm:h-[56px] text-base',
      size: 'large',
      type: 'primary',
      loading: isLoading,
      onClick: () => {
        form.submit();
      },
      id: 'time-attendance-settings-leave-types-and-policies-edit-sidebar-update-button',
      'data-cy':
        'time-attendance-settings-leave-types-and-policies-edit-sidebar-update-button',
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
        isDeductible: !!getLeaveTypeById.items[0].isDeductible,
        isIncremental: !!getLeaveTypeById.items[0].isIncremental,
        isFixed: !!getLeaveTypeById.items[0].isFixed,
        min: getLeaveTypeById.items[0].minimumNotifyingDays,
        max: getLeaveTypeById.items[0].maximumAllowedConsecutiveDays,
        accrualRule: getLeaveTypeById.items[0].accrualRuleId,
        carryOverRule: getLeaveTypeById.items[0].carryOverRuleId,
        description: getLeaveTypeById.items[0].description,
        ...(getLeaveTypeById.items[0].isIncremental && {
          incrementalYear: getLeaveTypeById.items[0].incrementalYear,
          incrementAmount: getLeaveTypeById.items[0].incrementAmount,
        }),
      });
      setIsFixed(!!getLeaveTypeById.items[0].isFixed);
    }
  }, [getLeaveTypeById, form]);

  const onFieldChange = () => {
    setIsErrorPlan(!!form.getFieldError('plan').length);
  };

  const isIncremental = Form.useWatch('isIncremental', form);
  const incrementalYear = Form.useWatch('incrementalYear', form);
  const incrementAmount = Form.useWatch('incrementAmount', form);

  const onFinish = (values: any) => {
    const payload: any = {
      title: values.title,
      isPaid: values.plan === 'paid',
      entitledDaysPerYear: values.entitled,
      isDeductible: !!values.isDeductible,
      isIncremental: !!values.isIncremental,
      isFixed: !!values.isFixed,
      minimumNotifyingDays: values.min,
      maximumAllowedConsecutiveDays: values.max,
      accrualRule: values.accrualRule,
      carryOverRule: values.carryOverRule,
      description: values.description,
    };
    if (values.isIncremental) {
      payload.incrementalYear = values.incrementalYear;
      payload.incrementAmount = values.incrementAmount;
    }
    updateLeaveType(
      {
        id: leaveTypeId ?? '',
        values: payload,
      },
      {
        onSuccess: () => {
          onClose();
        },
      },
    );
    setIsFixed(false);
  };

  const onFinishFailed = () => {
    setIsErrorPlan(!!form.getFieldError('plan').length);
  };

  return (
    isShow && (
      <CustomDrawerLayout
        open={isShow}
        onClose={() => onClose()}
        modalHeader={
          <CustomDrawerHeader data-cy="time-attendance-settings-leave-types-and-policies-edit-sidebar-header">
            Leave Type Edit
          </CustomDrawerHeader>
        }
        footer={
          <div
            className="p-4"
            id="time-attendance-settings-leave-types-and-policies-edit-sidebar-footer-container"
            data-cy="time-attendance-settings-leave-types-and-policies-edit-sidebar-footer-container"
          >
            <CustomDrawerFooterButton
              buttons={footerModalItems}
              data-cy="time-attendance-settings-leave-types-and-policies-edit-sidebar-footer-button"
            />
          </div>
        }
        width="400px"
        data-cy="time-attendance-settings-leave-types-and-policies-edit-sidebar"
      >
        <Spin
          spinning={getIsLoading}
          data-cy="time-attendance-settings-leave-types-and-policies-edit-sidebar-spin"
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
            id="time-attendance-settings-leave-types-and-policies-edit-sidebar-form"
            data-cy="time-attendance-settings-leave-types-and-policies-edit-sidebar-form"
          >
            <Space
              data-cy="time-attendance-settings-leave-types-and-policies-edit-sidebar-form-fields"
              direction="vertical"
              className="w-full"
              size={12}
            >
              <Form.Item
                id={`TypesAndPoliciesTitleFieldId`}
                data-cy="time-attendance-settings-leave-types-and-policies-edit-sidebar-title-field-id"
                label="Type Name"
                rules={[{ required: true, message: 'Required' }]}
                name="title"
              >
                <Input
                  className={controlClass}
                  data-cy="time-attendance-settings-leave-types-and-policies-edit-sidebar-title-input"
                />
              </Form.Item>
              <Form.Item
                label="Paid/Unpaid"
                id={`TypesAndPoliciesPaidOrUnpaidFieldId`}
                data-cy="time-attendance-settings-leave-types-and-policies-edit-sidebar-paid-unpaid-field-id"
                rules={[{ required: true, message: 'Required' }]}
                name="plan"
              >
                <Radio.Group
                  className="w-full mt-2.5"
                  data-cy="time-attendance-settings-leave-types-and-policies-edit-sidebar-paid-unpaid-radio-group"
                >
                  <Row
                    data-cy="time-attendance-settings-leave-types-and-policies-edit-sidebar-paid-unpaid-radio-group-rows"
                    gutter={16}
                  >
                    <Col
                      data-cy="time-attendance-settings-leave-types-and-policies-edit-sidebar-paid-option-column"
                      span={12}
                    >
                      <CustomRadio
                        label="Paid"
                        value="paid"
                        isError={isErrorPlan}
                        data-cy="time-attendance-settings-leave-types-and-policies-edit-sidebar-paid-option"
                      />
                    </Col>
                    <Col
                      data-cy="time-attendance-settings-leave-types-and-policies-edit-sidebar-unpaid-option-column"
                      span={12}
                    >
                      <CustomRadio
                        label="Unpaid"
                        value="unpaid"
                        isError={isErrorPlan}
                        data-cy="time-attendance-settings-leave-types-and-policies-edit-sidebar-unpaid-option"
                      />
                    </Col>
                  </Row>
                </Radio.Group>
              </Form.Item>
              <Form.Item
                label="Entitled Days/year"
                id={`TypesAndPoliciesEntitledDaysYearFieldId`}
                data-cy="time-attendance-settings-leave-types-and-policies-edit-sidebar-entitled-days-year-field-id"
                rules={[
                  { required: true, message: 'Required' },
                  {
                    validator: (nonUsed: any, value: number) => {
                      if (value > 365) {
                        return Promise.reject(
                          'Entitled days cannot exceed 365',
                        );
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
                name="entitled"
              >
                <InputNumber
                  min={1}
                  className={inputNumberClass}
                  placeholder="Input entitled days"
                  data-cy="time-attendance-settings-leave-types-and-policies-edit-sidebar-entitled-days-year-input"
                />
              </Form.Item>

              <div
                id="time-attendance-settings-leave-types-and-policies-edit-sidebar-fixed-leaves-container-id"
                data-cy="time-attendance-settings-leave-types-and-policies-edit-sidebar-fixed-leaves-container-id"
                className="flex justify-between gap-2"
              >
                <div
                  id="time-attendance-settings-leave-types-and-policies-edit-sidebar-fixed-leaves-container-item-id"
                  data-cy="time-attendance-settings-leave-types-and-policies-edit-sidebar-fixed-leaves-container-item-id"
                  className="h-[54px] w-full flex items-center gap-1"
                >
                  <span
                    id="time-attendance-settings-leave-types-and-policies-edit-sidebar-fixed-leaves-container-item-label-id"
                    data-cy="time-attendance-settings-leave-types-and-policies-edit-sidebar-fixed-leaves-container-item-label-id"
                    className="text-xs text-gray-900 font-medium flex items-center gap-1"
                  >
                    <Popover
                      data-cy="time-attendance-settings-leave-types-and-policies-edit-sidebar-fixed-leaves-container-item-popover-id"
                      content={
                        <div
                          data-cy="time-attendance-settings-leave-types-and-policies-edit-sidebar-fixed-leaves-container-item-popover-content-id"
                          className="w-72"
                        >
                          Fixed leaves are granted upfront or as needed without
                          accumulation, while non-fixed leaves build up over
                          time.
                        </div>
                      }
                    >
                      <InfoCircleOutlined
                        data-cy="time-attendance-settings-leave-types-and-policies-edit-sidebar-fixed-leaves-container-item-popover-icon-id"
                        className="text-gray-500"
                      />
                    </Popover>
                    Fixed
                  </span>
                  <Form.Item
                    id={`TypesAndPoliciesIsDeductableFieldId`}
                    data-cy="time-attendance-settings-leave-types-and-policies-edit-sidebar-fixed-leaves-container-item-form-id"
                    name="isFixed"
                    className="m-0"
                  >
                    <Switch
                      size="small"
                      data-cy="time-attendance-settings-leave-types-and-policies-edit-sidebar-fixed-leaves-container-item-switch-id"
                      checkedChildren={
                        <CheckOutlined data-cy="time-attendance-settings-leave-types-and-policies-edit-sidebar-fixed-leaves-container-item-switch-checked-icon-id" />
                      }
                      unCheckedChildren={
                        <CloseOutlined data-cy="time-attendance-settings-leave-types-and-policies-edit-sidebar-fixed-leaves-container-item-switch-unchecked-icon-id" />
                      }
                      onChange={(checked) => {
                        setIsFixed(checked);
                        form.setFieldsValue({
                          accrualRule: undefined,
                          carryOverRule: undefined,
                          isIncremental: false,
                        });
                      }}
                    />
                  </Form.Item>
                </div>
                <div
                  id="time-attendance-settings-leave-types-and-policies-edit-sidebar-deductable-leaves-container-id"
                  data-cy="time-attendance-settings-leave-types-and-policies-edit-sidebar-deductable-leaves-container-id"
                  className="h-[54px] w-full flex items-center gap-1"
                >
                  <span
                    id="time-attendance-settings-leave-types-and-policies-edit-sidebar-deductable-leaves-container-item-label-id"
                    data-cy="time-attendance-settings-leave-types-and-policies-edit-sidebar-deductable-leaves-container-item-label-id"
                    className="text-xs text-gray-900 font-medium flex items-center gap-1"
                  >
                    <Popover
                      data-cy="time-attendance-settings-leave-types-and-policies-edit-sidebar-deductable-leaves-container-item-popover-id"
                      content={
                        <div
                          data-cy="time-attendance-settings-leave-types-and-policies-edit-sidebar-deductable-leaves-container-item-popover-content-id"
                          className="w-72"
                        >
                          Deductible leaves reduce an employee&apos;s leave
                          balance when taken (like vacation days), while
                          non-deductible leaves do not affect the balance.
                        </div>
                      }
                    >
                      <InfoCircleOutlined
                        data-cy="time-attendance-settings-leave-types-and-policies-edit-sidebar-deductable-leaves-container-item-popover-icon-id"
                        className="text-gray-500"
                      />
                    </Popover>
                    Deductable
                  </span>
                  <Form.Item
                    id={`TypesAndPoliciesIsDeductableFieldId`}
                    data-cy="time-attendance-settings-leave-types-and-policies-edit-sidebar-deductable-leaves-container-item-form-id"
                    name="isDeductible"
                    className="m-0"
                  >
                    <Switch
                      size="small"
                      data-cy="time-attendance-settings-leave-types-and-policies-edit-sidebar-deductable-leaves-container-item-switch-id"
                      checkedChildren={
                        <CheckOutlined data-cy="time-attendance-settings-leave-types-and-policies-edit-sidebar-deductable-leaves-container-item-switch-checked-icon-id" />
                      }
                      unCheckedChildren={
                        <CloseOutlined data-cy="time-attendance-settings-leave-types-and-policies-edit-sidebar-deductable-leaves-container-item-switch-unchecked-icon-id" />
                      }
                    />
                  </Form.Item>
                </div>
                <div
                  id="time-attendance-settings-leave-types-and-policies-edit-sidebar-incremental-container-id"
                  data-cy="time-attendance-settings-leave-types-and-policies-edit-sidebar-incremental-container-id"
                  className="h-[54px] w-full flex items-center gap-1"
                >
                  <span
                    id="time-attendance-settings-leave-types-and-policies-edit-sidebar-incremental-container-item-label-id"
                    data-cy="time-attendance-settings-leave-types-and-policies-edit-sidebar-incremental-container-item-label-id"
                    className="text-xs text-gray-900 font-medium flex items-center gap-1"
                  >
                    <Popover
                      data-cy="time-attendance-settings-leave-types-and-policies-edit-sidebar-incremental-container-item-popover-id"
                      content={
                        <div
                          id="time-attendance-settings-leave-types-and-policies-edit-sidebar-incremental-container-item-popover-content-id"
                          data-cy="time-attendance-settings-leave-types-and-policies-edit-sidebar-incremental-container-item-popover-content-id"
                          className="w-72"
                        >
                          Annual Leave can be calculated increamentally per
                          year. for example per{' '}
                          <span
                            id="time-attendance-settings-leave-types-and-policies-edit-sidebar-incremental-container-item-year-value-id"
                            data-cy="time-attendance-settings-leave-types-and-policies-edit-sidebar-incremental-container-item-year-value-id"
                            className="font-bold"
                          >
                            2
                          </span>{' '}
                          years of employement,{' '}
                          <span
                            id="time-attendance-settings-leave-types-and-policies-edit-sidebar-incremental-container-item-amount-value-id"
                            data-cy="time-attendance-settings-leave-types-and-policies-edit-sidebar-incremental-container-item-amount-value-id"
                            className="font-bold"
                          >
                            1
                          </span>{' '}
                          more day of leave is added.
                        </div>
                      }
                    >
                      <InfoCircleOutlined
                        data-cy="time-attendance-settings-leave-types-and-policies-edit-sidebar-incremental-container-item-popover-icon-id"
                        className="text-gray-500"
                      />
                    </Popover>
                    Incremental
                  </span>
                  <Form.Item
                    id={`TypesAndPoliciesIsDeductableFieldId`}
                    data-cy="time-attendance-settings-leave-types-and-policies-edit-sidebar-incremental-container-item-form-id"
                    name="isIncremental"
                    className="m-0"
                  >
                    <Switch
                      data-cy="time-attendance-settings-leave-types-and-policies-edit-sidebar-incremental-container-item-switch-id"
                      size="small"
                      disabled={isFixed}
                      checkedChildren={
                        <CheckOutlined data-cy="time-attendance-settings-leave-types-and-policies-edit-sidebar-incremental-container-item-switch-checked-icon-id" />
                      }
                      unCheckedChildren={
                        <CloseOutlined data-cy="time-attendance-settings-leave-types-and-policies-edit-sidebar-incremental-container-item-switch-unchecked-icon-id" />
                      }
                    />
                  </Form.Item>
                </div>
              </div>
              <div>
                {isIncremental && (
                  <div
                    id="time-attendance-settings-leave-types-and-policies-edit-sidebar-incremental-container-id"
                    data-cy="time-attendance-settings-leave-types-and-policies-edit-sidebar-incremental-container-id"
                    className="flex gap-2 mt-2 w-full"
                  >
                    <Form.Item
                      data-cy="time-attendance-settings-leave-types-and-policies-edit-sidebar-incremental-year-field-id"
                      name="incrementalYear"
                      rules={[{ required: isIncremental, message: 'Required' }]}
                      className="m-0"
                    >
                      <InputNumber
                        data-cy="time-attendance-settings-leave-types-and-policies-edit-sidebar-incremental-year-input-id"
                        min={1}
                        placeholder="Year"
                        className="h-[40px] w-full"
                      />
                    </Form.Item>
                    <Form.Item
                      name="incrementAmount"
                      data-cy="time-attendance-settings-leave-types-and-policies-edit-sidebar-incremental-amount-field-id"
                      rules={[{ required: isIncremental, message: 'Required' }]}
                      className="m-0"
                    >
                      <InputNumber
                        min={1}
                        data-cy="time-attendance-settings-leave-types-and-policies-edit-sidebar-incremental-amount-input-id"
                        placeholder="Entitled Days"
                        className="h-[40px] w-full"
                      />
                    </Form.Item>
                  </div>
                )}
                {isIncremental && (
                  <div
                    id="time-attendance-settings-leave-types-and-policies-edit-sidebar-incremental-container-id"
                    data-cy="time-attendance-settings-leave-types-and-policies-edit-sidebar-incremental-container-id"
                    className="text-[11px] text-gray-500 mt-1 mb-4 flex items-center gap-1"
                  >
                    <InfoCircleOutlined
                      data-cy="time-attendance-settings-leave-types-and-policies-edit-sidebar-incremental-container-item-popover-icon-id"
                      className="text-gray-500"
                    />
                    Every{' '}
                    <b data-cy="time-attendance-settings-leave-types-and-policies-edit-sidebar-incremental-container-item-year-value-id">
                      {incrementalYear || '__'}
                    </b>{' '}
                    years add{' '}
                    <b data-cy="time-attendance-settings-leave-types-and-policies-edit-sidebar-incremental-container-item-amount-value-id">
                      {incrementAmount || '__'}
                    </b>{' '}
                    additional day(s)
                  </div>
                )}
              </div>
              <Form.Item
                id={`TypesAndPoliciesMinAllowedDaysFieldId`}
                data-cy="time-attendance-settings-leave-types-and-policies-edit-sidebar-min-allowed-days-field-id"
                label="Minimum notifying period(days)"
                rules={[{ required: true, message: 'Required' }]}
                name="min"
              >
                <InputNumber
                  data-cy="time-attendance-settings-leave-types-and-policies-edit-sidebar-min-allowed-days-input-id"
                  min={0}
                  className={inputNumberClass}
                  placeholder="Enter your days"
                />
              </Form.Item>
              <Form.Item
                id={`TypesAndPoliciesMaxConsecuativeAllowedDaysFieldId`}
                data-cy="time-attendance-settings-leave-types-and-policies-edit-sidebar-max-allowed-consecutive-days-field-id"
                label="Maximum allowed consecutive days"
                rules={[{ required: true, message: 'Required' }]}
                name="max"
              >
                <InputNumber
                  data-cy="time-attendance-settings-leave-types-and-policies-edit-sidebar-max-allowed-consecutive-days-input-id"
                  min={1}
                  className={inputNumberClass}
                  placeholder="Enter your days"
                />
              </Form.Item>
              <Form.Item
                label="Accrual Rule"
                id={`TypesAndPoliciesActualRuleFieldId`}
                data-cy="time-attendance-settings-leave-types-and-policies-edit-sidebar-accrual-rule-field-id"
                rules={[
                  {
                    required: !isFixed,
                    message: 'Required',
                  },
                ]}
                name="accrualRule"
              >
                <Select
                  disabled={isFixed}
                  className={controlClass}
                  suffixIcon={
                    <MdKeyboardArrowDown
                      data-cy="time-attendance-settings-leave-types-and-policies-edit-sidebar-accrual-rule-select-icon-id"
                      size={16}
                      className="text-gray-900"
                    />
                  }
                  options={accrualRuleOptions()}
                />
              </Form.Item>
              <Form.Item
                label="Carry-Over Rule"
                id={`TypesAndPoliciesRuleCarryOverFieldldId`}
                data-cy="time-attendance-settings-leave-types-and-policies-edit-sidebar-carry-over-rule-field-id"
                rules={[
                  {
                    required: !isFixed,
                    message: 'Required',
                  },
                ]}
                name="carryOverRule"
              >
                <Select
                  disabled={isFixed}
                  className={controlClass}
                  options={carryOverRuleOptions()}
                  suffixIcon={
                    <MdKeyboardArrowDown
                      data-cy="time-attendance-settings-leave-types-and-policies-edit-sidebar-carry-over-rule-select-icon-id"
                      size={16}
                      className="text-gray-900"
                    />
                  }
                />
              </Form.Item>
              <Form.Item
                label="Description"
                id={`TypesAndPoliciesDescriptionFieldId`}
                data-cy="time-attendance-settings-leave-types-and-policies-edit-sidebar-description-field-id"
                rules={[{ required: true, message: 'Required' }]}
                name="description"
              >
                <Input.TextArea
                  data-cy="time-attendance-settings-leave-types-and-policies-edit-sidebar-description-textarea-id"
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
