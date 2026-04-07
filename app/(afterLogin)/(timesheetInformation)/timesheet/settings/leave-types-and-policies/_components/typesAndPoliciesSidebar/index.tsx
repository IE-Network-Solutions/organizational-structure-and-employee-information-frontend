import { useTimesheetSettingsStore } from '@/store/uistate/features/timesheet/settings';
import {
  Col,
  Form,
  Input,
  InputNumber,
  Popover,
  Radio,
  Row,
  Select,
  Space,
  Switch,
} from 'antd';
import CustomDrawerLayout from '@/components/common/customDrawer';
import CustomLabel from '@/components/form/customLabel/customLabel';
import React, { useEffect, useState, useCallback } from 'react';
import CustomRadio from '@/components/form/customRadio';
import CustomDrawerFooterButton, {
  CustomDrawerFooterButtonProps,
} from '@/components/common/customDrawer/customDrawerFooterButton';
import CustomDrawerHeader from '@/components/common/customDrawer/customDrawerHeader';
import {
  CheckOutlined,
  CloseOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
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
    setIsFixed,
    isFixed,
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
      className: 'h-[40px] sm:h-[56px] text-base',
      size: 'large',
      loading: isLoading,
      onClick: () => onClose(),
      id: 'time-attendance-settings-leave-types-and-policies-sidebar-cancel-button',
      'data-cy':
        'time-attendance-settings-leave-types-and-policies-sidebar-cancel-button',
    },
    {
      label: 'Add',
      key: 'add',
      className: 'h-[40px] sm:h-[56px] text-base',
      size: 'large',
      type: 'primary',
      loading: isLoading,
      onClick: () => {
        form.submit();
      },
      id: 'time-attendance-settings-leave-types-and-policies-sidebar-add-button',
      'data-cy':
        'time-attendance-settings-leave-types-and-policies-sidebar-add-button',
    },
  ];

  const itemClass = 'font-semibold text-xs';
  const controlClass = 'mt-2.5 h-[40px] sm:h-[51px] w-full';
  const inputNumberClass = 'w-full h-[40px] mt-2.5';

  const carryOverRuleOptions = () =>
    carryOverData ? formatToOptions(carryOverData.items, 'title', 'id') : [];

  const accrualRuleOptions = () =>
    accrualRulesData
      ? formatToOptions(accrualRulesData.items, 'title', 'id')
      : [];

  const onClose = useCallback(() => {
    form.resetFields();
    setIsShow(false);
  }, [form, setIsShow]);

  useEffect(() => {
    if (isSuccess) {
      onClose();
    }
  }, [isSuccess, onClose]);

  const onFinish = () => {
    const value = form.getFieldsValue();
    createLeaveType({
      title: value.title,
      isPaid: value.plan === 'paid',
      entitledDaysPerYear: value.entitled,
      isDeductible: !!value.isDeductible,
      isIncremental: !!value.isIncremental,
      isFixed: !!value.isFixed,
      minimumNotifyingDays: value.min,
      maximumAllowedConsecutiveDays: value.max,
      accrualRule: value.accrualRule,
      carryOverRule: value.carryOverRule,
      description: value.description,
      ...(value.isIncremental && {
        incrementalYear: value.incrementalYear,
        incrementAmount: value.incrementAmount,
      }),
      convertableToCash: value?.convertableToCash ?? false,
    });
    setIsFixed(false);
  };

  const onFinishFailed = () => {
    setIsErrorPlan(!!form.getFieldError('plan').length);
  };

  const onFieldChange = () => {
    setIsErrorPlan(!!form.getFieldError('plan').length);
  };

  const isIncremental = Form.useWatch('isIncremental', form);
  const incrementalYear = Form.useWatch('incrementalYear', form);
  const incrementalDays = Form.useWatch('incrementAmount', form);

  return (
    isShow && (
      <CustomDrawerLayout
        open={isShow}
        onClose={() => onClose()}
        modalHeader={
          <div
            className="px-2"
            id="time-attendance-settings-leave-types-and-policies-sidebar-header-container"
            data-cy="time-attendance-settings-leave-types-and-policies-sidebar-header-container"
          >
            <CustomDrawerHeader data-cy="time-attendance-settings-leave-types-and-policies-sidebar-header">
              Leave Type
            </CustomDrawerHeader>
          </div>
        }
        footer={
          <div
            className="p-4"
            id="time-attendance-settings-leave-types-and-policies-sidebar-footer-container"
            data-cy="time-attendance-settings-leave-types-and-policies-sidebar-footer-container"
          >
            <CustomDrawerFooterButton
              buttons={footerModalItems}
              data-cy="time-attendance-settings-leave-types-and-policies-sidebar-footer-button"
            />
          </div>
        }
        width="400px"
        data-cy="time-attendance-settings-leave-types-and-policies-sidebar"
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
          id="time-attendance-settings-leave-types-and-policies-sidebar-form"
          data-cy="time-attendance-settings-leave-types-and-policies-sidebar-form"
        >
          <Space.Compact
            direction="vertical"
            className="w-full px-3 sm:px-0 "
            id="time-attendance-settings-leave-types-and-policies-sidebar-form-fields"
            data-cy="time-attendance-settings-leave-types-and-policies-sidebar-form-fields"
          >
            <Form.Item
              id={`TypesAndPoliciesTitleFieldId`}
              data-cy="time-attendance-settings-leave-types-and-policies-sidebar-title-field-id"
              label="Type Name"
              rules={[{ required: true, message: 'Required' }]}
              name="title"
            >
              <Input
                className={controlClass}
                id="time-attendance-settings-leave-types-and-policies-sidebar-title-input"
                data-cy="time-attendance-settings-leave-types-and-policies-sidebar-title-input"
              />
            </Form.Item>
            <Form.Item
              label="Paid/Unpaid"
              id={`TypesAndPoliciesPaidOrUnpaidFieldId`}
              data-cy="time-attendance-settings-leave-types-and-policies-sidebar-paid-unpaid-field-id"
              rules={[{ required: true, message: 'Required' }]}
              name="plan"
            >
              <Radio.Group
                className={controlClass}
                id="time-attendance-settings-leave-types-and-policies-sidebar-paid-unpaid-radio-group"
                data-cy="time-attendance-settings-leave-types-and-policies-sidebar-paid-unpaid-radio-group"
              >
                <Row
                  data-cy="time-attendance-settings-leave-types-and-policies-sidebar-paid-unpaid-radio-group-rows"
                  gutter={16}
                >
                  <Col
                    data-cy="time-attendance-settings-leave-types-and-policies-sidebar-paid-option-column"
                    span={12}
                  >
                    <CustomRadio
                      label="Paid"
                      value="paid"
                      isError={isErrorPlan}
                      data-cy="time-attendance-settings-leave-types-and-policies-sidebar-paid-option"
                    />
                  </Col>
                  <Col
                    data-cy="time-attendance-settings-leave-types-and-policies-sidebar-unpaid-option-column"
                    span={12}
                  >
                    <CustomRadio
                      label="Unpaid"
                      value="unpaid"
                      isError={isErrorPlan}
                      data-cy="time-attendance-settings-leave-types-and-policies-sidebar-unpaid-option"
                    />
                  </Col>
                </Row>
              </Radio.Group>
            </Form.Item>
            <Form.Item
              label="Entitled Days/year"
              id={`TypesAndPoliciesEntitledDaysYearFieldId`}
              data-cy="time-attendance-settings-leave-types-and-policies-sidebar-entitled-days-year-field-id"
              rules={[
                { required: true, message: 'Required' },
                {
                  validator: (nonUsed: any, value: number) => {
                    if (value > 365) {
                      return Promise.reject('Entitled days cannot exceed 365');
                    }
                    return Promise.resolve();
                  },
                },
              ]}
              className="mt-2"
              name="entitled"
            >
              <InputNumber
                min={1}
                className={controlClass}
                placeholder="Input entitled days"
                id="time-attendance-settings-leave-types-and-policies-sidebar-entitled-input"
                data-cy="time-attendance-settings-leave-types-and-policies-sidebar-entitled-input"
              />
            </Form.Item>
            <div
              id="time-attendance-settings-leave-types-and-policies-sidebar-fixed-leaves-container-id"
              data-cy="time-attendance-settings-leave-types-and-policies-sidebar-fixed-leaves-container-id"
              className="flex justify-between gap-2"
            >
              <div
                id="time-attendance-settings-leave-types-and-policies-sidebar-fixed-leaves-container-id"
                data-cy="time-attendance-settings-leave-types-and-policies-sidebar-fixed-leaves-container-id"
                className="h-[54px] w-full flex items-center gap-1"
              >
                <span
                  id="time-attendance-settings-leave-types-and-policies-sidebar-fixed-leaves-container-item-label-id"
                  data-cy="time-attendance-settings-leave-types-and-policies-sidebar-fixed-leaves-container-item-label-id"
                  className="text-xs text-gray-900 font-medium flex items-center gap-1"
                >
                  <Popover
                    content={
                      <div
                        id="time-attendance-settings-leave-types-and-policies-sidebar-fixed-leaves-container-item-popover-content-id"
                        data-cy="time-attendance-settings-leave-types-and-policies-sidebar-fixed-leaves-container-item-popover-content-id"
                        className="w-72"
                      >
                        Fixed leaves are granted upfront or as needed without
                        accumulation, while non-fixed leaves build up over time.
                      </div>
                    }
                  >
                    <InfoCircleOutlined
                      data-cy="time-attendance-settings-leave-types-and-policies-sidebar-fixed-leaves-container-item-popover-icon-id"
                      className="text-gray-500"
                    />
                  </Popover>
                  Fixed
                </span>
                <Form.Item
                  id={`TypesAndPoliciesIsDeductableFieldId`}
                  data-cy="time-attendance-settings-leave-types-and-policies-sidebar-fixed-leaves-container-item-form-id"
                  name="isFixed"
                  className="m-0"
                >
                  <Switch
                    size="small"
                    checkedChildren={
                      <CheckOutlined data-cy="time-attendance-settings-leave-types-and-policies-sidebar-fixed-leaves-container-item-switch-checked-icon-id" />
                    }
                    unCheckedChildren={
                      <CloseOutlined data-cy="time-attendance-settings-leave-types-and-policies-sidebar-fixed-leaves-container-item-switch-unchecked-icon-id" />
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
                id="time-attendance-settings-leave-types-and-policies-sidebar-deductable-leaves-container-id"
                data-cy="time-attendance-settings-leave-types-and-policies-sidebar-deductable-leaves-container-id"
                className="h-[54px] w-full flex items-center gap-1"
              >
                <span
                  id="time-attendance-settings-leave-types-and-policies-sidebar-deductable-leaves-container-item-label-id"
                  data-cy="time-attendance-settings-leave-types-and-policies-sidebar-deductable-leaves-container-item-label-id"
                  className="text-xs text-gray-900 font-medium flex items-center gap-1"
                >
                  <Popover
                    data-cy="time-attendance-settings-leave-types-and-policies-sidebar-deductable-leaves-container-item-popover-id"
                    content={
                      <div
                        id="time-attendance-settings-leave-types-and-policies-sidebar-deductable-leaves-container-item-popover-content-id"
                        data-cy="time-attendance-settings-leave-types-and-policies-sidebar-deductable-leaves-container-item-popover-content-id"
                        className="w-72"
                      >
                        Deductible leaves reduce an employee&apos;s leave
                        balance when taken (like vacation days), while
                        non-deductible leaves do not affect the balance.
                      </div>
                    }
                  >
                    <InfoCircleOutlined
                      data-cy="time-attendance-settings-leave-types-and-policies-sidebar-deductable-leaves-container-item-popover-icon-id"
                      className="text-gray-500"
                    />
                  </Popover>
                  Deductable
                </span>
                <Form.Item
                  id={`TypesAndPoliciesIsDeductableFieldId`}
                  data-cy="time-attendance-settings-leave-types-and-policies-sidebar-deductable-leaves-container-item-form-id"
                  name="isDeductible"
                  className="m-0"
                >
                  <Switch
                    size="small"
                    data-cy="time-attendance-settings-leave-types-and-policies-sidebar-deductable-leaves-container-item-switch-id"
                    checkedChildren={
                      <CheckOutlined data-cy="time-attendance-settings-leave-types-and-policies-sidebar-deductable-leaves-container-item-switch-checked-icon-id" />
                    }
                    unCheckedChildren={
                      <CloseOutlined data-cy="time-attendance-settings-leave-types-and-policies-sidebar-deductable-leaves-container-item-switch-unchecked-icon-id" />
                    }
                  />
                </Form.Item>
              </div>
              <div
                id="time-attendance-settings-leave-types-and-policies-sidebar-incremental-leaves-container-id"
                data-cy="time-attendance-settings-leave-types-and-policies-sidebar-incremental-leaves-container-id"
                className="h-[54px] w-full flex items-center gap-1"
              >
                <span
                  id="time-attendance-settings-leave-types-and-policies-sidebar-incremental-leaves-container-item-label-id"
                  data-cy="time-attendance-settings-leave-types-and-policies-sidebar-incremental-leaves-container-item-label-id"
                  className="text-xs text-gray-900 font-medium flex items-center gap-1"
                >
                  <Popover
                    data-cy="time-attendance-settings-leave-types-and-policies-sidebar-incremental-leaves-container-item-popover-id"
                    content={
                      <div
                        id="time-attendance-settings-leave-types-and-policies-sidebar-incremental-leaves-container-item-popover-content-id"
                        data-cy="time-attendance-settings-leave-types-and-policies-sidebar-incremental-leaves-container-item-popover-content-id"
                        className="w-72"
                      >
                        Annual Leave can be calculated increamentally per year.
                        for example per{' '}
                        <span
                          id="time-attendance-settings-leave-types-and-policies-sidebar-incremental-leaves-container-item-year-value-id"
                          data-cy="time-attendance-settings-leave-types-and-policies-sidebar-incremental-leaves-container-item-year-value-id"
                          className="font-bold"
                        >
                          2
                        </span>{' '}
                        years of employement,{' '}
                        <span
                          id="time-attendance-settings-leave-types-and-policies-sidebar-incremental-leaves-container-item-amount-value-id"
                          data-cy="time-attendance-settings-leave-types-and-policies-sidebar-incremental-leaves-container-item-amount-value-id"
                          className="font-bold"
                        >
                          1
                        </span>{' '}
                        more day of leave is added.
                      </div>
                    }
                  >
                    <InfoCircleOutlined
                      data-cy="time-attendance-settings-leave-types-and-policies-sidebar-incremental-leaves-container-item-popover-icon-id"
                      className="text-gray-500"
                    />
                  </Popover>
                  Incremental
                </span>
                <Form.Item
                  id={`TypesAndPoliciesIsDeductableFieldId`}
                  data-cy="time-attendance-settings-leave-types-and-policies-sidebar-incremental-leaves-container-item-form-id"
                  name="isIncremental"
                  className="m-0"
                >
                  <Switch
                    size="small"
                    data-cy="time-attendance-settings-leave-types-and-policies-sidebar-incremental-leaves-container-item-switch-id"
                    disabled={isFixed}
                    checkedChildren={
                      <CheckOutlined data-cy="time-attendance-settings-leave-types-and-policies-sidebar-incremental-leaves-container-item-switch-checked-icon-id" />
                    }
                    unCheckedChildren={
                      <CloseOutlined data-cy="time-attendance-settings-leave-types-and-policies-sidebar-incremental-leaves-container-item-switch-unchecked-icon-id" />
                    }
                  />
                </Form.Item>
              </div>
            </div>
            <div
              id="time-attendance-settings-leave-types-and-policies-sidebar-incremental-leaves-container-id"
              data-cy="time-attendance-settings-leave-types-and-policies-sidebar-incremental-leaves-container-id"
            >
              {isIncremental && (
                <div
                  id="time-attendance-settings-leave-types-and-policies-sidebar-incremental-leaves-container-item-container-id"
                  data-cy="time-attendance-settings-leave-types-and-policies-sidebar-incremental-leaves-container-item-container-id"
                  className="flex gap-4 mt-2 w-full"
                >
                  <Form.Item
                    data-cy="time-attendance-settings-leave-types-and-policies-sidebar-incremental-leaves-container-item-year-field-id"
                    name="incrementalYear"
                    rules={[{ required: isIncremental, message: 'Required' }]}
                    className="m-0"
                  >
                    <InputNumber
                      data-cy="time-attendance-settings-leave-types-and-policies-sidebar-incremental-leaves-container-item-year-input-id"
                      min={1}
                      placeholder="Year"
                      className="h-[40px] w-full"
                    />
                  </Form.Item>
                  <Form.Item
                    name="incrementAmount"
                    data-cy="time-attendance-settings-leave-types-and-policies-sidebar-incremental-leaves-container-item-amount-field-id"
                    rules={[{ required: true, message: 'Required' }]}
                    className="m-0"
                  >
                    <InputNumber
                      data-cy="time-attendance-settings-leave-types-and-policies-sidebar-incremental-leaves-container-item-amount-input-id"
                      min={1}
                      placeholder="Entitled Days"
                      className="h-[40px] w-full"
                    />
                  </Form.Item>
                </div>
              )}
              {isIncremental && (
                <div
                  id="time-attendance-settings-leave-types-and-policies-sidebar-incremental-leaves-container-item-description-id"
                  data-cy="time-attendance-settings-leave-types-and-policies-sidebar-incremental-leaves-container-item-description-id"
                  className="text-[11px] text-gray-500 mt-1 mb-4 flex items-center gap-1"
                >
                  <InfoCircleOutlined
                    data-cy="time-attendance-settings-leave-types-and-policies-sidebar-incremental-leaves-container-item-description-popover-icon-id"
                    className="text-gray-500"
                  />
                  Every{' '}
                  <b
                    id="time-attendance-settings-leave-types-and-policies-sidebar-incremental-leaves-container-item-description-year-value-id"
                    data-cy="time-attendance-settings-leave-types-and-policies-sidebar-incremental-leaves-container-item-description-year-value-id"
                    className="font-bold"
                  >
                    {incrementalYear || '__'}
                  </b>{' '}
                  years add{' '}
                  <b
                    id="time-attendance-settings-leave-types-and-policies-sidebar-incremental-leaves-container-item-description-amount-value-id"
                    data-cy="time-attendance-settings-leave-types-and-policies-sidebar-incremental-leaves-container-item-description-amount-value-id"
                    className="font-bold"
                  >
                    {incrementalDays || '__'}
                  </b>{' '}
                  additional day(s)
                </div>
              )}
            </div>
            <Form.Item
              id={`TypesAndPoliciesMinAllowedDaysFieldId`}
              data-cy="time-attendance-settings-leave-types-and-policies-sidebar-min-allowed-days-field-id"
              label="Minimum notifying period(days)"
              rules={[{ required: true, message: 'Required' }]}
              name="min"
            >
              <InputNumber
                min={0}
                className={inputNumberClass}
                placeholder="Enter your days"
                data-cy="time-attendance-settings-leave-types-and-policies-sidebar-min-allowed-days-input-id"
              />
            </Form.Item>
            <Form.Item
              id={`TypesAndPoliciesMaxConsecuativeAllowedDaysFieldId`}
              data-cy="time-attendance-settings-leave-types-and-policies-sidebar-max-allowed-consecutive-days-field-id"
              label="Maximum allowed consecutive days"
              rules={[
                { required: true, message: 'Required' },
                {
                  /* eslint-disable @typescript-eslint/naming-convention */
                  validator: (_, value) => {
                    /* eslint-enable @typescript-eslint/naming-convention */

                    const entitledDays = form.getFieldValue('entitled');
                    if (value > entitledDays) {
                      return Promise.reject(
                        'Maximum consecutive days cannot exceed entitled days',
                      );
                    }
                    return Promise.resolve();
                  },
                },
              ]}
              name="max"
            >
              <InputNumber
                min={1}
                className={inputNumberClass}
                placeholder="Enter your days"
                data-cy="time-attendance-settings-leave-types-and-policies-sidebar-max-allowed-consecutive-days-input-id"
              />
            </Form.Item>
            <Form.Item
              label="Accrual Rule"
              id={`TypesAndPoliciesActualRuleFieldId`}
              data-cy="time-attendance-settings-leave-types-and-policies-sidebar-accrual-rule-field-id"
              rules={[
                {
                  required: !isFixed,
                  message: 'Required',
                },
              ]}
              name="accrualRule"
            >
              <Select
                disabled={!!isFixed}
                className={controlClass}
                suffixIcon={
                  <MdKeyboardArrowDown
                    size={16}
                    className="text-gray-900"
                    data-cy="time-attendance-settings-leave-types-and-policies-sidebar-accrual-rule-select-icon"
                  />
                }
                options={accrualRuleOptions()}
                id="time-attendance-settings-leave-types-and-policies-sidebar-accrual-rule-select"
                data-cy="time-attendance-settings-leave-types-and-policies-sidebar-accrual-rule-select"
              />
            </Form.Item>
            <Form.Item
              label="Carry-Over Rule"
              id={`TypesAndPoliciesRuleCarryOverFieldldId`}
              data-cy="time-attendance-settings-leave-types-and-policies-sidebar-carry-over-rule-field-id"
              rules={[
                {
                  required: !isFixed,
                  message: 'Required',
                },
              ]}
              name="carryOverRule"
            >
              <Select
                disabled={!!isFixed}
                className={controlClass}
                options={carryOverRuleOptions()}
                suffixIcon={
                  <MdKeyboardArrowDown
                    size={16}
                    className="text-gray-900"
                    data-cy="time-attendance-settings-leave-types-and-policies-sidebar-carry-over-rule-select-icon"
                  />
                }
                id="time-attendance-settings-leave-types-and-policies-sidebar-carry-over-rule-select"
                data-cy="time-attendance-settings-leave-types-and-policies-sidebar-carry-over-rule-select"
              />
            </Form.Item>
            <Form.Item
              label="Description"
              id={`TypesAndPoliciesDescriptionFieldId`}
              data-cy="time-attendance-settings-leave-types-and-policies-sidebar-description-field-id"
              rules={[{ required: true, message: 'Required' }]}
              name="description"
            >
              <Input.TextArea
                className="w-full h-36 px-5 mt-2.5"
                placeholder="Input description"
                rows={6}
                id="time-attendance-settings-leave-types-and-policies-sidebar-description-textarea"
                data-cy="time-attendance-settings-leave-types-and-policies-sidebar-description-textarea"
              />
            </Form.Item>
            <Form.Item
              label={
                <span
                  id="time-attendance-settings-leave-types-and-policies-sidebar-convertible-to-cash-label-id"
                  data-cy="time-attendance-settings-leave-types-and-policies-sidebar-convertible-to-cash-label-id"
                >
                  Convertible to cash
                  <Popover
                    data-cy="time-attendance-settings-leave-types-and-policies-sidebar-convertible-to-cash-popover-id"
                    content={
                      <div
                        id="time-attendance-settings-leave-types-and-policies-sidebar-convertible-to-cash-popover-content-id"
                        data-cy="time-attendance-settings-leave-types-and-policies-sidebar-convertible-to-cash-popover-content-id"
                        style={{ maxWidth: 300 }}
                      >
                        This leave balance can be converted into cash based on
                        your company&apos;s policy.
                        <br data-cy="leave-types-and-policies-components-typesandpoliciessidebar-index-tsx-index-br-640" />
                        The amount is calculated daily.
                      </div>
                    }
                  >
                    <span
                      id="time-attendance-settings-leave-types-and-policies-sidebar-convertible-to-cash-popover-icon-id"
                      data-cy="time-attendance-settings-leave-types-and-policies-sidebar-convertible-to-cash-popover-icon-id"
                      style={{ marginLeft: 6, cursor: 'pointer' }}
                    >
                      <InfoCircleOutlined
                        data-cy="time-attendance-settings-leave-types-and-policies-sidebar-convertible-to-cash-popover-icon-id"
                        style={{ color: '#888' }}
                      />
                    </span>
                  </Popover>
                </span>
              }
              id="TypesAndPoliciesConvertibleToCashFieldId"
              data-cy="time-attendance-settings-leave-types-and-policies-sidebar-convertible-to-cash-field-id"
              name="convertableToCash"
            >
              <Switch
                defaultChecked={false}
                data-cy="time-attendance-settings-leave-types-and-policies-sidebar-convertible-to-cash-switch-id"
              />
            </Form.Item>
          </Space.Compact>
        </Form>
      </CustomDrawerLayout>
    )
  );
};

export default TypesAndPoliciesSidebar;
