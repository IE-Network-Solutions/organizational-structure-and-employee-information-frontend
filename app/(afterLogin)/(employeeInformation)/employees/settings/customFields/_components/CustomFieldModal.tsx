'use client';

import React from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  message,
  Col,
  Row,
  Radio,
} from 'antd';
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
      zIndex={10002}
      width={600}
      centered
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{ isActive: true, fieldValidation: undefined }}
        id="settings-custom-field-form"
        data-cy="settings-custom-field-form"
      >
        <Row gutter={16}>
          <Col span={12}>
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
                className="h-10"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Field Validation"
              name="fieldValidation"
              rules={[
                { required: true, message: 'Field Validation is required' },
              ]}
              id="settings-custom-field-validation"
              data-cy="settings-custom-field-validation"
            >
              <Select
                placeholder="Select"
                allowClear
                onChange={(value) =>
                  form.setFieldsValue({ fieldValidation: value ?? undefined })
                }
                id="settings-custom-field-validation-select"
                data-cy="settings-custom-field-validation-select"
                className="h-10"
              >
                <Option value="text">Text</Option>
                <Option value="number">Number</Option>
                <Option value="email">Email</Option>
                <Option value="date">Date</Option>
                <Option value="url">URL</Option>
                <Option value="any">Any</Option>
              </Select>
              <p
                data-cy="settings-custom-field-active-description"
                className="text-xs text-gray-500 py-0.5"
              >
                Select a field validation type.
              </p>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16} className="mt-2">
          <Col span={12}>
            <Form.Item
              name="isActive"
              valuePropName="checked"
              id="settings-custom-field-active"
              data-cy="settings-custom-field-active"
            >
              <div
                className="border border-[#D9D9D9] rounded-md p-2 h-14"
                data-cy="settings-custom-field-active-switch-wrapper"
              >
                <Radio
                  id="settings-custom-field-active-switch"
                  data-cy="settings-custom-field-active-switch"
                >
                  Active
                </Radio>
                <p
                  data-cy="settings-custom-field-active-description"
                  className="text-xs text-gray-500 px-6"
                >
                  If the field is active it will show.
                </p>
              </div>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="isRequired"
              valuePropName="checked"
              id="settings-custom-field-required"
              data-cy="settings-custom-field-required"
            >
              <div
                className="border border-[#D9D9D9] rounded-md p-2 h-14"
                data-cy="settings-custom-field-required-switch-wrapper"
              >
                <Radio
                  id="settings-custom-field-required-switch"
                  data-cy="settings-custom-field-required-switch"
                >
                  Required
                </Radio>
                <p
                  data-cy="settings-custom-field-required-description"
                  className="text-xs text-gray-500 px-6"
                >
                  If Selected it must be filled.
                </p>
              </div>
            </Form.Item>{' '}
          </Col>
        </Row>

        <Form.Item className="mb-0">
          <div
            data-cy="settings-custom-field-buttons-container"
            className="flex justify-end gap-2 pt-2"
          >
            <Button
              type="default"
              onClick={handleCancel}
              id="settings-custom-field-cancel"
              data-cy="settings-custom-field-cancel"
              className="border border-[#D9D9D9] text-[#4d4d4d] font-normal"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              id="settings-custom-field-create"
              data-cy="settings-custom-field-create"
              className="text-white font-normal"
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
