import { create } from 'zustand';
import { CriticalRole } from '@/app/(afterLogin)/(employeeInformation)/employees/succession-planning/_components/criticalRoleModal';

/**
 * Client-side mirror of the succession-planning roles served by the API.
 *
 * `useSuccessionPlanningData` fills this from `GET /succession-planning/critical-roles`
 * and the screens read from it. All writes go through the API hooks in
 * `store/server/features/employees/successionPlanning/mutation.ts`, which
 * invalidate the roles query and refresh this store — so there is exactly one
 * source of truth for readiness, scores and gaps: the server.
 */
interface SuccessionPlanningStore {
  roles: CriticalRole[];
  setRoles: (roles: CriticalRole[]) => void;
  getRoleById: (id: string) => CriticalRole | undefined;
}

export const useSuccessionPlanningStore = create<SuccessionPlanningStore>(
  (set, get) => ({
    roles: [],
    setRoles: (roles) => set({ roles }),
    getRoleById: (id) => get().roles.find((role) => role.id === id),
  }),
);
