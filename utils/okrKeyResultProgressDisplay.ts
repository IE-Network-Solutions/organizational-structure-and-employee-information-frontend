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
  metricType?: { name?: string } | string;
  key_type?: string;
  metricTypeName?: string;
}): KeyResultMetricName {
  if (typeof kr?.metricType === 'string' && kr.metricType.trim()) {
    return kr.metricType.trim() as KeyResultMetricName;
  }
  const fromObject = (kr?.metricType as { name?: string } | undefined)?.name;
  if (fromObject) return fromObject as KeyResultMetricName;
  if (kr?.metricTypeName)
    return String(kr.metricTypeName) as KeyResultMetricName;
  return (kr?.key_type || '') as KeyResultMetricName;
}

/** Display label for KR cards (Plan & Report panel, OKR-adjacent UIs). */
export function formatKrMetricTypeDisplayName(
  metric: string | null | undefined,
): string {
  if (!metric) return '';
  const n = String(metric).trim();
  if (!n || n === 'N/A' || n.toLowerCase() === 'metric') return '';
  const normalized = n.charAt(0).toUpperCase() + n.slice(1).toLowerCase();
  const map: Record<string, string> = {
    Achieve: 'Achieve',
    Achieved: 'Achieve',
    Milestone: 'Milestone',
    Percentage: 'Percent',
    Percent: 'Percent',
    Numeric: 'Numeric',
    Currency: 'Currency',
  };
  return map[n] ?? map[normalized] ?? n;
}

/**
 * Resolve the metric type label shown on Plan & Report KR cards.
 * Merges API / plan fields and infers from structure when metadata is missing.
 */
export function resolveKrPanelMetricType(kr: {
  metricType?: { name?: string } | string;
  key_type?: string;
  metricTypeName?: string;
  milestones?: Array<{ deletedAt?: string | null }>;
  Milestones?: Array<{ deletedAt?: string | null }>;
  progress?: number | string | null;
  targetValue?: number | string | null;
  initialValue?: number | string | null;
}): string {
  const candidates = [
    getMetricTypeName(kr),
    kr?.metricTypeName,
    kr?.key_type,
    typeof kr?.metricType === 'string' ? kr.metricType : undefined,
  ];

  for (const candidate of candidates) {
    const label = formatKrMetricTypeDisplayName(candidate);
    if (label) return label;
  }

  const milestones = resolveOkrMilestones(kr);
  if (milestones.length > 0) return 'Milestone';

  const target = getNumericMetricTargetValue(kr);
  if (target > 0) {
    const metric = getMetricTypeName(kr);
    if (metric && metric !== 'N/A') {
      const label = formatKrMetricTypeDisplayName(metric);
      if (label) return label;
    }
    return 'Numeric';
  }

  return '';
}

type MilestoneRowInput = {
  status?: string | null;
  deletedAt?: string | null;
  tasks?: unknown[];
};

type OkrMilestoneRow = Pick<MilestoneRowInput, 'status' | 'deletedAt'>;

type MilestoneSourceInput = {
  milestones?: MilestoneRowInput[] | unknown[];
  Milestones?: MilestoneRowInput[] | unknown[];
};

/** KR-shaped payload accepted by progress display helpers. */
export type KeyResultProgressInput = {
  metricType?: { name?: string } | string;
  key_type?: string;
  metricTypeName?: string;
  milestones?: MilestoneRowInput[] | unknown[];
  Milestones?: MilestoneRowInput[] | unknown[];
  progress?: number | string | null;
  currentValue?: number | string | null;
  initialValue?: number | string | null;
  targetValue?: number | string | null;
  status?: string;
  keyResultCompletionStatus?: string;
  completionStatus?: string;
};

function asMilestoneRows(raw: unknown): MilestoneRowInput[] {
  if (!Array.isArray(raw)) return [];
  return raw as MilestoneRowInput[];
}

function isPlanTaskGroupingMilestone(m: MilestoneRowInput): boolean {
  const hasTasks = Array.isArray(m?.tasks) && m.tasks.length > 0;
  const status = String(m?.status ?? '').trim();
  return hasTasks && status.length === 0;
}

/**
 * OKR milestone rows only (status-bearing). Ignores plan-scoped task groupings.
 */
export function resolveOkrMilestones(
  kr: MilestoneSourceInput,
  apiKr?: MilestoneSourceInput | null,
): OkrMilestoneRow[] {
  const apiList = asMilestoneRows(apiKr?.milestones ?? apiKr?.Milestones);
  if (apiList.length > 0) {
    return apiList.filter((m) => m?.deletedAt == null);
  }

  const krList = asMilestoneRows(kr?.milestones ?? kr?.Milestones);
  if (krList.length === 0) return [];

  const active = krList.filter((m) => m?.deletedAt == null);
  if (active.length === 0) return [];

  const okrShaped = active.filter(
    (m) =>
      !isPlanTaskGroupingMilestone(m) && String(m?.status ?? '').length > 0,
  );
  if (okrShaped.length > 0) return okrShaped;

  if (active.every(isPlanTaskGroupingMilestone)) return [];

  return active;
}

