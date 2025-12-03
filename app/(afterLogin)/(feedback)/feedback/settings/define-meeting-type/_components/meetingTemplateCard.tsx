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
      label: <span onClick={() => onClick()} data-cy="meeting-template-card-edit-menu-item" id="meetingTemplateCardEditMenuItem">Edit</span>,
    },
    {
      key: 'delete',
      label: (
        <span data-cy="meeting-template-card-delete-menu-item" id="meetingTemplateCardDeleteMenuItem">
          <Popconfirm
            title="Are you sure you want to delete?"
            onConfirm={onDelete}
            okText="Yes"
            icon={null}
            okButtonProps={{ loading }}
            cancelText="No"
            data-cy="meeting-template-card-delete-confirm"
            id="meetingTemplateCardDeleteConfirm"
          >
            Delete
          </Popconfirm>
        </span>
      ),
    },
  ];

  return (
    <div className="relative cursor-pointer p-4 border rounded-lg shadow-sm hover:shadow-md transition w-full" data-cy="meeting-template-card" id="meetingTemplateCard">
      <div className="flex justify-between items-start mb-2" data-cy="meeting-template-card-header" id="meetingTemplateCardHeader">
        <h3 className="font-semibold text-lg" data-cy="meeting-template-card-title" id="meetingTemplateCardTitle">{title}</h3>
          <Dropdown menu={{ items }} trigger={['click']}>
          <MoreOutlined
            className="text-gray-500 hover:text-gray-700 text-lg"
            onClick={(e) => e.stopPropagation()}
            data-cy="meeting-template-card-more-icon"
            id="meetingTemplateCardMoreIcon"
          />
        </Dropdown>
      </div>
      <p className="text-sm text-black" data-cy="meeting-template-card-description" id="meetingTemplateCardDescription">{description}</p>
    </div>
  );
};
