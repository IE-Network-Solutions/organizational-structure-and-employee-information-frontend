import React, { useState } from 'react';
import {
  Form,
  Input,
  Button,
  Select,
  Switch,
  Space,
  Popover,
  Card,
  Row,
  Col,
  Divider,
  message,
} from 'antd';
import { v4 as uuidv4 } from 'uuid'; // Ensure uuidv4 is imported
import { useAddEmployeeInformationForm } from '@/store/server/features/employees/employeeManagment/employeInformationForm/mutations';

const { Option } = Select;

interface FormField {
  id: string;
  fieldName: string;
  fieldType: 'input' | 'datePicker' | 'select' | 'toggle' | 'checkbox';
  isActive: boolean;
  options: string[];
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

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addFieldIfNotExists = (formData: any, newField: FormField) => {
    const fieldExists = formData?.some(
      (field: any) => field.fieldName === newField.fieldName,
    );
    if (!fieldExists) {
      const newFormData = {
        ...customEmployeeInformationForm,
        form: [...customEmployeeInformationForm.form, newField],
      };
      createCustomForm.mutate(newFormData);
    } else {
      message.error(`The field ${newField.fieldName} already exists!`);
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
      options: values.options || [],
    };
    addFieldIfNotExists(customEmployeeInformationForm.form, newField);
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
          <Option value="select">Select</Option>
          <Option value="datePicker">Date Picker</Option>
          <Option value="toggle">Toggle</Option>
          <Option value="checkbox">Checkbox</Option>
        </Select>
      </Form.Item>
      <Form.Item label="Is Active" name="isActive" valuePropName="checked">
        <Switch
          checked={isActive}
          onChange={(checked) => setIsActive(checked)}
        />
      </Form.Item>
      {(fieldType === 'select' || fieldType === 'checkbox') && (
        <Form.Item label="Options" name="options">
          {options.map((option, index) => (
            <Space
              key={index}
              direction="vertical"
              style={{ display: 'block', marginBottom: 8 }}
            >
              <Input
                value={option}
                placeholder={`Option ${index + 1}`}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                style={{ marginBottom: 8 }}
              />
            </Space>
          ))}
          <Button
            type="dashed"
            onClick={() => setOptions([...options, ''])}
            style={{ width: '100%' }}
          >
            Add Option
          </Button>
        </Form.Item>
      )}
      {fieldType === 'toggle' && (
        <Form.Item label="Toggle Options" name="options">
          {options.slice(0, 2).map((option, index) => (
            <Space
              key={index}
              direction="vertical"
              style={{ display: 'block', marginBottom: 8 }}
            >
              <Input
                value={option}
                placeholder={`Toggle ${index + 1} Value`}
                onChange={(e) => handleOptionChange(index, e.target.value)}
              />
            </Space>
          ))}
        </Form.Item>
      )}
      <Divider />
      <Form.Item>
        <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
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
