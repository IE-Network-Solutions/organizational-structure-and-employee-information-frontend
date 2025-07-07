import React, { useState, useEffect } from 'react';
import {
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Select,
  Row,
  Col,
} from 'antd';
import { GoPlus } from 'react-icons/go';
import { OKRFormProps } from '@/store/uistate/features/okrplanning/okr/interface';
import { useGetMetrics } from '@/store/server/features/okrplanning/okr/metrics/queries';
import { useOKRStore } from '@/store/uistate/features/okrplanning/okr';
import dayjs from 'dayjs';
import cancelIcon from '../../../../../../../public/image/Button.svg';
import Image from 'next/image';
import { useIsMobile } from '@/hooks/useIsMobile';

const MilestoneForm: React.FC<OKRFormProps> = ({
  keyItem,
  index,
  updateKeyResult,
  removeKeyResult,
  addKeyResultValue,
}) => {
  const { Option } = Select;
  const [form] = Form.useForm();
  const { setKeyResult, objectiveValue } = useOKRStore();
  const { data: metrics } = useGetMetrics();
  const [milestones, setMilestones] = useState(
    keyItem.milestones && keyItem.milestones.length > 0
      ? keyItem.milestones
      : [{ title: '', weight: 0 }],
  );

  const metricTypeId = metrics?.items?.find(
    (i: any) => i.name == 'Milestone',
  )?.id;

  useEffect(() => {
    // Sync milestones with parent keyItem
    updateKeyResult(index, 'milestones', milestones);
    // eslint-disable-next-line
  }, [milestones]);

  const handleAddKeyResult = () => {
    form
      .validateFields()
      .then((keyItem) => {
        const NewValue = {
          ...keyItem,
          metricTypeId: metricTypeId,
        };
        addKeyResultValue(NewValue);
        setKeyResult([]);
      })
      .catch(() => {});
  };

  const handleAddMilestone = () => {
    setMilestones([...milestones, { title: '', weight: 0 }]);
  };

  const handleMilestoneChange = (mIndex: number, field: string, value: any) => {
    const updated = milestones.map((m, i) =>
      i === mIndex ? { ...m, [field]: value } : m,
    );
    setMilestones(updated);
  };

  const handleRemoveMilestone = (mIndex: number) => {
    setMilestones(milestones.filter((_, i) => i !== mIndex));
  };

  const { isMobile } = useIsMobile();
  return (
    <div className="relative bg-gray-50 rounded-xl border-none p-6 mb-4">
      <button
        onClick={() => removeKeyResult(index)}
        title="Remove Key Result"
        aria-label="Remove Key Result"
        className="absolute top-2 right-2 bg-[#2B3CF1] hover:bg-[#1d2bb8] text-white rounded-full w-5 h-5 flex items-center justify-center shadow"
        style={{ zIndex: 10 }}
        id={`cancel-key-result-${index}`}
      >
        <svg
          width="15"
          height="15"
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
        {isMobile ? (
          <div className="flex flex-col gap-4">
            {/* Row 1: Key Result Name */}
            <div>
              <Form.Item
                className="mb-0"
                name={`title-${index}`}
                rules={[
                  {
                    required: true,
                    message: 'Please enter the Key Result name',
                  },
                ]}
                id={`key-result-title-${index}`}
              >
                <Input
                  placeholder="Key Result Name"
                  aria-label="Key Result Name"
                  className="h-10 rounded-lg text-base"
                  value={keyItem.title === '' ? undefined : keyItem.title}
                  onChange={(e) =>
                    updateKeyResult(index, 'title', e.target.value)
                  }
                />
              </Form.Item>
            </div>
            {/* Row 2: Type, Weight, Deadline */}
            <div className="flex flex-row gap-2">
              <Form.Item
                className="flex-1 mb-0"
                rules={[
                  {
                    required: true,
                    message: 'Please select a Key Result type',
                  },
                ]}
                id={`key-result-type-${index}`}
              >
                <Select
                  className="w-full h-10 rounded-lg text-base"
                  placeholder="Please select a metric type"
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
                  id={`select-metric-type-${index}`}
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
                name="weight"
                rules={[
                  { required: true, message: 'Please enter the Weight' },
                  { type: 'number', message: 'Weight must be a number' },
                ]}
                id={`key-result-weight-${index}`}
              >
                <InputNumber
                  className="w-full h-10 rounded-lg text-base"
                  min={0}
                  max={100}
                  suffix="%"
                  value={keyItem.weight}
                  onChange={(value) => updateKeyResult(index, 'weight', value)}
                />
              </Form.Item>
              <Form.Item
                className="w-32 mb-0"
                name={`dead_line_${index}`}
                rules={[
                  { required: true, message: 'Please select a deadline' },
                ]}
                id={`key-result-deadline-${index}`}
              >
                <DatePicker
                  className="w-full h-10 rounded-lg text-base"
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
                  id={`deadline-picker-${index}`}
                />
              </Form.Item>
            </div>
            {/* Row 3: Milestone fields and Add button */}
            <div className="flex flex-col gap-2">
              {/* First milestone row (always present) */}
              <div className="flex flex-row gap-2 items-center">
                <Form.Item className="flex-1 mb-0">
                  <Input
                    className="h-10 rounded-lg text-base"
                    placeholder="Set Milestone"
                    value={
                      milestones[0]?.title === ''
                        ? undefined
                        : milestones[0]?.title
                    }
                    onChange={(e) =>
                      handleMilestoneChange(0, 'title', e.target.value)
                    }
                  />
                </Form.Item>
                <Form.Item className="w-24 mb-0">
                  <InputNumber
                    className="w-full h-10 rounded-lg text-base"
                    min={0}
                    max={100}
                    placeholder="Weight"
                    value={milestones[0]?.weight}
                    onChange={(value) =>
                      handleMilestoneChange(0, 'weight', value)
                    }
                  />
                </Form.Item>
                <Button
                  className="bg-[#2B3CF1] hover:bg-[#1d2bb8] text-white font-semibold rounded-lg p-0 w-10 h-10 flex items-center justify-center"
                  icon={<GoPlus />}
                  aria-label="Add Milestone"
                  onClick={handleAddMilestone}
                  type="primary"
                />
              </div>
              {/* Additional milestones */}
              {milestones.slice(1).map((milestone, mIndex) => (
                <div
                  key={mIndex + 1}
                  className="flex flex-row gap-2 items-center"
                >
                  <Form.Item className="flex-1 mb-0">
                    <Input
                      className="h-10 rounded-lg text-base"
                      placeholder="Set Milestone"
                      value={
                        milestone.title === '' ? undefined : milestone.title
                      }
                      onChange={(e) =>
                        handleMilestoneChange(
                          mIndex + 1,
                          'title',
                          e.target.value,
                        )
                      }
                    />
                  </Form.Item>
                  <Form.Item className="w-24 mb-0">
                    <InputNumber
                      className="w-full h-10 rounded-lg text-base"
                      min={0}
                      max={100}
                      placeholder="Weight"
                      value={milestone.weight}
                      onChange={(value) =>
                        handleMilestoneChange(mIndex + 1, 'weight', value)
                      }
                    />
                  </Form.Item>
                  <Button
                    className="bg-[#2B3CF1] hover:bg-[#1d2bb8] text-white font-semibold rounded-full p-0 w-8 h-8 flex items-center justify-center"
                    icon={
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
                    }
                    aria-label="Remove Milestone"
                    onClick={() => handleRemoveMilestone(mIndex + 1)}
                    type="primary"
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex flex-row gap-4 items-center">
              <Form.Item
                className="flex-1 mb-0"
                name={`title-${index}`}
                rules={[
                  {
                    required: true,
                    message: 'Please enter the Key Result name',
                  },
                ]}
                id={`key-result-title-${index}`}
              >
                <Input
                  placeholder="Key Result Name"
                  aria-label="Key Result Name"
                  className="h-10 rounded-lg  text-base"
                  value={keyItem.title === '' ? undefined : keyItem.title}
                  onChange={(e) =>
                    updateKeyResult(index, 'title', e.target.value)
                  }
                />
              </Form.Item>
              <Form.Item
                className="flex-1 mb-0"
                rules={[
                  {
                    required: true,
                    message: 'Please select a Key Result type',
                  },
                ]}
                id={`key-result-type-${index}`}
              >
                <Select
                  className="w-full h-10 rounded-lg text-base"
                  placeholder="Please select a metric type"
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
                  id={`select-metric-type-${index}`}
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
                className="w-32 mb-0"
                name="weight"
                rules={[
                  { required: true, message: 'Please enter the Weight' },
                  { type: 'number', message: 'Weight must be a number' },
                ]}
                id={`key-result-weight-${index}`}
              >
                <InputNumber
                  className="w-full h-10 rounded-lg text-base"
                  min={0}
                  max={100}
                  suffix="%"
                  value={keyItem.weight}
                  onChange={(value) => updateKeyResult(index, 'weight', value)}
                />
              </Form.Item>
              <Form.Item
                className="w-48 mb-0"
                name={`dead_line_${index}`}
                rules={[
                  { required: true, message: 'Please select a deadline' },
                ]}
                id={`key-result-deadline-${index}`}
              >
                <DatePicker
                  className="w-full h-10 rounded-lg text-base"
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
                  id={`deadline-picker-${index}`}
                />
              </Form.Item>
            </div>
            {/* Milestone rows */}
            <div className="flex flex-col gap-2">
              {/* First milestone row (always present) */}
              <div className="flex flex-row gap-4 items-center">
                <Form.Item className="w-full mb-0">
                  <Input
                    className="h-10 rounded-lg text-base"
                    placeholder="Set Milestone"
                    value={
                      milestones[0]?.title === ''
                        ? undefined
                        : milestones[0]?.title
                    }
                    onChange={(e) =>
                      handleMilestoneChange(0, 'title', e.target.value)
                    }
                  />
                </Form.Item>
                <Form.Item className="w-32 mb-0">
                  <InputNumber
                    className="w-full h-10 rounded-lg text-base"
                    min={0}
                    max={100}
                    placeholder="Weight"
                    value={milestones[0]?.weight}
                    onChange={(value) =>
                      handleMilestoneChange(0, 'weight', value)
                    }
                  />
                </Form.Item>
                <Button
                  className="bg-[#2B3CF1] hover:bg-[#1d2bb8] text-white font-semibold rounded-lg px-4 py-2"
                  icon={<GoPlus />}
                  aria-label="Add Milestone"
                  onClick={handleAddMilestone}
                  type="primary"
                >
                  Add Milestone
                </Button>
              </div>
              {/* Additional milestones */}
              {milestones.slice(1).map((milestone, mIndex) => (
                <div
                  key={mIndex + 1}
                  className="flex flex-row gap-4 items-center"
                >
                  <Form.Item className="w-2/3 mb-0">
                    <Input
                      className="h-10 rounded-lg text-base"
                      placeholder="Set Milestone"
                      value={
                        milestone.title === '' ? undefined : milestone.title
                      }
                      onChange={(e) =>
                        handleMilestoneChange(
                          mIndex + 1,
                          'title',
                          e.target.value,
                        )
                      }
                    />
                  </Form.Item>
                  <Form.Item className="w-20 mb-0">
                    <InputNumber
                      className="w-full h-10 rounded-lg text-base"
                      min={0}
                      max={100}
                      placeholder="Weight"
                      value={milestone.weight}
                      onChange={(value) =>
                        handleMilestoneChange(mIndex + 1, 'weight', value)
                      }
                    />
                  </Form.Item>
                  <Button
                    type="default"
                    className="text-white hover:bg-[#4954d2] text-lg bg-[#2B3CF1] rounded-3xl h-5 w-2"
                    onClick={() => handleRemoveMilestone(mIndex + 1)}
                    aria-label="Remove Milestone"
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </Form>
    </div>
  );
};

export default MilestoneForm;
