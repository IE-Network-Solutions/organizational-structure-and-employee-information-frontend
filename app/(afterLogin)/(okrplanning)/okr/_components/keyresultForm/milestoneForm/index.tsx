import React, { useState, useEffect } from 'react';
import { DatePicker, Form, Input, InputNumber, Select } from 'antd';
import { OKRFormProps } from '@/store/uistate/features/okrplanning/okr/interface';
import { useGetMetrics } from '@/store/server/features/okrplanning/okr/metrics/queries';
import { useOKRStore } from '@/store/uistate/features/okrplanning/okr';
import dayjs from 'dayjs';
import { useIsMobile } from '@/hooks/useIsMobile';

const MilestoneForm: React.FC<OKRFormProps> = ({
  keyItem,
  index,
  updateKeyResult,
  removeKeyResult,
}) => {
  const { Option } = Select;
  const [form] = Form.useForm();
  const { objectiveValue } = useOKRStore();
  const { data: metrics } = useGetMetrics();
  const [milestones, setMilestones] = useState(
    keyItem.milestones && keyItem.milestones.length > 0
      ? keyItem.milestones
      : [{ title: '', weight: 100 }],
  );

  useEffect(() => {
    updateKeyResult(index, 'milestones', milestones);
    // eslint-disable-next-line
  }, [milestones]);

  const calculateAndDistributeWeights = (milestoneList: any[]) => {
    if (milestoneList.length === 0) return [];

    const baseWeight = Math.floor(100 / milestoneList.length);
    const remainder = 100 - baseWeight * milestoneList.length;

    return milestoneList.map((milestone, index) => ({
      ...milestone,
      weight: baseWeight + (index < remainder ? 1 : 0),
    }));
  };

  const handleAddMilestone = () => {
    const newMilestone = { title: '', weight: 0 };
    const updatedMilestones = [newMilestone, ...milestones];
    const distributedMilestones =
      calculateAndDistributeWeights(updatedMilestones);
    setMilestones(distributedMilestones);
  };

  const handleMilestoneChange = (mIndex: number, field: string, value: any) => {
    const updated = milestones.map((m, i) =>
      i === mIndex ? { ...m, [field]: value } : m,
    );
    setMilestones(updated);
  };

  const handleRemoveMilestone = (mIndex: number) => {
    const filteredMilestones = milestones.filter((noneUsed, i) => i !== mIndex);
    const distributedMilestones =
      calculateAndDistributeWeights(filteredMilestones);
    setMilestones(distributedMilestones);
  };

  const { isMobile } = useIsMobile();

  return (
    <div
      id={`okr-milestone-form-container-${index}`}
      data-cy={`okr-milestone-form-container-${index}`}
      className="relative bg-gray-50 rounded-xl border-none p-6 mb-4"
    >
      <button
        onClick={() => removeKeyResult(index)}
        title="Remove Key Result"
        aria-label="Remove Key Result"
        className="absolute top-2 right-2 rounded-full w-6 h-6 bg-[#2B3CF1] hover:bg-[#1d2bb8] text-white flex items-center justify-center p-0"
        style={{ zIndex: 10 }}
        id={`cancel-key-result-${index}`}
        data-cy={`okr-milestone-remove-key-result-${index}`}
      >
        <svg
          width={isMobile ? '12' : '20'}
          height={isMobile ? '12' : '20'}
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
        id={`okr-milestone-form-${index}`}
        data-cy={`okr-milestone-form-${index}`}
        form={form}
        layout="vertical"
        initialValues={keyItem}
      >
        {isMobile ? (
          <div
            id={`okr-milestone-mobile-wrapper-${index}`}
            data-cy={`okr-milestone-mobile-wrapper-${index}`}
            className="flex flex-col gap-3 mt-2 sm:mt-4 px-1 sm:px-2"
          >
            {/* Row 1: Key Result Name */}
            <div
              id={`okr-milestone-mobile-title-row-${index}`}
              data-cy={`okr-milestone-mobile-title-row-${index}`}
            >
              <Form.Item
                className="mb-0"
                name="title"
                rules={[
                  {
                    required: true,
                    message: 'Please enter the Key Result name',
                  },
                ]}
                id={`key-result-title-${index}`}
                data-cy={`okr-milestone-mobile-title-item-${index}`}
              >
                <Input
                  id={`okr-milestone-mobile-title-input-${index}`}
                  data-cy={`okr-milestone-mobile-title-input-${index}`}
                  placeholder="Key Result Name"
                  aria-label="Key Result Name"
                  className="h-10 sm:h-11 rounded-lg text-sm sm:text-base"
                  value={keyItem.title === '' ? undefined : keyItem.title}
                  onChange={(e) =>
                    updateKeyResult(index, 'title', e.target.value)
                  }
                />
              </Form.Item>
            </div>
            {/* Row 2: Type (full width on mobile) */}
            <div
              id={`okr-milestone-mobile-meta-row-${index}`}
              data-cy={`okr-milestone-mobile-meta-row-${index}`}
            >
              <Form.Item
                className="mb-0"
                rules={[
                  {
                    required: true,
                    message: 'Please select a Key Result type',
                  },
                ]}
                id={`key-result-type-${index}`}
                data-cy={`okr-milestone-mobile-type-item-${index}`}
              >
                <Select
                  className="w-full h-10 sm:h-11 rounded-lg text-sm sm:text-base"
                  data-cy={`okr-milestone-mobile-type-select-${index}`}
                  placeholder="Select metric type"
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
                  <Option
                    data-cy={`okr-milestone-mobile-type-option-${index}`}
                    value=""
                    disabled
                  >
                    Select metric type
                  </Option>
                  {metrics?.items?.map((metric) => (
                    <Option
                      data-cy={`okr-milestone-mobile-type-option-${index}-${metric?.id}`}
                      key={metric?.id}
                      value={metric?.id}
                    >
                      {metric?.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </div>
            {/* Row 3: Weight and Deadline */}
            <div className="flex flex-row gap-2">
              <Form.Item
                className="flex-1 mb-0"
                name="weight"
                rules={[
                  { required: true, message: 'Weight required' },
                  { type: 'number', message: 'Must be a number' },
                ]}
                id={`key-result-weight-${index}`}
                data-cy={`okr-milestone-mobile-weight-item-${index}`}
              >
                <InputNumber
                  className="w-full h-10 sm:h-11 rounded-lg text-sm sm:text-base"
                  data-cy={`okr-milestone-mobile-weight-input-${index}`}
                  min={0}
                  max={100}
                  suffix="%"
                  placeholder="100"
                  value={keyItem.weight}
                  onChange={(value) => updateKeyResult(index, 'weight', value)}
                />
              </Form.Item>
              <Form.Item
                className="flex-1 mb-0"
                name={`dead_line_${index}`}
                rules={[{ required: true, message: 'Deadline required' }]}
                id={`key-result-deadline-${index}`}
                data-cy={`okr-milestone-mobile-deadline-item-${index}`}
              >
                <DatePicker
                  className="w-full h-10 sm:h-11 rounded-lg text-sm sm:text-base"
                  data-cy={`okr-milestone-mobile-deadline-picker-${index}`}
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
            {/* Row 4: Milestone fields */}
            <div
              id={`okr-milestone-mobile-list-${index}`}
              data-cy={`okr-milestone-mobile-list-${index}`}
              className="flex flex-col gap-2 sm:pl-3"
            >
              {/* First milestone row */}
              <div
                id={`okr-milestone-mobile-row-0-${index}`}
                data-cy={`okr-milestone-mobile-row-0-${index}`}
                className="flex flex-col xs:flex-row gap-2"
              >
                <Form.Item
                  className="flex-1 mb-0"
                  data-cy={`okr-milestone-mobile-title-item-0-${index}`}
                >
                  <Input
                    id={`okr-milestone-mobile-title-input-0-${index}`}
                    data-cy={`okr-milestone-mobile-title-input-0-${index}`}
                    className="h-10 sm:h-11 rounded-lg text-sm sm:text-base"
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
                <div className="flex gap-2 items-center">
                  <Form.Item
                    className="flex-1 xs:w-20 sm:w-24 mb-0"
                    data-cy={`okr-milestone-mobile-weight-item-0-${index}`}
                  >
                    <InputNumber
                      id={`okr-milestone-mobile-weight-input-0-${index}`}
                      data-cy={`okr-milestone-mobile-weight-input-0-${index}`}
                      className="w-full h-10 sm:h-11 rounded-lg text-sm sm:text-base"
                      min={0}
                      max={100}
                      placeholder="Weight"
                      suffix="%"
                      value={milestones[0]?.weight}
                      onChange={(value) =>
                        handleMilestoneChange(0, 'weight', value)
                      }
                    />
                  </Form.Item>
                  <button
                    id={`okr-milestone-mobile-remove-0-${index}`}
                    data-cy={`okr-milestone-mobile-remove-0-${index}`}
                    onClick={() => handleRemoveMilestone(0)}
                    title="Remove Milestone"
                    aria-label="Remove Milestone"
                    className="bg-[#2B3CF1] hover:bg-[#1d2bb8] text-white rounded-full w-6 h-6 flex items-center justify-center shadow transition-colors flex-shrink-0"
                    style={{ zIndex: 10 }}
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
                  <button
                    id={`okr-milestone-mobile-add-${index}`}
                    data-cy={`okr-milestone-mobile-add-${index}`}
                    className="bg-[#2B3CF1] hover:bg-[#1d2bb8] text-white font-semibold rounded-lg h-6 sm:h-11 px-2 sm:px-4 flex items-center justify-center flex-shrink-0"
                    aria-label="Add Milestone"
                    onClick={handleAddMilestone}
                    type="button"
                  >
                    <span className="hidden xs:inline">Add</span>
                    <span className="xs:hidden text-sm">+</span>
                  </button>
                </div>
              </div>
              {/* Additional milestones */}
              {milestones.slice(1).map((milestone, mIndex) => (
                <div
                  key={mIndex + 1}
                  id={`okr-milestone-mobile-row-${mIndex + 1}-${index}`}
                  data-cy={`okr-milestone-mobile-row-${mIndex + 1}-${index}`}
                  className="flex flex-col xs:flex-row gap-2"
                >
                  <Form.Item
                    className="flex-1 mb-0"
                    data-cy={`okr-milestone-mobile-title-item-${mIndex + 1}-${index}`}
                  >
                    <Input
                      id={`okr-milestone-mobile-title-input-${mIndex + 1}-${index}`}
                      data-cy={`okr-milestone-mobile-title-input-${mIndex + 1}-${index}`}
                      className="h-10 sm:h-11 rounded-lg text-sm sm:text-base"
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
                  <div className="flex gap-2">
                    <Form.Item
                      className="flex-1 xs:w-20 sm:w-24 mb-0"
                      data-cy={`okr-milestone-mobile-weight-item-${mIndex + 1}-${index}`}
                    >
                      <InputNumber
                        id={`okr-milestone-mobile-weight-input-${mIndex + 1}-${index}`}
                        data-cy={`okr-milestone-mobile-weight-input-${mIndex + 1}-${index}`}
                        className="w-full h-10 sm:h-11 rounded-lg text-sm sm:text-base"
                        min={0}
                        max={100}
                        placeholder="Weight"
                        suffix="%"
                        value={milestone.weight}
                        onChange={(value) =>
                          handleMilestoneChange(mIndex + 1, 'weight', value)
                        }
                      />
                    </Form.Item>
                    <button
                      id={`okr-milestone-mobile-remove-${mIndex + 1}-${index}`}
                      data-cy={`okr-milestone-mobile-remove-${mIndex + 1}-${index}`}
                      onClick={() => handleRemoveMilestone(mIndex + 1)}
                      title="Remove Milestone"
                      aria-label="Remove Milestone"
                      className="bg-[#2B3CF1] hover:bg-[#1d2bb8] text-white rounded-full w-6 h-6 flex items-center justify-center shadow transition-colors flex-shrink-0"
                      style={{ zIndex: 10 }}
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
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div
            id={`okr-milestone-tablet-wrapper-${index}`}
            data-cy={`okr-milestone-tablet-wrapper-${index}`}
            className="flex flex-col gap-3 mt-4 px-2 md:px-4"
          >
            {/* Key Result row */}
            <div
              id={`okr-milestone-tablet-meta-row-${index}`}
              data-cy={`okr-milestone-tablet-meta-row-${index}`}
              className="flex flex-col lg:flex-row gap-2 items-stretch lg:items-center"
            >
              <Form.Item
                className="flex-1 mb-0"
                name={`title-${index}`}
                rules={[
                  {
                    required: true,
                    message: 'Please enter the Key Result name',
                  },
                ]}
                id={`okr-milestone-tablet-title-item-${index}`}
                data-cy={`okr-milestone-tablet-title-item-${index}`}
              >
                <Input
                  id={`okr-milestone-tablet-title-input-${index}`}
                  data-cy={`okr-milestone-tablet-title-input-${index}`}
                  placeholder="Key Result Name"
                  aria-label="Key Result Name"
                  className="h-10 md:h-11 rounded-lg text-base"
                  value={keyItem.title === '' ? undefined : keyItem.title}
                  onChange={(e) =>
                    updateKeyResult(index, 'title', e.target.value)
                  }
                />
              </Form.Item>
              <div
                id={`okr-milestone-tablet-meta-fields-${index}`}
                data-cy={`okr-milestone-tablet-meta-fields-${index}`}
                className="flex gap-2 flex-wrap lg:flex-nowrap"
              >
                <Form.Item
                  className="flex-1 lg:w-40 xl:w-48 mb-0 min-w-[180px]"
                  rules={[
                    {
                      required: true,
                      message: 'Please select a Key Result type',
                    },
                  ]}
                  id={`okr-milestone-tablet-type-item-${index}`}
                  data-cy={`okr-milestone-tablet-type-item-${index}`}
                >
                  <Select
                    id={`okr-milestone-tablet-type-select-${index}`}
                    data-cy={`okr-milestone-tablet-type-select-${index}`}
                    className="w-full h-10 md:h-11 rounded-lg text-base"
                    placeholder="Select metric type"
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
                    { required: true, message: 'Please enter the Weight' },
                    { type: 'number', message: 'Weight must be a number' },
                  ]}
                  id={`okr-milestone-tablet-weight-item-${index}`}
                  data-cy={`okr-milestone-tablet-weight-item-${index}`}
                >
                  <InputNumber
                    id={`okr-milestone-tablet-weight-input-${index}`}
                    data-cy={`okr-milestone-tablet-weight-input-${index}`}
                    className="w-full h-10 md:h-11 rounded-lg text-base"
                    min={0}
                    max={100}
                    suffix="%"
                    placeholder="100"
                    value={keyItem.weight}
                    onChange={(value) =>
                      updateKeyResult(index, 'weight', value)
                    }
                  />
                </Form.Item>
                <Form.Item
                  className="flex-1 lg:w-40 xl:w-48 mb-0 min-w-[140px]"
                  name={`dead_line_${index}`}
                  rules={[
                    { required: true, message: 'Please select a deadline' },
                  ]}
                  id={`okr-milestone-tablet-deadline-item-${index}`}
                  data-cy={`okr-milestone-tablet-deadline-item-${index}`}
                >
                  <DatePicker
                    id={`okr-milestone-tablet-deadline-picker-${index}`}
                    data-cy={`okr-milestone-tablet-deadline-picker-${index}`}
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
                  />
                </Form.Item>
              </div>
            </div>
            {/* Milestone rows */}
            <div
              id={`okr-milestone-tablet-list-${index}`}
              data-cy={`okr-milestone-tablet-list-${index}`}
              className="flex flex-col gap-2 pl-3 md:pl-4"
            >
              {/* First milestone row */}
              <div
                id={`okr-milestone-tablet-row-0-${index}`}
                data-cy={`okr-milestone-tablet-row-0-${index}`}
                className="flex flex-col md:flex-row gap-2 items-stretch md:items-center"
              >
                <Form.Item
                  className="flex-1 mb-0"
                  data-cy={`okr-milestone-tablet-title-item-0-${index}`}
                >
                  <Input
                    id={`okr-milestone-tablet-title-input-0-${index}`}
                    data-cy={`okr-milestone-tablet-title-input-0-${index}`}
                    className="h-10 md:h-11 rounded-lg text-base"
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
                <div className="flex gap-2">
                  <Form.Item
                    className="w-20 md:w-24 mb-0"
                    data-cy={`okr-milestone-tablet-weight-item-0-${index}`}
                  >
                    <InputNumber
                      id={`okr-milestone-tablet-weight-input-0-${index}`}
                      data-cy={`okr-milestone-tablet-weight-input-0-${index}`}
                      className="w-full h-10 md:h-11 rounded-lg text-base"
                      min={0}
                      max={100}
                      placeholder="Weight"
                      suffix="%"
                      value={milestones[0]?.weight}
                      onChange={(value) =>
                        handleMilestoneChange(0, 'weight', value)
                      }
                    />
                  </Form.Item>
                  <div
                    id={`okr-milestone-tablet-actions-0-${index}`}
                    data-cy={`okr-milestone-tablet-actions-0-${index}`}
                    className="flex gap-2 items-center flex-1 md:w-40 xl:w-48"
                  >
                    <button
                      id={`okr-milestone-tablet-remove-0-${index}`}
                      data-cy={`okr-milestone-tablet-remove-0-${index}`}
                      onClick={() => handleRemoveMilestone(0)}
                      title="Remove Milestone"
                      aria-label="Remove Milestone"
                      className="bg-[#2B3CF1] hover:bg-[#1d2bb8] text-white rounded-full w-8 h-8 md:w-11 md:h-11 flex items-center justify-center shadow transition-colors flex-shrink-0"
                      style={{ zIndex: 10 }}
                    >
                      <svg
                        width="20"
                        height="20"
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
                    <button
                      id={`okr-milestone-tablet-add-${index}`}
                      data-cy={`okr-milestone-tablet-add-${index}`}
                      className="bg-[#2B3CF1] hover:bg-[#1d2bb8] text-white font-semibold rounded-lg h-10 md:h-11 flex items-center justify-center flex-1"
                      aria-label="Add Milestone"
                      onClick={handleAddMilestone}
                      type="button"
                    >
                      Add Milestone
                    </button>
                  </div>
                </div>
              </div>
              {/* Additional milestones */}
              {milestones.slice(1).map((milestone, mIndex) => (
                <div
                  key={mIndex + 1}
                  id={`okr-milestone-tablet-row-${mIndex + 1}-${index}`}
                  data-cy={`okr-milestone-tablet-row-${mIndex + 1}-${index}`}
                  className="flex flex-col md:flex-row gap-2 items-stretch md:items-center"
                >
                  <Form.Item
                    className="flex-1 mb-0"
                    data-cy={`okr-milestone-tablet-title-item-${mIndex + 1}-${index}`}
                  >
                    <Input
                      id={`okr-milestone-tablet-title-input-${mIndex + 1}-${index}`}
                      data-cy={`okr-milestone-tablet-title-input-${mIndex + 1}-${index}`}
                      className="h-10 md:h-11 rounded-lg text-base"
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
                  <div className="flex gap-2 items-center">
                    <Form.Item
                      className="w-20 md:w-24 mb-0"
                      data-cy={`okr-milestone-tablet-weight-item-${mIndex + 1}-${index}`}
                    >
                      <InputNumber
                        id={`okr-milestone-tablet-weight-input-${mIndex + 1}-${index}`}
                        data-cy={`okr-milestone-tablet-weight-input-${mIndex + 1}-${index}`}
                        className="w-full h-10 md:h-11 rounded-lg text-base"
                        min={0}
                        max={100}
                        placeholder="Weight"
                        suffix="%"
                        value={milestone.weight}
                        onChange={(value) =>
                          handleMilestoneChange(mIndex + 1, 'weight', value)
                        }
                      />
                    </Form.Item>
                    <div
                      id={`okr-milestone-tablet-actions-${mIndex + 1}-${index}`}
                      data-cy={`okr-milestone-tablet-actions-${mIndex + 1}-${index}`}
                      className="flex gap-2 items-center flex-1 md:w-40 xl:w-48"
                    >
                      <button
                        id={`okr-milestone-tablet-remove-${mIndex + 1}-${index}`}
                        data-cy={`okr-milestone-tablet-remove-${mIndex + 1}-${index}`}
                        onClick={() => handleRemoveMilestone(mIndex + 1)}
                        title="Remove Milestone"
                        aria-label="Remove Milestone"
                        className="bg-[#2B3CF1] hover:bg-[#1d2bb8] text-white rounded-full w-8 h-8 md:w-11 md:h-11 flex items-center justify-center shadow transition-colors flex-shrink-0"
                        style={{ zIndex: 10 }}
                      >
                        <svg
                          width="16"
                          height="16"
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
                    </div>
                  </div>
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
