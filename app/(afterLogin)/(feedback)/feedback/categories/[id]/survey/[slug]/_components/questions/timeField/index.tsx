import React from 'react';
import { TimePicker } from 'antd';
import dayjs from 'dayjs';
import { SelectedAnswer } from '../multipleChoiceField';

interface TimeFieldProps {
  value?: SelectedAnswer;
}

const TimeField: React.FC<TimeFieldProps> = ({ value }) => (
  <TimePicker
    disabled
    value={value ? dayjs(value.value, 'HH:mm') : null}
    format="HH:mm"
  />
);

export default TimeField;
