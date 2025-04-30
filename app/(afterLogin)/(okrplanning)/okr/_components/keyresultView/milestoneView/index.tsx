import React from 'react';
import {
  Button,
  Input,
  DatePicker,
  Form,
  InputNumber,
  Tooltip,
  Popconfirm,
} from 'antd';
import dayjs from 'dayjs';
import { VscClose } from 'react-icons/vsc';
import { GoPlus } from 'react-icons/go';
import {
  Milestone,
  OKRProps,
} from '@/store/uistate/features/okrplanning/okr/interface';
import { useOKRStore } from '@/store/uistate/features/okrplanning/okr';
import {
  useDeleteKeyResult,
  useDeleteMilestone,
} from '@/store/server/features/okrplanning/okr/objective/mutations';

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
    } else {
      handleMilestoneChange(value, keyResultIndex, milestoneId, field);
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

  const isEditDisabled = keyValue && Number(keyValue?.progress) > 0;
  const totalMilestoneWeight = keyValue?.milestones?.reduce(
    (sum: number, milestone: Milestone) => Number(sum) + Number(milestone.weight),
    0,
  );
  return (
    <div
      className="py-4  border-b-[1px] border-gray-300"
      id={`key-result-${index}`}
    >
      <Form form={form} layout="vertical" className="space-y-1">
        <div className="flex gap-3 items-center mb-4">
          {!keyValue.id && (
            <div className="rounded-lg border-gray-200 border bg-gray-300 w-10 h-8 flex justify-center items-center mt-2">
              {index + 1}
            </div>
          )}
          <div></div>
          <Form.Item
            label={
              (keyValue.key_type === 'Milestone' && 'Milestone') ||
              keyValue.metricType?.name
            }
            className="w-full font-bold"
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
              id={`key-result-title-${index}`}
              value={keyValue.title || ''}
              onChange={(e) => {
                handleChange(e.target.value, 'title');
              }}
            />
            {!keyValue.title && (
              <div className="text-red-500 font-semibold absolute top-[30px]">
                Milestone title is required
              </div>
            )}
          </Form.Item>
          <Form.Item
            className="w-24 font-bold"
            label="Weight"
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
            />
          </Form.Item>

          <div className="flex gap-2 mt-2">
            <Tooltip color="gray" title="Add Milestones">
              <Button
                id={`add-milestone-${index}`}
                className="rounded-full w-5 h-5"
                icon={<GoPlus size={20} />}
                type="primary"
                onClick={() => addMilestone(index)}
              />
            </Tooltip>
            <Popconfirm
              title="Are you sure you want to remove this key result?"
              onConfirm={() =>
                keyValue?.id
                  ? handleKeyResultDelete(keyValue?.id)
                  : removeKeyResultValue(index)
              }
              okText={'Yes'}
              cancelText="No"
              placement="top"
            >
              <Tooltip color="gray" title="Remove Key Result">
                <Button
                  id={`remove-key-result-${index}`}
                  className="rounded-full w-5 h-5"
                  icon={<VscClose size={20} />}
                  type="primary"
                  disabled={isEditDisabled}
                />
              </Tooltip>
            </Popconfirm>
          </div>
        </div>
        <div className="flex gap-10 items-center mb-10">
          <Form.Item
            layout="horizontal"
            className="w-full h-5 font-bold "
            label="Deadline"
          >
            <DatePicker
              id={`key-result-deadline-${index}`}
              value={keyValue.deadline ? dayjs(keyValue.deadline) : null}
              onChange={(dateString) => {
                handleChange(dateString, 'deadline');
              }}
              format="YYYY-MM-DD"
              disabledDate={(current) => {
                const startOfToday = dayjs().startOf('day');
                const objectiveDeadline = dayjs(objectiveValue?.deadline); // Ensure this variable exists in your scope

                // Disable dates before today and above the objective deadline
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

          <div className="text-end w-full">
            {keyValue.milestones?.length != 0 &&
              keyValue.milestones &&
              `You have ${keyValue.milestones?.length} milestones under this key result`}
          </div>
        </div>

        {keyValue?.milestones?.length != 0 && keyValue?.milestones && (
          <Form.Item
            className="px-5"
            label={<span className="mt-3"> Milestones</span>}
            required
          >
            {keyValue?.milestones.map((milestone, mindex) => (
              <div
                key={mindex}
                className="flex items-start space-x-2 mb-2"
                id={`milestone-${index}-${mindex}`}
              >
                <div className="rounded-lg border-gray-200 border bg-gray-300 w-8 h-8 flex justify-center items-center">
                  {index + 1}.{mindex + 1}
                </div>

                <Form.Item
                  name={['milestones', index, mindex, 'title']}
                  rules={[
                    { required: true, message: 'Milestone name is required' },
                  ]}
                  className="flex-1 "
                >
                  <Input
                    disabled={milestone?.status == 'Completed'}
                    id={`milestone-title-${index}-${mindex}`}
                    placeholder={`${milestone.title}`}
                    defaultValue={`${milestone.title}`}
                    onChange={(e) =>
                      milestoneChange(e.target.value, index, mindex, 'title')
                    }
                  />
                </Form.Item>

                <Form.Item>
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
                  />
                </Form.Item>
                <Form.Item>
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
                    disabled={milestone?.status === 'Completed'} // Disable Popconfirm if the milestone is completed
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
                        icon={<VscClose size={20} />}
                        className="rounded-full w-5 h-5"
                        type="primary"
                      />
                    </Tooltip>
                  </Popconfirm>
                </Form.Item>
              </div>
            ))}
            <div className="flex justify-end">
              <span className="text-sm text-gray-500">
                Total Milestone Weight:{' '}
                <strong>{totalMilestoneWeight} %</strong>
              </span>
            </div>
          </Form.Item>
        )}
      </Form>
    </div>
  );
};

export default MilestoneView;
