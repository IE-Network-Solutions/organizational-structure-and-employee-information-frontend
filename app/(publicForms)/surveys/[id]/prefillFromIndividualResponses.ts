import { v4 as uuidv4 } from 'uuid';
import { FieldType } from '@/types/enumTypes';

export type StoredAnswerEntry = {
  questionId: string;
  respondentId: string | null;
  responseDetail: Record<string, string>[];
};

export function normalizeIndividualResponsesList(data: unknown): any[] {
  if (data == null) return [];
  if (Array.isArray(data)) return data;
  const o = data as { items?: unknown; data?: unknown };
  if (Array.isArray(o.items)) return o.items as any[];
  if (Array.isArray(o.data)) return o.data as any[];
  return [];
}

function rowQuestionId(row: any): string | null {
  const q = row?.question?.id ?? row?.questionId;
  return q != null ? String(q) : null;
}

function pickLatestRow(rows: any[]): any | null {
  if (!rows.length) return null;
  return [...rows].sort((a, b) => {
    const ta =
      Date.parse(
        a?.updatedAt ?? a?.updated_at ?? a?.createdAt ?? a?.created_at ?? 0,
      ) || 0;
    const tb =
      Date.parse(
        b?.updatedAt ?? b?.updated_at ?? b?.createdAt ?? b?.created_at ?? 0,
      ) || 0;
    return tb - ta;
  })[0];
}

/**
 * Prefer explicit grouping ids from the API. When those are missing (common on
 * `/responses/by-user/...`), fall back to second+user+form so one submit still
 * shares one key and the public "Update response" flow can resolve `selectedTabKey`.
 */
function explicitSubmissionGroupId(row: any): string | null {
  const candidates = [
    row?.submissionId,
    row?.submission_id,
    row?.SubmissionId,
    row?.formResponseId,
    row?.form_response_id,
    row?.FormResponseId,
    row?.batchId,
    row?.batch_id,
    row?.formResponse?.id,
    row?.parentResponseId,
    row?.parent_response_id,
  ];
  for (const v of candidates) {
    if (v != null && v !== '') return String(v);
  }
  return null;
}

function responseRowTimestamp(row: any): number {
  const raw =
    row?.submittedAt ??
    row?.submitted_at ??
    row?.createdAt ??
    row?.created_at ??
    row?.updatedAt ??
    row?.updated_at;
  const d = raw == null ? null : new Date(raw);
  const t = d?.getTime?.();
  return Number.isFinite(t) ? (t as number) : 0;
}

function implicitSubmissionGroupId(row: any): string {
  const ts = responseRowTimestamp(row);
  const sec = Math.floor(ts / 1000);
  const uid =
    row?.respondentId ??
    row?.respondent_id ??
    row?.userId ??
    row?.user_id ??
    row?.createdBy ??
    '';
  const fid = row?.formId ?? row?.form_id ?? '';
  if (uid !== '' || fid !== '')
    return `implicit:${sec}:${String(uid)}:${String(fid)}`;
  return `implicit:${sec}::`;
}

export function getResponseSubmissionIdForRow(row: any): string | null {
  if (row == null) return null;
  return explicitSubmissionGroupId(row) ?? implicitSubmissionGroupId(row);
}

function normalizeDetailItems(detail: unknown): Record<string, string>[] {
  const arr = (() => {
    if (Array.isArray(detail)) return detail;
    if (detail && typeof detail === 'object') {
      const o = detail as {
        items?: unknown;
        data?: unknown;
        responses?: unknown;
      };
      if (Array.isArray(o.items)) return o.items;
      if (Array.isArray(o.data)) return o.data;
      if (Array.isArray(o.responses)) return o.responses;
    }
    return null;
  })();

  if (!arr) return [];

  return (arr as any[]).map((d: any) => ({
    // Backend may return either `value` or `response` depending on create vs update.
    value:
      d?.value != null
        ? String(d.value)
        : d?.response != null
          ? String(d.response)
          : '',
    id: d?.id != null ? String(d.id) : uuidv4(),
  }));
}

