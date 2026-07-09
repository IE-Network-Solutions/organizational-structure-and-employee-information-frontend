'use client';
/* eslint-disable local-rules/data-cy-required, @typescript-eslint/naming-convention, @typescript-eslint/no-unused-vars */

import React, { useMemo, useState } from 'react';
import { Pagination, Skeleton } from 'antd';
import { useOrganizationalDevelopment } from '@/store/uistate/features/organizationalDevelopment';
import { useFetchedAllIndividualResponsesByFormId } from '@/store/server/features/organization-development/categories/queries';
import { useGetFormsByID } from '@/store/server/features/feedback/form/queries';
import { EmptyImage } from '@/components/emptyIndicator';
import {
  isSurveyBarSummaryChoiceType,
  isSurveyChoiceFieldType,
  surveyFieldTypeLabel,
  surveyResponseCountBadgeClassName,
  surveyTypePillClassName,
} from '../surveyFieldUi';
import { SurveyChoiceBarRow } from '../surveyChoiceBarRow';
import RatingResponseSummary from '../ratingResponseSummary';
import { FieldType } from '@/types/enumTypes';
import EmptyState from '@/components/empty';

interface Params {
  id: string;
}

function normalizeIndividualResponsesPayload(data: unknown): {
  rows: any[];
  meta?: { totalItems?: number };
} {
  if (!data) return { rows: [] };
  if (Array.isArray(data)) return { rows: data };
  const obj = data as {
    items?: any[];
    data?: any[];
    meta?: { totalItems?: number };
  };
  const rows = Array.isArray(obj.items)
    ? obj.items
    : Array.isArray(obj.data)
      ? obj.data
      : [];
  return { rows, meta: obj.meta };
}

/** Same shape handling as public survey prefill — detail is often an object with `items`. */
function entryResponseDetailArray(entry: any): any[] {
  const d =
    entry?.responseDetail ??
    entry?.response_detail ??
    entry?.responses ??
    entry?.response;
  if (Array.isArray(d)) return d;
  if (d && typeof d === 'object') {
    const o = d as { items?: unknown; data?: unknown };
    if (Array.isArray(o.items)) return o.items as any[];
    if (Array.isArray(o.data)) return o.data as any[];
  }
  return [];
}

function normalizeAnswerValues(entry: any): string[] {
  const v = entry?.value ?? entry?.response;
  if (v == null || v === '') return [];
  if (Array.isArray(v)) return v.map((x) => String(x));
  if (typeof v === 'string' && v.trim().startsWith('[')) {
    try {
      const parsed = JSON.parse(v);
      return Array.isArray(parsed)
        ? parsed.map((x) => String(x))
        : [String(parsed)];
    } catch {
      return [v];
    }
  }
  return [String(v)];
}

/** Prefer profile name; fall back to respondent / user id when the API omits user info. */
function extractRespondentDisplayName(entry: any): string | null {
  if (!entry) return null;
  const u =
    entry.user ??
    entry.respondent?.user ??
    entry.respondent ??
    entry.respondedBy ??
    entry.employee;
  if (u && typeof u === 'object') {
    const parts = [u.firstName, u.middleName, u.lastName].filter(
      (p) => p && String(p).trim(),
    );
    const full = parts.join(' ').trim();
    if (full) return full;
    if (u.name && String(u.name).trim()) return String(u.name).trim();
    if (u.fullName && String(u.fullName).trim())
      return String(u.fullName).trim();
  }
  if (typeof u === 'string' && u.trim()) return u.trim();
  const id = entry.respondentId ?? entry.userId ?? entry.createdBy;
  if (id != null && String(id).trim()) return String(id).trim();
  return null;
}

function textFromResponseDetail(detail: any[]): string {
  return (detail ?? [])
    .flatMap((r) => normalizeAnswerValues(r))
    .filter((s) => s.length > 0)
    .join(', ');
}

/** Stable key for a question option row (id preferred; else label). */
function fieldCanonicalKey(f: any): string | null {
  if (f?.id != null && String(f.id) !== '') return String(f.id);
  if (f?.value != null && String(f.value).trim() !== '')
    return `val:${String(f.value).trim()}`;
  return null;
}

