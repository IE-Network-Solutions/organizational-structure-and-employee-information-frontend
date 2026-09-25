/** Stable identity for an evaluation-chain step (Self / DirectManager / User:id). */
export function evaluationStepKey(
  step: { kind?: string | null; userId?: string | null } | null | undefined,
): string {
  if (!step?.kind) return '';
  const kind = String(step.kind).toLowerCase().replace(/_/g, '');
  if (kind === 'user') {
    return `user:${step.userId || ''}`;
  }
  if (kind === 'self') return 'self';
  if (kind === 'directmanager') return 'directManager';
  return kind;
}

export function isEvaluationStepAlreadyInFlow(
  flow: Array<{ kind?: string | null; userId?: string | null }> | null | undefined,
  step: { kind?: string | null; userId?: string | null },
): boolean {
  const key = evaluationStepKey(step);
  if (!key || (key === 'user:' && !step.userId)) return false;
  return (flow || []).some((existing) => evaluationStepKey(existing) === key);
}

/** Returns a human label for the first duplicate found, or null. */
export function findDuplicateEvaluationStepLabel(
  flow: Array<{ kind?: string | null; userId?: string | null }> | null | undefined,
): string | null {
  const seen = new Set<string>();
  for (const step of flow || []) {
    const key = evaluationStepKey(step);
    if (!key || key === 'user:') continue;
    if (seen.has(key)) {
      if (key === 'self') return 'Employee (self)';
      if (key === 'directManager') return 'Direct manager';
      return 'the same person';
    }
    seen.add(key);
  }
  return null;
}
