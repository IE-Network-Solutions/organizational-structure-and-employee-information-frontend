import React from 'react';
import {
  Button,
  Input,
  DatePicker,
  Form,
  InputNumber,
  Tooltip,
  Select,
  Popconfirm,
} from 'antd';
import dayjs from 'dayjs';
import { VscClose } from 'react-icons/vsc';
import { OKRProps } from '@/store/uistate/features/okrplanning/okr/interface';
import { useOKRStore } from '@/store/uistate/features/okrplanning/okr';
import { useDeleteKeyResult } from '@/store/server/features/okrplanning/okr/objective/mutations';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useGetMetrics } from '@/store/server/features/okrplanning/okr/metrics/queries';

const PercentageView: React.FC<OKRProps> = ({
  keyValue,
  index,
  isEdit,
  form,
}) => {
  const {
    handleKeyResultChange,
    handleSingleKeyResultChange,
    removeKeyResultValue,
    objectiveValue,
  } = useOKRStore();

  const { data: metrics } = useGetMetrics();

  const handleChange = (value: any, field: string) => {
    if (isEdit) {
      handleSingleKeyResultChange(value, field);
    } else {
      handleKeyResultChange(value, index, field);
    }
  };
  const { mutate: deleteKeyResult } = useDeleteKeyResult();
  function handleKeyResultDelete(id: string) {
    deleteKeyResult(id, {
      onSuccess: () => {
        removeKeyResultValue(index);
      },
    });
  }

  // const isEditDisabled = keyValue && Number(keyValue?.progress) > 0;
  const { isMobile } = useIsMobile();
  return (
    <div
      className={`py-3 rounded-lg p-4 relative pb-6 ${isEdit ? '' : 'bg-gray-50'}`}
      id={`key-result-${index}`}
    >
      {/* Remove Button - positioned at top right */}
      {!isEdit && (
        <Tooltip title="Remove Key Result">
          <Popconfirm
            title="Are you sure you want to remove this key result?"
            onConfirm={() => handleKeyResultDelete(keyValue?.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="text"
              icon={<VscClose />}
              className="absolute top-2 right-2 rounded-full w-6 h-6 bg-[#2B3CF1] hover:bg-[#1d2bb8] text-white flex items-center justify-center p-0"
            />
          </Popconfirm>
        </Tooltip>
      )}

      <Form form={form} layout="vertical" className="space-y-1 mt-10">
        {/* Main Key Result Row - all fields in single row */}
        {/* Desktop Layout */}
        <div
          className={`${isMobile ? 'hidden' : 'flex'} items-center pb-3 px-6`}
        >
          {/* Title Input */}
          <div className="flex-1">
            <Form.Item
              className="w-full font-bold mb-0"
              rules={[
                {
                  required: true,
                  message: 'Percentage title is required',
                  validator: (notused, value) =>
                    value && value.trim() !== ''
                      ? Promise.resolve()
                      : Promise.reject(
                          new Error('Percentage title is required'),
                        ),
                },
              ]}
            >
              <Input
                id={`key-result-title-${index}`}
                value={keyValue.title || ''}
                onChange={(e) => {
                  handleChange(e.target.value, 'title');
                }}
                className="h-10 rounded-lg border-gray-300"
                placeholder="Enter percentage title"
              />
              {!keyValue.title && (
                <div className="text-red-500 font-semibold absolute top-[30px]">
                  Percentage title is required
                </div>
              )}
            </Form.Item>
          </div>

          {/* Metric Type Dropdown */}
          <div className="w-48 ml-6">
            <Form.Item
              className="w-full font-bold mb-0"
              rules={[
                {
                  required: true,
                  message: 'Please select a Key Result type',
                },
              ]}
            >
              {isEdit ? (
                <Select
                  className="w-full h-10 rounded-lg text-base"
                  placeholder="Please select a metric type"
                  value={keyValue?.metricTypeId}
                  onChange={(value) => {
                    const selectedMetric = metrics?.items?.find(
                      (metric: any) => metric.id === value,
                    );
                    if (selectedMetric) {
                      handleChange(selectedMetric, 'metricType');
                      handleChange(value, 'metricTypeId');
                    }
                  }}
                >
                  {metrics?.items?.map((metric: any) => (
                    <Select.Option key={metric?.id} value={metric?.id}>
                      {metric?.name}
                    </Select.Option>
                  ))}
                </Select>
              ) : (
                <Button
                  className="w-full h-10 rounded-lg text-base bg-gray-100 border-gray-300 text-gray-600"
                  disabled
                >
                  Percentage
                </Button>
              )}
            </Form.Item>
          </div>

          {/* Weight/Percentage */}
          <div className="w-24 ml-2">
            <Form.Item
              className="w-full font-bold mb-0"
              rules={[
                { required: true, message: 'Weight is required' },
                {
                  type: 'number',
                  min: 1,
                  max: 100,
                  message: 'Weight must be between 1 and 100',
                },
              ]}
            >
              <InputNumber
                id={`key-result-weight-${index}`}
                min={1}
                max={100}
                value={keyValue?.weight || 0}
                onChange={(value) => {
                  handleChange(value, 'weight');
                }}
                className="w-full h-10 rounded-lg border-gray-300"
                suffix="%"
              />
            </Form.Item>
          </div>

          {/* Deadline */}
          <div className="w-48 ml-2">
            <Form.Item className="w-full font-bold mb-0">
              <DatePicker
                id={`key-result-deadline-${index}`}
                value={keyValue.deadline ? dayjs(keyValue.deadline) : null}
                onChange={(dateString) => {
                  handleChange(dateString, 'deadline');
                }}
                format="YYYY-MM-DD"
                className="w-full h-10 rounded-lg border-gray-300"
                disabledDate={(current) => {
                  const startOfToday = dayjs().startOf('day');
                  const objectiveDeadline = dayjs(objectiveValue?.deadline);

                  return (
                    current &&
                    (current < startOfToday || current > objectiveDeadline)
                  );
                }}
              />
              {!keyValue.deadline && (
                <div className="text-red-500 font-semibold absolute top-[30px]">
                  Deadline is required
                </div>
              )}
            </Form.Item>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className={`${isMobile ? 'block' : 'hidden'} space-y-4 px-6`}>
          {/* Row 1: Title */}
          <Form.Item
            className="w-full font-bold mb-0"
            rules={[
              {
                required: true,
                message: 'Percentage title is required',
                validator: (notused, value) =>
                  value && value.trim() !== ''
                    ? Promise.resolve()
                    : Promise.reject(new Error('Percentage title is required')),
              },
            ]}
          >
            <Input
              id={`key-result-title-mobile-${index}`}
              value={keyValue.title || ''}
              onChange={(e) => {
                handleChange(e.target.value, 'title');
              }}
              className="h-10 rounded-lg border-gray-300"
              placeholder="Enter percentage title"
            />
            {!keyValue.title && (
              <div className="text-red-500 font-semibold absolute top-[30px]">
                Percentage title is required
              </div>
            )}
          </Form.Item>

          {/* Row 2: Type, Weight, Deadline */}
          <div className="flex gap-2">
            <Form.Item
              className="w-48 font-bold mb-0"
              rules={[
                {
                  required: true,
                  message: 'Please select a Key Result type',
                },
              ]}
            >
              {isEdit ? (
                <Select
                  className="w-full h-10 rounded-lg text-base"
                  placeholder="Please select a metric type"
                  value={keyValue?.metricTypeId}
                  onChange={(value) => {
                    const selectedMetric = metrics?.items?.find(
                      (metric: any) => metric.id === value,
                    );
                    if (selectedMetric) {
                      handleChange(selectedMetric, 'metricType');
                      handleChange(value, 'metricTypeId');
                    }
                  }}
                >
                  {metrics?.items?.map((metric: any) => (
                    <Select.Option key={metric?.id} value={metric?.id}>
                      {metric?.name}
                    </Select.Option>
                  ))}
                </Select>
              ) : (
                <Button
                  className="w-full h-10 rounded-lg text-base bg-gray-100 border-gray-300 text-gray-600"
                  disabled
                >
                  Percentage
                </Button>
              )}
            </Form.Item>

            <Form.Item
              className="w-24 font-bold mb-0"
              rules={[
                { required: true, message: 'Weight is required' },
                {
                  type: 'number',
                  min: 1,
                  max: 100,
                  message: 'Weight must be between 1 and 100',
                },
              ]}
            >
              <InputNumber
                id={`key-result-weight-mobile-${index}`}
                min={1}
                max={100}
                value={keyValue?.weight || 0}
                onChange={(value) => {
                  handleChange(value, 'weight');
                }}
                className="w-full h-10 rounded-lg border-gray-300"
                suffix="%"
              />
            </Form.Item>

            <Form.Item className="w-32 font-bold mb-0">
              <DatePicker
                id={`key-result-deadline-mobile-${index}`}
                value={keyValue.deadline ? dayjs(keyValue.deadline) : null}
                onChange={(dateString) => {
                  handleChange(dateString, 'deadline');
                }}
                format="YYYY-MM-DD"
                className="w-full h-10 rounded-lg border-gray-300"
                disabledDate={(current) => {
                  const startOfToday = dayjs().startOf('day');
                  const objectiveDeadline = dayjs(objectiveValue?.deadline);

                  return (
                    current &&
                    (current < startOfToday || current > objectiveDeadline)
                  );
                }}
              />
              {!keyValue.deadline && (
                <div className="text-red-500 font-semibold absolute top-[30px]">
                  Deadline is required
                </div>
              )}
            </Form.Item>
          </div>
        </div>

        {/* Initial and Target Values Row */}
        {/* Desktop Layout */}
        <div
          className={`${isMobile ? 'hidden' : 'flex'} gap-4 px-6`}
          style={{ maxWidth: '51%' }}
        >
          <Form.Item className="flex-1 mb-0">
            <InputNumber
              id={`key-result-initial-${index}`}
              min={0}
              max={100}
              value={keyValue?.initialValue || 0}
              onChange={(value) => {
                handleChange(value, 'initialValue');
              }}
              className="w-full h-10 rounded-lg text-base"
              placeholder="Initial Value (%)"
            />
          </Form.Item>
          <Form.Item className="flex-1 mb-0">
            <InputNumber
              id={`key-result-target-${index}`}
              min={0}
              max={100}
              value={keyValue?.targetValue || 0}
              onChange={(value) => {
                handleChange(value, 'targetValue');
              }}
              className="w-full h-10 rounded-lg text-base"
              placeholder="Target Value (%)"
            />
          </Form.Item>
        </div>

        {/* Mobile Layout - Initial and Target Values */}
        <div className={`${isMobile ? 'block' : 'hidden'} space-y-4 px-6`}>
          <div className="flex gap-4">
            <Form.Item className="flex-1 mb-0">
              <InputNumber
                id={`key-result-initial-mobile-${index}`}
                min={0}
                max={100}
                value={keyValue?.initialValue || 0}
                onChange={(value) => {
                  handleChange(value, 'initialValue');
                }}
                className="w-full h-10 rounded-lg text-base"
                placeholder="Initial Value (%)"
              />
            </Form.Item>
            <Form.Item className="flex-1 mb-0">
              <InputNumber
                id={`key-result-target-mobile-${index}`}
                min={0}
                max={100}
                value={keyValue?.targetValue || 0}
                onChange={(value) => {
                  handleChange(value, 'targetValue');
                }}
                className="w-full h-10 rounded-lg text-base"
                placeholder="Target Value (%)"
              />
            </Form.Item>
          </div>
        </div>
      </Form>
    </div>
  );
};

export default PercentageView;
