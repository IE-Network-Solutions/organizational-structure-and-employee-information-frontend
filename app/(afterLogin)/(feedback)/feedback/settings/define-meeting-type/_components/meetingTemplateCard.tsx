'use client';

import React from 'react';
import { Dropdown, MenuProps, Popconfirm } from 'antd';
import { MoreOutlined } from '@ant-design/icons';

interface MeetingTemplateCardProps {
  title: string;
  description: string;
  onClick: () => void;
  onDelete: () => void;
  loading: boolean;
}

export const MeetingTemplateCard: React.FC<MeetingTemplateCardProps> = ({
  title,
  description,
  onClick,
  onDelete,
  loading = false,
}) => {
  const items: MenuProps['items'] = [
    {
      key: 'edit',
      label: <span onClick={() => onClick()}>Edit</span>,
    },
    {
      key: 'delete',
      label: (
        <span>
          <Popconfirm
            title="Are you sure you want to delete?"
            onConfirm={onDelete}
            okText="Yes"
            icon={null}
            okButtonProps={{ loading }}
            cancelText="No"
          >
            Delete
          </Popconfirm>
        </span>
      ),
    },
  ];

  return (
    <div className="relative cursor-pointer p-4 border rounded-lg shadow-sm hover:shadow-md transition w-full">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-lg">{title}</h3>
        <Dropdown menu={{ items }} trigger={['click']}>
          <MoreOutlined
            className="text-gray-500 hover:text-gray-700 text-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </Dropdown>
      </div>
      <p className="text-sm text-black">{description}</p>
    </div>
  );
};
