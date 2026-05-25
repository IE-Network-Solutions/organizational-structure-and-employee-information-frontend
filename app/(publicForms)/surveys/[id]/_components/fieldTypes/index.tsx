/* eslint-disable local-rules/data-cy-required */
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { usePublicFormStore } from '@/store/uistate/features/feedback/publicForm';
import { FieldType } from '@/types/enumTypes';
import { Checkbox, Form, Input, Radio } from 'antd';
import { v4 as uuidv4 } from 'uuid';
import React, { useMemo, useRef } from 'react';
import RatingField from './ratingField';

interface RenderOptionsProps {
  type: string;
  field: Array<Record<string, string>>;
  questionId: string;
  form: any;
  isAnonymous?: boolean;
  disabled?: boolean;
}

const RenderOptions: React.FC<RenderOptionsProps> = ({
  type,
  field,
  questionId,
  form,
  isAnonymous = false,
  disabled = false,
}) => {
  const userId = useAuthenticationStore.getState().userId || null;

  const { setSelectedAnswer, selectedAnswer } = usePublicFormStore();

  const fieldName = `question_${questionId}`;
  /** Prefilled submitted responses set Form values before/alongside store — keep cards in sync. */
  const watchedQuestionValue = Form.useWatch(fieldName, form);

  const matchingAnswer = useMemo(() => {
    if (!selectedAnswer?.length) return undefined;
    return selectedAnswer.find((a) => {
      if (isAnonymous) return a.questionId === questionId;
      return a.questionId === questionId && a.respondentId === userId;
    });
  }, [selectedAnswer, questionId, userId, isAnonymous]);

  const handleSelection = (
    choice: Record<string, string>[],
    mode: 'single' | 'multi' = 'single',
  ) => {
    setSelectedAnswer({
      questionId,
      respondentId: isAnonymous ? null : userId,
      responseDetail: choice,
    });
    const formValue =
      mode === 'multi' ? choice.map((c) => c.value) : choice[0]?.value;
    form.setFieldsValue({
      [`question_${questionId}`]: formValue,
    });
  };

  const textValue =
    matchingAnswer?.responseDetail?.[0]?.value != null
      ? String(matchingAnswer.responseDetail[0].value)
      : '';

  const stableTextDetailIdRef = useRef<string | null>(null);
  if (stableTextDetailIdRef.current == null) {
    stableTextDetailIdRef.current = uuidv4();
  }
  const textRowId =
    matchingAnswer?.responseDetail?.[0]?.id != null
      ? String(matchingAnswer.responseDetail[0].id)
      : stableTextDetailIdRef.current;

  const checkboxGroupValue = useMemo(() => {
    const w = watchedQuestionValue;
    if (Array.isArray(w)) return w.map(String);
    return matchingAnswer?.responseDetail?.map((d) => String(d.value)) ?? [];
  }, [watchedQuestionValue, matchingAnswer]);

  const radioGroupValue = useMemo(() => {
    const w = watchedQuestionValue;
    if (w != null && w !== '') return String(w);
    const d = matchingAnswer?.responseDetail?.[0]?.value;
    if (d != null && d !== '') return String(d);
    return undefined;
  }, [watchedQuestionValue, matchingAnswer]);

  // Helper function to check if an answer is selected
  const isAnswerSelected = (choice: Record<string, string>) => {
    if (!selectedAnswer) return false;

    for (const answer of selectedAnswer) {
      // For anonymous forms, only check questionId
      if (isAnonymous) {
        if (answer.questionId === questionId) {
          for (const detail of answer.responseDetail) {
            if (detail.value === choice.value) {
              return true;
            }
          }
        }
      } else {
        // For non-anonymous forms, check both questionId and respondentId
        if (
          answer.questionId === questionId &&
          answer.respondentId === userId
        ) {
          for (const detail of answer.responseDetail) {
            if (detail.value === choice.value) {
              return true;
            }
          }
        }
      }
    }
    return false;
  };

  const isChoiceSelectedForRadio = (choice: Record<string, string>) =>
    isAnswerSelected(choice) ||
    String(watchedQuestionValue ?? '') === String(choice.value);

  const isChoiceSelectedForCheckbox = (choice: Record<string, string>) =>
    isAnswerSelected(choice) ||
    (Array.isArray(watchedQuestionValue) &&
      watchedQuestionValue.map(String).includes(String(choice.value)));

  return (
    <div
      data-cy="-id-components-fieldtypes-index-tsx-index-div-71"
      key={questionId}
    >
      {(type === 'multiple_choice' || type === FieldType.RADIO) && (
        <Radio.Group
          value={radioGroupValue}
          onChange={(e) => {
            const v = e.target.value;
            const selected = field?.find((c) => String(c.value) === String(v));
            if (selected) handleSelection([selected], 'single');
          }}
          className="flex w-full flex-col gap-2"
          aria-label="Answer choices"
        >
          {field?.map((choice, index) => {
            const isSelected = isChoiceSelectedForRadio(choice);
            return (
              <Radio
                key={`${questionId}-radio-${index}`}
                value={choice.value}
                className={`!m-0 !mr-0 flex min-h-10 w-full items-center rounded-lg border bg-white px-3 py-2 transition-colors [&_.ant-radio]:mt-0.5 ${
                  isSelected
                    ? 'border-[#4096ff]'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="text-[15px] font-normal leading-snug text-gray-900">
                  {choice.value}
                </span>
              </Radio>
            );
          })}
        </Radio.Group>
      )}
      {type === FieldType.CHECKBOX && (
        <Checkbox.Group
          key={questionId}
          className="flex w-full flex-col gap-2"
          value={checkboxGroupValue}
          onChange={(e: string[]) => {
            const checkedValues = e.map((el) => ({
              value: el,
              id: uuidv4(),
            }));
            handleSelection(checkedValues, 'multi');
          }}
        >
          {field?.map((choice, index) => {
            const isSelected = isChoiceSelectedForCheckbox(choice);
            return (
              <label
                key={`${questionId}-cb-${index}`}
                className={`flex min-h-10 cursor-pointer items-center gap-2 rounded-lg border bg-white px-3 py-2 transition-colors ${
                  isSelected
                    ? 'border-[#4096ff]'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Checkbox value={choice.value} className="mt-0">
                  <span className="text-[15px] font-normal text-gray-900">
                    {choice.value}
                  </span>
                </Checkbox>
              </label>
            );
          })}
        </Checkbox.Group>
      )}
      {type === FieldType.SHORT_TEXT && (
        <Input
          key={questionId}
          placeholder="Type your answer"
          className="rounded-lg"
          size="large"
          value={textValue}
          onChange={(e) => {
            handleSelection(
              [
                {
                  value: e.target.value,
                  id: textRowId,
                },
              ],
              'single',
            );
          }}
        />
      )}
      {type === FieldType.PARAGRAPH && (
        <Input.TextArea
          key={questionId}
          rows={5}
          placeholder="Type your answer"
          className="rounded-lg"
          value={textValue}
          onChange={(e) => {
            handleSelection(
              [
                {
                  value: e.target.value,
                  id: textRowId,
                },
              ],
              'single',
            );
          }}
        />
      )}
      {type === FieldType.RATING && (
        <RatingField
          questionId={questionId}
          field={field as Array<Record<string, string>>}
          form={form}
          matchingAnswer={matchingAnswer}
          disabled={disabled}
          onAnswerChange={(responseDetail) =>
            handleSelection(responseDetail, 'single')
          }
        />
      )}
    </div>
  );
};

export default RenderOptions;