function coerceMetricTypeObject(
  metricType: unknown,
  keyType?: string | null,
): { name: string } | undefined {
  if (metricType && typeof metricType === 'object' && 'name' in metricType) {
    const name = String((metricType as { name?: string }).name ?? '').trim();
    if (name && name !== 'N/A') return { name };
  }
  if (typeof metricType === 'string') {
    const name = metricType.trim();
    if (name && name !== 'N/A') return { name };
  }
  const kt = String(keyType ?? '').trim();
  if (kt && kt !== 'N/A') return { name: kt };
  return undefined;
}

function withResolvedOkrMilestones<T extends Record<string, unknown>>(
  kr: T,
  apiKr?: Record<string, unknown> | null,
): T & { milestones: OkrMilestoneRow[] } {
  return {
    ...kr,
    milestones: resolveOkrMilestones(
      kr as MilestoneSourceInput,
      apiKr as MilestoneSourceInput | null,
    ),
  };
}

/** Count plan-linked tasks on a KR (direct, milestone, and parent-task trees). */
export function countKeyResultPlanTasks(kr: {
  tasks?: unknown[];
  milestones?: Array<{
    tasks?: unknown[];
    parentTask?: Array<{ tasks?: unknown[] }>;
  }>;
  parentTask?: Array<{ tasks?: unknown[] }>;
}): number {
  const tasks: unknown[] = [];
  if (kr?.tasks) tasks.push(...kr.tasks);
  kr?.milestones?.forEach((m) => {
    if (m?.tasks) tasks.push(...m.tasks);
    m?.parentTask?.forEach((p) => {
      if (p?.tasks) tasks.push(...p.tasks);
    });
  });
  kr?.parentTask?.forEach((p) => {
    if (p?.tasks) tasks.push(...p.tasks);
  });
  return tasks.length;
}

export function countKeyResultMilestones(
  kr: MilestoneSourceInput,
  apiKr?: MilestoneSourceInput | null,
): number {
  return resolveOkrMilestones(kr, apiKr).length;
}

export function isMilestoneCompleted(m: { status?: string | null }): boolean {
  const s = String(m?.status ?? '')
    .trim()
    .toLowerCase();
  return s === 'completed' || s === 'done' || s === 'achieved';
}

