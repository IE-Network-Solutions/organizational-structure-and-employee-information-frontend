import React, { useEffect, useState } from 'react';
import {
  Button,
  Form,
  InputNumber,
  DatePicker,
  Select,
  Input,
  Tooltip,
} from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { OKRFormProps } from '@/store/uistate/features/okrplanning/okr/interface';
import { useGetMetrics } from '@/store/server/features/okrplanning/okr/metrics/queries';
import { useOKRStore } from '@/store/uistate/features/okrplanning/okr';
import dayjs from 'dayjs';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useIsBasicOkr } from '../../../_utils/okrMode';
import { isKeyResultLockedForWeightEdit } from '../../../_utils/keyResultGuards';
import {
  KeyResultFieldLabel,
  KeyResultRemoveButton,
  KeyResultSavedCard,
  KeyResultSelectedBadge,
  KEY_RESULT_TOOLTIP,
  WEIGHT_TOOLTIP,
  DEADLINE_TOOLTIP,
  ADVANCED_ROW_CLASS,
  ADVANCED_WRAPPER_CLASS,
  ADVANCED_VALUES_ROW_CLASS,
  INPUT_CLASS,
} from '../_ui';

const PercentageForm: React.FC<OKRFormProps> = ({
  keyItem,
  index,
  updateKeyResult,
  removeKeyResult,
  disableWeightEdit: disableWeightEditProp,
}) => {
  const { Option } = Select;
  const { isMobile } = useIsMobile();
  const [form] = Form.useForm();
  const { objectiveValue } = useOKRStore();
  const { data: metrics } = useGetMetrics();
  const isBasic = useIsBasicOkr();
  const disableWeightEdit =
    disableWeightEditProp ?? isKeyResultLockedForWeightEdit(keyItem);
  const [isCardView, setIsCardView] = useState(false);
  const initialValueRules = [
    { required: true, message: 'Please enter the initial value' },
    ({ getFieldValue }: { getFieldValue: (name: string) => number | undefined }) => ({
      validator(_: unknown, value: number | undefined) {
        const targetValue = getFieldValue('targetValue');
        if (
          value == null ||
          targetValue == null ||
          Number(value) <= Number(targetValue)
        ) {
          return Promise.resolve();
        }
        return Promise.reject(
          new Error('Initial value must be less than or equal to target value'),
        );
      },
    }),
  ];
  const targetValueRules = [
    { required: true, message: 'Please enter the target value' },
    ({ getFieldValue }: { getFieldValue: (name: string) => number | undefined }) => ({
      validator(_: unknown, value: number | undefined) {
        const initialValue = getFieldValue('initialValue');
        if (
          value == null ||
          initialValue == null ||
          Number(value) >= Number(initialValue)
        ) {
          return Promise.resolve();
        }
        return Promise.reject(
          new Error('Target value must be greater than or equal to initial value'),
        );
      },
    }),
  ];

  useEffect(() => {
    if (keyItem?.deadline) {
      form.setFieldsValue({ [`dead_line_${index}`]: dayjs(keyItem.deadline) });
    }
  }, [keyItem?.deadline, index, form]);

  return (
    <div
      id={`okr-percentage-form-container-${index}`}
      data-cy={`okr-percentage-form-container-${index}`}
      className={`relative mb-4 ${isBasic ? 'bg-gray-50 rounded-xl border-none p-6' : 'border border-gray-200 rounded-lg p-6'}`}
    >
      <div
        className="absolute top-2 right-2"
        style={{ zIndex: 10 }}
        data-cy={`okr-percentage-remove-wrapper-${index}`}
      >
        <KeyResultRemoveButton
          onClick={() => removeKeyResult(index)}
          title="Remove Key Result"
          aria-label="Remove Key Result"
          id={`remove-key-result-${index}`}
          data-cy={`okr-percentage-form-remove-${index}`}
        />
      </div>

      {/* Advanced mode: "You Have Selected" badge */}
      {!isBasic && (
        <KeyResultSelectedBadge
          label="Percentage"
          data-cy={`okr-percentage-selected-badge-${index}`}
        />
      )}

      <Form
        id={`okr-percentage-form-${index}`}
        data-cy={`okr-percentage-form-${index}`}
        form={form}
        initialValues={{
          ...keyItem,
          initialValue: keyItem.initialValue ?? 0,
          targetValue: keyItem.targetValue ?? 0,
          [`dead_line_${index}`]: keyItem?.deadline
            ? dayjs(keyItem.deadline)
            : undefined,
        }}
        layout="vertical"
        requiredMark={false}
      >
        {/* Desktop Layout - Basic mode */}
        {!isMobile && isBasic && (
          <>
            <div
              id={`okr-percentage-desktop-top-row-${index}`}
              data-cy={`okr-percentage-desktop-top-row-${index}`}
              className="flex flex-row gap-2 items-center mt-4 mx-4"
            >
              <Form.Item
                className="flex-1 mr-2 mb-0"
                name="title"
                rules={[
                  {
                    required: true,
                    message: 'Please enter the Key Result name',
                  },
                ]}
                id={`key-result-title-${index}`}
                data-cy={`okr-percentage-desktop-title-item-${index}`}
              >
                <Input
                  id={`okr-percentage-desktop-title-input-${index}`}
                  data-cy={`okr-percentage-desktop-title-input-${index}`}
                  value={keyItem.title || ''}
                  onChange={(e) =>
                    updateKeyResult(index, 'title', e.target.value)
                  }
                  placeholder="Key Result Name"
                  className="h-10 rounded-lg text-base"
                  aria-label="Key Result Name"
                />
              </Form.Item>
              <Form.Item
                className="w-48 mb-0"
                rules={[
                  {
                    required: true,
                    message: 'Please select a Key Result type',
                  },
                ]}
                id={`metric-type-${index}`}
                data-cy={`okr-percentage-desktop-type-item-${index}`}
              >
                <Select
                  className="w-full h-10 rounded-lg text-base"
                  popupClassName="text-base"
                  data-cy={`okr-percentage-desktop-type-select-${index}`}
                  onChange={(value) => {
                    const selectedMetric = metrics?.items?.find(
                      (metric) => metric.id === value,
                    );
                    if (selectedMetric) {
                      updateKeyResult(index, 'metricTypeId', value);
                      updateKeyResult(index, 'key_type', selectedMetric.name);
                    }
                  }}
                  value={
                    metrics?.items?.find(
                      (metric) => metric.name === keyItem.key_type,
                    )?.id || ''
                  }
                >
                  <Option
                    data-cy={`okr-percentage-desktop-type-option-${index}`}
                    value=""
                    disabled
                  >
                    Please select a metric type
                  </Option>
                  {metrics?.items?.map((metric) => (
                    <Option
                      data-cy={`okr-percentage-desktop-type-option-${index}-${metric?.id}`}
                      key={metric?.id}
                      value={metric?.id}
                    >
                      {metric?.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                className="w-24 mb-0"
                name="weight"
                rules={[
                  {
                    required: true,
                    message: 'Please enter the weight as a Percentage',
                  },
                ]}
                id={`key-result-weight-${index}`}
                data-cy={`okr-percentage-desktop-weight-item-${index}`}
              >
                <InputNumber
                  className="w-full h-10 rounded-lg text-base"
                  data-cy={`okr-percentage-desktop-weight-input-${index}`}
                  min={0}
                  max={100}
                  suffix="%"
                  value={keyItem.weight}
                  onChange={(value) => updateKeyResult(index, 'weight', value)}
                  disabled={disableWeightEdit}
                  aria-label="Weight"
                />
              </Form.Item>
              <Form.Item
                className="w-48 mb-0"
                name={`dead_line_${index}`}
                rules={[
                  { required: true, message: 'Please select a deadline' },
                ]}
                id={`key-result-deadline-${index}`}
                data-cy={`okr-percentage-desktop-deadline-item-${index}`}
              >
                <DatePicker
                  className="w-full h-10 rounded-lg text-base"
                  popupClassName="text-base"
                  data-cy={`okr-percentage-desktop-deadline-picker-${index}`}
                  value={keyItem.deadline ? dayjs(keyItem.deadline) : null}
                  format="YYYY-MM-DD"
                  disabledDate={(current) => {
                    const startOfToday = dayjs().startOf('day');
                    const objectiveDeadline = dayjs(objectiveValue?.deadline);
                    return (
                      current &&
                      (current < startOfToday || current > objectiveDeadline)
                    );
                  }}
                  onChange={(date) =>
                    updateKeyResult(
                      index,
                      'deadline',
                      date ? date.format('YYYY-MM-DD') : null,
                    )
                  }
                  aria-label="Deadline"
                />
              </Form.Item>
            </div>
            <div
              id={`okr-percentage-desktop-values-row-${index}`}
              data-cy={`okr-percentage-desktop-values-row-${index}`}
              className="flex flex-row gap-4 items-center mt-4 mx-4"
            >
              <Form.Item
                className="w-60 mb-0"
                name="initialValue"
                dependencies={['targetValue']}
                rules={initialValueRules}
                data-cy={`okr-percentage-desktop-initial-item-${index}`}
              >
                <InputNumber
                  className="w-full h-10 rounded-lg text-base"
                  data-cy={`okr-percentage-desktop-initial-input-${index}`}
                  min={0}
                  max={100}
                  placeholder="Initial Value (%)"
                  value={keyItem.initialValue ?? 0}
                  onChange={(value) =>
                    updateKeyResult(index, 'initialValue', value)
                  }
                  onKeyPress={(e) => {
                    if (
                      !/[0-9]/.test(e.key) &&
                      e.key !== 'Backspace' &&
                      e.key !== 'Delete' &&
                      e.key !== 'Tab' &&
                      e.key !== '.'
                    ) {
                      e.preventDefault();
                    }
                  }}
                />
              </Form.Item>
              <Form.Item
                className="w-60 mb-0"
                name="targetValue"
                dependencies={['initialValue']}
                rules={targetValueRules}
                data-cy={`okr-percentage-desktop-target-item-${index}`}
              >
                <InputNumber
                  className="w-full h-10 rounded-lg text-base"
                  data-cy={`okr-percentage-desktop-target-input-${index}`}
                  min={0}
                  max={100}
                  placeholder="Target Value (%)"
                  value={keyItem.targetValue ?? 0}
                  onChange={(value) =>
                    updateKeyResult(index, 'targetValue', value)
                  }
                  onKeyPress={(e) => {
                    if (
                      !/[0-9]/.test(e.key) &&
                      e.key !== 'Backspace' &&
                      e.key !== 'Delete' &&
                      e.key !== 'Tab' &&
                      e.key !== '.'
                    ) {
                      e.preventDefault();
                    }
                  }}
                />
              </Form.Item>
            </div>
          </>
        )}

        {/* Desktop Layout - Advanced mode */}
        {!isMobile && !isBasic && (
          <>
            {isCardView ? (
              <KeyResultSavedCard
                weight={keyItem.weight ?? 0}
                title={keyItem.title ?? ''}
                onEdit={() => setIsCardView(false)}
                id={`okr-percentage-desktop-saved-card-${index}`}
                data-cy={`okr-percentage-desktop-saved-card-${index}`}
              />
            ) : (
              <div
                id={`okr-percentage-desktop-top-row-${index}`}
                data-cy={`okr-percentage-desktop-top-row-${index}`}
                className={ADVANCED_WRAPPER_CLASS}
              >
                <div
                  className={`${ADVANCED_ROW_CLASS} items-end`}
                  data-cy={`okr-percentage-desktop-advanced-row-${index}`}
                >
                  <Form.Item
                    className="flex-1 mb-0"
                    name="title"
                    label={
                      <KeyResultFieldLabel
                        label="Key Result"
                        tooltip={KEY_RESULT_TOOLTIP}
                      />
                    }
                    rules={[
                      {
                        required: true,
                        message: 'Please enter the Key Result name',
                      },
                    ]}
                    id={`key-result-title-${index}`}
                    data-cy={`okr-percentage-desktop-title-item-${index}`}
                  >
                    <Input
                      id={`okr-percentage-desktop-title-input-${index}`}
                      data-cy={`okr-percentage-desktop-title-input-${index}`}
                      value={keyItem.title || ''}
                      onChange={(e) =>
                        updateKeyResult(index, 'title', e.target.value)
                      }
                      placeholder="Input"
                      className={INPUT_CLASS}
                      aria-label="Key Result Name"
                    />
                  </Form.Item>
                  <Form.Item
                    className="w-32 mb-0"
                    name="weight"
                    label={
                      <KeyResultFieldLabel
                        label="Weight"
                        tooltip={WEIGHT_TOOLTIP}
                      />
                    }
                    rules={[{ required: true, message: 'Weight required' }]}
                    id={`key-result-weight-${index}`}
                    data-cy={`okr-percentage-desktop-weight-item-${index}`}
                  >
                    <InputNumber
                      className={`w-full ${INPUT_CLASS}`}
                      data-cy={`okr-percentage-desktop-weight-input-${index}`}
                      min={0}
                      max={100}
                      suffix="%"
                      placeholder="Input"
                      value={keyItem.weight}
                      onChange={(value) =>
                        updateKeyResult(index, 'weight', value)
                      }
                      disabled={disableWeightEdit}
                      aria-label="Weight"
                    />
                  </Form.Item>
                  <Form.Item
                    className="w-44 mb-0"
                    name={`dead_line_${index}`}
                    label={
                      <KeyResultFieldLabel
                        label="Deadline"
                        tooltip={DEADLINE_TOOLTIP}
                      />
                    }
                    rules={[{ required: true, message: 'Deadline required' }]}
                    id={`key-result-deadline-${index}`}
                    data-cy={`okr-percentage-desktop-deadline-item-${index}`}
                  >
                    <DatePicker
                      className={`w-full ${INPUT_CLASS}`}
                      popupClassName="text-base"
                      data-cy={`okr-percentage-desktop-deadline-picker-${index}`}
                      placeholder="Select date"
                      value={keyItem.deadline ? dayjs(keyItem.deadline) : null}
                      format="YYYY-MM-DD"
                      disabledDate={(current) => {
                        const startOfToday = dayjs().startOf('day');
                        const objectiveDeadline = dayjs(
                          objectiveValue?.deadline,
                        );
                        return (
                          current &&
                          (current < startOfToday ||
                            current > objectiveDeadline)
                        );
                      }}
                      onChange={(date) =>
                        updateKeyResult(
                          index,
                          'deadline',
                          date ? date.format('YYYY-MM-DD') : null,
                        )
                      }
                      aria-label="Deadline"
                    />
                  </Form.Item>
                  <Form.Item
                    className="mb-0"
                    label={
                      <span
                        className="opacity-0 select-none"
                        data-cy={`okr-percentage-save-label-spacer-${index}`}
                      >
                        Save
                      </span>
                    }
                  >
                    <Button
                      type="primary"
                      className="bg-okr-primary hover:bg-blue-800 text-white h-10 rounded-lg font-medium"
                      onClick={() => {
                        form
                          .validateFields()
                          .then(() => setIsCardView(true))
                          .catch(() => {});
                      }}
                      data-cy={`okr-percentage-desktop-save-${index}`}
                    >
                      Save
                    </Button>
                  </Form.Item>
                </div>
                <div
                  id={`okr-percentage-desktop-values-row-${index}`}
                  data-cy={`okr-percentage-desktop-values-row-${index}`}
                  className={ADVANCED_VALUES_ROW_CLASS}
                >
                  <Form.Item
                    className="w-60 mb-0"
                    name="initialValue"
                    label={
                      <KeyResultFieldLabel
                        label="Initial Value"
                        tooltip="Starting percentage value"
                      />
                    }
                    dependencies={['targetValue']}
                    rules={initialValueRules}
                    data-cy={`okr-percentage-desktop-initial-item-${index}`}
                  >
                    <InputNumber
                      className={`w-full ${INPUT_CLASS}`}
                      data-cy={`okr-percentage-desktop-initial-input-${index}`}
                      min={0}
                      max={100}
                      placeholder="Input"
                      suffix="%"
                      value={keyItem.initialValue ?? 0}
                      onChange={(value) =>
                        updateKeyResult(index, 'initialValue', value)
                      }
                      onKeyPress={(e) => {
                        if (
                          !/[0-9]/.test(e.key) &&
                          e.key !== 'Backspace' &&
                          e.key !== 'Delete' &&
                          e.key !== 'Tab' &&
                          e.key !== '.'
                        ) {
                          e.preventDefault();
                        }
                      }}
                    />
                  </Form.Item>
                  <Form.Item
                    className="w-60 mb-0"
                    name="targetValue"
                    label={
                      <KeyResultFieldLabel
                        label="Target Value"
                        tooltip="Target percentage value"
                      />
                    }
                    dependencies={['initialValue']}
                    rules={targetValueRules}
                    data-cy={`okr-percentage-desktop-target-item-${index}`}
                  >
                    <InputNumber
                      className={`w-full ${INPUT_CLASS}`}
                      data-cy={`okr-percentage-desktop-target-input-${index}`}
                      min={0}
                      max={100}
                      placeholder="Input"
                      suffix="%"
                      value={keyItem.targetValue ?? 0}
                      onChange={(value) =>
                        updateKeyResult(index, 'targetValue', value)
                      }
                      onKeyPress={(e) => {
                        if (
                          !/[0-9]/.test(e.key) &&
                          e.key !== 'Backspace' &&
                          e.key !== 'Delete' &&
                          e.key !== 'Tab' &&
                          e.key !== '.'
                        ) {
                          e.preventDefault();
                        }
                      }}
                    />
                  </Form.Item>
                </div>
              </div>
            )}
          </>
        )}

        {/* Mobile Layout: card view when saved, form when editing (same UI as Currency/Numeric) */}
        {isMobile && (
          <>
            {isCardView ? (
              <div
                className="mt-4 mx-4"
                data-cy={`okr-percentage-mobile-card-wrapper-${index}`}
              >
                <div
                  id={`okr-percentage-mobile-saved-card-${index}`}
                  data-cy={`okr-percentage-mobile-saved-card-${index}`}
                  className="border border-gray-200 rounded-lg p-3 flex flex-col gap-3"
                >
                  <div
                    className="flex items-start justify-between"
                    data-cy={`okr-percentage-mobile-saved-card-header-${index}`}
                  >
                    <div
                      className="flex flex-col gap-2 flex-1 min-w-0"
                      data-cy={`okr-percentage-mobile-saved-card-content-${index}`}
                    >
                      <span
                        className="text-xs font-medium text-gray-600 border border-gray-300 rounded-md px-2.5 py-1.5 w-fit inline-block"
                        data-cy={`okr-percentage-mobile-saved-card-weight-${index}`}
                      >
                        Weight {keyItem.weight ?? 0}%
                      </span>
                      <p
                        className="text-sm font-semibold text-gray-900 truncate"
                        data-cy={`okr-percentage-mobile-saved-card-title-${index}`}
                      >
                        {keyItem.title ? (
                          keyItem.title
                        ) : (
                          <span
                            className="text-gray-400 italic"
                            data-cy={`okr-percentage-mobile-saved-card-untitled-${index}`}
                          >
                            Untitled key result
                          </span>
                        )}
                      </p>
                    </div>
                    <Tooltip title="Edit">
                      <button
                        type="button"
                        onClick={() => {
                          setIsCardView(false);
                          form.setFieldsValue({
                            title: keyItem.title,
                            weight: keyItem.weight,
                            [`dead_line_${index}`]: keyItem.deadline
                              ? dayjs(keyItem.deadline)
                              : null,
                            initialValue: keyItem.initialValue ?? 0,
                            targetValue: keyItem.targetValue ?? 0,
                          });
                        }}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-300"
                        aria-label="Edit key result"
                        data-cy={`okr-percentage-mobile-saved-card-${index}-edit`}
                      >
                        <EditOutlined className="text-xs" />
                      </button>
                    </Tooltip>
                  </div>
                  <div
                    className="flex flex-row flex-wrap gap-2 pt-1 border-t border-gray-100"
                    data-cy={`okr-percentage-mobile-saved-card-values-${index}`}
                  >
                    <span
                      className="text-xs font-medium text-gray-600 border border-gray-300 rounded-md px-2.5 py-1.5 w-fit inline-block"
                      data-cy={`okr-percentage-mobile-saved-card-initial-label-${index}`}
                    >
                      Initial Value :{' '}
                      <span
                        className="font-semibold text-gray-900"
                        data-cy={`okr-percentage-mobile-saved-card-initial-value-${index}`}
                      >
                        {Number(keyItem.initialValue ?? 0).toLocaleString()}%
                      </span>
                    </span>
                    <span
                      className="text-xs font-medium text-gray-600 border border-gray-300 rounded-md px-2.5 py-1.5 w-fit inline-block"
                      data-cy={`okr-percentage-mobile-saved-card-target-label-${index}`}
                    >
                      Target Value :{' '}
                      <span
                        className="font-semibold text-gray-900"
                        data-cy={`okr-percentage-mobile-saved-card-target-value-${index}`}
                      >
                        {Number(keyItem.targetValue ?? 0).toLocaleString()}%
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div
                id={`okr-percentage-mobile-wrapper-${index}`}
                data-cy={`okr-percentage-mobile-wrapper-${index}`}
                className="space-y-4 mt-4 mx-4"
              >
                <Form.Item
                  className="mb-0"
                  name="title"
                  label={
                    <KeyResultFieldLabel
                      label="Key Result"
                      tooltip={KEY_RESULT_TOOLTIP}
                    />
                  }
                  rules={[
                    {
                      required: true,
                      message: 'Please enter the Key Result name',
                    },
                  ]}
                  id={`key-result-title-mobile-${index}`}
                  data-cy={`okr-percentage-mobile-title-item-${index}`}
                >
                  <Input
                    id={`okr-percentage-mobile-title-input-${index}`}
                    data-cy={`okr-percentage-mobile-title-input-${index}`}
                    value={keyItem.title || ''}
                    onChange={(e) =>
                      updateKeyResult(index, 'title', e.target.value)
                    }
                    placeholder="Input"
                    className="h-10 rounded-lg text-base"
                    aria-label="Key Result Name"
                  />
                </Form.Item>
                <div
                  id={`okr-percentage-mobile-values-row-${index}`}
                  data-cy={`okr-percentage-mobile-values-row-${index}`}
                  className="flex gap-4"
                >
                  <Form.Item
                    className="flex-1 mb-0"
                    name="initialValue"
                    label={
                      <KeyResultFieldLabel
                        label="Initial Value"
                        tooltip="Initial percentage value (0-100)"
                      />
                    }
                    dependencies={['targetValue']}
                    rules={initialValueRules}
                    data-cy={`okr-percentage-mobile-initial-item-${index}`}
                  >
                    <InputNumber
                      className="w-full h-10 rounded-lg text-base"
                      data-cy={`okr-percentage-mobile-initial-input-${index}`}
                      min={0}
                      max={100}
                      placeholder="Initial Value (%)"
                      value={keyItem.initialValue ?? 0}
                      onChange={(value) =>
                        updateKeyResult(index, 'initialValue', value)
                      }
                      onKeyPress={(e) => {
                        if (
                          !/[0-9]/.test(e.key) &&
                          e.key !== 'Backspace' &&
                          e.key !== 'Delete' &&
                          e.key !== 'Tab' &&
                          e.key !== '.'
                        ) {
                          e.preventDefault();
                        }
                      }}
                    />
                  </Form.Item>
                  <Form.Item
                    className="flex-1 mb-0"
                    name="targetValue"
                    label={
                      <KeyResultFieldLabel
                        label="Target Value"
                        tooltip="Target percentage value (0-100)"
                      />
                    }
                    dependencies={['initialValue']}
                    rules={targetValueRules}
                    data-cy={`okr-percentage-mobile-target-item-${index}`}
                  >
                    <InputNumber
                      className="w-full h-10 rounded-lg text-base"
                      data-cy={`okr-percentage-mobile-target-input-${index}`}
                      min={0}
                      max={100}
                      placeholder="Target Value (%)"
                      value={keyItem.targetValue ?? 0}
                      onChange={(value) =>
                        updateKeyResult(index, 'targetValue', value)
                      }
                      onKeyPress={(e) => {
                        if (
                          !/[0-9]/.test(e.key) &&
                          e.key !== 'Backspace' &&
                          e.key !== 'Delete' &&
                          e.key !== 'Tab' &&
                          e.key !== '.'
                        ) {
                          e.preventDefault();
                        }
                      }}
                    />
                  </Form.Item>
                </div>
                <div
                  id={`okr-percentage-mobile-meta-row-${index}`}
                  data-cy={`okr-percentage-mobile-meta-row-${index}`}
                  className="flex gap-2 items-end"
                >
                  <Form.Item
                    className="flex-1 mb-0"
                    name="weight"
                    label={
                      <KeyResultFieldLabel
                        label="Weight"
                        tooltip={WEIGHT_TOOLTIP}
                      />
                    }
                    rules={[
                      {
                        required: true,
                        message: 'Please enter the weight as a Percentage',
                      },
                    ]}
                    id={`key-result-weight-mobile-${index}`}
                    data-cy={`okr-percentage-mobile-weight-item-${index}`}
                  >
                    <InputNumber
                      className="w-full h-10 rounded-lg text-base"
                      data-cy={`okr-percentage-mobile-weight-input-${index}`}
                      min={0}
                      max={100}
                      suffix="%"
                      placeholder="Input"
                      value={keyItem.weight}
                      onChange={(value) =>
                        updateKeyResult(index, 'weight', value)
                      }
                      disabled={disableWeightEdit}
                      aria-label="Weight"
                    />
                  </Form.Item>
                  <Form.Item
                    className="flex-1 mb-0"
                    name={`dead_line_${index}`}
                    label={
                      <KeyResultFieldLabel
                        label="Deadline"
                        tooltip={DEADLINE_TOOLTIP}
                      />
                    }
                    rules={[
                      { required: true, message: 'Please select a deadline' },
                    ]}
                    id={`key-result-deadline-mobile-${index}`}
                    data-cy={`okr-percentage-mobile-deadline-item-${index}`}
                  >
                    <DatePicker
                      className="w-full h-10 rounded-lg text-base"
                      popupClassName="text-base"
                      data-cy={`okr-percentage-mobile-deadline-picker-${index}`}
                      placeholder="Select date"
                      value={keyItem.deadline ? dayjs(keyItem.deadline) : null}
                      format="YYYY-MM-DD"
                      disabledDate={(current) => {
                        const startOfToday = dayjs().startOf('day');
                        const objectiveDeadline = dayjs(
                          objectiveValue?.deadline,
                        );
                        return (
                          current &&
                          (current < startOfToday ||
                            current > objectiveDeadline)
                        );
                      }}
                      onChange={(date) =>
                        updateKeyResult(
                          index,
                          'deadline',
                          date ? date.format('YYYY-MM-DD') : null,
                        )
                      }
                      aria-label="Deadline"
                    />
                  </Form.Item>
                  <Form.Item
                    className="mb-0"
                    label={
                      <span
                        className="opacity-0 select-none"
                        data-cy={`okr-percentage-save-label-spacer-${index}`}
                      >
                        Save
                      </span>
                    }
                  >
                    <Button
                      type="primary"
                      className="bg-okr-primary hover:bg-blue-800 text-white h-10 rounded-lg font-medium px-4"
                      onClick={() => {
                        form
                          .validateFields()
                          .then(() => setIsCardView(true))
                          .catch(() => {});
                      }}
                      data-cy={`okr-percentage-mobile-save-${index}`}
                    >
                      Save
                    </Button>
                  </Form.Item>
                </div>
              </div>
            )}
          </>
        )}
      </Form>
    </div>
  );
};

export default PercentageForm;
