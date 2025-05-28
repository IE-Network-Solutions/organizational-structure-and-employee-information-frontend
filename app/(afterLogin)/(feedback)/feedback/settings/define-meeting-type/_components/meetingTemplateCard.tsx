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
    <div className="relative cursor-pointer p-4 border rounded-lg shadow-sm hover:shadow-md transition">
      <div className="absolute top-2 right-2 z-10">
        <Dropdown menu={{ items }} trigger={['click']}>
          <MoreOutlined
            className="text-gray-500 hover:text-gray-700 text-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </Dropdown>
      </div>
      <h3 className="font-semibold text-lg mb-1 pr-6">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
};
