'use client';
import React, { ReactNode, useEffect, useState } from 'react';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';

interface AccessGuardProps {
  roles?: string[];
  permissions?: string[];
  /** When true, any listed permission is enough (default is all of them). */
  requireAny?: boolean;
  id?: string;
  selfShouldAccess?: boolean;
  children?: ReactNode;
}

const AccessGuard: React.FC<AccessGuardProps> & {
  checkAccess: (props: AccessGuardProps) => boolean;
} = ({ roles, permissions, requireAny, id, selfShouldAccess = false, children }) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <></>;
  }

  const hasAccess = AccessGuard.checkAccess({
    roles,
    permissions,
    requireAny,
    id,
    selfShouldAccess,
  });

  if (hasAccess) {
    return <>{children}</>;
  }

  return <></>;
};

// Static method for programmatic access checks
AccessGuard.checkAccess = ({
  roles,
  permissions,
  requireAny = false,
  id,
  selfShouldAccess = false,
}: AccessGuardProps): boolean => {
  const { userData, userId } = useAuthenticationStore.getState();

  const role = userData?.role?.slug || '';
  const userPermissions = userData?.userPermissions || [];

  const isOwner = role.toLowerCase() === 'owner';

  const hasRole = roles ? roles.includes(role) : true;

  const hasPermission = permissions
    ? requireAny
      ? permissions.some((permission) =>
          userPermissions.some(
            (userPermission: { permission: { slug: string } }) =>
              userPermission.permission?.slug === permission,
          ),
        )
      : permissions.every((permission) =>
          userPermissions.some(
            (userPermission: { permission: { slug: string } }) =>
              userPermission.permission?.slug === permission,
          ),
        )
    : true;

  const hasSelfAccess = selfShouldAccess && id === userId;

  return isOwner || (hasRole && (hasPermission || hasSelfAccess));
};

export default AccessGuard;
