import React, { FC } from 'react';
import { Button, Col, Dropdown, Popover, Row } from 'antd';
import type { MenuProps } from 'antd';
import { HiOutlineDotsVertical } from 'react-icons/hi';
import { classNames } from '@/utils/classNames';

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
  const buttonClass = 'text-xs font-bold w-full h-[29px] min-w-[125px]';

  const items: MenuProps['items'] = [
    {
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
    },
    {
      key: '1',
      label: (
        <Popover
          trigger="hover"
          placement="bottomRight"
          title={
            <div className="text-base text-gray-900 font-bold">
              Are you sure you want to delete
            </div>
          }
          content={
            <div className="pt-4">
              <Row gutter={20}>
                <Col span={12}>
                  <Button
                    size="small"
                    className={buttonClass}
                    onClick={onCancelDelete}
                  >
                    Cancel
                  </Button>
                </Col>
                <Col span={12}>
                  <Button
                    size="small"
                    className={buttonClass}
                    type="primary"
                    onClick={onDelete}
                  >
                    Delete
                  </Button>
                </Col>
              </Row>
            </div>
          }
        >
          <Button size="large" className="w-full justify-normal" type="text">
            Delete
          </Button>
        </Popover>
      ),
      className: 'p-0 hover:bg-transparent',
    },
  ];

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
