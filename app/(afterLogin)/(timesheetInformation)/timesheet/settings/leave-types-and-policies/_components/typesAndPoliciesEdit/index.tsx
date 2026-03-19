'use client';
import { useTimesheetSettingsStore } from '@/store/uistate/features/timesheet/settings';
import React, { useEffect } from 'react';
import {
  Col,
  Form,
  Radio,
  Row,
  Input,
  InputNumber,
  Switch,
  Select,
  Spin,
  Modal,
  Button,
} from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { useGetLeaveTypeById } from '@/store/server/features/timesheet/leaveType/queries';
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
  const itemClass = 'font-semibold text-sm';
  const controlClass = 'mt-2 h-[40px] w-full rounded-lg';
  const inputNumberClass = 'w-full h-[40px] mt-2';

  const { data: getLeaveTypeById, isLoading: getIsLoading } =
    useGetLeaveTypeById(leaveTypeId ?? '');
  const { data: carryOverData } = useGetCarryOverRules();
  const { data: accrualRulesData } = useGetAccrualRules();
  const [form] = Form.useForm();
  const { mutate: updateLeaveType } = useUpdateLeaveType();

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
  const isDeductible = Form.useWatch('isDeductible', form);
  const selectedPlan = Form.useWatch('plan', form); // 'paid' | 'unpaid' | undefined

  const radioItemClass = (value: 'paid' | 'unpaid') =>
    selectedPlan === value
      ? 'bg-primary border-primary text-white'
      : 'bg-white border border-[#d9d9d9] text-[#4d4d4d]';

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
      <Modal
        open={isShow}
        onCancel={() => onClose()}
        title={
          <div
            className="text-lg font-semibold text-[#4d4d4d]"
            data-cy="time-attendance-settings-leave-types-and-policies-edit-sidebar-header"
          >
            Edit Leave Type
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
              className="h-10 px-6 rounded-lg"
              onClick={() => onClose()}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              className="h-10 px-6 rounded-lg"
              onClick={() => form.submit()}
            >
              Update
            </Button>
          </div>
        }
        data-cy="time-attendance-settings-leave-types-and-policies-edit-sidebar"
        zIndex={10002}
        centered
        width={660}
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
            <Form.Item
              id={`TypesAndPoliciesTitleFieldId`}
              data-cy="time-attendance-settings-leave-types-and-policies-edit-sidebar-title-field-id"
              label={
                <span
                  data-cy="time-attendance-settings-leave-types-and-policies-edit-sidebar-title-label-id"
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
                data-cy="time-attendance-settings-leave-types-and-policies-edit-sidebar-title-input"
              />
            </Form.Item>
            <Form.Item
              label={
                <span
                  data-cy="time-attendance-settings-leave-types-and-policies-edit-sidebar-paid-unpaid-label-id"
                  className="text-sm font-normal text-black pr-1"
                >
                  Paid or Unpaid
                </span>
              }
              id={`TypesAndPoliciesPaidOrUnpaidFieldId`}
              data-cy="time-attendance-settings-leave-types-and-policies-edit-sidebar-paid-unpaid-field-id"
              rules={[{ required: true, message: 'Required' }]}
              name="plan"
            >
              <Radio.Group
                className={controlClass}
                data-cy="time-attendance-settings-leave-types-and-policies-edit-sidebar-paid-unpaid-radio-group"
              >
                <Row
                  data-cy="time-attendance-settings-leave-types-and-policies-edit-sidebar-paid-unpaid-radio-group-rows"
                  gutter={16}
                  className="sm:px-8"
                >
                  <Col
                    data-cy="time-attendance-settings-leave-types-and-policies-edit-sidebar-paid-option-column"
                    span={12}
                  >
                    <Button
                      type="default"
                      className={`h-[40px] w-full rounded-lg border text-sm font-semibold flex items-center justify-center ${radioItemClass(
                        'paid',
                      )} ${isErrorPlan ? 'border-error' : ''}`}
                      onClick={() => form.setFieldsValue({ plan: 'paid' })}
                      data-cy="time-attendance-settings-leave-types-and-policies-edit-sidebar-paid-option"
                    >
                      Paid
                    </Button>
                  </Col>
                  <Col
                    data-cy="time-attendance-settings-leave-types-and-policies-edit-sidebar-unpaid-option-column"
                    span={12}
                  >
                    <Button
                      type="default"
                      className={`h-[40px] w-full rounded-lg border text-sm font-semibold flex items-center justify-center ${radioItemClass(
                        'unpaid',
                      )} ${isErrorPlan ? 'border-error' : ''}`}
                      onClick={() => form.setFieldsValue({ plan: 'unpaid' })}
                      data-cy="time-attendance-settings-leave-types-and-policies-edit-sidebar-unpaid-option"
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
                  data-cy="time-attendance-settings-leave-types-and-policies-edit-sidebar-entitled-days-year-label-id"
                  className="text-sm font-normal text-black pr-1"
                >
                  Entitled Days/Year
                </span>
              }
              id={`TypesAndPoliciesEntitledDaysYearFieldId`}
              data-cy="time-attendance-settings-leave-types-and-policies-edit-sidebar-entitled-days-year-field-id"
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
              name="entitled"
            >
              <InputNumber
                min={1}
                className={inputNumberClass}
                placeholder="Input"
                data-cy="time-attendance-settings-leave-types-and-policies-edit-sidebar-entitled-days-year-input"
              />
            </Form.Item>

            <div
              id="time-attendance-settings-leave-types-and-policies-edit-sidebar-fixed-leaves-container-id"
              data-cy="time-attendance-settings-leave-types-and-policies-edit-sidebar-fixed-leaves-container-id"
              className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-1"
            >
              <div
                id="time-attendance-settings-leave-types-and-policies-edit-sidebar-fixed-leaves-container-item-id"
                data-cy="time-attendance-settings-leave-types-and-policies-edit-sidebar-fixed-leaves-container-item-id"
                className="w-full"
              >
                <button
                  type="button"
                  id="time-attendance-settings-leave-types-and-policies-edit-sidebar-fixed-leaves-container-item-label-id"
                  data-cy="time-attendance-settings-leave-types-and-policies-edit-sidebar-fixed-leaves-container-item-label-id"
                  className={`h-[40px] w-full rounded-lg border text-sm font-normal ${
                    isFixed
                      ? 'bg-primary border-primary text-white'
                      : 'bg-white border-gray-300 text-gray-700'
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
                  data-cy="time-attendance-settings-leave-types-and-policies-edit-sidebar-fixed-leaves-container-item-form-id"
                  name="isFixed"
                  className="m-0 hidden"
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
                    onChange={() => {}}
                  />
                </Form.Item>
              </div>
              <div
                id="time-attendance-settings-leave-types-and-policies-edit-sidebar-deductable-leaves-container-id"
                data-cy="time-attendance-settings-leave-types-and-policies-edit-sidebar-deductable-leaves-container-id"
                className="w-full"
              >
                <button
                  type="button"
                  id="time-attendance-settings-leave-types-and-policies-edit-sidebar-deductable-leaves-container-item-label-id"
                  data-cy="time-attendance-settings-leave-types-and-policies-edit-sidebar-deductable-leaves-container-item-label-id"
                  className={`h-[40px] w-full rounded-lg border text-sm font-normal ${
                    isDeductible
                      ? 'bg-primary border-primary text-white'
                      : 'bg-white border-gray-300 text-gray-700'
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
                  data-cy="time-attendance-settings-leave-types-and-policies-edit-sidebar-deductable-leaves-container-item-form-id"
                  name="isDeductible"
                  className="m-0 hidden"
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
                className="w-full"
              >
                <button
                  type="button"
                  id="time-attendance-settings-leave-types-and-policies-edit-sidebar-incremental-container-item-label-id"
                  data-cy="time-attendance-settings-leave-types-and-policies-edit-sidebar-incremental-container-item-label-id"
                  className={`h-[40px] w-full rounded-lg border text-sm font-normal ${
                    isIncremental
                      ? 'bg-primary border-primary text-white'
                      : 'bg-white border-gray-300 text-gray-700'
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
                  data-cy="time-attendance-settings-leave-types-and-policies-edit-sidebar-incremental-container-item-form-id"
                  name="isIncremental"
                  className="m-0 hidden"
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
            <div
              id="time-attendance-settings-leave-types-and-policies-edit-sidebar-fixed-leaves-description-container"
              data-cy="time-attendance-settings-leave-types-and-policies-edit-sidebar-fixed-leaves-description-container"
              className="text-xs text-black font-normal text-center mb-2"
            >
              Fixed leaves are granted upfront or as needed without
              accumulation, while non-fixed leaves build up over time.
            </div>
            <div data-cy="leave-types-and-policies-components-typesandpoliciesedit-index-tsx-index-div-463">
              {isIncremental && (
                <div
                  id="time-attendance-settings-leave-types-and-policies-edit-sidebar-incremental-container-id"
                  data-cy="time-attendance-settings-leave-types-and-policies-edit-sidebar-incremental-container-id"
                  className="flex gap-2 my-2 w-full"
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
                      placeholder="Input"
                      className="h-[40px] w-full rounded-lg"
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
                      placeholder="Input"
                      className="h-[40px] w-full rounded-lg"
                    />
                  </Form.Item>
                </div>
              )}
            </div>
            <Form.Item
              id={`TypesAndPoliciesMinAllowedDaysFieldId`}
              data-cy="time-attendance-settings-leave-types-and-policies-edit-sidebar-min-allowed-days-field-id"
              label={
                <span
                  data-cy="time-attendance-settings-leave-types-and-policies-edit-sidebar-min-allowed-days-label-id"
                  className="text-sm font-normal text-black pr-1"
                >
                  Minimum notifying period(days)
                </span>
              }
              rules={[{ required: true, message: 'Required' }]}
              name="min"
            >
              <InputNumber
                data-cy="time-attendance-settings-leave-types-and-policies-edit-sidebar-min-allowed-days-input-id"
                min={0}
                className={inputNumberClass}
                placeholder="Input"
              />
            </Form.Item>
            <Form.Item
              id={`TypesAndPoliciesMaxConsecuativeAllowedDaysFieldId`}
              data-cy="time-attendance-settings-leave-types-and-policies-edit-sidebar-max-allowed-consecutive-days-field-id"
              label={
                <span
                  data-cy="time-attendance-settings-leave-types-and-policies-edit-sidebar-max-allowed-consecutive-days-label-id"
                  className="text-sm font-normal text-black pr-1"
                >
                  Maximum allowed consecutive days
                </span>
              }
              rules={[{ required: true, message: 'Required' }]}
              name="max"
            >
              <InputNumber
                data-cy="time-attendance-settings-leave-types-and-policies-edit-sidebar-max-allowed-consecutive-days-input-id"
                min={1}
                className={inputNumberClass}
                placeholder="Input"
              />
            </Form.Item>
            <Form.Item
              label={
                <span
                  data-cy="time-attendance-settings-leave-types-and-policies-edit-sidebar-accrual-rule-label-id"
                  className="text-sm font-normal text-black pr-1"
                >
                  Accrual Rule
                </span>
              }
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
              label={
                <span
                  data-cy="time-attendance-settings-leave-types-and-policies-edit-sidebar-carry-over-rule-label-id"
                  className="text-sm font-normal text-black pr-1"
                >
                  Carry-Over Rule
                </span>
              }
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
              label={
                <span
                  data-cy="time-attendance-settings-leave-types-and-policies-edit-sidebar-description-label-id"
                  className="text-sm font-normal text-black pr-1"
                >
                  Description
                </span>
              }
              id={`TypesAndPoliciesDescriptionFieldId`}
              data-cy="time-attendance-settings-leave-types-and-policies-edit-sidebar-description-field-id"
              rules={[{ required: true, message: 'Required' }]}
              name="description"
            >
              <Input.TextArea
                data-cy="time-attendance-settings-leave-types-and-policies-edit-sidebar-description-textarea-id"
                className="w-full px-5 mt-2 rounded-lg"
                placeholder="Textarea"
                rows={2}
              />
            </Form.Item>
          </Form>
        </Spin>
      </Modal>
    )
  );
};

export default TypesAndPoliciesEdit;
