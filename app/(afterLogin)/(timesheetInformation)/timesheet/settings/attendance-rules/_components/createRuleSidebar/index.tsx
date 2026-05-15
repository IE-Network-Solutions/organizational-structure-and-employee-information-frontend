import { useTimesheetSettingsStore } from '@/store/uistate/features/timesheet/settings';
import {
  Button,
  Checkbox,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Radio,
  Row,
  Skeleton,
  Tooltip,
} from 'antd';
import CustomLabel from '@/components/form/customLabel/customLabel';
import TimerIcon from '@mui/icons-material/Timer';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import UpdateIcon from '@mui/icons-material/Update';
import TimerOffIcon from '@mui/icons-material/TimerOff';
import {
  useCreateAttendanceRule,
  useUpdateAttendanceRule,
} from '@/store/server/features/timesheet/attendanceNotificationRule/mutation';
import {
  useGetAttendanceRule,
  useGetAttendanceRuleTypes,
} from '@/store/server/features/timesheet/attendanceNotificationRule/queries';
import { useGetBreakTypes } from '@/store/server/features/timesheet/breakType/queries';
import { BreakType } from '@/types/timesheet/breakType';
import {
  AttendanceActionType,
  AttendanceRule,
  AttendanceRuleType,
  AttendanceRuleTypes,
} from '@/types/timesheet/attendance';
import React, { useEffect, useState } from 'react';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import TextEditor from '@/components/form/textEditor';
import dayjs from 'dayjs';

type StepType = 1 | 2 | 3;

const actionOptions = [
  {
    label: (
      <span
        data-cy="time-attendance-settings-attendance-rules-create-rule-sidebar-action-type-warning-letter-label"
        className="text-sm font-normal text-black opacity-70"
      >
        Warning Letter
      </span>
    ),
    value: AttendanceActionType.WARNING_LETTER,
  },
  {
    label: (
      <span
        data-cy="time-attendance-settings-attendance-rules-create-rule-sidebar-action-type-reprimand-label"
        className="text-sm font-normal text-black opacity-70"
      >
        Reprimand
      </span>
    ),
    value: AttendanceActionType.REPRIMAND,
  },
  {
    label: (
      <span
        data-cy="time-attendance-settings-attendance-rules-create-rule-sidebar-action-type-salary-deduction-label"
        className="text-sm font-normal text-black opacity-70"
      >
        Salary Deduction
      </span>
    ),
    value: AttendanceActionType.SALARY_DEDUCTION,
  },
];

const deductionTypeOptions = [
  {
    label: (
      <span
        data-cy="time-attendance-settings-attendance-rules-create-rule-sidebar-deduction-type-amount-in-days-label"
        className="text-sm font-normal text-black opacity-70"
      >
        Amount in Days
      </span>
    ),
    value: false,
  },
  {
    label: (
      <span
        data-cy="time-attendance-settings-attendance-rules-create-rule-sidebar-deduction-type-fixed-amount-label"
        className="text-sm font-normal text-black opacity-70"
      >
        Fixed Amount
      </span>
    ),
    value: true,
  },
];

/** API may return ruleType as a UUID string or a populated rule-type object. */
const resolveRuleTypeId = (
  ruleType?: string | AttendanceRuleTypes | null,
): string | undefined => {
  if (!ruleType) return undefined;
  if (typeof ruleType === 'string') return ruleType;
  if (typeof ruleType === 'object' && ruleType.id) return ruleType.id;
  return undefined;
};

/** API may return breakType as a UUID string or a populated break-type object. */
const resolveBreakTypeId = (
  breakType?: string | BreakType | null,
): string | undefined => {
  if (!breakType) return undefined;
  if (typeof breakType === 'string') return breakType;
  if (typeof breakType === 'object' && breakType.id) return breakType.id;
  return undefined;
};

const isLetterAction = (actionType?: string | string[]) => {
  const types = Array.isArray(actionType) ? actionType : [actionType];
  return (
    types.includes(AttendanceActionType.WARNING_LETTER) ||
    types.includes(AttendanceActionType.REPRIMAND) ||
    types.includes(AttendanceActionType.SALARY_DEDUCTION)
  );
};

