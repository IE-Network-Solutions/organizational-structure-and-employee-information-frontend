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
      data-cy="add-form-fields-button-container"
      className={classNames(
        'flex flex-col justify-center items-center gap-2.5',
        undefined,
        [className],
      )}
    >
      <Button
        data-cy="add-form-fields-button"
        icon={<LuPlus size={18} data-cy="add-form-fields-button-icon" />}
        type="primary"
        id="tnaAddFormFieldsButtonId"
        className="w-[44px] h-[44px] rounded-xl"
        htmlType="button"
        onClick={onClick}
      />
      <div
        className="text-center text-[10px] text-gray-500"
        data-cy="add-form-fields-button-label"
      >
        {label}
      </div>
    </div>
  );
};

export default AddFormFieldsButton;
