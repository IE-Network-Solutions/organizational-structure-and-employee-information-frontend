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
import { useIsMobile } from '@/hooks/useIsMobile';
import { useGetMetrics } from '@/store/server/features/okrplanning/okr/metrics/queries';
import { isKeyResultLockedForWeightEdit } from '@/app/(afterLogin)/(okrplanning)/okr/_utils/keyResultGuards';

const NumericView: React.FC<OKRProps> = ({ keyValue, index, isEdit, form }) => {
  const {
    handleKeyResultChange,
    handleSingleKeyResultChange,
    removeKeyResultValue,
    objectiveValue,
  } = useOKRStore();

  const { data: metrics } = useGetMetrics();
  const disableWeightEdit = isKeyResultLockedForWeightEdit(keyValue);

  const handleChange = (value: any, field: string) => {
    if (isEdit) {
      handleSingleKeyResultChange(value, field);
    } else {
      handleKeyResultChange(value, index, field);
    }
  };

  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  function handleKeyResultDelete(id: string) {
    // Remove from local state only - deletion will happen on Save
    removeKeyResultValue(index);
  }

  const { isMobile } = useIsMobile();
  const viewPrefix = keyValue?.id
    ? `okr-numeric-view-${keyValue.id}`
    : `okr-numeric-view-${index}`;

  return (
    <div
      className={`py-3 rounded-lg p-4 relative pb-6 ${isEdit ? '' : 'bg-gray-50'}`}
      id={`key-result-${index}`}
      data-cy={viewPrefix}
    >
      {/* Remove Button - positioned at top right */}
      {!isEdit && (
        <Tooltip
          title="Remove Key Result"
          id={`${viewPrefix}-remove-tooltip`}
          data-cy={`${viewPrefix}-remove-tooltip`}
        >
          <Popconfirm
            title="Are you sure you want to remove this key result?"
            onConfirm={() => handleKeyResultDelete(keyValue?.id)}
            okText="Yes"
            cancelText="No"
            id={`${viewPrefix}-remove-popconfirm`}
            data-cy={`${viewPrefix}-remove-popconfirm`}
          >
            <Button
              type="text"
              icon={<VscClose />}
              className="absolute top-2 right-2 rounded-full w-6 h-6 bg-[#2B3CF1] hover:bg-[#1d2bb8] text-white flex items-center justify-center p-0"
              id={`${viewPrefix}-remove-button`}
              data-cy={`${viewPrefix}-remove-button`}
            />
          </Popconfirm>
        </Tooltip>
      )}

      <Form
        form={form}
        layout="vertical"
        className="space-y-1 mt-10"
        id={`${viewPrefix}-form`}
        data-cy={`${viewPrefix}-form`}
      >
        {/* Main Key Result Row - all fields in single row */}
        {/* Desktop Layout */}
        <div
          className={`${isMobile ? 'hidden' : 'flex'} items-center pb-3 px-6`}
          id={`${viewPrefix}-desktop-row`}
          data-cy={`${viewPrefix}-desktop-row`}
        >
          {/* Title Input */}
          <div
            className="flex-1"
            data-cy={`${viewPrefix}-desktop-title-container`}
          >
            <Form.Item
              id={`${viewPrefix}-desktop-title-input-item`}
              data-cy={`${viewPrefix}-desktop-title-input-item`}
              className="w-full font-bold mb-0"
              rules={[
                {
                  required: true,
                  message: 'Numeric title is required',
                  validator: (notused, value) =>
                    value && value.trim() !== ''
                      ? Promise.resolve()
                      : Promise.reject(new Error('Numeric title is required')),
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
                placeholder="Enter numeric title"
                data-cy={`${viewPrefix}-desktop-title-input`}
              />
              {!keyValue.title && (
                <div
                  className="text-red-500 font-semibold absolute top-[30px]"
                  data-cy={`${viewPrefix}-desktop-title-error`}
                >
                  Numeric title is required
                </div>
              )}
            </Form.Item>
          </div>

          {/* Metric Type Dropdown */}
          <div
            className="w-48 ml-6"
            data-cy={`${viewPrefix}-desktop-metric-container`}
          >
            <Form.Item
              id={`${viewPrefix}-desktop-metric-select-item`}
              data-cy={`${viewPrefix}-desktop-metric-select-item`}
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
                  data-cy={`${viewPrefix}-desktop-metric-select`}
                >
                  {metrics?.items?.map((metric: any) => (
                    <Select.Option
                      id={`${viewPrefix}-desktop-metric-select-option-${metric?.id}`}
                      data-cy={`${viewPrefix}-desktop-metric-select-option-${metric?.id}`}
                      key={metric?.id}
                      value={metric?.id}
                    >
                      {metric?.name}
                    </Select.Option>
                  ))}
                </Select>
              ) : (
                <Button
                  id={`${viewPrefix}-desktop-metric-select-button`}
                  data-cy={`${viewPrefix}-desktop-metric-select-button`}
                  className="w-full h-10 rounded-lg text-base bg-gray-100 border-gray-300 text-gray-600"
                  disabled
                >
                  Numeric
                </Button>
              )}
            </Form.Item>
          </div>

          {/* Weight/Percentage */}
          <div
            className="w-24 ml-2"
            data-cy={`${viewPrefix}-desktop-weight-container`}
          >
            <Form.Item
              id={`${viewPrefix}-desktop-weight-input-item`}
              data-cy={`${viewPrefix}-desktop-weight-input-item`}
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
                disabled={isEdit || disableWeightEdit}
                data-cy={`${viewPrefix}-desktop-weight-input`}
              />
            </Form.Item>
          </div>

          {/* Deadline */}
          <div
            className="w-48 ml-2"
            data-cy={`${viewPrefix}-desktop-deadline-container`}
          >
            <Form.Item
              id={`${viewPrefix}-desktop-deadline-input-item`}
              data-cy={`${viewPrefix}-desktop-deadline-input-item`}
              className="w-full font-bold mb-0"
            >
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
                data-cy={`${viewPrefix}-desktop-deadline-picker`}
              />
              {!keyValue.deadline && (
                <div
                  className="text-red-500 font-semibold absolute top-[30px]"
                  data-cy={`${viewPrefix}-desktop-deadline-error`}
                >
                  Deadline is required
                </div>
              )}
            </Form.Item>
          </div>
        </div>

        {/* Mobile Layout */}
        <div
          className={`${isMobile ? 'block' : 'hidden'} space-y-4 px-6`}
          id={`${viewPrefix}-mobile-section`}
          data-cy={`${viewPrefix}-mobile-section`}
        >
          {/* Row 1: Title */}
          <Form.Item
            id={`${viewPrefix}-mobile-title-input-item`}
            data-cy={`${viewPrefix}-mobile-title-input-item`}
            className="w-full font-bold mb-0"
            rules={[
              {
                required: true,
                message: 'Numeric title is required',
                validator: (notused, value) =>
                  value && value.trim() !== ''
                    ? Promise.resolve()
                    : Promise.reject(new Error('Numeric title is required')),
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
              placeholder="Enter numeric title"
              data-cy={`${viewPrefix}-mobile-title-input`}
            />
            {!keyValue.title && (
              <div
                className="text-red-500 font-semibold absolute top-[30px]"
                data-cy={`${viewPrefix}-mobile-title-error`}
              >
                Numeric title is required
              </div>
            )}
          </Form.Item>

          {/* Row 2: Type, Weight, Deadline */}
          <div
            className="flex gap-2"
            data-cy={`${viewPrefix}-mobile-form-row-2`}
          >
            <Form.Item
              id={`${viewPrefix}-mobile-metric-select-item`}
              data-cy={`${viewPrefix}-mobile-metric-select-item`}
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
                  data-cy={`${viewPrefix}-mobile-metric-select`}
                >
                  {metrics?.items?.map((metric: any) => (
                    <Select.Option
                      id={`${viewPrefix}-mobile-metric-select-option-${metric?.id}`}
                      data-cy={`${viewPrefix}-mobile-metric-select-option-${metric?.id}`}
                      key={metric?.id}
                      value={metric?.id}
                    >
                      {metric?.name}
                    </Select.Option>
                  ))}
                </Select>
              ) : (
                <Button
                  id={`${viewPrefix}-mobile-metric-select-button`}
                  data-cy={`${viewPrefix}-mobile-metric-select-button`}
                  className="w-full h-10 rounded-lg text-base bg-gray-100 border-gray-300 text-gray-600"
                  disabled
                >
                  Numeric
                </Button>
              )}
            </Form.Item>

            <Form.Item
              id={`${viewPrefix}-mobile-weight-input-item`}
              data-cy={`${viewPrefix}-mobile-weight-input-item`}
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
                disabled={isEdit || disableWeightEdit}
                data-cy={`${viewPrefix}-mobile-weight-input`}
              />
            </Form.Item>

            <Form.Item
              id={`${viewPrefix}-mobile-deadline-input-item`}
              data-cy={`${viewPrefix}-mobile-deadline-input-item`}
              className="w-32 font-bold mb-0"
            >
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
                data-cy={`${viewPrefix}-mobile-deadline-picker`}
              />
              {!keyValue.deadline && (
                <div
                  id={`${viewPrefix}-mobile-deadline-item-error`}
                  data-cy={`${viewPrefix}-mobile-deadline-item-error`}
                  className="text-red-500 font-semibold absolute top-[30px]"
                >
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
          id={`${viewPrefix}-desktop-values-row`}
          data-cy={`${viewPrefix}-desktop-values-row`}
        >
          <Form.Item
            id={`${viewPrefix}-desktop-initial-input-item`}
            data-cy={`${viewPrefix}-desktop-initial-input-item`}
            className="flex-1 mb-0"
          >
            <InputNumber
              id={`key-result-initial-${index}`}
              min={0}
              value={keyValue?.initialValue || 0}
              onChange={(value) => {
                handleChange(value, 'initialValue');
              }}
              className="w-full h-10 rounded-lg text-base"
              placeholder="Initial Value"
              data-cy={`${viewPrefix}-desktop-initial-input`}
            />
          </Form.Item>
          <Form.Item
            id={`${viewPrefix}-desktop-target-input-item`}
            data-cy={`${viewPrefix}-desktop-target-input-item`}
            className="flex-1 mb-0"
          >
            <InputNumber
              id={`key-result-target-${index}`}
              min={0}
              value={keyValue?.targetValue || 0}
              onChange={(value) => {
                handleChange(value, 'targetValue');
              }}
              className="w-full h-10 rounded-lg text-base"
              placeholder="Target Value"
              data-cy={`${viewPrefix}-desktop-target-input`}
            />
          </Form.Item>
        </div>

        {/* Mobile Layout - Initial and Target Values */}
        <div
          className={`${isMobile ? 'block' : 'hidden'} space-y-4 px-6`}
          id={`${viewPrefix}-mobile-values-section`}
          data-cy={`${viewPrefix}-mobile-values-section`}
        >
          <div
            className="flex gap-4"
            id={`${viewPrefix}-mobile-values-row`}
            data-cy={`${viewPrefix}-mobile-values-container`}
          >
            <Form.Item
              id={`${viewPrefix}-mobile-initial-input-item`}
              data-cy={`${viewPrefix}-mobile-initial-input-item`}
              className="flex-1 mb-0"
            >
              <InputNumber
                id={`key-result-initial-mobile-${index}`}
                min={0}
                value={keyValue?.initialValue || 0}
                onChange={(value) => {
                  handleChange(value, 'initialValue');
                }}
                className="w-full h-10 rounded-lg text-base"
                placeholder="Initial Value"
                data-cy={`${viewPrefix}-mobile-initial-input`}
              />
            </Form.Item>
            <Form.Item className="flex-1 mb-0">
              <InputNumber
                id={`key-result-target-mobile-${index}`}
                min={0}
                value={keyValue?.targetValue || 0}
                onChange={(value) => {
                  handleChange(value, 'targetValue');
                }}
                className="w-full h-10 rounded-lg text-base"
                placeholder="Target Value"
                data-cy={`${viewPrefix}-mobile-target-input`}
              />
            </Form.Item>
          </div>
        </div>
      </Form>
    </div>
  );
};

export default NumericView;
