import NotificationMessage from '@/components/common/notification/notificationMessage';
import {
  useCreateCustomFieldsTemplate,
  useUpdateCustomFieldsTemplate,
} from '@/store/server/features/recruitment/settings/queries';
import { useRecruitmentSettingsStore } from '@/store/uistate/features/recruitment/settings';
import { useDebounce } from '@/utils/useDebounce';
import { Button, Checkbox, Col, Form, Input, Radio, Row, Select } from 'antd';
import React, { useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import CustomDrawerLayout from '@/components/common/customDrawer';

const { Option } = Select;

const CustomFieldsDrawer: React.FC<{
  question?: any;
  onClose: () => void;
  isEdit?: boolean;
}> = ({ question, onClose, isEdit = false }) => {
  const [form] = Form.useForm();

  const {
    isCustomFieldsDrawerOpen,
    customFieldsTemplate,
    addCustomFieldsTemplate,
  } = useRecruitmentSettingsStore();

  const { mutate: updateQuestions } = useUpdateCustomFieldsTemplate();
  const { mutate: createQuestion } = useCreateCustomFieldsTemplate();

  const handleQuestionStateUpdate = useDebounce(addCustomFieldsTemplate, 1500);

  const handleSubmit = async (values: any) => {
    const updatedFields = values.field.map((value: any, index: number) => ({
      id: question?.field[index]?.id || uuidv4(),
      value,
    }));

    const formattedValue = {
      customFieldName: values.customFieldName,
      fieldType: values.fieldType,
      question: values.question,
      required: values.required || false,
      field: updatedFields,
    };

    try {
      if (isEdit) {
        updateQuestions({ id: question?.id, data: formattedValue });
      } else {
        createQuestion({ ...formattedValue });
      }
      onClose();
      form.resetFields();
    } catch (error) {
      NotificationMessage.error({
        message: isEdit ? 'Update Failed' : 'Create Failed',
        description: `There was an error ${isEdit ? 'updating' : 'creating'} the template.`,
      });
    }
  };

  useEffect(() => {
    if (isEdit && question) {
      const formValues = {
        customFieldName: question?.customFieldName,
        fieldType: question?.fieldType,
        question: question?.question,
        required: question?.required,
        field: question?.field?.map((e: any) => e.value) || [],
      };
      form.setFieldsValue(formValues);
    }
  }, [isEdit, question, form]);

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

  const renderFormContent = () => (
    <Form
      form={form}
      autoComplete="off"
      layout="vertical"
      onValuesChange={() => handleQuestionStateUpdate(form.getFieldsValue())}
      onFinish={handleSubmit}
    >
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
            rules={[{ required: true, message: 'Please select a field type!' }]}
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
            rules={[{ required: true, message: 'Please input the question!' }]}
          >
            <Input />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item name="required" valuePropName="checked">
        <Checkbox>Is Required</Checkbox>
      </Form.Item>

      <Form.List
        name="field"
        initialValue={isEdit ? question?.field || [] : []}
      >
        {(fields, { add, remove }) => {
          const questionType = form.getFieldValue('fieldType');
          return (
            <div className="mx-8">
              {fields.map((field) => (
                <Form.Item key={field.key} required={false}>
                  <div className="flex items-center gap-3">
                    {renderOptionInput(questionType)}
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

              {(questionType === 'multiple_choice' ||
                questionType === 'checkbox') && (
                <Form.Item>
                  <div className="flex flex-col items-center justify-center">
                    <div
                      onClick={() => add()}
                      className="w-6 h-6 flex items-center justify-center rounded-full bg-primary cursor-pointer"
                    >
                      <PlusOutlined size={30} className="text-white" />
                    </div>
                    <p className="text-xs font-light text-gray-400">
                      Add Option
                    </p>
                  </div>
                </Form.Item>
              )}
            </div>
          );
        }}
      </Form.List>

      <Form.Item>
        <div className="flex items-center justify-end gap-3">
          <Button type="primary" htmlType="submit">
            {isEdit ? 'Update Template' : 'Create'}
          </Button>
          <Button type="default" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </Form.Item>
    </Form>
  );

  const customFieldsDrawerHeader = (
    <div className="flex items-center justify-between gap-3">
      {/* <h2>{isEdit ? 'Edit Question' : 'Create New Field'}</h2> */}
      <h2>Hello</h2>
    </div>
  );

  //   if (isEdit) {
  //     return (
  //       <Modal
  //         centered
  //         title="Edit Question"
  //         open={true}
  //         onCancel={onClose}
  //         footer={null}
  //       >
  //         {renderFormContent()}
  //       </Modal>
  //     );
  //   }
  console.log(isCustomFieldsDrawerOpen, 'isCustomFieldsDrawerOpen');

  return (
    // isCustomFieldsDrawerOpen && (
    <CustomDrawerLayout
      open={isCustomFieldsDrawerOpen}
      modalHeader={customFieldsDrawerHeader}
      onClose={onClose}
      width="40%"
      footer={null}
    >
      <div className="pb-[60px]">{renderFormContent()}</div>
    </CustomDrawerLayout>
    // )
  );
};

export default CustomFieldsDrawer;
