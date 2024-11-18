import React, { ReactNode, useMemo } from 'react';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';

interface AccessGuardProps {
  roles?: string[];
  permissions?: string[];
  id?: string;
  selfShouldAccess?: boolean;
  children: ReactNode;
}

const AccessGuard: React.FC<AccessGuardProps> = ({
  roles,
  permissions,
  id,
  selfShouldAccess = false,
  children,
}) => {
  const { userData, userId } = useAuthenticationStore.getState();

  const role = userData?.role?.slug || '';
  const userPermissions = userData?.userPermissions || [];

  const isOwner = useMemo(() => role === 'owner', [role]);

  const hasRole = useMemo(() => {
    return roles ? roles.includes(role) : true;
  }, [roles, role]);

  const hasPermission = useMemo(() => {
    return permissions
      ? permissions.every((permission) =>
          userPermissions.some(
            (userPermission: { permission: { slug: string } }) =>
              userPermission.permission.slug === permission,
          ),
        )
      : true;
  }, [permissions, userPermissions]);

  const hasSelfAccess = useMemo(() => {
    return selfShouldAccess && id === userId;
  }, [selfShouldAccess, id, userId]);

  if (isOwner || (hasRole && (hasPermission || hasSelfAccess))) {
    return <>{children}</>;
  }

  return null;
};

export default AccessGuard;
