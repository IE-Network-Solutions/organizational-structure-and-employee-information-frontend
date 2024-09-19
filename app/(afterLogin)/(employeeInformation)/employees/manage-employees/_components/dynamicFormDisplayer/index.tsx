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
  Button,
} from 'antd';
import { validateName } from '@/utils/validation';
import { RiDeleteBin6Line } from 'react-icons/ri';
import { useDeleteFormFields } from '@/store/server/features/employees/employeeManagment/employeInformationForm/mutations';

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
  const { mutate: deleteFormFields } = useDeleteFormFields();
  const renderField = (field: FormField) => {
    if (!field.isActive) return null; // Skip inactive fields

    const commonProps = {
      className: 'font-semibold text-xs',
      label: field.fieldName,
      name: [formTitle, field.fieldName],
      id: `${formTitle}${field.fieldName}`,
      rules: [
        field.fieldType === 'input'
          ? {
              validator: (rule: any, value: any) =>
                validateName(field.fieldName, value)
                  ? Promise.reject(
                      new Error(validateName(field.fieldName, value) || ''),
                    )
                  : Promise.resolve(),
            }
          : { required: true, message: `${field.fieldName} is required` },
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

  const hanleDeleteCustomField = (id: string) => {
    const newField = fields?.filter((filedItem) => filedItem.id !== id);
    const newFormDataValue = {
      formTitle: formTitle,
      form: newField,
    };
    deleteFormFields(newFormDataValue);
  };

  const renderRows = () => {
    const rows = [];
    for (let i = 0; i < fields?.length; i++) {
      rows.push(
        // <Row gutter={16} key={`row-${i}`}>
        //   <Col xs={24} sm={12}>
        //     {fields[i] && renderField(fields[i])}
        //   </Col>
        //   <Col xs={24} sm={12}>
        //     {fields[i + 1] && renderField(fields[i + 1])}
        //   </Col>
        // </Row>,
        <Row gutter={16} key={`row-${i}`} align="middle">
          <Col xs={24} sm={22}>
            {fields[i] && renderField(fields[i])}
          </Col>
          <Col xs={24} sm={2}>
            <Button
              htmlType="button"
              className="bg-red-600 px-[8%] text-white disabled:bg-gray-400"
              danger
              icon={<RiDeleteBin6Line />}
              onClick={() => hanleDeleteCustomField(fields[i].id)} // You should define handleDelete to remove the field
              style={{
                border: '1px solid red', // You can change the color or width as needed
                borderRadius: '4px', // Optional: Adds rounded corners to the button
              }}
            />
          </Col>
        </Row>,
      );
    }
    return rows;
  };

  return <>{renderRows()}</>;
};

export default DynamicFormFields;
