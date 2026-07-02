'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { Form } from 'antd';
import { FieldType } from '@/types/enumTypes';
import { QuestionsType } from '@/store/server/features/organization-development/categories/interface';
import { useUpdateQuestions } from '@/store/server/features/feedback/question/mutation';
import { v4 as uuidv4 } from 'uuid';
import SurveyQuestionEditorForm from './surveyQuestionEditorForm';
import RatingQuestionPreview from './ratingQuestionPreview';
import {
  buildRatingFields,
  parseRatingFields,
  RatingFieldItem,
} from './ratingFieldUtils';
import {
  SURVEY_FIELD_TYPE_LABELS,
  coerceSurveyRequired,
} from '../surveyFieldUi';

interface SortableSurveyQuestionCardProps {
  question: QuestionsType;
  formId: string;
  isExpanded: boolean;
  isDraft?: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onUpdated: () => void;
  onDraftCreate?: (values: Record<string, unknown>) => void | Promise<void>;
  onDraftCancel?: () => void;
  createLoading?: boolean;
  /** 1-based position in the list (Questions tab), matches public survey order. */
  displayNumber: number;
  /** When set (e.g. draft row), merged with sortable node ref for scroll-into-view */
  scrollAnchorRef?: React.RefObject<HTMLDivElement | null> | null;
}

