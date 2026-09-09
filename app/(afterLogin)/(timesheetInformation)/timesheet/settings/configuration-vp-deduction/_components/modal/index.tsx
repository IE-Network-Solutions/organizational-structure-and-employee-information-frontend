'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Checkbox,
  Col,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Skeleton,
  Switch,
  Tooltip,
} from 'antd';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import CustomDrawerFooterButton, {
  CustomDrawerFooterButtonProps,
} from '@/components/common/customDrawer/customDrawerFooterButton';
import { useTimesheetSettingsStore } from '@/store/uistate/features/timesheet/settings';
import { classNames } from '@/utils/classNames';
import {
  buildVpTimeConfigurationPayload,
  VpTimeConfigType,
} from '@/store/server/features/timesheet/vpTimeConfiguration/interface';
import {
  useCreateVpTimeConfiguration,
  useUpdateVpTimeConfiguration,
} from '@/store/server/features/timesheet/vpTimeConfiguration/mutation';
import { useGetVpTimeConfiguration } from '@/store/server/features/timesheet/vpTimeConfiguration/queries';
import { useGetAttendanceRules } from '@/store/server/features/timesheet/attendanceNotificationRule/queries';

type DeductionType = 'late_arrival' | 'early_checkout';

interface VpDeductionSectionValues {
  startTime?: number;
  endTime?: number;
  applyAdditionalRules?: boolean;
  deductibleAmount?: number;
  salaryDeductionEnabled?: boolean;
  salaryDeductionMinutes?: number;
  description?: string;
  missedClockout?: boolean;
  isAbsent?: boolean;
  attendanceRuleId?: string;
}

interface VpDeductionFormValues {
  lateArrival: VpDeductionSectionValues;
  earlyCheckout: VpDeductionSectionValues;
}

const DEFAULT_SECTION_VALUES: VpDeductionSectionValues = {
  startTime: undefined,
  endTime: undefined,
  applyAdditionalRules: false,
  deductibleAmount: undefined,
  salaryDeductionEnabled: false,
  salaryDeductionMinutes: undefined,
  description: undefined,
  missedClockout: false,
  isAbsent: false,
  attendanceRuleId: undefined,
};

const TAB_CONFIG: Record<
  DeductionType,
  {
    label: string;
    helperText: string;
    formKey: 'lateArrival' | 'earlyCheckout';
    configType: VpTimeConfigType;
  }
> = {
  late_arrival: {
    label: 'Late Arrival',
    helperText: 'VP deduction configuration for users who have arrived late',
    formKey: 'lateArrival',
    configType: VpTimeConfigType.CLOCKIN,
  },
  early_checkout: {
    label: 'Early Checkout',
    helperText:
      'VP deduction configuration for users who have Checked out Early',
    formKey: 'earlyCheckout',
    configType: VpTimeConfigType.CLOCKOUT,
  },
};

const controlClass = 'h-10 w-full';

