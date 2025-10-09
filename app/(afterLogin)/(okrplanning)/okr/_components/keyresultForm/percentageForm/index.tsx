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
    <div className="relative bg-gray-50 rounded-xl border-none p-3 sm:p-4 md:p-6 mb-4">
      {/* Remove button */}
      <button
        onClick={() => removeKeyResult(index)}
        title="Remove Key Result"
        aria-label="Remove Key Result"
        className="absolute top-2 right-2 bg-[#2B3CF1] hover:bg-[#1d2bb8] text-white rounded-full w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center shadow transition-colors"
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
        form={form}
        initialValues={{
          ...keyItem,
          initialValue:
            keyItem.initialValue === 0 ? undefined : keyItem.initialValue,
          targetValue:
            keyItem.targetValue === 0 ? undefined : keyItem.targetValue,
        }}
        layout="vertical"
      >
        {/* Desktop Layout */}
        <div
          className={`${isMobile ? 'hidden' : 'flex'} flex-col gap-3 mt-4 px-2 md:px-4`}
        >
          {/* Row 1: Key Result fields */}
          <div className="flex flex-col lg:flex-row gap-2 items-stretch lg:items-center">
            <Form.Item
              className="flex-1 mb-0"
              name="title"
              rules={[
                { required: true, message: 'Please enter the Key Result name' },
              ]}
              id={`key-result-title-${index}`}
            >
              <Input
                value={keyItem.title || ''}
                onChange={(e) =>
                  updateKeyResult(index, 'title', e.target.value)
                }
                placeholder="Key Result Name"
                className="h-10 md:h-11 rounded-lg text-base"
                aria-label="Key Result Name"
              />
            </Form.Item>
            <div className="flex gap-2 flex-wrap lg:flex-nowrap">
              <Form.Item
                className="flex-1 lg:w-40 xl:w-48 mb-0 min-w-[180px]"
                rules={[
                  {
                    required: true,
                    message: 'Please select a Key Result type',
                  },
                ]}
                id={`metric-type-${index}`}
              >
                <Select
                  className="w-full h-10 md:h-11 rounded-lg text-base"
                  popupClassName="text-base"
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
                  <Option value="" disabled>
                    Select metric type
                  </Option>
                  {metrics?.items?.map((metric) => (
                    <Option key={metric?.id} value={metric?.id}>
                      {metric?.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                className="w-20 md:w-24 mb-0"
                name="weight"
                rules={[
                  {
                    required: true,
                    message: 'Please enter the weight as a Percentage',
                  },
                ]}
                id={`key-result-weight-${index}`}
              >
                <InputNumber
                  className="w-full h-10 md:h-11 rounded-lg text-base"
                  min={0}
                  max={100}
                  suffix="%"
                  value={keyItem.weight}
                  onChange={(value) => updateKeyResult(index, 'weight', value)}
                  aria-label="Weight"
                />
              </Form.Item>
              <Form.Item
                className="flex-1 lg:w-40 xl:w-48 mb-0 min-w-[140px]"
                name={`dead_line_${index}`}
                rules={[
                  { required: true, message: 'Please select a deadline' },
                ]}
                id={`key-result-deadline-${index}`}
              >
                <DatePicker
                  className="w-full h-10 md:h-11 rounded-lg text-base"
                  popupClassName="text-base"
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
          </div>
          {/* Row 2: Percentage inputs */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pl-3 md:pl-4">
            <Form.Item
              className="flex-1 sm:max-w-xs mb-0"
              name="initialValue"
              rules={[
                { required: true, message: 'Please enter the initial value' },
              ]}
            >
              <InputNumber
                className="w-full h-10 md:h-11 rounded-lg text-base"
                min={0}
                max={100}
                placeholder="Initial Value (%)"
                value={
                  keyItem.initialValue === 0 ? undefined : keyItem.initialValue
                }
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
              className="flex-1 sm:max-w-xs mb-0"
              name="targetValue"
              rules={[
                { required: true, message: 'Please enter the target value' },
              ]}
            >
              <InputNumber
                className="w-full h-10 md:h-11 rounded-lg text-base"
                min={0}
                max={100}
                placeholder="Target Value (%)"
                value={
                  keyItem.targetValue === 0 ? undefined : keyItem.targetValue
                }
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
        {/* Mobile Layout */}
        <div
          className={`${isMobile ? 'flex' : 'hidden'} flex-col gap-3 mt-2 sm:mt-4 px-1 sm:px-2`}
        >
          {/* Row 1: Key Result Name */}
          <Form.Item
            className="mb-0"
            name="title"
            rules={[
              { required: true, message: 'Please enter the Key Result name' },
            ]}
            id={`key-result-title-mobile-${index}`}
          >
            <Input
              value={keyItem.title || ''}
              onChange={(e) => updateKeyResult(index, 'title', e.target.value)}
              placeholder="Key Result Name"
              className="h-10 sm:h-11 rounded-lg text-sm sm:text-base"
              aria-label="Key Result Name"
            />
          </Form.Item>
          {/* Row 2: Type (full width on mobile) */}
          <Form.Item
            className="mb-0"
            rules={[
              { required: true, message: 'Please select a Key Result type' },
            ]}
            id={`metric-type-mobile-${index}`}
          >
            <Select
              className="w-full h-10 sm:h-11 rounded-lg text-sm sm:text-base"
              popupClassName="text-base"
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
              <Option value="" disabled>
                Select metric type
              </Option>
              {metrics?.items?.map((metric) => (
                <Option key={metric?.id} value={metric?.id}>
                  {metric?.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          {/* Row 3: Weight and Deadline */}
          <div className="flex gap-2">
            <Form.Item
              className="flex-1 mb-0"
              name="weight"
              rules={[
                {
                  required: true,
                  message: 'Weight required',
                },
              ]}
              id={`key-result-weight-mobile-${index}`}
            >
              <InputNumber
                className="w-full h-10 sm:h-11 rounded-lg text-sm sm:text-base"
                min={0}
                max={100}
                suffix="%"
                value={keyItem.weight}
                onChange={(value) => updateKeyResult(index, 'weight', value)}
                aria-label="Weight"
              />
            </Form.Item>
            <Form.Item
              className="flex-1 mb-0"
              name={`dead_line_${index}`}
              rules={[{ required: true, message: 'Deadline required' }]}
              id={`key-result-deadline-mobile-${index}`}
            >
              <DatePicker
                className="w-full h-10 sm:h-11 rounded-lg text-sm sm:text-base"
                popupClassName="text-base"
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
          {/* Row 4: Initial Value and Target Value */}
          <div className="flex flex-col xs:flex-row gap-3 sm:gap-4 pl-2 sm:pl-3">
            <Form.Item
              className="flex-1 mb-0"
              name="initialValue"
              rules={[{ required: true, message: 'Initial value required' }]}
            >
              <InputNumber
                className="w-full h-10 sm:h-11 rounded-lg text-sm sm:text-base"
                min={0}
                max={100}
                placeholder="Initial Value (%)"
                value={
                  keyItem.initialValue === 0 ? undefined : keyItem.initialValue
                }
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
              rules={[{ required: true, message: 'Target value required' }]}
            >
              <InputNumber
                className="w-full h-10 sm:h-11 rounded-lg text-sm sm:text-base"
                min={0}
                max={100}
                placeholder="Target Value (%)"
                value={
                  keyItem.targetValue === 0 ? undefined : keyItem.targetValue
                }
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
