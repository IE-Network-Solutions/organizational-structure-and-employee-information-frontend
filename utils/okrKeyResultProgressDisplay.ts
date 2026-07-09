/**
 * Shared Key Result progress helpers for OKR and Plan/Report UIs.
 * Numeric metrics use `currentValue` on the same scale as `targetValue` (see plan forms:
 * remaining budget uses `targetValue - currentValue`).
 */

export type KeyResultMetricName =
  | 'Milestone'
  | 'Achieve'
  | 'Achieved'
  | 'Numeric'
  | 'Currency'
  | 'Percentage'
  | 'Percent'
  | string;

export function getMetricTypeName(kr: {
  metricType?: { name?: string };
  key_type?: string;
}): KeyResultMetricName {
  return (kr?.metricType?.name || kr?.key_type || '') as KeyResultMetricName;
}

export function isMilestoneCompleted(m: { status?: string }): boolean {
  const s = String(m?.status ?? '')
    .trim()
    .toLowerCase();
  return s === 'completed' || s === 'done' || s === 'achieved';
}

export function isMilestoneKeyResult(kr: {
  metricType?: { name?: string };
  key_type?: string;
  milestones?: unknown[];
}): boolean {
  if (getMetricTypeName(kr) === 'Milestone') return true;
  return Array.isArray(kr?.milestones) && kr.milestones.length > 0;
}

function normalizeKeyResultStatus(kr: {
  status?: string;
  keyResultCompletionStatus?: string;
  completionStatus?: string;
}): string {
  return String(
    kr?.status ?? kr?.keyResultCompletionStatus ?? kr?.completionStatus ?? '',
  )
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');
}

const IN_PROGRESS_KR_STATUSES = new Set([
  'on_progress',
  'in_progress',
  'pending',
  'not_started',
  'overdue',
  'due_soon',
  'failed',
]);

/** KR was marked incomplete again (e.g. report updated from achieved → on progress). */
export function isKeyResultReopenedForPlanning(kr: {
  metricType?: { name?: string };
  key_type?: string;
  milestones?: Array<{ status?: string }>;
  progress?: number | string | null;
  status?: string;
  keyResultCompletionStatus?: string;
  completionStatus?: string;
  currentValue?: number | string | null;
  initialValue?: number | string | null;
  targetValue?: number | string | null;
}): boolean {
  const status = normalizeKeyResultStatus(kr);
  if (!status || !IN_PROGRESS_KR_STATUSES.has(status)) return false;
  // Status alone is not enough — many achieved KRs keep an in-progress status while at 100%.
  return getKeyResultProgressPercent(kr) < 100;
}

/**
 * Whether planning should be blocked for the whole KR (not individual milestones).
 * Milestone KRs stay plan-eligible until every milestone is completed.
 */
export function isKeyResultFullyCompletedForPlanning(kr: {
  metricType?: { name?: string };
  key_type?: string;
  milestones?: Array<{ status?: string; deletedAt?: string | null }>;
  progress?: number | string | null;
  status?: string;
  keyResultCompletionStatus?: string;
  completionStatus?: string;
  currentValue?: number | string | null;
  initialValue?: number | string | null;
  targetValue?: number | string | null;
}): boolean {
  if (isMilestoneKeyResult(kr)) {
    const milestones = (kr?.milestones ?? []).filter(
      (m) => m?.deletedAt == null,
    );
    if (milestones.length > 0 && milestones.every(isMilestoneCompleted)) {
      return true;
    }
    // Milestone status can lag behind measured progress (plan panel vs user KR API).
    return getKeyResultProgressPercent(kr) >= 100;
  }

  // Non-milestone KRs: measured progress is the sole gate (status can lag after report updates).
  return getKeyResultProgressPercent(kr) >= 100;
}

