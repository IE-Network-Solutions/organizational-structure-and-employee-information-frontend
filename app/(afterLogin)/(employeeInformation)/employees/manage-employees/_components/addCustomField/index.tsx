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

  const addFieldIfNotExists = (formData: any, newField: FormField) => {
    if (formData?.length < 1) {
      const newFormDataValue = {
        formTitle: formTitle,
        form: [newField],
      };
      createCustomForm.mutate(newFormDataValue);
    } else {
      const fieldExists = formData?.form?.some(
        (field: any) => field.fieldName === newField.fieldName,
      );
      if (!fieldExists) {
        const newFormData = {
          ...customEmployeeInformationForm,
          form: [...customEmployeeInformationForm?.form, newField],
        };
        createCustomForm.mutate(newFormData);
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
    form.resetFields();
    setOptions([]);
    setFieldName('');
    setFieldType('input');
    setIsActive(true);
  };
  const handleFormFailed = () => {};
  const popoverContent = (
    <Form
      layout="vertical"
      form={form}
      title={formTitle}
      onFinish={onFinish}
      onFinishFailed={handleFormFailed}
      initialValues={{
        fieldType,
        isActive,
        options,
      }}
    >
      <Form.Item
        label="Field Name"
        name="fieldName"
        rules={[{ required: true, message: 'Field Name is required' }]}
      >
        <Input
          value={fieldName}
          onChange={(e) => setFieldName(e.target.value)}
        />
      </Form.Item>
      <Form.Item
        label="Field Type"
        name="fieldType"
        rules={[{ required: true, message: 'Field Type is required' }]}
      >
        <Select value={fieldType} onChange={(value) => setFieldType(value)}>
          <Option value="input">Input</Option>
        </Select>
      </Form.Item>

      <Form.Item
        label="Field Validation"
        name="fieldValidation"
        rules={[{ required: true, message: 'Field Validation is required' }]}
      >
        <Select>
          <Option value="text">Text</Option>
          <Option value="number">Number</Option>
          <Option value="email">Email</Option>
          <Option value="date">Date</Option>
          <Option value="url">URL</Option>
          <Option value="any">any</Option>
        </Select>
      </Form.Item>

      <Form.Item label="Is Active" name="isActive" valuePropName="checked">
        <Switch
          checked={isActive}
          onChange={(checked) => setIsActive(checked)}
        />
      </Form.Item>
      <Divider />
      <Form.Item>
        <Button
          type="primary"
          id={`addField${formTitle}`}
          htmlType="submit"
          style={{ width: '100%' }}
        >
          Add Field
        </Button>
      </Form.Item>
    </Form>
  );

  return (
    <Card>
      <Row gutter={16}>
        <Col xs={24} sm={24} className="flex justify-center items-center">
          <Form.Item className="font-semibold text-xs">
            <Popover content={popoverContent} title={formTitle} trigger="click">
              <Button
                id={`addCustomField${formTitle}`}
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
