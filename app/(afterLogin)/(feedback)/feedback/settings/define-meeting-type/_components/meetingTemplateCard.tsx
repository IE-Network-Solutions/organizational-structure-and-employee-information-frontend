'use client';

import React from 'react';
import { Dropdown, MenuProps, Popconfirm } from 'antd';
import { MdOutlineDelete, MdOutlineEdit } from 'react-icons/md';
import { BsThreeDots } from 'react-icons/bs';

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
      icon: <MdOutlineEdit className="w-4 h-4 " />,
      className: 'text-xs text-gray-600',
      label: 'Edit',
      onClick: () => {
        onClick();
        setMenuOpen(false);
      },
    },
    {
      key: 'delete',
      className: 'text-xs text-gray-600',
      label: (
        <span
          data-cy="meeting-template-card-delete-menu-item"
          id="meetingTemplateCardDeleteMenuItem"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setMenuOpen(true);
          }}
        >
          <Popconfirm
            title="Are you sure you want to delete?"
            onConfirm={() => {
              onDelete();
              setMenuOpen(false);
            }}
            onCancel={() => {
              setMenuOpen(false);
            }}
            okText="Yes"
            icon={null}
            okButtonProps={{ loading }}
            cancelText="No"
            data-cy="meeting-template-card-delete-confirm"
            id="meetingTemplateCardDeleteConfirm"
          >
            <span className="flex items-center gap-2">
              <MdOutlineDelete className="w-4 h-4" />
              Delete
            </span>
          </Popconfirm>
        </span>
      ),
    },
  ];

  return (
    <div
      className="relative cursor-pointer p-4 border border-[#D9D9D9] rounded-lg shadow-sm hover:shadow-md transition w-full"
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
          placement="bottomRight"
          arrow
          menu={{
            items,
            onClick: ({ key, domEvent }) => {
              if (key === 'delete') {
                domEvent.preventDefault();
                domEvent.stopPropagation();
                setMenuOpen(true);
                return;
              }
              setMenuOpen(false);
            },
          }}
          trigger={['click']}
          open={menuOpen}
          onOpenChange={(open) => setMenuOpen(open)}
        >
          <button
            type="button"
            className="h-6 w-6 cursor-pointer text-gray-500 hover:text-gray-700 p-1.5 border border-[#D9D9D9] rounded-md bg-transparent flex items-center justify-center hover:border-[#D9D9D9]"
            data-cy={`meeting-template-card-more-buttom`}
            id={`meetingTemplateCardMorebutton`}
          >
            <BsThreeDots
              id={`meetingTemplateCardMoreIcon`}
              data-cy={`meeting-template-card-more-icon`}
              className="text-lg"
            />
          </button>
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