/** Map stored values (option id vs label) to the option shape used in the UI store. */
function alignDetailWithQuestionField(
  question: any,
  detail: Record<string, string>[],
): Record<string, string>[] {
  const fields: Record<string, string>[] = Array.isArray(question?.field)
    ? question.field
    : [];
  if (fields.length === 0) return detail;

  return detail.map((d) => {
    const v = d.value;
    const matchValue = fields.find((f) => String(f.value) === String(v));
    if (matchValue) {
      return {
        value: String(matchValue.value),
        id: d.id ?? String(matchValue.id ?? uuidv4()),
      };
    }
    const byId = fields.find((f) => String(f.id) === String(v));
    if (byId) {
      return {
        value: String(byId.value),
        id: String(byId.id ?? d.id ?? uuidv4()),
      };
    }
    return d;
  });
}

/**
 * Builds store entries + Ant Design form field values from the by-user API payload.
 */
export function buildPrefillFromIndividualResponses(
  publicForm: {
    isAnonymous?: boolean;
    questions?: any[];
  },
  rawResponses: unknown,
  userId: string | null,
  selectedSubmissionId?: string | null,
): {
  answers: StoredAnswerEntry[];
  formValues: Record<string, unknown>;
} {
  const rows = normalizeIndividualResponsesList(rawResponses);
  const byQ = new Map<string, any[]>();
  for (const row of rows) {
    const qid = rowQuestionId(row);
    if (!qid) continue;
    if (!byQ.has(qid)) byQ.set(qid, []);
    byQ.get(qid)!.push(row);
  }

  const respondentId = publicForm.isAnonymous ? null : userId;
  const answers: StoredAnswerEntry[] = [];
  const formValues: Record<string, unknown> = {};

  for (const q of publicForm.questions ?? []) {
    const qid = String(q.id);
    const group = byQ.get(qid);
    if (!group?.length) continue;

    const groupForSubmission =
      selectedSubmissionId == null
        ? group
        : group.filter(
            (r) => getResponseSubmissionIdForRow(r) === selectedSubmissionId,
          );

    const latest =
      groupForSubmission.length > 0 ? pickLatestRow(groupForSubmission) : null;
    const rawDetail =
      latest?.responseDetail ??
      latest?.response_detail ??
      latest?.responseDetails ??
      latest?.response_details ??
      latest?.responses ??
      latest?.response ??
      [];
    let detail = normalizeDetailItems(rawDetail);
    detail = alignDetailWithQuestionField(q, detail);
    if (detail.length === 0) continue;

    answers.push({
      questionId: qid,
      respondentId,
      responseDetail: detail,
    });

    const fieldKey = `question_${q.id}`;
    const ft = q.fieldType as string;

    if (
      ft === FieldType.MULTIPLE_CHOICE ||
      ft === FieldType.RADIO ||
      ft === 'multiple_choice'
    ) {
      formValues[fieldKey] = detail[0]?.value;
    } else if (ft === FieldType.CHECKBOX) {
      formValues[fieldKey] = detail.map((d) => d.value);
    } else if (ft === FieldType.SHORT_TEXT || ft === FieldType.PARAGRAPH) {
      formValues[fieldKey] = detail.map((d) => d.value).join('\n');
    }
  }

  return { answers, formValues };
}

export function inferSubmissionHistoryFromResponseRows(rows: any[]): {
  submissionId: string;
  submittedAt: number;
  responseRowId: string;
}[] {
  if (!Array.isArray(rows) || rows.length === 0) return [];

  const byId = new Map<
    string,
    { submittedAt: number; responseRowId: string }
  >();
  for (const r of rows) {
    const sid = getResponseSubmissionIdForRow(r);
    if (!sid) continue;
    const ts = responseRowTimestamp(r);
    const rid = r?.id ?? r?.responseId ?? r?.submissionId ?? r?.formResponseId;
    const responseRowId = rid != null && String(rid) !== '' ? String(rid) : '';

    // Keep the newest timestamp we see for that submission id.
    const prev = byId.get(sid);
    if (!prev || ts > prev.submittedAt) {
      byId.set(sid, { submittedAt: ts, responseRowId });
    }
  }

  return [...byId.entries()]
    .map(([submissionId, { submittedAt, responseRowId }]) => ({
      submissionId,
      submittedAt,
      responseRowId,
    }))
    .sort((a, b) => b.submittedAt - a.submittedAt);
}
