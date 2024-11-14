import React from 'react';
import { TimePicker } from 'antd';
import dayjs from 'dayjs';
import { SelectedAnswer } from '../multipleChoiceField';

interface TimeFieldProps {
  value?: SelectedAnswer;
  className?: string;
  disabled?: boolean;
  onChange?: (time: any) => void;
}

const TimeField: React.FC<TimeFieldProps> = ({ value, className, disabled = true, onChange }) => {
  // Conditionally set value only if disabled is false
  const timePickerProps: any = {
    disabled,
    onChange,
    format: "HH:mm",
    className,
  };

  if (disabled && value) {
    timePickerProps.value = dayjs(value.value, 'HH:mm');
  }

  return <TimePicker {...timePickerProps} />;
};

export default TimeField;
