export type ScorecardTab =
  | 'mine'
  | 'team'
  | 'all'
  | 'results'
  | 'kpis'
  | 'bsc'
  | 'checkin';

export type ResultsScope = 'team' | 'all';

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
  return value === 'team' || value === 'all';
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

export function scorecardResultsHref(scope: ResultsScope = 'team'): string {
  return `${SCORECARD_BASE_PATH}?tab=results&scope=${scope}`;
}

export function parseScorecardTab(
  search: string | URLSearchParams | null | undefined,
): ScorecardTab {
  if (!search) return 'mine';
  const params =
    typeof search === 'string'
      ? new URLSearchParams(
          search.startsWith('?') ? search.slice(1) : search,
        )
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
      ? new URLSearchParams(
          search.startsWith('?') ? search.slice(1) : search,
        )
      : search;

  const legacyTab = params.get('tab');
  if (legacyTab === 'team' || legacyTab === 'all') return legacyTab;

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
