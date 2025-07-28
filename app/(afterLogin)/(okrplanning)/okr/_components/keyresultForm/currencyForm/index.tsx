import React from 'react';
import { Form, InputNumber, DatePicker, Select, Input } from 'antd';
import { OKRFormProps } from '@/store/uistate/features/okrplanning/okr/interface';
import { useGetMetrics } from '@/store/server/features/okrplanning/okr/metrics/queries';
import { useOKRStore } from '@/store/uistate/features/okrplanning/okr';
import dayjs from 'dayjs';
import { useIsMobile } from '@/hooks/useIsMobile';

const CurrencyForm: React.FC<OKRFormProps> = ({
  keyItem,
  index,
  updateKeyResult,
  removeKeyResult,
}) => {
  const { Option } = Select;
  const [form] = Form.useForm();
  const { objectiveValue } = useOKRStore();
  const { isMobile } = useIsMobile();
  const { data: metrics } = useGetMetrics();

  return (
    <div className="relative bg-gray-50 rounded-xl border-none p-6 mb-4">
      {/* Remove button */}
      <button
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
          className={`${isMobile ? 'hidden' : 'flex'} flex-row gap-2 items-center mt-4 mx-4`}
        >
          <Form.Item
            className="flex-1 mr-2 mb-0"
            name={`key_name_${index}`}
            rules={[
              { required: true, message: 'Please enter the Key Result name' },
            ]}
            id={`key-result-name-${index}`}
          >
            <Input
              value={keyItem.title === '' ? undefined : keyItem.title}
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
            id={`key-result-select-${index}`}
          >
            <Select
              className="w-full h-10 rounded-lg text-base"
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
                Please select a metric type
              </Option>
              {metrics?.items?.map((metric) => (
                <Option key={metric?.id} value={metric?.id}>
                  {metric?.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            className="w-24 mb-0"
            name={`weight_${index}`}
            rules={[{ required: true, message: 'Please enter the weight' }]}
            id={`weight-input-${index}`}
          >
            <InputNumber
              className="w-full h-10 rounded-lg text-base"
              min={0}
              max={100}
              suffix="%"
              placeholder="100"
              value={keyItem.weight}
              onChange={(value) => updateKeyResult(index, 'weight', value)}
              aria-label="Weight"
            />
          </Form.Item>
          <Form.Item
            className="w-48 mb-0"
            name={`dead_line_${index}`}
            rules={[{ required: true, message: 'Please select a deadline' }]}
            id={`deadline-${index}`}
          >
            <DatePicker
              className="w-full h-10 rounded-lg text-base"
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
        {/* Desktop Currency input row */}
        <div
          className={`${isMobile ? 'hidden' : 'flex'} flex-row gap-4 items-center mt-4 mx-4`}
        >
          <Form.Item
            className="w-60 mb-0"
            name="initialValue"
            rules={[
              { required: true, message: 'Please enter the initial value' },
            ]}
          >
            <InputNumber
              className="w-full h-10 rounded-lg text-base"
              min={0}
              placeholder="Initial Value"
              addonAfter={<span className="text-base">$</span>}
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
            className="w-60 mb-0"
            name="targetValue"
            rules={[
              { required: true, message: 'Please enter the target value' },
            ]}
          >
            <InputNumber
              className="w-full h-10 rounded-lg text-base"
              min={0}
              placeholder="Target Value"
              addonAfter={<span className="text-base">$</span>}
              value={
                keyItem.targetValue === 0 ? undefined : keyItem.targetValue
              }
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
        <div className={`${isMobile ? 'block' : 'hidden'} space-y-4 mt-4 mx-4`}>
          {/* Row 1: Key Result Name */}
          <Form.Item
            className="mb-0"
            name={`key_name_${index}`}
            rules={[
              { required: true, message: 'Please enter the Key Result name' },
            ]}
            id={`key-result-name-mobile-${index}`}
          >
            <Input
              value={keyItem.title === '' ? undefined : keyItem.title}
              onChange={(e) => updateKeyResult(index, 'title', e.target.value)}
              placeholder="Key Result Name"
              className="h-10 rounded-lg text-base"
              aria-label="Key Result Name"
            />
          </Form.Item>
          {/* Row 2: Type, Weight, Deadline */}
          <div className="flex gap-2">
            <Form.Item
              className="w-48 mb-0"
              rules={[
                { required: true, message: 'Please select a Key Result type' },
              ]}
              id={`key-result-select-mobile-${index}`}
            >
              <Select
                className="w-full h-10 rounded-lg text-base"
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
                  Please select a metric type
                </Option>
                {metrics?.items?.map((metric) => (
                  <Option key={metric?.id} value={metric?.id}>
                    {metric?.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              className="w-24 mb-0"
              name={`weight_${index}`}
              rules={[{ required: true, message: 'Please enter the weight' }]}
              id={`weight-input-mobile-${index}`}
            >
              <InputNumber
                className="w-full h-10 rounded-lg text-base"
                min={0}
                max={100}
                suffix="%"
                placeholder="100"
                value={keyItem.weight}
                onChange={(value) => updateKeyResult(index, 'weight', value)}
                aria-label="Weight"
              />
            </Form.Item>
            <Form.Item
              className="w-32 mb-0"
              name={`dead_line_${index}`}
              rules={[{ required: true, message: 'Please select a deadline' }]}
              id={`deadline-mobile-${index}`}
            >
              <DatePicker
                className="w-full h-10 rounded-lg text-base"
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
          {/* Row 3: Initial Value and Target Value */}
          <div className="flex gap-4 pl-4">
            <Form.Item
              className="flex-1 mb-0"
              name="initialValue"
              rules={[
                { required: true, message: 'Please enter the initial value' },
              ]}
            >
              <InputNumber
                className="w-full h-10 rounded-lg text-base"
                min={0}
                placeholder="Initial Value"
                addonAfter={<span className="text-base">$</span>}
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
              rules={[
                { required: true, message: 'Please enter the target value' },
              ]}
            >
              <InputNumber
                className="w-full h-10 rounded-lg text-base"
                min={0}
                placeholder="Target Value"
                addonAfter={<span className="text-base">$</span>}
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

export default CurrencyForm;
