import { FC, ReactNode, useEffect, useState } from 'react';
import { Radio } from 'antd';
import { classNames } from '@/utils/classNames';

export interface CustomRadioProps {
  className?: string;
  value?: string | number | boolean;
  label: ReactNode;
  onChange?: (count: boolean) => void;
  isError?: boolean;
  initialValue?: string | number | boolean;
}

const CustomRadio: FC<CustomRadioProps> = ({
  className = '',
  value,
  label,
  onChange,
  isError = false,
  initialValue = false,
}) => {
  const [isChecked, setIsChecked] = useState<boolean>();

  const radioClass = classNames(
    className,
    {
      'border-gray-200': !isError,
      'border-error': isError,
    },
    [
      'font-semibold',
      'text-sm',
      'text-gray-900',
      'h-[54px]',
      'rounded-lg',
      'border',
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
    ],
  );

  const handleChange = () => {
    setIsChecked((prev) => !prev);
  };

  useEffect(() => {
    setIsChecked(!!initialValue);
  }, [initialValue]);

  useEffect(() => {
    if (onChange) {
      onChange(!!isChecked);
    }
  }, [isChecked]);

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
