import React from 'react';
import { Avatar, Badge } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import { PlanOwner } from './types';

interface UserInfoProps {
  owner: PlanOwner;
  notificationCount?: number;
}

export default function UserInfo({ owner, notificationCount }: UserInfoProps) {
  return (
    <div className="flex items-center gap-3">
      <Avatar
        size={48}
        src={owner.avatarUrl}
        style={{ backgroundColor: '#E0E7FF', color: '#4C1D95', fontSize: '16px', fontWeight: 600 }}
      >
        {owner.avatarInitials}
      </Avatar>
      <div>
        <p className="text-base font-semibold leading-tight text-[#161A2C]">
          {owner.name}
        </p>
        <p className="text-sm leading-tight text-[#8F94A3]">{owner.role}</p>
      </div>
      {notificationCount !== undefined && notificationCount > 0 && (
        <div className="ml-auto flex items-center gap-2">
          <Badge
            count={notificationCount}
            style={{
              backgroundColor: '#E11D48',
            }}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E11D48]">
              <BellOutlined className="text-white text-sm" />
            </div>
          </Badge>
        </div>
      )}
    </div>
  );
}

