import React from 'react';
import { Avatar, Badge } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import { PlanOwner } from './types';

interface UserInfoProps {
  owner: PlanOwner;
  notificationCount?: number;
}

export default function UserInfo({ owner, notificationCount }: UserInfoProps) {
  // Check if owner data is still loading (showing placeholder values)
  const isLoading =
    owner.name === 'Unknown User' ||
    owner.name === '' ||
    owner.role === 'N/A' ||
    owner.role === '';

  if (isLoading) {
    // Show skeleton/shadow loading state
    return (
      <div
        data-cy="-planningandreporting-planning-and-reporting-components-userinfo-tsx-userinfo-div-22"
        className="flex items-center gap-2 md:gap-3 animate-pulse"
      >
        <div
          data-cy="-planningandreporting-planning-and-reporting-components-userinfo-tsx-userinfo-div-23"
          className="h-8 w-8 md:h-12 md:w-12 rounded-full bg-gray-200 flex-shrink-0"
        ></div>
        <div
          data-cy="-planningandreporting-planning-and-reporting-components-userinfo-tsx-userinfo-div-24"
          className="flex flex-col gap-2 min-w-0 flex-1"
        >
          <div
            data-cy="-planningandreporting-planning-and-reporting-components-userinfo-tsx-userinfo-div-25"
            className="h-4 md:h-5 w-32 bg-gray-200 rounded"
          ></div>
          <div
            data-cy="-planningandreporting-planning-and-reporting-components-userinfo-tsx-userinfo-div-26"
            className="h-3 md:h-4 w-24 bg-gray-200 rounded"
          ></div>
        </div>
        {notificationCount !== undefined && notificationCount > 0 && (
          <div
            data-cy="-planningandreporting-planning-and-reporting-components-userinfo-tsx-userinfo-div-29"
            className="ml-auto flex items-center gap-2"
          >
            <Badge
              count={notificationCount}
              style={{
                backgroundColor: '#E11D48',
              }}
            >
              <div
                data-cy="-planningandreporting-planning-and-reporting-components-userinfo-tsx-userinfo-div-36"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E11D48]"
              >
                <BellOutlined className="text-white text-sm" />
              </div>
            </Badge>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      data-cy="-planningandreporting-planning-and-reporting-components-userinfo-tsx-userinfo-div-47"
      className="flex items-center gap-2 md:gap-3"
    >
      <div
        data-cy="-planningandreporting-planning-and-reporting-components-userinfo-tsx-userinfo-div-48"
        className="flex-shrink-0"
      >
        <Avatar
          size={32}
          src={owner.avatar}
          className="md:hidden"
          style={{
            backgroundColor: '#E0E7FF',
            color: '#4C1D95',
            fontSize: '14px',
            fontWeight: 600,
            lineHeight: '32px',
          }}
        >
          {owner.avatarInitials}
        </Avatar>
        <Avatar
          size={48}
          src={owner.avatar}
          className="hidden md:block"
          style={{
            backgroundColor: '#E0E7FF',
            color: '#4C1D95',
            fontSize: '16px',
            fontWeight: 600,
            lineHeight: '48px',
          }}
        >
          {owner.avatarInitials}
        </Avatar>
      </div>
      <div
        data-cy="-planningandreporting-planning-and-reporting-components-userinfo-tsx-userinfo-div-78"
        className="min-w-0 flex-1"
      >
        <p
          className="text-xs md:text-base font-semibold leading-tight text-[#161A2C] truncate"
          title={owner.name}
          data-cy="planningandreporting-planning-and-reporting-components-userinfo-tsx-p-109"
        >
          {owner.name}
        </p>
        <p
          className="text-xs md:text-sm leading-tight text-[#8F94A3] truncate"
          title={owner.role}
          data-cy="planningandreporting-planning-and-reporting-components-userinfo-tsx-p-115"
        >
          {owner.role}
        </p>
      </div>
      {notificationCount !== undefined && notificationCount > 0 && (
        <div
          data-cy="-planningandreporting-planning-and-reporting-components-userinfo-tsx-userinfo-div-93"
          className="ml-auto flex items-center gap-2"
        >
          <Badge
            count={notificationCount}
            style={{
              backgroundColor: '#E11D48',
            }}
          >
            <div
              data-cy="-planningandreporting-planning-and-reporting-components-userinfo-tsx-userinfo-div-100"
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E11D48]"
            >
              <BellOutlined className="text-white text-sm" />
            </div>
          </Badge>
        </div>
      )}
    </div>
  );
}
