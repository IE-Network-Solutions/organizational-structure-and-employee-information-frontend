import { useUpdateQuestions } from '@/store/server/features/feedback/question/mutation';
import { useFetchedQuestionsByFormId } from '@/store/server/features/organization-development/categories/queries';
import { useOrganizationalDevelopment } from '@/store/uistate/features/organizationalDevelopment';
import { Checkbox, Col, Form, Input, Modal, Row, Select } from 'antd';
import { Button } from 'antd/lib';
import React, { useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { FieldType } from '@/types/enumTypes';

interface Params {
  id: string;
}

const { Option } = Select;
const EditQuestion = ({ id }: Params) => {
  const [form] = Form.useForm();
  const {
    isEditModalOpen,
    editItemId,
    searchTitle,
    setIsEditModalOpen,
    selectedType,
    setSelectedType,
  } = useOrganizationalDevelopment();

  const { data: questionsById, refetch } = useFetchedQuestionsByFormId(
    id,
    searchTitle,
  );
  const { mutate: updateQuestion, isLoading: updateQuestionLoading } =
    useUpdateQuestions();

  const selectedQuestion = questionsById?.items.find(
    (question: any) => question.id === editItemId,
  );
  const handleSubmit = async () => {
    const values = await form.validateFields();
    const isChoiceType =
      values?.fieldType === FieldType.MULTIPLE_CHOICE ||
      values?.fieldType === FieldType.CHECKBOX;
    const updatedData = {
      formId: id,
      ...selectedQuestion,
      question: values?.question,
      fieldType: values?.fieldType,
      required: !!values?.required,
      field: isChoiceType
        ? values.field.map((value: any) => ({ value, id: uuidv4() }))
        : [],
    };
    updateQuestion(
      { data: updatedData, id: editItemId },
      {
        onSuccess: () => {
          setIsEditModalOpen(false);
          refetch();
        },
      },
    );
  };

  useEffect(() => {
    if (selectedQuestion && isEditModalOpen) {
      form.setFieldsValue({
        question: selectedQuestion?.question,
        fieldType: selectedQuestion?.fieldType,
        required: selectedQuestion?.required,
        field: selectedQuestion?.field?.map((e: any) => e.value) || [],
      });
    }
  }, [isEditModalOpen, selectedQuestion, form]);
  return (
    isEditModalOpen && (
      <Modal
        data-cy="edit-question-modal"
        title="Edit Questions"
        open={isEditModalOpen}
        footer={null}
        centered
        onCancel={() => setIsEditModalOpen(false)}
      >
        <Form
          id="edit-question-form"
          data-cy="edit-question-form"
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          {selectedQuestion && (
            <>
              <Row
                gutter={12}
                id="edit-question-row-1"
                data-cy="edit-question-row-1"
              >
                <Col lg={16} md={10} xs={24}>
                  <Form.Item
                    id="edit-question-question-form-item"
                    data-cy="edit-question-question-form-item"
                    label="Question"
                    name="question"
                    rules={[
                      { required: true, message: 'Please input the question!' },
                    ]}
                  >
                    <Input
                      id="edit-question-question-input"
                      data-cy="edit-question-question-input"
                      allowClear
                    />
                  </Form.Item>
                </Col>

                <Col
                  lg={8}
                  md={10}
                  xs={24}
                  data-cy="edit-question-field-type-col"
                  id="edit-question-field-type-col"
                >
                  <Form.Item
                    id="edit-question-field-type-form-item"
                    data-cy="edit-question-field-type-form-item"
                    name="fieldType"
                    label="Field Type"
                    rules={[
                      {
                        required: true,
                        message: 'Please select a field type!',
                      },
                    ]}
                  >
                    <Select
                      id="edit-question-field-type-select"
                      data-cy="edit-question-field-type-select"
                      placeholder="Select type"
                      onChange={(value) => {
                        setSelectedType(value);
                        if (
                          value === FieldType.MULTIPLE_CHOICE ||
                          value === FieldType.CHECKBOX
                        ) {
                          const currentOptions =
                            form.getFieldValue('field') || [];
                          if (currentOptions.length < 2) {
                            form.setFieldsValue({
                              field: ['', ''],
                            });
                          }
                        }
                      }}
                    >
                      <Option
                        id="edit-question-field-type-option-multiple-choice"
                        data-cy="edit-question-field-type-option-multiple-choice"
                        value="multiple_choice"
                      >
                        Multiple Choice
                      </Option>
                      <Option
                        id="edit-question-field-type-option-checkbox"
                        data-cy="edit-question-field-type-option-checkbox"
                        value="checkbox"
                      >
                        Checkbox
                      </Option>
                      <Option
                        id="edit-question-field-type-option-short-text"
                        data-cy="edit-question-field-type-option-short-text"
                        value="short_text"
                      >
                        Short Text
                      </Option>
                      <Option
                        id="edit-question-field-type-option-paragraph"
                        data-cy="edit-question-field-type-option-paragraph"
                        value="paragraph"
                      >
                        Paragraph
                      </Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item
                id="edit-question-required-form-item"
                data-cy="edit-question-required-form-item"
                name="required"
                valuePropName="checked"
              >
                <Checkbox
                  id="edit-question-required-checkbox"
                  data-cy="edit-question-required-checkbox"
                  defaultChecked={false}
                >
                  Is Required
                </Checkbox>
              </Form.Item>
              <Form.List
                data-cy="edit-question-field-list"
                name="field"
                initialValue={selectedQuestion?.field || []}
              >
                {(fields, { add, remove }) => {
                  const questionType =
                    selectedType || form.getFieldValue('fieldType');
                  return (
                    <div
                      id="edit-question-field-list-container"
                      data-cy="edit-question-field-list-container"
                      className="mx-8"
                    >
                      {(questionType === FieldType.MULTIPLE_CHOICE ||
                        questionType === FieldType.CHECKBOX) && (
                        <>
                          {fields.map((field) => (
                            <Form.Item
                              key={field.key}
                              id={`edit-question-field-item-${field.key}`}
                              data-cy={`edit-question-field-item-${field.key}`}
                              required={false}
                            >
                              <div
                                id={`edit-question-field-item-${field.key}-wrapper`}
                                data-cy={`edit-question-field-item-${field.key}-wrapper`}
                                className="flex items-center gap-3"
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
                                  data-cy={`edit-question-field-item-${field.key}-form-item`}
                                  id={`edit-question-field-item-${field.key}-form-item`}
                                >
                                  <Input
                                    id={`edit-question-field-item-${field.key}-input`}
                                    data-cy={`edit-question-field-item-${field.key}-input`}
                                    placeholder="Option"
                                  />
                                </Form.Item>
                                {fields.length > 2 && (
                                  <MinusCircleOutlined
                                    id={`edit-question-field-item-${field.key}-remove-button`}
                                    data-cy={`edit-question-field-item-${field.key}-remove-button`}
                                    className="dynamic-delete-button"
                                    onClick={() => remove(field.name)}
                                  />
                                )}
                              </div>
                            </Form.Item>
                          ))}
                        </>
                      )}
                      {questionType === FieldType.MULTIPLE_CHOICE ||
                      questionType === FieldType.CHECKBOX ? (
                        <Form.Item
                          id="edit-question-add-option-form-item"
                          data-cy="edit-question-add-option-form-item"
                        >
                          <div
                            id="edit-question-add-option-container"
                            data-cy="edit-question-add-option-container"
                            className="flex flex-col items-center justify-center"
                          >
                            <div
                              id="edit-question-add-option-button"
                              data-cy="edit-question-add-option-button"
                              onClick={() => add()}
                              className="w-6 h-6 flex items-center justify-center rounded-full bg-primary cursor-pointer"
                            >
                              <PlusOutlined
                                id="edit-question-add-option-icon"
                                data-cy="edit-question-add-option-icon"
                                size={30}
                                className="text-white"
                              />
                            </div>
                            <p
                              id="edit-question-add-option-label"
                              data-cy="edit-question-add-option-label"
                              className="text-xs font-light text-gray-400 "
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
          )}
          <Form.Item
            id="edit-question-footer-form-item"
            data-cy="edit-question-footer-form-item"
          >
            <Button
              id="edit-question-save-button"
              data-cy="edit-question-save-button"
              type="primary"
              htmlType="submit"
              loading={updateQuestionLoading}
            >
              Save
            </Button>
            <Button
              id="edit-question-cancel-button"
              data-cy="edit-question-cancel-button"
              style={{ marginLeft: 8 }}
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    )
  );
};

export default EditQuestion;
