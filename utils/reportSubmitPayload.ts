/**
 * Report submit values must be real numbers. Locale strings ("1,000") and
 * leftover concatenations ("0.000-30") make Postgres reject numeric columns.
 */

function coerceNonNegativeNumber(value: unknown): number {
  if (value === undefined || value === null || value === '') return 0;

  if (typeof value === 'number') {
    return Number.isFinite(value) && value >= 0 ? value : 0;
  }

  const raw = String(value).trim().replace(/,/g, '');
  if (!/^-?\d+(\.\d+)?$/.test(raw)) return 0;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

/**
 * Keep only report-task fields the API expects, with a finite actualValue.
 */
export function sanitizeReportSubmitValues(
  values: Record<string, any> | null | undefined,
): Record<string, any> {
  const out: Record<string, any> = {};
  if (!values || typeof values !== 'object') return out;

  for (const [taskId, raw] of Object.entries(values)) {
    if (!taskId || raw == null || typeof raw !== 'object' || Array.isArray(raw)) {
      continue;
    }
    const status =
      raw.status != null && String(raw.status).trim() !== ''
        ? String(raw.status)
        : undefined;
    if (!status) continue;
    const next: Record<string, unknown> = {
      status,
      actualValue: coerceNonNegativeNumber(raw.actualValue),
    };
    if (raw.customReason != null && String(raw.customReason).trim() !== '') {
      next.customReason = String(raw.customReason);
    }
    out[taskId] = next;
  }
  return out;
}

/** Merge Done/Not from the status store, then sanitize numbers. */
export function buildSanitizedReportPayload(
  values: Record<string, any> | null | undefined,
  selectedStatuses?: Record<string, string | undefined> | null,
): Record<string, any> {
  const merged: Record<string, any> = { ...(values || {}) };
  if (selectedStatuses) {
    for (const [id, status] of Object.entries(selectedStatuses)) {
      if (!id || status == null || String(status).trim() === '') continue;
      merged[id] = { ...(merged[id] || {}), status: String(status) };
    }
  }
  return sanitizeReportSubmitValues(merged);
}

export { coerceNonNegativeNumber as parseReportActualValue };

/** Strip thousand separators so Ant Design InputNumber keeps a real number. */
export function parseReportActualValueInput(
  value: string | number | undefined,
): string {
  return String(value ?? '').replace(/,/g, '');
}