/** Merge plan-panel KR row with user KR API for eligibility (shared by panel + targets). */
export function buildKrPlanningSource(
  panelKr: {
    metricType?: string;
    progress?: number;
    currentValue?: string | number;
    targetValue?: string | number;
    milestones?: Array<{ status?: string; deletedAt?: string | null }>;
  },
  apiKr?: any | null,
) {
  if (!apiKr) {
    return {
      metricType: { name: panelKr.metricType },
      key_type: panelKr.metricType,
      progress: panelKr.progress,
      milestones: panelKr.milestones ?? [],
      currentValue: panelKr.currentValue,
      targetValue: panelKr.targetValue,
    };
  }
  const apiMilestones = apiKr.milestones ?? apiKr.Milestones;
  return {
    ...apiKr,
    metricType: apiKr.metricType ?? { name: panelKr.metricType },
    key_type: apiKr.key_type ?? panelKr.metricType,
    milestones:
      Array.isArray(apiMilestones) && apiMilestones.length > 0
        ? apiMilestones
        : (panelKr.milestones ?? []),
    progress: apiKr.progress ?? panelKr.progress,
    currentValue: apiKr.currentValue ?? panelKr.currentValue,
    targetValue: apiKr.targetValue ?? panelKr.targetValue,
    initialValue: apiKr.initialValue ?? panelKr.currentValue,
  };
}

/**
 * Whether + / planning slots must be hidden for a panel KR.
 * Panel progress can be ahead of a stale user-KR API response until refetch completes;
 * only reopen when API shows measured progress below 100%.
 */
export function resolveKrPlanningBlocked(
  panelKr: {
    metricType?: string;
    progress?: number;
    currentValue?: string | number;
    targetValue?: string | number;
    milestones?: Array<{ status?: string; deletedAt?: string | null }>;
  },
  apiKr?: any | null,
): boolean {
  const planningSource = buildKrPlanningSource(panelKr, apiKr);

  if (apiKr && isKeyResultReopenedForPlanning(planningSource)) {
    return false;
  }

  const panelProgress = Number(panelKr.progress ?? 0);

  if (isKeyResultFullyCompletedForPlanning(planningSource)) {
    return true;
  }

  if (!apiKr) {
    return panelProgress >= 100;
  }

  const apiProgress = getKeyResultProgressPercent(planningSource);
  return Math.max(apiProgress, panelProgress) >= 100;
}

export function getMilestoneProgressCounts(kr: {
  milestones?: Array<{ status?: string }>;
}): { completed: number; total: number } {
  const list = kr?.milestones ?? [];
  const total = list.length;
  const completed = list.filter(isMilestoneCompleted).length;
  return { completed, total };
}

/** Current reading for numeric / currency / % KRs (absolute scale, same as target). */
export function getNumericMetricCurrentValue(kr: {
  currentValue?: number | string | null;
  initialValue?: number | string | null;
}): number {
  const raw = kr?.currentValue;
  if (raw !== undefined && raw !== null && raw !== '') {
    const n = Number(raw);
    return Number.isFinite(n) ? n : Number(kr?.initialValue ?? 0) || 0;
  }
  const init = Number(kr?.initialValue ?? 0);
  return Number.isFinite(init) ? init : 0;
}

export function getNumericMetricTargetValue(kr: {
  targetValue?: number | string | null;
}): number {
  const t = Number(kr?.targetValue ?? 0);
  return Number.isFinite(t) ? t : 0;
}

function formatPlainNumber(n: number): string {
  if (!Number.isFinite(n)) return '0';
  if (Math.abs(n % 1) < 1e-9) return String(Math.round(n));
  return n.toLocaleString(undefined, { maximumFractionDigits: 4 });
}

export function formatValueForMetric(
  metric: KeyResultMetricName,
  value: number,
): string {
  switch (metric) {
    case 'Currency':
      return `$${formatPlainNumber(value)}`;
    case 'Percentage':
    case 'Percent':
      return `${formatPlainNumber(value)}%`;
    case 'Numeric':
    default:
      return formatPlainNumber(value);
  }
}

export function formatRawProgressValue(value: number): string {
  return formatPlainNumber(value);
}

/** Backend `progress` as 0–100 (handles 0–1 fractions). */
export function normalizeProgressPercent(kr: {
  progress?: number | string | null;
}): number {
  let p = Number(kr?.progress ?? 0);
  if (!Number.isFinite(p)) p = 0;
  if (p > 0 && p <= 1) p *= 100;
  return Math.min(100, Math.max(0, Math.round(p)));
}

