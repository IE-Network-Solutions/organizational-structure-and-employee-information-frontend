'use client';

import React from 'react';
import { Modal, Form, Input, Select, Switch, Button, message } from 'antd';
import { v4 as uuidv4 } from 'uuid';
import { useAddEmployeeInformationForm } from '@/store/server/features/employees/employeeManagment/employeInformationForm/mutations';

const { Option } = Select;

export type FieldTypeValue =
  | 'input'
  | 'datePicker'
  | 'select'
  | 'toggle'
  | 'checkbox';

interface FormFieldPayload {
  id: string;
  fieldName: string;
  fieldType: FieldTypeValue;
  isActive: boolean;
  fieldValidation: string;
  options: string[];
}

interface CustomFieldModalProps {
  open: boolean;
  formTitle: string;
  fieldType: FieldTypeValue;
  customEmployeeInformationForm: any;
  onSuccess: (formTitle: string) => void;
  onCancel: () => void;
}

const formatFieldName = (name: string) => name.replace(/\s+/g, '_');

const CustomFieldModal: React.FC<CustomFieldModalProps> = ({
  open,
  formTitle,
  fieldType,
  customEmployeeInformationForm,
  onSuccess,
  onCancel,
}) => {
  const [form] = Form.useForm();
  const createCustomForm = useAddEmployeeInformationForm();

  const handleFinish = async (values: any) => {
    const formattedFieldName = formatFieldName(values.fieldName);
    const newField: FormFieldPayload = {
      id: uuidv4(),
      fieldName: formattedFieldName,
      fieldType,
      isActive: values.isActive ?? true,
      fieldValidation: values.fieldValidation,
      options: values.options || [],
    };

    const formData = customEmployeeInformationForm;
    const hasExistingForm =
      formData &&
      typeof formData === 'object' &&
      Array.isArray(formData?.form) &&
      formData.form.length >= 1;

    if (!hasExistingForm) {
      try {
        await createCustomForm.mutateAsync({ formTitle, form: [newField] });
        form.resetFields();
        onSuccess(formTitle);
      } catch {
        // Notification handled in mutation onSuccess
      }
      return;
    }

    const fieldExists = formData.form.some(
      (f: any) => (f.fieldName || f.field?.fieldName) === newField.fieldName,
    );
    if (fieldExists) {
      message.error(`The field ${newField.fieldName} already exists!`);
      return;
    }

    try {
      await createCustomForm.mutateAsync({
        ...formData,
        form: [...formData.form, newField],
      });
      form.resetFields();
      onSuccess(formTitle);
    } catch {
      // Notification handled in mutation
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title="Custom Field"
      open={open}
      onCancel={handleCancel}
      footer={null}
      destroyOnClose
      data-cy="settings-custom-field-modal"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{ isActive: true, fieldValidation: undefined }}
        id="settings-custom-field-form"
        data-cy="settings-custom-field-form"
      >
        <Form.Item
          label="Field Name"
          name="fieldName"
          rules={[{ required: true, message: 'Field Name is required' }]}
          id="settings-custom-field-name"
          data-cy="settings-custom-field-name"
        >
          <Input
            placeholder="Input"
            id="settings-custom-field-name-input"
            data-cy="settings-custom-field-name-input"
          />
        </Form.Item>

        <Form.Item
          label="Field Validation"
          name="fieldValidation"
          rules={[{ required: true, message: 'Field Validation is required' }]}
          id="settings-custom-field-validation"
          data-cy="settings-custom-field-validation"
        >
          <Select
            placeholder="Select"
            allowClear
            id="settings-custom-field-validation-select"
            data-cy="settings-custom-field-validation-select"
          >
            <Option value="text">Text</Option>
            <Option value="number">Number</Option>
            <Option value="email">Email</Option>
            <Option value="date">Date</Option>
            <Option value="url">URL</Option>
            <Option value="any">Any</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Active"
          name="isActive"
          valuePropName="checked"
          id="settings-custom-field-active"
          data-cy="settings-custom-field-active"
        >
          <Switch
            id="settings-custom-field-active-switch"
            data-cy="settings-custom-field-active-switch"
          />
        </Form.Item>
        <p className="text-xs text-gray-500 -mt-2 mb-4">
          If the field is active it will show.
        </p>

        <Form.Item className="mb-0">
          <div className="flex justify-end gap-2 pt-2">
            <Button
              onClick={handleCancel}
              id="settings-custom-field-cancel"
              data-cy="settings-custom-field-cancel"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              id="settings-custom-field-create"
              data-cy="settings-custom-field-create"
            >
              Create Field
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CustomFieldModal;