const getDefaultLetterTemplate = (
  ruleType?: AttendanceRuleType | string,
  ruleName?: string,
  actionTypes?: string | string[],
) => {
  const types = Array.isArray(actionTypes) ? actionTypes : [actionTypes];
  const actionLabel = types.includes(AttendanceActionType.REPRIMAND)
    ? 'Reprimand'
    : 'Warning';
  const topic =
    ruleName ??
    (ruleType === AttendanceRuleType.ABSENT
      ? 'Absenteeism'
      : ruleType === AttendanceRuleType.LATE
        ? 'Late Arrival'
        : 'Attendance');

  const bodyParagraph =
    ruleType === AttendanceRuleType.ABSENT
      ? `This letter serves as a formal warning for your absence from work on {{date}} without prior notice or approval. In accordance with company policy, regular attendance is required. As a result, VP points have been deducted for this absence.`
      : ruleType === AttendanceRuleType.LATE
        ? `This letter serves as a formal warning for your late arrival on {{date}}. In accordance with company policy, punctual attendance is required.`
        : `This letter serves as a formal ${actionLabel.toLowerCase()} regarding your attendance on {{date}}. In accordance with company policy, regular attendance is required.`;

  const closingParagraph =
    ruleType === AttendanceRuleType.ABSENT
      ? 'Repeated absenteeism may lead to further disciplinary measures. Please ensure consistent attendance moving forward.'
      : 'Repeated violations may lead to further disciplinary measures. Please ensure consistent attendance moving forward.';

  return [
    '<p>Dear {{employeeName}},</p>',
    `<p><strong>Subject: ${actionLabel} – ${topic}</strong></p>`,
    `<p>${bodyParagraph}</p>`,
    `<p>${closingParagraph}</p>`,
    '<p><br></p>',
    '<p>Sincerely,</p>',
    '<p>Binyam Tekle</p>',
    '<p>People Manager</p>',
    '<p><br></p>',
    '<p>Cc</p>',
    '<p>Personal file</p>',
  ].join('');
};

const getIcon = (ruleType: AttendanceRuleType) => {
  switch (ruleType) {
    case AttendanceRuleType.LATE:
      return <TimerIcon className="text-amber-600" />;
    case AttendanceRuleType.ABSENT:
      return <EventBusyIcon className="text-red-500" />;
    case AttendanceRuleType.EARLY_CLOCK_OUT:
      return <UpdateIcon className="text-[#1e40af]" />;
    case AttendanceRuleType.MISSED_CHECK_IN_OUT:
      return <TimerOffIcon className="text-slate-600" />;
    case AttendanceRuleType.BREAK:
      return <EventBusyIcon className="text-slate-600" />;
    default:
      return null;
  }
};

const StepHeader = ({ currentStep }: { currentStep: StepType }) => {
  if (currentStep === 1) return null;
  const isStatementStep = currentStep === 3;

  return (
    <div
      className="mb-6 px-4 hidden sm:block"
      id="time-attendance-settings-attendance-rules-create-rule-sidebar-step-header"
      data-cy="time-attendance-settings-attendance-rules-create-rule-sidebar-step-header"
    >
      <div
        id="time-attendance-settings-attendance-rules-create-rule-sidebar-step-header-indicator"
        data-cy="time-attendance-settings-attendance-rules-create-rule-sidebar-step-header-indicator"
        className="flex items-center justify-center"
      >
        <div
          id="time-attendance-settings-attendance-rules-create-rule-sidebar-step-header-indicator-circle"
          data-cy="time-attendance-settings-attendance-rules-create-rule-sidebar-step-header-indicator-circle"
          className="w-3 h-3 rounded-full bg-[#1D4ED8]"
        />
        <div
          id="time-attendance-settings-attendance-rules-create-rule-sidebar-step-header-indicator-line"
          data-cy="time-attendance-settings-attendance-rules-create-rule-sidebar-step-header-indicator-line"
          className={`w-[190px] h-[2px] ${isStatementStep ? 'bg-[#1D4ED8]' : 'bg-gray-300'}`}
        />
        <div
          id="time-attendance-settings-attendance-rules-create-rule-sidebar-step-header-indicator-circle"
          data-cy="time-attendance-settings-attendance-rules-create-rule-sidebar-step-header-indicator-circle"
          className={`w-3 h-3 rounded-full ${isStatementStep ? 'bg-[#1D4ED8]' : 'bg-gray-400'}`}
        />
      </div>
      <div
        id="time-attendance-settings-attendance-rules-create-rule-sidebar-step-header-label"
        data-cy="time-attendance-settings-attendance-rules-create-rule-sidebar-step-header-label"
        className="mt-2 flex justify-center gap-[140px] text-[26px] sm:text-base"
      >
        <span
          id="time-attendance-settings-attendance-rules-create-rule-sidebar-step-header-label-basic-details"
          data-cy="time-attendance-settings-attendance-rules-create-rule-sidebar-step-header-label-basic-details"
          className="text-[#1D4ED8]"
        >
          Basic Details
        </span>
        <span
          id="time-attendance-settings-attendance-rules-create-rule-sidebar-step-header-label-statement"
          data-cy="time-attendance-settings-attendance-rules-create-rule-sidebar-step-header-label-statement"
          className={isStatementStep ? 'text-[#1D4ED8]' : 'text-gray-500'}
        >
          Statement
        </span>
      </div>
    </div>
  );
};

