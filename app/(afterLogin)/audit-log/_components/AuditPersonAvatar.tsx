'use client';

import { Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { PrototypeAuditPerson } from './types';
import { isSystemActor } from './utils';

const AuditPersonAvatar = ({
  person,
  dataCy,
}: {
  person: PrototypeAuditPerson;
  dataCy: string;
}) => {
  const systemActor = isSystemActor(person);

  return (
    <Avatar
      size={32}
      src={systemActor ? undefined : person.profileImage}
      className={systemActor ? 'bg-gray-100 shrink-0' : 'shrink-0'}
      icon={
        systemActor ? (
          <img
            src="/image/selamnew-workspace-logo-collapsed.svg"
            alt="System"
            width={18}
            height={14}
            className="object-contain"
            data-cy={`${dataCy}-wave`}
          />
        ) : !person.profileImage ? (
          <UserOutlined />
        ) : undefined
      }
      data-cy={dataCy}
    />
  );
};

export default AuditPersonAvatar;
