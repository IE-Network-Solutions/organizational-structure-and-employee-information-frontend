import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, Button, Checkbox, Row, Col } from 'antd';
import { useCustomQuestionTemplateStore } from '@/store/uistate/features/feedback/settings';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { useUpdateQuestionTemplate } from '@/store/server/features/feedback/settings/mutation';
import { v4 as uuidv4 } from 'uuid';

const { Option } = Select;

const EditQuestion: React.FC<{ question: any; onClose: () => void }> = ({
  question,
  onClose,
}) => {
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

  useEffect(() => {}, [
    questionModal,
    form.setFieldsValue({
      customFieldName: question?.customFieldName,
      fieldType: question?.fieldType,
      question: question?.question,
      required: question?.required,
      field: question?.field?.map((e: any) => e.value) || [],
    }),
  ]);

  return (
    questionModal && (
      <Modal
        centered
        title="Edit Question"
        open={true}
        onCancel={onClose}
        footer={null}
      >
        <Form onFinish={handleSubmit} form={form} layout="vertical">
          <Form.Item
            name="customFieldName"
            label="Template Title"
            rules={[{ required: true, message: 'Please input the title!' }]}
          >
            <Input allowClear />
          </Form.Item>
          <Row gutter={12}>
            <Col lg={8} md={10} xs={24}>
              <Form.Item
                name="fieldType"
                label="Field Type"
                rules={[
                  { required: true, message: 'Please select a field type!' },
                ]}
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
                name="question"
                label="Question"
                rules={[
                  { required: true, message: 'Please input the question!' },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="required" valuePropName="checked">
            <Checkbox defaultChecked={false}>Is Required</Checkbox>
          </Form.Item>

          <Form.List name="field" initialValue={question?.field || []}>
            {(fields, { add, remove }) => {
              const questionType = form.getFieldValue('fieldType');
              return (
                <div className="mx-8">
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

          <Form.Item>
            <div className="flex items-center justify-end gap-3">
              <Button type="primary" htmlType="submit">
                Save
              </Button>
              <Button type="default" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    )
  );
};

export default EditQuestion;
