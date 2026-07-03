import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';

function pickFormCreatorId(form: any): string | null {
  if (!form || typeof form !== 'object') return null;
  const raw =
    form.createdByUserId ??
    form.createdById ??
    form.createdBy ??
    form.createdByUser?.id ??
    form.createdBy?.id;
  if (raw == null || raw === '') return null;
  return String(raw);
}

export function pickFormPermissionUserIds(form: any): string[] {
  const perms = form?.formPermissions;
  if (!Array.isArray(perms) || perms.length === 0) return [];
  return perms
    .map((p: any) => p?.userId ?? p?.id ?? p?.user?.id)
    .filter((id: unknown) => id != null && id !== '')
    .map((id: unknown) => String(id));
}

/** Whether the current user can manage all surveys (not restricted to formPermissions). */
export function canManageSurveyForms(): boolean {
  return AccessGuard.checkAccess({
    permissions: [
      Permissions.CreateFormCategory,
      Permissions.UpdateFormCategory,
    ],
  });
}

/**
 * Returns true when the user may open a survey in the CFR survey list/detail.
 * Unrestricted surveys (no formPermissions) remain visible to all authenticated users.
 */
export function canUserViewSurveyForm(
  form: any,
  userId: string | null | undefined,
): boolean {
  if (!form) return false;
  if (canManageSurveyForms()) return true;

  const normalizedUserId =
    userId != null && userId !== '' ? String(userId) : null;
  const creatorId = pickFormCreatorId(form);
  if (
    normalizedUserId &&
    creatorId &&
    normalizedUserId === String(creatorId)
  ) {
    return true;
  }

  const allowedUserIds = pickFormPermissionUserIds(form);
  if (allowedUserIds.length === 0) return true;

  if (!normalizedUserId) return false;
  return allowedUserIds.includes(normalizedUserId);
}

export function filterSurveyFormsForUser<T extends Record<string, any>>(
  forms: T[],
  userId: string | null | undefined,
): T[] {
  if (!Array.isArray(forms) || forms.length === 0) return [];
  return forms.filter((form) => canUserViewSurveyForm(form, userId));
}
