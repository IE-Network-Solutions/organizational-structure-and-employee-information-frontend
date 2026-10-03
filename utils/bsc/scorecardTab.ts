export type ScorecardTab =
  | 'mine'
  | 'team'
  | 'all'
  | 'results'
  | 'kpis'
  | 'bsc'
  | 'checkin';

export type ResultsScope = 'mine' | 'team' | 'all';

export const SCORECARD_BASE_PATH = '/bsc/my-scorecard';
export const BSC_KPI_ADMIN_BASE = '/bsc/kpi';

export type BscKpiAdminTab = 'kpis' | 'bsc';

export function bscKpiAdminHref(tab: BscKpiAdminTab = 'kpis'): string {
  if (tab === 'bsc') return `${BSC_KPI_ADMIN_BASE}/bsc`;
  return BSC_KPI_ADMIN_BASE;
}

export function parseBscKpiAdminTab(pathname: string): BscKpiAdminTab {
  if (pathname.includes(`${BSC_KPI_ADMIN_BASE}/bsc`)) return 'bsc';
  return 'kpis';
}

const SCORECARD_TABS: ScorecardTab[] = [
  'mine',
  'checkin',
  'kpis',
  'bsc',
  'results',
  'team',
  'all',
];

export function isScorecardTab(
  value: string | null | undefined,
): value is ScorecardTab {
  return SCORECARD_TABS.includes(value as ScorecardTab);
}

export function isResultsScope(
  value: string | null | undefined,
): value is ResultsScope {
  return value === 'mine' || value === 'team' || value === 'all';
}

/** Map legacy team/all tabs onto the merged Results tab. */
export function normalizeScorecardTab(tab: ScorecardTab): ScorecardTab {
  if (tab === 'team' || tab === 'all') return 'results';
  return tab;
}

export function scorecardTabHref(tab: ScorecardTab = 'mine'): string {
  const normalized = normalizeScorecardTab(tab);
  if (normalized === 'mine') return SCORECARD_BASE_PATH;
  if (tab === 'team' || tab === 'all') {
    return scorecardResultsHref(tab);
  }
  if (tab === 'kpis' || tab === 'bsc') {
    return bscKpiAdminHref(tab);
  }
  return `${SCORECARD_BASE_PATH}?tab=${normalized}`;
}

/** @deprecated Use ResultsListPreset */
export type ResultsSubView = 'overview' | 'pep-audit';

export type ResultsListPreset = 'all' | 'needs-audit';

export type ResultsPeriodFilter = 'current' | 'all';

export function scorecardResultsHref(
  scope: ResultsScope = 'team',
  /** @deprecated Results uses a unified current-period employee list */
  listPreset?: ResultsListPreset,
  /** @deprecated Period history is on the employee detail page */
  periodFilter?: ResultsPeriodFilter,
): string {
  void listPreset;
  void periodFilter;
  const params = new URLSearchParams({
    tab: 'results',
    scope,
  });
  return `${SCORECARD_BASE_PATH}?${params.toString()}`;
}

export function parseResultsListPreset(
  search: string | URLSearchParams | null | undefined,
): ResultsListPreset {
  if (!search) return 'needs-audit';
  const params =
    typeof search === 'string'
      ? new URLSearchParams(search.startsWith('?') ? search.slice(1) : search)
      : search;
  const filter = params.get('resultsFilter');
  if (filter === 'all') return 'all';
  if (filter === 'needs-audit') return 'needs-audit';
  // Legacy sub-tab URL
  if (params.get('resultsView') === 'pep-audit') return 'needs-audit';
  return 'needs-audit';
}

export function parseResultsPeriodFilter(
  search: string | URLSearchParams | null | undefined,
): ResultsPeriodFilter {
  if (!search) return 'current';
  const params =
    typeof search === 'string'
      ? new URLSearchParams(search.startsWith('?') ? search.slice(1) : search)
      : search;
  const period = params.get('resultsPeriod');
  if (period === 'all') return 'all';
  return 'current';
}

/** @deprecated Use parseResultsListPreset */
export function parseResultsSubView(
  search: string | URLSearchParams | null | undefined,
): ResultsSubView {
  return parseResultsListPreset(search) === 'needs-audit'
    ? 'pep-audit'
    : 'overview';
}

export function bscRollupHubHref(resultsScope: ResultsScope = 'all'): string {
  const params = new URLSearchParams({ resultsScope });
  return `/bsc/roll-up?${params.toString()}`;
}

export function bscRollupCompanyDetailHref(
  resultsScope: ResultsScope = 'all',
): string {
  const params = new URLSearchParams({
    resultsScope,
    view: 'company',
  });
  return `/bsc/roll-up?${params.toString()}`;
}

