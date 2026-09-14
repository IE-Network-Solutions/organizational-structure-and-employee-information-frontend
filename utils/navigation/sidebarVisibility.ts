import AccessGuard from '@/utils/permissionGuard';
import { isPersonalRoute } from '@/utils/navigation/personalRoutes';

export type SidebarMenuChild = {
  key: string;
  permissions?: string[];
  requireAny?: boolean;
};

export type SidebarMenuItem = {
  key: string;
  permissions?: string[];
  requireAny?: boolean;
  moduleCode?: string;
  children?: SidebarMenuChild[];
};

/** Filter personal routes out of module submenu items. */
export function filterAdminSidebarChildren(
  children: SidebarMenuChild[] | undefined,
): SidebarMenuChild[] {
  if (!children?.length) return [];
  return children.filter((child) => !isPersonalRoute(String(child.key)));
}

/**
 * Show a module in the slim sidebar when the user can access at least one
 * non-personal (admin/HR) child route, or the module has no children.
 */
export function shouldShowModuleInSidebar(
  item: SidebarMenuItem,
  isOwner: boolean,
): boolean {
  if (isOwner) return true;
  if (item.moduleCode === 'DASHBOARD') return false;

  const adminChildren = filterAdminSidebarChildren(item.children);

  if (!item.children?.length) {
    return AccessGuard.checkAccess({
      permissions: item.permissions,
      requireAny: item.requireAny,
    });
  }

  if (adminChildren.length === 0) return false;

  return adminChildren.some((child) =>
    AccessGuard.checkAccess({
      permissions: child.permissions,
      requireAny: child.requireAny,
    }),
  );
}
