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
  | 'KPI'
  | string;

type MilestoneRowInput = {
  status?: string | null;
  deletedAt?: string | null;
  tasks?: unknown[];
  title?: string | null;
  name?: string | null;
};

type OkrMilestoneRow = Pick<MilestoneRowInput, 'status' | 'deletedAt'>;

/** Milestone array fields shared by plan, OKR API, and panel KR payloads. */
export interface KrMilestoneFields {
  milestones?: unknown[] | null;
  Milestones?: unknown[] | null;
}

/** Any payload that may carry plan or OKR milestone arrays. */
export type KrMilestoneCarrier = KrMilestoneFields | null | undefined;

/**
 * Loose KR payload accepted by display helpers.
 * Call sites use many incompatible Milestone/KR shapes — keep this permissive.
 * Must extend {@link KrMilestoneFields} so milestone helpers accept panel/API/plan rows.
 */
export type KeyResultLikeInput = KrMilestoneFields & {
  metricType?: { name?: string } | string | null;
  key_type?: string | null;
  metricTypeName?: string | null;
  previousMetricTypeName?: string | null;
  tasks?: unknown[] | null;
  parentTask?: unknown[] | null;
  progress?: number | string | null;
  targetValue?: number | string | null;
  currentValue?: number | string | null;
  initialValue?: number | string | null;
  status?: string;
  keyResultCompletionStatus?: string;
  completionStatus?: string;
};

/** KR-shaped payload accepted by progress display helpers. */
export type KeyResultProgressInput = KeyResultLikeInput;

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
  kr?: KrMilestoneCarrier,
  apiKr?: KrMilestoneCarrier,
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

/** Plan/report milestone rows used only to group tasks (no OKR status yet). */
export function hasPlanMilestoneTaskGroupings(
  kr?: KrMilestoneCarrier,
): boolean {
  const list = asMilestoneRows(kr?.milestones ?? kr?.Milestones);
  if (list.length === 0) return false;
  return list.some(
    (m) =>
      m?.deletedAt == null &&
      (isPlanTaskGroupingMilestone(m) ||
        (!String(m?.status ?? '').trim() &&
          ((Array.isArray(m?.tasks) && m.tasks.length > 0) ||
            Boolean(m?.title) ||
            Boolean(m?.name)))),
  );
}

/** Canonical metric labels — must match OKR `metricType.name` values. */
const KR_METRIC_TYPE_CANONICAL: Record<string, string> = {
  Achieve: 'Achieve',
  Achieved: 'Achieve',
  Milestone: 'Milestone',
  Percentage: 'Percentage',
  Percent: 'Percentage',
  Numeric: 'Numeric',
  Currency: 'Currency',
  KPI: 'KPI',
};

const KNOWN_METRIC_LABELS = new Set(Object.values(KR_METRIC_TYPE_CANONICAL));

function normalizeMetricToken(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

function readMetricNameFromValue(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'object' && value !== null && 'name' in value) {
    return String((value as { name?: string }).name ?? '').trim();
  }
  return '';
}

export function getMetricTypeName(
  kr: KeyResultLikeInput | null | undefined,
): KeyResultMetricName {
  if (!kr) return '' as KeyResultMetricName;

  const candidates = [
    typeof kr.metricType === 'string' ? kr.metricType : undefined,
    kr.metricType && typeof kr.metricType === 'object'
      ? kr.metricType.name
      : undefined,
    kr.metricTypeName,
    kr.key_type,
    kr.previousMetricTypeName,
  ];

  for (const candidate of candidates) {
    const name = readMetricNameFromValue(candidate);
    if (name && name !== 'N/A') return name as KeyResultMetricName;
  }

  return '' as KeyResultMetricName;
}

/** Normalize any metricType shape to `{ name }` for merge / display payloads. */
export function toMetricTypeObject(
  metricType?: { name?: string } | string | null,
  keyType?: string | null,
): { name: string } | undefined {
  const name = getMetricTypeName({
    metricType,
    key_type: keyType ?? undefined,
  });
  return name ? { name } : undefined;
}

/** Display label for KR cards — same spelling as OKR metric type names. */
export function formatKrMetricTypeDisplayName(
  metric: string | null | undefined,
): string {
  if (!metric) return '';
  const n = String(metric).trim();
  if (!n || n === 'N/A' || n.toLowerCase() === 'metric') return '';
  const normalized = normalizeMetricToken(n);
  return (
    KR_METRIC_TYPE_CANONICAL[n] ?? KR_METRIC_TYPE_CANONICAL[normalized] ?? n
  );
}

function resolveExplicitMetricLabel(
  kr: KeyResultLikeInput | null | undefined,
): string {
  const metric = getMetricTypeName(kr);
  return formatKrMetricTypeDisplayName(metric);
}

