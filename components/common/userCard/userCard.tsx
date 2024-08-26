import { FC } from 'react';
import { Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';

interface UserCardProps {
  avatar?: string;
  name: string;
  description: string;
}

const UserCard: FC<UserCardProps> = ({ avatar, name, description = '' }) => {
  return (
    <div className="flex items-center gap-3">
      <Avatar
        icon={<UserOutlined />}
        src={avatar && <img src={avatar} alt={name} />}
        size={40}
      />

      <div>
        <div className="text-lg text-gray-900 font-semibold">{name}</div>
        <div className="text-[10px] text-gray-500 mt-0.5">{description}</div>
      </div>
    </div>
  );
};

export default UserCard;