const buildAttendanceRulePayload = (
  values: Record<string, any>,
  selectedTypeId: string,
  isBreakRule: boolean,
): Partial<AttendanceRule> => {
  const effectiveStartDate = values.effectiveStartDate
    ? dayjs(values.effectiveStartDate).startOf('day').toISOString()
    : undefined;

  const payload: Partial<AttendanceRule> = {
    name: String(values.name ?? '').trim(),
    effectiveStartDate,
    resetDays: Number(values.resetDays),
    ruleAppliedDays: Number(values.ruleAppliedDays),
    ruleType: resolveRuleTypeId(selectedTypeId) ?? selectedTypeId,
    actionTypes: values.actionTypes,
    description: values.description,
  };

  const breakTypeId = resolveBreakTypeId(values.breakType);
  if (isBreakRule && breakTypeId) {
    payload.breakType = breakTypeId;
  }

  const actionTypesArray = Array.isArray(values.actionTypes)
    ? values.actionTypes
    : [values.actionTypes];
  if (actionTypesArray.includes(AttendanceActionType.SALARY_DEDUCTION)) {
    payload.isFixed = values.isFixed;
    if (values.isFixed) {
      payload.deductibleFixedAmount = Number(values.deductibleFixedAmount);
    } else {
      payload.deductibleSalaryDays = Number(values.deductibleSalaryDays);
    }
  }

  if (isLetterAction(values.actionTypes)) {
    payload.letterTemplate = values.letterTemplate;
  }

  return payload;
};