const ConfigureVpDeductionModal = () => {
  const {
    isShowVpDeductionModal: isShow,
    setIsShowVpDeductionModal: setIsShow,
    vpDeductionConfigId,
    setVpDeductionConfigId,
  } = useTimesheetSettingsStore();

  const [form] = Form.useForm<VpDeductionFormValues>();
  const [activeTab, setActiveTab] = useState<DeductionType>('late_arrival');

  const activeFormKey = TAB_CONFIG[activeTab].formKey;
  const applyAdditionalRules = Form.useWatch(
    [activeFormKey, 'applyAdditionalRules'],
    form,
  );
  const isAbsent = Form.useWatch(['lateArrival', 'isAbsent'], form);
  const salaryDeductionEnabled = Form.useWatch(
    [activeFormKey, 'salaryDeductionEnabled'],
    form,
  );

  const isEditMode = Boolean(vpDeductionConfigId);

  const { mutate: createConfiguration, isLoading: isCreating } =
    useCreateVpTimeConfiguration();
  const { mutate: updateConfiguration, isLoading: isUpdating } =
    useUpdateVpTimeConfiguration();
  const {
    data: configData,
    isFetching: isConfigFetching,
    refetch,
  } = useGetVpTimeConfiguration(vpDeductionConfigId);
  const { data: attendanceRulesData, isLoading: isAttendanceRulesLoading } =
    useGetAttendanceRules({ page: 1, limit: 100 });

  const attendanceRuleOptions = useMemo(
    () =>
      (attendanceRulesData?.items ?? []).map((rule) => ({
        value: rule.id,
        label: rule.name,
      })),
    [attendanceRulesData?.items],
  );

  const isSaving = isCreating || isUpdating;

  useEffect(() => {
    if (applyAdditionalRules) {
      form.setFieldValue([activeFormKey, 'endTime'], undefined);
    }
  }, [applyAdditionalRules, activeFormKey, form]);

  useEffect(() => {
    if (!isAbsent) {
      form.setFieldValue(['lateArrival', 'attendanceRuleId'], undefined);
    }
  }, [isAbsent, form]);

  useEffect(() => {
    if (!salaryDeductionEnabled) {
      form.setFieldValue([activeFormKey, 'salaryDeductionMinutes'], undefined);
    }
  }, [salaryDeductionEnabled, activeFormKey, form]);

  const onClose = useCallback(() => {
    form.resetFields();
    setActiveTab('late_arrival');
    setVpDeductionConfigId(null);
    setIsShow(false);
  }, [form, setIsShow, setVpDeductionConfigId]);

  useEffect(() => {
    if (!isShow) return;

    form.setFieldsValue({
      lateArrival: { ...DEFAULT_SECTION_VALUES },
      earlyCheckout: { ...DEFAULT_SECTION_VALUES },
    });

    if (vpDeductionConfigId) {
      refetch();
    } else {
      setActiveTab('late_arrival');
    }
  }, [isShow, vpDeductionConfigId, refetch, form]);

  useEffect(() => {
    if (!isShow || !vpDeductionConfigId) return;
    const item = configData?.item ?? (configData as any) ?? null;
    if (!item || !item.configType) return;

    const isClockout = item.configType === VpTimeConfigType.CLOCKOUT;
    const tab: DeductionType = isClockout ? 'early_checkout' : 'late_arrival';
    const formKey = TAB_CONFIG[tab].formKey;

    setActiveTab(tab);
    form.setFieldsValue({
      [formKey]: {
        startTime: item.fromMinutes ?? undefined,
        endTime: item.toMinutes ?? undefined,
        applyAdditionalRules: !item.missedClockout && item.toMinutes == null,
        deductibleAmount: item.deductableAmount ?? undefined,
        salaryDeductionEnabled:
          item.salaryDeductionMinutes != null &&
          Number(item.salaryDeductionMinutes) > 0,
        salaryDeductionMinutes: item.salaryDeductionMinutes ?? undefined,
        description: item.description ?? undefined,
        missedClockout: Boolean(item.missedClockout),
        isAbsent: Boolean(item.isAbsent),
        attendanceRuleId: item.attendanceRuleId ?? undefined,
      },
    } as Partial<VpDeductionFormValues>);
  }, [configData, isShow, vpDeductionConfigId, form]);

  const handleSubmit = (values: VpDeductionFormValues) => {
    const section = values[activeFormKey] ?? {};
    const payload = buildVpTimeConfigurationPayload({
      configType: TAB_CONFIG[activeTab].configType,
      startTime: section.startTime,
      endTime: section.endTime,
      applyAdditionalRules: section.applyAdditionalRules,
      deductibleAmount: section.deductibleAmount,
      salaryDeductionEnabled: section.salaryDeductionEnabled,
      salaryDeductionMinutes: section.salaryDeductionMinutes,
      description: section.description,
      missedClockout:
        activeTab === 'early_checkout' ? section.missedClockout : false,
      isAbsent: activeTab === 'late_arrival' ? section.isAbsent : false,
      attendanceRuleId:
        activeTab === 'late_arrival' && section.isAbsent
          ? section.attendanceRuleId
          : undefined,
    });

    if (isEditMode && vpDeductionConfigId) {
      updateConfiguration(
        { id: vpDeductionConfigId, payload },
        { onSuccess: onClose },
      );
      return;
    }

    createConfiguration(payload, { onSuccess: onClose });
  };

  const footerModalItems: CustomDrawerFooterButtonProps[] = [
    {
      label: 'Back',
      key: 'back',
      className: 'h-[40px] text-sm border-1 border-[#D9D9D9] text-[#4d4d4d]',
      size: 'large',
      onClick: onClose,
      id: 'time-attendance-settings-configuration-vp-deduction-modal-back-button',
      'data-cy':
        'time-attendance-settings-configuration-vp-deduction-modal-back-button',
    },
    {
      label: 'Continue',
      key: 'continue',
      className: 'h-[40px] text-sm',
      size: 'large',
      type: 'primary',
      loading: isSaving,
      onClick: () => form.submit(),
      id: 'time-attendance-settings-configuration-vp-deduction-modal-continue-button',
      'data-cy':
        'time-attendance-settings-configuration-vp-deduction-modal-continue-button',
    },
  ];

  if (!isShow) return null;

  return (
    <Modal
      open={isShow}
      onCancel={onClose}
      title={
        <div
          id="time-attendance-settings-configuration-vp-deduction-modal-header"
          data-cy="time-attendance-settings-configuration-vp-deduction-modal-header"
        >
          <div
            data-cy="time-attendance-settings-configuration-vp-deduction-modal-title"
            className="text-lg font-semibold text-[#262626]"
          >
            Configure VP Deduction
          </div>
          <p
            data-cy="time-attendance-settings-configuration-vp-deduction-modal-subtitle"
            className="mb-0 mt-1 text-sm font-normal text-gray-500"
          >
            Configure VP deduction based on your institutions rules and
            regulations
          </p>
        </div>
      }
      footer={
        <div
          className="flex justify-end"
          id="time-attendance-settings-configuration-vp-deduction-modal-footer"
          data-cy="time-attendance-settings-configuration-vp-deduction-modal-footer"
        >
          <CustomDrawerFooterButton
            buttons={footerModalItems}
            data-cy="time-attendance-settings-configuration-vp-deduction-modal-footer-buttons"
          />
        </div>
      }
      width={640}
      zIndex={10002}
      centered
      destroyOnClose
      data-cy="time-attendance-settings-configuration-vp-deduction-modal"
    >
      <Skeleton loading={isConfigFetching && isEditMode}>
        <div
          className="mt-2"
          id="time-attendance-settings-configuration-vp-deduction-modal-content"
          data-cy="time-attendance-settings-configuration-vp-deduction-modal-content"
        >
          <div
            className="mb-2 grid grid-cols-2 gap-3"
            id="time-attendance-settings-configuration-vp-deduction-modal-tabs"
            data-cy="time-attendance-settings-configuration-vp-deduction-modal-tabs"
          >
            {(Object.keys(TAB_CONFIG) as DeductionType[]).map((tabKey) => {
              const isActive = activeTab === tabKey;
              return (
                <button
                  key={tabKey}
                  type="button"
                  disabled={isEditMode}
                  onClick={() => setActiveTab(tabKey)}
                  className={classNames(
                    'h-11 rounded-lg border text-sm font-medium transition-colors',
                    {},
                    isActive
                      ? ['border-[#1E40AF] bg-[#1E40AF] text-white']
                      : [
                          'border-[#D9D9D9] bg-white text-[#4d4d4d] hover:bg-gray-50',
                        ],
                  )}
                  id={`time-attendance-settings-configuration-vp-deduction-modal-tab-${tabKey}`}
                  data-cy={`time-attendance-settings-configuration-vp-deduction-modal-tab-${tabKey}`}
                >
                  {TAB_CONFIG[tabKey].label}
                </button>
              );
            })}
          </div>

          <p
            className="mb-5 text-center text-sm text-gray-500"
            id="time-attendance-settings-configuration-vp-deduction-modal-helper-text"
            data-cy="time-attendance-settings-configuration-vp-deduction-modal-helper-text"
          >
            {TAB_CONFIG[activeTab].helperText}
          </p>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              lateArrival: { ...DEFAULT_SECTION_VALUES },
              earlyCheckout: { ...DEFAULT_SECTION_VALUES },
            }}
            data-cy="time-attendance-settings-configuration-vp-deduction-modal-form"
          >
            <>
              <Form.Item
                label={
                  <span
                    data-cy="time-attendance-settings-configuration-vp-deduction-modal-time-range-label"
                    className="inline-flex items-center gap-1 text-sm font-normal text-gray-900"
                  >
                    Time Range in minutes
                    <Tooltip title="Define the time range in minutes for this VP deduction rule.">
                      <InfoOutlined
                        sx={{ fontSize: 16 }}
                        className="text-gray-400"
                      />
                    </Tooltip>
                  </span>
                }
                required
                data-cy="time-attendance-settings-configuration-vp-deduction-modal-time-range-field"
              >
                <Row gutter={12}>
                  <Col span={12}>
                    <Form.Item
                      name={[activeFormKey, 'startTime']}
                      rules={[
                        { required: true, message: 'Start time is required' },
                      ]}
                      className="mb-0"
                      data-cy="time-attendance-settings-configuration-vp-deduction-modal-start-time-field"
                    >
                      <InputNumber
                        className={controlClass}
                        placeholder="Start Time"
                        min={0}
                        controls={false}
                        id="time-attendance-settings-configuration-vp-deduction-modal-start-time"
                        data-cy="time-attendance-settings-configuration-vp-deduction-modal-start-time"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name={[activeFormKey, 'endTime']}
                      rules={[
                        {
                          required: !applyAdditionalRules,
                          message: 'End time is required',
                        },
                      ]}
                      className="mb-0"
                      data-cy="time-attendance-settings-configuration-vp-deduction-modal-end-time-field"
                    >
                      <InputNumber
                        className={controlClass}
                        placeholder="End time"
                        min={0}
                        controls={false}
                        disabled={applyAdditionalRules}
                        id="time-attendance-settings-configuration-vp-deduction-modal-end-time"
                        data-cy="time-attendance-settings-configuration-vp-deduction-modal-end-time"
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Form.Item>

              <Form.Item
                name={[activeFormKey, 'applyAdditionalRules']}
                valuePropName="checked"
                className="mb-4"
                data-cy="time-attendance-settings-configuration-vp-deduction-modal-apply-additional-rules-field"
              >
                <Checkbox data-cy="time-attendance-settings-configuration-vp-deduction-modal-apply-additional-rules-checkbox">
                  <span
                    data-cy="time-attendance-settings-configuration-vp-deduction-modal-apply-additional-rules-text"
                    className="text-sm text-[#262626]"
                  >
                    Apply additional rules when the time range exceeds this
                    amount.
                  </span>
                </Checkbox>
              </Form.Item>
            </>

            {activeTab === 'late_arrival' && (
              <div
                className="mb-4 rounded-lg border border-[#D9D9D9] bg-[#FAFAFA] px-4 py-3"
                data-cy="time-attendance-settings-configuration-vp-deduction-modal-is-absent-section"
              >
                <div
                  className="flex items-start justify-between gap-4"
                  data-cy="time-attendance-settings-configuration-vp-deduction-modal-is-absent-header"
                >
                  <div
                    className="min-w-0 flex-1"
                    data-cy="time-attendance-settings-configuration-vp-deduction-modal-is-absent-copy"
                  >
                    <p
                      className="mb-0 text-sm font-medium text-[#262626]"
                      data-cy="time-attendance-settings-configuration-vp-deduction-modal-is-absent-title"
                    >
                      Is Absent
                    </p>
                    <p
                      className="mb-0 mt-1 text-xs text-gray-500"
                      data-cy="time-attendance-settings-configuration-vp-deduction-modal-is-absent-description"
                    >
                      Link this late-arrival deduction to an attendance rule
                      when the employee is marked absent.
                    </p>
                  </div>
                  <Form.Item
                    name={['lateArrival', 'isAbsent']}
                    valuePropName="checked"
                    className="mb-0"
                    data-cy="time-attendance-settings-configuration-vp-deduction-modal-is-absent-field"
                  >
                    <Switch
                      data-cy="time-attendance-settings-configuration-vp-deduction-modal-is-absent-switch"
                      aria-label="Is Absent"
                    />
                  </Form.Item>
                </div>

                {isAbsent && (
                  <Form.Item
                    name={['lateArrival', 'attendanceRuleId']}
                    label={
                      <span
                        data-cy="time-attendance-settings-configuration-vp-deduction-modal-attendance-rule-label"
                        className="text-sm font-normal text-gray-900"
                      >
                        Attendance Rule
                      </span>
                    }
                    className="mb-0 mt-4"
                    rules={[
                      {
                        required: true,
                        message: 'Please select an attendance rule',
                      },
                    ]}
                    data-cy="time-attendance-settings-configuration-vp-deduction-modal-attendance-rule-field"
                  >
                    <Select
                      showSearch
                      allowClear
                      className="w-full"
                      placeholder="Select attendance rule"
                      loading={isAttendanceRulesLoading}
                      options={attendanceRuleOptions}
                      filterOption={(input, option) =>
                        (option?.label ?? '')
                          .toString()
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      id="time-attendance-settings-configuration-vp-deduction-modal-attendance-rule"
                      data-cy="time-attendance-settings-configuration-vp-deduction-modal-attendance-rule"
                    />
                  </Form.Item>
                )}
              </div>
            )}

            <Form.Item
              name={[activeFormKey, 'deductibleAmount']}
              label={
                <span
                  data-cy="time-attendance-settings-configuration-vp-deduction-modal-deductible-amount-label"
                  className="text-sm font-normal text-gray-900"
                >
                  Deductible amount
                </span>
              }
              rules={[
                { required: true, message: 'Deductible amount is required' },
              ]}
              data-cy="time-attendance-settings-configuration-vp-deduction-modal-deductible-amount-field"
            >
              <InputNumber
                className={controlClass}
                placeholder="Add the VP points to be deducted"
                min={0}
                controls={false}
                id="time-attendance-settings-configuration-vp-deduction-modal-deductible-amount"
                data-cy="time-attendance-settings-configuration-vp-deduction-modal-deductible-amount"
              />
            </Form.Item>

            <div
              className="mb-4 rounded-lg border border-[#D9D9D9] bg-[#FAFAFA] px-4 py-3"
              data-cy="time-attendance-settings-configuration-vp-deduction-modal-salary-deduction-section"
            >
              <div
                className="flex items-start justify-between gap-4"
                data-cy="time-attendance-settings-configuration-vp-deduction-modal-salary-deduction-header"
              >
                <div
                  className="min-w-0 flex-1"
                  data-cy="time-attendance-settings-configuration-vp-deduction-modal-salary-deduction-copy"
                >
                  <p
                    className="mb-0 text-sm font-medium text-[#262626]"
                    data-cy="time-attendance-settings-configuration-vp-deduction-modal-salary-deduction-title"
                  >
                    Salary Deduction by Minutes
                  </p>
                  <p
                    className="mb-0 mt-1 text-xs text-gray-500"
                    data-cy="time-attendance-settings-configuration-vp-deduction-modal-salary-deduction-description"
                  >
                    When enabled, configure how many minutes of salary to deduct
                    for this time range. VP points stay unchanged.
                  </p>
                </div>
                <Form.Item
                  name={[activeFormKey, 'salaryDeductionEnabled']}
                  valuePropName="checked"
                  className="mb-0"
                  data-cy="time-attendance-settings-configuration-vp-deduction-modal-salary-deduction-enabled-field"
                >
                  <Switch
                    data-cy="time-attendance-settings-configuration-vp-deduction-modal-salary-deduction-enabled-switch"
                    aria-label="Salary Deduction by Minutes"
                  />
                </Form.Item>
              </div>

              {salaryDeductionEnabled && (
                <Form.Item
                  name={[activeFormKey, 'salaryDeductionMinutes']}
                  label={
                    <span
                      data-cy="time-attendance-settings-configuration-vp-deduction-modal-salary-deduction-minutes-label"
                      className="text-sm font-normal text-gray-900"
                    >
                      Salary Deduction Minutes
                    </span>
                  }
                  className="mb-0 mt-4"
                  rules={[
                    {
                      required: true,
                      message: 'Salary deduction minutes are required',
                    },
                  ]}
                  data-cy="time-attendance-settings-configuration-vp-deduction-modal-salary-deduction-minutes-field"
                >
                  <InputNumber
                    className={controlClass}
                    placeholder="Minutes of salary to deduct"
                    min={0}
                    controls={false}
                    id="time-attendance-settings-configuration-vp-deduction-modal-salary-deduction-minutes"
                    data-cy="time-attendance-settings-configuration-vp-deduction-modal-salary-deduction-minutes"
                  />
                </Form.Item>
              )}
            </div>

            <Form.Item
              name={[activeFormKey, 'description']}
              label={
                <span
                  data-cy="time-attendance-settings-configuration-vp-deduction-modal-description-label"
                  className="text-sm font-normal text-gray-900"
                >
                  Description
                </span>
              }
              data-cy="time-attendance-settings-configuration-vp-deduction-modal-description-field"
            >
              <Input.TextArea
                placeholder="Textarea"
                rows={4}
                id="time-attendance-settings-configuration-vp-deduction-modal-description"
                data-cy="time-attendance-settings-configuration-vp-deduction-modal-description"
              />
            </Form.Item>
          </Form>
        </div>
      </Skeleton>
    </Modal>
  );
};

export default ConfigureVpDeductionModal;
