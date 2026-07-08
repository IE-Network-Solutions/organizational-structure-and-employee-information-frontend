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
import TimerOffOutlinedIcon from '@mui/icons-material/TimerOffOutlined';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import UpdateIcon from '@mui/icons-material/Update';
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
  AttendanceRuleLetterTemplate,
  AttendanceRuleType,
  AttendanceRuleTypes,
} from '@/types/timesheet/attendance';
import React, { useEffect, useMemo, useState } from 'react';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import TextEditor from '@/components/form/textEditor';
import dayjs from 'dayjs';

type StepType = 1 | 2 | 3;
type TemplateAudience = 'management' | 'nonManagement';

const templateAudienceButtonClass = (isActive: boolean) =>
  `rounded-md px-6 py-2 text-sm font-medium transition-colors ${
    isActive
      ? 'bg-[#2155CD] text-white'
      : 'border border-gray-200 bg-white text-gray-600 hover:border-gray-300'
  }`;

const createDefaultLetterTemplates = (
  ruleType?: AttendanceRuleType | string,
  ruleName?: string,
  actionTypes?: string | string[],
): AttendanceRuleLetterTemplate[] => {
  const defaultTemplate = getDefaultLetterTemplate(
    ruleType,
    ruleName,
    actionTypes,
  );

  return [
    { template: defaultTemplate, isManagementTemplate: true },
    { template: defaultTemplate, isManagementTemplate: false },
  ];
};

const normalizeLetterTemplates = (
  templates: AttendanceRuleLetterTemplate[] | undefined,
  ruleType?: AttendanceRuleType | string,
  ruleName?: string,
  actionTypes?: string | string[],
): AttendanceRuleLetterTemplate[] => {
  const defaultTemplate = getDefaultLetterTemplate(
    ruleType,
    ruleName,
    actionTypes,
  );

  if (!templates?.length) {
    return createDefaultLetterTemplates(ruleType, ruleName, actionTypes);
  }

  const managementTemplate = templates.find(
    (item) => item.isManagementTemplate,
  );
  const nonManagementTemplate = templates.find(
    (item) => !item.isManagementTemplate,
  );

  return [
    {
      template: managementTemplate?.template || defaultTemplate,
      isManagementTemplate: true,
    },
    {
      template: nonManagementTemplate?.template || defaultTemplate,
      isManagementTemplate: false,
    },
  ];
};

const getActiveTemplateIndex = (audience: TemplateAudience) =>
  audience === 'management' ? 0 : 1;

const letterTemplatesValidator = (
  rule: unknown,
  value?: AttendanceRuleLetterTemplate[],
) => {
  const templates = normalizeLetterTemplates(value);
  const hasManagement = templates.some(
    (item) => item.isManagementTemplate && item.template?.trim(),
  );
  const hasNonManagement = templates.some(
    (item) => !item.isManagementTemplate && item.template?.trim(),
  );

  if (!hasManagement || !hasNonManagement) {
    return Promise.reject(
      new Error('Both Management and Non Management templates are required'),
    );
  }

  return Promise.resolve();
};

const ACTION_TYPE_OPTIONS = [
  {
    label: 'Warning Letter',
    value: AttendanceActionType.WARNING_LETTER,
    dataCy:
      'time-attendance-settings-attendance-rules-create-rule-sidebar-action-type-warning-letter-label',
  },
  {
    label: 'Reprimand',
    value: AttendanceActionType.REPRIMAND,
    dataCy:
      'time-attendance-settings-attendance-rules-create-rule-sidebar-action-type-reprimand-label',
  },
  {
    label: 'Salary Deduction',
    value: AttendanceActionType.SALARY_DEDUCTION,
    dataCy:
      'time-attendance-settings-attendance-rules-create-rule-sidebar-action-type-salary-deduction-label',
  },
  {
    label: 'VP Deduction',
    value: AttendanceActionType.VP_DEDUCTION,
    dataCy:
      'time-attendance-settings-attendance-rules-create-rule-sidebar-action-type-vp-deduction-label',
  },
] as const;

