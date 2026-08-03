import { useEffect, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useGetActiveFiscalYears } from '@/store/server/features/organizationStructure/fiscalYear/queries';
import { Permissions } from '@/types/commons/permissionEnum';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';

const FISCAL_YEAR_MANAGE_PERMISSIONS = [
  Permissions.CreateCalendar,
  Permissions.UpdateCalendar,
  Permissions.DeleteCalendar,
];

// Helper to check if user has any of the given permissions (same logic as AccessGuard)
function hasAnyPermission(userPermissions: any[], permissions: string[]) {
  return permissions.some((permission) =>
    userPermissions?.some(
      (userPermission: { permission: { slug: string } }) =>
        userPermission.permission?.slug === permission,
    ),
  );
}

export function useFiscalYearRedirect() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: activeCalender } = useGetActiveFiscalYears({
    refetchInterval: 30000, // Poll every 30 seconds
  });
  const { userData } = useAuthenticationStore();
  const userPermissions = useMemo(
    () => userData?.userPermissions ?? [],
    [userData?.userPermissions],
  );
  const isOwner = userData?.role?.slug === 'owner';

  // Fiscal year end logic (replace with your real logic if needed)
  const hasEndedFiscalYear =
    activeCalender?.isActive &&
    activeCalender?.endDate &&
    new Date(activeCalender.endDate) < new Date();

  useEffect(() => {
    if (!hasEndedFiscalYear) return;

    // If user has permission or is owner, redirect to fiscal year settings
    if (
      isOwner ||
      hasAnyPermission(userPermissions, FISCAL_YEAR_MANAGE_PERMISSIONS)
    ) {
      if (pathname !== '/organization/settings/fiscalYear/fiscalYearCard') {
        router.replace('/organization/settings/fiscalYear/fiscalYearCard');
      }
    } else {
      // Otherwise, redirect to dashboard
      if (pathname !== '/dashboard') {
        router.replace('/dashboard');
      }
    }
  }, [hasEndedFiscalYear, isOwner, userPermissions, pathname, router]);
}