export function bscRollupDepartmentDetailHref(
  departmentName: string,
  resultsScope: ResultsScope = 'all',
): string {
  const params = new URLSearchParams({
    resultsScope,
    view: 'department',
    department: departmentName,
  });
  return `/bsc/roll-up?${params.toString()}`;
}

export function parseRollupView(
  search: string | URLSearchParams | null | undefined,
): 'hub' | 'company' | 'department' {
  if (!search) return 'hub';
  const params =
    typeof search === 'string'
      ? new URLSearchParams(search.startsWith('?') ? search.slice(1) : search)
      : search;
  const view = params.get('view');
  if (view === 'company') return 'company';
  if (view === 'department' || params.has('department')) return 'department';
  return 'hub';
}

export function scorecardPepAuditHref(
  userId: string,
  scorecardId: string,
  scope?: ResultsScope,
): string {
  const params = new URLSearchParams({
    scorecard: scorecardId,
    from: 'results-audit',
  });
  if (scope) params.set('scope', scope);
  return `/bsc/employees/${encodeURIComponent(userId)}/pep-audit?${params.toString()}`;
}

export function parseScorecardTab(
  search: string | URLSearchParams | null | undefined,
): ScorecardTab {
  if (!search) return 'mine';
  const params =
    typeof search === 'string'
      ? new URLSearchParams(search.startsWith('?') ? search.slice(1) : search)
      : search;
  const tab = params.get('tab');
  if (!isScorecardTab(tab)) return 'mine';
  return normalizeScorecardTab(tab);
}

export function parseResultsScope(
  search: string | URLSearchParams | null | undefined,
): ResultsScope {
  if (!search) return 'team';
  const params =
    typeof search === 'string'
      ? new URLSearchParams(search.startsWith('?') ? search.slice(1) : search)
      : search;

  const legacyTab = params.get('tab');
  if (legacyTab === 'team' || legacyTab === 'all') return legacyTab;

  const resultsScope = params.get('resultsScope');
  if (isResultsScope(resultsScope)) return resultsScope;

  const scope = params.get('scope');
  return isResultsScope(scope) ? scope : 'all';
}

/** Split a menu key that may include `?tab=`. */
export function splitMenuKey(key: string): {
  path: string;
  tab: ScorecardTab | null;
} {
  const qIndex = key.indexOf('?');
  if (qIndex === -1) {
    return { path: key, tab: null };
  }
  const path = key.slice(0, qIndex);
  const tab = parseScorecardTab(key.slice(qIndex + 1));
  // Explicit ?tab=mine still counts as mine; path-only keys use tab: null for matching.
  const params = new URLSearchParams(key.slice(qIndex + 1));
  return {
    path,
    tab: params.has('tab') ? tab : null,
  };
}

/**
 * Score how well a menu key matches the current location.
 * Higher is better; negative means no match.
 */
export function menuKeyMatchScore(
  key: string,
  pathname: string,
  search: string,
): number {
  const { path, tab: keyTab } = splitMenuKey(key);
  if (pathname !== path) return -1;

  const currentTab = parseScorecardTab(search);

  if (keyTab) {
    return keyTab === currentTab ? 3 : -1;
  }

  // Path-only "My Scorecard" covers its in-page tabs.
  if (path === SCORECARD_BASE_PATH) {
    return currentTab === 'mine' ||
      currentTab === 'checkin' ||
      currentTab === 'results'
      ? 2
      : -1;
  }

  if (path === BSC_KPI_ADMIN_BASE) {
    return pathname === BSC_KPI_ADMIN_BASE ||
      pathname.startsWith(`${BSC_KPI_ADMIN_BASE}/`)
      ? 2
      : -1;
  }

  return 1;
}

/** Open/active evaluation cycles represent the current reporting cadence. */
export function isCurrentReportingScorecard(
  scorecard: { cycleId: string },
  cycleById?: Map<string, { isActive?: boolean; status?: string }>,
): boolean {
  const cycle = cycleById?.get(scorecard.cycleId);
  if (!cycle) return scorecard.cycleId === 'config-seed-current';
  return cycle.status === 'Open' && cycle.isActive !== false;
}

/** BSC template / program name (e.g. Enterprise Non-Financial Scorecard). */
export function resolveScorecardTemplateName(
  scorecard: { cycleId: string; cycleLabel: string },
  cycleById?: Map<string, { label: string }>,
): string {
  const fromCycle = cycleById?.get(scorecard.cycleId)?.label?.trim();
  if (fromCycle) return fromCycle;
  const fallback = (scorecard.cycleLabel || '')
    .replace(/\s*\([^)]*\)\s*$/, '')
    .trim();
  return fallback || '—';
}
