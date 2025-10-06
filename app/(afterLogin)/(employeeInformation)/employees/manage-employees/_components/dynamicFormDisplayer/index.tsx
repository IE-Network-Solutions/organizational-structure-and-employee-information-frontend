import React from 'react';
import {
  Form,
  Input,
  DatePicker,
  Select,
  Switch,
  Checkbox,
  Col,
  Row,
} from 'antd';

const { Option } = Select;

interface DynamicFormFieldsProps {
  formTitle: string;
  fields: any[];
}

const DynamicFormFields: React.FC<DynamicFormFieldsProps> = ({
  formTitle,
  fields,
}) => {
  const renderField = (field: any) => {
    // Only render active fields
    if (!field.isActive) return null;

    const fieldName = [formTitle, field.fieldName];

    // Build rules array based on isRequired
    const rules: any[] = [];

    if (field.isRequired) {
      rules.push({
        required: true,
        message: `${field.fieldName.replace(/_/g, ' ')} is required`,
      });
    }

    // Add validation rules based on fieldValidation
    if (field.fieldValidation === 'email') {
      rules.push({
        type: 'email',
        message: 'Please enter a valid email',
      });
    } else if (field.fieldValidation === 'url') {
      rules.push({
        type: 'url',
        message: 'Please enter a valid URL',
      });
    } else if (field.fieldValidation === 'number') {
      rules.push({
        pattern: /^[0-9]+$/,
        message: 'Please enter only numbers',
      });
    } else if (field.fieldValidation === 'date') {
      rules.push({
        type: 'date',
        message: 'Please enter a valid date',
      });
    }

    const renderInput = () => {
      switch (field.fieldType) {
        case 'input':
          return (
            <Input
              placeholder={`Enter ${field.fieldName.replace(/_/g, ' ')}`}
            />
          );
        case 'datePicker':
          return (
            <DatePicker
              className="w-full"
              placeholder={`Select ${field.fieldName.replace(/_/g, ' ')}`}
            />
          );
        case 'select':
          return (
            <Select
              placeholder={`Select ${field.fieldName.replace(/_/g, ' ')}`}
              allowClear
            >
              {field.options?.map((option: string, index: number) => (
                <Option key={index} value={option}>
                  {option}
                </Option>
              ))}
            </Select>
          );
        case 'toggle':
          return <Switch />;
        case 'checkbox':
          return <Checkbox>{field.fieldName.replace(/_/g, ' ')}</Checkbox>;
        default:
          return <Input />;
      }
    };

    // Format the label
    const formatLabel = (name: string) => {
      const formatted = name.replace(/_/g, ' ');
      return formatted.charAt(0).toUpperCase() + formatted.slice(1);
    };

    return (
      <Col xs={24} sm={12} key={field.id}>
        <Form.Item
          className="font-semibold text-xs"
          name={fieldName}
          label={
            <span className="mb-1 font-semibold text-xs">
              {formatLabel(field.fieldName)}
              {!field.isRequired && (
                <span className="text-gray-400 font-normal ml-1">
                  (Optional)
                </span>
              )}
            </span>
          }
          rules={rules}
          valuePropName={
            field.fieldType === 'toggle' || field.fieldType === 'checkbox'
              ? 'checked'
              : 'value'
          }
        >
          {renderInput()}
        </Form.Item>
      </Col>
    );
  };

  return <Row gutter={16}>{fields?.map((field) => renderField(field))}</Row>;
};

export default DynamicFormFields;
