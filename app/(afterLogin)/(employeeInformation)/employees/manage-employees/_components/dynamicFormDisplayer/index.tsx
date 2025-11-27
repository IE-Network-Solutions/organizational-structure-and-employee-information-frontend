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

<<<<<<< HEAD
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
=======
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
      case 'select':
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
>>>>>>> 2fe159d0f751c0e0a8476d232d8c470a32da7672
                  {option}
                </Option>
              ))}
            </Select>
<<<<<<< HEAD
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
=======
          </Form.Item>
        );
      case 'datePicker':
        return (
          <Form.Item
            key={field.fieldName}
            {...commonProps}
            className="w-full"
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
>>>>>>> 2fe159d0f751c0e0a8476d232d8c470a32da7672
};

export default DynamicFormFields;
