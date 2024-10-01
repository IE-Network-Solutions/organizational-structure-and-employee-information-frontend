'use client';
import React from 'react';
import CustomDrawerLayout from '@/components/common/customDrawer';
import { useCustomQuestionTemplateStore } from '@/store/uistate/features/feedback/settings';
import { Form, Input, Select, Button, Checkbox, Row, Col, Radio } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import { useCreateQuestionTemplate } from '@/store/server/features/feedback/settings/mutation';
import { useDebounce } from '@/utils/useDebounce';
import { v4 as uuidv4 } from 'uuid';
import { FieldType } from '@/types/enumTypes';

const { Option } = Select;

const QuestionTemplateDrawer: React.FC<any> = (props) => {
  const [form] = Form.useForm();

  const { isOpen, setIsOpen } = useCustomQuestionTemplateStore();

  const { mutate: createQuestion } = useCreateQuestionTemplate();
  const { addTemplateQuestion, templateQuestions } =
    useCustomQuestionTemplateStore();
  const handleQuestionStateUpdate = useDebounce(addTemplateQuestion, 1500);

  const handlePublish = async () => {
    try {
      const formattedValue = {
        customFieldName: templateQuestions?.customFieldName,
        fieldType: templateQuestions?.fieldType,
        question: templateQuestions?.question,
        required: templateQuestions?.required || false,
        field: templateQuestions?.field?.map((value: any) => {
          return {
            value,
            id: uuidv4(),
          };
        }),
      };

      createQuestion(formattedValue);
      setIsOpen(false);
      form.resetFields();
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

  const drawerHeader = (
    <div className="flex justify-center text-xl font-extrabold text-gray-800 p-4">
      Create New Field
    </div>
  );

  return (
    isOpen && (
      <CustomDrawerLayout
        open={isOpen}
        onClose={props?.onClose}
        modalHeader={drawerHeader}
        width="40%"
      >
        <div className="pb-[60px]">
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
                      <Select allowClear placeholder="Select type">
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
                      rules={[
                        { required: true, message: 'This field is required' },
                      ]}
                    >
                      <Input
                        placeholder="Enter your question here"
                        allowClear
                      />
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
                      /* eslint-disable @typescript-eslint/naming-convention */
                      validator: async (_, names) => {
                        /* eslint-enable @typescript-eslint/naming-convention */
                        const type = form?.getFieldValue('fieldType');
                        if (
                          type === FieldType.MULTIPLE_CHOICE ||
                          type === FieldType.CHECKBOX
                        ) {
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
                            initialValue={{
                              fieldType: '',
                              question: '',
                              field: [],
                              customFieldName: '',
                              required: false,
                            }}
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
                              {fields.length > 0 && (
                                <MinusCircleOutlined
                                  className="dynamic-delete-button"
                                  onClick={() => remove(field.name)}
                                />
                              )}
                            </div>
                          </Form.Item>
                        ))}

                        {questionType === 'multiple_choice' ||
                        questionType === FieldType.CHECKBOX ? (
                          <Form.Item>
                            <div className="flex flex-col items-center justify-center">
                              <div
                                onClick={() => add()}
                                className="w-6 h-6 flex items-center justify-center rounded-full bg-primary cursor-pointer"
                              >
                                <PlusOutlined
                                  size={30}
                                  className="text-white"
                                />
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
                  <div className="flex justify-center absolute w-full bg-[#fff] px-6 py-6 gap-8">
                    <Button
                      onClick={() => setIsOpen(false)}
                      className="flex justify-center text-sm font-medium text-gray-800 bg-white p-4 px-10 h-12 hover:border-gray-500 border-gray-300"
                    >
                      Cancel
                    </Button>
                    <Button
                      htmlType="submit"
                      className="flex justify-center text-sm font-medium text-white bg-primary p-4 px-10 h-12"
                    >
                      Create
                    </Button>
                  </div>
                </Form.Item>
              </div>
            </div>
          </Form>
        </div>
      </CustomDrawerLayout>
    )
  );
};

export default QuestionTemplateDrawer;
