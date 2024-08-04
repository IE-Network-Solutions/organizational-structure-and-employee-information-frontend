'use client';

import React, { useState } from 'react';
import { Card, Row, Col, Form, Input, Select, Switch, Button, Space, Divider, Popover } from 'antd';
import { v4 as uuidv4 } from 'uuid';
import { FormField, useEmployeeManagmentStore } from '@/store/uistate/features/employees/employeeManagment';
import { useAddEmployeeInformationForm } from '@/store/server/features/employees/employeeManagment/employeInformationForm/mutations';
const { Option } = Select;

interface PropsTypes {
  formTitle: string;
  customEmployeeInformationForm:any,
}

const AddCustomField: React.FC<PropsTypes> = ({ formTitle,customEmployeeInformationForm }) => {
  const [fieldName, setFieldName] = useState('');
  const [fieldType, setFieldType] = useState<'input' | 'datePicker' | 'select' | 'toggle' | 'checkbox'>('input');
  const [isActive, setIsActive] = useState(true);
  const [options, setOptions] = useState<string[]>(['', '']);
  const { customFormData, setCustomFormData } = useEmployeeManagmentStore();

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };
  const createCUstomFieldMutation=useAddEmployeeInformationForm();

  const handleFormSubmit = () => {
    const newField: FormField = {
      id: uuidv4(),
      fieldName,
      fieldType,
      isActive,
      options: (fieldType === 'select' || fieldType === 'checkbox' || fieldType === 'toggle') ? options : undefined,
    };

    const updatedForms = (customFormData?.forms || []).map((form:any) => {
      if (form.formTitle === formTitle) {
        return { ...form, form: [...form.form, newField] };
      }
      return form;
    });

    // setCustomFormData({ ...customFormData, forms: updatedForms });
    const newCustomFormData={ ...customFormData, forms: updatedForms };
    createCUstomFieldMutation.mutate(newCustomFormData);
    setFieldName('');
    setFieldType('input');
    setIsActive(true);
    setOptions(['', '']);
  };

  const popoverContent = (
    <Form layout="vertical">
      <Form.Item label="Field Name">
        <Input value={fieldName} onChange={(e) => setFieldName(e.target.value)} />
      </Form.Item>
      <Form.Item label="Field Type">
        <Select value={fieldType} onChange={(value) => setFieldType(value)}>
          <Option value="input">Input</Option>
          <Option value="datePicker">Date Picker</Option>
          <Option value="select">Select</Option>
          <Option value="toggle">Toggle</Option>
          <Option value="checkbox">Checkbox</Option>
        </Select>
      </Form.Item>
      <Form.Item label="Is Active">
        <Switch checked={isActive} onChange={(checked) => setIsActive(checked)} />
      </Form.Item>
      {(fieldType === 'select' || fieldType === 'checkbox') && (
        <Form.Item label="Options">
          {options.map((option, index) => (
            <Space key={index} direction="vertical" style={{ display: 'block', marginBottom: 8 }}>
              <Input
                value={option}
                placeholder={`Option ${index + 1}`}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                style={{ marginBottom: 8 }}
              />
            </Space>
          ))}
          <Button type="dashed" onClick={() => setOptions([...options, ''])} style={{ width: '100%' }}>
            Add Option
          </Button>
        </Form.Item>
      )}
      {fieldType === 'toggle' && (
        <Form.Item label="Toggle Options">
          {options.slice(0, 2).map((option, index) => (
            <Space key={index} direction="vertical" style={{ display: 'block', marginBottom: 8 }}>
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
      <Button type="primary" onClick={handleFormSubmit} style={{ width: '100%' }}>
        Add Field
      </Button>
    </Form>
  );

  return (
    <Card>
      <Row gutter={16}>
        <Col xs={24} sm={24} className='flex justify-center items-center'>
          <Form.Item className='font-semibold text-xs'>
            <Popover content={popoverContent} title="Add Custom Field" trigger="click">
              <Button
                type="primary"
                className='text-white text-xs font-semibold'
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
