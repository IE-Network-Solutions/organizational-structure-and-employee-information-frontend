'use client';
/* eslint-disable local-rules/data-cy-required, @typescript-eslint/naming-convention, @typescript-eslint/no-unused-vars */

import React from 'react';
import { Form, Input, Checkbox, Button } from 'antd';
import type { FormInstance } from 'antd/es/form';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { Pencil } from 'lucide-react';
import { FieldType } from '@/types/enumTypes';

export type SurveyQuestionEditorPrimaryAction = 'create' | 'save';

export interface SurveyQuestionEditorFormProps {
  form: FormInstance;
  questionId: string;
  showChoiceEditor: boolean;
  showRatingEditor?: boolean;
  primaryAction: SurveyQuestionEditorPrimaryAction;
  submitLoading?: boolean;
  /** Required flag is kept outside Form store so submit always matches the checkbox (Form.List + checkbox can desync). */
  surveyQuestionRequired: boolean;
  onSurveyQuestionRequiredChange: (value: boolean) => void;
  onCancel: () => void;
  onFinish: (values: Record<string, unknown>) => void | Promise<void>;
}

const inputHeight40Styles = {
  input: { height: 40, minHeight: 40, lineHeight: '22px' },
} as const;

/** Question name input uses affix (clear); keep wrapper height aligned. */
const inputHeight40StylesWithAffix = {
  ...inputHeight40Styles,
  affixWrapper: { minHeight: 40, paddingBlock: 4 },
} as const;

