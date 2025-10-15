import React from 'react';
import { Form, DatePicker, Select, Input, InputNumber } from 'antd';
import { OKRFormProps } from '@/store/uistate/features/okrplanning/okr/interface';
import { useGetMetrics } from '@/store/server/features/okrplanning/okr/metrics/queries';
import { useOKRStore } from '@/store/uistate/features/okrplanning/okr';
import dayjs from 'dayjs';
import { useIsMobile } from '@/hooks/useIsMobile';

const AchieveOrNot: React.FC<OKRFormProps> = ({
  keyItem,
  index,
  updateKeyResult,
  removeKeyResult,
}) => {
  const { Option } = Select;
  const [form] = Form.useForm();
  const { objectiveValue } = useOKRStore();
  const { data: metrics } = useGetMetrics();
  const { isMobile } = useIsMobile();

  return (
    <div className="relative bg-gray-50 rounded-xl border-none md:p-6 mb-4">
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
      <Form form={form} layout="vertical" initialValues={keyItem}>
        {/* Desktop Layout */}
        <div
          className={`${isMobile ? 'hidden' : 'flex'} flex-col lg:flex-row gap-2 items-stretch lg:items-center mt-4 px-2 md:px-4`}
        >
          <Form.Item
            className="flex-1 mb-0"
            name="title"
            rules={[
              { required: true, message: 'Please enter the Key Result name' },
            ]}
            id={`key-result-name-${index}`}
          >
            <Input
              placeholder="Key Result Name"
              aria-label="Key Result Name"
              className="h-10 md:h-11 rounded-lg text-base"
              value={keyItem.title === '' ? undefined : keyItem.title}
              onChange={(e) => updateKeyResult(index, 'title', e.target.value)}
            />
          </Form.Item>
          <div className="flex gap-2 flex-wrap lg:flex-nowrap">
            <Form.Item
              className="flex-1 lg:w-40 xl:w-48 mb-0 min-w-[180px]"
              id={`select-metric-${index}`}
            >
              <Select
                className="w-full h-10 md:h-11 rounded-lg text-base"
                onChange={(value) => {
                  const selectedMetric = metrics?.items?.find(
                    (metric) => metric.id === value,
                  );
                  if (selectedMetric) {
                    updateKeyResult(index, 'metricTypeId', value);
                    updateKeyResult(index, 'key_type', selectedMetric.name);
                  }
                }}
                value={keyItem.key_type}
              >
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
                { required: true, message: 'Please enter the Weight' },
                { type: 'number', message: 'Weight must be a number' },
              ]}
              id={`weight-input-${index}`}
            >
              <InputNumber
                className="w-full h-10 md:h-11 rounded-lg text-base"
                min={0}
                max={100}
                suffix="%"
                placeholder="100"
                aria-label="Weight"
                value={keyItem.weight}
                onChange={(value) => updateKeyResult(index, 'weight', value)}
              />
            </Form.Item>
            <Form.Item
              className="flex-1 lg:w-40 xl:w-48 mb-0 min-w-[140px]"
              name={`dead_line_${index}`}
              rules={[{ required: true, message: 'Please select a deadline' }]}
              id={`deadline-picker-${index}`}
            >
              <DatePicker
                className="w-full h-10 md:h-11 rounded-lg text-base"
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
            id={`key-result-name-mobile-${index}`}
          >
            <Input
              placeholder="Key Result Name"
              aria-label="Key Result Name"
              className="h-10 sm:h-11 rounded-lg text-sm sm:text-base"
              value={keyItem.title === '' ? undefined : keyItem.title}
              onChange={(e) => updateKeyResult(index, 'title', e.target.value)}
            />
          </Form.Item>
          {/* Row 2: Type (full width on mobile) */}
          <Form.Item className="mb-0" id={`select-metric-mobile-${index}`}>
            <Select
              className="w-full h-10 sm:h-11 rounded-lg text-sm sm:text-base"
              onChange={(value) => {
                const selectedMetric = metrics?.items?.find(
                  (metric) => metric.id === value,
                );
                if (selectedMetric) {
                  updateKeyResult(index, 'metricTypeId', value);
                  updateKeyResult(index, 'key_type', selectedMetric.name);
                }
              }}
              value={keyItem.key_type}
            >
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
                { required: true, message: 'Weight required' },
                { type: 'number', message: 'Must be a number' },
              ]}
              id={`weight-input-mobile-${index}`}
            >
              <InputNumber
                className="w-full h-10 sm:h-11 rounded-lg text-sm sm:text-base"
                min={0}
                max={100}
                suffix="%"
                placeholder="100"
                aria-label="Weight"
                value={keyItem.weight}
                onChange={(value) => updateKeyResult(index, 'weight', value)}
              />
            </Form.Item>
            <Form.Item
              className="flex-1 mb-0"
              name={`dead_line_${index}`}
              rules={[{ required: true, message: 'Deadline required' }]}
              id={`deadline-picker-mobile-${index}`}
            >
              <DatePicker
                className="w-full h-10 sm:h-11 rounded-lg text-sm sm:text-base"
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
      </Form>
    </div>
  );
};

export default AchieveOrNot;