const SortableSurveyQuestionCard: React.FC<SortableSurveyQuestionCardProps> = ({
  question,
  formId,
  isExpanded,
  isDraft = false,
  onToggle,
  onDelete,
  onUpdated,
  onDraftCreate,
  onDraftCancel,
  createLoading,
  displayNumber,
  scrollAnchorRef,
}) => {
  const [form] = Form.useForm();
  const { mutate: updateQuestion, isLoading } = useUpdateQuestions();

  const showEditor = isDraft || isExpanded;
  /** Required is React state (not Form) so Create/Save always sends the real checkbox value. */
  const [surveyQuestionRequired, setSurveyQuestionRequired] = useState(false);
  const [ratingEditing, setRatingEditing] = useState(false);
  /** Only sync from server when opening the editor — not on every `question` ref (refetch would wipe Required). */
  const wasEditorOpenRef = useRef(false);

  useEffect(() => {
    if (!showEditor) {
      wasEditorOpenRef.current = false;
      setRatingEditing(false);
      return;
    }
    const justOpened = !wasEditorOpenRef.current;
    wasEditorOpenRef.current = true;
    if (!justOpened) return;

    let fieldValues =
      question.field?.map((e: { value: string }) => e.value) ?? [];
    if (
      (question.fieldType === FieldType.MULTIPLE_CHOICE ||
        question.fieldType === FieldType.CHECKBOX) &&
      fieldValues.length < 2
    ) {
      fieldValues = ['', ''];
    }
    const isRating = question.fieldType === FieldType.RATING;
    const ratingParsed = isRating
      ? parseRatingFields(question.field as RatingFieldItem[])
      : null;
    setSurveyQuestionRequired(
      isRating && isDraft ? true : coerceSurveyRequired(question.required),
    );
    form.setFieldsValue({
      question: question.question,
      fieldType: question.fieldType,
      field: fieldValues,
      ...(ratingParsed
        ? {
            ratingStarCount: ratingParsed.starCount,
            ratingDescription: ratingParsed.descriptionLabel,
            ratingDescriptionRequired: ratingParsed.descriptionRequired,
          }
        : {}),
    });
  }, [showEditor, question, form, isDraft]);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const setRootRef = useCallback(
    (node: HTMLDivElement | null) => {
      setNodeRef(node);
      if (scrollAnchorRef) {
        (
          scrollAnchorRef as React.MutableRefObject<HTMLDivElement | null>
        ).current = node;
      }
    },
    [setNodeRef, scrollAnchorRef],
  );

  const baseTransform = CSS.Transform.toString(transform);
  const style = {
    transform:
      isDragging && baseTransform
        ? `${baseTransform} scale(1.02)`
        : baseTransform || undefined,
    transition,
    zIndex: isDragging ? 50 : 0,
    position: 'relative' as const,
    boxShadow: isDragging
      ? '0 16px 40px rgba(0,0,0,0.14), 0 4px 12px rgba(0,0,0,0.08)'
      : undefined,
  };

  const typeLabel =
    SURVEY_FIELD_TYPE_LABELS[question.fieldType] || question.fieldType;

  const showChoiceEditor =
    question.fieldType === FieldType.MULTIPLE_CHOICE ||
    question.fieldType === FieldType.CHECKBOX;

  const showRatingEditor = question.fieldType === FieldType.RATING;
  /** Rich rating layout when expanded (saved questions); collapse stays one-line like other types. */
  const showRatingPreview =
    showRatingEditor && showEditor && !isDraft && !ratingEditing;
  const showRatingForm =
    showEditor && (isDraft || !showRatingEditor || ratingEditing);

  const handleSave = async (values: Record<string, unknown>) => {
    const fieldType = String(values.fieldType);
    const isChoiceType =
      fieldType === FieldType.MULTIPLE_CHOICE ||
      fieldType === FieldType.CHECKBOX;
    const isRatingType = fieldType === FieldType.RATING;
    const updatedData = {
      ...question,
      formId,
      question: values.question as string,
      fieldType,
      required: surveyQuestionRequired,
      field: isChoiceType
        ? ((values.field as string[]) || []).map(
            (value: string, idx: number) => ({
              value,
              id: question.field?.[idx]?.id ?? uuidv4(),
            }),
          )
        : isRatingType
          ? buildRatingFields(Number(values.ratingStarCount), {
              descriptionLabel: values.ratingDescription as string,
              descriptionRequired: Boolean(values.ratingDescriptionRequired),
              existingFields: question.field as RatingFieldItem[],
            })
          : [],
    };
    updateQuestion(
      { data: updatedData, id: question.id },
      {
        onSuccess: () => {
          setRatingEditing(false);
          onUpdated();
        },
      },
    );
  };

  const handleFormFinish = async (values: Record<string, unknown>) => {
    if (isDraft && onDraftCreate) {
      await onDraftCreate(values);
      return;
    }
    await handleSave(values);
  };

  const handleCancel = () => {
    if (isDraft && onDraftCancel) {
      onDraftCancel();
      return;
    }
    if (showRatingEditor && ratingEditing) {
      setRatingEditing(false);
      return;
    }
    onToggle();
  };

  return (
    <div
      ref={setRootRef}
      style={style}
      className={`box-border overflow-hidden rounded-xl border transition-all duration-200 ${
        isDragging
          ? 'border-[#4096ff]/60 bg-white'
          : showEditor
            ? 'border-[#4096ff] bg-white shadow-[0_0_0_3px_rgba(64,150,255,0.08)]'
            : 'border-gray-200 bg-[#F8F9FA] shadow-sm hover:border-[#4096ff]/40 hover:shadow-md'
      }`}
      data-cy={`survey-sortable-question-${question.id}`}
    >
      <div
        className="flex min-h-[52px] items-center gap-2 px-3 py-2"
        onClick={(e) => {
          if (isDraft) return;
          const t = e.target as HTMLElement;
          if (t.closest('[data-drag-handle]')) return;
          if (t.closest('[data-delete]')) return;
          if (t.closest('input,textarea,button,.ant-checkbox')) return;
          onToggle();
        }}
        data-cy={`survey-question-header-${question.id}`}
      >
        <button
          type="button"
          data-drag-handle
          data-cy={`survey-question-drag-${question.id}`}
          className="shrink-0 cursor-grab rounded p-1 text-gray-400 touch-none active:cursor-grabbing hover:text-gray-600"
          aria-label="Drag to reorder"
          {...attributes}
          {...listeners}
        >
          <GripVertical size={18} />
        </button>
        <span
          className="shrink-0 tabular-nums text-[14px] font-normal text-gray-900"
          data-cy={`survey-question-number-${question.id}`}
          aria-hidden
        >
          {displayNumber}.
        </span>
        {!showEditor && (
          <>
            <span
              className="flex-1 truncate text-[14px] font-normal text-gray-900"
              data-cy={`survey-question-collapsed-title-${question.id}`}
            >
              {question.question?.trim() ? question.question : 'Question Name'}
            </span>
            <span
              className="inline-flex shrink-0 items-center rounded border border-gray-200 bg-gray-100 px-1.5 py-0.5 text-[12px] font-semibold tabular-nums text-gray-600"
              data-cy={`survey-question-type-tag-${question.id}`}
            >
              {typeLabel}
            </span>
          </>
        )}
        {showEditor && (
          <>
            <span
              className="inline-flex min-w-0 max-w-[min(100%,220px)] shrink-0 items-center truncate rounded border border-gray-200 bg-gray-100 px-1.5 py-0.5 text-[12px] font-semibold tabular-nums text-gray-600"
              data-cy={`survey-question-expanded-type-${question.id}`}
            >
              {typeLabel}
            </span>
            <span
              className="min-w-0 flex-1"
              aria-hidden
              data-cy={`survey-question-header-spacer-${question.id}`}
            />
          </>
        )}
        <button
          type="button"
          data-delete
          className="shrink-0 rounded-lg border border-gray-200 p-1 transition-colors hover:border-red-200 hover:bg-red-50"
          aria-label="Delete question"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          data-cy={`survey-question-delete-${question.id}`}
        >
          <DeleteOutlineIcon
            sx={{ fontSize: 18, color: '#374151' }}
            className="group-hover:text-red-500"
            data-cy={`survey-question-delete-icon-${question.id}`}
          />
        </button>
      </div>

      {showEditor && (
        <div
          className="border-t border-gray-100 px-3 pb-4 pt-3"
          data-cy={`survey-question-editor-${question.id}`}
        >
          {showRatingPreview ? (
            <RatingQuestionPreview
              questionId={question.id}
              questionText={question.question}
              required={question.required}
              field={question.field as RatingFieldItem[]}
              onEditRating={() => setRatingEditing(true)}
            />
          ) : null}
          {showRatingForm ? (
            <SurveyQuestionEditorForm
              form={form}
              questionId={question.id}
              showChoiceEditor={showChoiceEditor}
              showRatingEditor={showRatingEditor}
              primaryAction={isDraft ? 'create' : 'save'}
              submitLoading={isDraft ? createLoading : isLoading}
              surveyQuestionRequired={surveyQuestionRequired}
              onSurveyQuestionRequiredChange={setSurveyQuestionRequired}
              onCancel={handleCancel}
              onFinish={handleFormFinish}
            />
          ) : null}
        </div>
      )}
    </div>
  );
};

export default SortableSurveyQuestionCard;
