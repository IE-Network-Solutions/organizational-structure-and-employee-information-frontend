import { FC } from 'react';
import { Avatar, Image } from 'antd';
import { classNames } from '@/utils/classNames';

interface UserCardProps {
  profileImage?: any;
  name: string | undefined;
  description?: string;
  size?: 'small' | 'medium';
}

const UserCard: FC<UserCardProps> = ({
  name,
  description = '',
  size = 'medium',
  profileImage,
}) => {
  return (
    <div className="flex items-center gap-3">
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
