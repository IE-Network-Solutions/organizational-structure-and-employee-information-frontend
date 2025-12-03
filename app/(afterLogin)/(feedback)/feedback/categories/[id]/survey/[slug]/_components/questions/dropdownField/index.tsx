import React from 'react';
import { Select } from 'antd';
import { Choice, SelectedAnswer } from '../multipleChoiceField';

const { Option } = Select;

interface DropdownFieldProps {
  options: Choice[];
  selectedValue?: SelectedAnswer;
  onChange?: (value: any) => void;
}

const DropdownField: React.FC<DropdownFieldProps> = ({
  options,
  selectedValue,
  onChange,
}) => (
  <Select id="dropdown-field-select" data-cy="dropdown-field-select" value={selectedValue} onChange={onChange}>
    {options.map((option: Choice, index) => (
      <Option key={index} id={`dropdown-field-option-${index}`} data-cy={`dropdown-field-option-${index}`} value={option}>
        {option.value}
      </Option>
    ))}
  </Select>
);

export default DropdownField;
