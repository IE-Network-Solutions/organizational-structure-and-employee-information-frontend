'use client';
import React from 'react';
import { Form, Input, Row, Col, Select } from 'antd';
import { CloseOutlined, PlusCircleFilled } from '@ant-design/icons';
import OptionInput from '../OptionInput';

const { Option } = Select;

interface QuestionFormProps {
  questions: any[];
  handleTypeChange: (value: string, questionId: number) => void;
  updateQuestion: (questionId: number, updates: any) => void;
  handleOptionChange: (
    value: string,
    questionId: number,
    optionIndex: number,
  ) => void;
}

const QuestionForm: React.FC<QuestionFormProps> = ({
  questions,
  handleTypeChange,
  updateQuestion,
  handleOptionChange,
}) => {
  return (
    <Form layout="vertical">
      {questions.map((question, index) => (
        <div key={question.id} className="mb-6">
          <Form.Item
            required
            label={
              <span className="text-md font-semibold text-gray-700">
                Custom Field Name
              </span>
            }
          >
            <Input allowClear size="large" placeholder="Enter Name" />
          </Form.Item>
          <Row gutter={[16, 24]}>
            <Col lg={8} md={10} xs={24}>
              <Form.Item
                required
                label={
                  <span className="text-md font-semibold text-gray-700">
                    Field Type
                  </span>
                }
              >
                <Select
                  value={question.type}
                  onChange={(value) => handleTypeChange(value, question.id)}
                  className="w-full"
                >
                  <Option value="Multiple Choice">Multiple Choice</Option>
                  <Option value="Checkbox">Checkbox</Option>
                  <Option value="Short Text">Short Text</Option>
                  <Option value="Paragraph">Paragraph</Option>
                  <Option value="Time">Time</Option>
                  <Option value="Dropdown">Dropdown</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col lg={8} md={10} xs={24}>
              <Form.Item
                required
                label={
                  <span className="text-md font-semibold text-gray-700">
                    Question
                  </span>
                }
              >
                <Input
                  placeholder="Enter your question here"
                  value={question.question}
                  onChange={(e) =>
                    updateQuestion(question.id, {
                      question: e.target.value,
                    })
                  }
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.List
            name={`options_${question.id}`}
            initialValue={question.options}
          >
            {(fields, { add, remove }) => (
              <>
                {fields.map((field, optionIndex) => (
                  <Form.Item key={field.key} className="mb-2">
                    <div className="flex items-center">
                      <OptionInput
                        question={question}
                        optionIndex={optionIndex}
                        value={question.options[optionIndex]}
                        onChange={(value) =>
                          handleOptionChange(value, question.id, optionIndex)
                        }
                      />
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
                      <PlusCircleFilled
                        className="ml-2 text-blue-600 text-xl cursor-pointer"
                        onClick={() => add()}
                      />
                    </div>
                  </Form.Item>
                ))}
              </>
            )}
          </Form.List>
        </div>
      ))}
    </Form>
  );
};

export default QuestionForm;
