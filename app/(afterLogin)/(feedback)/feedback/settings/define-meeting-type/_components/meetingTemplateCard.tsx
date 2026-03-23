'use client';

import React from 'react';
import { Dropdown, MenuProps, Popconfirm } from 'antd';
import { EllipsisOutlined } from '@ant-design/icons';
import { Edit2Icon } from 'lucide-react';
import { MdDeleteOutline } from 'react-icons/md';

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
  const [menuOpen, setMenuOpen] = React.useState(false);

  const items: MenuProps['items'] = [
    {
      key: 'edit',
      icon: <Edit2Icon className="w-4 h-4 text-xs" />,
      label: 'Edit',
      onClick: onClick,
    },
    {
      key: 'delete',
      label: (
        <span
          data-cy="meeting-template-card-delete-menu-item"
          id="meetingTemplateCardDeleteMenuItem"
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen(false);
          }}
        >
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
            <span className="flex items-center gap-2">
              <MdDeleteOutline className="w-4 h-4" />
              Delete
            </span>
          </Popconfirm>
        </span>
      ),
    },
  ];

  return (
    <div
      className="relative cursor-pointer p-4 border rounded-lg shadow-sm hover:shadow-md transition w-full"
      data-cy="meeting-template-card"
      id="meetingTemplateCard"
    >
      <div
        className="flex justify-between items-start mb-2"
        data-cy="meeting-template-card-header"
        id="meetingTemplateCardHeader"
      >
        <h3
          className="font-normal text-sm"
          data-cy="meeting-template-card-title"
          id="meetingTemplateCardTitle"
        >
          {title}
        </h3>
        <Dropdown
          menu={{ items }}
          trigger={['click']}
          open={menuOpen}
          onOpenChange={(open) => setMenuOpen(open)}
        >
          <EllipsisOutlined
            className=" text-lg"
            onClick={(e) => e.stopPropagation()}
            data-cy="meeting-template-card-more-icon"
            id="meetingTemplateCardMoreIcon"
          />
        </Dropdown>
      </div>
      <p
        className="text-sm text-gray-500"
        data-cy="meeting-template-card-description"
        id="meetingTemplateCardDescription"
      >
        {description}
      </p>
    </div>
  );
};
