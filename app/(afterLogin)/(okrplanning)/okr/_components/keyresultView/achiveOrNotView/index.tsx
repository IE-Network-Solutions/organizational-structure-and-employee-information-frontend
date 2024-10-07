import React from 'react';
import {
  Button,
  Input,
  DatePicker,
  Form,
  InputNumber,
  Tooltip,
  Select,
} from 'antd';
import dayjs from 'dayjs';
import { VscClose } from 'react-icons/vsc';
import { OKRProps } from '@/store/uistate/features/okrplanning/okr/interface';
import { useOKRStore } from '@/store/uistate/features/okrplanning/okr';

const AchieveOrNotView: React.FC<OKRProps> = ({ keyValue, index, isEdit }) => {
  const { Option } = Select;
  const {
    handleKeyResultChange,
    handleSingleKeyResultChange,
    removeKeyResultValue,
  } = useOKRStore();
  const handleChange = (value: any, field: string) => {
    if (isEdit) {
      handleSingleKeyResultChange(value, field);
    } else {
      handleKeyResultChange(value, index, field);
    }
  };
  return (
    <div className="py-4 border-b-[1px] border-gray-300">
      <Form layout="vertical" className="space-y-1">
        {/* Key Result Input */}
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
            className="w-full font-bold "
          >
            <Input
              value={keyValue.title}
              onChange={(e) => {
                handleChange(e.target.value, 'title');
              }}
            />
          </Form.Item>
          <Form.Item className="w-24 font-bold" label="Weight">
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
            <Tooltip color="gray" title="Cancel Key Result">
              <Button
                className="rounded-full w-5 h-5"
                icon={<VscClose size={20} />}
                type="primary"
                onClick={() => removeKeyResultValue(index)} // Hook up the remove key result function
              />
            </Tooltip>
          </div>
        </div>

        <div className="flex justify-between">
          <Form.Item
            layout="horizontal"
            className="w-full font-bold"
            label="Deadline"
          >
            <DatePicker
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
          <Form.Item
            layout="horizontal"
            className="w-full font-bold"
            label="Target"
          >
            <Select
              value={keyValue.progress}
              className="w-full text-xs"
              onChange={(value) => {
                handleChange(value, 'progress');
              }}
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
