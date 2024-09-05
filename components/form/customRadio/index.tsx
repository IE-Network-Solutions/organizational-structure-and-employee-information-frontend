import { FC, ReactNode, useState } from 'react';
import { Radio } from 'antd';
import { classNames } from '@/utils/classNames';

export interface CustomRadioProps {
  className?: string;
  value?: string | number;
  label: ReactNode;
  onChange?: (count: boolean) => void;
  isError?: boolean;
}

const CustomRadio: FC<CustomRadioProps> = ({
  className = '',
  value,
  label,
  onChange,
  isError = false,
}) => {
  const [isChecked, setIsChecked] = useState<boolean>(false);

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
