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
import { FieldType } from '@/types/enumTypes';

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
      id="talent-acquisition-custom-fields-form"
      data-cy="talent-acquisition-custom-fields-form"
      form={form}
      autoComplete="off"
      layout="vertical"
      onValuesChange={() => handleQuestionStateUpdate(form.getFieldsValue())}
      onFinish={handleSubmit}
      initialValues={{
        title: question?.title,
      }}
      className="h-full"
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
          id="talent-acquisition-custom-fields-input-title"
          data-cy="talent-acquisition-custom-fields-input-title"
          size="large"
          className="text-sm w-full  h-10"
          placeholder="Enter your question here"
          allowClear
        />
      </Form.Item>

      <Row gutter={12}>
        <Col lg={8} md={10} xs={12}>
          <Form.Item
            label={
              <span className="text-md font-semibold text-gray-700">
                Field Type
              </span>
            }
            name="fieldType"
            rules={[{ required: true, message: 'Field type is required' }]}
          >
            <Select id="talent-acquisition-custom-fields-select-field-type" data-cy="talent-acquisition-custom-fields-select-field-type" allowClear placeholder="Select type" className="h-10">
              <Option value="multiple_choice" id="talent-acquisition-custom-fields-option-multiple-choice" data-cy="talent-acquisition-custom-fields-option-multiple-choice">Multiple Choice</Option>
              <Option value="checkbox" id="talent-acquisition-custom-fields-option-checkbox" data-cy="talent-acquisition-custom-fields-option-checkbox">Checkbox</Option>
              <Option value="short_text" id="talent-acquisition-custom-fields-option-short-text" data-cy="talent-acquisition-custom-fields-option-short-text">Short Text</Option>
              <Option value="paragraph" id="talent-acquisition-custom-fields-option-paragraph" data-cy="talent-acquisition-custom-fields-option-paragraph">Paragraph</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col lg={16} md={10} xs={12}>
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
            <Input
              id="talent-acquisition-custom-fields-input-question"
              data-cy="talent-acquisition-custom-fields-input-question"
              placeholder="Enter your question here"
              allowClear
              className="h-10"
            />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        name="required"
        className="mb-2 mt-0 ml-4"
        valuePropName="checked"
      >
        <Checkbox id="talent-acquisition-custom-fields-checkbox-required" data-cy="talent-acquisition-custom-fields-checkbox-required" defaultChecked={false}>Is Required</Checkbox>
      </Form.Item>

      <Form.List
        name="field"
        initialValue={isEdit ? question?.form?.field || [] : []}
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
                    NotificationMessage.warning({
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
                      <Input id={`talent-acquisition-custom-fields-input-option-${field.name}`} data-cy={`talent-acquisition-custom-fields-input-option-${field.name}`} placeholder="Option" />
                    </Form.Item>
                    {fields.length > 0 && (
                      <MinusCircleOutlined
                        id={`talent-acquisition-custom-fields-button-remove-option-${field.name}`}
                        data-cy={`talent-acquisition-custom-fields-button-remove-option-${field.name}`}
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
                      id="talent-acquisition-custom-fields-button-add-option"
                      data-cy="talent-acquisition-custom-fields-button-add-option"
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

      <Form.Item></Form.Item>
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
        data-cy="talent-acquisition-custom-fields-modal-edit"
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
        data-cy="talent-acquisition-custom-fields-drawer"
        open={isCustomFieldsDrawerOpen}
        modalHeader={customFieldsDrawerHeader}
        onClose={onClose}
        width="40%"
        footer={
          <div className="flex justify-center w-full bg-[#fff] space-x-5 p-4">
            <Button
              id="talent-acquisition-custom-fields-button-cancel"
              data-cy="talent-acquisition-custom-fields-button-cancel"
              className="flex justify-center text-sm font-medium text-gray-800 bg-white p-4 px-10 h-10 hover:border-gray-500 border-gray-300"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              id={isEdit ? "talent-acquisition-custom-fields-button-update" : "talent-acquisition-custom-fields-button-create"}
              data-cy={isEdit ? "talent-acquisition-custom-fields-button-update" : "talent-acquisition-custom-fields-button-create"}
              className="flex justify-center text-sm font-medium text-white bg-primary p-4 px-10 h-10 border-none"
              onClick={() => form.submit()}
            >
              {isEdit ? 'Update Template' : 'Create'}
            </Button>
          </div>
        }
      >
        <div className="pb-[60px]">{renderFormContent()}</div>
      </CustomDrawerLayout>
    )
  );
};

export default CustomFieldsDrawer;
