'use client';
import React, { ReactNode, useEffect, useState } from 'react';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';

interface AccessGuardProps {
  roles?: string[];
  permissions?: string[];
  id?: string;
  selfShouldAccess?: boolean;
  /**
   * When true, skip the owner short-circuit and require the slug on the user
   * record. Use this for actions a backend PermissionsGuard also enforces.
   */
  explicit?: boolean;
  children?: ReactNode;
}

const addSlug = (slugs: Set<string>, entry: unknown) => {
  const slug =
    typeof entry === 'string'
      ? entry
      : entry && typeof entry === 'object'
        ? ((entry as { slug?: string }).slug ??
          (entry as { name?: string }).name ??
          (entry as { permission?: { slug?: string; name?: string } })
            .permission?.slug ??
          (entry as { permission?: { slug?: string; name?: string } })
            .permission?.name)
        : undefined;
  if (typeof slug === 'string' && slug.trim()) {
    slugs.add(slug.trim().toUpperCase());
  }
};

/** Same shapes the training-and-learning PermissionsGuard flattens. */
const collectPermissionSlugs = (user: Record<string, any> | undefined) => {
  const slugs = new Set<string>();
  const sources = [
    user?.permissions,
    user?.role?.permissions,
    ...(Array.isArray(user?.roles)
      ? user.roles.map((role: { permissions?: unknown }) => role?.permissions)
      : []),
    ...(Array.isArray(user?.userPermissions) ? [user.userPermissions] : []),
  ];

  for (const source of sources) {
    if (Array.isArray(source)) {
      source.forEach((entry) => addSlug(slugs, entry));
    }
  }

  return slugs;
};

const AccessGuard: React.FC<AccessGuardProps> & {
  checkAccess: (props: AccessGuardProps) => boolean;
  hasExplicitPermission: (permission: string) => boolean;
} = ({
  roles,
  permissions,
  id,
  selfShouldAccess = false,
  explicit = false,
  children,
}) => {
  const [isClient, setIsClient] = useState(false);
  const userData = useAuthenticationStore((state) => state.userData);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <></>;
  }

  const hasAccess = explicit
    ? (permissions ?? []).every((permission) =>
        collectPermissionSlugs(userData).has(permission.trim().toUpperCase()),
      )
    : AccessGuard.checkAccess({
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
  return collectPermissionSlugs(userData).has(permission.trim().toUpperCase());
};

/** Reactive check — subscribe to userData so buttons hide after a permission refresh. */
export const useHasPermission = (permission: string): boolean => {
  const userData = useAuthenticationStore((state) => state.userData);
  return collectPermissionSlugs(userData).has(permission.trim().toUpperCase());
};

export default AccessGuard;
