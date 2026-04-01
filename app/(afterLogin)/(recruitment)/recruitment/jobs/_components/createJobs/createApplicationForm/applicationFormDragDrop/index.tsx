'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Checkbox,
  Form,
  FormInstance,
  Input,
  Modal,
  Radio,
  Select,
} from 'antd';
import { FieldType } from '@/types/enumTypes';
import { v4 as uuidv4 } from 'uuid';
import { IoClose } from 'react-icons/io5';
import { useIsMobile } from '@/hooks/useIsMobile';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';

const FIELD_TYPES = [
  {
    id: 'short_text',
    type: FieldType.SHORT_TEXT,
    label: 'Text Field',
    description: 'Input field for text',
  },
  {
    id: 'paragraph',
    type: FieldType.PARAGRAPH,
    label: 'Text Area',
    description: 'Input field for larger text',
  },
  {
    id: 'checkbox',
    type: FieldType.CHECKBOX,
    label: 'Checkbox',
    description: 'Input field for multiple values',
  },
  {
    id: 'multiple_choice',
    type: FieldType.MULTIPLE_CHOICE,
    label: 'Radio box',
    description: 'Input field for single value',
  },
  {
    id: 'dropdown',
    type: FieldType.DROPDOWN,
    label: 'Dropdown',
    description: 'Input field for selecting a value',
  },
] as const;

const FIELD_VALUE_VALIDATION_OPTIONS = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'email', label: 'Email' },
  { value: 'date', label: 'Date' },
  { value: 'url', label: 'URL' },
  { value: 'any', label: 'Any' },
];

const JOB_FIELD_TYPE_MIME = 'application/job-field-type';

type PendingField = (typeof FIELD_TYPES)[number];

type QuestionItem = {
  id: string;
  fieldType: string;
  question: string;
  required: boolean;
  field: { id: string; value: string }[];
  fieldValidation?: string;
  isActive?: boolean;
};

interface ApplicationFormDragDropProps {
  form: FormInstance;
}

const badgeLabel = (type: string) => {
  const map: Record<string, string> = {
    [FieldType.SHORT_TEXT]: 'Textfield',
    [FieldType.PARAGRAPH]: 'Text Area',
    [FieldType.CHECKBOX]: 'Checkbox',
    [FieldType.MULTIPLE_CHOICE]: 'Radio box',
    [FieldType.DROPDOWN]: 'Dropdown',
  };
  return map[type] ?? 'Field';
};

const isTextish = (fieldType: string) =>
  fieldType === FieldType.SHORT_TEXT || fieldType === FieldType.PARAGRAPH;

const needsOptions = (fieldType: string) =>
  fieldType === FieldType.MULTIPLE_CHOICE ||
  fieldType === FieldType.CHECKBOX ||
  fieldType === FieldType.DROPDOWN;

const buildFieldOptions = (
  fieldType: string,
  optionValues: string[] | undefined,
): { id: string; value: string }[] => {
  if (!needsOptions(fieldType)) return [];
  const values =
    optionValues?.filter((v) => v != null && String(v).trim() !== '') ?? [];
  if (values.length < 2) return [];
  return values.map((value) => ({
    id: uuidv4(),
    value: String(value).trim(),
  }));
};

