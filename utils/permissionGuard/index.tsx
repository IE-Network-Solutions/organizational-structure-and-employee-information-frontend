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
  ownerShouldAccess?: boolean;
}

export const PermissionWrapper: React.FC<PermissionWrapperProps> = ({
  permissions,
  children,
  id,
  ownerShouldAccess = false,
}) => {
  const { userData, userId } = useAuthenticationStore.getState();
  const userPermissions = userData?.userPermissions || [];

  const hasPermission = useMemo(() => {
    return permissions.every((permission) =>
      userPermissions.some(
        (userPermission: any) =>
          userPermission.permission.slug === permission,
      ),
    );
  }, [permissions, userPermissions]);

  const isOwner = ownerShouldAccess && id === userId;

  if (hasPermission || isOwner) {
    return <>{children}</>;
  }

  return null;
};