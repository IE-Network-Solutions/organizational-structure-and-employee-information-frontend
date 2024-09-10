import React from 'react';
import { Select } from 'antd';
import { Choice, SelectedAnswer } from '../multipleChoiceField';

const { Option } = Select;

interface DropdownFieldProps {
  options: Choice[];
  selectedValue?: SelectedAnswer;
}

const DropdownField: React.FC<DropdownFieldProps> = ({
  options,
  selectedValue,
}) => (
  <Select value={selectedValue}>
    {options.map((option: Choice, index) => (
      <Option key={index} value={option}>
        {option.value}
      </Option>
    ))}
  </Select>
);

export default DropdownField;
