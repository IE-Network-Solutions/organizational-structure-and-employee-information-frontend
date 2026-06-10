'use client';

import React, { useMemo } from 'react';
import { RATING_DESCRIPTION_VALUE } from './questions/ratingFieldUtils';
import StarIcon from '@mui/icons-material/Star';
import StarOutlineOutlinedIcon from '@mui/icons-material/StarOutlineOutlined';

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
  return [String(v)];
}

export type RatingDistributionRow = {
  stars: number;
  count: number;
  pct: number;
};

export function getRatingDistribution(
  question: { field?: any[] },
  entries: any[],
): {
  maxStars: number;
  average: number | null;
  rows: RatingDistributionRow[];
  ratedCount: number;
} {
  const fields: any[] = Array.isArray(question.field) ? question.field : [];
  const starFields = fields.filter(
    (f) => f?.value != null && String(f.value) !== RATING_DESCRIPTION_VALUE,
  );
  const starLevels = starFields
    .map((f) => Number(f.value))
    .filter((n) => Number.isFinite(n) && n >= 1)
    .sort((a, b) => a - b);
  const maxStars = starLevels.length > 0 ? Math.max(...starLevels) : 5;
  const starValueSet = new Set(starFields.map((f) => String(f.value).trim()));

  const counts = new Map<number, number>();
  for (let s = 1; s <= maxStars; s++) counts.set(s, 0);

  let sum = 0;
  let ratedCount = 0;

  for (const entry of entries) {
    const detail = entryResponseDetailArray(entry);
    let star: number | null = null;

    for (const r of detail) {
      for (const raw of normalizeAnswerValues(r)) {
        const token = String(raw).trim();
        if (!starValueSet.has(token)) continue;
        const n = Number(token);
        if (Number.isFinite(n) && n >= 1 && n <= maxStars) {
          star = n;
          break;
        }
      }
      if (star != null) break;
    }

    if (star == null) continue;
    ratedCount += 1;
    sum += star;
    counts.set(star, (counts.get(star) ?? 0) + 1);
  }

  const denom = ratedCount;
  const rows: RatingDistributionRow[] = [];
  for (let s = 1; s <= maxStars; s++) {
    const count = counts.get(s) ?? 0;
    const pct = denom > 0 ? Math.round((count / denom) * 100) : 0;
    rows.push({ stars: s, count, pct });
  }

  const average =
    ratedCount > 0 ? Math.round((sum / ratedCount) * 10) / 10 : null;

  return { maxStars, average, rows, ratedCount };
}

function StarDisplay({
  filledCount,
  total,
  size = 24,
}: {
  filledCount: number;
  total: number;
  size?: number;
}) {
  return (
    <div
      data-cy={`individual-response-rating-stars`}
      className="flex shrink-0 gap-0.5"
      aria-hidden
    >
      {Array.from({ length: total }, (notUsed, i) => {
        const filled = i < filledCount;
        return filled ? (
          <StarIcon
            key={i}
            sx={{ fontSize: size }}
            className="fill-[#FAAD14] text-[#FAAD14]"
          />
        ) : (
          <StarOutlineOutlinedIcon
            key={i}
            sx={{ fontSize: size }}
            className="text-[#ffec3d]"
          />
        );
      })}
    </div>
  );
}

interface RatingResponseSummaryProps {
  questionId: string;
  question: { field?: any[] };
  entries: any[];
}

const RatingResponseSummary: React.FC<RatingResponseSummaryProps> = ({
  questionId,
  question,
  entries,
}) => {
  const { maxStars, average, rows } = useMemo(
    () => getRatingDistribution(question, entries),
    [question, entries],
  );

  const totalCount = entries.length;

  if (totalCount === 0) {
    return (
      <p
        className="pt-3 text-sm text-gray-400"
        data-cy={`individual-response-rating-empty-${questionId}`}
      >
        No responses yet.
      </p>
    );
  }

  return (
    <div
      className="pt-3"
      data-cy={`individual-response-rating-summary-${questionId}`}
    >
      <div
        className="mb-4 flex flex-wrap items-center justify-between gap-3"
        data-cy={`individual-response-rating-average-${questionId}`}
      >
        {average != null ? (
          <>
            <span
              data-cy={`individual-response-rating-average-label-${questionId}`}
              className="text-sm font-normal text-gray-900"
            >
              Ratings
            </span>
            <div
              data-cy={`individual-response-rating-average-stars-${questionId}`}
              className="flex items-center gap-4"
            >
              <StarIcon
                sx={{ fontSize: 24 }}
                className="fill-[#FAAD14] text-[#FAAD14]"
                aria-hidden
              />
              <span
                data-cy={`individual-response-rating-average-value-${questionId}`}
                className="text-[28px] font-semibold leading-none tabular-nums text-gray-900"
              >
                {average.toFixed(1)}
              </span>
            </div>
          </>
        ) : (
          <p
            className="text-sm text-gray-400"
            data-cy={`individual-response-rating-no-ratings-${questionId}`}
          >
            No ratings submitted yet.
          </p>
        )}
      </div>

      <div
        className="space-y-2.5"
        data-cy={`individual-response-rating-distribution-${questionId}`}
      >
        {rows.map((row) => (
          <div
            key={row.stars}
            className="flex min-w-0 items-center gap-2 sm:gap-3"
            data-cy={`individual-response-rating-row-${questionId}-${row.stars}`}
          >
            <StarDisplay filledCount={row.stars} total={maxStars} />
            <div
              data-cy={`individual-response-rating-row-${questionId}-${row.stars}-bar`}
              className="h-2.5 min-w-0 flex-1 overflow-hidden rounded-full bg-gray-100"
            >
              <div
                className="h-full rounded-full bg-[#1E40AF]/85 transition-all"
                style={{ width: `${row.pct}%` }}
                data-cy={`individual-response-rating-row-${questionId}-${row.stars}-bar-fill`}
              />
            </div>
            <span
              data-cy={`individual-response-rating-row-${questionId}-${row.stars}-value`}
              className="w-7 shrink-0 text-right text-xs font-medium tabular-nums text-gray-800 sm:w-8"
            >
              {row.pct}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RatingResponseSummary;
