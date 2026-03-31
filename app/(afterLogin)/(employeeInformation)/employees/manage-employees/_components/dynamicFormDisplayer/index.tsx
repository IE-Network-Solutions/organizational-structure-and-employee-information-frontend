import React from 'react';
import {
  Form,
  Input,
  Select,
  DatePicker,
  Checkbox,
  Radio,
  Switch,
  Row,
  Col,
} from 'antd';
import { validateField } from '../formValidator';

const { Option } = Select;

interface FormField {
  id: string;
  fieldType:
    | 'input'
    | 'textArea'
    | 'select'
    | 'datePicker'
    | 'checkbox'
    | 'radio'
    | 'dropdown'
    | 'toggle';
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
      className: 'text-sm font-normal text-[#030712]',
      label: (
        <span
          className="mb-1 text-sm font-normal text-[#030712]"
          data-cy={`dynamic-form-field-label-${field.fieldName}`}
        >
          {field.fieldName}
        </span>
      ),
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
          <Form.Item
            key={field.fieldName}
            {...commonProps}
            id={`${formTitle}-${field.fieldName}-input-form-item`}
            data-cy={`${formTitle}-${field.fieldName}-input-form-item`}
          >
            <Input
              id={`${formTitle}-${field.fieldName}-input`}
              data-cy={`${formTitle}-${field.fieldName}-input`}
            />
          </Form.Item>
        );
      case 'textArea':
        return (
          <Form.Item
            key={field.fieldName}
            {...commonProps}
            id={`${formTitle}-${field.fieldName}-textarea-form-item`}
            data-cy={`${formTitle}-${field.fieldName}-textarea-form-item`}
          >
            <Input.TextArea
              rows={4}
              id={`${formTitle}-${field.fieldName}-textarea`}
              data-cy={`${formTitle}-${field.fieldName}-textarea`}
            />
          </Form.Item>
        );
      case 'select':
      case 'dropdown':
        return (
          <Form.Item
            key={field.fieldName}
            {...commonProps}
            id={`${formTitle}-${field.fieldName}-select-form-item`}
            data-cy={`${formTitle}-${field.fieldName}-select-form-item`}
          >
            <Select
              id={`${formTitle}-${field.fieldName}-select`}
              data-cy={`${formTitle}-${field.fieldName}-select`}
            >
              {field.options?.map((option) => (
                <Option
                  key={option}
                  value={option}
                  id={`${formTitle}-${field.fieldName}-option-${option}`}
                  data-cy={`${formTitle}-${field.fieldName}-option-${option}`}
                >
                  {option}
                </Option>
              ))}
            </Select>
          </Form.Item>
        );
      case 'datePicker':
        return (
          <Form.Item
            key={field.fieldName}
            {...commonProps}
            className="font-semibold text-xs"
            id={`${formTitle}-${field.fieldName}-datepicker-form-item`}
            data-cy={`${formTitle}-${field.fieldName}-datepicker-form-item`}
          >
            <DatePicker
              id={`${formTitle}-${field.fieldName}-datepicker`}
              data-cy={`${formTitle}-${field.fieldName}-datepicker`}
            />
          </Form.Item>
        );
      case 'checkbox':
        return (
          <Form.Item
            key={field.fieldName}
            {...commonProps}
            id={`${formTitle}-${field.fieldName}-checkbox-group-form-item`}
            data-cy={`${formTitle}-${field.fieldName}-checkbox-group-form-item`}
          >
            <Checkbox.Group
              data-cy={`${formTitle}-${field.fieldName}-checkbox-group`}
            >
              {field.options?.map((option) => (
                <Checkbox
                  key={option}
                  value={option}
                  id={`${formTitle}-${field.fieldName}-checkbox-${option}`}
                  data-cy={`${formTitle}-${field.fieldName}-checkbox-${option}`}
                >
                  {option}
                </Checkbox>
              ))}
            </Checkbox.Group>
          </Form.Item>
        );
      case 'radio':
        return (
          <Form.Item
            key={field.fieldName}
            {...commonProps}
            id={`${formTitle}-${field.fieldName}-radio-group-form-item`}
            data-cy={`${formTitle}-${field.fieldName}-radio-group-form-item`}
          >
            <Radio.Group
              data-cy={`${formTitle}-${field.fieldName}-radio-group`}
            >
              {field.options?.map((option) => (
                <Radio
                  key={option}
                  value={option}
                  id={`${formTitle}-${field.fieldName}-radio-${option}`}
                  data-cy={`${formTitle}-${field.fieldName}-radio-${option}`}
                >
                  {option}
                </Radio>
              ))}
            </Radio.Group>
          </Form.Item>
        );
      case 'toggle':
        return (
          <Form.Item
            key={field.fieldName}
            {...commonProps}
            valuePropName="checked"
            id={`${formTitle}-${field.fieldName}-switch-form-item`}
            data-cy={`${formTitle}-${field.fieldName}-switch-form-item`}
          >
            <Switch
              id={`${formTitle}-${field.fieldName}-switch`}
              data-cy={`${formTitle}-${field.fieldName}-switch`}
            />
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
        <Row
          gutter={16}
          key={`row-${i}`}
          id={`${formTitle}-dynamic-row-${i}`}
          data-cy={`${formTitle}-dynamic-row-${i}`}
        >
          <Col
            xs={24}
            sm={12}
            id={`${formTitle}-dynamic-col-${i}`}
            data-cy={`${formTitle}-dynamic-col-${i}`}
          >
            {fields[i] && renderField(fields[i])}
          </Col>
          <Col
            xs={24}
            sm={12}
            id={`${formTitle}-dynamic-col-${i + 1}`}
            data-cy={`${formTitle}-dynamic-col-${i + 1}`}
          >
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
