import React from 'react';
import { Radio } from 'antd';
import { SelectedAnswer } from '../multipleChoiceField';

interface RadioFieldProps {
  options?: string[];
  selectedValue?: SelectedAnswer;
  onChange?: (value: any) => void;
  disabled?: boolean;
  className?: string;
}

const RadioField: React.FC<RadioFieldProps> = ({
  options,
  selectedValue,
  onChange,
  disabled = false,
  className,
}) => (
  <Radio.Group
    id="radio-field-group"
    data-cy="radio-field-group"
    className={className}
    value={!disabled ? selectedValue?.id : undefined} // Set `value` only if `disabled` is false
    onChange={onChange}
    disabled={disabled} // Apply `disabled` to the entire group
  >
    {options?.map((option, index) => (
      <Radio key={index} id={`radio-field-option-${index}`} data-cy={`radio-field-option-${index}`} value={option}>
        {option}
      </Radio>
    ))}
  </Radio.Group>
);

export default RadioField;
