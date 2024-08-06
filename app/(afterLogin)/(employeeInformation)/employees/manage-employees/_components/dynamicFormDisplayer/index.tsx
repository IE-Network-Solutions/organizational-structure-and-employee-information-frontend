import React from 'react';
import { Form, Input, Select, DatePicker, Checkbox, Switch, Row, Col } from 'antd';

const { Option } = Select;

interface FormField {
  id: string;
  fieldType: string;
  isActive: boolean;
  fieldName: string;
  options: any[];
}

interface DynamicFormFieldsProps {
  fields: FormField[];
}

const DynamicFormFields: React.FC<DynamicFormFieldsProps> = ({ fields }) => {
  const renderField = (field: FormField) => {
    switch (field.fieldType) {
      case "input":
        return (
          <Form.Item
            className='font-semibold text-xs'
            label={field.fieldName}
            name={field.fieldName}
            rules={[{ required: true, message: `${field.fieldName} is required` }]}
          >
            <Input />
          </Form.Item>
        );
      case "select":
        return (
          <Form.Item
            className='font-semibold text-xs'
            label={field.fieldName}
            name={field.fieldName}
            rules={[{ required: true, message: `${field.fieldName} is required` }]}
          >
            <Select>
              {field.options?.map((option: string) => (
                <Option key={option} value={option}>{option}</Option>
              ))}
            </Select>
          </Form.Item>
        );
      case "datePicker":
        return (
          <Form.Item
            className='font-semibold text-xs w-full'
            label={field.fieldName}
            name={field.fieldName}
            rules={[{ required: true, message: `${field.fieldName} is required` }]}
          >
            <DatePicker />
          </Form.Item>
        );
      case "checkbox":
        return (
          <Form.Item
          className='font-semibold text-xs'
          label={field.fieldName}
          name={field.fieldName}
          rules={[{ required: true, message: `${field.fieldName} is required` }]}
        >
          <Checkbox.Group>
            {field.options.map(option => (
              <Checkbox key={option} value={option}>{option}</Checkbox>
            ))}
          </Checkbox.Group>
        </Form.Item>
        );
      case "toggle":
        return (
          <Form.Item
            className='font-semibold text-xs'
            label={field.fieldName}
            name={field.fieldName}
            valuePropName="checked"
            rules={[{ required: true, message: `${field.fieldName} is required` }]}
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
        </Row>
      );
    }
    return rows;
  };

  return <>{renderRows()}</>;
};

export default DynamicFormFields;
