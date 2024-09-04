'use client';
import React from 'react';
import { Form, Input, Select, Button, Modal, Checkbox, TimePicker } from 'antd';
import { CloseOutlined, PlusOutlined } from '@ant-design/icons';
import { useDynamicFormStore } from '@/store/uistate/features/feedback/dynamicForm';

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

  const renderOptionInput = (question: any, field: any, optionIndex: any) => {
    switch (question.type) {
      case 'Multiple Choice':
        return (
          <>
            <div className="w-7 h-7 bg-gray-200 border-[1px] rounded-300 rounded-md flex items-center justify-center mr-2">
              {optionIndex + 1}.
            </div>
            <Input
              placeholder={`Option ${optionIndex + 1}`}
              className="flex-grow w-full"
              value={question.options[optionIndex]}
              onChange={(e) =>
                handleOptionChange(e.target.value, question.id, optionIndex)
              }
            />
          </>
        );
      case 'Checkbox':
        return (
          <>
            <Checkbox className="mr-2" />
            <Input
              placeholder={`Option ${optionIndex + 1}`}
              className="flex-grow w-full"
              value={question.options[optionIndex]}
              onChange={(e) =>
                handleOptionChange(e.target.value, question.id, optionIndex)
              }
            />
          </>
        );
      case 'Short Text':
        return (
          <Input
            placeholder="Short answer text"
            className="w-full"
            value={question.options[optionIndex]}
            onChange={(e) =>
              handleOptionChange(e.target.value, question.id, optionIndex)
            }
          />
        );
      case 'Paragraph':
        return (
          <TextArea
            placeholder="Long answer text"
            className="w-full"
            rows={4}
            value={question.options[optionIndex]}
            onChange={(e) =>
              handleOptionChange(e.target.value, question.id, optionIndex)
            }
          />
        );
      case 'Time':
        return (
          <TimePicker
            className="w-full"
            value={question.options[optionIndex]}
            onChange={(time) =>
              handleOptionChange(
                time ? time.format('HH:mm') : '',
                question.id,
                optionIndex,
              )
            }
          />
        );
      case 'Dropdown':
        return (
          <Select placeholder="Select an option" className="w-full">
            {question.options.map((option: any, index: any) => (
              <Select.Option key={index} value={option}>
                {option}
              </Select.Option>
            ))}
          </Select>
        );
      default:
        return null;
    }
  };

  return (
    <div className="mx-auto">
      <Form form={form} layout="vertical" className="h-auto">
        {questions.map((question, index) => (
          <div key={question.id} className="mb-8">
            <div className="flex items-center  justify-center mb-2">
              <Form.Item
                label={
                  <span className="text-md font-semibold text-gray-800 mb-2 block">
                    Question {index + 1}
                    <span className="text-red-500 ml-1">*</span>
                  </span>
                }
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
                  <Select
                    value={question.type}
                    onChange={(value) => handleTypeChange(value, question.id)}
                    className="ml-4 w-40"
                  >
                    <Option value="Multiple Choice">Multiple Choice</Option>
                    <Option value="Checkbox">Checkbox</Option>
                    <Option value="Short Text">Short Text</Option>
                    <Option value="Paragraph">Paragraph</Option>
                    <Option value="Time">Time</Option>
                    <Option value="Dropdown">Dropdown</Option>
                  </Select>
                </div>
              </Form.Item>
              <Button
                type="text"
                icon={<CloseOutlined />}
                className="ml-2 w-5 h-5 text-primary text-xs font-extrabold rounded-full border-primary border-4"
                onClick={() => handleDeleteQuestion(question.id)}
              />
            </div>

            <Form.List name={`options_${question.id}`} initialValue={[{}]}>
              {(fields, { add, remove }) => (
                <>
                  {fields.map((field, optionIndex) => (
                    <Form.Item key={field.key} className="mb-2 mx-8">
                      <div className="flex items-center justify-center w-full">
                        {renderOptionInput(question, field, optionIndex)}
                        {[
                          'Multiple Choice',
                          'Checkbox',
                          'Dropdown',
                          'Time',
                          'Paragraph',
                          'Short Text',
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
                    'Multiple Choice',
                    'Checkbox',
                    'Dropdown',
                    'Time',
                    'Paragraph',
                    'Short Text',
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
        ))}
        <Form.Item>
          <div className="flex flex-col items-center justify-center my-8">
            <div
              className="rounded-full bg-primary w-8 h-8 flex items-center justify-center"
              onClick={addQuestion}
            >
              <PlusOutlined size={30} className="text-white" />
            </div>
            <p className="text-xs font-light text-gray-400"> Add Question</p>
          </div>
        </Form.Item>
        <Form.Item>
          <div className="flex flex-col items-center justify-center">
            <Button className="py-1 px-12 h-8 flex item-center justify-center bg-primary text-white">
              Save Draft
            </Button>
          </div>
        </Form.Item>
      </Form>
    </div>
  );
};

export default CreateQuestions;
