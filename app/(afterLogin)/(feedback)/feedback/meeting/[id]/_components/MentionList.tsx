// components/MentionList.tsx
'use client';

import { Avatar } from 'antd';
import React from 'react';
import { UserOutlined } from '@ant-design/icons';

type MentionListProps = {
  items: { id: string; label: string; profileImage: string }[];
  command: (item: { id: string; label: string }) => void;
};

export default function MentionList({ items, command }: MentionListProps) {
  return (
    <div className="bg-white text-black border shadow rounded p-2 w-72 max-h-60 overflow-auto" data-cy="feedback-meeting-components-mentionlist" id="feedback-meeting-components-mentionlist">
      {items.length ? (
        items.map((item) => (
          <div
            onClick={() => command(item)}
            className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-100" data-cy="feedback-meeting-components-mentionlist-item" id="feedback-meeting-components-mentionlist-item"
            key={item.id}
          >
            <Avatar 
              src={item.profileImage} 
              icon={<UserOutlined data-cy="feedback-meeting-components-mentionlist-avatar-icon" />} 
              data-cy="feedback-meeting-components-mentionlist-avatar"
            />
            <div key={item.id} className="" data-cy="feedback-meeting-components-mentionlist-item-label" id="feedback-meeting-components-mentionlist-item-label">
              {item.label}
            </div>
          </div>
        ))
      ) : (
        <div className="text-gray-500 px-2 py-1" data-cy="feedback-meeting-components-mentionlist-no-results" id="feedback-meeting-components-mentionlist-no-results">No results</div>
      )}
    </div>
  );
}
