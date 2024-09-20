import React, { FC } from 'react';
import { Button, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { HiOutlineDotsVertical } from 'react-icons/hi';
import { classNames } from '@/utils/classNames';
import DeletePopover from '@/components/common/actionButton/deletePopover';

export interface ActionButtonProps {
  onOpen?: (e?: any) => void;
  onEdit?: (e?: any) => void;
  onDelete?: (e?: any) => void;
  onCancelDelete?: (e?: any) => void;
  className?: string;
}

const ActionButton: FC<ActionButtonProps> = ({
  onOpen,
  onEdit,
  onDelete,
  onCancelDelete,
  className = '',
}) => {
  const items: MenuProps['items'] = [];

  if (onOpen) {
    items.push({
      key: '0',
      label: (
        <Button
          size="large"
          className="w-full justify-normal"
          type="text"
          onClick={onOpen}
        >
          Open
        </Button>
      ),
      className: 'p-0 hover:bg-transparent',
    });
  }

  if (onEdit) {
    items.push({
      key: '1',
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
      key: '2',
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
        onClick={(e) => e.stopPropagation()}
      />
    </Dropdown>
  );
};

export default ActionButton;
