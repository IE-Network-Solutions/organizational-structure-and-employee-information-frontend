'use client';
import React from 'react';
import {
  Form,
  Input,
  Select,
  Button,
  Modal,
  Checkbox,
  TimePicker,
  Radio,
  Space,
  Row,
  Col,
} from 'antd';
import {
  CloseOutlined,
  MinusCircleOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useDynamicFormStore } from '@/store/uistate/features/feedback/dynamicForm';
import NotificationMessage from '@/components/common/notification/notificationMessage';

const { TextArea } = Input;
const { Option } = Select;

const CreateQuestions: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [form] = Form.useForm();

  const {
    questions,
    addQuestion,
    updateQuestion,
    updateOption,
    deleteQuestion,
  } = useDynamicFormStore();

  const handleTypeChange = (value: string, questionId: number) => {
    updateQuestion(questionId, { type: value });
  };

  const handleQuestionChange = (value: string, questionId: number) => {
    updateQuestion(questionId, { question: value });
  };

  const handleOptionChange = (
    value: string,
    questionId: number,
    optionIndex: number,
  ) => {
    updateOption(questionId, optionIndex, value);
  };

  const handleDeleteQuestion = (questionId: number) => {
    deleteQuestion(questionId);
  };

  const renderOptionInput = (type: any) => {
    switch (type) {
      case 'multiple_choice':
        return <Radio className="mr-2" />;
      case 'checkbox':
        return <Checkbox className="mr-2" />;
      default:
        return null;
    }
  };

  const onFinish = () => {
    console.log((e: any) => {
      e;
    });
  };

  return (
    <Form
      form={form}
      name="dependencies"
      autoComplete="off"
      style={{ maxWidth: '100%' }}
      layout="vertical"
      onFinish={(e) => {
        console.log(e);
      }}
      onFinishFailed={() =>
        NotificationMessage.error({
          message: 'Something wrong or unfilled',
          description: 'please back and check the unfilled fields',
        })
      }
    >
      <Form.List name="questions">
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name, ...restField }) => (
              <>
                <Space
                  key={key}
                  align="baseline"
                  className="flex flex-col mb-2 "
                >
                  <div className="text-md font-semibold text-gray-800 mb-2 block">
                    Question
                    <span className="text-red-500">*</span>
                  </div>
                  <div className="flex items-center sm:flex-col gap-2">
                    <Form.Item
                      label=""
                      name={[name, 'name']}
                      rules={[
                        {
                          required: true,
                          message: 'This field is required',
                        },
                      ]}
                      className="mb-0 flex-grow"
                    >
                      <div className="flex items-center">
                        <Input
                          placeholder="Enter your question here"
                          allowClear
                          className="flex-grow w-80"
                        />
                      </div>
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'type']}
                      className="mb-0 flex-grow"
                    >
                      <Select className="ml-5 w-40" placeholder="Select type">
                        <Option value="multiple_choice">Multiple Choice</Option>
                        <Option value="checkbox">Checkbox</Option>
                        <Option value="short_text">Short Text</Option>
                        <Option value="paragraph">Paragraph</Option>
                        <Option value="time">Time</Option>
                      </Select>
                    </Form.Item>
                    <MinusCircleOutlined onClick={() => remove(name)} />
                  </div>
                </Space>
                <Form.List
                  name={[name, 'options']}
                  rules={[
                    {
                      validator: async (_, names) => {
                        const type = form?.getFieldValue([
                          'questions',
                          name,
                          'type',
                        ]);
                        const minLength = type === 'multiple_choice' ? 2 : 1;
                        if (!names || names.length < minLength) {
                          return Promise.reject(
                            new Error(
                              `At least ${minLength} option(s) are required`,
                            ),
                          );
                        }
                      },
                    },
                  ]}
                >
                  {(fields, { add, remove }, { errors }) => {
                    const questionType = form?.getFieldValue([
                      'questions',
                      name,
                      'type',
                    ]);
                    console.log(questionType);
                    return (
                      <div className="ml-8">
                        {fields.map((field, index) => (
                          <Form.Item
                            label={index === 0 ? 'Answer Options' : ''}
                            required={false}
                            key={field.key}
                          >
                            <div className="flex items-center gap-3">
                              <Form.Item
                                {...field}
                                validateTrigger={['onChange', 'onBlur']}
                                rules={[
                                  {
                                    required: true,
                                    whitespace: true,
                                    message:
                                      'Please input something or delete this field.',
                                  },
                                ]}
                                noStyle
                              >
                                {renderOptionInput(questionType)}
                                <Input placeholder="" />
                              </Form.Item>
                              {fields.length > 1 ? (
                                <MinusCircleOutlined
                                  className="dynamic-delete-button"
                                  onClick={() => remove(field.name)}
                                />
                              ) : null}
                            </div>
                          </Form.Item>
                        ))}
                        <Form.Item>
                          <div
                            onClick={() => add()}
                            className="w-6 h-6 flex items-center justify-center rounded-full bg-primary mx-2 cursor-pointer"
                          >
                            <PlusOutlined size={30} className="text-white" />
                          </div>
                        </Form.Item>
                      </div>
                    );
                  }}
                </Form.List>
              </>
            ))}
            <Form.Item>
              <div className="flex flex-col items-center justify-center my-8">
                <div
                  className="rounded-full bg-primary w-8 h-8 flex items-center justify-center"
                  onClick={() => add()}
                >
                  <PlusOutlined size={30} className="text-white" />
                </div>
                <p className="text-xs font-light text-gray-400">
                  {' '}
                  Add Question
                </p>
              </div>
            </Form.Item>
          </>
        )}
      </Form.List>
      <Form.Item>
        {/* <div className="flex flex-col items-center justify-center"> */}
        <Button
          htmlType="submit"
          className="py-1 px-12 h-8 flex item-center justify-center bg-primary text-white"
        >
          Save Draft
        </Button>
        {/* </div> */}
      </Form.Item>
    </Form>
    /* {questions.map((question, index) => (
        <Form.Item name="question">
          <div key={index} className="mb-8">
            <div className="flex items-center  justify-center mb-2">
              <Form.Item
                label={
                  <span className="text-md font-semibold text-gray-800 mb-2 block">
                    Question {index + 1}
                    <span className="text-red-500 ml-1">*</span>
                  </span>
                }
                name="name"
                rules={[{ required: true, message: 'This field is required' }]}
                className="mb-0 flex-grow"
              >
                <div className="flex items-center">
                  <Input
                    placeholder="Enter your question here"
                    allowClear
                    value={question.question}
                    onChange={(e) =>
                      handleQuestionChange(e.target.value, question.id)
                    }
                    className="flex-grow "
                  />
                </div>
              </Form.Item>
              <Form.Item name="type">
                <Select
                  value={question.type}
                  onChange={(value) => handleTypeChange(value, question.id)}
                  className="ml-4 w-40"
                >
                  <Option value="multiple_choice">Multiple Choice</Option>
                  <Option value="checkbox">Checkbox</Option>
                  <Option value="short_text">Short Text</Option>
                  <Option value="paragraph">Paragraph</Option>
                  <Option value="time">Time</Option>
                  <Option value="dropdown">Dropdown</Option>
                  <Option value="radio">Radio</Option>
                </Select>
              </Form.Item>

              <Button
                type="text"
                icon={<CloseOutlined />}
                className="ml-2 w-5 h-5 text-primary text-xs font-extrabold rounded-full border-primary border-4"
                onClick={() => handleDeleteQuestion(question.id)}
              />
            </div>

            <Form.List
              name={`options_${question.id}`}
              // initialValue={question.options}
              initialValue={[{}]}
            >
              {(fields, { add, remove }) => (
                <>
                  {fields.map((field, optionIndex) => (
                    <Form.Item
                      key={field.key}
                      name={field.name}
                      className="mb-2 mx-8"
                    >
                      <div className="flex items-center justify-center w-full">
                        {renderOptionInput(question, optionIndex)}
                        {[
                          'multiple_choice',
                          'checkbox',
                          'short_text',
                          'paragraph',
                          'time',
                          'dropdown',
                          'radio',
                        ].includes(question.type) && (
                          <div
                            onClick={() => remove(field.name)}
                            className="ml-2 w-5 h-5 text-primary text-[10px] font-extrabold rounded-full border-primary border-4"
                          >
                            <CloseOutlined size={30} className="text-primary" />
                          </div>
                        )}
                      </div>
                    </Form.Item>
                  ))}
                  {[
                    'multiple_choice',
                    'checkbox',
                    'short_text',
                    'paragraph',
                    'time',
                    'dropdown',
                    'radio',
                  ].includes(question.type) &&
                    (fields.length === 0 ||
                      fields[fields.length - 1].name === fields.length - 1) && (
                      <Form.Item>
                        <div
                          onClick={() => add()}
                          className="w-6 h-6 flex items-center justify-center rounded-full bg-primary mx-2 cursor-pointer"
                        >
                          <PlusOutlined size={30} className="text-white" />
                        </div>
                      </Form.Item>
                    )}
                </>
              )}
            </Form.List>
          </div>
        </Form.Item>
      ))} */
    /* <Form.Item>
        <div className="flex flex-col items-center justify-center my-8">
          <div
            className="rounded-full bg-primary w-8 h-8 flex items-center justify-center"
            onClick={addQuestion}
          >
            <PlusOutlined size={30} className="text-white" />
          </div>
          <p className="text-xs font-light text-gray-400"> Add Question</p>
        </div>
      </Form.Item> */
  );
};

export default CreateQuestions;
