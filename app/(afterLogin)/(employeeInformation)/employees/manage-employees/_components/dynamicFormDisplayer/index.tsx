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
import { validateField } from '../formValidator';

const { Option } = Select;

interface FormField {
  id: string;
  fieldType: 'input' | 'select' | 'datePicker' | 'checkbox' | 'toggle';
  isActive: boolean;
  fieldName: string;
  fieldValidation: string;
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
      rules: [
        {
          /*  eslint-disable-next-line @typescript-eslint/naming-convention */
          validator: (_rule: any, value: any) => {
            /*  eslint-enable-next-line @typescript-eslint/naming-convention */
            const validationError = validateField(
              field.fieldType,
              value,
              field.fieldValidation,
            );
            if (validationError)
              return Promise.reject(new Error(validationError));
            // if (field.fieldType === 'input') {
            //   const nameError = validateName(field.fieldName, value);
            //   if (nameError) return Promise.reject(new Error(nameError));
            // }
            return Promise.resolve();
          },
        },
      ],
    };

    switch (field.fieldType) {
      case 'input':
        return (
          <Form.Item key={field.fieldName} {...commonProps}>
            <Input />
          </Form.Item>
        );
      case 'select':
        return (
          <Form.Item key={field.fieldName} {...commonProps}>
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
          <Form.Item key={field.fieldName} {...commonProps} className="w-full">
            <DatePicker />
          </Form.Item>
        );
      case 'checkbox':
        return (
          <Form.Item key={field.fieldName} {...commonProps}>
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
          <Form.Item
            key={field.fieldName}
            {...commonProps}
            valuePropName="checked"
          >
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
