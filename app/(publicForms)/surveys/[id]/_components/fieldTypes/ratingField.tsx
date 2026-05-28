'use client';

import React, { useCallback, useMemo, useRef } from 'react';
import { Form, Input } from 'antd';
import { Star } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export const RATING_DESCRIPTION_VALUE = 'description';

type RatingFieldConfig = Record<string, string> & {
  required?: boolean | string;
  label?: string;
};

function parseRatingFieldConfig(field: RatingFieldConfig[] | undefined) {
  const list = field ?? [];
  const starOptions = list
    .filter((f) => f.value !== RATING_DESCRIPTION_VALUE)
    .sort((a, b) => Number(a.value) - Number(b.value));
  const descConfig = list.find((f) => f.value === RATING_DESCRIPTION_VALUE);
  return { starOptions, descConfig };
}

function isDescriptionRequired(descConfig?: RatingFieldConfig): boolean {
  if (!descConfig) return false;
  const r = descConfig.required;
  return r === true || r === 'true' || r === '1';
}

interface RatingFieldProps {
  questionId: string;
  field: RatingFieldConfig[];
  form: { setFieldsValue: (v: Record<string, unknown>) => void };
  matchingAnswer?: {
    responseDetail: Record<string, string>[];
  };
  onAnswerChange: (detail: Record<string, string>[]) => void;
  disabled?: boolean;
}

const RatingField: React.FC<RatingFieldProps> = ({
  questionId,
  field,
  form,
  matchingAnswer,
  onAnswerChange,
  disabled = false,
}) => {
  const { errors } = Form.Item.useStatus();
  const errorMessages = useMemo(() => {
    const list = (errors ?? []).map((e) => String(e));
    return Array.from(new Set(list));
  }, [errors]);
  const starError =
    errorMessages.find((m) =>
      m.toLowerCase().includes('this field is required'),
    ) ?? null;
  const feedbackError =
    errorMessages.find((m) => m.toLowerCase().includes('feedback')) ?? null;

  const { starOptions, descConfig } = useMemo(
    () => parseRatingFieldConfig(field),
    [field],
  );
  const descFieldId = descConfig?.id ?? null;
  const feedbackPlaceholder = descConfig?.label?.trim() || 'Feedback';

  const stableDescIdRef = useRef<string | null>(null);
  if (stableDescIdRef.current == null) {
    stableDescIdRef.current = uuidv4();
  }

  const selectedStarValue = useMemo(() => {
    const starValues = new Set(starOptions.map((s) => String(s.value)));
    for (const d of matchingAnswer?.responseDetail ?? []) {
      if (starValues.has(String(d.value))) return String(d.value);
    }
    return '';
  }, [matchingAnswer, starOptions]);

  const feedbackValue = useMemo(() => {
    if (!descFieldId) return '';
    const byId = matchingAnswer?.responseDetail?.find(
      (d) => String(d.id) === String(descFieldId),
    );
    if (byId?.value != null && byId.value !== RATING_DESCRIPTION_VALUE) {
      return String(byId.value);
    }
    for (const d of matchingAnswer?.responseDetail ?? []) {
      if (!starOptions.some((s) => String(s.value) === String(d.value))) {
        return String(d.value ?? '');
      }
    }
    return '';
  }, [matchingAnswer, descFieldId, starOptions]);

  const syncAnswer = useCallback(
    (star: string, feedback: string) => {
      const detail: Record<string, string>[] = [];
      if (star) {
        const starField = starOptions.find((s) => String(s.value) === star);
        detail.push({
          id: String(starField?.id ?? uuidv4()),
          value: star,
        });
      }
      if (descFieldId && feedback.trim()) {
        detail.push({
          id: String(descFieldId),
          value: feedback,
        });
      }
      onAnswerChange(detail);
      form.setFieldsValue({
        [`question_${questionId}`]: star || undefined,
      });
    },
    [starOptions, descFieldId, onAnswerChange, form, questionId],
  );

  const handleStarClick = (value: string) => {
    if (disabled) return;
    syncAnswer(value, feedbackValue);
  };

  const handleFeedbackChange = (text: string) => {
    if (disabled) return;
    syncAnswer(selectedStarValue, text);
  };

  const starCount = starOptions.length > 0 ? starOptions.length : 5;
  const stars =
    starOptions.length > 0
      ? starOptions
      : Array.from({ length: starCount }, (notUsed, i) => ({
          id: `fallback-${i + 1}`,
          value: String(i + 1),
        }));

  const selectedNum = selectedStarValue ? Number(selectedStarValue) : 0;

  return (
    <div
      className="flex flex-col gap-4"
      data-cy={`public-survey-rating-${questionId}`}
    >
      <div
        className="flex items-center gap-0.5"
        role="radiogroup"
        aria-label="Star rating"
        data-cy={`public-survey-rating-stars-${questionId}`}
      >
        {stars.map((star, index) => {
          const value = String(star.value);
          const starNum = Number(value);
          const isFilled = selectedNum > 0 && starNum <= selectedNum;
          return (
            <button
              key={`${questionId}-star-${star.id ?? index}`}
              type="button"
              disabled={disabled}
              role="radio"
              aria-checked={selectedStarValue === value}
              aria-label={`${value} star${starNum === 1 ? '' : 's'}`}
              onClick={() => handleStarClick(value)}
              className="rounded p-0.5 transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60"
              data-cy={`public-survey-rating-star-${questionId}-${value}`}
            >
              <Star
                size={28}
                className={
                  isFilled
                    ? 'fill-[#FAAD14] text-[#FAAD14]'
                    : 'fill-none text-[#FAAD14]'
                }
                strokeWidth={1.5}
              />
            </button>
          );
        })}
      </div>
      {starError ? (
        <p
          className="mt-[-8px] text-[13px] text-[#ff4d4f]"
          data-cy={`public-survey-rating-stars-error-${questionId}`}
        >
          {starError}
        </p>
      ) : null}

      <Input.TextArea
        rows={4}
        disabled={disabled}
        placeholder={feedbackPlaceholder}
        value={feedbackValue}
        onChange={(e) => handleFeedbackChange(e.target.value)}
        className="rounded-lg"
        data-cy={`public-survey-rating-feedback-${questionId}`}
      />
      {feedbackError ? (
        <p
          className="mt-[-8px] text-[13px] text-[#ff4d4f]"
          data-cy={`public-survey-rating-feedback-error-${questionId}`}
        >
          {feedbackError}
        </p>
      ) : null}
    </div>
  );
};

export { isDescriptionRequired, parseRatingFieldConfig };
export default RatingField;
