import React, { useState } from 'react';
import {
  Form,
  Input,
  Button,
  Select,
  Switch,
  Popover,
  Card,
  Row,
  Col,
  Divider,
  message,
} from 'antd';
import { v4 as uuidv4 } from 'uuid';
import { useAddEmployeeInformationForm } from '@/store/server/features/employees/employeeManagment/employeInformationForm/mutations';

const { Option } = Select;

interface FormField {
  id: string;
  fieldName: string;
  fieldType: 'input' | 'datePicker' | 'select' | 'toggle' | 'checkbox';
  isActive: boolean;
  options: string[];
  fieldValidation: string;
}

const AddCustomField: React.FC<any> = ({
  formTitle,
  customEmployeeInformationForm,
}) => {
  const createCustomForm = useAddEmployeeInformationForm();

  const [form] = Form.useForm();
  const [fieldName, setFieldName] = useState('');
  const [fieldType, setFieldType] = useState<
    'input' | 'datePicker' | 'select' | 'toggle' | 'checkbox'
  >('input');
  const [isActive, setIsActive] = useState(true);
  const [options, setOptions] = useState<string[]>([]);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const resetForm = () => {
    form.resetFields();
    setOptions([]);
    setFieldName('');
    setFieldType('input');
    setIsActive(true);
  };

  const addFieldIfNotExists = async (formData: any, newField: FormField) => {
    if (formData?.length < 1) {
      const newFormDataValue = {
        formTitle: formTitle,
        form: [newField],
      };
      try {
        await createCustomForm.mutateAsync(newFormDataValue);
        resetForm();
        setPopoverOpen(false);
      } catch (error) {
        // Error handling is done by the mutation hook
      }
    } else {
      const fieldExists = formData?.form?.some(
        (field: any) => field.fieldName === newField.fieldName,
      );
      if (!fieldExists) {
        const newFormData = {
          ...customEmployeeInformationForm,
          form: [...customEmployeeInformationForm?.form, newField],
        };
        try {
          await createCustomForm.mutateAsync(newFormData);
          resetForm();
          setPopoverOpen(false);
        } catch (error) {
          // Error handling is done by the mutation hook
        }
      } else {
        message.error(`The field ${newField.fieldName} already exists!`);
      }
    }
  };

  const formatFieldName = (name: string) => name.replace(/\s+/g, '_');

  const onFinish = (values: any) => {
    const formattedFieldName = formatFieldName(values.fieldName);
    const newField: FormField = {
      id: uuidv4(),
      fieldName: formattedFieldName,
      fieldType: values.fieldType,
      isActive: values.isActive,
      fieldValidation: values.fieldValidation,
      options: values.options || [],
    };

    addFieldIfNotExists(customEmployeeInformationForm, newField);
  };
  const handleFormFailed = () => {};
  const popoverContent = (
    <div
      className="w-80"
      id={`add-custom-field-popover-${formTitle}`}
      data-cy={`add-custom-field-popover-${formTitle}`}
    >
      <Form
        layout="vertical"
        form={form}
        title={formTitle}
        onFinish={onFinish}
        onFinishFailed={handleFormFailed}
        id={`add-custom-field-form-${formTitle}`}
        data-cy={`add-custom-field-form-${formTitle}`}
        initialValues={{
          fieldType,
          isActive,
          options,
        }}
      >
        <Form.Item
          label="Field Name"
          name="fieldName"
          id={`add-custom-field-name-${formTitle}`}
          data-cy={`add-custom-field-name-${formTitle}`}
          rules={[{ required: true, message: 'Field Name is required' }]}
        >
          <Input
            className="mt-2"
            value={fieldName}
            onChange={(e) => setFieldName(e.target.value)}
            id={`add-custom-field-name-input-${formTitle}`}
            data-cy={`add-custom-field-name-input-${formTitle}`}
          />
        </Form.Item>
        <Form.Item
          label="Field Type"
          name="fieldType"
          id={`add-custom-field-type-${formTitle}`}
          data-cy={`add-custom-field-type-${formTitle}`}
          rules={[{ required: true, message: 'Field Type is required' }]}
        >
          <Select
            value={fieldType}
            onChange={(value) => setFieldType(value)}
            id={`add-custom-field-type-select-${formTitle}`}
            data-cy={`add-custom-field-type-select-${formTitle}`}
          >
            <Option
              value="input"
              id={`add-custom-field-type-option-input-${formTitle}`}
              data-cy={`add-custom-field-type-option-input-${formTitle}`}
            >
              Input
            </Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Field Validation"
          name="fieldValidation"
          id={`add-custom-field-validation-${formTitle}`}
          data-cy={`add-custom-field-validation-${formTitle}`}
          rules={[{ required: true, message: 'Field Validation is required' }]}
        >
          <Select
            id={`add-custom-field-validation-select-${formTitle}`}
            data-cy={`add-custom-field-validation-select-${formTitle}`}
          >
            <Option
              value="text"
              id={`add-custom-field-validation-option-text-${formTitle}`}
              data-cy={`add-custom-field-validation-option-text-${formTitle}`}
            >
              Text
            </Option>
            <Option
              value="number"
              id={`add-custom-field-validation-option-number-${formTitle}`}
              data-cy={`add-custom-field-validation-option-number-${formTitle}`}
            >
              Number
            </Option>
            <Option
              value="email"
              id={`add-custom-field-validation-option-email-${formTitle}`}
              data-cy={`add-custom-field-validation-option-email-${formTitle}`}
            >
              Email
            </Option>
            <Option
              value="date"
              id={`add-custom-field-validation-option-date-${formTitle}`}
              data-cy={`add-custom-field-validation-option-date-${formTitle}`}
            >
              Date
            </Option>
            <Option
              value="url"
              id={`add-custom-field-validation-option-url-${formTitle}`}
              data-cy={`add-custom-field-validation-option-url-${formTitle}`}
            >
              URL
            </Option>
            <Option
              value="any"
              id={`add-custom-field-validation-option-any-${formTitle}`}
              data-cy={`add-custom-field-validation-option-any-${formTitle}`}
            >
              any
            </Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Is Active"
          name="isActive"
          valuePropName="checked"
          id={`add-custom-field-active-${formTitle}`}
          data-cy={`add-custom-field-active-${formTitle}`}
        >
          <Switch
            checked={isActive}
            onChange={(checked) => setIsActive(checked)}
            id={`add-custom-field-active-switch-${formTitle}`}
            data-cy={`add-custom-field-active-switch-${formTitle}`}
          />
        </Form.Item>
        <Divider data-cy={`add-custom-field-divider-${formTitle}`} />
        <Form.Item
          id={`add-custom-field-submit-${formTitle}`}
          data-cy={`add-custom-field-submit-${formTitle}`}
        >
          <Button
            type="primary"
            id={`addField${formTitle}`}
            data-cy={`addField${formTitle}`}
            htmlType="submit"
            style={{ width: '100%' }}
          >
            Add Field
          </Button>
        </Form.Item>
      </Form>
    </div>
  );

  return (
    <Card
      bordered={false}
      bodyStyle={{ padding: 0, border: 'none' }}
      id={`add-custom-field-card-${formTitle}`}
      data-cy={`add-custom-field-card-${formTitle}`}
    >
      <Row
        gutter={16}
        id={`add-custom-field-row-${formTitle}`}
        data-cy={`add-custom-field-row-${formTitle}`}
      >
        <Col
          xs={24}
          sm={24}
          className="flex justify-center items-center "
          id={`add-custom-field-col-${formTitle}`}
          data-cy={`add-custom-field-col-${formTitle}`}
        >
          <Form.Item
            className="font-semibold text-xs"
            id={`add-custom-field-form-item-${formTitle}`}
            data-cy={`add-custom-field-form-item-${formTitle}`}
          >
            <Popover
              content={popoverContent}
              title={formTitle}
              trigger="click"
              id={`add-custom-field-popover-wrapper-${formTitle}`}
              data-cy={`add-custom-field-popover-wrapper-${formTitle}`}
            >
              <Button
                id={`addCustomField${formTitle}`}
                data-cy={`addCustomField${formTitle}`}
                type="primary"
                className="text-white text-xs font-semibold"
                style={{ width: '100%' }}
              >
                Add Custom Field
              </Button>
            </Popover>
          </Form.Item>
        </Col>
      </Row>
    </Card>
  );
};

export default AddCustomField;
