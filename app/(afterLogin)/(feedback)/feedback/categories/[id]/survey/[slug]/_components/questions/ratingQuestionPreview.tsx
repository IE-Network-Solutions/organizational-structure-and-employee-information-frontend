'use client';

import React from 'react';
import { Input } from 'antd';
import { Pencil } from 'lucide-react';
import { coerceSurveyRequired } from '../surveyFieldUi';
import { parseRatingFields, RatingFieldItem } from './ratingFieldUtils';
import StarOutlineOutlinedIcon from '@mui/icons-material/StarOutlineOutlined';

const RATING_DESCRIPTION_PLACEHOLDER = 'Description for rating';

interface RatingQuestionPreviewProps {
  questionId: string;
  questionText: string;
  required: unknown;
  field: RatingFieldItem[] | undefined;
  onEditRating?: () => void;
}

const RatingQuestionPreview: React.FC<RatingQuestionPreviewProps> = ({
  questionId,
  questionText,
  required,
  field,
  onEditRating,
}) => {
  const { starCount, descriptionLabel } = parseRatingFields(field);
  const stars = starCount && starCount > 0 ? starCount : 5;
  const showRequired = coerceSurveyRequired(required);

  return (
    <div
      className="flex flex-col gap-4 px-2 pb-3 pt-2"
      data-cy={`survey-rating-preview-${questionId}`}
    >
      <div data-cy={`survey-rating-preview-question-block-${questionId}`}>
        <label
          className="mb-1.5 inline-flex items-center gap-1 text-sm font-normal text-gray-900"
          data-cy={`survey-rating-preview-question-label-${questionId}`}
        >
          <span data-cy={`survey-rating-preview-question-text-${questionId}`}>
            Question Name
          </span>
          {showRequired ? (
            <span
              data-cy={`survey-rating-preview-question-required-star-${questionId}`}
              className="text-red-500"
              aria-hidden
            >
              *
            </span>
          ) : null}
        </label>
        <Input
          readOnly
          value={questionText?.trim() || ''}
          className="rounded-md font-normal text-gray-900"
          data-cy={`survey-rating-preview-question-input-${questionId}`}
        />
      </div>

      <div data-cy={`survey-rating-preview-stars-block-${questionId}`}>
        <div
          data-cy={`survey-rating-preview-stars-block-${questionId}`}
          className="mb-1.5 flex items-center justify-between gap-2"
        >
          <span
            className="text-sm font-normal text-gray-900"
            data-cy={`survey-rating-preview-stars-label-${questionId}`}
          >
            Rating
          </span>
          <button
            type="button"
            className="shrink-0 rounded border border-gray-200 p-1.5 text-gray-500 transition-colors hover:border-gray-300 hover:bg-gray-50 hover:text-[#2D5BFF]"
            aria-label="Edit rating"
            onClick={(e) => {
              e.stopPropagation();
              onEditRating?.();
            }}
            data-cy={`survey-rating-preview-edit-${questionId}`}
          >
            <Pencil size={16} />
          </button>
        </div>
        <div
          className="flex items-center gap-4"
          role="img"
          aria-label={`${stars} star rating`}
          data-cy={`survey-rating-preview-stars-${questionId}`}
        >
          {Array.from({ length: stars }, (notUsed, i) => (
            <StarOutlineOutlinedIcon
              key={i}
              sx={{ fontSize: 22 }}
              className="text-[#ffec3d]"
            />
          ))}
        </div>
      </div>

      <div data-cy={`survey-rating-preview-description-block-${questionId}`}>
        <label
          className="mb-1.5 block text-sm font-normal text-gray-900"
          data-cy={`survey-rating-preview-description-label-${questionId}`}
        >
          Description
        </label>
        <Input.TextArea
          readOnly
          rows={3}
          value={descriptionLabel?.trim() || ''}
          placeholder={RATING_DESCRIPTION_PLACEHOLDER}
          className="rounded-md font-normal text-gray-900"
          data-cy={`survey-rating-preview-description-input-${questionId}`}
        />
      </div>
    </div>
  );
};

export default RatingQuestionPreview;
