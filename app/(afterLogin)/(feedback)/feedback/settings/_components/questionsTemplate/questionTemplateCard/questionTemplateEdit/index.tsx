import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, Button, Checkbox, Row, Col } from 'antd';
import { useCustomQuestionTemplateStore } from '@/store/uistate/features/feedback/settings';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { useUpdateQuestionTemplate } from '@/store/server/features/feedback/settings/mutation';
import { v4 as uuidv4 } from 'uuid';
import { FieldType } from '@/types/enumTypes';

const { Option } = Select;

const EditQuestionTemplate: React.FC<{
  question: any;
  onClose: () => void;
}> = ({ question, onClose }) => {
  const [form] = Form.useForm();

  const { questionModal, editingQuestion } = useCustomQuestionTemplateStore();
  const { mutate: updateQuestions } = useUpdateQuestionTemplate();

  const handleSubmit = (values: any) => {
    const updatedFields = values.field.map((value: any, index: number) => {
      if (question.field[index]) {
        return {
          id: question.field[index].id,
          value,
        };
      } else {
        return {
          id: uuidv4(),
          value,
        };
      }
    });
    updateQuestions({
      id: editingQuestion?.id,
      data: { ...values, field: updatedFields },
    });
    onClose();
  };

  useEffect(() => {
    const formValues = {
      customFieldName: question?.customFieldName,
      fieldType: question?.fieldType,
      question: question?.question,
      required: question?.required,
      field: question?.field?.map((e: any) => e.value) || [],
    };

    form.setFieldsValue(formValues);
  }, [questionModal, question, form]);

  return (
    questionModal && (
      <Modal
        centered
        title="Edit Question"
        open={true}
        onCancel={onClose}
        footer={null}
        data-cy="edit-question-template-modal"
      >
        <Form
          onFinish={handleSubmit}
          form={form}
          layout="vertical"
          requiredMark={false}
          data-cy="edit-question-template-form"
          id="editQuestionTemplateForm"
        >
          <Form.Item
            name="customFieldName"
            label={
              <span data-cy="edit-question-template-title-label-text">
                Template Title{' '}
                <span
                  style={{ color: 'red' }}
                  data-cy="edit-question-template-title-required"
                >
                  *
                </span>
              </span>
            }
            rules={[{ required: true, message: 'Please input the title!' }]}
            data-cy="edit-question-template-title-field"
            id="editQuestionTemplateTitleField"
          >
            <Input
              allowClear
              data-cy="edit-question-template-title-input"
              id="editQuestionTemplateTitleInput"
            />
          </Form.Item>
          <Row
            gutter={12}
            data-cy="edit-question-template-row"
            id="editQuestionTemplateRow"
          >
            <Col
              lg={8}
              md={10}
              xs={24}
              data-cy="edit-question-template-field-type-col"
              id="editQuestionTemplateFieldTypeCol"
            >
              <Form.Item
                name="fieldType"
                label={
                  <span data-cy="edit-question-template-field-type-label-text">
                    Field Type{' '}
                    <span
                      style={{ color: 'red' }}
                      data-cy="edit-question-template-field-type-required"
                    >
                      *
                    </span>
                  </span>
                }
                rules={[
                  { required: true, message: 'Please select a field type!' },
                ]}
                data-cy="edit-question-template-field-type-field"
                id="editQuestionTemplateFieldTypeField"
              >
                <Select
                  placeholder="Select type"
                  data-cy="edit-question-template-field-type-select"
                  id="editQuestionTemplateFieldTypeSelect"
                >
                  <Option
                    value="multiple_choice"
                    data-cy="edit-question-template-field-type-option-multiple-choice"
                    id="editQuestionTemplateFieldTypeOptionMultipleChoice"
                  >
                    Multiple Choice
                  </Option>
                  <Option
                    value="checkbox"
                    data-cy="edit-question-template-field-type-option-checkbox"
                    id="editQuestionTemplateFieldTypeOptionCheckbox"
                  >
                    Checkbox
                  </Option>
                  <Option
                    value="short_text"
                    data-cy="edit-question-template-field-type-option-short-text"
                    id="editQuestionTemplateFieldTypeOptionShortText"
                  >
                    Short Text
                  </Option>
                  <Option
                    value="paragraph"
                    data-cy="edit-question-template-field-type-option-paragraph"
                    id="editQuestionTemplateFieldTypeOptionParagraph"
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
              data-cy="edit-question-template-question-col"
              id="editQuestionTemplateQuestionCol"
            >
              <Form.Item
                name="question"
                label={
                  <span data-cy="edit-question-template-question-label-text">
                    Question{' '}
                    <span
                      style={{ color: 'red' }}
                      data-cy="edit-question-template-question-required"
                    >
                      *
                    </span>
                  </span>
                }
                rules={[
                  { required: true, message: 'Please input the question!' },
                ]}
                data-cy="edit-question-template-question-field"
                id="editQuestionTemplateQuestionField"
              >
                <Input
                  data-cy="edit-question-template-question-input"
                  id="editQuestionTemplateQuestionInput"
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="required"
            valuePropName="checked"
            data-cy="edit-question-template-required-field"
            id="editQuestionTemplateRequiredField"
          >
            <Checkbox
              defaultChecked={false}
              data-cy="edit-question-template-required-checkbox"
              id="editQuestionTemplateRequiredCheckbox"
            >
              Is Required
            </Checkbox>
          </Form.Item>

          <Form.List
            name="field"
            initialValue={question?.field || []}
            data-cy="edit-question-template-field-list"
          >
            {(fields, { add, remove }) => {
              const questionType = form.getFieldValue('fieldType');
              return (
                <div
                  className="mx-8"
                  data-cy="edit-question-template-field-list-container"
                  id="editQuestionTemplateFieldListContainer"
                >
                  {fields.map((field) => (
                    <Form.Item
                      key={field.key}
                      required={false}
                      data-cy={`edit-question-template-field-item-${field.name}`}
                      id={`editQuestionTemplateFieldItem${field.name}`}
                    >
                      <div
                        className="flex items-center gap-3"
                        data-cy={`edit-question-template-field-item-container-${field.name}`}
                        id={`editQuestionTemplateFieldItemContainer${field.name}`}
                      >
                        <Form.Item
                          {...field}
                          noStyle
                          rules={[
                            {
                              required: true,
                              message: 'Please input an option!',
                            },
                          ]}
                          data-cy={`edit-question-template-field-input-field-${field.name}`}
                          id={`editQuestionTemplateFieldInputField${field.name}`}
                        >
                          <Input
                            placeholder="Option"
                            data-cy={`edit-question-template-field-input-${field.name}`}
                            id={`editQuestionTemplateFieldInput${field.name}`}
                          />
                        </Form.Item>
                        {fields.length > 1 && (
                          <MinusCircleOutlined
                            className="dynamic-delete-button"
                            onClick={() => remove(field.name)}
                            data-cy={`edit-question-template-field-remove-${field.name}`}
                            id={`editQuestionTemplateFieldRemove${field.name}`}
                          />
                        )}
                      </div>
                    </Form.Item>
                  ))}
                  {questionType === FieldType.MULTIPLE_CHOICE ||
                  questionType === FieldType.CHECKBOX ? (
                    <Form.Item
                      data-cy="edit-question-template-add-option-container"
                      id="editQuestionTemplateAddOptionContainer"
                    >
                      <div
                        className="flex flex-col items-center justify-center"
                        data-cy="edit-question-template-add-option"
                        id="editQuestionTemplateAddOption"
                      >
                        <div
                          onClick={() => add()}
                          className="w-6 h-6 flex items-center justify-center rounded-full bg-primary cursor-pointer"
                          data-cy="edit-question-template-add-option-button"
                          id="editQuestionTemplateAddOptionButton"
                        >
                          <PlusOutlined
                            size={30}
                            className="text-white"
                            data-cy="edit-question-template-add-option-button-icon"
                            id="editQuestionTemplateAddOptionButtonIcon"
                          />
                        </div>
                        <p
                          className="text-xs font-light text-gray-400 "
                          data-cy="edit-question-template-add-option-label"
                          id="editQuestionTemplateAddOptionLabel"
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

          <Form.Item
            data-cy="edit-question-template-form-actions"
            id="editQuestionTemplateFormActions"
          >
            <div
              className="flex items-center justify-end gap-3"
              data-cy="edit-question-template-form-buttons"
              id="editQuestionTemplateFormButtons"
            >
              <Button
                type="primary"
                htmlType="submit"
                data-cy="edit-question-template-save-button"
                id="editQuestionTemplateSaveButton"
              >
                Save
              </Button>
              <Button
                type="default"
                onClick={onClose}
                data-cy="edit-question-template-cancel-button"
                id="editQuestionTemplateCancelButton"
              >
                Cancel
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    )
  );
};

export default EditQuestionTemplate;