const actionCheckboxGroupClassName =
  'grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 [&_.ant-checkbox-wrapper]:m-0 [&_.ant-checkbox-wrapper]:flex [&_.ant-checkbox-wrapper]:w-full [&_.ant-checkbox-wrapper]:items-center [&_.ant-checkbox-wrapper]:gap-2 [&_.ant-checkbox-wrapper]:rounded-md [&_.ant-checkbox-wrapper]:bg-[#F3F4F6] [&_.ant-checkbox-wrapper]:px-3 [&_.ant-checkbox-wrapper]:py-2 [&_.ant-checkbox-wrapper]:after:hidden';

const DEDUCTION_TYPE_OPTIONS = [
  {
    label: 'Amount in Days',
    value: false,
    dataCy:
      'time-attendance-settings-attendance-rules-create-rule-sidebar-deduction-type-amount-in-days-label',
  },
  {
    label: 'Fixed Amount',
    value: true,
    dataCy:
      'time-attendance-settings-attendance-rules-create-rule-sidebar-deduction-type-fixed-amount-label',
  },
] as const;

const deductionRadioGroupClassName =
  'grid w-full grid-cols-1 gap-3 sm:grid-cols-3 [&_.ant-radio-wrapper]:m-0 [&_.ant-radio-wrapper]:flex [&_.ant-radio-wrapper]:w-full [&_.ant-radio-wrapper]:items-center [&_.ant-radio-wrapper]:gap-2 [&_.ant-radio-wrapper]:rounded-md [&_.ant-radio-wrapper]:bg-[#F3F4F6] [&_.ant-radio-wrapper]:px-3 [&_.ant-radio-wrapper]:py-2 [&_.ant-radio-wrapper]:after:hidden';

const NUMERIC_NAVIGATION_KEYS = new Set([
  'Backspace',
  'Delete',
  'Tab',
  'Escape',
  'Enter',
  'ArrowLeft',
  'ArrowRight',
  'ArrowUp',
  'ArrowDown',
  'Home',
  'End',
]);

const blockNonNumericKeyDown = (
  event: React.KeyboardEvent<HTMLInputElement>,
) => {
  if (
    NUMERIC_NAVIGATION_KEYS.has(event.key) ||
    event.ctrlKey ||
    event.metaKey
  ) {
    return;
  }
  if (/^\d$/.test(event.key)) {
    return;
  }
  if (event.key === '.') {
    if (event.currentTarget.value.includes('.')) {
      event.preventDefault();
    }
    return;
  }
  event.preventDefault();
};

const blockNonNumericPaste = (
  event: React.ClipboardEvent<HTMLInputElement>,
) => {
  const pasted = event.clipboardData.getData('text').trim();
  if (pasted !== '' && !/^\d+(\.\d+)?$/.test(pasted)) {
    event.preventDefault();
  }
};

const parseNumericValue = (displayValue: string | undefined) => {
  if (!displayValue) return '' as unknown as number;

  const sanitized = displayValue.replace(/[^\d.]/g, '');
  const [whole = '', ...fractionalParts] = sanitized.split('.');
  const normalized =
    fractionalParts.length === 0
      ? whole
      : `${whole}.${fractionalParts.join('')}`;

  if (normalized === '' || normalized === '.') {
    return '' as unknown as number;
  }

  return Number(normalized);
};

const formatNumericValue = (value: string | number | undefined) => {
  if (value === undefined || value === null || value === '') {
    return '';
  }
  return String(value);
};

const integerInputNumberProps = {
  min: 1,
  step: 1,
  precision: 0,
  controls: false,
  inputMode: 'numeric' as const,
  parser: parseNumericValue,
  formatter: formatNumericValue,
  onKeyDown: blockNonNumericKeyDown,
  onPaste: blockNonNumericPaste,
};

const decimalAmountInputNumberProps = {
  min: 0.01,
  step: 0.01,
  controls: false,
  inputMode: 'decimal' as const,
  parser: parseNumericValue,
  formatter: formatNumericValue,
  onKeyDown: blockNonNumericKeyDown,
  onPaste: blockNonNumericPaste,
};

const integerFieldRules = (requiredMessage: string) => [
  { required: true, message: requiredMessage },
  {
    type: 'number' as const,
    min: 1,
    message: 'Enter a valid number',
  },
];