/**
 * Resolve the metric type label shown on Plan & Report KR cards.
 * OKR user-KR API is the source of truth; plan payloads only fill gaps.
 */
export function resolveKrPanelMetricType(
  kr: KeyResultLikeInput | null | undefined,
  apiKr?: KeyResultLikeInput | null,
): string {
  // 1. OKR API metric metadata always wins.
  const apiLabel = resolveExplicitMetricLabel(apiKr);
  if (apiLabel) return apiLabel;

  // 2. Explicit metric on the plan/report payload.
  const planLabel = resolveExplicitMetricLabel(kr);
  if (planLabel) return planLabel;

  // 3. OKR milestone rows (from API first, then plan KR).
  if (resolveOkrMilestones(kr, apiKr).length > 0) return 'Milestone';

  // 4. Plan milestone task shells indicate a Milestone KR even without OKR status rows.
  if (
    hasPlanMilestoneTaskGroupings(apiKr) ||
    hasPlanMilestoneTaskGroupings(kr)
  ) {
    return 'Milestone';
  }

  // Never guess Achieve/Numeric/Currency/Percentage from progress or targets alone.
  return '';
}

/** Resolve a display label from any KR-shaped payload (panel cards, forms, lists). */
export function resolveKrMetricTypeLabel(
  kr: KeyResultLikeInput | null | undefined,
  apiKr?: KeyResultLikeInput | null,
): string {
  return resolveKrPanelMetricType(kr, apiKr);
}

