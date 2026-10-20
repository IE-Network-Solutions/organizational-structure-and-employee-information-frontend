/**
 * Maps API-provided variable-pay type labels to their Performance Pay (PP)
 * display label. Stored payroll breakdowns still carry the old codes
 * ('VP', 'VP Monthly', 'VP Quarterly', 'Variable Pay').
 */
export function toPerformancePayLabel(type?: string | null): string {
  if (!type) return 'PP';
  return type
    .replace(/\bVariable Pay\b/gi, 'Performance Pay')
    .replace(/\bVP\b/g, 'PP');
}