const SurveyQuestionEditorForm: React.FC<SurveyQuestionEditorFormProps> = ({
  form,
  questionId,
  showChoiceEditor,
  showRatingEditor = false,
  primaryAction,
  submitLoading,
  surveyQuestionRequired,
  onSurveyQuestionRequiredChange,
  onCancel,
  onFinish,
}) => {
  const primaryLabel = primaryAction === 'create' ? 'Create' : 'Save';
  const showNameRequiredAsterisk = surveyQuestionRequired;

  return (
    <div data-cy={`survey-question-form-wrap-${questionId}`}>
      <Form
        form={form}
        layout="vertical"
        onFinish={(values) =>
          void onFinish({ ...values, questionRequired: surveyQuestionRequired })
        }
        className="flex flex-col gap-4"
      >
        <Form.Item
          label={
            <span className="inline-flex items-center gap-1 text-sm font-normal text-gray-900">
              <span data-cy={`survey-question-name-label-${questionId}`}>
                Question Name
              </span>
              {showNameRequiredAsterisk ? (
                <span
                  className="text-red-500"
                  aria-hidden
                  data-cy={`survey-question-name-survey-required-star-${questionId}`}
                >
                  *
                </span>
              ) : null}
            </span>
          }
          name="question"
          required={false}
          rules={[
            { required: true, message: 'Please enter the question name' },
          ]}
          className="mb-0"
        >
          <Input
            placeholder="Input"
            allowClear
            className="rounded-md font-normal text-gray-900"
            styles={inputHeight40StylesWithAffix}
            data-cy={`survey-question-title-input-${questionId}`}
          />
        </Form.Item>

        <Form.Item name="fieldType" hidden>
          <Input data-cy={`survey-question-field-type-hidden-${questionId}`} />
        </Form.Item>

        {!showRatingEditor && (
          <div
            className="rounded-lg border border-gray-200 bg-gray-50/80 px-3 py-3"
            data-cy={`survey-question-required-block-${questionId}`}
          >
            <div className="mb-0">
              <Checkbox
                checked={surveyQuestionRequired}
                onChange={(e) =>
                  onSurveyQuestionRequiredChange(e.target.checked)
                }
                className="[&_.ant-checkbox-inner]:rounded-full"
                data-cy={`survey-question-required-${questionId}`}
              >
                <span
                  className="font-medium text-gray-900"
                  data-cy={`survey-question-required-label-${questionId}`}
                >
                  Required
                </span>
              </Checkbox>
              <p
                className="mb-0 mt-1 pl-6 text-xs text-gray-500"
                data-cy={`survey-question-required-hint-${questionId}`}
              >
                can not be submitted if question is not answered
              </p>
            </div>
          </div>
        )}

        {showRatingEditor && (
          <div data-cy={`survey-question-rating-section-${questionId}`}>
            <Form.Item
              label={
                <span className="inline-flex items-center gap-1 text-sm font-normal text-gray-900">
                  <span
                    data-cy={`survey-question-rating-stars-label-${questionId}`}
                  >
                    Rating in stars
                  </span>
                  <span className="text-red-500" aria-hidden>
                    *
                  </span>
                </span>
              }
              name="ratingStarCount"
              required={false}
              rules={[
                { required: true, message: 'Please enter the number of stars' },
                {
                  validator: async (_, value) => {
                    const n = Number(value);
                    if (!Number.isInteger(n) || n < 3 || n > 10) {
                      return Promise.reject(
                        new Error('Enter a whole number between 3 and 10'),
                      );
                    }
                  },
                },
              ]}
              className="mb-0"
            >
              <Input
                type="number"
                min={3}
                max={10}
                placeholder="add number for rating"
                className="rounded-md font-normal text-gray-900"
                styles={inputHeight40Styles}
                data-cy={`survey-question-rating-stars-input-${questionId}`}
              />
            </Form.Item>

            <Form.Item
              label={
                <span
                  className="text-sm font-normal text-gray-900"
                  data-cy={`survey-question-rating-description-label-${questionId}`}
                >
                  Description
                </span>
              }
              name="ratingDescription"
              className="mb-0 mt-4"
            >
              <Input.TextArea
                rows={3}
                placeholder="Description for rating"
                className="rounded-md font-normal text-gray-900"
                data-cy={`survey-question-rating-description-input-${questionId}`}
              />
            </Form.Item>

            <div
              className="mt-4 rounded-lg border border-gray-200 bg-gray-50/80 px-3 py-3"
              data-cy={`survey-question-rating-description-required-block-${questionId}`}
            >
              <Form.Item
                name="ratingDescriptionRequired"
                valuePropName="checked"
                className="mb-0"
              >
                <Checkbox
                  className="[&_.ant-checkbox-inner]:rounded-full"
                  data-cy={`survey-question-rating-description-required-${questionId}`}
                >
                  <span
                    className="font-medium text-gray-900"
                    data-cy={`survey-question-rating-description-required-label-${questionId}`}
                  >
                    Description Required
                  </span>
                </Checkbox>
              </Form.Item>
              <p
                className="mb-0 mt-1 pl-6 text-xs text-gray-500"
                data-cy={`survey-question-rating-description-required-hint-${questionId}`}
              >
                Set the description as required to make sure the user gives
                feedback
              </p>
            </div>
          </div>
        )}

        {showChoiceEditor && (
          <div data-cy={`survey-question-choices-section-${questionId}`}>
            <p
              className="mb-3 text-sm font-semibold text-gray-900"
              data-cy={`survey-question-choices-heading-${questionId}`}
            >
              Customize Choices
            </p>
            <Form.List
              name="field"
              rules={[
                {
                  validator: async (unusedRule, names) => {
                    void unusedRule;
                    if (!names || names.length < 2) {
                      return Promise.reject(
                        new Error('At least 2 options are required'),
                      );
                    }
                  },
                },
              ]}
            >
              {(fields, { add, remove }) => (
                <div
                  className="flex flex-col gap-2"
                  data-cy={`survey-question-choices-list-${questionId}`}
                >
                  {fields.map((field, index) => (
                    <div
                      key={field.key}
                      className="flex min-h-10 items-stretch gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2"
                      data-cy={`survey-question-choice-row-${questionId}-${index}`}
                    >
                      <Form.Item
                        {...field}
                        className="mb-0 min-w-0 flex-1"
                        rules={[
                          { required: true, message: 'Enter choice text' },
                        ]}
                      >
                        <Input
                          placeholder={`Choice ${index + 1}`}
                          variant="borderless"
                          className="bg-transparent px-0"
                          styles={inputHeight40Styles}
                          data-cy={`survey-question-choice-${questionId}-${index}`}
                        />
                      </Form.Item>
                      <button
                        type="button"
                        className="flex shrink-0 items-center justify-center text-gray-400 hover:text-[#2D5BFF]"
                        aria-label="Edit choice"
                        data-cy={`survey-question-choice-edit-${questionId}-${index}`}
                      >
                        <Pencil size={16} />
                      </button>
                      {fields.length > 2 && (
                        <MinusCircleOutlined
                          className="shrink-0 cursor-pointer self-center text-lg text-gray-400 hover:text-red-500"
                          onClick={() => remove(field.name)}
                          data-cy={`survey-question-choice-remove-${questionId}-${index}`}
                        />
                      )}
                    </div>
                  ))}
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    icon={<PlusOutlined />}
                    className="mt-1 w-full"
                    data-cy={`survey-question-add-choice-${questionId}`}
                  >
                    Add choice
                  </Button>
                </div>
              )}
            </Form.List>
          </div>
        )}

        <div
          className="mt-2 flex justify-end gap-2  border-gray-100 pt-4"
          data-cy={`survey-question-form-actions-${questionId}`}
        >
          <Button
            onClick={onCancel}
            className="min-w-[88px]"
            data-cy={`survey-question-cancel-${questionId}`}
          >
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={submitLoading}
            className="min-w-[88px] bg-[#2D5BFF]"
            data-cy={`survey-question-primary-${questionId}`}
          >
            {primaryLabel}
          </Button>
        </div>
      </Form>
    </div>
  );
};

export function getDefaultChoiceFieldValues(fieldType: string): string[] {
  const needs =
    fieldType === FieldType.MULTIPLE_CHOICE || fieldType === FieldType.CHECKBOX;
  return needs ? ['', ''] : [];
}

export default SurveyQuestionEditorForm;
