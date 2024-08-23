import React from 'react';
import {
  Form,
  Input,
  Select,
  DatePicker,
  Checkbox,
  Switch,
  Row,
  Col,
} from 'antd';

const { Option } = Select;

interface FormField {
  id: string;
  fieldType: 'input' | 'select' | 'datePicker' | 'checkbox' | 'toggle';
  isActive: boolean;
  fieldName: string;
  options?: string[]; // Options for 'select', 'checkbox'
}

interface DynamicFormFieldsProps {
  fields: FormField[];
  formTitle: string;
}

const DynamicFormFields: React.FC<DynamicFormFieldsProps> = ({
  formTitle,
  fields,
}) => {
  const renderField = (field: FormField) => {
    if (!field.isActive) return null; // Skip inactive fields

    const commonProps = {
      className: 'font-semibold text-xs',
      label: field.fieldName,
      name: [formTitle, field.fieldName],
      id: `${formTitle}${field.fieldName}`,
      rules: [{ required: true, message: `${field.fieldName} is required` }],
    };

    switch (field.fieldType) {
      case 'input':
        return (
          <Form.Item {...commonProps}>
            <Input />
          </Form.Item>
        );
      case 'select':
        return (
          <Form.Item {...commonProps}>
            <Select>
              {field.options?.map((option) => (
                <Option key={option} value={option}>
                  {option}
                </Option>
              ))}
            </Select>
          </Form.Item>
        );
      case 'datePicker':
        return (
          <Form.Item {...commonProps} className="w-full">
            <DatePicker />
          </Form.Item>
        );
      case 'checkbox':
        return (
          <Form.Item {...commonProps}>
            <Checkbox.Group>
              {field.options?.map((option) => (
                <Checkbox key={option} value={option}>
                  {option}
                </Checkbox>
              ))}
            </Checkbox.Group>
          </Form.Item>
        );
      case 'toggle':
        return (
          <Form.Item {...commonProps} valuePropName="checked">
            <Switch />
          </Form.Item>
        );
      default:
        return null;
    }
  };

  const renderRows = () => {
    const rows = [];
    for (let i = 0; i < fields?.length; i += 2) {
      rows.push(
        <Row gutter={16} key={`row-${i}`}>
          <Col xs={24} sm={12}>
            {fields[i] && renderField(fields[i])}
          </Col>
          <Col xs={24} sm={12}>
            {fields[i + 1] && renderField(fields[i + 1])}
          </Col>
        </Row>,
      );
    }
    return rows;
  };

  return <>{renderRows()}</>;
};

export default DynamicFormFields;
