import React from 'react';
import { Radio } from 'antd';
import { SelectedAnswer } from '../multipleChoiceField';

interface RadioFieldProps {
  options?: string[];
  selectedValue?: SelectedAnswer;
}

const RadioField: React.FC<RadioFieldProps> = ({ options, selectedValue }) => (
  <Radio.Group  value={selectedValue?.id}>
    {options?.map((option, index) => (
      <Radio disabled key={index} value={option}>
        {option}
      </Radio>
    ))}
  </Radio.Group>
);

export default RadioField;
