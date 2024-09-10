import React from 'react';
import { Input } from 'antd';

interface ParagraphFieldProps {
  value?: string;
}

const ParagraphField: React.FC<ParagraphFieldProps> = ({ value }) => (
  <Input.TextArea value={value || ''} rows={4} />
);

export default ParagraphField;
