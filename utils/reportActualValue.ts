/**
 * Achieved value to show when a task is marked Done.
 * Done needs at least the target, so an empty / lower value becomes the target
 * — but a value the user (or a saved report) already holds at or above the
 * target (e.g. stretch 110 on target 100) must be kept, never reset to target.
 */
export function resolveDoneActualValue(
  currentValue: unknown,
  targetValue: unknown,
): number {
  const target = Number(targetValue ?? 0);
  const safeTarget = Number.isFinite(target) ? target : 0;
  if (
    currentValue === null ||
    currentValue === undefined ||
    currentValue === ''
  ) {
    return safeTarget;
  }
  const current = Number(currentValue);
  return Number.isFinite(current) && current >= safeTarget
    ? current
    : safeTarget;
}
