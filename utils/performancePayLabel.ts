/** Maps API variable-pay type codes to the Performance Pay (PP) display label. */
export function toPerformancePayLabel(type?: string | null): string {
  if (!type) return 'PP';
  const normalized = type.trim().toLowerCase();
  if (
    normalized === 'vp' ||
    normalized === 'variable pay' ||
    normalized === 'variable_pay'
  ) {
    return 'PP';
  }
  return type;
}
