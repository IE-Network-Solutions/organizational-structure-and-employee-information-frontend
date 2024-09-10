import React from 'react';
import { Checkbox } from 'antd';
import { SelectedAnswer } from '../multipleChoiceField';

interface CheckboxFieldProps {
  options: string[];
  selectedOptions?: SelectedAnswer[];
}

const CheckboxField: React.FC<CheckboxFieldProps> = ({
  options,
  selectedOptions,
}) => <Checkbox.Group options={options} value={selectedOptions} />;

export default CheckboxField;
