import React from 'react';
import CustomDrawerLayout from '@/components/common/customDrawer';
import { IoIosInformationCircleOutline } from 'react-icons/io';
import { useDynamicFormStore } from '@/store/uistate/features/feedback/dynamicForm';
import { Form, Input, Select, Button, Checkbox, Radio, Row, Col } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import { useCreateQuestion } from '@/store/server/features/feedback/question/mutation';
import { useDebounce } from '@/utils/useDebounce';
import { v4 as uuidv4 } from 'uuid';

const { Option } = Select;

const Question: React.FC<any> = (props) => {
  const [form] = Form.useForm();
  const { mutate: AddQuestion } = useCreateQuestion();
  const {
    isDrawerOpen,
    questions,
    addQuestion,
    setGeneratedUrl,
    setIsDrawerOpen,
  } = useDynamicFormStore();

  const handleQuestionStateUpdate = useDebounce(addQuestion, 1500);

  const handlePublish = async () => {
    try {
      const formattedValues = {
        formId: props?.selectedFormId,
        questions: questions.map(
          (e: { required: any; field: any[] }, i: number) => {
            return {
              ...e,
              order: i + 1,
              required: e.required,
              field: e.field.map((value: any) => {
                return {
                  value,
                  id: uuidv4(),
                };
              }),
            };
          },
        ),
      };
      AddQuestion(formattedValues);
      const generatedUrl = `${window.location.origin}/questions/${props?.selectedFormId}`;
      setGeneratedUrl(generatedUrl);
      setIsDrawerOpen(false);
      // navigator.clipboard.writeText(generatedUrl);
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
    <div className="flex flex-col items-center justify-center">
      <div className="flex justify-center text-xl font-extrabold text-gray-800 px-4 py-2">
        Create Your Questions
      </div>
      <div className="flex items-center justify-center gap-1 mx-2 mt-0">
        <IoIosInformationCircleOutline size={15} />
        <p className="text-gray-300 text-xs font-light">
          Add common fields when creating questions to save time
        </p>
      </div>
    </div>
  );

  return (
    isDrawerOpen && (
      <>
        <CustomDrawerLayout
          open={isDrawerOpen}
          onClose={props?.onClose}
          modalHeader={drawerHeader}
          width="40%"
        >
          <Form
            form={form}
            name="dependencies"
            autoComplete="off"
            style={{ maxWidth: '100%' }}
            layout="vertical"
            onValuesChange={() => {
              handleQuestionStateUpdate(form.getFieldsValue()?.questions);
            }}
            onFinish={() => {
              handlePublish();
            }}
          >
            <Form.List
              name="questions"
              initialValue={[
                {
                  id: 1,
                  fieldType: '',
                  question: '',
                  required: false,
                  field: [],
                },
              ]}
            >
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }, index) => (
                    <>
                      <div
                        key={index}
                        className="text-md font-semibold text-gray-800 mb-2 block"
                      >
                        Question {index + 1}
                        <span className="text-red-500">*</span>
                      </div>

                      <Row gutter={12} key={key}>
                        <Col lg={16} md={10} xs={24}>
                          <Form.Item
                            label=""
                            name={[name, 'question']}
                            rules={[
                              {
                                required: true,
                                message: 'This field is required',
                              },
                            ]}
                          >
                            <div className="flex items-center">
                              <Input
                                placeholder="Enter your question here"
                                allowClear
                              />
                            </div>
                          </Form.Item>
                        </Col>
                        <Col lg={8} md={10} xs={24}>
                          <Row>
                            <Col lg={16} sm={12} xs={24}>
                              <Form.Item
                                {...restField}
                                name={[name, 'fieldType']}
                              >
                                <Select placeholder="Select type">
                                  <Option value="multiple_choice">
                                    Multiple Choice
                                  </Option>
                                  <Option value="checkbox">Checkbox</Option>
                                  <Option value="short_text">Short Text</Option>
                                  <Option value="paragraph">Paragraph</Option>
                                </Select>
                              </Form.Item>
                            </Col>
                            <Col lg={8} sm={12} xs={24}>
                              <MinusCircleOutlined
                                onClick={() => remove(name)}
                                className="flex items-center justify-center"
                              />
                            </Col>
                          </Row>
                        </Col>
                      </Row>
                      <Form.Item
                        label=""
                        name={[name, 'required']}
                        className="mb-2 mt-0 ml-4"
                        valuePropName="checked"
                      >
                        <div className="flex items-center text-sm">
                          <Checkbox defaultChecked={false}>
                            Is Required
                          </Checkbox>
                        </div>
                      </Form.Item>

                      <Form.List
                        name={[name, 'field']}
                        initialValue={[]}
                        rules={[
                          {
                            /* eslint-disable @typescript-eslint/naming-convention */
                            validator: async (_, names) => {
                              /* eslint-enable @typescript-eslint/naming-convention */
                              const type = form?.getFieldValue([
                                'questions',
                                name,
                                'fieldType',
                              ]);

                              if (
                                type === 'multiple_choice' ||
                                type === 'checkbox'
                              ) {
                                if (!names || names.length < 2) {
                                  return Promise.reject(
                                    NotificationMessage.error({
                                      message: `At least ${2} options are required`,
                                      description:
                                        'Please add additional fields.',
                                    }),
                                  );
                                }
                              }
                            },
                          },
                        ]}
                      >
                        {(fields, { add, remove }) => {
                          const questionType = form?.getFieldValue([
                            'questions',
                            name,
                            'fieldType',
                          ]);
                          return (
                            <div className="ml-8">
                              {fields.map((field) => (
                                <Form.Item required={false} key={field.key}>
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

                              {questionType === 'multiple_choice' ||
                              questionType === 'checkbox' ? (
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
                    </>
                  ))}
                  <Form.Item>
                    <div className="flex flex-col items-center justify-center my-8">
                      <div
                        className="rounded-full bg-primary w-8 h-8 flex items-center justify-center"
                        onClick={() => add()}
                      >
                        <PlusOutlined size={50} className="text-white" />
                      </div>
                      <p className="text-md font-normal mt-2 text-gray-400">
                        Add Question
                      </p>
                    </div>
                  </Form.Item>
                </>
              )}
            </Form.List>
            <Form.Item>
              <div className="flex items-center justify-center gap-4">
                <Button
                  onClick={() => setIsDrawerOpen(false)}
                  className="py-1 px-12 h-8 flex item-center justify-center bg-white text-gray-500"
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
          </Form>
        </CustomDrawerLayout>
      </>
    )
  );
};

export default Question;
