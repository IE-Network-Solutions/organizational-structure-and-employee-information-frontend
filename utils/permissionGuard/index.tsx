import React, { ReactNode, useMemo } from 'react';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';

interface RoleGuardProps {
  roles: string[];
  children: ReactNode;
}

const RoleGuard = ({ roles, children }: RoleGuardProps) => {
  const { userData } = useAuthenticationStore();
  const userRole = userData?.role?.slug || '';
  if (roles.includes(userRole)) {
    return <>{children}</>;
  } else {
    return <></>;
  }
};

export default RoleGuard;

interface PermissionWrapperProps {
  permissions: string[];
  children: ReactNode;
  id?: string;
  selfShouldAccess?: boolean;
}

export const PermissionWrapper: React.FC<PermissionWrapperProps> = ({
  permissions,
  children,
  id,
  selfShouldAccess = false,
}) => {
  const { userData, userId } = useAuthenticationStore.getState();
  const role = userData?.role?.name || '';
  const userPermissions = userData?.userPermissions || [];

  const hasPermission = useMemo(() => {
    return permissions.every((permission) =>
      userPermissions.some(
        (userPermission: { permission: { slug: string } }) =>
          userPermission.permission.slug === permission,
      ),
    );
  }, [permissions, userPermissions]);

  const shouldGetAccess = useMemo(() => {
    return (selfShouldAccess && id === userId) || role === 'Owner';
  }, [selfShouldAccess, id, userId, role]);

  if (hasPermission || shouldGetAccess) {
    return <>{children}</>;
  }

  return null;
};
