'use client';
import { useEffect, useMemo } from 'react';
import { useSuccessionPlanningStore } from '@/store/uistate/features/employees/successionPlanning';
import { useCriticalRoles, useFieldsOfStudy } from './queries';
import {
  useCreateCriticalRole,
  useCreateFieldOfStudy,
  useDeleteCriticalRole,
  useUpdateCriticalRole,
} from './mutation';
import { buildCriticalRolePayload, mapCriticalRoles } from './mappers';
import { useSuccessionOrgData } from './useSuccessionOrgData';
import type { CriticalRole } from '@/app/(afterLogin)/(employeeInformation)/employees/succession-planning/_components/criticalRoleModal';

/**
 * Bridges the succession-planning API to the UI store.
 *
 * The hub, role detail and successor detail screens all read from
 * `useSuccessionPlanningStore`. Rather than rewrite those components — and risk
 * drifting from the approved design — this hook keeps the store filled with
 * server data and exposes write helpers that go through the API and refetch.
 */
export const useSuccessionPlanningData = () => {
  const setRoles = useSuccessionPlanningStore((state) => state.setRoles);

  const { positions } = useSuccessionOrgData();
  const fieldsOfStudyQuery = useFieldsOfStudy();

  /**
   * Position titles/departments are resolved client-side: the API stores
   * `departmentId` but Core owns department names, so labelling here keeps the
   * roles table, evaluator tiles and reports consistent with the pickers.
   */
  const mapContext = useMemo(
    () => ({
      positionTitleById: new Map(
        positions.map((position) => [position.id, position.title]),
      ),
      positionDepartmentById: new Map(
        positions.map((position) => [position.id, position.department]),
      ),
    }),
    [positions],
  );

  const rolesQuery = useCriticalRoles();

  const createRole = useCreateCriticalRole();
  const updateRole = useUpdateCriticalRole();
  const deleteRole = useDeleteCriticalRole();
  const createFieldOfStudy = useCreateFieldOfStudy();

  // Re-maps whenever either roles or the positions catalog changes, so labels
  // fill in even when positions resolve after roles.
  const roles = useMemo(
    () => mapCriticalRoles(rolesQuery.data ?? [], mapContext),
    [rolesQuery.data, mapContext],
  );

  // Mirror server state into the store the screens already read from.
  useEffect(() => {
    if (rolesQuery.data) {
      setRoles(roles);
    }
  }, [roles, rolesQuery.data, setRoles]);

  /** Field-of-study names are sent as ids, so the wizard needs the catalog. */
  const fieldOfStudyIdByName = useMemo(() => {
    const map = new Map<string, string>();
    for (const field of fieldsOfStudyQuery.data ?? []) {
      map.set(field.name.trim().toLowerCase(), field.id);
    }
    return map;
  }, [fieldsOfStudyQuery.data]);

  /**
   * Resolve a field-of-study name to a catalog id, creating the entry when the
   * user typed a custom one. Without this a custom field would be sent as null,
   * which the API reads as "Any" — silently dropping the requirement.
   */
  const resolveFieldOfStudyId = async (
    fieldName?: string,
  ): Promise<string | null> => {
    const name = fieldName?.trim();
    if (!name || name === 'Any') return null;

    const existing = fieldOfStudyIdByName.get(name.toLowerCase());
    if (existing) return existing;

    try {
      const created = await createFieldOfStudy.mutateAsync({ name });
      return created?.id ?? null;
    } catch {
      // A concurrent create returns 409; fall back to "Any" rather than block.
      return null;
    }
  };

  const saveRole = async (
    values: Omit<CriticalRole, 'id' | 'successorCount'>,
    editingRoleId?: string,
  ) => {
    const fieldOfStudyId = await resolveFieldOfStudyId(
      values.requiredEducationField,
    );
    const departmentId = positions.find(
      (position) => position.id === values.positionId,
    )?.departmentId;

    const payload = {
      ...buildCriticalRolePayload(values, {
        fieldOfStudyIdByName,
        departmentId,
      }),
      fieldOfStudyId,
    };

    if (editingRoleId) {
      await updateRole.mutateAsync({ id: editingRoleId, payload });
      return;
    }
    await createRole.mutateAsync(payload);
  };

  const removeRole = async (id: string) => {
    await deleteRole.mutateAsync(id);
  };

  return {
    roles,
    isLoading: rolesQuery.isLoading,
    isError: rolesQuery.isError,
    error: rolesQuery.error,
    refetch: rolesQuery.refetch,
    fieldsOfStudy: fieldsOfStudyQuery.data ?? [],
    fieldOfStudyIdByName,
    saveRole,
    removeRole,
    isSaving:
      createRole.isLoading || updateRole.isLoading || deleteRole.isLoading,
  };
};
