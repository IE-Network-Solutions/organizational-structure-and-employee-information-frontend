import { FC } from 'react';
import { Avatar } from 'antd';
import { classNames } from '@/utils/classNames';

interface UserCardProps {
  data: any;
  avatar?: string;
  profileImage?: any;
  name: string | undefined | React.ReactNode;
  description?: string;
  size?: 'small' | 'medium';
  email?: string;
}

const UserCard: FC<UserCardProps> = ({
  data,
  name,
  description = '',
  size = 'medium',
  email,
}) => {
  // const sizeWH = size === 'medium' ? 40 : 24;
  return (
    <div className="flex items-center gap-3" data-cy="user-card-container">
      {data ? (
        <Avatar
          size={25}
          src={data?.profileImage}
          data-cy="user-card-avatar-with-image"
        />
      ) : (
        <Avatar size={25} data-cy="user-card-avatar-initials">
          {data?.firstName[0]?.toUpperCase()}
          {data?.middleName[0]?.toUpperCase()}
          {data?.lastName[0]?.toUpperCase()}
        </Avatar>
      )}
      <div data-cy="user-card-info">
        <div
          className={classNames('text-gray-900 font-semibold', {
            'text-lg': size === 'medium',
            'text-xs': size === 'small',
          })}
          data-cy="user-card-name"
        >
          {name}
        </div>
        {email && (
          <div
            className={classNames('text-gray-700 mt-1', {
              'text-lg': size === 'medium',
              'text-xs': size === 'small',
            })}
            data-cy="user-card-email"
          >
            {email}
          </div>
        )}
        {description && (
          <div
            className="text-[10px] text-gray-500 mt-0.5"
            data-cy="user-card-description"
          >
            {description}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserCard;
