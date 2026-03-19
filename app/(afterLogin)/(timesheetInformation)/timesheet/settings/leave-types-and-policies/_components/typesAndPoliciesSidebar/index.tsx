import { useTimesheetSettingsStore } from '@/store/uistate/features/timesheet/settings';
import {
  Button,
  Col,
  Form,
  Input,
  InputNumber,
  Modal,
  Popover,
  Radio,
  Row,
  Select,
  Switch,
} from 'antd';
import CustomLabel from '@/components/form/customLabel/customLabel';
import React, { useEffect, useState, useCallback } from 'react';
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

  const { mutate: createLeaveType, isSuccess } = useCreateLeaveType();

  const [form] = Form.useForm();

  const itemClass = 'font-semibold text-sm';
  const controlClass = 'h-[40px] w-full mt-1';
  const inputNumberClass = 'w-full h-[40px] mt-2';

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
  const isDeductible = Form.useWatch('isDeductible', form);

  const selectedPlan = Form.useWatch('plan', form); // 'paid' | 'unpaid' | undefined

  const radioItemClass = (value: 'paid' | 'unpaid') =>
    selectedPlan === value
      ? 'bg-primary border-primary text-white'
      : 'bg-white border border-[#d9d9d9] text-[#4d4d4d]';

  return (
    isShow && (
      <Modal
        open={isShow}
        onCancel={() => onClose()}
        title={
          <div
            className="text-lg font-semibold text-[#4d4d4d]"
            id="time-attendance-settings-leave-types-and-policies-sidebar-header-container"
            data-cy="time-attendance-settings-leave-types-and-policies-sidebar-header-container"
          >
            Create Leave Type
          </div>
        }
        footer={
          <div
            className="px-2 py-3 flex items-center justify-end gap-3"
            id="time-attendance-settings-leave-types-and-policies-sidebar-footer-container"
            data-cy="time-attendance-settings-leave-types-and-policies-sidebar-footer-container"
          >
            <Button
              type="default"
              className="h-8 border border-[#d9d9d9] text-[#4d4d4d] text-base font-normal"
              onClick={() => onClose()}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              className="h-8 text-base font-normal"
              onClick={() => form.submit()}
            >
              Create
            </Button>
          </div>
        }
        data-cy="time-attendance-settings-leave-types-and-policies-sidebar"
        zIndex={10002}
        centered
        width={660}
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
          <Form.Item
            id={`TypesAndPoliciesTitleFieldId`}
            data-cy="time-attendance-settings-leave-types-and-policies-sidebar-title-field-id"
            label={
              <span
                id="time-attendance-settings-leave-types-and-policies-sidebar-title-label"
                data-cy="time-attendance-settings-leave-types-and-policies-sidebar-title-label"
                className="text-sm font-normal text-black pr-1"
              >
                Type Name
              </span>
            }
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
            label={
              <span
                id="time-attendance-settings-leave-types-and-policies-sidebar-paid-unpaid-label"
                data-cy="time-attendance-settings-leave-types-and-policies-sidebar-paid-unpaid-label"
                className="text-sm font-normal text-black pr-1"
              >
                Paid or Unpaid
              </span>
            }
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
                className="sm:px-8"
              >
                <Col
                  data-cy="time-attendance-settings-leave-types-and-policies-sidebar-paid-option-column"
                  span={12}
                >
                  <Button
                    type="default"
                    className={`h-[40px] w-full rounded-lg border text-sm font-semibold flex items-center justify-center ${radioItemClass(
                      'paid',
                    )} ${isErrorPlan ? 'border-error' : ''}`}
                    onClick={() => form.setFieldsValue({ plan: 'paid' })}
                    data-cy="time-attendance-settings-leave-types-and-policies-sidebar-paid-option"
                  >
                    Paid
                  </Button>
                </Col>
                <Col
                  data-cy="time-attendance-settings-leave-types-and-policies-sidebar-unpaid-option-column"
                  span={12}
                >
                  <Button
                    type="default"
                    className={`h-[40px] w-full rounded-lg border text-sm font-semibold flex items-center justify-center ${radioItemClass(
                      'unpaid',
                    )} ${isErrorPlan ? 'border-error' : ''}`}
                    onClick={() => form.setFieldsValue({ plan: 'unpaid' })}
                    data-cy="time-attendance-settings-leave-types-and-policies-sidebar-unpaid-option"
                  >
                    Unpaid
                  </Button>
                </Col>
              </Row>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            label={
              <span
                data-cy="time-attendance-settings-leave-types-and-policies-sidebar-entitled-days-year-label-id"
                className="text-sm font-normal text-black pr-1"
              >
                Entitled Days/Year
              </span>
            }
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
              placeholder="Input"
              id="time-attendance-settings-leave-types-and-policies-sidebar-entitled-input"
              data-cy="time-attendance-settings-leave-types-and-policies-sidebar-entitled-input"
            />
          </Form.Item>
          <div
            id="time-attendance-settings-leave-types-and-policies-sidebar-fixed-leaves-container-id"
            data-cy="time-attendance-settings-leave-types-and-policies-sidebar-fixed-leaves-container-id"
            className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-1 px-12"
          >
            <div
              id="time-attendance-settings-leave-types-and-policies-sidebar-fixed-leaves-container-id"
              data-cy="time-attendance-settings-leave-types-and-policies-sidebar-fixed-leaves-container-id"
              className="w-full"
            >
              <button
                type="button"
                id="time-attendance-settings-leave-types-and-policies-sidebar-fixed-leaves-container-item-label-id"
                data-cy="time-attendance-settings-leave-types-and-policies-sidebar-fixed-leaves-container-item-label-id"
                className={`h-[40px] w-full rounded-lg border text-base font-normal ${
                  isFixed
                    ? 'bg-primary border-primary text-white'
                    : 'bg-white border border-[#d9d9d9] text-[#4d4d4d]'
                }`}
                onClick={() => {
                  const next = !isFixed;
                  setIsFixed(next);
                  form.setFieldsValue({
                    isFixed: next,
                    ...(next && {
                      accrualRule: undefined,
                      carryOverRule: undefined,
                      isIncremental: false,
                    }),
                  });
                }}
              >
                Fixed
              </button>
              <Form.Item
                id={`TypesAndPoliciesIsDeductableFieldId`}
                data-cy="time-attendance-settings-leave-types-and-policies-sidebar-fixed-leaves-container-item-form-id"
                name="isFixed"
                className="m-0 hidden"
              >
                <Switch
                  size="small"
                  checkedChildren={
                    <CheckOutlined data-cy="time-attendance-settings-leave-types-and-policies-sidebar-fixed-leaves-container-item-switch-checked-icon-id" />
                  }
                  unCheckedChildren={
                    <CloseOutlined data-cy="time-attendance-settings-leave-types-and-policies-sidebar-fixed-leaves-container-item-switch-unchecked-icon-id" />
                  }
                  onChange={() => {}}
                />
              </Form.Item>
            </div>
            <div
              id="time-attendance-settings-leave-types-and-policies-sidebar-deductable-leaves-container-id"
              data-cy="time-attendance-settings-leave-types-and-policies-sidebar-deductable-leaves-container-id"
              className="w-full"
            >
              <button
                type="button"
                id="time-attendance-settings-leave-types-and-policies-sidebar-deductable-leaves-container-item-label-id"
                data-cy="time-attendance-settings-leave-types-and-policies-sidebar-deductable-leaves-container-item-label-id"
                className={`h-[40px] w-full rounded-lg border text-base font-normal ${
                  isDeductible
                    ? 'bg-primary border-primary text-white'
                    : 'bg-white border border-[#d9d9d9] text-[#4d4d4d]'
                }`}
                onClick={() =>
                  form.setFieldsValue({
                    isDeductible: !isDeductible,
                  })
                }
              >
                Deductable
              </button>
              <Form.Item
                id={`TypesAndPoliciesIsDeductableFieldId`}
                data-cy="time-attendance-settings-leave-types-and-policies-sidebar-deductable-leaves-container-item-form-id"
                name="isDeductible"
                className="m-0 hidden"
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
              className="w-full"
            >
              <button
                type="button"
                id="time-attendance-settings-leave-types-and-policies-sidebar-incremental-leaves-container-item-label-id"
                data-cy="time-attendance-settings-leave-types-and-policies-sidebar-incremental-leaves-container-item-label-id"
                className={`h-[40px] w-full rounded-lg border text-base font-normal ${
                  isIncremental
                    ? 'bg-primary border-primary text-white'
                    : 'bg-white border border-[#d9d9d9] text-[#4d4d4d]'
                } ${isFixed ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => {
                  if (isFixed) return;
                  form.setFieldsValue({
                    isIncremental: !isIncremental,
                  });
                }}
              >
                Incremental
              </button>
              <Form.Item
                id={`TypesAndPoliciesIsDeductableFieldId`}
                data-cy="time-attendance-settings-leave-types-and-policies-sidebar-incremental-leaves-container-item-form-id"
                name="isIncremental"
                className="m-0 hidden"
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
            id="time-attendance-settings-leave-types-and-policies-sidebar-fixed-leaves-description-container"
            data-cy="time-attendance-settings-leave-types-and-policies-sidebar-fixed-leaves-description-container"
            className="text-xs text-black text-center mb-4 font-normal mt-1"
          >
            Fixed leaves are granted upfront or as needed without accumulation,
            while non-fixed leaves build up over time.
          </div>
          <div
            id="time-attendance-settings-leave-types-and-policies-sidebar-incremental-leaves-container-id"
            data-cy="time-attendance-settings-leave-types-and-policies-sidebar-incremental-leaves-container-id"
          >
            {isIncremental && (
              <Row gutter={16} className="my-2">
                <Col span={12}>
                  <Form.Item
                    data-cy="time-attendance-settings-leave-types-and-policies-sidebar-incremental-leaves-container-item-year-field-id"
                    name="incrementalYear"
                    rules={[{ required: isIncremental, message: 'Required' }]}
                    className="m-0"
                  >
                    <InputNumber
                      data-cy="time-attendance-settings-leave-types-and-policies-sidebar-incremental-leaves-container-item-year-input-id"
                      min={1}
                      placeholder="Input"
                      className="h-[40px] w-full"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="incrementAmount"
                    data-cy="time-attendance-settings-leave-types-and-policies-sidebar-incremental-leaves-container-item-amount-field-id"
                    rules={[{ required: true, message: 'Required' }]}
                    className="m-0"
                  >
                    <InputNumber
                      data-cy="time-attendance-settings-leave-types-and-policies-sidebar-incremental-leaves-container-item-amount-input-id"
                      min={1}
                      placeholder="Input"
                      className="h-[40px] w-full"
                    />
                  </Form.Item>
                </Col>
              </Row>
            )}
          </div>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                id={`TypesAndPoliciesMinAllowedDaysFieldId`}
                data-cy="time-attendance-settings-leave-types-and-policies-sidebar-min-allowed-days-field-id"
                label={
                  <span
                    data-cy="time-attendance-settings-leave-types-and-policies-sidebar-min-allowed-days-label-id"
                    className="text-sm font-normal text-black pr-1"
                  >
                    Minimum notifying period(days)
                  </span>
                }
                rules={[{ required: true, message: 'Required' }]}
                name="min"
              >
                <InputNumber
                  min={0}
                  className={inputNumberClass}
                  placeholder="Input"
                  data-cy="time-attendance-settings-leave-types-and-policies-sidebar-min-allowed-days-input-id"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                id={`TypesAndPoliciesMaxConsecuativeAllowedDaysFieldId`}
                data-cy="time-attendance-settings-leave-types-and-policies-sidebar-max-allowed-consecutive-days-field-id"
                label={
                  <span
                    data-cy="time-attendance-settings-leave-types-and-policies-sidebar-max-allowed-consecutive-days-label-id"
                    className="text-sm font-normal text-black pr-1"
                  >
                    Maximum allowed consecutive days
                  </span>
                }
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
                  placeholder="Input"
                  data-cy="time-attendance-settings-leave-types-and-policies-sidebar-max-allowed-consecutive-days-input-id"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label={
              <span
                data-cy="time-attendance-settings-leave-types-and-policies-sidebar-accrual-rule-label-id"
                className="text-sm font-normal text-black pr-1"
              >
                Accrual Rule
              </span>
            }
            id={`TypesAndPoliciesActualRuleFieldId`}
            data-cy="time-attendance-settings-leave-types-and-policies-sidebar-accrual-rule-field-id"
            rules={[
              {
                required: !isFixed,
                message: 'Required',
              },
            ]}
            name="accrualRule"
            hidden={!!isFixed}
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
            label={
              <span
                data-cy="time-attendance-settings-leave-types-and-policies-sidebar-carry-over-rule-label-id"
                className="text-sm font-normal text-black pr-1"
              >
                Carry-Over Rule
              </span>
            }
            id={`TypesAndPoliciesRuleCarryOverFieldldId`}
            data-cy="time-attendance-settings-leave-types-and-policies-sidebar-carry-over-rule-field-id"
            rules={[
              {
                required: !isFixed,
                message: 'Required',
              },
            ]}
            name="carryOverRule"
            hidden={!!isFixed}
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
            label={
              <span
                data-cy="time-attendance-settings-leave-types-and-policies-sidebar-description-label-id"
                className="text-sm font-normal text-black pr-1"
              >
                Description
              </span>
            }
            id={`TypesAndPoliciesDescriptionFieldId`}
            data-cy="time-attendance-settings-leave-types-and-policies-sidebar-description-field-id"
            rules={[{ required: true, message: 'Required' }]}
            name="description"
          >
            <Input.TextArea
              className="w-full px-5 mt-2 rounded-lg"
              placeholder="Textarea"
              rows={2}
              id="time-attendance-settings-leave-types-and-policies-sidebar-description-textarea"
              data-cy="time-attendance-settings-leave-types-and-policies-sidebar-description-textarea"
            />
          </Form.Item>
          <Form.Item
            id="TypesAndPoliciesConvertibleToCashFieldId"
            data-cy="time-attendance-settings-leave-types-and-policies-sidebar-convertible-to-cash-field-id"
            name="convertableToCash"
          >
            <div
              data-cy="time-attendance-settings-leave-types-and-policies-sidebar-convertible-to-cash-container-id"
              className="flex items-center gap-2"
            >
              <span
                id="time-attendance-settings-leave-types-and-policies-sidebar-convertible-to-cash-label-id"
                data-cy="time-attendance-settings-leave-types-and-policies-sidebar-convertible-to-cash-label-id"
                className="text-sm font-normal text-black"
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
              <Switch
                defaultChecked={false}
                data-cy="time-attendance-settings-leave-types-and-policies-sidebar-convertible-to-cash-switch-id"
              />
            </div>
          </Form.Item>
        </Form>
      </Modal>
    )
  );
};

export default TypesAndPoliciesSidebar;
