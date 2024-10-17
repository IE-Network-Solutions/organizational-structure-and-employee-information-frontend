import React, { FC, ReactNode } from 'react';
import { Button } from 'antd';
import { classNames } from '@/utils/classNames';
import { LuPlus } from 'react-icons/lu';

interface AddFormFieldsButtonProps {
  className?: string;
  label: ReactNode;
  onClick: () => void;
}

const AddFormFieldsButton: FC<AddFormFieldsButtonProps> = ({
  className = '',
  label,
  onClick,
}) => {
  return (
    <div
      className={classNames(
        'flex flex-col justify-center items-center gap-2.5',
        undefined,
        [className],
      )}
    >
      <Button
        icon={<LuPlus size={18} />}
        type="primary"
        className="w-[44px] h-[44px] rounded-full"
        htmlType="button"
        onClick={onClick}
      />
      <div className="text-center text-[10px] text-gray-500">{label}</div>
    </div>
  );
};

export default AddFormFieldsButton;