function isPercentScaleMetric(metric: KeyResultMetricName): boolean {
  return (
    metric === 'Achieve' ||
    metric === 'Achieved' ||
    metric === 'Percentage' ||
    metric === 'Percent'
  );
}

/** Prominent "achieved / target" string for the KR card (Plan, Report, OKR). */
export function getKeyResultProgressRatioText(kr: {
  metricType?: { name?: string };
  key_type?: string;
  milestones?: Array<{ status?: string }>;
  progress?: number | string | null;
  currentValue?: number | string | null;
  initialValue?: number | string | null;
  targetValue?: number | string | null;
}): string {
  const metric = getMetricTypeName(kr);

  if (metric === 'Milestone') {
    const { completed, total } = getMilestoneProgressCounts(kr);
    return `${completed}/${total}`;
  }

  if (metric === 'Achieve' || metric === 'Achieved') {
    return `${normalizeProgressPercent(kr)}/100`;
  }

  const current = getNumericMetricCurrentValue(kr);
  const target = getNumericMetricTargetValue(kr);

  if (target > 0) {
    return `${formatRawProgressValue(current)}/${formatRawProgressValue(target)}`;
  }

  const percent = normalizeProgressPercent(kr);
  if (percent > 0 || isPercentScaleMetric(metric)) {
    return `${percent}/100`;
  }

  return `${formatRawProgressValue(current)}/${formatRawProgressValue(target)}`;
}

/**
 * Compact metric summary for OKR list rows (beneath key result title).
 */
export function getKeyResultMetricDetailLine(kr: {
  metricType?: { name?: string };
  key_type?: string;
  milestones?: Array<{ status?: string }>;
  progress?: number | string | null;
  currentValue?: number | string | null;
  initialValue?: number | string | null;
  targetValue?: number | string | null;
}): string | null {
  const metric = getMetricTypeName(kr);

  if (metric === 'Milestone') {
    const { completed, total } = getMilestoneProgressCounts(kr);
    if (total <= 0) return null;
    return `Milestones: ${completed}/${total} Completed`;
  }

  if (
    metric === 'Numeric' ||
    metric === 'Currency' ||
    metric === 'Percentage' ||
    metric === 'Percent'
  ) {
    const initial = Number(kr?.initialValue ?? 0);
    const target = getNumericMetricTargetValue(kr);
    const current = getNumericMetricCurrentValue(kr);
    const initialFmt = formatValueForMetric(
      metric,
      Number.isFinite(initial) ? initial : 0,
    );
    const targetFmt = formatValueForMetric(metric, target);
    const progressFmt = formatValueForMetric(metric, current);
    return `Initial: ${initialFmt} | Target: ${targetFmt} | Progress: ${progressFmt}`;
  }

  return null;
}

/**
 * Progress ring / summary percent (0–100).
 * Prefers a linear mapping from initial→target when possible; otherwise backend `progress`.
 */
export function getKeyResultProgressPercent(kr: {
  metricType?: { name?: string };
  key_type?: string;
  milestones?: Array<{ status?: string }>;
  progress?: number | string | null;
  currentValue?: number | string | null;
  initialValue?: number | string | null;
  targetValue?: number | string | null;
}): number {
  const metric = getMetricTypeName(kr);

  if (metric === 'Milestone') {
    const { completed, total } = getMilestoneProgressCounts(kr);
    const fromField = normalizeProgressPercent(kr);
    if (total <= 0) return fromField;
    const fromMilestones = Math.min(
      100,
      Math.max(0, Math.round((100 * completed) / total)),
    );
    return Math.max(fromMilestones, fromField);
  }

  if (metric === 'Achieve' || metric === 'Achieved') {
    return normalizeProgressPercent(kr);
  }

  const initial = Number(kr?.initialValue ?? 0);
  const current = getNumericMetricCurrentValue(kr);
  const target = getNumericMetricTargetValue(kr);
  const span = target - initial;
  if (Number.isFinite(span) && Math.abs(span) > 1e-9) {
    const raw = (100 * (current - initial)) / span;
    return Math.min(100, Math.max(0, Math.round(raw)));
  }

  return normalizeProgressPercent(kr);
}