const decimalAmountFieldRules = (requiredMessage: string) => [
  { required: true, message: requiredMessage },
  {
    type: 'number' as const,
    min: 0.01,
    message: 'Enter a valid amount',
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

const normalizeActionTypes = (actionTypes?: string | string[]) => {
  const types = Array.isArray(actionTypes) ? actionTypes : [actionTypes];
  return types.filter(Boolean) as string[];
};

const isLetterAction = (actionType?: string | string[]) => {
  const types = normalizeActionTypes(actionType);
  return (
    types.includes(AttendanceActionType.WARNING_LETTER) ||
    types.includes(AttendanceActionType.REPRIMAND) ||
    types.includes(AttendanceActionType.SALARY_DEDUCTION) ||
    types.includes(AttendanceActionType.VP_DEDUCTION)
  );
};

const getActionLabel = (actionTypes?: string | string[]): string => {
  const types = normalizeActionTypes(actionTypes);
  if (types.includes(AttendanceActionType.VP_DEDUCTION)) return 'VP Deduction';
  if (types.includes(AttendanceActionType.SALARY_DEDUCTION))
    return 'Salary Deduction';
  if (types.includes(AttendanceActionType.REPRIMAND)) return 'Reprimand';
  if (types.includes(AttendanceActionType.WARNING_LETTER)) return 'Warning';
  return 'Warning';
};

const RULE_TYPE_TOPIC_BY_TYPE: Record<AttendanceRuleType, string> = {
  [AttendanceRuleType.ABSENT]: 'Absenteeism',
  [AttendanceRuleType.LATE]: 'Late Arrival',
  [AttendanceRuleType.EARLY_CLOCK_OUT]: 'Early Clock-out',
  [AttendanceRuleType.MISSED_CHECK_IN_OUT]: 'Missed Check-in/out',
  [AttendanceRuleType.BREAK]: 'Break',
};

const VP_DEDUCTION_ACTION_RULE_TYPES: AttendanceRuleType[] = [
  AttendanceRuleType.ABSENT,
  AttendanceRuleType.MISSED_CHECK_IN_OUT,
];

const shouldShowVpDeductionAction = (
  ruleType?: AttendanceRuleType | string,
  hasMissedCheckout?: boolean,
): boolean => {
  if (VP_DEDUCTION_ACTION_RULE_TYPES.includes(ruleType as AttendanceRuleType)) {
    return true;
  }
  return (
    ruleType === AttendanceRuleType.EARLY_CLOCK_OUT &&
    Boolean(hasMissedCheckout)
  );
};

const filterActionTypesForRule = (
  ruleType?: AttendanceRuleType | string,
  actionTypes?: string | string[],
  hasMissedCheckout?: boolean,
) => {
  const types = normalizeActionTypes(actionTypes);
  if (shouldShowVpDeductionAction(ruleType, hasMissedCheckout)) return types;
  return types.filter((type) => type !== AttendanceActionType.VP_DEDUCTION);
};

const shouldShowVpDeductionAmountField = (
  ruleType?: AttendanceRuleType | string,
  actionTypes?: string | string[],
  hasMissedCheckout?: boolean,
): boolean => {
  const types = normalizeActionTypes(actionTypes);
  if (!types.includes(AttendanceActionType.VP_DEDUCTION)) return false;
  return shouldShowVpDeductionAction(ruleType, hasMissedCheckout);
};

const getRuleTopic = (
  ruleType?: AttendanceRuleType | string,
  ruleName?: string,
): string => {
  if (ruleType && ruleType in RULE_TYPE_TOPIC_BY_TYPE) {
    return RULE_TYPE_TOPIC_BY_TYPE[ruleType as AttendanceRuleType];
  }
  if (ruleName) return ruleName;
  return 'Attendance';
};

const getLetterBodyParagraph = (
  ruleType?: AttendanceRuleType | string,
  actionTypes?: string | string[],
) => {
  const types = normalizeActionTypes(actionTypes);
  const isVpDeduction = types.includes(AttendanceActionType.VP_DEDUCTION);
  const vpClause = isVpDeduction
    ? ' As a result, {{vp deducted point}} VP points have been deducted.'
    : '';
  const absentVpClause = isVpDeduction
    ? ' As a result, {{vp deducted point}} VP points have been deducted for this absence.'
    : '';

  switch (ruleType) {
    case AttendanceRuleType.ABSENT:
      return `This letter serves as a formal warning for your absence from work on {{violationDates}} without prior notice or approval. In accordance with company policy, regular attendance is required.${absentVpClause}`;
    case AttendanceRuleType.LATE:
      return `This letter serves as a formal warning for your late arrival on {{violationDates}}. In accordance with company policy, punctual attendance is required.${vpClause}`;
    case AttendanceRuleType.EARLY_CLOCK_OUT:
      return `This letter serves as a formal warning for your early clock-out on {{violationDates}}. In accordance with company policy, regular attendance is required.${vpClause}`;
    case AttendanceRuleType.MISSED_CHECK_IN_OUT:
      return `This letter serves as a formal warning for your missed check-in/check-out on {{violationDates}}. In accordance with company policy, regular attendance is required.${vpClause}`;
    case AttendanceRuleType.BREAK:
      return `This letter serves as a formal warning regarding your break violation on {{violationDates}}. In accordance with company policy, break guidelines must be followed.${vpClause}`;
    default:
      return `This letter serves as a formal ${getActionLabel(actionTypes).toLowerCase()} regarding your attendance on {{violationDates}}. In accordance with company policy, regular attendance is required.${vpClause}`;
  }
};

const getLetterClosingParagraph = (ruleType?: AttendanceRuleType | string) => {
  switch (ruleType) {
    case AttendanceRuleType.ABSENT:
      return 'Repeated absenteeism may lead to further disciplinary measures. Please ensure consistent attendance moving forward.';
    case AttendanceRuleType.LATE:
      return 'Repeated late arrivals may lead to further disciplinary measures. Please ensure punctual attendance moving forward.';
    case AttendanceRuleType.EARLY_CLOCK_OUT:
      return 'Repeated early clock-outs may lead to further disciplinary measures. Please ensure consistent attendance moving forward.';
    case AttendanceRuleType.MISSED_CHECK_IN_OUT:
      return 'Repeated missed check-ins/check-outs may lead to further disciplinary measures. Please ensure consistent attendance moving forward.';
    case AttendanceRuleType.BREAK:
      return 'Repeated break violations may lead to further disciplinary measures. Please follow break guidelines moving forward.';
    default:
      return 'Repeated violations may lead to further disciplinary measures. Please ensure consistent attendance moving forward.';
  }
};

const getDefaultLetterTemplate = (
  ruleType?: AttendanceRuleType | string,
  ruleName?: string,
  actionTypes?: string | string[],
) => {
  const actionLabel = getActionLabel(actionTypes);
  const topic = getRuleTopic(ruleType, ruleName);
  const bodyParagraph = getLetterBodyParagraph(ruleType, actionTypes);
  const closingParagraph = getLetterClosingParagraph(ruleType);

  return [
    '<p>To : {{employeeName}}</p>',
    '<p>{{positionName}}</p>',
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
      return <TimerOffOutlinedIcon className="text-amber-600" />;
    case AttendanceRuleType.ABSENT:
      return <EventBusyIcon className="text-red-500" />;
    case AttendanceRuleType.EARLY_CLOCK_OUT:
      return <UpdateIcon className="text-[#1e40af]" />;
    case AttendanceRuleType.MISSED_CHECK_IN_OUT:
      return <TimerOffOutlinedIcon className="text-slate-600" />;
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
  ruleType?: AttendanceRuleType | string,
): Partial<AttendanceRule> => {
  const effectiveStartDate = values.effectiveStartDate
    ? dayjs(values.effectiveStartDate).format('YYYY-MM-DD')
    : undefined;

  const payload: Partial<AttendanceRule> = {
    name: String(values.name ?? '').trim(),
    effectiveStartDate,
    resetDays: Number(values.resetDays),
    ruleAppliedDays: Number(values.ruleAppliedDays),
    ruleType: resolveRuleTypeId(selectedTypeId) ?? selectedTypeId,
    actionTypes: filterActionTypesForRule(
      ruleType,
      values.actionTypes,
      values.hasMissedCheckout,
    ) as unknown as AttendanceActionType | string,
    description: values.description,
  };

  const breakTypeId = resolveBreakTypeId(values.breakType);
  if (isBreakRule && breakTypeId) {
    payload.breakType = breakTypeId;
  }

  const actionTypesArray = filterActionTypesForRule(
    ruleType,
    values.actionTypes,
    values.hasMissedCheckout,
  );
  if (actionTypesArray.includes(AttendanceActionType.SALARY_DEDUCTION)) {
    payload.isFixed = values.isFixed;
    if (values.isFixed) {
      payload.deductibleFixedAmount = Number(values.deductibleFixedAmount);
    } else {
      payload.deductibleSalaryDays = Number(values.deductibleSalaryDays);
    }
  }

  if (
    shouldShowVpDeductionAmountField(
      ruleType,
      values.actionTypes,
      values.hasMissedCheckout,
    )
  ) {
    payload.vpDeductionAmount = Number(values.vpDeductionAmount);
  }

  if (isLetterAction(values.actionTypes)) {
    payload.letterTemplates = normalizeLetterTemplates(
      values.letterTemplates,
    ).map((item) => ({
      template: item.template,
      isManagementTemplate: Boolean(item.isManagementTemplate),
    }));
  }

  if (values.backtrackEnabled === true) {
    payload.backtrackEnabled = true;
  }

  if (ruleType === AttendanceRuleType.EARLY_CLOCK_OUT) {
    payload.hasMissedCheckout = Boolean(values.hasMissedCheckout);
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

  const ruleOrder = [
    'LATE',
    'ABSENT',
    'EARLY_CLOCK_OUT',
    'MISSED_CHECK_IN_OUT',
  ];

  const sortedAttendanceRuleTypes = useMemo(
    () =>
      [...(attendanceRuleTypesData?.items ?? [])].sort(
        (a, b) => ruleOrder.indexOf(a.ruleType) - ruleOrder.indexOf(b.ruleType),
      ),
    [attendanceRuleTypesData?.items],
  );

  // const sortedAttendanceRuleTypes = useMemo(
  //   () =>
  //     [...(attendanceRuleTypesData?.items ?? [])].sort((a, b) =>
  //       a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }),
  //     ),
  //   [attendanceRuleTypesData?.items],
  // );

  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState<StepType>(1);
  const [selectedTypeId, setSelectedTypeId] = useState<string | null>(null);
  const hasMissedCheckout = Form.useWatch('hasMissedCheckout', form);
  const [activeTemplateAudience, setActiveTemplateAudience] =
    useState<TemplateAudience>('management');

  const selectedRule = attendanceRuleTypesData?.items?.find(
    (rule) => rule.id === selectedTypeId,
  );
  const actionTypeOptions = useMemo(
    () =>
      ACTION_TYPE_OPTIONS.filter(
        (option) =>
          option.value !== AttendanceActionType.VP_DEDUCTION ||
          shouldShowVpDeductionAction(
            selectedRule?.ruleType,
            hasMissedCheckout,
          ),
      ),
    [selectedRule?.ruleType, hasMissedCheckout],
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
        actionTypes: filterActionTypesForRule(
          matchingRule?.ruleType,
          item.actionTypes,
          item.hasMissedCheckout,
        ),
        breakType: resolveBreakTypeId(item.breakType as string | BreakType),
        isFixed: item.isFixed,
        deductibleSalaryDays: item.deductibleSalaryDays,
        deductibleFixedAmount: item.deductibleFixedAmount,
        vpDeductionAmount: item.vpDeductionAmount,
         hasMissedCheckout: item.hasMissedCheckout ?? false,
        letterTemplates: normalizeLetterTemplates(
          item.letterTemplates?.length
            ? item.letterTemplates
            : item.letterTemplate
              ? [
                  {
                    template: item.letterTemplate,
                    isManagementTemplate: false,
                  },
                ]
              : undefined,
          matchingRule?.ruleType,
          matchingRule?.name,
          item.actionTypes,
        ),
        backtrackEnabled: false,
      });
      setActiveTemplateAudience('management');
      setSelectedTypeId(ruleTypeId ?? null);
      setCurrentStep(isLetterAction(item.actionTypes) ? 3 : 2);
    }
  }, [attendanceRuleData, attendanceRuleTypesData?.items, form]);

  useEffect(() => {
    if (
      !selectedRule?.ruleType ||
      shouldShowVpDeductionAction(selectedRule.ruleType, hasMissedCheckout)
    ) {
      return;
    }

    const actionTypes = form.getFieldValue('actionTypes') || [];
    const actionTypesArray = Array.isArray(actionTypes)
      ? actionTypes
      : [actionTypes];
    if (!actionTypesArray.includes(AttendanceActionType.VP_DEDUCTION)) {
      return;
    }

    const filteredActionTypes = actionTypesArray.filter(
      (type) => type !== AttendanceActionType.VP_DEDUCTION,
    );
    form.setFieldsValue({
      actionTypes: filteredActionTypes,
      vpDeductionAmount: undefined,
    });
  }, [selectedRule?.ruleType, hasMissedCheckout, form]);

  useEffect(() => {
    if (isShow && !attendanceRuleId) {
      form.resetFields();
      setSelectedTypeId(null);
      setCurrentStep(1);
      setActiveTemplateAudience('management');
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

    if (
      shouldShowVpDeductionAmountField(
        selectedRule?.ruleType,
        actionTypesArray,
        form.getFieldValue('hasMissedCheckout'),
      )
    ) {
      fields.push('vpDeductionAmount');
    }

    return fields;
  };

  const submitRule = async () => {
    const ruleTypeId = resolveRuleTypeId(selectedTypeId);
    if (!ruleTypeId) return;

    await form.validateFields(getStepTwoFieldsToValidate());

    if (isLetterAction(form.getFieldValue('actionTypes'))) {
      await form.validateFields(['letterTemplates']);
    }

    const values = form.getFieldsValue(true);
    const payload = buildAttendanceRulePayload(
      values,
      ruleTypeId,
      !!selectedRule?.isBreak,
      selectedRule?.ruleType,
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
    setActiveTemplateAudience('management');
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
    if (isLetterAction(actionTypes)) {
      form.setFieldValue(
        'letterTemplates',
        createDefaultLetterTemplates(
          selectedRule?.ruleType,
          selectedRule?.name,
          actionTypes,
        ),
      );
      setActiveTemplateAudience('management');
    }

    setCurrentStep(3);
  };

  const renderStepOne = () => (
    <div
      id="time-attendance-settings-attendance-rules-create-rule-sidebar-type-card-container"
      data-cy="time-attendance-settings-attendance-rules-create-rule-sidebar-type-card-container"
      className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4"
    >
      {sortedAttendanceRuleTypes.map((rule) => {
        const isSelected = selectedTypeId === rule.id;
        return (
          <button
            key={rule.id}
            type="button"
            className={`rounded-xl border p-6 text-left transition-all bg-[#F3F4F6] hover:border-2 hover:border-gray-200 disabled:cursor-not-allowed disabled:opacity-50 ${isSelected ? 'border-[4px] border-gray-200' : 'border-transparent'}`}
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
              rules={integerFieldRules('Reset days is required')}
            >
              <InputNumber
                {...integerInputNumberProps}
                className={controlClass}
                placeholder="30"
                id="time-attendance-settings-attendance-rules-create-rule-sidebar-resets-in-input"
                data-cy="time-attendance-settings-attendance-rules-create-rule-sidebar-resets-in-input"
              />
            </Form.Item>
          </Col>

          <Col
            span={24}
            id="time-attendance-settings-attendance-rules-create-rule-sidebar-backtrack-col"
            data-cy="time-attendance-settings-attendance-rules-create-rule-sidebar-backtrack-col"
          >
            <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) =>
                prevValues.resetDays !== currentValues.resetDays
              }
            >
              {({ getFieldValue }) => {
                const resetDays = Number(getFieldValue('resetDays') || 0);
                const isBacktrackDisabled = !resetDays || resetDays <= 0;

                return (
                  <div
                    className="rounded-lg bg-[#F3F4F6] px-4 py-3"
                    id="time-attendance-settings-attendance-rules-create-rule-sidebar-backtrack-container"
                    data-cy="time-attendance-settings-attendance-rules-create-rule-sidebar-backtrack-container"
                  >
                    <Form.Item
                      name="backtrackEnabled"
                      valuePropName="checked"
                      initialValue={false}
                      className="mb-0"
                      id="time-attendance-settings-attendance-rules-create-rule-sidebar-backtrack-field"
                      data-cy="time-attendance-settings-attendance-rules-create-rule-sidebar-backtrack-field"
                    >
                      <Checkbox
                        disabled={isBacktrackDisabled}
                        id="time-attendance-settings-attendance-rules-create-rule-sidebar-backtrack-checkbox"
                        data-cy="time-attendance-settings-attendance-rules-create-rule-sidebar-backtrack-checkbox"
                      >
                        <div
                          className="flex flex-col"
                          id="time-attendance-settings-attendance-rules-create-rule-sidebar-backtrack-content"
                          data-cy="time-attendance-settings-attendance-rules-create-rule-sidebar-backtrack-content"
                        >
                          <span
                            className="text-sm font-normal text-gray-900"
                            data-cy="time-attendance-settings-attendance-rules-create-rule-sidebar-backtrack-label"
                          >
                            Calculate violation from the effective start date
                          </span>
                          <span
                            className="text-xs font-normal text-gray-500"
                            data-cy="time-attendance-settings-attendance-rules-create-rule-sidebar-backtrack-description"
                          >
                            Use the effective start date for violation
                            calculations.
                          </span>
                        </div>
                      </Checkbox>
                    </Form.Item>
                  </div>
                );
              }}
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

          {selectedRule?.ruleType === AttendanceRuleType.EARLY_CLOCK_OUT && (
            <Col span={24}>
              <div
                className="mb-4 rounded-lg border border-[#E8E8E8] bg-[#FAFAFA] p-4"
                id="time-attendance-settings-attendance-rules-create-rule-sidebar-missed-clockout-section"
                data-cy="time-attendance-settings-attendance-rules-create-rule-sidebar-missed-clockout-section"
              >
                <Form.Item
                  name="hasMissedCheckout"
                  valuePropName="checked"
                  className="mb-0"
                  data-cy="time-attendance-settings-attendance-rules-create-rule-sidebar-missed-clockout-field"
                >
                  <Checkbox data-cy="time-attendance-settings-attendance-rules-create-rule-sidebar-missed-clockout-checkbox">
                    <span
                      data-cy="time-attendance-settings-attendance-rules-create-rule-sidebar-missed-clockout-text"
                      className="text-sm font-medium text-[#262626]"
                    >
                      Missed Clockout
                    </span>
                  </Checkbox>
                </Form.Item>
                <p
                  data-cy="time-attendance-settings-attendance-rules-create-rule-sidebar-missed-clockout-description"
                  className="mb-0 mt-1 pl-6 text-sm text-gray-500"
                >
                  Users who have missed clock out after working hours have
                  ended.
                </p>
              </div>
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
              rules={integerFieldRules(`${dynamicLabel} is required`)}
              name="ruleAppliedDays"
            >
              <InputNumber
                {...integerInputNumberProps}
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
                  className="text-sm font-normal text-gray-900"
                >
                  Actions To Take
                </span>
              }
              required
              rules={[
                {
                  required: true,
                  message: 'At least one action is required',
                },
              ]}
              name="actionTypes"
            >
              <Checkbox.Group
                className={actionCheckboxGroupClassName}
                data-cy="time-attendance-settings-attendance-rules-create-rule-sidebar-action-type-checkbox"
              >
                {actionTypeOptions.map((option) => (
                  <Checkbox key={option.value} value={option.value}>
                    <span
                      data-cy={option.dataCy}
                      className="text-sm font-normal text-black/70"
                    >
                      {option.label}
                    </span>
                  </Checkbox>
                ))}
              </Checkbox.Group>
            </Form.Item>
          </Col>
          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.actionTypes !== currentValues.actionTypes ||
              prevValues.isFixed !== currentValues.isFixed ||
              prevValues.hasMissedCheckout !== currentValues.hasMissedCheckout
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
              const showVpDeductionField = shouldShowVpDeductionAmountField(
                selectedRule?.ruleType,
                actionTypesArray,
                getFieldValue('hasMissedCheckout'),
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
                          className={deductionRadioGroupClassName}
                          data-cy="time-attendance-settings-attendance-rules-create-rule-sidebar-deduction-type-radio"
                        >
                          {DEDUCTION_TYPE_OPTIONS.map((option) => (
                            <Radio
                              key={String(option.value)}
                              value={option.value}
                            >
                              <span
                                data-cy={option.dataCy}
                                className="text-sm font-normal text-black/70"
                              >
                                {option.label}
                              </span>
                            </Radio>
                          ))}
                        </Radio.Group>
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
                        rules={integerFieldRules(
                          'Deductible amount is required',
                        )}
                        name="deductibleSalaryDays"
                      >
                        <InputNumber
                          {...integerInputNumberProps}
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
                        rules={decimalAmountFieldRules(
                          'Fixed amount is required',
                        )}
                        name="deductibleFixedAmount"
                      >
                        <InputNumber
                          {...decimalAmountInputNumberProps}
                          className={controlClass}
                          placeholder="Add the fixed amount of money to be deducted"
                          id="time-attendance-settings-attendance-rules-create-rule-sidebar-fixed-amount-input"
                          data-cy="time-attendance-settings-attendance-rules-create-rule-sidebar-fixed-amount-input"
                        />
                      </Form.Item>
                    </Col>
                  )}
                  {showVpDeductionField && (
                    <Col span={24}>
                      <Form.Item
                        label={
                          <span
                            data-cy="time-attendance-settings-attendance-rules-create-rule-sidebar-vp-deduction-amount-label"
                            className="text-sm font-normal text-gray-900 pr-1"
                          >
                            VP Deduction Amount
                          </span>
                        }
                        rules={decimalAmountFieldRules(
                          'VP deduction amount is required',
                        )}
                        name="vpDeductionAmount"
                      >
                        <InputNumber
                          {...decimalAmountInputNumberProps}
                          className={controlClass}
                          placeholder="Add the VP points to be deducted"
                          id="time-attendance-settings-attendance-rules-create-rule-sidebar-vp-deduction-amount-input"
                          data-cy="time-attendance-settings-attendance-rules-create-rule-sidebar-vp-deduction-amount-input"
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
    const letterTemplates = normalizeLetterTemplates(
      form.getFieldValue('letterTemplates'),
      selectedRule?.ruleType,
      selectedRule?.name,
      actionTypes,
    );
    const activeTemplate =
      letterTemplates[getActiveTemplateIndex(activeTemplateAudience)]
        ?.template ?? '';

    const updateActiveTemplate = (html: string) => {
      const currentTemplates = normalizeLetterTemplates(
        form.getFieldValue('letterTemplates'),
        selectedRule?.ruleType,
        selectedRule?.name,
        actionTypes,
      );
      const index = getActiveTemplateIndex(activeTemplateAudience);
      currentTemplates[index] = {
        ...currentTemplates[index],
        template: html,
      };
      form.setFieldValue('letterTemplates', currentTemplates);
    };

    return (
      <>
        <StepHeader currentStep={currentStep} />
        {letterAction ? (
          <>
            <div
              className="mb-4 flex justify-center gap-3"
              id="time-attendance-settings-attendance-rules-create-rule-sidebar-template-audience-toggle"
              data-cy="time-attendance-settings-attendance-rules-create-rule-sidebar-template-audience-toggle"
            >
              <button
                type="button"
                className={templateAudienceButtonClass(
                  activeTemplateAudience === 'management',
                )}
                onClick={() => setActiveTemplateAudience('management')}
                id="time-attendance-settings-attendance-rules-create-rule-sidebar-template-management-button"
                data-cy="time-attendance-settings-attendance-rules-create-rule-sidebar-template-management-button"
              >
                Management
              </button>
              <button
                type="button"
                className={templateAudienceButtonClass(
                  activeTemplateAudience === 'nonManagement',
                )}
                onClick={() => setActiveTemplateAudience('nonManagement')}
                id="time-attendance-settings-attendance-rules-create-rule-sidebar-template-non-management-button"
                data-cy="time-attendance-settings-attendance-rules-create-rule-sidebar-template-non-management-button"
              >
                Non Management
              </button>
            </div>
            <Form.Item
              name="letterTemplates"
              rules={[{ validator: letterTemplatesValidator }]}
              hidden
            />
            <div
              id="time-attendance-settings-attendance-rules-create-rule-sidebar-statement-editor-item"
              data-cy="time-attendance-settings-attendance-rules-create-rule-sidebar-statement-editor-item"
            >
              <TextEditor
                key={activeTemplateAudience}
                value={activeTemplate}
                onChange={updateActiveTemplate}
                placeholder="Write letter template..."
              />
            </div>
          </>
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
