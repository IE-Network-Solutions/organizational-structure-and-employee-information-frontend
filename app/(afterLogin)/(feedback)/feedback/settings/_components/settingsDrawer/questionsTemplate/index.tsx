'use client';

import React from 'react';
import { Form, Input, Select, Button, Checkbox, Row, Col, Radio } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import { useCreateQuestionTemplate } from '@/store/server/features/feedback/settings/mutation';
import { useDebounce } from '@/utils/useDebounce';
import { useCustomQuestionTemplateStore } from '@/store/uistate/features/feedback/settings';
import { v4 as uuidv4 } from 'uuid';

const { Option } = Select;

const QuestionsTemplate: React.FC = () => {
  const [form] = Form.useForm();

  const { mutate: createQuestion } = useCreateQuestionTemplate();
  const { addTemplateQuestion, templateQuestions } =
    useCustomQuestionTemplateStore();
  const handleQuestionStateUpdate = useDebounce(addTemplateQuestion, 1500);

  const handlePublish = async () => {
    try {
      const formattedValue = {
        customFieldName: templateQuestions.customFieldName,
        fieldType: templateQuestions.fieldType,
        question: templateQuestions.customFieldName,
        required: templateQuestions.required,
        field: templateQuestions.field.map((value: any) => {
          return {
            value,
            id: uuidv4(),
          };
        }),
      };
      console.log('formattedValue', formattedValue);

      createQuestion(formattedValue);
    } catch (error) {
      NotificationMessage.error({
        message: 'Publish Failed',
        description: 'There was an error publishing the survey.',
      });
    }
  };

  const renderOptionInput = (type: any) => {
    switch (type) {
      case 'multiple_choice':
        return <Radio className="mr-2" disabled value="" />;
      case 'checkbox':
        return <Checkbox className="mr-2" disabled value="" />;
      default:
        return null;
    }
  };

  return (
    <Form
      form={form}
      name="dependencies"
      autoComplete="off"
      style={{ maxWidth: '100%' }}
      layout="vertical"
      onValuesChange={() => {
        handleQuestionStateUpdate(form.getFieldsValue());
      }}
      onFinish={() => {
        handlePublish();
      }}
    >
      <div className="flex flex-col justify-between">
        <div>
          <Form.Item
            required
            name="customFieldName"
            label={
              <span className="text-md font-semibold text-gray-700">
                Template Title
              </span>
            }
          >
            <Input allowClear size="large" placeholder="Enter Title" />
          </Form.Item>
          <Row gutter={12}>
            <Col lg={8} md={10} xs={24}>
              <Form.Item
                label={
                  <span className="text-md font-semibold text-gray-700">
                    Field Type
                  </span>
                }
                required
                name="fieldType"
              >
                <Select placeholder="Select type">
                  <Option value="multiple_choice">Multiple Choice</Option>
                  <Option value="checkbox">Checkbox</Option>
                  <Option value="short_text">Short Text</Option>
                  <Option value="paragraph">Paragraph</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col lg={16} md={10} xs={24}>
              <Form.Item
                label={
                  <span className="text-md font-semibold text-gray-700">
                    Question
                  </span>
                }
                required
                name="question"
                rules={[{ required: true, message: 'This field is required' }]}
              >
                <Input placeholder="Enter your question here" allowClear />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="required"
            className="mb-2 mt-0 ml-4"
            valuePropName="checked"
          >
            <Checkbox defaultChecked={false}>Is Required</Checkbox>
          </Form.Item>

          <Form.List
            name="field"
            initialValue={[]}
            rules={[
              {
                validator: async (_, names) => {
                  const type = form?.getFieldValue('fieldType');
                  if (type === 'multiple_choice' || type === 'checkbox') {
                    if (!names || names.length < 2) {
                      return Promise.reject(
                        NotificationMessage.error({
                          message: `At least ${2} options are required`,
                          description: 'Please add additional fields.',
                        }),
                      );
                    }
                  }
                },
              },
            ]}
          >
            {(fields, { add, remove }) => {
              const questionType = form.getFieldValue('fieldType');
              return (
                <div className="mx-8">
                  {fields.map((field) => (
                    <Form.Item
                      required={false}
                      key={field.key}
                      initialValue={''}
                    >
                      <div className="flex items-center gap-3">
                        {renderOptionInput(questionType)}
                        <Form.Item
                          {...field}
                          initialValue={[]}
                          rules={[
                            {
                              required: true,

                              message:
                                'Please input something or delete this field.',
                            },
                          ]}
                          noStyle
                        >
                          <Input placeholder="Option" />
                        </Form.Item>
                        {fields.length > 1 && (
                          <MinusCircleOutlined
                            className="dynamic-delete-button"
                            onClick={() => remove(field.name)}
                          />
                        )}
                      </div>
                    </Form.Item>
                  ))}

                  {questionType === 'multiple_choice' ||
                  questionType === 'checkbox' ? (
                    <Form.Item>
                      <div className="flex flex-col items-center justify-center">
                        <div
                          onClick={() => add()}
                          className="w-6 h-6 flex items-center justify-center rounded-full bg-primary cursor-pointer"
                        >
                          <PlusOutlined size={30} className="text-white" />
                        </div>
                        <p className="text-xs font-light text-gray-400 ">
                          Add Option
                        </p>
                      </div>
                    </Form.Item>
                  ) : (
                    <></>
                  )}
                </div>
              );
            }}
          </Form.List>
        </div>
        <div className="mt-40">
          <Form.Item>
            <div className="flex items-center justify-center gap-4">
              <Button
                htmlType="reset"
                className="py-1 px-12 h-8 flex item-center justify-center bg-white text-gary-500"
              >
                Cancel
              </Button>
              <Button
                htmlType="submit"
                className="py-1 px-12 h-8 flex item-center justify-center bg-primary text-white"
              >
                Create
              </Button>
            </div>
          </Form.Item>
        </div>
      </div>
    </Form>
  );
};

export default QuestionsTemplate;
