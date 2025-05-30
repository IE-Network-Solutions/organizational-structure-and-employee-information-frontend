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
    <div className="bg-white text-black border shadow rounded p-2 w-72 max-h-60 overflow-auto">
      {items.length ? (
        items.map((item) => (
          <div
            onClick={() => command(item)}
            className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-100"
            key={item.id}
          >
            <Avatar src={item.profileImage} icon={<UserOutlined />} />
            <div key={item.id} className="">
              {item.label}
            </div>
          </div>
        ))
      ) : (
        <div className="text-gray-500 px-2 py-1">No results</div>
      )}
    </div>
  );
}
