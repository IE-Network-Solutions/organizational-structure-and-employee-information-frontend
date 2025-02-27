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
}

const UserCard: FC<UserCardProps> = ({
  data,
  name,
  description = '',
  size = 'medium',
}) => {
  // const sizeWH = size === 'medium' ? 40 : 24;
  return (
    <div className="flex items-center gap-3">
      {data ? (
        <Avatar size={40} src={data?.profileImage} />
      ) : (
        <Avatar size={40}>
          {data?.firstName[0]?.toUpperCase()}
          {data?.middleName[0]?.toUpperCase()}
        </Avatar>
      )}
      <div>
        <div
          className={classNames('text-gray-900 font-semibold', {
            'text-lg': size === 'medium',
            'text-xs': size === 'small',
          })}
        >
          {name}
        </div>
        {description && (
          <div className="text-[10px] text-gray-500 mt-0.5">{description}</div>
        )}
      </div>
    </div>
  );
};

export default UserCard;
