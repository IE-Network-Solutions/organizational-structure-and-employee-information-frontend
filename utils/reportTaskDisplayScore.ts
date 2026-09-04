/**
 * Score on a report card is the employee's reported result for that plan task.
 * After refresh the API often replaces `actualValue` with a KR leftover
 * (negative remaining) or the KR `currentValue` (e.g. 80). Those are not
 * the number the employee submitted.
 */

function toNumberOrNull(value: unknown): number | null {
  if (value === undefined || value === null || value === '') return null;
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

function normalizeStatus(raw: unknown): string {
  return String(raw ?? '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');
}

function isDoneStatus(raw: string): boolean {
  return (
    raw === 'done' ||
    raw === 'completed' ||
    raw === 'complete' ||
    raw === 'achieved'
  );
}

function isNotStatus(raw: string): boolean {
  return (
    raw === 'not' ||
    raw === 'failed' ||
    raw === 'not_done' ||
    raw === 'unachieved'
  );
}

function isDoneTask(task: any): boolean {
  const status = normalizeStatus(task?.status);
  if (isNotStatus(status)) return false;
  if (isDoneStatus(status)) return true;
  return task?.isAchieved === true;
}

function isNotTask(task: any): boolean {
  const status = normalizeStatus(task?.status);
  if (isNotStatus(status)) return true;
  if (isDoneStatus(status)) return false;
  return task?.isAchieved === false;
}

function plannedTarget(task: any): number | null {
  return toNumberOrNull(
    task?.planTask?.targetValue ?? task?.targetValue ?? task?.target,
  );
}

function krCurrentValue(task: any): number | null {
  return toNumberOrNull(
    task?.planTask?.keyResult?.currentValue ?? task?.keyResult?.currentValue,
  );
}

/**
 * True when `actualValue` is the nested KR currentValue, not the task score.
 * Example: planned 10, KR current 80, API actualValue 80 after refresh.
 */
function actualLooksLikeKeyResultCurrent(
  actual: number,
  planned: number | null,
  krCurrent: number | null,
): boolean {
  if (krCurrent == null || planned == null) return false;
  return actual === krCurrent && actual !== planned;
}

/**
 * Reported score for Plan & Report cards. Never uses KR `achievedValue`.
 * Never shows a negative leftover. For Done, falls back to the planned target.
 */
export function getReportTaskDisplayScore(task: any): number {
  const planned = plannedTarget(task);
  const actual = toNumberOrNull(task?.actualValue);
  const krCurrent = krCurrentValue(task);

  const usableActual =
    actual != null &&
    actual >= 0 &&
    !actualLooksLikeKeyResultCurrent(actual, planned, krCurrent)
      ? actual
      : null;

  if (isDoneTask(task)) {
    if (usableActual != null) {
      // Done always submits actual >= planned target. A smaller API value is leftover.
      if (planned != null && usableActual < planned) return planned;
      return usableActual;
    }
    return planned ?? 0;
  }

  if (isNotTask(task)) {
    return usableActual ?? 0;
  }

  return usableActual ?? 0;
}
