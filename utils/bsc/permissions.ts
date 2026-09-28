import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';

/**
 * BSC access rules, backed by the "BSC and KPI" permission group in Role
 * Permission settings (org-emp permission.json) — the BSC counterpart of
 * OKR's "OKR and Planning" group. Owners pass every check (AccessGuard).
 */

/** Any of these opens the KPI admin area (KPI library + scorecard setup). */
export const BSC_ADMIN_PERMISSIONS: string[] = [
  Permissions.ManageBscKpiLibrary,
  Permissions.ManageBscScorecards,
  Permissions.ImportBscKpis,
  Permissions.ManageBscCycles, // legacy slug, kept for existing roles
];

function has(permission: string): boolean {
  return AccessGuard.checkAccess({ permissions: [permission] });
}

export const bscAccess = {
  /** BSC menu / My Scorecard (Basic Permission, like view_okr). */
  view: () => has(Permissions.ViewBsc),
  manageAdmin: () =>
    AccessGuard.checkAccess({
      permissions: BSC_ADMIN_PERMISSIONS,
      requireAny: true,
    }),
  manageKpiLibrary: () => has(Permissions.ManageBscKpiLibrary),
  importKpis: () => has(Permissions.ImportBscKpis),
  manageScorecards: () => has(Permissions.ManageBscScorecards),
  assignIndividualKpis: () => has(Permissions.AssignIndividualBscKpis),
  /** Results: direct reports (like view-team-okr). */
  viewTeam: () => has(Permissions.ViewTeamBsc),
  /** Results: all employees (like view-company-okr). */
  viewCompany: () => has(Permissions.ViewCompanyBsc),
  submitCheckIn: () => has(Permissions.SubmitBscEvidence),
  evaluateCheckIns: () => has(Permissions.EvaluateBscScorecards),
  pepAudit: () => has(Permissions.PepAuditBscKpis),
  exportAuditReport: () => has(Permissions.ExportBscAuditReport),
};
