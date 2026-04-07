import React from 'react';
import { Form, DatePicker, Select, Input, InputNumber } from 'antd';
import { OKRFormProps } from '@/store/uistate/features/okrplanning/okr/interface';
import { useGetMetrics } from '@/store/server/features/okrplanning/okr/metrics/queries';
import { useOKRStore } from '@/store/uistate/features/okrplanning/okr';
import dayjs from 'dayjs';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useIsBasicOkr } from '../../../_utils/okrMode';

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
  const isBasic = useIsBasicOkr();

  return (
    <div
      id={`okr-achieve-form-container-${index}`}
      data-cy={`okr-achieve-form-container-${index}`}
      className="relative bg-gray-50 rounded-xl border-none p-6 mb-4"
    >
      {/* Remove button */}
      <button
        data-cy={`okr-achieve-form-remove-${index}`}
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
          data-cy={`okr-achieve-form-remove-icon-${index}`}
        >
          <path
            d="M6 6L14 14M6 14L14 6"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            data-cy={`okr-achieve-form-remove-path-${index}`}
          />
        </svg>
      </button>
      <Form
        id={`okr-achieve-form-${index}`}
        data-cy={`okr-achieve-form-${index}`}
        form={form}
        layout="vertical"
        initialValues={keyItem}
      >
        {/* Desktop Layout */}
        <div
          id={`okr-achieve-desktop-top-row-${index}`}
          data-cy={`okr-achieve-desktop-top-row-${index}`}
          className={`${isMobile ? 'hidden' : 'flex'} flex-row gap-1 items-center mt-4 mx-4`}
        >
          <Form.Item
            className="flex-1 mr-2 mb-0"
            name="title"
            rules={[
              { required: true, message: 'Please enter the Key Result name' },
            ]}
            id={`key-result-name-${index}`}
            data-cy={`okr-achieve-desktop-title-item-${index}`}
          >
            <Input
              id={`okr-achieve-desktop-title-input-${index}`}
              data-cy={`okr-achieve-desktop-title-input-${index}`}
              placeholder="Key Result Name"
              aria-label="Key Result Name"
              className="h-10 rounded-lg text-base"
              value={keyItem.title === '' ? undefined : keyItem.title}
              onChange={(e) => updateKeyResult(index, 'title', e.target.value)}
            />
          </Form.Item>
          <Form.Item
            className={`w-48 mb-0 ${isBasic ? 'hidden' : ''}`}
            id={`select-metric-${index}`}
            data-cy={`okr-achieve-desktop-type-item-${index}`}
          >
            <Select
              className="w-full h-10 rounded-lg text-base"
              data-cy={`okr-achieve-desktop-type-select-${index}`}
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
                <Option
                  data-cy={`okr-achieve-desktop-type-option-${index}-${metric?.id}`}
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
              { required: true, message: 'Please enter the Weight' },
              { type: 'number', message: 'Weight must be a number' },
            ]}
            id={`weight-input-${index}`}
            data-cy={`okr-achieve-desktop-weight-item-${index}`}
          >
            <InputNumber
              className="w-full h-10 rounded-lg text-base"
              data-cy={`okr-achieve-desktop-weight-input-${index}`}
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
            className="w-48 mb-0"
            name={`dead_line_${index}`}
            rules={[{ required: true, message: 'Please select a deadline' }]}
            id={`deadline-picker-${index}`}
            data-cy={`okr-achieve-desktop-deadline-item-${index}`}
          >
            <DatePicker
              className="w-full h-10 rounded-lg text-base"
              data-cy={`okr-achieve-desktop-deadline-picker-${index}`}
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
        {/* Mobile Layout */}
        <div
          id={`okr-achieve-mobile-wrapper-${index}`}
          data-cy={`okr-achieve-mobile-wrapper-${index}`}
          className={`${isMobile ? 'block' : 'hidden'} space-y-4 mt-4 mx-4`}
        >
          {/* Row 1: Key Result Name */}
          <Form.Item
            className="mb-0"
            name="title"
            rules={[
              { required: true, message: 'Please enter the Key Result name' },
            ]}
            id={`key-result-name-mobile-${index}`}
            data-cy={`okr-achieve-mobile-title-item-${index}`}
          >
            <Input
              id={`okr-achieve-mobile-title-input-${index}`}
              data-cy={`okr-achieve-mobile-title-input-${index}`}
              placeholder="Key Result Name"
              aria-label="Key Result Name"
              className="h-10 rounded-lg text-base"
              value={keyItem.title === '' ? undefined : keyItem.title}
              onChange={(e) => updateKeyResult(index, 'title', e.target.value)}
            />
          </Form.Item>
          {/* Row 2: Type, Weight, Deadline */}
          <div
            id={`okr-achieve-mobile-meta-row-${index}`}
            data-cy={`okr-achieve-mobile-meta-row-${index}`}
            className="flex gap-2"
          >
            <Form.Item
              className={`w-48 mb-0 ${isBasic ? 'hidden' : ''}`}
              id={`select-metric-mobile-${index}`}
              data-cy={`okr-achieve-mobile-type-item-${index}`}
            >
              <Select
                className="w-full h-10 rounded-lg text-base"
                data-cy={`okr-achieve-mobile-type-select-${index}`}
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
                  <Option
                    data-cy={`okr-achieve-mobile-type-option-${index}-${metric?.id}`}
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
                { required: true, message: 'Please enter the Weight' },
                { type: 'number', message: 'Weight must be a number' },
              ]}
              id={`weight-input-mobile-${index}`}
              data-cy={`okr-achieve-mobile-weight-item-${index}`}
            >
              <InputNumber
                className="w-full h-10 rounded-lg text-base"
                data-cy={`okr-achieve-mobile-weight-input-${index}`}
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
              className="w-32 mb-0"
              name={`dead_line_${index}`}
              rules={[{ required: true, message: 'Please select a deadline' }]}
              id={`deadline-picker-mobile-${index}`}
              data-cy={`okr-achieve-mobile-deadline-item-${index}`}
            >
              <DatePicker
                className="w-full h-10 rounded-lg text-base"
                data-cy={`okr-achieve-mobile-deadline-picker-${index}`}
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