const ApplicationFormDragDrop: React.FC<ApplicationFormDragDropProps> = ({
  form,
}) => {
  const { isMobile } = useIsMobile();
  const [questions, setQuestions] = useState<QuestionItem[]>(() => {
    const q = form.getFieldValue('questions');
    return Array.isArray(q) && q.length ? q : [];
  });

  const [customFieldModalOpen, setCustomFieldModalOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [draggingFieldType, setDraggingFieldType] = useState<string | null>(
    null,
  );
  const [reorderingId, setReorderingId] = useState<string | null>(null);
  const [pendingDrop, setPendingDrop] = useState<PendingField | null>(null);
  const [pendingInsertIndex, setPendingInsertIndex] = useState<number | null>(
    null,
  );
  const [customFieldForm] = Form.useForm();

  useEffect(() => {
    form.setFieldValue('questions', questions);
  }, [questions, form]);

  const beginAddFieldFromPalette = useCallback(
    (fieldId: string, insertIndex: number | null) => {
      const fieldTypeInfo = FIELD_TYPES.find((f) => f.id === fieldId);
      if (!fieldTypeInfo) return;
      setPendingInsertIndex(insertIndex);
      setPendingDrop(fieldTypeInfo);
      customFieldForm.resetFields();
      customFieldForm.setFieldsValue({
        fieldName: '',
        fieldMode: 'active',
        ...(isTextish(fieldTypeInfo.type) ? { fieldValidation: 'any' } : {}),
      });
      setCustomFieldModalOpen(true);
    },
    [customFieldForm],
  );

  const handleDragStart = useCallback((e: React.DragEvent, fieldId: string) => {
    e.dataTransfer.setData(JOB_FIELD_TYPE_MIME, fieldId);
    e.dataTransfer.effectAllowed = 'copy';
    setDraggingFieldType(fieldId);

    const card = e.currentTarget as HTMLElement;
    const ghost = card.cloneNode(true) as HTMLElement;
    ghost.setAttribute('aria-hidden', 'true');
    ghost.classList.add('recruitment-settings-drag-ghost');
    // Make sure the tilt is visible even if browser drag-image timing/styles vary.
    ghost.style.transformOrigin = 'center center';
    ghost.style.transform = 'rotate(8deg)';
    ghost.style.position = 'absolute';
    ghost.style.top = '-9999px';
    ghost.style.left = '0';
    ghost.style.width = `${card.offsetWidth}px`;
    ghost.style.pointerEvents = 'none';
    document.body.appendChild(ghost);
    void ghost.offsetHeight;
    const offsetX = Math.min(ghost.offsetWidth / 2, 120);
    const offsetY = 24;
    e.dataTransfer.setDragImage(ghost, offsetX, offsetY);
    requestAnimationFrame(() => {
      if (ghost.parentNode) ghost.parentNode.removeChild(ghost);
    });
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggingFieldType(null);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const types = Array.from(e.dataTransfer.types || []);
    if (types.includes(JOB_FIELD_TYPE_MIME)) {
      e.dataTransfer.dropEffect = 'copy';
    } else if (types.includes('application/job-question-reorder')) {
      e.dataTransfer.dropEffect = 'move';
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const reorderId = e.dataTransfer.getData(
        'application/job-question-reorder',
      );
      if (reorderId) return;

      const fieldId = e.dataTransfer.getData(JOB_FIELD_TYPE_MIME);
      if (!fieldId) return;

      beginAddFieldFromPalette(fieldId, null);
    },
    [beginAddFieldFromPalette],
  );

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.types.includes(JOB_FIELD_TYPE_MIME)) {
      setIsDragOver(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const related = e.relatedTarget as Node | null;
    if (!related || !e.currentTarget.contains(related)) {
      setIsDragOver(false);
    }
  }, []);

  const handleQuestionDragStart = useCallback(
    (e: React.DragEvent, id: string) => {
      e.stopPropagation();
      e.dataTransfer.setData('application/job-question-reorder', id);
      e.dataTransfer.effectAllowed = 'move';
      setReorderingId(id);

      const row = e.currentTarget as HTMLElement;
      const ghost = row.cloneNode(true) as HTMLElement;
      ghost.setAttribute('aria-hidden', 'true');
      ghost.classList.add('recruitment-settings-drag-ghost');
      ghost.style.position = 'absolute';
      ghost.style.top = '-9999px';
      ghost.style.left = '0';
      ghost.style.width = `${row.offsetWidth}px`;
      ghost.style.pointerEvents = 'none';
      document.body.appendChild(ghost);
      void ghost.offsetHeight;
      e.dataTransfer.setDragImage(ghost, 40, 20);
      requestAnimationFrame(() => {
        if (ghost.parentNode) ghost.parentNode.removeChild(ghost);
      });
    },
    [],
  );

  const handleQuestionDragEnd = useCallback(() => {
    setReorderingId(null);
  }, []);

  const handleQuestionDrop = useCallback(
    (e: React.DragEvent, targetIndex: number) => {
      const reorderId = e.dataTransfer.getData(
        'application/job-question-reorder',
      );
      if (reorderId) {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);

        setQuestions((prev) => {
          const from = prev.findIndex((q) => q.id === reorderId);
          if (from < 0 || from === targetIndex) return prev;
          const next = [...prev];
          const [removed] = next.splice(from, 1);
          const to = from < targetIndex ? targetIndex - 1 : targetIndex;
          next.splice(to, 0, removed);
          return next;
        });
        return;
      }

      const fieldId = e.dataTransfer.getData(JOB_FIELD_TYPE_MIME);
      if (fieldId) {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
        beginAddFieldFromPalette(fieldId, targetIndex);
      }
    },
    [beginAddFieldFromPalette],
  );

  const handleQuestionDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.types.includes('application/job-question-reorder')) {
      e.dataTransfer.dropEffect = 'move';
    } else if (e.dataTransfer.types.includes(JOB_FIELD_TYPE_MIME)) {
      e.dataTransfer.dropEffect = 'copy';
    }
  }, []);

  const handleCustomFieldCancel = () => {
    setCustomFieldModalOpen(false);
    setPendingDrop(null);
    setPendingInsertIndex(null);
    customFieldForm.resetFields();
  };

  const handleCustomFieldCreate = () => {
    customFieldForm.validateFields().then((values) => {
      if (!pendingDrop) return;
      const insertAt = pendingInsertIndex;
      const fieldType = pendingDrop.type;
      const optionValues = values.field as string[] | undefined;
      const choiceField = buildFieldOptions(fieldType, optionValues);

      if (needsOptions(fieldType) && choiceField.length < 2) {
        customFieldForm.setFields([
          {
            name: 'field',
            errors: ['At least 2 options are required'],
          },
        ]);
        return;
      }

      const newQuestionId = uuidv4();
      const newQuestion: QuestionItem = {
        id: newQuestionId,
        fieldType,
        question: values.fieldName,
        required: values.fieldMode === 'required',
        field: choiceField,
        fieldValidation: isTextish(fieldType)
          ? values.fieldValidation
          : undefined,
        isActive: values.fieldMode === 'active',
      };
      setQuestions((prev) => {
        if (insertAt == null) return [...prev, newQuestion];
        const next = [...prev];
        next.splice(insertAt, 0, newQuestion);
        return next;
      });
      handleCustomFieldCancel();
    });
  };

  const updateQuestion = (index: number, field: string, value: unknown) => {
    setQuestions((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const renderOptionInput = (type: string) => {
    switch (type) {
      case FieldType.MULTIPLE_CHOICE:
      case FieldType.DROPDOWN:
        return <Radio className="mr-2 shrink-0" disabled value="" />;
      case FieldType.CHECKBOX:
        return <Checkbox className="mr-2 shrink-0" disabled value="" />;
      default:
        return null;
    }
  };

  const renderModalOptions = (fieldType: string) => {
    if (!needsOptions(fieldType)) return null;
    return (
      <Form.List
        name="field"
        initialValue={[]}
        data-cy="talent-acquisition-create-job-custom-field-options-list"
      >
        {(fields, { add, remove }, { errors }) => (
          <div
            className="mb-4"
            data-cy="talent-acquisition-create-job-custom-field-options"
          >
            <p
              className="text-sm font-medium text-gray-700 mb-2"
              data-cy="talent-acquisition-create-job-custom-field-options-label"
            >
              Options
            </p>
            <Form.Item
              className="mb-2"
              style={{ marginBottom: errors.length ? undefined : 0 }}
            >
              <Form.ErrorList errors={errors} />
            </Form.Item>
            {fields.map((field) => (
              <Form.Item
                key={field.key}
                required={false}
                className="mb-2"
                data-cy="talent-acquisition-create-job-custom-field-option-row"
              >
                <div
                  className="flex items-center gap-3"
                  data-cy="talent-acquisition-create-job-custom-field-option-row-inner"
                >
                  {renderOptionInput(fieldType)}
                  <Form.Item
                    {...field}
                    noStyle
                    rules={[
                      { required: true, message: 'Please input an option!' },
                    ]}
                    data-cy="talent-acquisition-create-job-custom-field-option-input"
                  >
                    <Input
                      placeholder="Option"
                      className="h-10 rounded-md flex-1"
                    />
                  </Form.Item>
                  {fields.length > 0 && (
                    <MinusCircleOutlined
                      className="dynamic-delete-button text-red-500 cursor-pointer text-lg shrink-0"
                      onClick={() => remove(field.name)}
                    />
                  )}
                </div>
              </Form.Item>
            ))}
            <Form.Item
              className="mb-0"
              data-cy="talent-acquisition-create-job-custom-field-option-add-wrap"
            >
              <div
                className="flex flex-col items-center justify-center py-2"
                data-cy="talent-acquisition-create-job-custom-field-option-add-inner"
              >
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => add()}
                  onKeyDown={(ev) =>
                    ev.key === 'Enter' && (ev.preventDefault(), add())
                  }
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-primary cursor-pointer hover:opacity-90"
                  data-cy="talent-acquisition-create-job-custom-field-option-add-button"
                >
                  <PlusOutlined className="text-white text-lg" />
                </div>
                <p
                  className="text-xs font-light text-gray-400 mt-1"
                  data-cy="talent-acquisition-create-job-custom-field-option-add-label"
                >
                  + Add options
                </p>
              </div>
            </Form.Item>
          </div>
        )}
      </Form.List>
    );
  };

  return (
    <>
      <Modal
        title="Custom Field"
        open={customFieldModalOpen}
        onCancel={handleCustomFieldCancel}
        footer={null}
        closable
        width={isMobile ? 'calc(100vw - 2rem)' : 480}
        style={isMobile ? { maxWidth: 480 } : undefined}
        centered
        destroyOnClose
        className="talent-acquisition-custom-field-modal"
        data-cy="talent-acquisition-create-job-custom-field-modal"
        closeIcon={<IoClose className="h-5 w-5" />}
      >
        {pendingDrop && (
          <Form
            form={customFieldForm}
            layout="vertical"
            onFinish={handleCustomFieldCreate}
            initialValues={{ fieldMode: 'active' }}
            onValuesChange={(changedValues) => {
              const listChanged = 'field' in changedValues;
              const switched = 'fieldValidation' in changedValues;
              if (listChanged || switched) {
                customFieldForm.setFields([{ name: 'field', errors: [] }]);
              }
            }}
            data-cy="talent-acquisition-create-job-custom-field-form"
          >
            <Form.Item
              name="fieldName"
              label={
                <span
                  className="text-sm font-semibold text-gray-700"
                  data-cy="talent-acquisition-create-job-custom-field-name-label"
                >
                  Field Name{' '}
                  <span
                    className="text-red-500"
                    data-cy="talent-acquisition-create-job-custom-field-name-required"
                  >
                    *
                  </span>
                </span>
              }
              rules={[
                { required: true, message: 'Please input the field name!' },
              ]}
            >
              <Input
                placeholder="Input"
                className="h-10 rounded-lg"
                data-cy="talent-acquisition-create-job-custom-field-name"
              />
            </Form.Item>

            <p
              className="text-sm text-gray-600 -mt-2 mb-4"
              data-cy="talent-acquisition-create-job-custom-field-type-label"
            >
              Type:{' '}
              <span
                className="font-medium text-gray-900"
                data-cy="talent-acquisition-create-job-custom-field-type-value"
              >
                {pendingDrop.label}
              </span>
            </p>

            {isTextish(pendingDrop.type) && (
              <>
                <Form.Item
                  name="fieldValidation"
                  label={
                    <span
                      className="text-sm font-semibold text-gray-700"
                      data-cy="talent-acquisition-create-job-custom-field-validation-label"
                    >
                      Field Validation{' '}
                      <span
                        className="text-red-500"
                        data-cy="talent-acquisition-create-job-custom-field-validation-required"
                      >
                        *
                      </span>
                    </span>
                  }
                  rules={[
                    {
                      required: true,
                      message: 'Please select a field validation type!',
                    },
                  ]}
                >
                  <Select
                    placeholder="Select a field validation type"
                    className="h-10 w-full rounded-lg"
                    options={FIELD_VALUE_VALIDATION_OPTIONS}
                    data-cy="talent-acquisition-create-job-custom-field-validation"
                  />
                </Form.Item>
                <p
                  className="text-sm text-gray-500 -mt-2 mb-4"
                  data-cy="talent-acquisition-create-job-custom-field-validation-help"
                >
                  Select how this field should validate input.
                </p>
              </>
            )}

            {renderModalOptions(pendingDrop.type)}

            <Form.Item name="fieldMode" label={null}>
              <Radio.Group
                className="w-full"
                data-cy="talent-acquisition-create-job-custom-field-mode-group"
              >
                <div
                  className="mb-3"
                  data-cy="talent-acquisition-create-job-custom-field-mode-active"
                >
                  <Radio value="active">
                    <span
                      className="font-medium text-gray-900"
                      data-cy="talent-acquisition-create-job-custom-field-mode-active-label"
                    >
                      Active
                    </span>
                  </Radio>
                  <p
                    className="text-sm text-gray-500 ml-6 mt-0.5"
                    data-cy="talent-acquisition-create-job-custom-field-mode-active-help"
                  >
                    If the field is active will show.
                  </p>
                </div>
                <div data-cy="talent-acquisition-create-job-custom-field-mode-required">
                  <Radio value="required">
                    <span
                      className="font-medium text-gray-900"
                      data-cy="talent-acquisition-create-job-custom-field-mode-required-label"
                    >
                      Required
                    </span>
                  </Radio>
                  <p
                    className="text-sm text-gray-500 ml-6 mt-0.5"
                    data-cy="talent-acquisition-create-job-custom-field-mode-required-help"
                  >
                    If selected it must be filled.
                  </p>
                </div>
              </Radio.Group>
            </Form.Item>

            <div
              className="flex justify-end gap-3 pt-2 border-t border-gray-100 mt-4"
              data-cy="talent-acquisition-create-job-custom-field-footer"
            >
              <Button
                onClick={handleCustomFieldCancel}
                className="h-10 rounded-lg border-gray-300 text-gray-700"
                data-cy="talent-acquisition-create-job-custom-field-cancel"
              >
                Cancel
              </Button>
              <Button
                type="primary"
                onClick={() => customFieldForm.submit()}
                className="h-10 rounded-lg !bg-[#6366F1] hover:!bg-[#4F46E5]"
                data-cy="talent-acquisition-create-job-custom-field-create"
              >
                Create Field
              </Button>
            </div>
          </Form>
        )}
      </Modal>

      <div
        className="grid grid-cols-1 gap-4 lg:grid-cols-2"
        data-cy="talent-acquisition-create-job-custom-fields-layout"
      >
        <div
          className="rounded-lg border border-gray-200 bg-gray-50/50 p-3 space-y-3"
          data-cy="talent-acquisition-create-job-custom-fields-palette"
        >
          {FIELD_TYPES.map((item) => (
            <div
              key={item.id}
              role={isMobile ? 'button' : undefined}
              tabIndex={isMobile ? 0 : undefined}
              draggable={!isMobile}
              onClick={
                isMobile
                  ? () => beginAddFieldFromPalette(item.id, null)
                  : undefined
              }
              onKeyDown={
                isMobile
                  ? (e) =>
                      e.key === 'Enter' &&
                      beginAddFieldFromPalette(item.id, null)
                  : undefined
              }
              onDragStart={
                isMobile ? undefined : (e) => handleDragStart(e, item.id)
              }
              onDragEnd={isMobile ? undefined : handleDragEnd}
              className={`rounded-lg border border-gray-200 bg-white p-4 cursor-grab active:cursor-grabbing transition-all duration-200 ease-out ${
                !isMobile && draggingFieldType === item.id
                  ? 'recruitment-settings-dragging-card'
                  : ''
              }`}
              style={
                !isMobile && draggingFieldType === item.id
                  ? {
                      // Explicit tilt to satisfy the "small degree rotation" requirement.
                      transform: 'scale(0.98) rotate(8deg)',
                      transformOrigin: 'center center',
                      opacity: 0.7,
                    }
                  : undefined
              }
              data-cy={`talent-acquisition-create-job-field-type-${item.id}`}
            >
              <div
                className="flex items-center gap-2"
                data-cy={`talent-acquisition-create-job-field-type-header-${item.id}`}
              >
                <span
                  className="flex-shrink-0 w-5 h-5 rounded-full border-2 border-gray-400"
                  data-cy={`talent-acquisition-create-job-field-type-dot-${item.id}`}
                />
                <p
                  className="text-sm font-medium text-gray-900"
                  data-cy={`talent-acquisition-create-job-field-type-label-${item.id}`}
                >
                  {item.label}
                </p>
              </div>
              <p
                className="text-xs text-gray-500 mt-1 pl-7"
                data-cy={`talent-acquisition-create-job-field-type-description-${item.id}`}
              >
                {item.description}
              </p>
            </div>
          ))}
        </div>

        <div
          className={`rounded-lg border border-gray-200 bg-white p-4 min-h-[220px] transition-colors ${
            !isMobile && isDragOver
              ? 'ring-2 ring-[#6366F1] ring-offset-2 bg-indigo-50/40'
              : ''
          }`}
          onDragOver={isMobile ? undefined : handleDragOver}
          onDragEnter={isMobile ? undefined : handleDragEnter}
          onDragLeave={isMobile ? undefined : handleDragLeave}
          onDrop={isMobile ? undefined : handleDrop}
          data-cy="talent-acquisition-create-job-form-drop-zone"
        >
          {questions.length === 0 ? (
            <div
              className="flex min-h-[180px] items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50/30 px-4 text-center text-sm text-gray-500"
              data-cy="talent-acquisition-create-job-form-drop-empty"
            >
              {isMobile
                ? 'Select a field type to add it to this job application.'
                : 'Drag field types here to add them to this job application.'}
            </div>
          ) : (
            <div
              className="space-y-2"
              data-cy="talent-acquisition-create-job-question-list"
            >
              {questions.map((q, index) => (
                <div
                  key={q.id}
                  draggable={!isMobile}
                  onDragStart={
                    isMobile
                      ? undefined
                      : (e) => handleQuestionDragStart(e, q.id)
                  }
                  onDragEnd={isMobile ? undefined : handleQuestionDragEnd}
                  onDragOver={isMobile ? undefined : handleQuestionDragOver}
                  onDrop={
                    isMobile ? undefined : (e) => handleQuestionDrop(e, index)
                  }
                  className={`flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 transition-all duration-200 ease-out ${
                    !isMobile && reorderingId === q.id
                      ? 'recruitment-settings-dragging-card'
                      : ''
                  }`}
                  data-cy={`talent-acquisition-create-job-question-row-${q.id}`}
                >
                  <span
                    className="inline-flex shrink-0"
                    onMouseDown={(e: React.MouseEvent) => e.stopPropagation()}
                    data-cy={`talent-acquisition-create-job-question-required-wrap-${q.id}`}
                  >
                    <Checkbox
                      checked={q.required}
                      onChange={(e) =>
                        updateQuestion(index, 'required', e.target.checked)
                      }
                      data-cy={`talent-acquisition-create-job-question-required-${q.id}`}
                    />
                  </span>
                  <Input
                    value={q.question}
                    onMouseDown={(e: React.MouseEvent) => e.stopPropagation()}
                    onChange={(e) =>
                      updateQuestion(index, 'question', e.target.value)
                    }
                    placeholder="Field label"
                    variant="borderless"
                    className="flex-1 min-w-0 px-0 text-gray-900"
                    data-cy={`talent-acquisition-create-job-question-label-${q.id}`}
                  />
                  <span
                    className="shrink-0 rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700"
                    data-cy={`talent-acquisition-create-job-question-type-${q.id}`}
                  >
                    {badgeLabel(q.fieldType)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ApplicationFormDragDrop;
