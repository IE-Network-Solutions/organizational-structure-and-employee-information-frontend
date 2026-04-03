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
import {
  SURVEY_FIELD_TYPE_LABELS,
  coerceSurveyRequired,
  surveyTypePillClassName,
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
  /** Only sync from server when opening the editor — not on every `question` ref (refetch would wipe Required). */
  const wasEditorOpenRef = useRef(false);

  useEffect(() => {
    if (!showEditor) {
      wasEditorOpenRef.current = false;
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
    setSurveyQuestionRequired(coerceSurveyRequired(question.required));
    form.setFieldsValue({
      question: question.question,
      fieldType: question.fieldType,
      field: fieldValues,
    });
  }, [showEditor, question, form]);

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

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.88 : 1,
    zIndex: isDragging ? 2 : 0,
    position: 'relative' as const,
  };

  const typeLabel =
    SURVEY_FIELD_TYPE_LABELS[question.fieldType] || question.fieldType;

  const showChoiceEditor =
    question.fieldType === FieldType.MULTIPLE_CHOICE ||
    question.fieldType === FieldType.CHECKBOX;

  const handleSave = async (values: Record<string, unknown>) => {
    const fieldType = String(values.fieldType);
    const isChoiceType =
      fieldType === FieldType.MULTIPLE_CHOICE ||
      fieldType === FieldType.CHECKBOX;
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
        : [],
    };
    updateQuestion(
      { data: updatedData, id: question.id },
      {
        onSuccess: () => onUpdated(),
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
    onToggle();
  };

  return (
    <div
      ref={setRootRef}
      style={style}
      className={`box-border rounded-md border border-gray-200 bg-white transition-colors ${
        showEditor ? 'border-[#4096ff]' : 'hover:border-[#2D5BFF]/40'
      }`}
      data-cy={`survey-sortable-question-${question.id}`}
    >
      <div
        className="flex min-h-[52px] items-center gap-2 border-b border-gray-200 px-2 py-2"
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
              className={surveyTypePillClassName}
              data-cy={`survey-question-type-tag-${question.id}`}
            >
              {typeLabel}
            </span>
          </>
        )}
        {showEditor && (
          <>
            <span
              className={`${surveyTypePillClassName} max-w-[min(100%,220px)] min-w-0 truncate`}
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
          className="shrink-0 rounded border border-gray-200 p-1 transition-colors hover:border-gray-300 hover:bg-gray-50"
          aria-label="Delete question"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          data-cy={`survey-question-delete-${question.id}`}
        >
          <DeleteOutlineIcon
            sx={{ fontSize: 18, color: '#374151' }}
            data-cy={`survey-question-delete-icon-${question.id}`}
          />
        </button>
      </div>

      {showEditor && (
        <div
          className="px-2 pb-3 pt-2"
          data-cy={`survey-question-editor-${question.id}`}
        >
          <SurveyQuestionEditorForm
            form={form}
            questionId={question.id}
            showChoiceEditor={showChoiceEditor}
            primaryAction={isDraft ? 'create' : 'save'}
            submitLoading={isDraft ? createLoading : isLoading}
            surveyQuestionRequired={surveyQuestionRequired}
            onSurveyQuestionRequiredChange={setSurveyQuestionRequired}
            onCancel={handleCancel}
            onFinish={handleFormFinish}
          />
        </div>
      )}
    </div>
  );
};

export default SortableSurveyQuestionCard;
