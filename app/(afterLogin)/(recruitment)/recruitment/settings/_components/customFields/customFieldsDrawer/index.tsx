import NotificationMessage from '@/components/common/notification/notificationMessage';
import { useRecruitmentSettingsStore } from '@/store/uistate/features/recruitment/settings';
import { useDebounce } from '@/utils/useDebounce';
import {
  Button,
  Checkbox,
  Col,
  Form,
  Input,
  Modal,
  Radio,
  Row,
  Select,
} from 'antd';
import React, { useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import CustomDrawerLayout from '@/components/common/customDrawer';
import {
  useCreateCustomFieldsTemplate,
  useUpdateCustomFieldsTemplate,
} from '@/store/server/features/recruitment/settings/mutation';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';

const { Option } = Select;

const CustomFieldsDrawer: React.FC<{
  question?: any;
  onClose: () => void;
  isEdit?: boolean;
}> = ({ question, onClose, isEdit = false }) => {
  const [form] = Form.useForm();
  const userId = useAuthenticationStore.getState().userId;

  const { isCustomFieldsDrawerOpen, addCustomFieldsTemplate } =
    useRecruitmentSettingsStore();

  const { mutate: updateQuestions } = useUpdateCustomFieldsTemplate();
  const { mutate: createQuestion } = useCreateCustomFieldsTemplate();

  const handleQuestionStateUpdate = useDebounce(addCustomFieldsTemplate, 1500);

  const handleSubmit = async (values: any) => {
    const updatedFields = values.field.map((value: any) => ({
      id: question?.form?.field?.id || uuidv4(),
      value,
    }));
    const formattedValue = {
      title: values?.title,
      createdBy: userId,
      updatedBy: userId,
      questions: [
        {
          id: uuidv4(),
          fieldType: values?.fieldType,
          question: values?.question,
          required: values?.required || false,
          field: updatedFields,
        },
      ],
    };

    if (!isEdit) {
      formattedValue['createdBy'] = userId;
    }

    if (isEdit) {
      formattedValue['updatedBy'] = userId;
    }

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
      const title = question?.title;
      const questionForm = question?.form?.[0] || {};
      const formValues = {
        title: title || '',
        fieldType: questionForm?.fieldType,
        question: questionForm?.question,
        required: questionForm?.required || false,
        field: questionForm?.field?.map((e: any) => e.value) || [],
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
      initialValues={{
        title: question?.title,
      }}
    >
      <Form.Item
        name="title"
        label={
          <span className="text-md font-semibold text-gray-700">
            Template Title
          </span>
        }
        rules={[{ required: true, message: 'Please input the title!' }]}
      >
        <Input
          size="large"
          className="text-sm w-full  h-10"
          placeholder="Enter your question here"
          allowClear
        />
      </Form.Item>

      <Row gutter={12}>
        <Col lg={8} md={10} xs={24}>
          <Form.Item
            label={
              <span className="text-md font-semibold text-gray-700">
                Field Type
              </span>
            }
            rules={[{ required: true, message: 'Please Choose field type' }]}
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
        initialValue={isEdit ? question?.form?.field || [] : []}
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
        <div className="flex justify-center w-full bg-[#fff] px-6 py-6 gap-8">
          <Button
            className="flex justify-center text-sm font-medium text-white bg-primary p-4 px-10 h-12"
            htmlType="submit"
          >
            {isEdit ? 'Update Template' : 'Create'}
          </Button>
          <Button
            className="flex justify-center text-sm font-medium text-gray-800 bg-white p-4 px-10 h-12 hover:border-gray-500 border-gray-300"
            onClick={onClose}
          >
            Cancel
          </Button>
        </div>
      </Form.Item>
    </Form>
  );

  const customFieldsDrawerHeader = (
    <div className="flex justify-center text-xl font-extrabold text-gray-800 px-4 py-2">
      {isEdit ? 'Edit Question' : 'Create New Field'}
    </div>
  );

  if (isEdit) {
    return (
      <Modal
        centered
        title="Edit Question"
        open={true}
        onCancel={onClose}
        footer={null}
      >
        {renderFormContent()}
      </Modal>
    );
  }

  return (
    isCustomFieldsDrawerOpen && (
      <CustomDrawerLayout
        open={isCustomFieldsDrawerOpen}
        modalHeader={customFieldsDrawerHeader}
        onClose={onClose}
        width="40%"
        footer={null}
      >
        <div className="pb-[60px]">{renderFormContent()}</div>
      </CustomDrawerLayout>
    )
  );
};

export default CustomFieldsDrawer;
