import { FC } from 'react';
import { Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { classNames } from '@/utils/classNames';

interface UserCardProps {
  avatar?: string;
  name: string;
  description?: string;
  size?: 'small' | 'medium';
}

const UserCard: FC<UserCardProps> = ({
  avatar,
  name,
  description = '',
  size = 'medium',
}) => {
  return (
    <div className="flex items-center gap-3">
      <Avatar
        icon={<UserOutlined />}
        src={avatar && <img src={avatar} alt={name} />}
        size={size === 'medium' ? 40 : 24}
      />

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
