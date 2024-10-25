import React from 'react';
import { Button, Input, DatePicker, Form, InputNumber, Tooltip } from 'antd';
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
import NotificationMessage from '@/components/common/notification/notificationMessage';

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
  const milestoneWeightSum = keyValue?.milestones.reduce(
    (acc, milestone) => acc + milestone.weight,
    0,
  );
  const handleAddMilestone = (index: number) => {
    const newMilestone: Milestone = {
      title: '',
      weight: 0,
    };
    const updatedObjectiveValue = {
      ...objectiveValue,
      keyResults: objectiveValue?.keyResults.map((item: any, i: number) =>
        i === index
          ? {
              ...item,
              milestones: [...item.milestones, newMilestone],
            }
          : item,
      ),
    };
    setObjectiveValue(updatedObjectiveValue);
  };
  const handleAddMilestoneSingleMilestone = () => {
    const newMilestone = {
      title: '',
      weight: 0,
    };
    const updatedKeyResultValue = {
      ...keyResultValue,
      milestones: [...keyResultValue.milestones, newMilestone],
    };
    setKeyResultValue(updatedKeyResultValue);
  };

  const handleRemoveMilestone = (index: number, mId: any) => {
    const newKeyResult = [...objectiveValue?.keyResults];
    const updatedMilestones = newKeyResult[index].milestones.filter(
      (form: any, mi: number) => mi !== mId,
    );
    newKeyResult[index] = {
      ...newKeyResult[index],
      milestones: updatedMilestones,
    };
    const updatedObjectiveValue = {
      ...objectiveValue,
      keyResults: objectiveValue.keyResults.map((item: any, i: number) =>
        i === index
          ? {
              ...item,
              milestones: updatedMilestones,
            }
          : item,
      ),
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
    if (milestoneWeightSum >= keyValue?.weight) {
      NotificationMessage?.warning({
        message:
          'Please Milestone weight should be not greater than Key Result weight ',
      });
    } else if (milestoneWeightSum == keyValue?.weight) {
      NotificationMessage?.warning({
        message: 'Please Milestone weight should be equal to Key Result weight',
      });
    } else {
      if (isEdit) {
        handleAddMilestoneSingleMilestone();
      } else {
        handleAddMilestone(index);
      }
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
  return (
    <div className="py-4  border-b-[1px] border-gray-300" id={`key-result-${index}`}>
      <Form form={form} layout="vertical" className="space-y-1">
        <div className="flex gap-3 items-center">
          {!keyValue.id && (
            <div className="rounded-lg border-gray-200 border bg-gray-300 w-10 h-8 flex justify-center items-center mt-2">
              {index + 1}
            </div>
          )}
          <Form.Item
            label={
              (keyValue.key_type === 'Milestone' && 'Milestone') ||
              keyValue.metricType?.name
            }
            className="w-full font-bold"
            rules={[{ required: true, message: 'Milestone title is required' }]}
          >
            <Input
              id={`key-result-title-${index}`}
              value={keyValue.title || ''}
              onChange={(e) => {
                handleChange(e.target.value, 'title');
              }}
            />
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
            <Tooltip color="gray" title="Remove Key Result">
              <Button
                id={`remove-key-result-${index}`}
                className="rounded-full w-5 h-5"
                icon={<VscClose size={20} />}
                type="primary"
                onClick={() =>
                  keyValue?.id
                    ? handleKeyResultDelete(keyValue?.id)
                    : removeKeyResultValue(index)
                }
              />
            </Tooltip>
          </div>
        </div>
        <div className="flex gap-10 items-center">
          <Form.Item
            layout="horizontal"
            className="w-full h-5  font-bold"
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
                return current && current < dayjs().startOf('day');
              }}
            />
          </Form.Item>
          <div className="text-end w-full">
            {keyValue.milestones?.length != 0 &&
              keyValue.milestones &&
              `You have ${keyValue.milestones?.length} milestones under this key result`}
          </div>
        </div>

        {keyValue?.milestones?.length != 0 && keyValue?.milestones && (
          <Form.Item className="px-5" label="Milestones">
            {keyValue?.milestones.map((milestone, mindex) => (
              <div
                key={mindex}
                className="flex items-center space-x-2 mb-2"
                id={`milestone-${index}-${mindex}`}
              >
                <div className="rounded-lg border-gray-200 border bg-gray-300 w-8 h-8 flex justify-center items-center">
                  {index + 1}.{mindex + 1}
                </div>

                <Input
                  id={`milestone-title-${index}-${mindex}`}
                  placeholder="Milestone Name"
                  value={milestone.title || ''}
                  className="flex-1"
                  onChange={(e) =>
                    milestoneChange(e.target.value, index, mindex, 'title')
                  }
                />

                <InputNumber 
                  id={`milestone-weight-${index}-${mindex}`}
                  min={0}
                  max={100}
                  suffix="%"
                  value={milestone.weight}
                  onChange={(value) =>
                    milestoneChange(value, index, mindex, 'weight')
                  }
                />

                <Button
                  id={`remove-milestone-${index}-${mindex}`}
                  icon={<VscClose size={20} />}
                  onClick={() =>
                    milestone?.id
                      ? handleMilestoneDelete(milestone?.id, mindex)
                      : milestoneRemove(index, mindex)
                  }
                  className="rounded-full w-5 h-5"
                  type="primary"
                />
              </div>
            ))}
          </Form.Item>
        )}
      </Form>
    </div>
  );
};

export default MilestoneView;
