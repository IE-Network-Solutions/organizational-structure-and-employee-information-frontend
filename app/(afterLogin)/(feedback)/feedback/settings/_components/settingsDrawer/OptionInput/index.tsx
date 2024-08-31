import React from 'react';
import { Input, Checkbox, Select, TimePicker } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import dayjs from 'dayjs';

interface OptionInputProps {
  question: any;
  optionIndex: number;
  value: string;
  onChange: (value: string) => void;
}

const OptionInput: React.FC<OptionInputProps> = ({
  question,
  optionIndex,
  value,
  onChange,
}) => {
  switch (question.type) {
    case 'Multiple Choice':
      return (
        <>
          <div className="w-7 h-7 bg-gray-200 border-[1px] rounded-300 rounded-md flex items-center justify-center mr-2">
            {optionIndex + 1}.
          </div>
          <Input
            placeholder={`Option ${optionIndex + 1}`}
            className="flex-grow w-full"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        </>
      );
    case 'Checkbox':
      return (
        <>
          <Checkbox className="mr-2" />
          <Input
            placeholder={`Option ${optionIndex + 1}`}
            className="flex-grow w-full"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        </>
      );
    case 'Short Text':
      return (
        <Input
          placeholder="Short answer text"
          className="w-full"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case 'Paragraph':
      return (
        <TextArea
          placeholder="Long answer text"
          className="w-full"
          rows={4}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case 'Time':
      return (
        <TimePicker
          className="w-full"
          value={value ? dayjs(value, 'HH:mm') : null}
          onChange={(time) => onChange(time ? time.format('HH:mm') : '')}
        />
      );
    case 'Dropdown':
      return (
        <Select placeholder="Select an option" className="w-full">
          {question.options.map((option: string, index: number) => (
            <Select.Option key={index} value={option}>
              {option}
            </Select.Option>
          ))}
        </Select>
      );
    default:
      return null;
  }
};

export default OptionInput;
