import React from 'react';
import { Button, Input, DatePicker, Form, InputNumber, Tooltip } from 'antd';
import dayjs from 'dayjs';
import { VscClose } from 'react-icons/vsc';
import { CiDollar } from 'react-icons/ci';
import { OKRProps } from '@/store/uistate/features/okrplanning/okr/interface';
import { useOKRStore } from '@/store/uistate/features/okrplanning/okr';
import { useDeleteKeyResult } from '@/store/server/features/okrplanning/okr/objective/mutations';

const CurrencyView: React.FC<OKRProps> = ({ keyValue, index, isEdit }) => {
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

  return (
    <div
      className="py-4 border-b-[1px] border-gray-300"
      id={`currency-view-${index}`}
    >
      <Form layout="vertical" className="space-y-1">
        {/* Key Result Input */}
        <div className="flex gap-3 items-center">
          <div className="rounded-lg border-gray-200 border bg-gray-300 w-10 h-8 flex justify-center items-center mt-2">
            {index + 1}
          </div>
          <Form.Item
            label={
              (keyValue.key_type == 'Currency' && 'Currency') ||
              keyValue.metricType?.name
            }
            className="w-full font-bold"
            id={`key-result-title-${index}`}
          >
            <Input
              value={keyValue.title}
              onChange={(e) => {
                handleChange(e.target.value, 'title');
              }}
            />
          </Form.Item>
          <Form.Item
            className="w-24 font-bold"
            label="Weight"
            id={`key-result-weight-${index}`}
          >
            <InputNumber
              min={0}
              max={100}
              value={keyValue?.weight || 0} // Ensure a default value
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
                onClick={() =>
                  keyValue?.id
                    ? handleKeyResultDelete(keyValue?.id)
                    : removeKeyResultValue(index)
                }
                id={`remove-key-result-${index}`}
              />
            </Tooltip>
          </div>
        </div>

        <div className="flex gap-5 w-full">
          {/* Initial Value */}
          <Form.Item
            layout="horizontal"
            className="font-semibold text-xs w-full mb-2"
            id={`initial-value-${index}`}
            label="Initial"
            rules={[
              {
                required: true,
                message: 'Please select an initial value',
              },
            ]}
          >
            <InputNumber
              min={0}
              className="w-full text-xs"
              value={keyValue.initialValue}
              suffix={<CiDollar size={20} />}
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
              suffix={<CiDollar size={20} />}
              value={keyValue.targetValue}
              onChange={(value) => {
                handleChange(value, 'targetValue');
              }}
            />
          </Form.Item>

          {/* Deadline */}
          <Form.Item
            layout="horizontal"
            className="w-full font-bold"
            label="Deadline"
            id={`deadline-${index}`}
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
            />
          </Form.Item>
        </div>
      </Form>
    </div>
  );
};

export default CurrencyView;