/** Whether a stored panel label is a known OKR metric (vs a stale guess). */
export function isKnownKrMetricTypeLabel(
  label: string | null | undefined,
): boolean {
  if (!label) return false;
  return KNOWN_METRIC_LABELS.has(label.trim());
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

function withResolvedOkrMilestones<T extends KrMilestoneFields>(
  kr: T,
  apiKr?: KrMilestoneCarrier,
): T & { milestones: OkrMilestoneRow[] } {
  const resolved = resolveOkrMilestones(kr, apiKr);
  if (resolved.length > 0) {
    return {
      ...kr,
      milestones: resolved,
    };
  }

  // Do not wipe real milestone rows to [] when resolve filters them out
  // (e.g. not-started rows without status). Prefer API, then source.
  const fallback = asMilestoneRows(
    apiKr?.milestones ?? apiKr?.Milestones ?? kr?.milestones ?? kr?.Milestones,
  ).filter((m) => m?.deletedAt == null);

  return {
    ...kr,
    milestones: fallback.length > 0 ? fallback : resolved,
  };
}

/** Count plan-linked tasks on a KR (direct, milestone, and parent-task trees). */
export function countKeyResultPlanTasks(
  kr: KeyResultLikeInput | null | undefined,
): number {
  if (!kr) return 0;

  const tasks: unknown[] = [];
  if (Array.isArray(kr.tasks)) tasks.push(...kr.tasks);

  const milestones = Array.isArray(kr.milestones) ? kr.milestones : [];
  milestones.forEach((raw) => {
    const m = raw as {
      tasks?: unknown[];
      parentTask?: Array<{ tasks?: unknown[] }>;
    };
    if (Array.isArray(m?.tasks)) tasks.push(...m.tasks);
    if (Array.isArray(m?.parentTask)) {
      m.parentTask.forEach((p) => {
        if (Array.isArray(p?.tasks)) tasks.push(...p.tasks);
      });
    }
  });

  const parents = Array.isArray(kr.parentTask) ? kr.parentTask : [];
  parents.forEach((raw) => {
    const p = raw as { tasks?: unknown[] };
    if (Array.isArray(p?.tasks)) tasks.push(...p.tasks);
  });

  return tasks.length;
}

export function countKeyResultMilestones(
  kr?: KrMilestoneCarrier,
  apiKr?: KrMilestoneCarrier,
): number {
  return resolveOkrMilestones(kr, apiKr).length;
}

export function isMilestoneCompleted(m: {
  status?: string | null;
  isAchieved?: boolean | null;
  progress?: number | string | null;
  keyResultCompletionStatus?: string | null;
  completionStatus?: string | null;
}): boolean {
  if (m?.isAchieved === true) return true;
  const s = String(
    m?.status ?? m?.keyResultCompletionStatus ?? m?.completionStatus ?? '',
  )
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');
  if (
    s === 'completed' ||
    s === 'complete' ||
    s === 'done' ||
    s === 'achieved'
  ) {
    return true;
  }
  // OKR UI also stores PascalCase "Completed" — already covered by toLowerCase.
  const p = Number(m?.progress);
  // Only treat explicit 0–100 completion; do not treat progress=1 as 100%
  // (that would false-positive on a 0–100 scale).
  return Number.isFinite(p) && p >= 100;
}

export function isMilestoneKeyResult(
  kr?: KeyResultLikeInput | null,
  apiKr?: KeyResultLikeInput | null,
): boolean {
  if (getMetricTypeName(kr) === 'Milestone') return true;
  if (apiKr && getMetricTypeName(apiKr) === 'Milestone') return true;
  if (resolveOkrMilestones(kr, apiKr).length > 0) return true;
  return (
    hasPlanMilestoneTaskGroupings(kr) || hasPlanMilestoneTaskGroupings(apiKr)
  );
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
 * Milestone KRs stay plan-eligible until every milestone is completed — partial
 * progress (e.g. 1–2 of 5 achieved) must NOT hide planning.
 */
export function isKeyResultFullyCompletedForPlanning(
  kr: KeyResultProgressInput,
): boolean {
  if (isMilestoneKeyResult(kr)) {
    const milestones = resolveOkrMilestones(kr);
    if (milestones.length > 0) {
      return milestones.every(isMilestoneCompleted);
    }
    // No OKR milestone rows yet — fall back to measured progress.
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
    const planMilestoneShells = hasPlanMilestoneTaskGroupings({
      milestones: panelKr.milestones ?? [],
    });
    const metricTypeObj =
      coerceMetricTypeObject(panelKr.metricType, panelKr.metricType) ??
      (planMilestoneShells ? { name: 'Milestone' } : undefined);
    const source = {
      metricType: metricTypeObj,
      key_type: metricTypeObj?.name ?? panelKr.metricType,
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

  const apiMetricType = coerceMetricTypeObject(
    apiKr.metricType,
    apiKr.key_type,
  );

  const merged = withResolvedOkrMilestones(
    {
      ...apiKr,
      metricType: apiMetricType,
      key_type: apiKr.key_type ?? apiMetricType?.name,
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

  // Milestone KRs: only block when every OKR milestone is achieved.
  // Do not use aggregate progress alone — that hides + while milestones remain.
  const milestoneRows = resolveOkrMilestones(planningSource, apiKr);
  if (isMilestoneKeyResult(planningSource, apiKr) && milestoneRows.length > 0) {
    return milestoneRows.every(isMilestoneCompleted);
  }

  if (isKeyResultFullyCompletedForPlanning(planningSource)) {
    return true;
  }

  const panelProgress = Number(panelKr.progress ?? 0);
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
    const preserved =
      milestones.length > 0
        ? milestones
        : asMilestoneRows(kr?.milestones ?? kr?.Milestones).filter(
            (m) => m?.deletedAt == null,
          );
    const planMilestoneShells = hasPlanMilestoneTaskGroupings(kr);
    const metricTypeObj =
      coerceMetricTypeObject(kr?.metricType, kr?.key_type) ??
      (preserved.length > 0 || planMilestoneShells
        ? { name: 'Milestone' }
        : undefined);
    const fallback = {
      ...kr,
      milestones: preserved,
      metricType: metricTypeObj ?? kr?.metricType,
      key_type: kr?.key_type ?? metricTypeObj?.name,
      metricTypeName: kr?.metricTypeName ?? metricTypeObj?.name ?? kr?.key_type,
    };
    return {
      ...fallback,
      progress: getKeyResultProgressPercent(fallback),
    };
  }

  const apiMetricType =
    coerceMetricTypeObject(apiKr.metricType, apiKr.key_type) ??
    coerceMetricTypeObject(kr?.metricType, kr?.key_type);

  const merged = withResolvedOkrMilestones(
    {
      ...kr,
      ...apiKr,
      metricType: apiMetricType,
      key_type: apiKr.key_type ?? apiMetricType?.name ?? kr?.key_type,
      metricTypeName:
        apiKr.metricType?.name ??
        apiKr.metricTypeName ??
        apiKr.key_type ??
        apiMetricType?.name ??
        kr?.metricTypeName ??
        kr?.key_type ??
        (typeof kr?.metricType === 'object'
          ? kr?.metricType?.name
          : kr?.metricType),
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

// Compile-time guards — fail `next build` if KR/milestone types drift apart.
type ExpectTrue<T extends true> = T;
type AssertKeyResultExtendsMilestoneFields = ExpectTrue<
  KeyResultLikeInput extends KrMilestoneFields ? true : false
>;
type AssertPanelKrAcceptedByMilestoneResolver = ExpectTrue<
  Parameters<typeof resolveOkrMilestones>[0] extends
    | KeyResultLikeInput
    | null
    | undefined
    ? true
    : false
>;
const okrProgressTypeGuards: [
  AssertKeyResultExtendsMilestoneFields,
  AssertPanelKrAcceptedByMilestoneResolver,
] = [true, true];
void okrProgressTypeGuards;
