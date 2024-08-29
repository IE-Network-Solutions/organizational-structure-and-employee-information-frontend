import { FC, ReactNode, useState } from 'react';
import { Radio } from 'antd';
import { classNames } from '@/utils/classNames';

export interface CustomRadioProps {
  className?: string;
  value?: string | number;
  label: ReactNode;
  onChange?: (count: boolean) => void;
}

const CustomRadio: FC<CustomRadioProps> = ({
  className = '',
  value,
  label,
  onChange,
}) => {
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const radioClass = classNames(className, undefined, [
    'font-semibold',
    'text-sm',
    'text-gray-900',
    'h-[54px]',
    'rounded-lg',
    'border',
    'border-gray-200',
    'items-center',
    'justify-between',
    'hover:border-primary',
    'transition-colors',
    'duration-150',
    'px-[11px]',
    'cursor-pointer',
    'w-full',
    'flex-row-reverse',
    'after:content-[none]',
  ]);

  const handleChange = () => {
    setIsChecked((prev) => !prev);
    if (onChange) {
      onChange(isChecked);
    }
  };

  return (
    <Radio
      className={radioClass}
      checked={isChecked}
      value={value}
      onClick={handleChange}
    >
      <div>{label}</div>
    </Radio>
  );
};

export default CustomRadio;
