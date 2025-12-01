import React from 'react';
import { Form, InputNumber, DatePicker, Select, Input } from 'antd';
import { OKRFormProps } from '@/store/uistate/features/okrplanning/okr/interface';
import { useGetMetrics } from '@/store/server/features/okrplanning/okr/metrics/queries';
import { useOKRStore } from '@/store/uistate/features/okrplanning/okr';
import dayjs from 'dayjs';
import { useIsMobile } from '@/hooks/useIsMobile';

const PercentageForm: React.FC<OKRFormProps> = ({
  keyItem,
  index,
  updateKeyResult,
  removeKeyResult,
}) => {
  const { Option } = Select;
  const { isMobile } = useIsMobile();
  const [form] = Form.useForm();
  const { objectiveValue } = useOKRStore();
  const { data: metrics } = useGetMetrics();

  return (
    <div
      id={`okr-percentage-form-container-${index}`}
      data-cy={`okr-percentage-form-container-${index}`}
      className="relative bg-gray-50 rounded-xl border-none p-6 mb-4"
    >
      {/* Remove button */}
      <button
        data-cy={`okr-percentage-form-remove-${index}`}
        onClick={() => removeKeyResult(index)}
        title="Remove Key Result"
        aria-label="Remove Key Result"
        className="absolute top-2 right-0 mr-2 bg-[#2B3CF1] hover:bg-[#1d2bb8] text-white rounded-full w-6 h-6 flex items-center justify-center shadow"
        style={{ zIndex: 10 }}
        id={`remove-key-result-${index}`}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M6 6L14 14M6 14L14 6"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>
      <Form
        id={`okr-percentage-form-${index}`}
        data-cy={`okr-percentage-form-${index}`}
        form={form}
        initialValues={{
          ...keyItem,
          // Keep backend-provided values as-is; show 0 instead of empty
          initialValue: keyItem.initialValue ?? 0,
          targetValue: keyItem.targetValue ?? 0,
        }}
        layout="vertical"
      >
        {/* Desktop Layout */}
        <div
          id={`okr-percentage-desktop-top-row-${index}`}
          data-cy={`okr-percentage-desktop-top-row-${index}`}
          className={`${isMobile ? 'hidden' : 'flex'} flex-row gap-2 items-center mt-4 mx-4`}
        >
          <Form.Item
            className="flex-1 mr-2 mb-0"
            name="title"
            rules={[
              { required: true, message: 'Please enter the Key Result name' },
            ]}
            id={`key-result-title-${index}`}
            data-cy={`okr-percentage-desktop-title-item-${index}`}
          >
            <Input
              id={`okr-percentage-desktop-title-input-${index}`}
              data-cy={`okr-percentage-desktop-title-input-${index}`}
              value={keyItem.title || ''}
              onChange={(e) => updateKeyResult(index, 'title', e.target.value)}
              placeholder="Key Result Name"
              className="h-10 rounded-lg text-base"
              aria-label="Key Result Name"
            />
          </Form.Item>
          <Form.Item
            className="w-48 mb-0"
            rules={[
              { required: true, message: 'Please select a Key Result type' },
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
              <Option data-cy={`okr-percentage-desktop-type-option-${index}`} value="" disabled>
                Please select a metric type
              </Option>
              {metrics?.items?.map((metric) => (
                <Option data-cy={`okr-percentage-desktop-type-option-${index}-${metric?.id}`} key={metric?.id} value={metric?.id}>
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
              aria-label="Weight"
            />
          </Form.Item>
          <Form.Item
            className="w-48 mb-0"
            name={`dead_line_${index}`}
            rules={[{ required: true, message: 'Please select a deadline' }]}
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
        {/* Desktop Percentage input row */}
        <div
          id={`okr-percentage-desktop-values-row-${index}`}
          data-cy={`okr-percentage-desktop-values-row-${index}`}
          className={`${isMobile ? 'hidden' : 'flex'} flex-row gap-4 items-center mt-4 mx-4`}
        >
          <Form.Item
            className="w-60 mb-0"
            name="initialValue"
            rules={[
              { required: true, message: 'Please enter the initial value' },
            ]}
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
            rules={[
              { required: true, message: 'Please enter the target value' },
            ]}
            data-cy={`okr-percentage-desktop-target-item-${index}`}
          >
            <InputNumber
              className="w-full h-10 rounded-lg text-base"
              data-cy={`okr-percentage-desktop-target-input-${index}`}
              min={0}
              max={100}
              placeholder="Target Value (%)"
              value={keyItem.targetValue ?? 0}
              onChange={(value) => updateKeyResult(index, 'targetValue', value)}
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
        {/* Mobile Layout */}
        <div
          id={`okr-percentage-mobile-wrapper-${index}`}
          data-cy={`okr-percentage-mobile-wrapper-${index}`}
          className={`${isMobile ? 'block' : 'hidden'} space-y-4 mt-4 mx-4`}
        >
          {/* Row 1: Key Result Name */}
          <Form.Item
            className="mb-0"
            name="title"
            rules={[
              { required: true, message: 'Please enter the Key Result name' },
            ]}
            id={`key-result-title-mobile-${index}`}
            data-cy={`okr-percentage-mobile-title-item-${index}`}
          >
            <Input
              id={`okr-percentage-mobile-title-input-${index}`}
              data-cy={`okr-percentage-mobile-title-input-${index}`}
              value={keyItem.title || ''}
              onChange={(e) => updateKeyResult(index, 'title', e.target.value)}
              placeholder="Key Result Name"
              className="h-10 rounded-lg text-base"
              aria-label="Key Result Name"
            />
          </Form.Item>
          {/* Row 2: Type, Weight, Deadline */}
          <div
            id={`okr-percentage-mobile-meta-row-${index}`}
            data-cy={`okr-percentage-mobile-meta-row-${index}`}
            className="flex gap-2"
          >
            <Form.Item
              className="w-48 mb-0"
              rules={[
                { required: true, message: 'Please select a Key Result type' },
              ]}
              id={`metric-type-mobile-${index}`}
              data-cy={`okr-percentage-mobile-type-item-${index}`}
            >
              <Select
                className="w-full h-10 rounded-lg text-base"
                popupClassName="text-base"
                data-cy={`okr-percentage-mobile-type-select-${index}`}
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
                <Option data-cy={`okr-percentage-mobile-type-option-${index}`} value="" disabled>
                  Please select a metric type
                </Option>
                {metrics?.items?.map((metric) => (
                  <Option data-cy={`okr-percentage-mobile-type-option-${index}-${metric?.id}`} key={metric?.id} value={metric?.id}>
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
              id={`key-result-weight-mobile-${index}`}
              data-cy={`okr-percentage-mobile-weight-item-${index}`}
            >
              <InputNumber
                className="w-full h-10 rounded-lg text-base"
                data-cy={`okr-percentage-mobile-weight-input-${index}`}
                min={0}
                max={100}
                suffix="%"
                value={keyItem.weight}
                onChange={(value) => updateKeyResult(index, 'weight', value)}
                aria-label="Weight"
              />
            </Form.Item>
            <Form.Item
              className="w-32 mb-0"
              name={`dead_line_${index}`}
              rules={[{ required: true, message: 'Please select a deadline' }]}
              id={`key-result-deadline-mobile-${index}`}
              data-cy={`okr-percentage-mobile-deadline-item-${index}`}
            >
              <DatePicker
                className="w-full h-10 rounded-lg text-base"
                popupClassName="text-base"
                data-cy={`okr-percentage-mobile-deadline-picker-${index}`}
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
          {/* Row 3: Initial Value and Target Value */}
          <div
            id={`okr-percentage-mobile-values-row-${index}`}
            data-cy={`okr-percentage-mobile-values-row-${index}`}
            className="flex gap-4"
          >
            <Form.Item
              className="flex-1 mb-0"
              name="initialValue"
              rules={[
                { required: true, message: 'Please enter the initial value' },
              ]}
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
              rules={[
                { required: true, message: 'Please enter the target value' },
              ]}
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
        </div>
      </Form>
    </div>
  );
};

export default PercentageForm;
