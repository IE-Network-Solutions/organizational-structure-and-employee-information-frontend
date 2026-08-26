'use client';
import React, { ReactNode, useEffect, useState } from 'react';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';

interface AccessGuardProps {
  roles?: string[];
  permissions?: string[];
  id?: string;
  selfShouldAccess?: boolean;
  children?: ReactNode;
}

const AccessGuard: React.FC<AccessGuardProps> & {
  checkAccess: (props: AccessGuardProps) => boolean;
  hasExplicitPermission: (permission: string) => boolean;
} = ({ roles, permissions, id, selfShouldAccess = false, children }) => {
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
  id,
  selfShouldAccess = false,
}: AccessGuardProps): boolean => {
  const { userData, userId } = useAuthenticationStore.getState();

  const role = userData?.role?.slug || '';
  const userPermissions = userData?.userPermissions || [];

  const isOwner = role === 'owner';

  const hasRole = roles ? roles.includes(role) : true;

  const hasPermission = permissions
    ? permissions.every((permission) =>
        userPermissions.some(
          (userPermission: { permission: { slug: string } }) =>
            userPermission.permission?.slug === permission,
        ),
      )
    : true;

  const hasSelfAccess = selfShouldAccess && id === userId;

  return isOwner || (hasRole && (hasPermission || hasSelfAccess));
};

/**
 * Strict permission check with no `owner` short-circuit.
 *
 * Use this for anything a backend guard also enforces. `checkAccess` grants an
 * owner everything, but the services check the real permission list, so an
 * owner without the slug would be shown a button whose request comes back 403.
 */
AccessGuard.hasExplicitPermission = (permission: string): boolean => {
  const { userData } = useAuthenticationStore.getState();

  return (userData?.userPermissions || []).some(
    (userPermission: { permission?: { slug?: string } }) =>
      userPermission?.permission?.slug === permission,
  );
};

export default AccessGuard;
