import React from 'react';
import { Checkbox } from 'antd';
import { SelectedAnswer } from '../multipleChoiceField';

interface CheckboxFieldProps {
  options: any[];
  selectedOptions?: SelectedAnswer[];
}

const CheckboxField: React.FC<CheckboxFieldProps> = ({
  options,
  selectedOptions,
}) => (
  <Checkbox.Group
    className="font-normal"
    options={options.map((item) => ({ label: item.value, value: item.id }))}
    value={selectedOptions?.map((item) => item.id)}
  />
);
export default CheckboxField;
