import dayjs from 'dayjs';

export function normalizeSummaryResultPayload(data: unknown): any[] {
  if (Array.isArray(data)) return data;
  if (
    data &&
    typeof data === 'object' &&
    Array.isArray((data as { items?: unknown }).items)
  ) {
    return (data as { items: any[] }).items;
  }
  if (
    data &&
    typeof data === 'object' &&
    Array.isArray((data as { data?: unknown }).data)
  ) {
    return (data as { data: any[] }).data;
  }
  return [];
}

/** Total submissions: prefer explicit group ids on rows (not per-question row ids); else max answers per question. */
export function inferSubmissionTotalFromResponseRows(rows: any[]): number {
  if (!Array.isArray(rows) || rows.length === 0) return 0;
  const ids = new Set<string>();
  for (const r of rows) {
    const id =
      r?.submissionId ??
      r?.submission_id ??
      r?.formResponseId ??
      r?.form_response_id ??
      r?.responseId ??
      r?.response_id ??
      r?.response?.id ??
      r?.formResponse?.id;
    if (id != null && id !== '') ids.add(String(id));
  }
  if (ids.size > 0) return ids.size;

  const byQ: Record<string, number> = {};
  for (const r of rows) {
    const qid = r?.question?.id;
    if (qid == null) continue;
    const k = String(qid);
    byQ[k] = (byQ[k] ?? 0) + 1;
  }
  const vals = Object.values(byQ);
  return vals.length ? Math.max(...vals) : rows.length;
}

/**
 * When individual rows are empty, derive a respondent count from summary:
 * skip checkbox (sums are not comparable); take max option-total on other types.
 */
export function inferSubmissionTotalFromSummary(summary: any[]): number {
  let best = 0;
  for (const q of summary) {
    const ft = String(q?.fieldType ?? '').toLowerCase();
    if (ft === 'checkbox') continue;
    const opts = Array.isArray(q?.options) ? q.options : [];
    const sum = opts.reduce(
      (t: number, o: any) => t + Number(o?.count ?? 0),
      0,
    );
    if (sum > best) best = sum;
  }
  return best;
}

/** Trend chart buckets by calendar day using when the response row was created (Insights UX). */
function trendRowTimestamp(row: any): number | null {
  const raw =
    row?.createdAt ??
    row?.created_at ??
    row?.submittedAt ??
    row?.submitted_at ??
    row?.updatedAt ??
    row?.updated_at;
  if (raw == null) return null;
  const d = dayjs(raw);
  return d.isValid() ? d.valueOf() : null;
}

/**
 * Explicit submission / form-response id shared by every question row in one submit.
 */
function pickSubmissionGroupKey(row: any): string | null {
  const flat: unknown[] = [
    row?.submissionId,
    row?.submission_id,
    row?.SubmissionId,
    row?.formResponseId,
    row?.form_response_id,
    row?.FormResponseId,
    row?.responseId,
    row?.response_id,
    row?.ResponseId,
    row?.batchId,
    row?.batch_id,
  ];
  for (const v of flat) {
    if (v != null && v !== '') return `g:${String(v)}`;
  }
  const nested =
    row?.response?.id ??
    row?.formResponse?.id ??
    row?.parentResponseId ??
    row?.parent_response_id;
  if (nested != null && nested !== '') return `g:${String(nested)}`;
  return null;
}

/** True if the same `id` appears on rows for different questions (API uses row.id as parent response id). */
function rowPrimaryIdSpansMultipleQuestions(rows: any[]): boolean {
  const byId = new Map<string, Set<string>>();
  for (const r of rows) {
    const id = r?.id;
    const q = r?.question?.id ?? r?.questionId ?? r?.question_id;
    if (id == null || q == null) continue;
    const ik = String(id);
    if (!byId.has(ik)) byId.set(ik, new Set());
    byId.get(ik)!.add(String(q));
  }
  for (const s of byId.values()) {
    if (s.size > 1) return true;
  }
  return false;
}

/**
 * When group ids are missing: same calendar second + user + form separates most submits;
 * repeat submits in the same second stay merged (rare).
 */
function weakTimeUserFormKey(row: any, tsMs: number): string | null {
  const sec = Math.floor(tsMs / 1000);
  const uid =
    row?.respondentId ??
    row?.respondent_id ??
    row?.userId ??
    row?.user_id ??
    row?.createdBy ??
    '';
  const fid = row?.formId ?? row?.form_id ?? '';
  if (uid !== '' || fid !== '') return `w:${sec}:${String(uid)}:${String(fid)}`;
  if (row?.id != null && row?.id !== '')
    return `w:${sec}::${String(fid)}:row:${String(row.id)}`;
  return null;
}

/**
 * Unique submissions per calendar day (oldest day first), last `dayCount` days ending today.
 * 1) Shared submission / formResponse / response ids (all question rows collapse to one).
 * 2) If the API repeats the same row `id` across questions, that id is the submission key.
 * 3) Else second+user+form (or row id for anonymous) approximates one submit when ids are absent.
 * 4) Last resort: row `id` (may count once per question if ids are unique per answer).
 */
export function lastNDaysSubmissionCounts(
  rows: any[],
  dayCount: number,
): number[] {
  const n = Math.max(1, Math.floor(dayCount));
  const sharedRowPk = rowPrimaryIdSpansMultipleQuestions(rows);
  const byDay = new Map<string, Set<string>>();
  for (const r of rows) {
    const ts = trendRowTimestamp(r);
    if (ts == null) continue;
    const dayKey = dayjs(ts).format('YYYY-MM-DD');
    let key = pickSubmissionGroupKey(r);
    if (key == null && sharedRowPk && r?.id != null && r?.id !== '') {
      key = `pk:${String(r.id)}`;
    }
    if (key == null) {
      key = weakTimeUserFormKey(r, ts);
    }
    if (key == null && r?.id != null && r?.id !== '') {
      key = `pk:${String(r.id)}`;
    }
    if (key == null) continue;
    let set = byDay.get(dayKey);
    if (!set) {
      set = new Set();
      byDay.set(dayKey, set);
    }
    set.add(key);
  }
  const counts: number[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = dayjs().subtract(i, 'day').format('YYYY-MM-DD');
    counts.push(byDay.get(d)?.size ?? 0);
  }
  return counts;
}

/** @deprecated Use lastNDaysSubmissionCounts(rows, 7) */
export function lastSevenDaySubmissionCounts(rows: any[]): number[] {
  return lastNDaysSubmissionCounts(rows, 7);
}

export function pickInvitedTotal(formData: any): number | null {
  if (!formData || typeof formData !== 'object') return null;
  const n = Number(
    (formData as any).invitedCount ??
      (formData as any).invited_count ??
      (formData as any).targetCount ??
      (formData as any).target_count,
  );
  if (Number.isFinite(n) && n > 0) return n;
  const perms = (formData as any).formPermissions;
  if (Array.isArray(perms) && perms.length > 0) return perms.length;
  return null;
}
