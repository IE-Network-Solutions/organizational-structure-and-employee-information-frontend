import React, { ReactNode, useMemo } from 'react';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';

interface GeneralGuardProps {
  roles?: string[];
  permissions?: string[];
  id?: string;
  selfShouldAccess?: boolean;
  children: ReactNode;
}

const GeneralGuard: React.FC<GeneralGuardProps> = ({
  roles,
  permissions,
  id,
  selfShouldAccess = false,
  children,
}) => {
  const { userData, userId } = useAuthenticationStore();
  const role = userData?.role?.slug || '';
  const userPermissions = userData?.userPermissions || [];

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
    return (selfShouldAccess && id === userId) || role === 'owner';
  }, [selfShouldAccess, id, userId, role]);

  if (hasRole && (hasPermission || hasSelfAccess)) {
    return <>{children}</>;
  }

  return <></>;
};

export default GeneralGuard;