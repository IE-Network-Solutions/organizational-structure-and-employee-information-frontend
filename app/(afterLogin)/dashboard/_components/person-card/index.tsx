// components/PersonCard.tsx
import { Avatar } from 'antd';
import { FC } from 'react';
import { UserOutlined } from '@ant-design/icons';

interface PersonCardProps {
  name: string;
  imgSrc: string;
}

const PersonCard: FC<PersonCardProps> = ({ name, imgSrc }) => {
  return (
    <div
      className="flex flex-col items-center gap-2 mb-3"
      data-cy="person-card"
    >
      {imgSrc ? (
        <Avatar src={imgSrc} alt={name} className="w-10 h-10 rounded-full" />
      ) : (
        <Avatar
          icon={<UserOutlined size={32} />}
          className="w-10 h-10 rounded-full"
        />
      )}
      <p
        className="font-normal text-center text-sm   "
        data-cy="person-card-name"
      >
        {name}
      </p>
    </div>
  );
};

export default PersonCard;
