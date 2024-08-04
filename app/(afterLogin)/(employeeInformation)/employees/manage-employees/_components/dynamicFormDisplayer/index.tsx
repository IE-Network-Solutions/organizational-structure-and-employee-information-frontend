import React from 'react';
import { Form, Input, Select, DatePicker, Checkbox, Switch, Row, Col } from 'antd';

const { Option } = Select;
export interface Field {
    id: string;
    fieldName: string;
    fieldType: 'input' | 'select' | 'datePicker' | 'checkbox' | 'toggle';
    isActive: boolean;
    options?: string[];
  }
interface DynamicFormFieldsProps {
  fields: Field[];
}

const DynamicFormFields: React.FC<DynamicFormFieldsProps> = ({ fields }) => {
  return (
    <>
      {fields.map((field) => {
        if (field.isActive) {
          switch (field.fieldType) {
            case 'input':
              return (
                <Row gutter={16} key={field.id}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label={field.fieldName}
                      name={field.fieldName}
                      rules={[{ required: true, message: `${field.fieldName} is required` }]}
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                </Row>
              );
            case 'select':
              return (
                <Row gutter={16} key={field.id}>
                  <Col xs={24} sm={12}>
                    <Form.Item
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
                  </Col>
                </Row>
              );
            case 'datePicker':
              return (
                <Row gutter={16} key={field.id}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label={field.fieldName}
                      name={field.fieldName}
                      rules={[{ required: true, message: `${field.fieldName} is required` }]}
                    >
                      <DatePicker />
                    </Form.Item>
                  </Col>
                </Row>
              );
            case 'checkbox':
              return (
                <Row gutter={16} key={field.id}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label={field.fieldName}
                      name={field.fieldName}
                      valuePropName="checked"
                      rules={[{ required: true, message: `${field.fieldName} is required` }]}
                    >
                      <Checkbox>{field.fieldName}</Checkbox>
                    </Form.Item>
                  </Col>
                </Row>
              );
            case 'toggle':
              return (
                <Row gutter={16} key={field.id}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label={field.fieldName}
                      name={field.fieldName}
                      valuePropName="checked"
                      rules={[{ required: true, message: `${field.fieldName} is required` }]}
                    >
                      <Switch />
                    </Form.Item>
                  </Col>
                </Row>
              );
            default:
              return null;
          }
        }
        return null;
      })}
    </>
  );
};

export default DynamicFormFields;
