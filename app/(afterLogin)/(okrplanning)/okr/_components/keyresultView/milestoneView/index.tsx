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
import { GoPlus } from 'react-icons/go';

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
      weight: 0,
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
              (sum: number, milestone: Milestone) => sum + milestone.weight,
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
        (sum: number, milestone: any) => sum + milestone.weight,
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

    const completedMilestones = currentMilestones.filter(
      (milestone: any) => milestone.status === 'Completed',
    );
    const nonCompletedMilestones = currentMilestones.filter(
      (milestone: any) => milestone.status !== 'Completed',
    );

    const updatedNonCompletedMilestones = nonCompletedMilestones.filter(
      (notused: any, mi: number) => mi !== mId,
    );

    const remainingWeight =
      100 -
      completedMilestones.reduce(
        (sum: number, milestone: any) => sum + milestone.weight,
        0,
      );

    const totalNonCompletedMilestones = updatedNonCompletedMilestones.length;

    const weightPerMilestone = Math.round(
      remainingWeight / totalNonCompletedMilestones,
    );

    const recalculatedMilestones = [
      ...completedMilestones,
      ...updatedNonCompletedMilestones.map((milestone: any) => ({
        ...milestone,
        weight: weightPerMilestone,
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
      (form: any, mi: any) => mi !== mId,
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
      if (form && field === 'title') {
        form.setFieldValue(
          `milestones.${keyResultIndex}.${milestoneId}.title`,
          value,
        );
      }
    } else {
      handleMilestoneChange(value, keyResultIndex, milestoneId, field);
      if (form && field === 'title') {
        form.setFieldValue(
          `milestones.${keyResultIndex}.${milestoneId}.title`,
          value,
        );
      }
    }
  };
  const milestoneRemove = (index: number, mindex: number) => {
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
  function handleMilestoneDelete(id: string, mIndex: number) {
    deleteMilestone(id, {
      onSuccess: () => {
        milestoneRemove(index, mIndex);
      },
    });
  }

  const { isMobile } = useIsMobile();
  return (
    <div
      className={`py-3 rounded-lg p-3 sm:p-4 md:p-6 relative pb-6 ${isEdit ? '' : 'bg-gray-50'}`}
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
              className="absolute top-2 right-2 rounded-full w-6 h-6 sm:w-7 sm:h-7 bg-[#2B3CF1] hover:bg-[#1d2bb8] text-white flex items-center justify-center p-0 transition-colors z-10"
            />
          </Popconfirm>
        </Tooltip>
      )}

      <Form form={form} layout="vertical" className="space-y-1 mt-8 sm:mt-10">
        {/* Main Key Result Row */}
        {/* Desktop Layout */}
        <div
          className={`${isMobile ? 'hidden' : 'flex'} flex-col lg:flex-row gap-2 items-stretch lg:items-center pb-3 px-2 md:px-6`}
        >
          {/* Title Input */}
          <div className="flex-1">
            <Form.Item
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
                className="h-10 md:h-11 rounded-lg border-gray-300"
                placeholder="Enter milestone title"
              />
              {!keyValue.title && (
                <div className="text-red-500 text-xs sm:text-sm font-semibold absolute top-[34px] md:top-[38px]">
                  Milestone title is required
                </div>
              )}
            </Form.Item>
          </div>

          <div className="flex gap-2 flex-wrap lg:flex-nowrap">
            {/* Metric Type Dropdown */}
            <div className="flex-1 lg:w-40 xl:w-48 min-w-[180px]">
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
                    className="w-full h-10 md:h-11 rounded-lg text-base"
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
                    className="w-full h-10 md:h-11 rounded-lg text-base bg-gray-100 border-gray-300 text-gray-600"
                    disabled
                  >
                    Milestone
                  </Button>
                )}
              </Form.Item>
            </div>

            {/* Weight/Percentage */}
            <div className="w-20 md:w-24">
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
                  className="w-full h-10 md:h-11 rounded-lg border-gray-300"
                  suffix="%"
                  disabled={isEdit}
                />
              </Form.Item>
            </div>

            {/* Deadline */}
            <div className="flex-1 lg:w-40 xl:w-48 min-w-[140px]">
              <Form.Item className="w-full font-bold mb-0">
                <DatePicker
                  id={`key-result-deadline-${index}`}
                  value={keyValue.deadline ? dayjs(keyValue.deadline) : null}
                  onChange={(dateString) => {
                    handleChange(dateString, 'deadline');
                  }}
                  format="YYYY-MM-DD"
                  className="w-full h-10 md:h-11 rounded-lg border-gray-300"
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
                  <div className="text-red-500 text-xs sm:text-sm font-semibold absolute top-[34px] md:top-[38px]">
                    Deadline is required
                  </div>
                )}
              </Form.Item>
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div
          className={`${isMobile ? 'flex' : 'hidden'} flex-col gap-3 px-1 sm:px-2`}
        >
          {/* Row 1: Title */}
          <Form.Item
            className="w-full font-bold mb-0"
            rules={[
              {
                required: true,
                message: 'Milestone title is required',
                validator: (notused, value) =>
                  value && value.trim() !== ''
                    ? Promise.resolve()
                    : Promise.reject(new Error('Milestone title is required')),
              },
            ]}
          >
            <Input
              id={`key-result-title-mobile-${index}`}
              value={keyValue.title || ''}
              onChange={(e) => {
                handleChange(e.target.value, 'title');
              }}
              className="h-10 sm:h-11 rounded-lg border-gray-300 text-sm sm:text-base"
              placeholder="Enter milestone title"
            />
            {!keyValue.title && (
              <div className="text-red-500 text-xs sm:text-sm font-semibold absolute top-[34px] sm:top-[38px]">
                Milestone title is required
              </div>
            )}
          </Form.Item>

          {/* Row 2: Type, Weight, and Deadline in one row */}
          <div className="flex gap-2">
            <Form.Item
              className="flex-1 font-bold mb-0"
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
                >
                  {metrics?.items?.map((metric: any) => (
                    <Select.Option key={metric?.id} value={metric?.id}>
                      {metric?.name}
                    </Select.Option>
                  ))}
                </Select>
              ) : (
                <Button
                  className="w-full h-10 sm:h-11 rounded-lg text-sm sm:text-base bg-gray-100 border-gray-300 text-gray-600"
                  disabled
                >
                  Milestone
                </Button>
              )}
            </Form.Item>

          {/* Row 3: Weight and Deadline */}
          <div className="flex gap-2">
            <Form.Item
              className="flex-1 font-bold mb-0"
              rules={[
                { required: true, message: 'Weight required' },
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
                className="w-full h-10 sm:h-11 rounded-lg border-gray-300 text-sm sm:text-base"
                suffix="%"
                disabled={isEdit}
              />
            </Form.Item>

            <Form.Item className="flex-1 font-bold mb-0">
              <DatePicker
                id={`key-result-deadline-mobile-${index}`}
                value={keyValue.deadline ? dayjs(keyValue.deadline) : null}
                onChange={(dateString) => {
                  handleChange(dateString, 'deadline');
                }}
                format="YYYY-MM-DD"
                className="w-full h-10 sm:h-11 rounded-lg border-gray-300 text-sm sm:text-base"
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
                <div className="text-red-500 text-xs sm:text-sm font-semibold absolute top-[34px] sm:top-[38px]">
                  Deadline required
                </div>
              )}
            </Form.Item>
          </div>
        </div>

        {/* Milestones Section */}
        {keyValue?.milestones?.length != 0 && keyValue?.milestones && (
          <Form.Item className="pl-2 sm:pl-3 md:pl-5 mt-4" required>
            <div
              className={`space-y-3 px-2 sm:px-4 md:px-6 ${isEdit ? 'bg-gray-50 rounded-lg py-2' : ''}`}
            >
              {keyValue?.milestones.map((milestone, mindex) => (
                <div
                  key={mindex}
                  className={`flex ${isMobile ? 'flex-col' : 'flex-col md:flex-row'} items-stretch ${isMobile ? '' : 'md:items-center'} gap-2`}
                  id={`milestone-${index}-${mindex}`}
                >
                  <Form.Item
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
                      className="h-10 sm:h-11 rounded-lg text-sm sm:text-base"
                    />
                  </Form.Item>

                  {isMobile ? (
                    <div className="flex gap-2 w-full">
                      <Form.Item className="w-20 sm:w-24 mb-0">
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
                          className="w-full h-10 sm:h-11 rounded-lg text-sm sm:text-base"
                        />
                      </Form.Item>

                      <div className="flex gap-2 items-center">
                        <Popconfirm
                          title="Are you sure you want to remove this milestone?"
                          onConfirm={() =>
                            milestone?.id
                              ? handleMilestoneDelete(milestone?.id, mindex)
                              : milestoneRemove(index, mindex)
                          }
                          okText="Yes"
                          cancelText="No"
                          placement="top"
                          disabled={milestone?.status === 'Completed'}
                        >
                          <Tooltip
                            title={
                              milestone?.status === 'Completed'
                                ? 'This milestone is completed and cannot be removed.'
                                : 'Remove Milestone'
                            }
                          >
                            <Button
                              disabled={milestone?.status === 'Completed'}
                              id={`remove-milestone-${index}-${mindex}`}
                              icon={
                                <VscClose size={18} className="text-white" />
                              }
                              className="rounded-full w-10 h-10 sm:w-11 sm:h-11 bg-[#2B3CF1] hover:bg-[#1d2bb8] border-none flex items-center justify-center flex-shrink-0"
                              type="primary"
                            />
                          </Tooltip>
                        </Popconfirm>

                        {/* Add Milestone Button - only show next to first milestone */}
                        {mindex === 0 && (
                          <Button
                            id={`add-milestone-${index}`}
                            className="rounded-full w-10 h-10 sm:w-11 sm:h-11 bg-[#2B3CF1] hover:bg-[#1d2bb8] text-white border-none shadow-none flex items-center justify-center flex-shrink-0 p-0"
                            type="primary"
                            onClick={() => addMilestone(index)}
                          >
                            <GoPlus size={20} />
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex gap-2 flex-1 md:flex-none">
                        <Form.Item className="w-20 md:w-24 mb-0">
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
                            className="w-full h-10 md:h-11 rounded-lg text-base"
                          />
                        </Form.Item>

                        <div className="flex gap-2 items-center flex-1 md:w-40 lg:w-48">
                          <Popconfirm
                            title="Are you sure you want to remove this milestone?"
                            onConfirm={() =>
                              milestone?.id
                                ? handleMilestoneDelete(milestone?.id, mindex)
                                : milestoneRemove(index, mindex)
                            }
                            okText="Yes"
                            cancelText="No"
                            placement="top"
                            disabled={milestone?.status === 'Completed'}
                          >
                            <Tooltip
                              title={
                                milestone?.status === 'Completed'
                                  ? 'This milestone is completed and cannot be removed.'
                                  : 'Remove Milestone'
                              }
                            >
                              <Button
                                disabled={milestone?.status === 'Completed'}
                                id={`remove-milestone-${index}-${mindex}`}
                                icon={
                                  <VscClose size={12} className="text-white" />
                                }
                                className="rounded-full w-10 h-10 md:w-11 md:h-11 bg-[#2B3CF1] hover:bg-[#1d2bb8] border-none flex items-center justify-center flex-shrink-0"
                                type="primary"
                              />
                            </Tooltip>
                          </Popconfirm>

                          {/* Add Milestone Button - only show next to first milestone */}
                          {mindex === 0 && (
                            <Button
                              id={`add-milestone-${index}`}
                              className="bg-[#2B3CF1] hover:bg-[#1d2bb8] text-white font-semibold rounded-lg h-10 md:h-11 flex items-center justify-center flex-1"
                              type="primary"
                              onClick={() => addMilestone(index)}
                            >
                              Add Milestone
                            </Button>
                          )}
                        </div>
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
          <Form.Item className="pl-2 sm:pl-3 md:pl-5 mt-4" required>
            <div
              className={`space-y-3 px-2 sm:px-4 md:px-6 ${isEdit ? 'bg-gray-50 rounded-lg py-2' : ''}`}
            >
              <div
                className={`flex ${isMobile ? 'flex-col' : 'flex-col md:flex-row'} items-stretch ${isMobile ? '' : 'md:items-center'} gap-2`}
              >
                <Form.Item className="flex-1 mb-0">
                  <Input
                    placeholder="Set Milestone"
                    className="h-10 sm:h-11 rounded-lg text-sm sm:text-base"
                    disabled
                  />
                </Form.Item>

                {isMobile ? (
                  <div className="flex gap-2 w-full">
                    <Form.Item className="w-20 sm:w-24 mb-0">
                      <InputNumber
                        placeholder="100"
                        suffix="%"
                        className="w-full h-10 sm:h-11 rounded-lg text-sm sm:text-base"
                        disabled
                      />
                    </Form.Item>

                    <div className="flex gap-2 items-center">
                      <Button
                        className="absolute top-2 right-2 bg-[#2B3CF1] hover:bg-[#1d2bb8] text-white rounded-full w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center shadow transition-colors"
                        disabled
                      >
                        <VscClose />
                      </Button>

                      <Button
                        id={`add-milestone-${index}`}
                        className="rounded-lg w-10 h-10 sm:w-11 sm:h-11 bg-[#2B3CF1] hover:bg-[#1d2bb8] border-none flex items-center justify-center flex-shrink-0"
                        type="primary"
                        onClick={() => addMilestone(index)}
                      >
                        <GoPlus size={20} />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex gap-2 flex-1 md:flex-none">
                      <Form.Item className="w-20 md:w-24 mb-0">
                        <InputNumber
                          placeholder="100"
                          suffix="%"
                          className="w-full h-10 md:h-11 rounded-lg text-base"
                          disabled
                        />
                      </Form.Item>

                      <div className="flex gap-2 items-center flex-1 md:w-40 lg:w-48">
                        <Button
                          className="absolute top-2 right-2 rounded-full w-6 h-6 bg-[#2B3CF1] hover:bg-[#1d2bb8] text-white flex items-center justify-center p-0"
                          disabled
                        >
                          <VscClose className="text-white" />
                        </Button>

                        <Button
                          id={`add-milestone-${index}`}
                          className="bg-[#2B3CF1] hover:bg-[#1d2bb8] text-white font-semibold rounded-lg h-10 md:h-11 flex items-center justify-center flex-1"
                          type="primary"
                          onClick={() => addMilestone(index)}
                        >
                          Add Milestone
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </Form.Item>
        )}
      </Form>
    </div>
  );
};

export default MilestoneView;