/**
 * Map stored answer tokens (option id or option label text from API) to our canonical field key.
 */
function resolveAnswerToFieldKey(fields: any[], raw: string): string | null {
  const token = String(raw).trim();
  if (!token) return null;
  for (const f of fields) {
    const k = fieldCanonicalKey(f);
    if (!k) continue;
    if (f?.id != null && token === String(f.id)) return k;
  }
  for (const f of fields) {
    const k = fieldCanonicalKey(f);
    if (!k) continue;
    const fv = f?.value != null ? String(f.value).trim() : '';
    if (fv !== '' && token === fv) return k;
  }
  const tl = token.toLowerCase();
  for (const f of fields) {
    const k = fieldCanonicalKey(f);
    if (!k) continue;
    const fv = f?.value != null ? String(f.value).trim().toLowerCase() : '';
    if (fv !== '' && tl === fv) return k;
  }
  return null;
}

function getChoiceRows(
  question: any,
  entries: any[],
  attachRespondents: boolean,
) {
  const fields: any[] = Array.isArray(question.field) ? question.field : [];
  const counts = new Map<string, number>();
  const respondentsByOption = new Map<string, Set<string>>();
  for (const f of fields) {
    const k = fieldCanonicalKey(f);
    if (k) {
      counts.set(k, 0);
      respondentsByOption.set(k, new Set());
    }
  }
  for (const entry of entries) {
    const detail = entryResponseDetailArray(entry);
    const name = attachRespondents ? extractRespondentDisplayName(entry) : null;
    for (const r of detail) {
      for (const rawToken of normalizeAnswerValues(r)) {
        const key = resolveAnswerToFieldKey(fields, rawToken);
        if (key == null) continue;
        counts.set(key, (counts.get(key) ?? 0) + 1);
        if (name) {
          let set = respondentsByOption.get(key);
          if (!set) {
            set = new Set();
            respondentsByOption.set(key, set);
          }
          set.add(name);
        }
      }
    }
  }
  return fields
    .map((f) => {
      const k = fieldCanonicalKey(f);
      if (!k) return null;
      return {
        id: k,
        label: f?.value != null ? String(f.value) : k,
        count: counts.get(k) ?? 0,
        respondents: attachRespondents
          ? Array.from(respondentsByOption.get(k) ?? []).sort()
          : [],
      };
    })
    .filter((row): row is NonNullable<typeof row> => row != null);
}

function getFreeTextLines(
  entries: any[],
  attachRespondents: boolean,
): { text: string; respondent: string | null; key: string }[] {
  const lines: { text: string; respondent: string | null; key: string }[] = [];
  for (let ei = 0; ei < entries.length; ei++) {
    const entry = entries[ei];
    const detail = entryResponseDetailArray(entry);
    const name = attachRespondents ? extractRespondentDisplayName(entry) : null;
    const entryKey =
      entry?.id != null && String(entry.id) !== ''
        ? String(entry.id)
        : `entry-${ei}`;
    if (detail.length === 0) {
      const t =
        normalizeAnswerValues(entry).join(', ').trim() ||
        (entry?.value != null ? String(entry.value).trim() : '') ||
        (entry?.response != null ? String(entry.response).trim() : '');
      if (t.length > 0) {
        lines.push({ text: t, respondent: name, key: `${entryKey}-0` });
      }
      continue;
    }
    detail.forEach((item, di) => {
      const parts = normalizeAnswerValues(item);
      const text = parts.filter((s) => s.length > 0).join(', ');
      if (text.length > 0) {
        lines.push({
          text,
          respondent: name,
          key: `${entryKey}-d${di}`,
        });
      }
    });
  }
  return lines;
}

