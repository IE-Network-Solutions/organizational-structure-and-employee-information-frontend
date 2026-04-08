import { FC } from 'react';
import { Avatar } from 'antd';
import { classNames } from '@/utils/classNames';
import { UserOutlined } from '@ant-design/icons';

interface UserCardProps {
  data: any;
  avatar?: string;
  profileImage?: any;
  name: string | undefined | React.ReactNode;
  description?: string;
  size?: 'small' | 'medium';
  email?: string;
  className?: string;
  style?: React.CSSProperties;
  /** Applied to the name element */
  nameClassName?: string;
  nameStyle?: React.CSSProperties;
  /** Applied to the email element */
  emailClassName?: string;
  emailStyle?: React.CSSProperties;
  /** Applied to the description element */
  descriptionClassName?: string;
  descriptionStyle?: React.CSSProperties;
  /** Applied to the wrapper div containing name, email, description */
  contentClassName?: string;
  contentStyle?: React.CSSProperties;
}

const UserCard: FC<UserCardProps> = ({
  data,
  name,
  description = '',
  size = 'medium',
  email,
  className,
  style,
  nameClassName,
  nameStyle,
  emailClassName,
  emailStyle,
  descriptionClassName,
  descriptionStyle,
  contentClassName,
  contentStyle,
}) => {
  const hasProfileImage = Boolean(data?.profileImage);

  return (
    <div
      className={classNames(
        'flex items-center gap-3',
        {},
        className ? [className] : [],
      )}
      style={style}
      data-cy="user-card"
    >
      <Avatar
        size={25}
        src={hasProfileImage ? data?.profileImage : undefined}
        icon={!hasProfileImage ? <UserOutlined /> : undefined}
        data-cy="components-common-usercard-usercard-tsx-usercard-avatar-35"
      />
      <div
        className={contentClassName ?? ''}
        style={contentStyle}
        data-cy="components-common-usercard-usercard-tsx-usercard-div-34"
      >
        <div
          className={
            nameClassName
              ? nameClassName
              : classNames('text-gray-900 font-semibold', {
                  'text-lg': size === 'medium',
                  'text-xs': size === 'small',
                })
          }
          style={nameStyle}
          data-cy="components-common-usercard-usercard-tsx-usercard-div-38"
        >
          {name}
        </div>
        {email && (
          <div
            className={
              emailClassName
                ? emailClassName
                : classNames('text-gray-700 mt-1', {
                    'text-lg': size === 'medium',
                    'text-xs': size === 'small',
                  })
            }
            style={emailStyle}
            data-cy="components-common-usercard-usercard-tsx-usercard-div-47"
          >
            {email}
          </div>
        )}
        {description && (
          <div
            data-cy="components-common-usercard-usercard-tsx-usercard-div-54"
            className={
              descriptionClassName
                ? descriptionClassName
                : 'text-[10px] text-gray-500 mt-0.5'
            }
            style={descriptionStyle}
          >
            {description}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserCard;
