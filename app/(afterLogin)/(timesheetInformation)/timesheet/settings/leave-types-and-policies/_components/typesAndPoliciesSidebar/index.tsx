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
          <div className="px-2">
            <CustomDrawerHeader>Leave Type</CustomDrawerHeader>
          </div>
        }
        footer={
          <div className="p-4">
            <CustomDrawerFooterButton buttons={footerModalItems} />
          </div>
        }
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
          <Space.Compact direction="vertical" className="w-full px-3 sm:px-0 ">
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
              <Radio.Group className={controlClass}>
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
              rules={[{ required: true, message: 'Required' }, {
                validator: (_, value) => {
                  if (value > 365) {
                    return Promise.reject('Entitled days cannot exceed 365');
                  }
                  return Promise.resolve();
                },
              }]}
              className="mt-2"
              name="entitled"
            >
              <InputNumber
                min={1}
                className={controlClass}
                placeholder="Input entitled days"
              />
            </Form.Item>
            <div className="flex justify-between gap-2">
              <div className="h-[54px] w-full flex items-center gap-1">
                <span className="text-xs text-gray-900 font-medium flex items-center gap-1">
                  <Popover
                    content={
                      <div className="w-72">
                        Fixed leaves are granted upfront or as needed without
                        accumulation, while non-fixed leaves build up over time.
                      </div>
                    }
                  >
                    <InfoCircleOutlined className="text-gray-500" />
                  </Popover>
                  Fixed
                </span>
                <Form.Item
                  id={`TypesAndPoliciesIsDeductableFieldId`}
                  name="isFixed"
                  className="m-0"
                >
                  <Switch
                    size="small"
                    checkedChildren={<CheckOutlined />}
                    unCheckedChildren={<CloseOutlined />}
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
              <div className="h-[54px] w-full flex items-center gap-1">
                <span className="text-xs text-gray-900 font-medium flex items-center gap-1">
                  <Popover
                    content={
                      <div className="w-72">
                        Deductible leaves reduce an employee&apos;s leave
                        balance when taken (like vacation days), while
                        non-deductible leaves do not affect the balance.
                      </div>
                    }
                  >
                    <InfoCircleOutlined className="text-gray-500" />
                  </Popover>
                  Deductable
                </span>
                <Form.Item
                  id={`TypesAndPoliciesIsDeductableFieldId`}
                  name="isDeductible"
                  className="m-0"
                >
                  <Switch
                    size="small"
                    checkedChildren={<CheckOutlined />}
                    unCheckedChildren={<CloseOutlined />}
                  />
                </Form.Item>
              </div>
              <div className="h-[54px] w-full flex items-center gap-1">
                <span className="text-xs text-gray-900 font-medium flex items-center gap-1">
                  <Popover
                    content={
                      <div className="w-72">
                        Annual Leave can be calculated increamentally per year.
                        for example per <span className="font-bold">2</span>{' '}
                        years of employement,{' '}
                        <span className="font-bold">1</span> more day of leave
                        is added.
                      </div>
                    }
                  >
                    <InfoCircleOutlined className="text-gray-500" />
                  </Popover>
                  Incremental
                </span>
                <Form.Item
                  id={`TypesAndPoliciesIsDeductableFieldId`}
                  name="isIncremental"
                  className="m-0"
                >
                  <Switch
                    size="small"
                    disabled={isFixed}
                    checkedChildren={<CheckOutlined />}
                    unCheckedChildren={<CloseOutlined />}
                  />
                </Form.Item>
              </div>
            </div>
            <div>
              {isIncremental && (
                <div className="flex gap-4 mt-2 w-full">
                  <Form.Item
                    name="incrementalYear"
                    rules={[{ required: isIncremental, message: 'Required' }]}
                    className="m-0"
                  >
                    <InputNumber
                      min={1}
                      placeholder="Year"
                      className="h-[40px] w-full"
                    />
                  </Form.Item>
                  <Form.Item
                    name="incrementAmount"
                    rules={[{ required: true, message: 'Required' }]}
                    className="m-0"
                  >
                    <InputNumber
                      min={1}
                      placeholder="Entitled Days"
                      className="h-[40px] w-full"
                    />
                  </Form.Item>
                </div>
              )}
              {isIncremental && (
                <div className="text-[11px] text-gray-500 mt-1 mb-4 flex items-center gap-1">
                  <InfoCircleOutlined className="text-gray-500" />
                  Every <b>{incrementalYear || '__'}</b> years add{' '}
                  <b>{incrementalDays || '__'}</b> additional day(s)
                </div>
              )}
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
              />
            </Form.Item>
            <Form.Item
              label="Accrual Rule"
              id={`TypesAndPoliciesActualRuleFieldId`}
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
                  <MdKeyboardArrowDown size={16} className="text-gray-900" />
                }
                options={accrualRuleOptions()}
              />
            </Form.Item>
            <Form.Item
              label="Carry-Over Rule"
              id={`TypesAndPoliciesRuleCarryOverFieldldId`}
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
                className="w-full h-36 px-5 mt-2.5"
                placeholder="Input description"
                rows={6}
              />
            </Form.Item>
            <Form.Item
              label={
                <span>
                  Convertible to cash
                  <Popover
                    content={
                      <div style={{ maxWidth: 300 }}>
                        This leave balance can be converted into cash based on
                        your company&apos;s policy.
                        <br />
                        The amount is calculated daily.
                      </div>
                    }
                  >
                    <span style={{ marginLeft: 6, cursor: 'pointer' }}>
                      <InfoCircleOutlined style={{ color: '#888' }} />
                    </span>
                  </Popover>
                </span>
              }
              id="TypesAndPoliciesConvertibleToCashFieldId"
              name="convertableToCash"
            >
              <Switch defaultChecked={false} />
            </Form.Item>
          </Space.Compact>
        </Form>
      </CustomDrawerLayout>
    )
  );
};

export default TypesAndPoliciesSidebar;
