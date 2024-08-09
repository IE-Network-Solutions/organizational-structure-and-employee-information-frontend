import React from 'react';
import { Radio } from 'antd';
import { RadioChangeEvent } from 'antd/lib';

interface RadioButtonGroupProps {
  options: Array<{ value: string; label: string }>;
  className?: string;
  onChange?: (e: RadioChangeEvent) => void;
  value: string;
}

const RadioButtonGroup: React.FC<RadioButtonGroupProps> = ({
  options,
  className,
  onChange,
  value,
}) => {
  return (
    <Radio.Group
      className={`w-full font-normal text-sm mt-2   ${className} `}
      value={value}
      onChange={onChange}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 justify-start items-center bg-transparent">
        {options.map((option) => (
          <Radio.Button
            key={option.value}
            value={option.value}
            className="w-full h-12 rounded-lg text-center flex justify-center items-center custom-radio-button bg-transparent sm:text-xs"
          >
            {option.label}
          </Radio.Button>
        ))}
      </div>
    </Radio.Group>
  );
};

export default RadioButtonGroup;
