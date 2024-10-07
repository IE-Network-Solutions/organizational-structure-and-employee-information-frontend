import React from 'react';
import { Input } from 'antd';
import { SelectedAnswer } from '../multipleChoiceField';

interface ParagraphFieldProps {
  value?: SelectedAnswer;
}

const ParagraphField: React.FC<ParagraphFieldProps> = ({ value }) => (
  <Input.TextArea disabled value={value?.value || ''} rows={4} />
);

export default ParagraphField;
