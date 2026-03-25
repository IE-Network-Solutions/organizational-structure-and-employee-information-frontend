'use client';
/* eslint-disable local-rules/data-cy-required */

import React, { useEffect, useState } from 'react';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
  DragStart,
} from '@hello-pangea/dnd';
import {
  Button,
  Checkbox,
  Form,
  FormInstance,
  Input,
  Modal,
  Select,
} from 'antd';
import { FieldType } from '@/types/enumTypes';
import { v4 as uuidv4 } from 'uuid';
import { IoClose } from 'react-icons/io5';
import { useIsMobile } from '@/hooks/useIsMobile';

const { Option } = Select;

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
];

const FIELD_VALIDATION_OPTIONS = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'email', label: 'Email' },
  { value: 'date', label: 'Date' },
  { value: 'url', label: 'URL' },
  { value: 'any', label: 'Any' },
];

const SOURCES_DROPPABLE = 'field-types-source';
const CANVAS_DROPPABLE = 'form-canvas';

type QuestionItem = {
  id: string;
  fieldType: string;
  question: string;
  required: boolean;
  field: any[];
  fieldValidation?: string;
  isActive?: boolean;
};

interface ApplicationFormDragDropProps {
  form: FormInstance;
}

const ApplicationFormDragDrop: React.FC<ApplicationFormDragDropProps> = ({
  form,
}) => {
  const { isMobile } = useIsMobile();
  const [questions, setQuestions] = useState<QuestionItem[]>(() => {
    const q = form.getFieldValue('questions');
    return Array.isArray(q) && q.length ? q : [];
  });

  const [customFieldModalOpen, setCustomFieldModalOpen] = useState(false);
  const [isDraggingFromSource, setIsDraggingFromSource] = useState(false);
  const [recentlyDroppedQuestionId, setRecentlyDroppedQuestionId] = useState<
    string | null
  >(null);
  const [pendingDrop, setPendingDrop] = useState<{
    fieldTypeInfo: (typeof FIELD_TYPES)[number];
    destinationIndex: number;
  } | null>(null);
  const [customFieldForm] = Form.useForm();

  useEffect(() => {
    form.setFieldValue('questions', questions);
  }, [questions, form]);

  useEffect(() => {
    if (!recentlyDroppedQuestionId) return;
    const timeout = window.setTimeout(() => {
      setRecentlyDroppedQuestionId(null);
    }, 700);
    return () => window.clearTimeout(timeout);
  }, [recentlyDroppedQuestionId]);

  const onDragStart = (start: DragStart) => {
    setIsDraggingFromSource(start.source.droppableId === SOURCES_DROPPABLE);
  };

  const onDragEnd = (result: DropResult) => {
    setIsDraggingFromSource(false);
    if (!result.destination) return;
    const { source, destination } = result;

    if (
      source.droppableId === SOURCES_DROPPABLE &&
      destination.droppableId === CANVAS_DROPPABLE
    ) {
      const fieldTypeInfo = FIELD_TYPES.find(
        (f) => f.id === result.draggableId,
      );
      if (fieldTypeInfo) {
        setPendingDrop({ fieldTypeInfo, destinationIndex: destination.index });
        customFieldForm.setFieldsValue({
          fieldName: '',
          fieldValidation: undefined,
          isActive: true,
          required: false,
        });
        setCustomFieldModalOpen(true);
      }
      return;
    }

    if (
      source.droppableId === CANVAS_DROPPABLE &&
      destination.droppableId === CANVAS_DROPPABLE
    ) {
      const next = [...questions];
      const [removed] = next.splice(source.index, 1);
      next.splice(destination.index, 0, removed);
      setQuestions(next);
    }
  };

  const handleCustomFieldCancel = () => {
    setCustomFieldModalOpen(false);
    setPendingDrop(null);
    customFieldForm.resetFields();
  };

  const handleCustomFieldCreate = () => {
    customFieldForm.validateFields().then((values) => {
      if (!pendingDrop) return;
      const newQuestionId = uuidv4();
      const newQuestion: QuestionItem = {
        id: newQuestionId,
        fieldType: pendingDrop.fieldTypeInfo.type,
        question: values.fieldName,
        required: !!values.required,
        field: [],
        fieldValidation: values.fieldValidation,
        isActive: values.isActive !== false,
      };
      const next = [...questions];
      next.splice(pendingDrop.destinationIndex, 0, newQuestion);
      setQuestions(next);
      setRecentlyDroppedQuestionId(newQuestionId);
      handleCustomFieldCancel();
    });
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    setQuestions((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const getTypeLabel = (type: string) =>
    FIELD_TYPES.find((f) => f.type === type)?.label ?? 'Field';

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
        className="talent-acquisition-custom-field-modal"
        data-cy="talent-acquisition-create-job-custom-field-modal"
        closeIcon={<IoClose className="h-5 w-5" />}
      >
        <Form
          form={customFieldForm}
          layout="vertical"
          onFinish={handleCustomFieldCreate}
          initialValues={{ isActive: true, required: false }}
        >
          <Form.Item
            name="fieldName"
            label={
              <span className="text-sm font-semibold text-gray-700">
                Field Name <span className="text-red-500">*</span>
              </span>
            }
            rules={[
              { required: true, message: 'Please input the field name!' },
            ]}
          >
            <Input
              placeholder="Input"
              className="h-10 rounded-lg"
              data-cy="talent-acquisition-custom-field-name"
            />
          </Form.Item>
          <Form.Item
            name="fieldValidation"
            label={
              <span className="text-sm font-semibold text-gray-700">
                Field Validation <span className="text-red-500">*</span>
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
              allowClear
              data-cy="talent-acquisition-custom-field-validation"
            >
              {FIELD_VALIDATION_OPTIONS.map((opt) => (
                <Option key={opt.value} value={opt.value}>
                  {opt.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="isActive" valuePropName="checked">
            <Checkbox data-cy="talent-acquisition-custom-field-active">
              <span className="text-gray-700">Active</span>
              <span className="ml-1 text-gray-500">
                If the field is active will show
              </span>
            </Checkbox>
          </Form.Item>
          <Form.Item name="required" valuePropName="checked">
            <Checkbox data-cy="talent-acquisition-custom-field-required">
              <span className="text-gray-700">Required</span>
              <span className="ml-1 text-gray-500">
                If selected it must be filled
              </span>
            </Checkbox>
          </Form.Item>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              onClick={handleCustomFieldCancel}
              className="h-10 rounded-lg border-gray-300 text-gray-700"
              data-cy="talent-acquisition-custom-field-cancel"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              onClick={() => customFieldForm.submit()}
              className="h-10 rounded-lg !bg-[#6366F1] hover:!bg-[#4F46E5]"
              data-cy="talent-acquisition-custom-field-create"
            >
              Create Field
            </Button>
          </div>
        </Form>
      </Modal>
      <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Left: Field types to drag */}
          <Droppable droppableId={SOURCES_DROPPABLE} isDropDisabled={true}>
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-gray-50/50 p-3 min-h-[200px]"
              >
                <span className="text-sm font-semibold text-gray-700">
                  Available field types
                </span>
                {FIELD_TYPES.map((item, index) => (
                  <Draggable key={item.id} draggableId={item.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`flex items-center gap-2 rounded-lg border bg-white p-3 shadow-sm transition-all cursor-grab active:cursor-grabbing ${
                          snapshot.isDragging
                            ? 'opacity-90 scale-105 shadow-lg ring-2 ring-[#6366F1] cursor-grabbing'
                            : 'border-gray-200'
                        }`}
                      >
                        <span className="mt-1 h-4 w-4 shrink-0 rounded-full border-2 border-gray-300" />
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-gray-900">
                            {item.label}
                          </div>
                          <div className="text-xs text-gray-500">
                            {item.description}
                          </div>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>

          {/* Right: Dropped fields */}
          <Droppable droppableId={CANVAS_DROPPABLE}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`rounded-lg border border-dashed p-3 min-h-[200px] transition-all duration-200 ${
                  snapshot.isDraggingOver
                    ? 'border-[#6366F1] bg-[#6366F1]/8 shadow-[0_0_0_4px_rgba(99,102,241,0.10)]'
                    : isDraggingFromSource
                      ? 'border-[#A5B4FC] bg-[#EEF2FF]/60'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <span className="text-sm font-semibold text-gray-700">
                  Application form
                </span>
                <p className="mt-1 text-xs text-gray-500">
                  Drag fields here to add them to the form.
                </p>
                {isDraggingFromSource && (
                  <div className="mt-3 rounded-md border border-dashed border-[#6366F1]/50 bg-[#6366F1]/5 px-3 py-2 text-xs text-[#4F46E5] animate-pulse">
                    Drop here to create and configure your field
                  </div>
                )}
                <div className="mt-3 space-y-2">
                  {questions.map((q, index) => (
                    <Draggable
                      key={q.id || index}
                      draggableId={q.id || String(index)}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`flex items-center gap-2 rounded-lg border bg-white p-3 cursor-grab active:cursor-grabbing transition-all duration-200 ${
                            snapshot.isDragging
                              ? 'opacity-90 shadow-lg ring-2 ring-[#6366F1] cursor-grabbing'
                              : recentlyDroppedQuestionId === q.id
                                ? 'border-[#818CF8] shadow-md ring-2 ring-[#C7D2FE] scale-[1.01]'
                              : 'border-gray-200'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 flex-1 min-w-0">
                            <Checkbox
                              checked={q.required}
                              onChange={(e) =>
                                updateQuestion(
                                  index,
                                  'required',
                                  e.target.checked,
                                )
                              }
                            />
                            <Input
                              value={q.question}
                              onChange={(e) =>
                                updateQuestion(
                                  index,
                                  'question',
                                  e.target.value,
                                )
                              }
                              placeholder="Field label"
                              className="flex-1"
                              size="small"
                            />
                            <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600 shrink-0">
                              {getTypeLabel(q.fieldType)}
                            </span>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                </div>
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      </DragDropContext>
    </>
  );
};

export default ApplicationFormDragDrop;
