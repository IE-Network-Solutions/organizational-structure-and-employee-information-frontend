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
import CustomQuestionTemplate from './customQuestionTemplate';
import { FieldType } from '@/types/enumTypes';
import { useFetchedQuestionsByFormId } from '@/store/server/features/organization-development/categories/queries';

const { Option } = Select;
interface Props {
  selectedFormId: string;
  onClose: () => void;
}

const Question: React.FC<Props> = (props) => {
  const [form] = Form.useForm();
  const { refetch: refetchQuestions } = useFetchedQuestionsByFormId(
    props?.selectedFormId,
    '',
  );
  const { mutate: AddQuestion, isLoading: addQuestionLoading } =
    useCreateQuestion();
  const {
    isDrawerOpen,
    questions,
    addQuestion,
    setIsDrawerOpen,
    filteredQuestions,
  } = useDynamicFormStore();

  const handleQuestionStateUpdate = useDebounce(addQuestion, 1500);

  const handlePublish = async () => {
    try {
      const formattedValues = {
        formId: props?.selectedFormId,
        questions: [
          ...questions.map((e: { required: any; field: any[] }, i: number) => {
            return {
              ...e,
              order: i + 1,
              required: !!e.required,
              field: e.field.map((value: any) => {
                return {
                  value,
                  id: uuidv4(),
                };
              }),
            };
          }),
          ...filteredQuestions.map(
            (e: { required: any; field: any[] }, i: number) => {
              return {
                ...e,
                order: questions.length + i + 1,
                required: !!e.required,
              };
            },
          ),
        ],
      };
      AddQuestion(formattedValues, {
        onSuccess: () => {
          setIsDrawerOpen(false);
          refetchQuestions();
        },
      });
    } catch (error) {
      NotificationMessage.error({
        message: 'Publish Failed',
        description: 'There was an error publishing the survey.',
      });
    }
  };

  const renderOptionInput = (
    type: any,
    questionIndex: number,
    optionKey: React.Key,
  ) => {
    switch (type) {
      case 'multiple_choice':
        return (
          <Radio
            id={`question-builder-option-radio-${questionIndex}-${optionKey}`}
            data-cy={`question-builder-option-radio-${questionIndex}-${optionKey}`}
            className="mr-2"
            disabled
            value=""
          />
        );
      case 'checkbox':
        return (
          <Checkbox
            id={`question-builder-option-checkbox-${questionIndex}-${optionKey}`}
            data-cy={`question-builder-option-checkbox-${questionIndex}-${optionKey}`}
            className="mr-2"
            disabled
            value=""
          />
        );
      default:
        return null;
    }
  };

  const drawerHeader = (
    <div
      id="question-drawer-header-container"
      data-cy="question-drawer-header-container"
      className="flex flex-col items-center justify-center"
    >
      <div
        id="question-drawer-header-title"
        data-cy="question-drawer-header-title"
        className="flex justify-center text-xl font-extrabold text-gray-800 px-4 py-2"
      >
        Create Your Questions
      </div>
      <div
        id="question-drawer-header-info"
        data-cy="question-drawer-header-info"
        className="flex items-center justify-center gap-1 mx-2 mt-0"
      >
        <IoIosInformationCircleOutline
          id="question-drawer-header-icon"
          data-cy="question-drawer-header-icon"
          size={15}
        />
        <p
          id="question-drawer-header-description"
          data-cy="question-drawer-header-description"
          className="text-gray-300 text-xs font-light"
        >
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
          footer={false}
          data-cy="question-drawer-layout"
        >
          <Form
            id="question-builder-form"
            data-cy="question-builder-form"
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
            <Form.Item
              data-cy="question-builder-template-item"
              id="question-builder-template-item"
            >
              <CustomQuestionTemplate data-cy="question-builder-template-component" />
            </Form.Item>
            <Form.List
              data-cy="question-builder-list"
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
                        data-cy="question-builder-question-item"
                        id="question-builder-question-item"
                        className="text-md font-semibold text-gray-800 mb-2 block"
                      >
                        Question {index + 1}
                        <span
                          data-cy="question-builder-required-indicator"
                          id="question-builder-required-indicator"
                          className="text-red-500"
                        >
                          *
                        </span>
                      </div>

                      <Row
                        gutter={12}
                        key={key}
                        data-cy="question-builder-row"
                        id="question-builder-row"
                      >
                        <Col
                          lg={16}
                          md={10}
                          xs={24}
                          data-cy="question-builder-question-column"
                          id="question-builder-question-column"
                        >
                          <Form.Item
                            label=""
                            data-cy="question-builder-question-input"
                            id="question-builder-question-input"
                            name={[name, 'question']}
                            rules={[
                              {
                                required: true,
                                message: 'This field is required',
                              },
                            ]}
                          >
                            <div
                              data-cy="question-builder-question-input-wrapper"
                              id="question-builder-question-input-wrapper"
                              className="flex items-center"
                            >
                              <Input
                                data-cy="question-builder-question-input-field"
                                id="question-builder-question-input-field"
                                placeholder="Enter your question here"
                                allowClear
                              />
                            </div>
                          </Form.Item>
                        </Col>
                        <Col
                          lg={8}
                          md={10}
                          xs={24}
                          data-cy="question-builder-field-type-column"
                          id="question-builder-field-type-column"
                        >
                          <Row
                            data-cy="question-builder-field-type-row"
                            id="question-builder-field-type-row"
                          >
                            <Col
                              lg={16}
                              sm={12}
                              xs={24}
                              data-cy="question-builder-field-type-column"
                              id="question-builder-field-type-column"
                            >
                              <Form.Item
                                {...restField}
                                name={[name, 'fieldType']}
                                required
                                rules={[
                                  {
                                    required: true,
                                    message: 'Please select a question type',
                                  },
                                ]}
                                data-cy="question-builder-field-type-item"
                                id="question-builder-field-type-item"
                              >
                                <Select
                                  data-cy="question-builder-field-type-select"
                                  id="question-builder-field-type-select"
                                  placeholder="Select type"
                                  allowClear
                                >
                                  <Option value="multiple_choice">
                                    Multiple Choice
                                  </Option>
                                  <Option
                                    value="checkbox"
                                    id="question-builder-field-type-checkbox"
                                    data-cy="question-builder-field-type-checkbox"
                                  >
                                    Checkbox
                                  </Option>
                                  <Option
                                    value="short_text"
                                    id="question-builder-field-type-short-text"
                                    data-cy="question-builder-field-type-short-text"
                                  >
                                    Short Text
                                  </Option>
                                  <Option
                                    value="paragraph"
                                    id="question-builder-field-type-paragraph"
                                    data-cy="question-builder-field-type-paragraph"
                                  >
                                    Paragraph
                                  </Option>
                                </Select>
                              </Form.Item>
                            </Col>
                            <Col
                              lg={8}
                              sm={12}
                              xs={24}
                              data-cy="question-builder-remove-column"
                              id="question-builder-remove-column"
                            >
                              <MinusCircleOutlined
                                data-cy="question-builder-remove-button"
                                id="question-builder-remove-button"
                                onClick={() => remove(name)}
                                className="flex items-center justify-center"
                              />
                            </Col>
                          </Row>
                        </Col>
                      </Row>
                      <Form.Item
                        data-cy="question-builder-required-item"
                        id="question-builder-required-item"
                        label=""
                        name={[name, 'required']}
                        className="mb-2 mt-0 ml-4"
                        valuePropName="checked"
                      >
                        <div className="flex items-center text-sm">
                          <Checkbox
                            data-cy="question-builder-required-checkbox"
                            id="question-builder-required-checkbox"
                            defaultChecked={false}
                          >
                            Is Required
                          </Checkbox>
                        </div>
                      </Form.Item>

                      <Form.List
                        data-cy="question-builder-option-list"
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
                                type === FieldType.MULTIPLE_CHOICE ||
                                type === FieldType.CHECKBOX
                              ) {
                                if (!names || names.length < 2) {
                                  return Promise.reject(
                                    NotificationMessage.warning({
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
                            <div
                              className="ml-8"
                              id="question-builder-option-wrapper"
                              data-cy="question-builder-option-wrapper"
                            >
                              {fields.map((field, index) => (
                                <Form.Item
                                  data-cy="question-builder-option-item"
                                  id="question-builder-option-item"
                                  required={false}
                                  key={field.key}
                                >
                                  <div
                                    className="flex items-center gap-3"
                                    data-cy="question-builder-option-wrapper"
                                    id="question-builder-option-wrapper"
                                  >
                                    {renderOptionInput(
                                      questionType,
                                      index,
                                      field.key,
                                    )}
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
                                      data-cy="question-builder-option-input"
                                      id="question-builder-option-input"
                                    >
                                      <Input
                                        data-cy="question-builder-option-input-field"
                                        id="question-builder-option-input-field"
                                        placeholder=""
                                      />
                                    </Form.Item>
                                    {fields.length > 1 ? (
                                      <MinusCircleOutlined
                                        data-cy="question-builder-option-remove-button"
                                        id="question-builder-option-remove-button"
                                        className="dynamic-delete-button"
                                        onClick={() => remove(field.name)}
                                      />
                                    ) : null}
                                  </div>
                                </Form.Item>
                              ))}

                              {questionType === 'multiple_choice' ||
                              questionType === FieldType.CHECKBOX ? (
                                <Form.Item
                                  data-cy="question-builder-option-add-item"
                                  id="question-builder-option-add-item"
                                >
                                  <div
                                    className="flex flex-col items-center justify-center"
                                    data-cy="question-builder-option-add-wrapper"
                                    id="question-builder-option-add-wrapper"
                                  >
                                    <div
                                      onClick={() => add()}
                                      className="w-6 h-6 flex items-center justify-center rounded-full bg-primary cursor-pointer"
                                      data-cy="question-builder-option-add-button"
                                      id="question-builder-option-add-button"
                                    >
                                      <PlusOutlined
                                        size={30}
                                        className="text-white"
                                        data-cy="question-builder-option-add-icon"
                                        id="question-builder-option-add-icon"
                                      />
                                    </div>
                                    <p
                                      className="text-xs font-light text-gray-400 "
                                      data-cy="question-builder-option-add-text"
                                      id="question-builder-option-add-text"
                                    >
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
                  <Form.Item
                    id="question-builder-add-question-item"
                    data-cy="question-builder-add-question-item"
                  >
                    <div
                      className="flex flex-col items-center justify-center my-8 "
                      data-cy="question-builder-add-question-wrapper"
                      id="question-builder-add-question-wrapper"
                    >
                      <div
                        className="rounded-full bg-primary w-8 h-8 flex items-center justify-center cursor-pointer"
                        onClick={() => add()}
                        data-cy="question-builder-add-question-button"
                        id="question-builder-add-question-button"
                      >
                        <PlusOutlined
                          size={50}
                          className="text-white "
                          data-cy="question-builder-add-question-icon"
                          id="question-builder-add-question-icon"
                        />
                      </div>
                      <p
                        className="text-md font-normal mt-2 text-gray-400"
                        data-cy="question-builder-add-question-text"
                        id="question-builder-add-question-text"
                      >
                        Add Question
                      </p>
                    </div>
                  </Form.Item>
                </>
              )}
            </Form.List>
            <Form.Item>
              <div
                className="flex justify-center absolute w-full bg-[#fff] px-6 py-6 gap-8"
                data-cy="question-builder-footer-wrapper"
                id="question-builder-footer-wrapper"
              >
                <Button
                  onClick={() => setIsDrawerOpen(false)}
                  data-cy="question-builder-cancel-button"
                  id="question-builder-cancel-button"
                  className="flex justify-center text-sm font-medium text-gray-800 bg-white p-4 px-10 h-12 hover:border-gray-500 border-gray-300"
                >
                  Cancel
                </Button>
                <Button
                  htmlType="submit"
                  data-cy="question-builder-create-button"
                  id="question-builder-create-button"
                  className="flex justify-center text-sm font-medium text-white bg-primary p-4 px-10 h-12"
                  loading={addQuestionLoading}
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
