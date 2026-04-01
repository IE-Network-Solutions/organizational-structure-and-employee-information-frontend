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
    <div
      className="flex justify-center text-xl font-extrabold text-gray-800 px-4 py-2"
      data-cy="question-template-drawer-header"
      id="questionTemplateDrawerHeader"
    >
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
        data-cy="question-template-drawer"
      >
        <div
          className="pb-[60px]"
          data-cy="question-template-drawer-content"
          id="questionTemplateDrawerContent"
        >
          <Form
            form={form}
            name="dependencies"
            autoComplete="off"
            style={{ maxWidth: '100%' }}
            layout="vertical"
            requiredMark={false}
            onValuesChange={() => {
              handleQuestionStateUpdate(form.getFieldsValue());
            }}
            onFinish={() => {
              handlePublish();
            }}
            data-cy="question-template-drawer-form"
            id="questionTemplateDrawerForm"
          >
            <div
              className="flex flex-col justify-between"
              data-cy="question-template-drawer-form-content"
              id="questionTemplateDrawerFormContent"
            >
              <div
                data-cy="question-template-drawer-form-fields"
                id="questionTemplateDrawerFormFields"
              >
                <Form.Item
                  required
                  name="customFieldName"
                  label={
                    <span
                      className="text-md font-semibold text-gray-700"
                      data-cy="question-template-drawer-title-label"
                      id="questionTemplateDrawerTitleLabel"
                    >
                      Template Title <span style={{ color: 'red' }}>*</span>
                    </span>
                  }
                  data-cy="question-template-drawer-title-field"
                  id="questionTemplateDrawerTitleField"
                >
                  <Input
                    allowClear
                    size="large"
                    placeholder="Enter Title"
                    data-cy="question-template-drawer-title-input"
                    id="questionTemplateDrawerTitleInput"
                  />
                </Form.Item>
                <Row
                  gutter={12}
                  data-cy="question-template-drawer-row"
                  id="questionTemplateDrawerRow"
                >
                  <Col
                    lg={8}
                    md={10}
                    xs={24}
                    data-cy="question-template-drawer-field-type-col"
                    id="questionTemplateDrawerFieldTypeCol"
                  >
                    <Form.Item
                      label={
                        <span
                          className="text-md font-semibold text-gray-700"
                          data-cy="question-template-drawer-field-type-label"
                        >
                          Field Type <span style={{ color: 'red' }}>*</span>
                        </span>
                      }
                      required
                      name="fieldType"
                      data-cy="question-template-drawer-field-type-field"
                      id="questionTemplateDrawerFieldTypeField"
                    >
                      <Select
                        allowClear
                        placeholder="Select type"
                        data-cy="question-template-drawer-field-type-select"
                        id="questionTemplateDrawerFieldTypeSelect"
                      >
                        <Option
                          value="multiple_choice"
                          data-cy="question-template-drawer-field-type-option-multiple-choice"
                          id="questionTemplateDrawerFieldTypeOptionMultipleChoice"
                        >
                          Multiple Choice
                        </Option>
                        <Option
                          value="checkbox"
                          data-cy="question-template-drawer-field-type-option-checkbox"
                          id="questionTemplateDrawerFieldTypeOptionCheckbox"
                        >
                          Checkbox
                        </Option>
                        <Option
                          value="short_text"
                          data-cy="question-template-drawer-field-type-option-short-text"
                          id="questionTemplateDrawerFieldTypeOptionShortText"
                        >
                          Short Text
                        </Option>
                        <Option
                          value="paragraph"
                          data-cy="question-template-drawer-field-type-option-paragraph"
                          id="questionTemplateDrawerFieldTypeOptionParagraph"
                        >
                          Paragraph
                        </Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col
                    lg={16}
                    md={10}
                    xs={24}
                    data-cy="question-template-drawer-question-col"
                    id="questionTemplateDrawerQuestionCol"
                  >
                    <Form.Item
                      label={
                        <span
                          className="text-md font-semibold text-gray-700"
                          data-cy="question-template-drawer-question-label"
                          id="questionTemplateDrawerQuestionLabel"
                        >
                          Question <span style={{ color: 'red' }}>*</span>
                        </span>
                      }
                      required
                      name="question"
                      rules={[
                        { required: true, message: 'This field is required' },
                      ]}
                      data-cy="question-template-drawer-question-field"
                      id="questionTemplateDrawerQuestionField"
                    >
                      <Input
                        placeholder="Enter your question here"
                        allowClear
                        data-cy="question-template-drawer-question-input"
                        id="questionTemplateDrawerQuestionInput"
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item
                  name="required"
                  className="mb-2 mt-0 ml-4"
                  valuePropName="checked"
                  data-cy="question-template-drawer-required-field"
                  id="questionTemplateDrawerRequiredField"
                >
                  <Checkbox
                    defaultChecked={false}
                    data-cy="question-template-drawer-required-checkbox"
                    id="questionTemplateDrawerRequiredCheckbox"
                  >
                    Is Required
                  </Checkbox>
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
                  data-cy="question-template-drawer-field-list"
                >
                  {(fields, { add, remove }) => {
                    const questionType = form.getFieldValue('fieldType');
                    return (
                      <div
                        className="mx-8"
                        data-cy="question-template-drawer-field-list-container"
                        id="questionTemplateDrawerFieldListContainer"
                      >
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
                            data-cy={`question-template-drawer-field-item-${field.name}`}
                            id={`questionTemplateDrawerFieldItem${field.name}`}
                          >
                            <div
                              className="flex items-center gap-3"
                              data-cy={`question-template-drawer-field-item-container-${field.name}`}
                              id={`questionTemplateDrawerFieldItemContainer${field.name}`}
                            >
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
                                data-cy={`question-template-drawer-field-input-field-${field.name}`}
                                id={`questionTemplateDrawerFieldInputField${field.name}`}
                              >
                                <Input
                                  placeholder="Option"
                                  data-cy={`question-template-drawer-field-input-${field.name}`}
                                  id={`questionTemplateDrawerFieldInput${field.name}`}
                                />
                              </Form.Item>
                              {fields.length > 0 && (
                                <MinusCircleOutlined
                                  className="dynamic-delete-button"
                                  onClick={() => remove(field.name)}
                                  data-cy={`question-template-drawer-field-remove-${field.name}`}
                                  id={`questionTemplateDrawerFieldRemove${field.name}`}
                                />
                              )}
                            </div>
                          </Form.Item>
                        ))}

                        {questionType === 'multiple_choice' ||
                        questionType === FieldType.CHECKBOX ? (
                          <Form.Item
                            data-cy="question-template-drawer-add-option-container"
                            id="questionTemplateDrawerAddOptionContainer"
                          >
                            <div
                              className="flex flex-col items-center justify-center"
                              data-cy="question-template-drawer-add-option"
                              id="questionTemplateDrawerAddOption"
                            >
                              <div
                                onClick={() => add()}
                                className="w-6 h-6 flex items-center justify-center rounded-full bg-primary cursor-pointer"
                                data-cy="question-template-drawer-add-option-button"
                                id="questionTemplateDrawerAddOptionButton"
                              >
                                <PlusOutlined
                                  size={30}
                                  className="text-white"
                                  data-cy="question-template-drawer-add-option-button-icon"
                                  id="questionTemplateDrawerAddOptionButtonIcon"
                                />
                              </div>
                              <p
                                className="text-xs font-light text-gray-400 "
                                data-cy="question-template-drawer-add-option-label"
                                id="questionTemplateDrawerAddOptionLabel"
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
              </div>
              <div
                className="mt-40"
                data-cy="question-template-drawer-footer-container"
                id="questionTemplateDrawerFooterContainer"
              >
                <Form.Item
                  data-cy="question-template-drawer-footer"
                  id="questionTemplateDrawerFooter"
                >
                  <div
                    className="flex justify-center absolute w-full bg-[#fff] px-6 py-6 gap-8"
                    data-cy="question-template-drawer-actions"
                    id="questionTemplateDrawerActions"
                  >
                    <Button
                      onClick={() => setIsOpen(false)}
                      className="flex justify-center text-sm font-medium text-gray-800 bg-white p-4 px-10 h-12 hover:border-[#D9D9D9] border-[#D9D9D9]"
                      data-cy="question-template-drawer-cancel-button"
                      id="questionTemplateDrawerCancelButton"
                    >
                      Cancel
                    </Button>
                    <Button
                      htmlType="submit"
                      className="flex justify-center text-sm font-medium text-white bg-primary p-4 px-10 h-12"
                      data-cy="question-template-drawer-create-button"
                      id="questionTemplateDrawerCreateButton"
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
