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
  const [form] = Form.useForm();
  const { mutate: createConversationQuestionSet, isLoading: createIsLoading } =
    useAddQuestionSetOnConversationType();
  const { mutate: updateConversationQuestionSet, isLoading: updateIsLoading } =
    useUpdateQuestionSetWithQuestionsOnConversationType();

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
          FieldType.CHECKBOX,
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
      <div style={{ marginTop: '8px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <p>Options:</p>
          {q.field?.length < 2 && (
            <p style={{ color: 'red', fontSize: '12px', margin: 0 }}>
              At least 2 options are required
            </p>
          )}
        </div>
        {q?.field?.map((opt: any) => (
          <Space key={opt.id} align="baseline" style={{ marginBottom: '8px' }}>
            <Input
              placeholder="Enter option value"
              required
              value={opt.value}
              onChange={(e) => handleChangeOption(q.id, opt.id, e.target.value)}
            />
            <MinusCircleOutlined
              onClick={() => handleRemoveOption(q.id, opt.id)}
              style={{
                color: 'red',
                cursor: q.field.length <= 2 ? 'not-allowed' : 'pointer',
              }}
              disabled={q.field.length <= 2}
            />
          </Space>
        ))}
        <Button
          type="dashed"
          onClick={() => handleAddOption(q.id)}
          icon={<PlusOutlined />}
          style={{ marginTop: '8px', display: 'inline-block' }}
        >
          Add Option
        </Button>
      </div>
    );
  };

  return (
    <Form
      layout="vertical"
      form={form} // Bind the form instance
      onFinish={handleSubmit}
    >
      <Form.Item
        label="Name"
        name="name"
        rules={[{ required: true, message: 'Please enter a name' }]}
      >
        <Input />
      </Form.Item>
      {editableData !== null && (
        <>
          <Form.Item
            hidden
            name="id"
            rules={[{ required: true, message: 'Please enter a name' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            hidden
            name="conversationTypeId"
            rules={[{ required: true, message: 'Please enter a name' }]}
          >
            <Input />
          </Form.Item>
        </>
      )}

      <Form.Item
        label="Is Active"
        name="active"
        initialValue={true}
        rules={[
          {
            required: true,
            message: 'Please check if you want to activate this question set.',
          },
        ]}
      >
        <Switch />
      </Form.Item>

      <Form.Item
        label="Questions"
        name="questions"
        required
        rules={[{ validator: checkQuestions }]}
      >
        {questions?.map((q: any) => (
          <div key={q.id} style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', marginBottom: '8px' }}>
              <Input
                placeholder="Enter question"
                value={q.question}
                onChange={(e) =>
                  handleChangeQuestion(q.id, 'question', e.target.value)
                }
                style={{ flex: 1, marginRight: '8px' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Select
                placeholder="Select Field Type"
                value={q.fieldType}
                onChange={(value) =>
                  handleChangeQuestion(q.id, 'fieldType', value)
                }
                style={{ flex: 1 }}
              >
                <Option value={FieldType.MULTIPLE_CHOICE}>
                  Multiple Choice
                </Option>
                <Option value={FieldType.CHECKBOX}>Check Box</Option>
                <Option value={FieldType.SHORT_TEXT}>Short Text</Option>
                <Option value={FieldType.PARAGRAPH}>Paragraph</Option>
                <Option value={FieldType.TIME}>Time</Option>
                <Option value={FieldType.DROPDOWN}>Dropdown</Option>
                <Option value={FieldType.RADIO}>Radio</Option>
              </Select>

              <Checkbox
                checked={q.mandatory}
                onChange={(e) =>
                  handleChangeQuestion(q.id, 'mandatory', e.target.checked)
                }
              >
                Required
              </Checkbox>

              <MinusCircleOutlined
                onClick={() => handleRemoveQuestion(q.id)}
                style={{ color: 'red', fontSize: '16px' }}
              />
            </div>

            {/* Options (Visible Only for Certain Field Types) */}
            {renderOptionsSection(q)}
          </div>
        ))}

        <Button
          type="dashed"
          onClick={handleAddQuestion}
          icon={<PlusOutlined />}
          style={{ width: '100%' }}
        >
          Add Question
        </Button>
      </Form.Item>

      <Form.Item>
        <div className="flex justify-center space-x-4">
          {editableData === null ? (
            <Button type="primary" loading={createIsLoading} htmlType="submit">
              Submit
            </Button>
          ) : (
            <Button type="primary" loading={updateIsLoading} htmlType="submit">
              Update
            </Button>
          )}
          <Popconfirm
            title="Are you sure you want to reset the form?"
            onConfirm={() => {
              setQuestions([]);
              form.resetFields();
            }} // Reset form fields on confirmation
            okText="Yes"
            cancelText="No"
          >
            <Button type="default">Reset</Button>
          </Popconfirm>
        </div>
      </Form.Item>
    </Form>
  );
};

export default QuestionSetForm;
