import React from 'react';
import { Input } from 'antd';
import { SelectedAnswer } from '../multipleChoiceField';

interface ShortTextFieldProps {
  value?: SelectedAnswer;
}

const ShortTextField: React.FC<ShortTextFieldProps> = ({ value }) => (
  <Input id="short-text-field-input" data-cy="short-text-field-input" disabled value={value?.value} />
);

export default ShortTextField;
