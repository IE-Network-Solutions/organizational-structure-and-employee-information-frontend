import React, { useEffect } from 'react';
import {
  Form,
  Input,
  Button,
  Select,
  Checkbox,
  Space,
  Switch,
  Popconfirm,
} from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { v4 as uuidv4 } from 'uuid';
import { FieldType } from '@/types/enumTypes';
import { ConversationStore } from '@/store/uistate/features/conversation';
import {
  useAddQuestionSetOnConversationType,
  useUpdateQuestionSetWithQuestionsOnConversationType,
} from '@/store/server/features/CFR/conversation/mutation';
import { useConversationTypes } from '@/store/server/features/conversation/queries';
import { ConversationTypeItems } from '@/store/server/features/CFR/conversation/action-plan/interface';
import CustomDrawerLayout from '@/components/common/customDrawer';

const { Option } = Select;
const QuestionSetForm = () => {
  const {
    activeTab,
    editableData,
    setEditableData,
    setOpen,
    questions,
    setQuestions,
  } = ConversationStore();
  const { open } = ConversationStore();

  const [form] = Form.useForm();
  const { mutate: createConversationQuestionSet, isLoading: createIsLoading } =
    useAddQuestionSetOnConversationType();
  const { mutate: updateConversationQuestionSet, isLoading: updateIsLoading } =
    useUpdateQuestionSetWithQuestionsOnConversationType();
  const { data: getAllConversationType } = useConversationTypes();

  const handleAddQuestion = () => {
    const currentQuestions = questions;

    const updatedQuestions = [
      ...currentQuestions,
      {
        id: uuidv4(),
        conversationTypeId: activeTab,
        question: '',
        fieldType: FieldType.SHORT_TEXT,
        field: [],
        required: false,
        action: null,
      },
    ];
    setQuestions(updatedQuestions);
  };

  const handleRemoveQuestion = (id: any) => {
    const filteredQuestions = questions.filter((q: any) => q.id !== id);
    setQuestions(filteredQuestions);
  };

  const handleChangeQuestion = (id: any, key: any, value: any) => {
    const currentQuestions = questions;
    const updatedQuestions = currentQuestions.map((q: any) => {
      if (q.id === id) {
        const requiresOptions = [
          FieldType.DROPDOWN,
          FieldType.MULTIPLE_CHOICE,
          FieldType.CHECKBOX,
          FieldType.RADIO,
          ,
        ].includes(value);

        // If switching to a field type that requires options, add two empty options
        if (
          key === 'fieldType' &&
          requiresOptions &&
          (!q.field || q.field.length === 0)
        ) {
          return {
            ...q,
            [key]: value,
            field: [
              { id: uuidv4(), value: '' },
              { id: uuidv4(), value: '' },
            ],
          };
        }
        return { ...q, [key]: value };
      }
      return q;
    });
    setQuestions(updatedQuestions);
  };

  const activeTabName =
    getAllConversationType?.items?.find(
      (item: ConversationTypeItems) => item.id === activeTab,
    )?.name || '';

  const handleAddOption = (questionId: any) => {
    const currentQuestions = questions;
    const updatedQuestions = currentQuestions.map((q: any) =>
      q.id === questionId
        ? {
            ...q,
            field: [...q.field, { id: uuidv4(), value: '' }],
          }
        : q,
    );
    setQuestions(updatedQuestions);
  };

  const handleChangeOption = (questionId: any, optionId: any, value: any) => {
    const currentQuestions = questions;
    const updatedQuestions = currentQuestions.map((q: any) =>
      q.id === questionId
        ? {
            ...q,
            field: q.field.map((opt: any) =>
              opt.id === optionId ? { ...opt, value } : opt,
            ),
          }
        : q,
    );
    setQuestions(updatedQuestions);
  };

  const handleRemoveOption = (questionId: any, optionId: any) => {
    const currentQuestions = questions;
    const question = currentQuestions.find((q: any) => q.id === questionId);

    // Prevent removing if only 2 options remain
    if (question?.field?.length <= 2) {
      return;
    }

    const updatedQuestions = currentQuestions.map((q: any) =>
      q.id === questionId
        ? {
            ...q,
            field: q.field.filter((opt: any) => opt.id !== optionId),
          }
        : q,
    );
    setQuestions(updatedQuestions);
  };

  const modalHeader = (
    <div
      className="flex justify-center text-xl font-extrabold text-gray-800 p-4"
      data-cy="question-set-form-header"
      id="questionSetFormHeader"
    >
      Add New {activeTabName}
    </div>
  );

  const handleSubmit = (values: any) => {
    const payload = { ...values, conversationTypeId: activeTab, questions };
    if (editableData !== null) {
      updateConversationQuestionSet(payload, {
        onSuccess: () => {
          setEditableData(null);
          setQuestions([]);
          form.resetFields();
        },
      });
    } else {
      createConversationQuestionSet(payload, {
        onSuccess: () => {
          form.resetFields();
          setQuestions([]);
          setOpen(false);
        },
      });
    }
  };

  useEffect(() => {
    if (!editableData) {
      form.resetFields();
      setQuestions([]);
      return;
    }
    if (editableData !== null) {
      setQuestions(editableData.conversationsQuestions || []);
      form.setFieldsValue({
        name: editableData.name || '',
        id: editableData.id || '',
        active: editableData.active ?? true,
        conversationTypeId: editableData.conversationTypeId || '',
        conversationsQuestions: editableData.conversationsQuestions || [],
      });
    }

    setQuestions(editableData.conversationsQuestions || []);

    form.setFieldsValue({
      name: editableData.name || '',
      id: editableData.id || '',
      active: editableData.active ?? true,
      conversationTypeId: editableData.conversationTypeId || '',
      conversationsQuestions: editableData.conversationsQuestions || [],
    });
  }, [editableData, form]);

  const checkQuestions = () => {
    if (questions && questions.length > 0) {
      const hasEmptyQuestion = questions.some((q: any) => !q.question.trim());
      if (hasEmptyQuestion) {
        return Promise.reject(new Error('Question text cannot be empty.'));
      }

      // Check if options are required and present (at least 2)
      const hasInvalidOptions = questions.some((q: any) => {
        const requiresOptions = [
          FieldType.DROPDOWN,
          FieldType.MULTIPLE_CHOICE,
          FieldType.RADIO,
        ].includes(q.fieldType);

        return requiresOptions && (!q.field || q.field.length < 2);
      });

      if (hasInvalidOptions) {
        return Promise.reject(
          new Error(
            'Questions with Dropdown, Multiple Choice, or Radio types must have at least two options.',
          ),
        );
      }

      return Promise.resolve();
    }
    return Promise.reject(new Error('You must add at least one question.'));
  };

  // Add this section where the options are rendered
  const renderOptionsSection = (q: any) => {
    const requiresOptions = [
      FieldType.DROPDOWN,
      FieldType.CHECKBOX,
      FieldType.MULTIPLE_CHOICE,
      FieldType.RADIO,
    ].includes(q.fieldType);

    if (!requiresOptions) return null;

    return (
      <div
        style={{ marginTop: '8px' }}
        data-cy={`question-set-form-question-options-${q.id}`}
        id={`questionSetFormQuestionOptions${q.id}`}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
          data-cy={`question-set-form-question-options-header-${q.id}`}
          id={`questionSetFormQuestionOptionsHeader${q.id}`}
        >
          <p
            data-cy={`question-set-form-question-options-label-${q.id}`}
            id={`questionSetFormQuestionOptionsLabel${q.id}`}
          >
            Options:
          </p>
          {q.field?.length < 2 && (
            <p
              style={{ color: 'red', fontSize: '12px', margin: 0 }}
              data-cy={`question-set-form-question-options-warning-${q.id}`}
              id={`questionSetFormQuestionOptionsWarning${q.id}`}
            >
              At least 2 options are required
            </p>
          )}
        </div>
        {q?.field?.map((opt: any) => (
          <Space
            key={opt.id}
            align="baseline"
            style={{ marginBottom: '8px' }}
            data-cy={`question-set-form-question-option-${q.id}-${opt.id}`}
            id={`questionSetFormQuestionOption${q.id}${opt.id}`}
          >
            <Input
              placeholder="Enter option value"
              required
              value={opt.value}
              onChange={(e) => handleChangeOption(q.id, opt.id, e.target.value)}
              data-cy={`question-set-form-question-option-input-${q.id}-${opt.id}`}
              id={`questionSetFormQuestionOptionInput${q.id}${opt.id}`}
            />
            <MinusCircleOutlined
              onClick={() => handleRemoveOption(q.id, opt.id)}
              style={{
                color: 'red',
                cursor: q.field.length <= 2 ? 'not-allowed' : 'pointer',
              }}
              disabled={q.field.length <= 2}
              data-cy={`question-set-form-question-option-remove-${q.id}-${opt.id}`}
              id={`questionSetFormQuestionOptionRemove${q.id}${opt.id}`}
            />
          </Space>
        ))}
        <Button
          type="dashed"
          onClick={() => handleAddOption(q.id)}
          icon={<PlusOutlined />}
          style={{ marginTop: '8px', display: 'inline-block' }}
          data-cy={`question-set-form-question-add-option-button-${q.id}`}
          id={`questionSetFormQuestionAddOptionButton${q.id}`}
        >
          Add Option
        </Button>
      </div>
    );
  };

  return (
    <CustomDrawerLayout
      rootClassName="cfr-feedback-settings-drawer"
      open={open && activeTabName !== ''}
      onClose={() => setOpen(false)}
      modalHeader={modalHeader}
      footer={
        <Form.Item
          data-cy="question-set-form-footer"
          id="questionSetFormFooter"
        >
          <div
            className="w-full bg-[#fff] absolute flex justify-center space-x-5 mt-5"
            data-cy="question-set-form-actions"
            id="questionSetFormActions"
          >
            <Popconfirm
              title="Are you sure you want to reset the form?"
              onConfirm={() => {
                setQuestions([]);
                setEditableData(null);
                form.resetFields();
              }}
              okText="Yes"
              cancelText="No"
              data-cy="question-set-form-reset-confirm"
              id="questionSetFormResetConfirm"
            >
              <Button
                type="default"
                data-cy="question-set-form-reset-button"
                id="questionSetFormResetButton"
              >
                Reset
              </Button>
            </Popconfirm>
            {editableData === null ? (
              <Button
                type="primary"
                loading={createIsLoading}
                onClick={() => form.submit()}
                data-cy="question-set-form-submit-button"
                id="questionSetFormSubmitButton"
              >
                Submit
              </Button>
            ) : (
              <Button
                type="primary"
                loading={updateIsLoading}
                onClick={() => form.submit()}
                data-cy="question-set-form-update-button"
                id="questionSetFormUpdateButton"
              >
                Update
              </Button>
            )}
          </div>
        </Form.Item>
      }
      width="40%"
      data-cy="question-set-form-drawer"
    >
      <Form
        layout="vertical"
        form={form}
        onFinish={handleSubmit}
        requiredMark={false}
        data-cy="question-set-form"
        id="questionSetForm"
      >
        <Form.Item
          label={
            <span data-cy="question-set-form-name-label">
              Name{' '}
              <span
                style={{ color: 'red' }}
                data-cy="question-set-form-name-required"
              >
                *
              </span>
            </span>
          }
          name="name"
          rules={[{ required: true, message: 'Please enter a name' }]}
          data-cy="question-set-form-name-field"
          id="questionSetFormNameField"
        >
          <Input
            data-cy="question-set-form-name-input"
            id="questionSetFormNameInput"
          />
        </Form.Item>
        {editableData !== null && (
          <>
            <Form.Item
              hidden
              name="id"
              rules={[{ required: true, message: 'Please enter a name' }]}
              data-cy="question-set-form-id-field"
              id="questionSetFormIdField"
            >
              <Input />
            </Form.Item>
            <Form.Item
              hidden
              name="conversationTypeId"
              rules={[{ required: true, message: 'Please enter a name' }]}
              data-cy="question-set-form-conversation-type-id-field"
              id="questionSetFormConversationTypeIdField"
            >
              <Input
                data-cy="question-set-form-conversation-type-id-input"
                id="questionSetFormConversationTypeIdInput"
              />
            </Form.Item>
          </>
        )}

        <Form.Item
          label={
            <span data-cy="question-set-form-active-label">
              Is Active{' '}
              <span
                style={{ color: 'red' }}
                data-cy="question-set-form-active-required"
              >
                *
              </span>
            </span>
          }
          name="active"
          initialValue={true}
          rules={[
            {
              required: true,
              message:
                'Please check if you want to activate this question set.',
            },
          ]}
          data-cy="question-set-form-active-field"
          id="questionSetFormActiveField"
        >
          <Switch
            data-cy="question-set-form-active-switch"
            id="questionSetFormActiveSwitch"
          />
        </Form.Item>

        <Form.Item
          label={
            <span data-cy="question-set-form-questions-label">
              Questions{' '}
              <span
                style={{ color: 'red' }}
                data-cy="question-set-form-questions-required"
              >
                *
              </span>
            </span>
          }
          name="questions"
          required
          rules={[{ validator: checkQuestions }]}
          data-cy="question-set-form-questions-field"
          id="questionSetFormQuestionsField"
        >
          {questions?.map((q: any) => (
            <div
              key={q.id}
              style={{ marginBottom: '16px' }}
              data-cy={`question-set-form-question-${q.id}`}
              id={`questionSetFormQuestion${q.id}`}
            >
              <div
                style={{ display: 'flex', marginBottom: '8px' }}
                data-cy={`question-set-form-question-input-container-${q.id}`}
                id={`questionSetFormQuestionInputContainer${q.id}`}
              >
                <Input
                  placeholder="Enter question"
                  value={q.question}
                  onChange={(e) =>
                    handleChangeQuestion(q.id, 'question', e.target.value)
                  }
                  style={{ flex: 1, marginRight: '8px' }}
                  data-cy={`question-set-form-question-input-${q.id}`}
                  id={`questionSetFormQuestionInput${q.id}`}
                />
              </div>

              <div
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                data-cy={`question-set-form-question-controls-${q.id}`}
                id={`questionSetFormQuestionControls${q.id}`}
              >
                <Select
                  placeholder="Select Field Type"
                  value={q.fieldType}
                  onChange={(value) =>
                    handleChangeQuestion(q.id, 'fieldType', value)
                  }
                  style={{ flex: 1 }}
                  data-cy={`question-set-form-question-field-type-${q.id}`}
                  id={`questionSetFormQuestionFieldType${q.id}`}
                >
                  <Option
                    value={FieldType.MULTIPLE_CHOICE}
                    data-cy="question-set-form-question-field-type-multiple-choice"
                    id="questionSetFormQuestionFieldTypeMultipleChoice"
                  >
                    Multiple Choice
                  </Option>
                  <Option
                    value={FieldType.CHECKBOX}
                    data-cy="question-set-form-question-field-type-checkbox"
                    id="questionSetFormQuestionFieldTypeCheckbox"
                  >
                    Check Box
                  </Option>
                  <Option
                    value={FieldType.SHORT_TEXT}
                    data-cy="question-set-form-question-field-type-short-text"
                    id="questionSetFormQuestionFieldTypeShortText"
                  >
                    Short Text
                  </Option>
                  <Option
                    value={FieldType.PARAGRAPH}
                    data-cy="question-set-form-question-field-type-paragraph"
                    id="questionSetFormQuestionFieldTypeParagraph"
                  >
                    Paragraph
                  </Option>
                  <Option
                    value={FieldType.TIME}
                    data-cy="question-set-form-question-field-type-time"
                    id="questionSetFormQuestionFieldTypeTime"
                  >
                    Time
                  </Option>
                  <Option
                    value={FieldType.DROPDOWN}
                    data-cy="question-set-form-question-field-type-dropdown"
                    id="questionSetFormQuestionFieldTypeDropdown"
                  >
                    Dropdown
                  </Option>
                  <Option
                    value={FieldType.RADIO}
                    data-cy="question-set-form-question-field-type-radio"
                    id="questionSetFormQuestionFieldTypeRadio"
                  >
                    Radio
                  </Option>
                </Select>

                <Checkbox
                  checked={q.mandatory}
                  onChange={(e) =>
                    handleChangeQuestion(q.id, 'mandatory', e.target.checked)
                  }
                  data-cy={`question-set-form-question-mandatory-${q.id}`}
                  id={`questionSetFormQuestionMandatory${q.id}`}
                >
                  Required
                </Checkbox>

                <MinusCircleOutlined
                  onClick={() => handleRemoveQuestion(q.id)}
                  style={{ color: 'red', fontSize: '16px' }}
                  data-cy={`question-set-form-question-remove-${q.id}`}
                  id={`questionSetFormQuestionRemove${q.id}`}
                />
              </div>

              {/* Options (Visible Only for Certain Field Types) */}
              {renderOptionsSection(q)}
            </div>
          ))}

          <div
            className="feedback-settings-modal-actions w-full"
            data-cy="question-set-form-add-question-button-container"
            id="questionSetFormAddQuestionButtonContainer"
          >
            <Button
              type="dashed"
              onClick={handleAddQuestion}
              icon={<PlusOutlined />}
              className="w-full"
              data-cy="question-set-form-add-question-button"
              id="questionSetFormAddQuestionButton"
            >
              Add Question
            </Button>
          </div>
        </Form.Item>
      </Form>
    </CustomDrawerLayout>
  );
};

export default QuestionSetForm;
