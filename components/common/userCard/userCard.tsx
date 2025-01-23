import { FC } from 'react';
import { Avatar, Image } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { classNames } from '@/utils/classNames';

interface UserCardProps {
  avatar?: string;
  profileImage?: any;
  name: string | undefined|  React.ReactNode;
  description?: string;
  size?: 'small' | 'medium';
}

const UserCard: FC<UserCardProps> = ({
  avatar,
  name,
  description = '',
  size = 'medium',
  profileImage,
}) => {
  const sizeWH = size === 'medium' ? 40 : 24;
  return (
    <div className="flex items-center gap-3">
      {profileImage ? (
        <div className="relative w-6 h-6 rounded-full overflow-hidden">
          <Image
            src={
              profileImage && typeof profileImage === 'string'
                ? (() => {
                    try {
                      const parsed = JSON.parse(profileImage);
                      return parsed.url && parsed.url.startsWith('http')
                        ? parsed.url
                        : Avatar;
                    } catch {
                      return profileImage.startsWith('http')
                        ? profileImage
                        : Avatar;
                    }
                  })()
                : Avatar
            }
            alt="Description of image"
            // layout="fill"
            className="object-cover"
          />
        </div>
      ) : (
        <Avatar
          icon={<UserOutlined />}
          src={avatar && <Image src={avatar} alt={description} />}
          size={sizeWH}
        />
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
