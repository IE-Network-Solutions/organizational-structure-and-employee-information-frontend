import React from 'react';
import { Checkbox } from 'antd';
import { SelectedAnswer } from '../multipleChoiceField';

interface CheckboxFieldProps {
  options: any[];
  selectedOptions?: SelectedAnswer[];
  onChange?:(value:any)=>void;
}

const CheckboxField: React.FC<CheckboxFieldProps> = ({
  options,
  selectedOptions,
  onChange
}) => (
  <Checkbox.Group
    className="font-normal"
    options={options.map((item) => ({ label: item.value, value: item.id }))}
    value={selectedOptions?.map((item) => item.id)}
    onChange={onChange}
  />
);
export default CheckboxField;
