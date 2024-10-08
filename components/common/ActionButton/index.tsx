import React, { FC } from 'react';
import { Button, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { HiOutlineDotsVertical } from 'react-icons/hi';
import { classNames } from '@/utils/classNames';
import DeletePopover from '@/components/common/ActionButton/deletePopover';

export interface ActionButtonProps {
  onEdit?: () => void;
  onDelete?: () => void;
  onCancelDelete?: () => void;
  className?: string;
}

const ActionButton: FC<ActionButtonProps> = ({
  onEdit,
  onDelete,
  onCancelDelete,
  className = '',
}) => {
  const items: MenuProps['items'] = [];

  if (onEdit) {
    items.push({
      key: '0',
      label: (
        <Button
          size="large"
          className="w-full justify-normal"
          type="text"
          onClick={onEdit}
        >
          Edit
        </Button>
      ),
      className: 'p-0 hover:bg-transparent',
    });
  }

  if (onDelete) {
    items.push({
      key: '1',
      label: (
        <DeletePopover onCancel={onCancelDelete} onDelete={onDelete}>
          <Button size="large" className="w-full justify-normal" type="text">
            Delete
          </Button>
        </DeletePopover>
      ),
      className: 'p-0 hover:bg-transparent',
    });
  }

  return (
    <Dropdown
      menu={{ items }}
      trigger={['click']}
      placement="bottomRight"
      className={classNames(className)}
    >
      <Button
        icon={<HiOutlineDotsVertical size={20} className="text-gray-500" />}
        className="h-7 w-7"
        type="text"
      />
    </Dropdown>
  );
};

export default ActionButton;