export function isMilestoneKeyResult(kr: KeyResultProgressInput): boolean {
  if (getMetricTypeName(kr) === 'Milestone') return true;
  return resolveOkrMilestones(kr).length > 0;
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
export function isKeyResultReopenedForPlanning(
  kr: KeyResultProgressInput,
): boolean {
  const status = normalizeKeyResultStatus(kr);
  if (!status || !IN_PROGRESS_KR_STATUSES.has(status)) return false;
  // Status alone is not enough — many achieved KRs keep an in-progress status while at 100%.
  return getKeyResultProgressPercent(kr) < 100;
}

/**
 * Whether planning should be blocked for the whole KR (not individual milestones).
 * Milestone KRs stay plan-eligible until every milestone is completed.
 */
export function isKeyResultFullyCompletedForPlanning(
  kr: KeyResultProgressInput,
): boolean {
  if (isMilestoneKeyResult(kr)) {
    const milestones = resolveOkrMilestones(kr);
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
    const milestones = resolveOkrMilestones({
      milestones: panelKr.milestones ?? [],
    });
    const metricTypeObj = coerceMetricTypeObject(
      panelKr.metricType,
      panelKr.metricType,
    );
    const source = {
      metricType: metricTypeObj ?? { name: panelKr.metricType },
      key_type: panelKr.metricType,
      progress: panelKr.progress,
      milestones,
      currentValue: panelKr.currentValue,
      targetValue: panelKr.targetValue,
      initialValue: panelKr.currentValue,
    };
    return {
      ...source,
      progress: getKeyResultProgressPercent(source),
    };
  }
  const merged = withResolvedOkrMilestones(
    {
      ...apiKr,
      metricType:
        coerceMetricTypeObject(apiKr.metricType, apiKr.key_type) ??
        coerceMetricTypeObject(panelKr.metricType, panelKr.metricType),
      key_type: apiKr.key_type ?? panelKr.metricType,
      progress: apiKr.progress ?? panelKr.progress,
      currentValue: apiKr.currentValue ?? panelKr.currentValue,
      targetValue: apiKr.targetValue ?? panelKr.targetValue,
      initialValue: apiKr.initialValue ?? panelKr.currentValue,
    },
    apiKr,
  );
  return {
    ...merged,
    progress: getKeyResultProgressPercent(merged),
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
  return apiProgress >= 100;
}

export function getMilestoneProgressCounts(kr: KeyResultProgressInput): {
  completed: number;
  total: number;
} {
  const list = resolveOkrMilestones(kr);
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
export function getKeyResultProgressRatioText(
  kr: KeyResultProgressInput,
): string {
  const metric = getMetricTypeName(kr);

  if (isMilestoneKeyResult(kr)) {
    const { completed, total } = getMilestoneProgressCounts(kr);
    if (total <= 0) return '';
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

  // Progress-only KRs (Achieve) when metric metadata was omitted on plan payloads.
  if (
    !metric &&
    kr?.progress !== undefined &&
    kr?.progress !== null &&
    String(kr.progress).trim() !== ''
  ) {
    return `${percent}/100`;
  }

  if (current === 0 && target === 0) return '';

  return `${formatRawProgressValue(current)}/${formatRawProgressValue(target)}`;
}

/**
 * Compact metric summary for OKR list rows (beneath key result title).
 */
export function getKeyResultMetricDetailLine(
  kr: KeyResultProgressInput,
): string | null {
  const metric = getMetricTypeName(kr);

  if (isMilestoneKeyResult(kr)) {
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
export function getKeyResultProgressPercent(
  kr: KeyResultProgressInput,
): number {
  const metric = getMetricTypeName(kr);

  if (isMilestoneKeyResult(kr)) {
    const { completed, total } = getMilestoneProgressCounts(kr);
    const fromField = normalizeProgressPercent(kr);
    const fromMilestones =
      total > 0
        ? Math.min(100, Math.max(0, Math.round((100 * completed) / total)))
        : null;

    if (total > 0 && fromMilestones != null) {
      const hasExplicitProgress =
        kr?.progress !== undefined &&
        kr?.progress !== null &&
        kr?.progress !== '';
      if (!hasExplicitProgress) return fromMilestones;
      if (fromField >= 100 && completed < total) return fromMilestones;
      if (completed < total && fromField > fromMilestones + 1) {
        return fromMilestones;
      }
      return fromField;
    }

    if (fromField >= 100 && completed === 0) return 0;
    return fromField;
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

/**
 * Merge plan / report KR payload with user KR API (milestones, progress).
 * Cadence-agnostic: same OKR source of truth for daily, weekly, and monthly views.
 */
export function mergeKeyResultWithUserApi(
  kr: any,
  userKeyResultItems: any[],
): any {
  const apiKr = userKeyResultItems.find(
    (k) => k && k.deletedAt == null && String(k.id) === String(kr?.id),
  );
  if (!apiKr) {
    const milestones = resolveOkrMilestones(kr);
    const metricTypeObj =
      coerceMetricTypeObject(kr?.metricType, kr?.key_type) ??
      (milestones.length > 0 ? { name: 'Milestone' } : undefined);
    const fallback = {
      ...kr,
      milestones,
      metricType: metricTypeObj ?? kr?.metricType,
      key_type: kr?.key_type ?? metricTypeObj?.name,
      metricTypeName: kr?.metricTypeName ?? metricTypeObj?.name ?? kr?.key_type,
    };
    return {
      ...fallback,
      progress: getKeyResultProgressPercent(fallback),
    };
  }

  const merged = withResolvedOkrMilestones(
    {
      ...kr,
      ...apiKr,
      metricType:
        coerceMetricTypeObject(apiKr.metricType, apiKr.key_type) ??
        coerceMetricTypeObject(kr?.metricType, kr?.key_type),
      key_type: apiKr.key_type ?? kr?.key_type,
      metricTypeName:
        apiKr.metricType?.name ??
        apiKr.metricTypeName ??
        kr?.metricTypeName ??
        kr?.metricType?.name,
      progress: apiKr.progress ?? kr?.progress,
      currentValue: apiKr.currentValue ?? kr?.currentValue,
      initialValue: apiKr.initialValue ?? kr?.initialValue,
      targetValue: apiKr.targetValue ?? kr?.targetValue,
      status: apiKr.status ?? kr?.status,
      keyResultCompletionStatus:
        apiKr.keyResultCompletionStatus ?? kr?.keyResultCompletionStatus,
    },
    apiKr,
  );

  return {
    ...merged,
    progress: getKeyResultProgressPercent(merged),
  };
}

/** Merge with user KR API and recompute display progress (all plan cadences). */
export function enrichKeyResultWithUserApi(
  kr: any,
  userKeyResultItems: any[],
): any {
  return mergeKeyResultWithUserApi(kr, userKeyResultItems);
}
