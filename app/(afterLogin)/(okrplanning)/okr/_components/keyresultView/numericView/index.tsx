import React from 'react';
import { Button, Input, DatePicker, Form, InputNumber, Tooltip } from 'antd';
import dayjs from 'dayjs';
import { VscClose } from 'react-icons/vsc';
import { OKRProps } from '@/store/uistate/features/okrplanning/okr/interface';
import { useOKRStore } from '@/store/uistate/features/okrplanning/okr';
import { useDeleteKeyResult } from '@/store/server/features/okrplanning/okr/objective/mutations';
import { useIsMobile } from '@/hooks/useIsMobile';

const NumericView: React.FC<OKRProps> = ({ keyValue, index, isEdit }) => {
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

  const { isMobile } = useIsMobile();
  const isEditDisabled = keyValue && Number(keyValue?.progress) > 0;

  return (
    <div
      className="py-4  border-b-[1px] border-gray-300"
      id={`numeric-view-${index}`}
    >
      <Form layout={isMobile ? 'vertical' : 'horizontal'} className="space-y-1">
        {/* Key Result Input */}
        <div className="flex gap-3 items-center">
          <div
            className="rounded-lg border-gray-200 border bg-gray-300 w-10 h-8 flex justify-center items-center mt-2"
            id={`key-result-index-${index}`}
          >
            {index + 1}
          </div>
          <Form.Item
            label={
              (keyValue.key_type == 'Numeric' && 'Numeric') ||
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
            id={`weight-${index}`}
          >
            <InputNumber
              min={0}
              max={100}
              suffix="%"
              value={keyValue.weight}
              onChange={(value) => {
                handleChange(value, 'weight');
              }}
            />
          </Form.Item>
          <div className="flex gap-2 mt-2">
            <Tooltip color="gray" title="Remove Key Result">
              <Button
                className="rounded-full w-5 h-5"
                icon={<VscClose size={20} />}
                type="primary"
                id={`remove-key-result-button-${index}`}
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
            id={`initial-value-${index}`}
            label="Initial"
            rules={[
              {
                required: true,
                message: 'Please select an initialValue',
              },
            ]}
          >
            <InputNumber
              min={0}
              className="w-full text-xs"
              value={keyValue.initialValue}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
              }
              onChange={(value) => {
                handleChange(value, 'initialValue');
              }}
            />
          </Form.Item>

          {/* Target */}
          <Form.Item
            layout="horizontal"
            className="font-semibold text-xs w-full mb-2"
            id={`target-value-${index}`}
            label="Target"
            rules={[
              {
                required: true,
                message: 'Please select a target value',
              },
            ]}
          >
            <InputNumber
              className="text-xs w-full"
              value={keyValue.targetValue}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
              }
              onChange={(value) => {
                handleChange(value, 'targetValue');
              }}
            />
          </Form.Item>

          {/* Deadline */}
          <Form.Item
            layout="horizontal"
            className="w-full font-bold"
            label={isMobile ? undefined : 'Deadline'}
            id={`deadline-picker-${index}`}
          >
            {isMobile && <span className="text-sm font-bold">Deadline</span>}
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

export default NumericView;