const IndividualResponses = ({ id }: Params) => {
  const { setCurrent, current, pageSize, setPageSize } =
    useOrganizationalDevelopment();
  const { data: rawResponses, isLoading } =
    useFetchedAllIndividualResponsesByFormId(id);
  const { data: formData } = useGetFormsByID(id);
  const isSurveyAnonymous = formData?.isAnonymous === true;
  const showRespondents = !isSurveyAnonymous;
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());

  const { rows, meta } = useMemo(
    () => normalizeIndividualResponsesPayload(rawResponses),
    [rawResponses],
  );

  const onPageChange = (page: number, nextPageSize?: number) => {
    setCurrent(page);
    if (nextPageSize) {
      setPageSize(nextPageSize);
    }
  };

  const grouped = useMemo(() => {
    const map: Record<string, { question: any; entries: any[] }> = {};
    for (const resp of rows) {
      const qid = resp?.question?.id;
      if (!qid) continue;
      if (!map[qid]) {
        map[qid] = { question: resp.question, entries: [] };
      }
      map[qid].entries.push(resp);
    }
    return map;
  }, [rows]);

  const sortedQuestions = useMemo(
    () =>
      Object.values(grouped).sort(
        (a, b) => (a.question.order ?? 0) - (b.question.order ?? 0),
      ),
    [grouped],
  );

  const isServerPaged = meta?.totalItems != null;
  const displayQuestions = useMemo(() => {
    if (isServerPaged) return sortedQuestions;
    const start = (current - 1) * pageSize;
    return sortedQuestions.slice(start, start + pageSize);
  }, [isServerPaged, sortedQuestions, current, pageSize]);

  const paginationTotal = isServerPaged
    ? (meta?.totalItems ?? 0)
    : sortedQuestions.length;

  const toggleExpanded = (qid: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(qid)) next.delete(qid);
      else next.add(qid);
      return next;
    });
  };

  const listPanelClass =
    'rounded-lg border border-[#d9d9d9] bg-white p-4 sm:p-5';

  return (
    <div
      id="individual-responses-container"
      data-cy="individual-responses-container"
      className="w-full"
    >
      {isLoading ? (
        <div
          id="individual-responses-loading"
          data-cy="individual-responses-loading"
          className={listPanelClass}
        >
          <div className="mb-4 text-[16px] font-semibold text-gray-900">
            Question List
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                id={`individual-responses-skeleton-${i}`}
                data-cy={`individual-responses-skeleton-${i}`}
                className="rounded-md border border-gray-200 bg-white px-3 py-2.5"
              >
                <Skeleton
                  active
                  title={false}
                  paragraph={{ rows: 1 }}
                  data-cy={`individual-responses-skeleton-${i}-skeleton`}
                />
              </div>
            ))}
          </div>
        </div>
      ) : rows.length !== 0 ? (
        <div className={listPanelClass}>
          <div
            id="individual-responses-question-list-title"
            data-cy="individual-responses-question-list-title"
            className="mb-4 text-[16px] font-semibold text-gray-900"
          >
            Question List
          </div>
          <div className="space-y-3">
            {displayQuestions.map(({ question, entries }) => {
              const qid = question.id;
              const isOpen = expanded.has(qid);
              const typeLabel = surveyFieldTypeLabel(question.fieldType);
              const titleText =
                typeof question.question === 'string' &&
                question.question.trim()
                  ? question.question
                  : 'Question Name';
              const totalCount = entries.length;
              const isRating = question.fieldType === FieldType.RATING;
              const choiceBased =
                isSurveyChoiceFieldType(question.fieldType) && !isRating;
              const barSummaryChoice =
                choiceBased && isSurveyBarSummaryChoiceType(question.fieldType);
              const choiceRows = choiceBased
                ? getChoiceRows(question, entries, showRespondents)
                : [];
              const textLines =
                !choiceBased && !isRating
                  ? getFreeTextLines(entries, showRespondents)
                  : [];

              return (
                <div
                  key={qid}
                  id={`individual-response-question-${qid}`}
                  data-cy={`individual-response-question-${qid}`}
                  className="overflow-hidden rounded-md border border-[#d9d9d9] bg-white"
                >
                  <button
                    type="button"
                    id={`individual-response-question-${qid}-header`}
                    data-cy={`individual-response-question-${qid}-header`}
                    aria-expanded={isOpen}
                    className="flex w-full cursor-pointer items-center justify-between gap-3 px-[13px] py-[15px] text-left"
                    onClick={() => toggleExpanded(qid)}
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      <span
                        id={`individual-response-question-${qid}-text`}
                        data-cy={`individual-response-question-${qid}-text`}
                        className="min-w-0 shrink truncate text-sm font-normal text-gray-900"
                      >
                        {titleText}
                      </span>
                      <span
                        id={`individual-response-question-${qid}-type-pill`}
                        data-cy={`individual-response-question-${qid}-type-pill`}
                        className={surveyTypePillClassName}
                      >
                        {typeLabel}
                      </span>
                    </div>
                    <span
                      id={`individual-response-question-${qid}-response-count`}
                      data-cy={`individual-response-question-${qid}-response-count`}
                      className={surveyResponseCountBadgeClassName}
                    >
                      Response: {totalCount}
                    </span>
                  </button>
                  <div
                    className={`grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${
                      isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                    }`}
                  >
                    <div className="min-h-0 overflow-hidden">
                      <div
                        id={`individual-response-question-${qid}-body`}
                        data-cy={`individual-response-question-${qid}-body`}
                        className="border-t border-gray-100 px-3 pb-3 pt-0"
                      >
                        {isRating ? (
                          <RatingResponseSummary
                            questionId={qid}
                            question={question}
                            entries={entries}
                          />
                        ) : choiceBased ? (
                          <div className="pt-3">
                            {barSummaryChoice ? (
                              totalCount === 0 ? (
                                <p className="text-sm text-gray-400">
                                  No responses yet.
                                </p>
                              ) : (
                                <div
                                  id={`individual-response-question-${qid}-bar-summary`}
                                  data-cy={`individual-response-question-${qid}-bar-summary`}
                                >
                                  {choiceRows.map((row) => {
                                    const pct = Math.round(
                                      (row.count / totalCount) * 100,
                                    );
                                    return (
                                      <SurveyChoiceBarRow
                                        key={row.id}
                                        label={row.label}
                                        pct={pct}
                                      />
                                    );
                                  })}
                                </div>
                              )
                            ) : (
                              <div className="space-y-2">
                                {choiceRows.map((row) => (
                                  <div
                                    key={row.id}
                                    id={`individual-response-question-${qid}-choice-${row.id}`}
                                    data-cy={`individual-response-question-${qid}-choice-${row.id}`}
                                    className="rounded border border-gray-200 bg-white px-2.5 py-1.5"
                                  >
                                    <div className="flex items-center justify-between gap-3">
                                      <span className="min-w-0 flex-1 text-sm text-gray-800">
                                        {row.label}
                                      </span>
                                      <span
                                        className={
                                          surveyResponseCountBadgeClassName
                                        }
                                      >
                                        Response: {row.count}
                                      </span>
                                    </div>
                                    {showRespondents &&
                                      row.respondents.length > 0 && (
                                        <p
                                          className="mt-1 line-clamp-3 text-xs text-gray-500"
                                          title={row.respondents.join(', ')}
                                        >
                                          {row.respondents.join(', ')}
                                        </p>
                                      )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="pt-3">
                            {textLines.length === 0 ? (
                              <p className="text-sm text-gray-400">
                                No responses yet.
                              </p>
                            ) : (
                              <div className="max-h-96 space-y-2 overflow-y-auto scrollbar-hide">
                                {textLines.map((line) => (
                                  <div
                                    key={line.key}
                                    id={`individual-response-question-${qid}-text-line-${line.key}`}
                                    data-cy={`individual-response-question-${qid}-text-line-${line.key}`}
                                    className="rounded border border-gray-200 bg-white px-2.5 py-1.5"
                                  >
                                    {line.respondent && (
                                      <div className="mb-1 text-xs font-semibold text-gray-600">
                                        {line.respondent}
                                      </div>
                                    )}
                                    <div className="text-sm text-gray-800">
                                      {line.text}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {paginationTotal > 0 && (
            <Pagination
              data-cy="individual-responses-pagination"
              className="mt-6 flex justify-end"
              total={paginationTotal}
              current={current}
              pageSize={pageSize}
              showSizeChanger={true}
              onChange={onPageChange}
              onShowSizeChange={onPageChange}
            />
          )}
        </div>
      ) : (
        <div
          id="individual-responses-empty"
          data-cy="individual-responses-empty"
          className={`${listPanelClass} flex justify-center items-center`}
        >
          <EmptyState />
        </div>
      )}
    </div>
  );
};

export default IndividualResponses;
