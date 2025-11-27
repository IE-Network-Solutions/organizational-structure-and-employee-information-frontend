import React, { useEffect } from 'react';
import {
  Button,
  Input,
  DatePicker,
  Form,
  InputNumber,
  Tooltip,
  Popconfirm,
  Select,
} from 'antd';
import dayjs from 'dayjs';
import { VscClose } from 'react-icons/vsc';
import {
  Milestone,
  OKRProps,
} from '@/store/uistate/features/okrplanning/okr/interface';
import { useOKRStore } from '@/store/uistate/features/okrplanning/okr';
import {
  useDeleteKeyResult,
  useDeleteMilestone,
} from '@/store/server/features/okrplanning/okr/objective/mutations';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useGetMetrics } from '@/store/server/features/okrplanning/okr/metrics/queries';

const MilestoneView: React.FC<OKRProps> = ({
  keyValue,
  index,
  isEdit,
  form,
}) => {
  const {
    keyResultValue,
    setKeyResultValue,
    objectiveValue,
    setObjectiveValue,
    handleMilestoneChange,
    handleKeyResultChange,
    handleSingleKeyResultChange,
    handleMilestoneSingleChange,
    removeKeyResultValue,
  } = useOKRStore();

  const { data: metrics } = useGetMetrics();

  // Sync form values with milestone data
  useEffect(() => {
    if (keyValue?.milestones && form) {
      const milestoneValues: any = {};
      keyValue.milestones.forEach((milestone: any, mindex: number) => {
        milestoneValues[`milestones.${index}.${mindex}.title`] =
          milestone.title;
      });
      form.setFieldsValue(milestoneValues);
    }
  }, [keyValue?.milestones, form, index]);

  const handleAddMilestone = (index: number) => {
    const newMilestone: Milestone = {
      title: '',
      weight: 0, // Will be calculated dynamically
      status: 'In Progress',
    };

    const updatedObjectiveValue = {
      ...objectiveValue,
      keyResults: objectiveValue?.keyResults.map((item: any, i: number) => {
        if (i === index) {
          const currentMilestones = item.milestones || [];

          const completedMilestones = currentMilestones.filter(
            (milestone: Milestone) => milestone.status === 'Completed',
          );
          const nonCompletedMilestones = currentMilestones.filter(
            (milestone: Milestone) => milestone.status !== 'Completed',
          );

          const totalMilestones = nonCompletedMilestones.length + 1;
          const remainingWeight =
            100 -
            completedMilestones.reduce(
              (sum: number, milestone: Milestone) =>
                sum + Number(milestone?.weight ?? 0),
              0,
            );

          const weightPerMilestone = Math.round(
            remainingWeight / totalMilestones,
          );

          const updatedMilestones = [
            ...completedMilestones,
            ...nonCompletedMilestones.map((milestone: Milestone) => ({
              ...milestone,
              weight: weightPerMilestone,
            })),
            {
              ...newMilestone,
              weight: weightPerMilestone,
            },
          ];

          return {
            ...item,
            milestones: updatedMilestones,
          };
        }
        return item;
      }),
    };

    setObjectiveValue(updatedObjectiveValue);
  };

  const handleAddMilestoneSingleMilestone = () => {
    const currentMilestones = keyResultValue.milestones || [];

    const completedMilestones = currentMilestones.filter(
      (milestone: any) => milestone.status === 'Completed',
    );
    const nonCompletedMilestones = currentMilestones.filter(
      (milestone: any) => milestone.status !== 'Completed',
    );

    const remainingWeight =
      100 -
      completedMilestones.reduce(
        (sum: number, milestone: any) => sum + Number(milestone?.weight ?? 0),
        0,
      );

    const totalNonCompletedMilestones = nonCompletedMilestones.length + 1;

    const weightPerMilestone = Math.round(
      remainingWeight / totalNonCompletedMilestones,
    );

    const newMilestone = {
      title: '',
      weight: weightPerMilestone,
      status: 'In Progress',
    };

    const updatedMilestones = [
      ...completedMilestones,
      ...nonCompletedMilestones.map((milestone: any) => ({
        ...milestone,
        weight: weightPerMilestone,
      })),
      newMilestone,
    ];

    const updatedKeyResultValue = {
      ...keyResultValue,
      milestones: updatedMilestones,
    };

    setKeyResultValue(updatedKeyResultValue);
  };

  const handleRemoveMilestone = (index: number, mId: any) => {
    const newKeyResult = [...objectiveValue?.keyResults];
    const currentMilestones = newKeyResult[index]?.milestones || [];

    // Keep original index to correctly remove based on overall index
    const completedMilestonesWithIdx = currentMilestones
      .map((milestone: any, idx: number) => ({ milestone, idx }))
      .filter((x: any) => x.milestone.status === 'Completed');
    const nonCompletedMilestonesWithIdx = currentMilestones
      .map((milestone: any, idx: number) => ({ milestone, idx }))
      .filter((x: any) => x.milestone.status !== 'Completed');

    const originalIndexToRemove =
      typeof mId === 'string'
        ? currentMilestones.findIndex((m: any) => String(m?.id) === String(mId))
        : Number(mId);

    const updatedNonCompletedMilestones = nonCompletedMilestonesWithIdx
      .filter((x: any) => x.idx !== originalIndexToRemove)
      .map((x: any) => x.milestone);

    const completedMilestones = completedMilestonesWithIdx.map(
      (x: any) => x.milestone,
    );

    const remainingWeight =
      100 -
      completedMilestones.reduce(
        (sum: number, milestone: any) => sum + Number(milestone?.weight ?? 0),
        0,
      );

    const totalNonCompletedMilestones = updatedNonCompletedMilestones.length;

    const recalculatedMilestones =
      totalNonCompletedMilestones <= 0
        ? [...completedMilestones]
        : [
            ...completedMilestones,
            ...updatedNonCompletedMilestones.map((milestone: any) => ({
              ...milestone,
              weight: Math.round(remainingWeight / totalNonCompletedMilestones),
            })),
          ];

    newKeyResult[index] = {
      ...newKeyResult[index],
      milestones: recalculatedMilestones,
    };

    const updatedObjectiveValue = {
      ...objectiveValue,
      keyResults: newKeyResult,
    };

    setObjectiveValue(updatedObjectiveValue);
  };

  const handleRemoveSingleMilestone = (mId: any) => {
    const updatedMilestones = keyResultValue.milestones.filter(
      (milestone: any, mi: any) =>
        typeof mId === 'string'
          ? String(milestone?.id) !== String(mId)
          : mi !== mId,
    );
    const newKeyResultValue = {
      ...keyResultValue,
      milestones: updatedMilestones,
    };
    setKeyResultValue(newKeyResultValue);
  };
  const handleChange = (value: any, field: string) => {
    if (isEdit) {
      handleSingleKeyResultChange(value, field);
    } else {
      handleKeyResultChange(value, index, field);
    }
  };
  const addMilestone = (index: number) => {
    if (isEdit) {
      handleAddMilestoneSingleMilestone();
    } else {
      handleAddMilestone(index);
    }
  };
  const milestoneChange = (
    value: any,
    keyResultIndex: number,
    milestoneId: any,
    field: string,
  ) => {
    if (isEdit) {
      handleMilestoneSingleChange(value, milestoneId, field);
      // Update form field value to prevent validation errors
      if (form && field === 'title') {
        form.setFieldValue(
          `milestones.${keyResultIndex}.${milestoneId}.title`,
          value,
        );
      }
    } else {
      handleMilestoneChange(value, keyResultIndex, milestoneId, field);
      // Update form field value for non-edit mode as well
      if (form && field === 'title') {
        form.setFieldValue(
          `milestones.${keyResultIndex}.${milestoneId}.title`,
          value,
        );
      }
    }
  };
  const milestoneRemove = (index: number, mindex: number | string) => {
    if (isEdit) {
      handleRemoveSingleMilestone(mindex);
    } else {
      handleRemoveMilestone(index, mindex);
    }
  };

  const { mutate: deleteKeyResult } = useDeleteKeyResult();
  const { mutate: deleteMilestone } = useDeleteMilestone();
  function handleKeyResultDelete(id: string) {
    deleteKeyResult(id, {
      onSuccess: () => {
        removeKeyResultValue(index);
      },
    });
  }
  function handleMilestoneDelete(id: string) {
    deleteMilestone(id, {
      onSuccess: () => {
        milestoneRemove(index, id);
      },
    });
  }

  // const isEditDisabled = keyValue && Number(keyValue?.progress) > 0;
  // const totalMilestoneWeight = keyValue?.milestones?.reduce(
  //   (sum: number, milestone: Milestone) =>
  //     Number(sum) + Number(milestone.weight),
  //   0,
  // );
  const { isMobile } = useIsMobile();
  return (
    <div
      className={`py-3 rounded-lg p-4 relative pb-6 ${isEdit ? '' : 'bg-gray-50'}`}
      id={`key-result-${index}`}
      data-cy={`okr-key-result-view-milestone-${index}`}
    >
      {/* Remove Button - positioned at top right */}
      {!isEdit && (
        <Tooltip
          title="Remove Key Result"
          id={`okr-key-result-view-milestone-remove-tooltip-${index}`}
          data-cy={`okr-key-result-view-milestone-remove-tooltip-${index}`}
        >
          <Popconfirm
            title="Are you sure you want to remove this key result?"
            onConfirm={() => handleKeyResultDelete(keyValue?.id)}
            okText="Yes"
            cancelText="No"
            id={`okr-key-result-view-milestone-remove-popconfirm-${index}`}
            data-cy={`okr-key-result-view-milestone-remove-popconfirm-${index}`}
          >
            <button
              className="absolute top-2 right-2 rounded-full w-6 h-6 bg-[#2B3CF1] hover:bg-[#1d2bb8] text-white flex items-center justify-center p-0"
              id={`okr-key-result-view-milestone-remove-button-${index}`}
              data-cy={`okr-key-result-view-milestone-remove-button-${index}`}
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
          </Popconfirm>
        </Tooltip>
      )}

      <Form
        form={form}
        layout="vertical"
        className="space-y-1 mt-10 "
        id={`okr-key-result-view-milestone-form-${index}`}
        data-cy={`okr-key-result-view-milestone-form-${index}`}
      >
        {/* Main Key Result Row - all fields in single row */}
        {/* Desktop Layout */}
        <div
          className={`${isMobile ? 'hidden' : 'flex'} items-center pb-3 px-6`}
          id={`okr-key-result-view-milestone-desktop-row-${index}`}
          data-cy={`okr-key-result-view-milestone-desktop-row-${index}`}
        >
          {/* Title Input */}
          <div className="flex-1">
            <Form.Item
              id={`okr-key-result-view-milestone-title-item-${index}`}
              data-cy={`okr-key-result-view-milestone-title-item-${index}`}
              className="w-full font-bold mb-0"
              rules={[
                {
                  required: true,
                  message: 'Milestone title is required',
                  validator: (notused, value) =>
                    value && value.trim() !== ''
                      ? Promise.resolve()
                      : Promise.reject(
                          new Error('Milestone title is required'),
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
                placeholder="Enter milestone title"
                data-cy={`okr-key-result-view-milestone-desktop-title-input-${index}`}
              />
              {!keyValue.title && (
                <div className="text-red-500 font-semibold absolute top-[30px]">
                  Milestone title is required
                </div>
              )}
            </Form.Item>
          </div>

          {/* Metric Type Dropdown */}
          <div className="w-48 ml-6">
            <Form.Item
              id={`okr-key-result-view-milestone-metric-type-item-${index}`}
              data-cy={`okr-key-result-view-milestone-metric-type-item-${index}`}
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
                  data-cy={`okr-key-result-view-milestone-desktop-metric-select-${index}`}
                >
                  {metrics?.items?.map((metric: any) => (
                    <Select.Option
                      id={`okr-key-result-view-milestone-desktop-metric-select-option-${index}-${metric?.id}`}
                      data-cy={`okr-key-result-view-milestone-desktop-metric-select-option-${index}-${metric?.id}`}
                      key={metric?.id}
                      value={metric?.id}
                    >
                      {metric?.name}
                    </Select.Option>
                  ))}
                </Select>
              ) : (
                <button
                  id={`okr-key-result-view-milestone-desktop-metric-select-button-${index}`}
                  data-cy={`okr-key-result-view-milestone-desktop-metric-select-button-${index}`}
                  className="w-full h-10 rounded-lg text-base bg-gray-100 border-gray-300 text-gray-600"
                  disabled
                >
                  Milestone
                </button>
              )}
            </Form.Item>
          </div>

          {/* Weight/Percentage */}
          <div className="w-24 ml-2">
            <Form.Item
              id={`okr-key-result-view-milestone-desktop-weight-item-${index}`}
              data-cy={`okr-key-result-view-milestone-desktop-weight-item-${index}`}
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
                disabled={isEdit}
                data-cy={`okr-key-result-view-milestone-desktop-weight-input-${index}`}
              />
            </Form.Item>
          </div>

          {/* Deadline */}
          <div className="w-48 ml-2">
            <Form.Item
              id={`okr-key-result-view-milestone-desktop-deadline-item-${index}`}
              data-cy={`okr-key-result-view-milestone-desktop-deadline-item-${index}`}
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
                data-cy={`okr-key-result-view-milestone-desktop-deadline-picker-${index}`}
              />
              {!keyValue.deadline && (
                <div
                  id={`okr-key-result-view-milestone-desktop-deadline-item-error-${index}`}
                  data-cy={`okr-key-result-view-milestone-desktop-deadline-item-error-${index}`}
                  className="text-red-500 font-semibold absolute top-[30px]"
                >
                  Deadline is required
                </div>
              )}
            </Form.Item>
          </div>
        </div>

        {/* Mobile Layout */}
        <div
          className={`${
            isMobile
              ? 'flex flex-col gap-3 mt-2 sm:mt-4 px-1 sm:px-2'
              : 'hidden'
          }`}
          id={`okr-key-result-view-milestone-mobile-section-${index}`}
          data-cy={`okr-key-result-view-milestone-mobile-section-${index}`}
        >
          {/* Row 1: Key Result Name */}
          <div>
            <Form.Item
              className="mb-0"
              id={`okr-key-result-view-milestone-mobile-title-item-${index}`}
              data-cy={`okr-key-result-view-milestone-mobile-title-item-${index}`}
              rules={[
                {
                  required: true,
                  message: 'Milestone title is required',
                  validator: (notused, value) =>
                    value && value.trim() !== ''
                      ? Promise.resolve()
                      : Promise.reject(
                          new Error('Milestone title is required'),
                        ),
                },
              ]}
            >
              <Input
                id={`key-result-title-mobile-${index}`}
                placeholder="Key Result Name"
                aria-label="Key Result Name"
                className="h-10 sm:h-11 rounded-lg text-sm sm:text-base"
                value={keyValue.title === '' ? undefined : keyValue.title}
                onChange={(e) => {
                  handleChange(e.target.value, 'title');
                }}
                data-cy={`okr-key-result-view-milestone-mobile-title-input-${index}`}
              />
              {!keyValue.title && (
                <div className="text-red-500 font-semibold absolute top-[30px]">
                  Milestone title is required
                </div>
              )}
            </Form.Item>
          </div>
          {/* Row 2: Type (full width on mobile) */}
          <div>
            <Form.Item
              className="mb-0"
              id={`okr-key-result-view-milestone-mobile-metric-type-item-${index}`}
              data-cy={`okr-key-result-view-milestone-mobile-metric-type-item-${index}`}
              rules={[
                {
                  required: true,
                  message: 'Please select a Key Result type',
                },
              ]}
            >
              {isEdit ? (
                <Select
                  className="w-full h-10 sm:h-11 rounded-lg text-sm sm:text-base"
                  placeholder="Select metric type"
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
                  data-cy={`okr-key-result-view-milestone-mobile-metric-select-${index}`}
                >
                  {metrics?.items?.map((metric: any) => (
                    <Select.Option
                      id={`okr-key-result-view-milestone-mobile-metric-select-option-${index}-${metric?.id}`}
                      data-cy={`okr-key-result-view-milestone-mobile-metric-select-option-${index}-${metric?.id}`}
                      key={metric?.id}
                      value={metric?.id}
                    >
                      {metric?.name}
                    </Select.Option>
                  ))}
                </Select>
              ) : (
                <Button
                  id={`okr-key-result-view-milestone-mobile-metric-select-button-${index}`}
                  data-cy={`okr-key-result-view-milestone-mobile-metric-select-button-${index}`}
                  className="w-full h-10 sm:h-11 rounded-lg text-sm sm:text-base bg-gray-100 border-gray-300 text-gray-600"
                  disabled
                >
                  Milestone
                </Button>
              )}
            </Form.Item>
          </div>
          {/* Row 3: Weight and Deadline */}
          <div className="flex flex-row gap-2">
            <Form.Item
              className="flex-1 mb-0"
              id={`okr-key-result-view-milestone-mobile-weight-item-${index}`}
              data-cy={`okr-key-result-view-milestone-mobile-weight-item-${index}`}
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
                className="w-full h-10 sm:h-11 rounded-lg text-sm sm:text-base"
                min={1}
                max={100}
                suffix="%"
                placeholder="100"
                value={keyValue?.weight || 0}
                onChange={(value) => {
                  handleChange(value, 'weight');
                }}
                disabled={isEdit}
                data-cy={`okr-key-result-view-milestone-mobile-weight-input-${index}`}
              />
            </Form.Item>
            <Form.Item
              className="flex-1 mb-0"
              id={`okr-key-result-view-milestone-mobile-deadline-item-${index}`}
              data-cy={`okr-key-result-view-milestone-mobile-deadline-item-${index}`}
            >
              <DatePicker
                id={`key-result-deadline-mobile-${index}`}
                className="w-full h-10 sm:h-11 rounded-lg text-sm sm:text-base"
                value={keyValue.deadline ? dayjs(keyValue.deadline) : null}
                format="YYYY-MM-DD"
                disabledDate={(current) => {
                  const startOfToday = dayjs().startOf('day');
                  const objectiveDeadline = dayjs(objectiveValue?.deadline);

                  return (
                    current &&
                    (current < startOfToday || current > objectiveDeadline)
                  );
                }}
                onChange={(dateString) => {
                  handleChange(dateString, 'deadline');
                }}
                data-cy={`okr-key-result-view-milestone-mobile-deadline-picker-${index}`}
              />
              {!keyValue.deadline && (
                <div
                  id={`okr-key-result-view-milestone-mobile-deadline-item-error-${index}`}
                  data-cy={`okr-key-result-view-milestone-mobile-deadline-item-error-${index}`}
                  className="text-red-500 font-semibold absolute top-[30px]"
                >
                  Deadline is required
                </div>
              )}
            </Form.Item>
          </div>
        </div>

        {/* Milestones Section */}
        {keyValue?.milestones?.length != 0 && keyValue?.milestones && (
          <Form.Item
            id={`okr-key-result-view-milestone-mobile-milestone-list-item-${index}`}
            data-cy={`okr-key-result-view-milestone-mobile-milestone-list-item-${index}`}
            className="mt-4"
            required
          >
            <div
              className={`${isMobile ? 'flex flex-col gap-2 sm:pl-3' : 'space-y-3 px-6'} ${isEdit ? 'bg-gray-50 rounded-lg py-2' : ''}`}
              id={`okr-key-result-view-milestone-mobile-milestone-list-${index}`}
              data-cy={`okr-key-result-view-milestone-mobile-milestone-list-${index}`}
            >
              {keyValue?.milestones.map((milestone, mindex) => (
                <div
                  key={milestone?.id || `${index}-${mindex}`}
                  className={
                    isMobile
                      ? 'flex flex-col xs:flex-row gap-2'
                      : 'flex items-center gap-2'
                  }
                  id={`milestone-${index}-${mindex}`}
                  data-cy={`okr-key-result-view-milestone-mobile-milestone-row-${index}-${mindex}`}
                >
                  <Form.Item
                    id={`okr-key-result-view-milestone-mobile-milestone-title-item-${index}-${mindex}`}
                    data-cy={`okr-key-result-view-milestone-mobile-milestone-title-item-${index}-${mindex}`}
                    name={['milestones', index, mindex, 'title']}
                    rules={[
                      {
                        required: true,
                        message: 'Milestone name is required',
                      },
                    ]}
                    className="flex-1 mb-0"
                    initialValue={milestone.title}
                  >
                    <Input
                      disabled={milestone?.status == 'Completed'}
                      id={`milestone-title-${index}-${mindex}`}
                      placeholder="Set Milestone"
                      onChange={(e) =>
                        milestoneChange(e.target.value, index, mindex, 'title')
                      }
                      className={
                        isMobile
                          ? 'h-10 sm:h-11 rounded-lg text-sm sm:text-base'
                          : 'h-10 rounded-lg text-base'
                      }
                      data-cy={`okr-key-result-view-milestone-mobile-milestone-title-input-${index}-${mindex}`}
                    />
                  </Form.Item>

                  {isMobile ? (
                    <div className="flex gap-2 items-center">
                      <Form.Item className="flex-1 xs:w-20 sm:w-24 mb-0">
                        <InputNumber
                          disabled={milestone?.status == 'Completed'}
                          id={`milestone-weight-${index}-${mindex}`}
                          min={0}
                          max={100}
                          placeholder="Weight"
                          suffix="%"
                          value={milestone.weight}
                          onChange={(value) =>
                            milestoneChange(value, index, mindex, 'weight')
                          }
                          className="w-full h-10 sm:h-11 rounded-lg text-sm sm:text-base"
                          data-cy={`okr-key-result-view-milestone-mobile-milestone-weight-input-${index}-${mindex}`}
                        />
                      </Form.Item>
                      <Popconfirm
                        id={`okr-key-result-view-milestone-mobile-milestone-remove-popconfirm-${index}-${mindex}`}
                        data-cy={`okr-key-result-view-milestone-mobile-milestone-remove-popconfirm-${index}-${mindex}`}
                        title="Are you sure you want to remove this milestone?"
                        onConfirm={() =>
                          milestone?.id
                            ? handleMilestoneDelete(milestone?.id)
                            : milestoneRemove(index, mindex)
                        }
                        okText="Yes"
                        cancelText="No"
                        placement="top"
                        disabled={milestone?.status === 'Completed'}
                      >
                        <Tooltip
                          id={`okr-key-result-view-milestone-mobile-milestone-remove-tooltip-${index}-${mindex}`}
                          data-cy={`okr-key-result-view-milestone-mobile-milestone-remove-tooltip-${index}-${mindex}`}
                          title={
                            milestone?.status === 'Completed'
                              ? 'This milestone is completed and cannot be removed.'
                              : 'Remove Milestone'
                          }
                        >
                          <button
                            disabled={milestone?.status === 'Completed'}
                            id={`okr-key-result-view-milestone-mobile-milestone-remove-button-${index}-${mindex}`}
                            data-cy={`okr-key-result-view-milestone-mobile-milestone-remove-button-${index}-${mindex}`}
                            title="Remove Milestone"
                            aria-label="Remove Milestone"
                            className="bg-[#2B3CF1] hover:bg-[#1d2bb8] text-white rounded-full w-6 h-6 flex items-center justify-center shadow flex-shrink-0"
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
                        </Tooltip>
                      </Popconfirm>

                      {/* Add Milestone Button - only show next to first milestone */}
                      {mindex === 0 && (
                        <button
                          id={`okr-key-result-view-milestone-mobile-milestone-add-button-${index}`}
                          data-cy={`okr-key-result-view-milestone-mobile-milestone-add-button-${index}`}
                          className="bg-[#2B3CF1] hover:bg-[#1d2bb8] text-white rounded-lg h-6 px-2 flex items-center justify-center shadow flex-shrink-0"
                          aria-label="Add Milestone"
                          onClick={() => addMilestone(index)}
                          type="button"
                        >
                          <span className="hidden xs:inline text-xs">Add</span>
                          <span className="xs:hidden text-sm">+</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    <>
                      <Form.Item
                        id={`okr-key-result-view-milestone-desktop-milestone-weight-item-${index}-${mindex}`}
                        data-cy={`okr-key-result-view-milestone-desktop-milestone-weight-item-${index}-${mindex}`}
                        className="w-24 mb-0"
                      >
                        <InputNumber
                          disabled={milestone?.status == 'Completed'}
                          id={`milestone-weight-${index}-${mindex}`}
                          min={0}
                          max={100}
                          suffix="%"
                          value={milestone.weight}
                          onChange={(value) =>
                            milestoneChange(value, index, mindex, 'weight')
                          }
                          className="w-full h-10 rounded-lg text-base"
                          data-cy={`okr-key-result-view-milestone-desktop-milestone-weight-input-${index}-${mindex}`}
                        />
                      </Form.Item>

                      <div className="w-48 flex gap-2 items-center">
                        <Popconfirm
                          id={`okr-key-result-view-milestone-desktop-milestone-remove-popconfirm-${index}-${mindex}`}
                          data-cy={`okr-key-result-view-milestone-desktop-milestone-remove-popconfirm-${index}-${mindex}`}
                          title="Are you sure you want to remove this milestone?"
                          onConfirm={() =>
                            milestone?.id
                              ? handleMilestoneDelete(milestone?.id)
                              : milestoneRemove(index, mindex)
                          }
                          okText="Yes"
                          cancelText="No"
                          placement="top"
                          disabled={milestone?.status === 'Completed'}
                        >
                          <Tooltip
                            id={`okr-key-result-view-milestone-desktop-milestone-remove-tooltip-${index}-${mindex}`}
                            data-cy={`okr-key-result-view-milestone-desktop-milestone-remove-tooltip-${index}-${mindex}`}
                            title={
                              milestone?.status === 'Completed'
                                ? 'This milestone is completed and cannot be removed.'
                                : 'Remove Milestone'
                            }
                          >
                            <Button
                              disabled={milestone?.status === 'Completed'}
                              id={`okr-key-result-view-milestone-desktop-milestone-remove-button-${index}-${mindex}`}
                              data-cy={`okr-key-result-view-milestone-desktop-milestone-remove-button-${index}-${mindex}`}
                              icon={
                                <VscClose size={12} className="text-white" />
                              }
                              className="rounded-full w-6 h-6 bg-[#2B3CF1] hover:bg-[#1d2bb8] border-none flex items-center justify-center"
                              type="primary"
                            />
                          </Tooltip>
                        </Popconfirm>

                        {/* Add Milestone Button - only show next to first milestone */}
                        {mindex === 0 && (
                          <Button
                            id={`okr-key-result-view-milestone-desktop-milestone-add-button-${index}`}
                            data-cy={`okr-key-result-view-milestone-desktop-milestone-add-button-${index}`}
                            className="bg-[#2B3CF1] hover:bg-[#1d2bb8] text-white font-semibold rounded-lg h-10 flex items-center justify-center flex-1"
                            type="primary"
                            onClick={() => addMilestone(index)}
                          >
                            Add Milestone
                          </Button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </Form.Item>
        )}

        {/* Sample Milestone for display when no milestones exist */}
        {(!keyValue?.milestones || keyValue?.milestones?.length === 0) && (
          <Form.Item
            id={`okr-key-result-view-milestone-mobile-milestone-list-item-${index}`}
            data-cy={`okr-key-result-view-milestone-mobile-milestone-list-item-${index}`}
            className="mt-4"
            required
          >
            <div
              className={`${isMobile ? 'flex flex-col gap-2 pl-2 sm:pl-3' : 'space-y-3 px-6'} ${isEdit ? 'bg-gray-50 rounded-lg py-2' : ''}`}
              id={`okr-key-result-view-milestone-mobile-milestone-list-${index}`}
              data-cy={`okr-key-result-view-milestone-mobile-milestone-list-${index}`}
            >
              {isMobile ? (
                <div
                  className="flex flex-col xs:flex-row gap-2"
                  id={`okr-key-result-view-milestone-mobile-milestone-list-row-${index}`}
                  data-cy={`okr-key-result-view-milestone-mobile-milestone-list-row-${index}`}
                >
                  <Form.Item
                    id={`okr-key-result-view-milestone-mobile-milestone-title-item-${index}`}
                    data-cy={`okr-key-result-view-milestone-mobile-milestone-title-item-${index}`}
                    className="flex-1 mb-0"
                  >
                    <Input
                      placeholder="Set Milestone"
                      id={`okr-key-result-view-milestone-mobile-milestone-title-input-${index}`}
                      data-cy={`okr-key-result-view-milestone-mobile-milestone-title-input-${index}`}
                      className="h-10 sm:h-11 rounded-lg text-sm sm:text-base"
                      disabled
                    />
                  </Form.Item>
                  <div className="flex gap-2">
                    <Form.Item
                      id={`okr-key-result-view-milestone-mobile-milestone-weight-item-${index}`}
                      data-cy={`okr-key-result-view-milestone-mobile-milestone-weight-item-${index}`}
                      className="flex-1 xs:w-20 sm:w-24 mb-0"
                    >
                      <InputNumber
                        placeholder="Weight"
                        id={`okr-key-result-view-milestone-mobile-milestone-weight-input-${index}`}
                        data-cy={`okr-key-result-view-milestone-mobile-milestone-weight-input-${index}`}
                        suffix="%"
                        className="w-full h-10 sm:h-11 rounded-lg text-sm sm:text-base"
                        disabled
                      />
                    </Form.Item>
                    <button
                      id={`okr-key-result-view-milestone-mobile-milestone-remove-button-${index}`}
                      data-cy={`okr-key-result-view-milestone-mobile-milestone-remove-button-${index}`}
                      className="bg-[#2B3CF1] hover:bg-[#1d2bb8] text-white rounded-full w-6 h-6 flex items-center justify-center shadow transition-colors flex-shrink-0"
                      disabled
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
                    <Button
                      id={`okr-key-result-view-milestone-mobile-milestone-add-button-${index}`}
                      data-cy={`okr-key-result-view-milestone-mobile-milestone-add-button-${index}`}
                      className="bg-[#2B3CF1] hover:bg-[#1d2bb8] text-white font-semibold rounded-lg h-6 px-2 flex items-center justify-center flex-shrink-0"
                      aria-label="Add Milestone"
                      onClick={() => addMilestone(index)}
                      type="primary"
                    >
                      <span className="hidden xs:inline text-xs">Add</span>
                      <span className="xs:hidden text-sm">+</span>
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  id={`okr-key-result-view-milestone-desktop-milestone-list-row-${index}`}
                  data-cy={`okr-key-result-view-milestone-desktop-milestone-list-row-${index}`}
                  className="flex items-center gap-2"
                >
                  <Form.Item
                    id={`okr-key-result-view-milestone-desktop-milestone-title-item-${index}`}
                    data-cy={`okr-key-result-view-milestone-desktop-milestone-title-item-${index}`}
                    className="flex-1 mb-0"
                  >
                    <Input
                      placeholder="Set Milestone"
                      id={`okr-key-result-view-milestone-desktop-milestone-title-input-${index}`}
                      data-cy={`okr-key-result-view-milestone-desktop-milestone-title-input-${index}`}
                      className="h-10 rounded-lg text-base"
                      disabled
                    />
                  </Form.Item>

                  <Form.Item
                    id={`okr-key-result-view-milestone-desktop-milestone-weight-item-${index}`}
                    data-cy={`okr-key-result-view-milestone-desktop-milestone-weight-item-${index}`}
                    className="w-24 mb-0"
                  >
                    <InputNumber
                      placeholder="100"
                      id={`okr-key-result-view-milestone-desktop-milestone-weight-input-${index}`}
                      data-cy={`okr-key-result-view-milestone-desktop-milestone-weight-input-${index}`}
                      suffix="%"
                      className="w-full h-10 rounded-lg text-base"
                      disabled
                    />
                  </Form.Item>

                  <div className="w-48 flex gap-2 items-center">
                    <Button
                      id={`okr-key-result-view-milestone-desktop-milestone-remove-button-${index}`}
                      data-cy={`okr-key-result-view-milestone-desktop-milestone-remove-button-${index}`}
                      className="rounded-full w-6 h-6 bg-[#2B3CF1] hover:bg-[#1d2bb8] border-none flex items-center justify-center"
                      disabled
                    >
                      <VscClose size={12} className="text-white" />
                    </Button>

                    <Button
                      id={`okr-key-result-view-milestone-desktop-milestone-add-button-${index}`}
                      data-cy={`okr-key-result-view-milestone-desktop-milestone-add-button-${index}`}
                      className="bg-[#2B3CF1] hover:bg-[#1d2bb8] text-white font-semibold rounded-lg h-10 flex items-center justify-center flex-1"
                      type="primary"
                      onClick={() => addMilestone(index)}
                    >
                      Add Milestone
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Form.Item>
        )}
      </Form>
    </div>
  );
};

export default MilestoneView;
