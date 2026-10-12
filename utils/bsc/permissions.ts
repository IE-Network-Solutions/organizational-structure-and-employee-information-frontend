import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';

/**
 * BSC access rules, backed by the "BSC and KPI" permission group in Role
 * Permission settings (org-emp permission.json) — the BSC counterpart of
 * OKR's "OKR and Planning" group. Enforced in the frontend only (like OKR).
 * Owners pass every check (AccessGuard).
 *
 * Deliberately not permission-gated:
 * - Check-in submit: anyone with a scorecard reports their own KPIs.
 * - Check-in evaluation: whoever the KPI's evaluation flow names.
 * - Team results: managers always see their direct reports.
 */

/** Any of these opens the KPI tab (KPI library). */
export const BSC_KPI_PERMISSIONS: string[] = [
  Permissions.ViewBscKpi,
  Permissions.CreateBscKpi,
  Permissions.UpdateBscKpi,
  Permissions.DeleteBscKpi,
  Permissions.ImportBscKpi,
  Permissions.ExportBscKpi,
];

/** Any of these opens the BSC tab (scorecards) and scorecard detail pages. */
export const BSC_SCORECARD_PERMISSIONS: string[] = [
  Permissions.ViewBscScorecard,
  Permissions.CreateBscScorecard,
  Permissions.UpdateBscScorecard,
  Permissions.DeleteBscScorecard,
];

/** Any of these opens the KPI admin area (KPI library + scorecard setup). */
export const BSC_ADMIN_PERMISSIONS: string[] = [
  ...BSC_KPI_PERMISSIONS,
  ...BSC_SCORECARD_PERMISSIONS,
];

/** Any of these opens the PEP Audit Review page. */
export const BSC_PEP_AUDIT_PERMISSIONS: string[] = [
  Permissions.ViewBscPepAudit,
  Permissions.UpdateBscPepAudit,
];

function has(permission: string): boolean {
  return AccessGuard.checkAccess({ permissions: [permission] });
}

function hasAny(permissions: string[]): boolean {
  return AccessGuard.checkAccess({ permissions, requireAny: true });
}

export const bscAccess = {
  /** BSC menu / My Scorecard ("View My Scorecard", Basic Permission). */
  view: () => has(Permissions.ViewBsc),
  manageAdmin: () => hasAny(BSC_ADMIN_PERMISSIONS),

  // KPI library
  viewKpis: () => hasAny(BSC_KPI_PERMISSIONS),
  createKpi: () => has(Permissions.CreateBscKpi),
  updateKpi: () => has(Permissions.UpdateBscKpi),
  deleteKpi: () => has(Permissions.DeleteBscKpi),
  importKpis: () => has(Permissions.ImportBscKpi),
  exportKpis: () => has(Permissions.ExportBscKpi),

  // Scorecards (individual KPI assignment is part of creating a scorecard)
  viewScorecards: () => hasAny(BSC_SCORECARD_PERMISSIONS),
  createScorecard: () => has(Permissions.CreateBscScorecard),
  updateScorecard: () => has(Permissions.UpdateBscScorecard),
  deleteScorecard: () => has(Permissions.DeleteBscScorecard),
  assignIndividualKpis: () => has(Permissions.CreateBscScorecard),

  // Results
  /** Direct reports — every BSC user (managers see their team). */
  viewTeam: () => has(Permissions.ViewBsc),
  /** All employees ("View Results"). */
  viewCompany: () => has(Permissions.ViewBscResults),

  // PEP audit
  viewPepAudit: () => hasAny(BSC_PEP_AUDIT_PERMISSIONS),
  pepAudit: () => has(Permissions.UpdateBscPepAudit),
  exportAuditReport: () => has(Permissions.ExportBscPepAudit),

  /** Perspectives + BSC settings ("Create Perspective"). */
  managePerspectives: () => has(Permissions.CreateBscPerspective),
};