const CreateRuleSidebar = () => {
  const {
    isShowCreateRuleSidebar: isShow,
    setIsShowCreateRuleSidebar: setIsShow,
    attendanceRuleId,
    setAttendanceRuleId,
  } = useTimesheetSettingsStore();

  const {
    data: attendanceRuleData,
    isFetching,
    refetch,
  } = useGetAttendanceRule(attendanceRuleId ?? '');
  const {
    mutate: createAttendanceRule,
    isLoading: isCreating,
    isSuccess: isCreateSuccess,
  } = useCreateAttendanceRule();
  const {
    mutate: updateAttendanceRule,
    isLoading: isUpdating,
    isSuccess: isUpdateSuccess,
  } = useUpdateAttendanceRule();
  const { data: attendanceRuleTypesData } = useGetAttendanceRuleTypes();
  const { data: breakTypesData } = useGetBreakTypes();

  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState<StepType>(1);
  const [selectedTypeId, setSelectedTypeId] = useState<string | null>(null);

  const selectedRule = attendanceRuleTypesData?.items?.find(
    (rule) => rule.id === selectedTypeId,
  );
  const breakTypeOptions =
    breakTypesData?.items?.map((breakType) => ({
      label: (
        <span
          data-cy="time-attendance-settings-attendance-rules-create-rule-sidebar-break-type-label"
          className="text-sm font-normal text-black opacity-70"
        >
          {breakType.title}
        </span>
      ),
      value: breakType.id as string,
    })) ?? [];

  useEffect(() => {
    if (attendanceRuleId) {
      refetch();
      setCurrentStep(2);
    }
  }, [attendanceRuleId, refetch]);

  useEffect(() => {
    if (attendanceRuleData?.item) {
      const item = attendanceRuleData.item;
      const ruleTypeId = resolveRuleTypeId(
        item.ruleType as string | AttendanceRuleTypes,
      );
      const matchingRule = attendanceRuleTypesData?.items?.find(
        (rule) => rule.id === ruleTypeId,
      );
      form.setFieldsValue({
        name: item.name,
        effectiveStartDate: item.effectiveStartDate
          ? dayjs(item.effectiveStartDate)
          : undefined,
        resetDays: item.resetDays,
        ruleAppliedDays: item.ruleAppliedDays,
        actionTypes: item.actionTypes,
        breakType: resolveBreakTypeId(item.breakType as string | BreakType),
        isFixed: item.isFixed,
        deductibleSalaryDays: item.deductibleSalaryDays,
        deductibleFixedAmount: item.deductibleFixedAmount,
        letterTemplate:
          item.letterTemplate ||
          (isLetterAction(item.actionTypes)
            ? getDefaultLetterTemplate(
                matchingRule?.ruleType,
                matchingRule?.name,
                item.actionTypes,
              )
            : undefined),
      });
      setSelectedTypeId(ruleTypeId ?? null);
      setCurrentStep(isLetterAction(item.actionTypes) ? 3 : 2);
    }
  }, [attendanceRuleData, attendanceRuleTypesData?.items, form]);

  useEffect(() => {
    if (isShow && !attendanceRuleId) {
      form.resetFields();
      setSelectedTypeId(null);
      setCurrentStep(1);
    }
  }, [isShow, attendanceRuleId, form]);

  useEffect(() => {
    if (isCreateSuccess || isUpdateSuccess) {
      onClose();
    }
  }, [isCreateSuccess, isUpdateSuccess]);

  const itemClass = 'w-full font-semibold text-xs';
  const controlClass =
    'h-[40px] w-full text-sm font-normal text-black opacity-70';
  const isPending = isFetching || isCreating || isUpdating;

  const getStepTwoFieldsToValidate = () => {
    const fields = [
      'name',
      'effectiveStartDate',
      'resetDays',
      'ruleAppliedDays',
      'actionTypes',
    ];

    if (selectedRule?.isBreak) {
      fields.push('breakType');
    }

    const actionTypes = form.getFieldValue('actionTypes') || [];
    const actionTypesArray = Array.isArray(actionTypes)
      ? actionTypes
      : [actionTypes];
    if (actionTypesArray.includes(AttendanceActionType.SALARY_DEDUCTION)) {
      fields.push('isFixed');
      if (form.getFieldValue('isFixed') === true) {
        fields.push('deductibleFixedAmount');
      }
      if (form.getFieldValue('isFixed') === false) {
        fields.push('deductibleSalaryDays');
      }
    }

    return fields;
  };

  const submitRule = async () => {
    const ruleTypeId = resolveRuleTypeId(selectedTypeId);
    if (!ruleTypeId) return;

    await form.validateFields(getStepTwoFieldsToValidate());

    if (isLetterAction(form.getFieldValue('actionTypes'))) {
      await form.validateFields(['letterTemplate']);
    }

    const values = form.getFieldsValue(true);
    const payload = buildAttendanceRulePayload(
      values,
      ruleTypeId,
      !!selectedRule?.isBreak,
    );

    if (attendanceRuleId) {
      updateAttendanceRule({ id: attendanceRuleId, ...payload });
      return;
    }

    createAttendanceRule(payload);
  };

  const onFinish = () => {
    void submitRule();
  };

  const onClose = () => {
    form.resetFields();
    setSelectedTypeId(null);
    setCurrentStep(1);
    setAttendanceRuleId(null);
    setIsShow(false);
  };

  const handleContinueFromType = () => {
    if (!selectedTypeId) return;
    setCurrentStep(2);
  };

  const handleContinueFromBasicDetail = async () => {
    await form.validateFields(getStepTwoFieldsToValidate());

    const actionTypes = form.getFieldValue('actionTypes');
    if (isLetterAction(actionTypes) && !form.getFieldValue('letterTemplate')) {
      form.setFieldValue(
        'letterTemplate',
        getDefaultLetterTemplate(
          selectedRule?.ruleType,
          selectedRule?.name,
          actionTypes,
        ),
      );
    }

    setCurrentStep(3);
  };

  const renderStepOne = () => (
    <div
      id="time-attendance-settings-attendance-rules-create-rule-sidebar-type-card-container"
      data-cy="time-attendance-settings-attendance-rules-create-rule-sidebar-type-card-container"
      className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4"
    >
      {attendanceRuleTypesData?.items?.map((rule) => {
        const isSelected = selectedTypeId === rule.id;
        return (
          <button
            key={rule.id}
            type="button"
            className={`rounded-xl border p-6 text-left transition-all bg-[#F3F4F6] hover:border-2 hover:border-gray-200 disabled:cursor-not-allowed disabled:opacity-50 ${isSelected ? 'border-2 border-gray-200' : 'border-transparent'}`}
            onClick={() => setSelectedTypeId(rule.id)}
            id={`time-attendance-settings-attendance-rules-create-rule-sidebar-type-card-${rule.id}`}
            data-cy={`time-attendance-settings-attendance-rules-create-rule-sidebar-type-card-${rule.id}`}
          >
            <div
              id="time-attendance-settings-attendance-rules-create-rule-sidebar-type-card-icon"
              data-cy="time-attendance-settings-attendance-rules-create-rule-sidebar-type-card-icon"
              className="flex items-center justify-center mb-4 [&_.MuiSvgIcon-root]:text-[32px] [&_.MuiSvgIcon-root]:w-8 [&_.MuiSvgIcon-root]:h-8 "
            >
              {getIcon(rule.ruleType as AttendanceRuleType)}
            </div>
            <div
              id="time-attendance-settings-attendance-rules-create-rule-sidebar-type-card-name"
              data-cy="time-attendance-settings-attendance-rules-create-rule-sidebar-type-card-name"
              className="text-base font-bold text-black opacity-70 text-center"
            >
              {rule.name}
            </div>
            <div
              id="time-attendance-settings-attendance-rules-create-rule-sidebar-type-card-description"
              data-cy="time-attendance-settings-attendance-rules-create-rule-sidebar-type-card-description"
              className="mt-3 text-center text-sm font-normal text-black opacity-70 text-wrap"
            >
              {rule.description}
            </div>
          </button>
        );
      })}
    </div>
  );

  const renderStepTwo = () => {
    const dynamicLabel = selectedRule
      ? `Days of ${selectedRule.name}`
      : 'Days Absent';

    return (
      <>
        <StepHeader currentStep={currentStep} />
        <Row
          gutter={[16, 16]}
          id="time-attendance-settings-attendance-rules-create-rule-sidebar-form-row"
          data-cy="time-attendance-settings-attendance-rules-create-rule-sidebar-form-row"
        >
          <Col span={24}>
            <Form.Item
              label={
                <span
                  data-cy="time-attendance-settings-attendance-rules-create-rule-sidebar-rule-name-label"
                  className="text-sm font-normal text-gray-900 pr-1"
                >
                  Rule Name
                </span>
              }
              id="createRuleNameFieldId"
              data-cy="time-attendance-settings-attendance-rules-create-rule-sidebar-title-field-id"
              rules={[{ required: true, message: 'Rule name is required' }]}
              name="name"
            >
              <Input
                className={controlClass}
                placeholder="Input"
                id="time-attendance-settings-attendance-rules-create-rule-sidebar-title-input"
                data-cy="time-attendance-settings-attendance-rules-create-rule-sidebar-title-input"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label={
                <span
                  data-cy="time-attendance-settings-attendance-rules-create-rule-sidebar-effective-start-date-label"
                  className="text-sm font-normal text-gray-900 pr-1"
                >
                  Effective Start Date
                </span>
              }
              name="effectiveStartDate"
              rules={[
                { required: true, message: 'Effective start date is required' },
              ]}
            >
              <DatePicker
                className={controlClass}
                placeholder="YYYY-MM-DD"
                format="YYYY-MM-DD"
                id="time-attendance-settings-attendance-rules-create-rule-sidebar-effective-start-date"
                data-cy="time-attendance-settings-attendance-rules-create-rule-sidebar-effective-start-date"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label={
                <span
                  data-cy="time-attendance-settings-attendance-rules-create-rule-sidebar-resets-in-label"
                  className="text-sm font-normal text-gray-900 pr-1 inline-flex items-center gap-1"
                >
                  Resets in (days)
                  <Tooltip title="Add the number of days after which the rule will reset.">
                    <InfoOutlined
                      sx={{ fontSize: 16 }}
                      className="text-gray-400"
                    />
                  </Tooltip>
                </span>
              }
              name="resetDays"
              rules={[{ required: true, message: 'Reset days is required' }]}
            >
              <InputNumber
                min={1}
                className={controlClass}
                placeholder="30"
                id="time-attendance-settings-attendance-rules-create-rule-sidebar-resets-in-input"
                data-cy="time-attendance-settings-attendance-rules-create-rule-sidebar-resets-in-input"
              />
            </Form.Item>
          </Col>

          {selectedRule?.isBreak && (
            <Col span={24}>
              <Form.Item
                label={
                  <span
                    data-cy="time-attendance-settings-attendance-rules-create-rule-sidebar-break-type-label"
                    className="text-sm font-normal text-gray-900 pr-1"
                  >
                    Break Type
                  </span>
                }
                rules={[{ required: true, message: 'Break type is required' }]}
                name="breakType"
              >
                <Radio.Group
                  options={breakTypeOptions}
                  data-cy="time-attendance-settings-attendance-rules-create-rule-sidebar-break-type-select"
                />
              </Form.Item>
            </Col>
          )}

          <Col span={24}>
            <Form.Item
              label={
                <span
                  data-cy="time-attendance-settings-attendance-rules-create-rule-sidebar-days-set-label"
                  className="text-sm font-normal text-gray-900 pr-1 inline-flex items-center gap-1"
                >
                  {dynamicLabel}
                  <Tooltip
                    title={`Add the number of days the rule will be applied.`}
                  >
                    <InfoOutlined
                      sx={{ fontSize: 16 }}
                      className="text-gray-400"
                    />
                  </Tooltip>
                </span>
              }
              rules={[
                { required: true, message: `${dynamicLabel} is required` },
              ]}
              name="ruleAppliedDays"
            >
              <InputNumber
                min={1}
                className={controlClass}
                placeholder="Input"
                id="time-attendance-settings-attendance-rules-create-rule-sidebar-days-set-input"
                data-cy="time-attendance-settings-attendance-rules-create-rule-sidebar-days-set-input"
              />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              label={
                <span
                  data-cy="time-attendance-settings-attendance-rules-create-rule-sidebar-action-to-take-label"
                  className="text-sm font-normal text-gray-900 pr-1"
                >
                  Action To Take
                </span>
              }
              rules={[
                {
                  required: true,
                  message: 'At least one action is required',
                },
              ]}
              name="actionTypes"
            >
              <Checkbox.Group
                options={actionOptions}
                data-cy="time-attendance-settings-attendance-rules-create-rule-sidebar-action-type-checkbox"
              />
            </Form.Item>
          </Col>
          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.actionTypes !== currentValues.actionTypes ||
              prevValues.isFixed !== currentValues.isFixed
            }
          >
            {({ getFieldValue }) => {
              const actionTypesValue = getFieldValue('actionTypes') || [];
              const actionTypesArray = Array.isArray(actionTypesValue)
                ? actionTypesValue
                : [actionTypesValue];
              const isFixed = getFieldValue('isFixed');
              const showSalaryDeductionFields = actionTypesArray.includes(
                AttendanceActionType.SALARY_DEDUCTION,
              );
              const showAmountInDays =
                showSalaryDeductionFields && isFixed === false;
              const showFixedAmount =
                showSalaryDeductionFields && isFixed === true;

              return (
                <>
                  {showSalaryDeductionFields && (
                    <Col span={24}>
                      <Form.Item
                        label={
                          <span
                            data-cy="time-attendance-settings-attendance-rules-create-rule-sidebar-deduction-type-label"
                            className="text-sm font-normal text-gray-900 pr-1"
                          >
                            Deduction Type
                          </span>
                        }
                        rules={[
                          {
                            required: true,
                            message: 'Deduction type is required',
                          },
                        ]}
                        name="isFixed"
                      >
                        <Radio.Group
                          options={deductionTypeOptions}
                          data-cy="time-attendance-settings-attendance-rules-create-rule-sidebar-deduction-type-radio"
                        />
                      </Form.Item>
                    </Col>
                  )}
                  {showAmountInDays && (
                    <Col span={24}>
                      <Form.Item
                        label={
                          <span
                            data-cy="time-attendance-settings-attendance-rules-create-rule-sidebar-deductible-amount-in-days-label"
                            className="text-sm font-normal text-gray-900 pr-1"
                          >
                            Deductible Amount in Days
                          </span>
                        }
                        rules={[
                          {
                            required: true,
                            message: 'Deductible amount is required',
                          },
                        ]}
                        name="deductibleSalaryDays"
                      >
                        <InputNumber
                          min={1}
                          className={controlClass}
                          placeholder="Add the number of days"
                          id="time-attendance-settings-attendance-rules-create-rule-sidebar-deductible-amount-in-days-input"
                          data-cy="time-attendance-settings-attendance-rules-create-rule-sidebar-deductible-amount-in-days-input"
                        />
                      </Form.Item>
                    </Col>
                  )}
                  {showFixedAmount && (
                    <Col span={24}>
                      <Form.Item
                        label={
                          <span
                            data-cy="time-attendance-settings-attendance-rules-create-rule-sidebar-fixed-amount-label"
                            className="text-sm font-normal text-gray-900 pr-1"
                          >
                            Fixed amount to be deducted
                          </span>
                        }
                        rules={[
                          {
                            required: true,
                            message: 'Fixed amount is required',
                          },
                        ]}
                        name="deductibleFixedAmount"
                      >
                        <InputNumber
                          min={1}
                          className={controlClass}
                          placeholder="Add the fixed amount of money to be deducted"
                          id="time-attendance-settings-attendance-rules-create-rule-sidebar-fixed-amount-input"
                          data-cy="time-attendance-settings-attendance-rules-create-rule-sidebar-fixed-amount-input"
                        />
                      </Form.Item>
                    </Col>
                  )}
                </>
              );
            }}
          </Form.Item>
          <Col span={24}>
            <Form.Item
              label={
                <span
                  data-cy="time-attendance-settings-attendance-rules-create-rule-sidebar-description-label"
                  className="text-sm font-normal text-gray-900 pr-1"
                >
                  Description
                </span>
              }
              name="description"
            >
              <Input.TextArea
                className={controlClass}
                placeholder="Textarea"
                id="time-attendance-settings-attendance-rules-create-rule-sidebar-description-textarea"
                data-cy="time-attendance-settings-attendance-rules-create-rule-sidebar-description-textarea"
              />
            </Form.Item>
          </Col>
        </Row>
      </>
    );
  };

  const renderStepThree = () => {
    const actionTypes = form.getFieldValue('actionTypes');
    const letterAction = isLetterAction(actionTypes);

    return (
      <>
        <StepHeader currentStep={currentStep} />
        {letterAction ? (
          <Form.Item
            name="letterTemplate"
            rules={[{ required: true, message: 'Letter template is required' }]}
            id="time-attendance-settings-attendance-rules-create-rule-sidebar-statement-editor-item"
            data-cy="time-attendance-settings-attendance-rules-create-rule-sidebar-statement-editor-item"
          >
            <TextEditor placeholder="Write letter template..." />
          </Form.Item>
        ) : (
          <p
            id="time-attendance-settings-attendance-rules-create-rule-sidebar-statement-review-text"
            data-cy="time-attendance-settings-attendance-rules-create-rule-sidebar-statement-review-text"
            className="text-sm text-gray-600 px-1"
          >
            Review your rule details and click{' '}
            {attendanceRuleId ? 'Save' : 'Create'} to continue.
          </p>
        )}
      </>
    );
  };

  const renderFooter = () => {
    if (currentStep === 1) {
      return (
        <div
          id="time-attendance-settings-attendance-rules-create-rule-sidebar-footer-container"
          data-cy="time-attendance-settings-attendance-rules-create-rule-sidebar-footer-container"
          className="flex justify-end gap-2"
        >
          <Button type="default" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            type="primary"
            onClick={handleContinueFromType}
            disabled={!selectedTypeId}
          >
            Continue
          </Button>
        </div>
      );
    }

    if (currentStep === 2) {
      return (
        <div
          id="time-attendance-settings-attendance-rules-create-rule-sidebar-footer-container"
          data-cy="time-attendance-settings-attendance-rules-create-rule-sidebar-footer-container"
          className="flex justify-end gap-2"
        >
          <Button
            type="default"
            onClick={() => setCurrentStep(1)}
            disabled={isPending}
          >
            Back
          </Button>
          <Button
            type="primary"
            onClick={handleContinueFromBasicDetail}
            disabled={isPending}
          >
            Continue
          </Button>
        </div>
      );
    }

    return (
      <div
        id="time-attendance-settings-attendance-rules-create-rule-sidebar-footer-container"
        data-cy="time-attendance-settings-attendance-rules-create-rule-sidebar-footer-container"
        className="flex justify-end gap-2"
      >
        <Button
          type="default"
          onClick={() => setCurrentStep(2)}
          disabled={isPending}
        >
          Back
        </Button>
        <Button
          type="primary"
          onClick={() => form.submit()}
          loading={isPending}
          id="time-attendance-settings-attendance-rules-create-rule-sidebar-submit-button"
          data-cy="time-attendance-settings-attendance-rules-create-rule-sidebar-create-button"
        >
          {attendanceRuleId ? 'Save' : 'Create'}
        </Button>
      </div>
    );
  };

  return (
    isShow && (
      <Modal
        open={isShow}
        onCancel={onClose}
        title={
          <div
            className="text-lg font-semibold text-[#4d4d4d]"
            id="time-attendance-settings-attendance-rules-create-rule-sidebar-header-container"
            data-cy="time-attendance-settings-attendance-rules-create-rule-sidebar-header-container"
          >
            Attendance Rule
          </div>
        }
        footer={renderFooter()}
        data-cy="time-attendance-settings-attendance-rules-create-rule-sidebar"
        zIndex={10002}
        centered
        width={660}
      >
        <Skeleton
          loading={isPending && !!attendanceRuleId}
          active
          data-cy="time-attendance-settings-attendance-rules-create-rule-sidebar-spin"
        >
          <Form
            layout="vertical"
            requiredMark={CustomLabel}
            autoComplete="off"
            form={form}
            preserve
            className={itemClass}
            onFinish={onFinish}
            id="time-attendance-settings-attendance-rules-create-rule-sidebar-form"
            data-cy="time-attendance-settings-attendance-rules-create-rule-sidebar-form"
          >
            <div
              data-cy="time-attendance-settings-attendance-rules-create-rule-sidebar-step-one"
              className={currentStep === 1 ? 'block' : 'hidden'}
            >
              {renderStepOne()}
            </div>
            <div
              data-cy="time-attendance-settings-attendance-rules-create-rule-sidebar-step-two"
              className={currentStep === 2 ? 'block' : 'hidden'}
            >
              {renderStepTwo()}
            </div>
            <div
              data-cy="time-attendance-settings-attendance-rules-create-rule-sidebar-step-three"
              className={currentStep === 3 ? 'block' : 'hidden'}
            >
              {renderStepThree()}
            </div>
          </Form>
        </Skeleton>
      </Modal>
    )
  );
};

export default CreateRuleSidebar;
