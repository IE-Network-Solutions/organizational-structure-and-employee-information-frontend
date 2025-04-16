import React from 'react';
import { Button, Input, DatePicker, Form, InputNumber, Tooltip, Select } from 'antd';
import dayjs from 'dayjs';
import { VscClose } from 'react-icons/vsc';
import { OKRProps } from '@/store/uistate/features/okrplanning/okr/interface';
import { useOKRStore } from '@/store/uistate/features/okrplanning/okr';
import { useDeleteKeyResult } from '@/store/server/features/okrplanning/okr/objective/mutations';
const {Option} = Select;
const AchieveOrNotView: React.FC<OKRProps> = ({ keyValue, index, isEdit }) => {
  const {
    handleKeyResultChange,
    handleSingleKeyResultChange,
    removeKeyResultValue,
    objectiveValue,
  } = useOKRStore();

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

  const isEditDisabled = keyValue && Number(keyValue?.progress) > 0;

  return (
    <div
      className="py-4 border-b-[1px] border-gray-300"
      id={`achieve-or-not-view-${index}`}
    >
      <Form layout="vertical" className="space-y-1">
        <div className="flex gap-3 items-center">
          {!keyValue.id && (
            <div className="rounded-lg border-gray-200 border bg-gray-300 w-10 h-8 flex justify-center items-center mt-2">
              {index + 1}
            </div>
          )}
          <Form.Item
            label={
              (keyValue.key_type == 'Achieve' && 'Achieved or Not Achieved') ||
              keyValue.metricType?.name
            }
            className="w-full font-bold"
            id={`key-result-title-${index}`}
            rules={[
              {
                /* eslint-disable-next-line @typescript-eslint/naming-convention */
                validator: (_, value) => {
                  /* eslint-enable @typescript-eslint/naming-convention */
                  if (!value) {
                    return Promise.reject(
                      new Error('Milestone title is required'),
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
            validateTrigger="onBlur"
          >
            <Input
              value={keyValue.title}
              onChange={(e) => {
                handleChange(e.target.value, 'title');
              }}
              aria-label="Key Result Title"
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
            id={`key-result-weight-${index}`}
          >
            <InputNumber
              min={0}
              max={100}
              value={keyValue?.weight || 0}
              onChange={(value) => {
                handleChange(value, 'weight');
              }}
              aria-label="Key Result Weight"
            />
          </Form.Item>
          <div className="flex gap-2 mt-2">
            <Tooltip color="gray" title="Remove Key Result">
              <Button
                className="rounded-full w-5 h-5"
                icon={<VscClose size={20} />}
                type="primary"
                onClick={() =>
                  keyValue?.id
                    ? handleKeyResultDelete(keyValue?.id)
                    : removeKeyResultValue(index)
                }
                id={`remove-key-result-${index}`}
                aria-label="Remove Key Result"
                disabled={isEditDisabled}
              />
            </Tooltip>
          </div>
        </div>

        <div className="flex justify-between">
          <Form.Item
            layout="horizontal"
            className="w-full font-bold"
            label="Deadline"
            id={`key-result-deadline-${index}`}
          >
            <DatePicker
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
              aria-label="Key Result Deadline"
            />
            {!keyValue.deadline && (
              <div className="text-red-500 font-semibold absolute top-[30px]">
                Deadline is required
              </div>
            )}
          </Form.Item>

          <Form.Item
            layout="horizontal"
            className="w-full font-bold"
            label="Target"
            id={`key-result-target-${index}`}
          >
            <Select
              disabled
              value={0}
              className="w-full text-xs"
              onChange={(value) => {
                handleChange(value, 'progress');
              }}
              aria-label="Key Result Target"
            >
              <Option value={0}>Not Achieved</Option>
              <Option value={100}>Achieved</Option>
            </Select>
          </Form.Item>

        </div>
      </Form>
    </div>
  );
};

export default AchieveOrNotView;
