import React from 'react';
import { Button, Input, DatePicker, Form, InputNumber, Tooltip } from 'antd';
import dayjs from 'dayjs';
import { VscClose } from 'react-icons/vsc';
import { OKRProps } from '@/store/uistate/features/okrplanning/okr/interface';
import { useOKRStore } from '@/store/uistate/features/okrplanning/okr';
import { useDeleteKeyResult } from '@/store/server/features/okrplanning/okr/objective/mutations';
import { useIsMobile } from '@/hooks/useIsMobile';

const PercentageView: React.FC<OKRProps> = ({ keyValue, index, isEdit }) => {
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
  const { isMobile } = useIsMobile();
  return (
    <div
      className="py-4 border-b-[1px] border-gray-300"
      id={`key-result-view-${index}`}
    >
      <Form layout="vertical" className="space-y-1">
        {/* Key Result Input */}
        <div className="flex gap-3 items-center">
          <div className="rounded-lg border-gray-200 border bg-gray-300 w-10 h-8 flex justify-center items-center mt-2">
            {index + 1}
          </div>
          <Form.Item
            label={keyValue.key_type == 'Percentage' && 'Percentage'}
            className="w-full font-bold"
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
              id={`key-result-title-${index}`}
              value={keyValue.title}
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
          <Form.Item className="w-24 font-bold" label="Weight">
            <InputNumber
              id={`key-result-weight-${index}`}
              suffix="%"
              min={0}
              max={100}
              value={keyValue.weight}
              onChange={(value) => {
                handleChange(value, 'weight');
              }}
            />
          </Form.Item>
          <div className="flex gap-2 mt-2">
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
                disabled={isEditDisabled}
              />
            </Tooltip>
          </div>
        </div>

        <div className="flex gap-5 w-full">
          <Form.Item
            layout="horizontal"
            className="font-semibold text-xs w-full mb-2"
            id={`key-result-initialValue-${index}`}
            label="Initial"
            rules={[
              { required: true, message: 'Please select an initial value' },
            ]}
          >
            <InputNumber
              min={0}
              suffix="%"
              className="w-full text-xs"
              value={keyValue.initialValue}
              onChange={(value) => {
                handleChange(value, 'initialValue');
              }}
            />
          </Form.Item>

          {/* Target */}
          <Form.Item
            layout="horizontal"
            className="font-semibold text-xs w-full mb-2"
            id={`key-result-targetValue-${index}`}
            label="Target"
            rules={[
              { required: true, message: 'Please select a target value' },
            ]}
          >
            <InputNumber
              min={0}
              suffix="%"
              className="text-xs w-full"
              value={keyValue.targetValue}
              onChange={(value) => {
                handleChange(value, 'targetValue');
              }}
            />
          </Form.Item>

          <Form.Item
            layout="horizontal"
            className="w-full font-bold"
            label={isMobile ? undefined : 'Deadline'}
          >
            {isMobile && <span className="text-sm font-bold">Deadline</span>}
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
        </div>
      </Form>
    </div>
  );
};

export default PercentageView;
