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
        title="Edit Questions"
        open={isEditModalOpen}
        footer={null}
        centered
        onCancel={() => setIsEditModalOpen(false)}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          {selectedQuestion && (
            <>
              <Row gutter={12}>
                <Col lg={16} md={10} xs={24}>
                  <Form.Item
                    label="Question"
                    name="question"
                    rules={[
                      { required: true, message: 'Please input the question!' },
                    ]}
                  >
                    <Input allowClear />
                  </Form.Item>
                </Col>

                <Col lg={8} md={10} xs={24}>
                  <Form.Item
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
                      <Option value="multiple_choice">Multiple Choice</Option>
                      <Option value="checkbox">Checkbox</Option>
                      <Option value="short_text">Short Text</Option>
                      <Option value="paragraph">Paragraph</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item name="required" valuePropName="checked">
                <Checkbox defaultChecked={false}>Is Required</Checkbox>
              </Form.Item>
              <Form.List
                name="field"
                initialValue={selectedQuestion?.field || []}
              >
                {(fields, { add, remove }) => {
                  const questionType =
                    selectedType || form.getFieldValue('fieldType');
                  return (
                    <div className="mx-8">
                      {(questionType === FieldType.MULTIPLE_CHOICE ||
                        questionType === FieldType.CHECKBOX) && (
                        <>
                          {fields.map((field) => (
                            <Form.Item key={field.key} required={false}>
                              <div className="flex items-center gap-3">
                                <Form.Item
                                  {...field}
                                  noStyle
                                  rules={[
                                    {
                                      required: true,
                                      message: 'Please input an option!',
                                    },
                                  ]}
                                >
                                  <Input placeholder="Option" />
                                </Form.Item>
                                {fields.length > 2 && (
                                  <MinusCircleOutlined
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
            </>
          )}
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={updateQuestionLoading}
            >
              Save
            </Button>
            <Button
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
