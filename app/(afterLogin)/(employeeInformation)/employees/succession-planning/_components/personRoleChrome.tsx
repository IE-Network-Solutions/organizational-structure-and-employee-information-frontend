'use client';
import React from 'react';
import { Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';

export type PersonRole = 'Successor' | 'Evaluator';

/** Brand blue for people being evaluated; slate for people who score. */
export const SUCCESSOR_AVATAR_COLOR = '#1E40AF';
export const EVALUATOR_AVATAR_COLOR = '#64748B';

export const avatarColorForRole = (role: PersonRole): string =>
  role === 'Successor' ? SUCCESSOR_AVATAR_COLOR : EVALUATOR_AVATAR_COLOR;

interface PersonRoleLabelProps {
  role: PersonRole;
  className?: string;
  'data-cy'?: string;
}

/** Muted uppercase eyebrow used above a person name. */
export const PersonRoleLabel: React.FC<PersonRoleLabelProps> = ({
  role,
  className = '',
  'data-cy': dataCy,
}) => (
  <div
    className={`text-xs text-gray-400 uppercase tracking-wide font-semibold ${className}`}
    data-cy={dataCy ?? `person-role-label-${role.toLowerCase()}`}
  >
    {role}
  </div>
);

interface PersonRoleAvatarProps {
  role: PersonRole;
  size?: number;
  className?: string;
  'data-cy'?: string;
}

export const PersonRoleAvatar: React.FC<PersonRoleAvatarProps> = ({
  role,
  size = 32,
  className = '',
  'data-cy': dataCy,
}) => (
  <Avatar
    size={size}
    icon={<UserOutlined />}
    style={{ backgroundColor: avatarColorForRole(role) }}
    className={`shrink-0 ${className}`}
    data-cy={dataCy ?? `person-role-avatar-${role.toLowerCase()}`}
  />
);

interface PersonIdentityProps {
  role: PersonRole;
  name: string;
  caption?: React.ReactNode;
  avatarSize?: number;
  className?: string;
  'data-cy'?: string;
}

/** Avatar + role eyebrow + name (+ optional caption). */
export const PersonIdentity: React.FC<PersonIdentityProps> = ({
  role,
  name,
  caption,
  avatarSize = 36,
  className = '',
  'data-cy': dataCy,
}) => (
  <div
    className={`flex items-center gap-3 min-w-0 ${className}`}
    data-cy={dataCy ?? `person-identity-${role.toLowerCase()}`}
  >
    <PersonRoleAvatar role={role} size={avatarSize} />
    <div className="min-w-0 flex-1">
      <PersonRoleLabel role={role} />
      <div className="text-sm font-semibold text-gray-800 truncate">{name}</div>
      {caption ? (
        <div className="text-xs text-gray-500 truncate">{caption}</div>
      ) : null}
    </div>
  </div>
);
