'use client';

import React, { useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  message,
  Col,
  Row,
  Checkbox,
} from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { v4 as uuidv4 } from 'uuid';
import { useAddEmployeeInformationForm } from '@/store/server/features/employees/employeeManagment/employeInformationForm/mutations';
import type { FieldTypeValue } from './DraggableFieldTypeCard';

const { Option } = Select;

const OPTION_BASED_FIELD_TYPES: FieldTypeValue[] = [
  'checkbox',
  'radio',
  'dropdown',
];

interface FormFieldPayload {
  id: string;
  fieldName: string;
  fieldType: FieldTypeValue;
  isActive: boolean;
  isRequired?: boolean;
  fieldValidation: string;
  options: string[];
}

interface EditableFieldPayload {
  id?: string;
  fieldName?: string;
  fieldType?: string;
  fieldValidation?: string;
  isActive?: boolean;
  isRequired?: boolean;
  options?: string[];
  field?: {
    id?: string;
    fieldName?: string;
    fieldType?: string;
    fieldValidation?: string;
    isActive?: boolean;
    isRequired?: boolean;
    options?: string[];
  };
}

interface CustomFieldModalProps {
  open: boolean;
  formTitle: string;
  fieldType: FieldTypeValue;
  customEmployeeInformationForm: any;
  mode?: 'create' | 'edit';
  editField?: EditableFieldPayload | null;
  editFieldIndex?: number | null;
  onSuccess: (formTitle: string, action: 'create' | 'edit') => void;
  onCancel: () => void;
}

const formatFieldName = (name: string) => name.replace(/\s+/g, '_');

const CustomFieldModal: React.FC<CustomFieldModalProps> = ({
  open,
  formTitle,
  fieldType,
  customEmployeeInformationForm,
  mode = 'create',
  editField = null,
  editFieldIndex = null,
  onSuccess,
  onCancel,
}) => {
  const [form] = Form.useForm();
  const createCustomForm = useAddEmployeeInformationForm();
  const isOptionBasedField = OPTION_BASED_FIELD_TYPES.includes(fieldType);
  const isEditMode = mode === 'edit';

  useEffect(() => {
    if (!open) return;

    if (!isEditMode || !editField) {
      form.setFieldsValue({
        fieldName: undefined,
        fieldValidation: isOptionBasedField ? 'any' : undefined,
        options: isOptionBasedField ? ['', ''] : [],
        isActive: true,
        isRequired: false,
      });
      return;
    }

    const baseField = editField.field ?? editField;
    const options = Array.isArray(baseField.options) ? baseField.options : [];

    form.setFieldsValue({
      fieldName: baseField.fieldName ?? '',
      fieldValidation: isOptionBasedField
        ? 'any'
        : (baseField.fieldValidation ?? undefined),
      options: isOptionBasedField ? (options.length ? options : ['', '']) : [],
      isActive: baseField.isActive ?? true,
      isRequired: baseField.isRequired ?? false,
    });
  }, [open, isEditMode, editField, isOptionBasedField, form]);

  const handleFinish = async (values: any) => {
    const formattedFieldName = formatFieldName(values.fieldName);
    const options = isOptionBasedField
      ? (values.options || [])
          .map((option: string) => option?.trim())
          .filter(Boolean)
      : [];

    const newField: FormFieldPayload = {
      id: (editField?.id ?? editField?.field?.id ?? uuidv4()) as string,
      fieldName: formattedFieldName,
      fieldType,
      isActive: values.isActive ?? true,
      isRequired: values.isRequired ?? false,
      fieldValidation: isOptionBasedField ? 'any' : values.fieldValidation,
      options,
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
        onSuccess(formTitle, 'create');
      } catch {
        // Notification handled in mutation onSuccess
      }
      return;
    }

    const existingFields = Array.isArray(formData.form) ? formData.form : [];
    const targetIndex =
      typeof editFieldIndex === 'number' && editFieldIndex >= 0
        ? editFieldIndex
        : existingFields.findIndex(
            (f: any) =>
              (f.id || f.field?.id) === newField.id ||
              (f.fieldName || f.field?.fieldName) ===
                (editField?.fieldName || editField?.field?.fieldName),
          );

    const fieldExists = existingFields.some((f: any, index: number) => {
      if (isEditMode && index === targetIndex) return false;
      return (f.fieldName || f.field?.fieldName) === newField.fieldName;
    });
    if (fieldExists) {
      message.error(`The field ${newField.fieldName} already exists!`);
      return;
    }

    try {
      if (isEditMode && targetIndex >= 0) {
        const updatedForm = [...existingFields];
        const existingField = updatedForm[targetIndex] ?? {};
        updatedForm[targetIndex] = {
          ...existingField,
          ...newField,
        };

        await createCustomForm.mutateAsync({
          ...formData,
          form: updatedForm,
        });
        form.resetFields();
        onSuccess(formTitle, 'edit');
        return;
      }

      await createCustomForm.mutateAsync({
        ...formData,
        form: [...formData.form, newField],
      });
      form.resetFields();
      onSuccess(formTitle, 'create');
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
      title={isEditMode ? 'Edit Custom Field' : 'Custom Field'}
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
        requiredMark={false}
        initialValues={{
          isActive: true,
          fieldValidation: isOptionBasedField ? 'any' : undefined,
          options: isOptionBasedField ? ['', ''] : [],
        }}
        id="settings-custom-field-form"
        data-cy="settings-custom-field-form"
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label={
                <span
                  data-cy="settings-custom-field-name-label"
                  className="text-sm font-normal text-black mb-1"
                >
                  Field Name{' '}
                  <span
                    style={{ color: 'red' }}
                    data-cy={`basic-info-first-name-required`}
                  >
                    *
                  </span>
                </span>
              }
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
              label={
                <span
                  data-cy="settings-custom-field-validation-label"
                  className="text-sm font-normal text-black mb-1"
                >
                  Field Validation{' '}
                  <span
                    style={{ color: 'red' }}
                    data-cy={`basic-info-first-name-required`}
                  >
                    *
                  </span>
                </span>
              }
              name="fieldValidation"
              rules={
                isOptionBasedField
                  ? []
                  : [
                      {
                        required: true,
                        message: 'Field Validation is required',
                      },
                    ]
              }
              id="settings-custom-field-validation"
              data-cy="settings-custom-field-validation"
            >
              <Select
                placeholder="Select"
                allowClear
                disabled={isOptionBasedField}
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
                {isOptionBasedField
                  ? 'Validation is set to Any for option-based fields.'
                  : 'Select a field validation type.'}
              </p>
            </Form.Item>
          </Col>
        </Row>

        {isOptionBasedField && (
          <Form.List
            name="options"
            rules={[
              {
                validator: async (notUsed, options) => {
                  const cleanedOptions = (options || [])
                    .map((option: string) => option?.trim())
                    .filter(Boolean);
                  if (cleanedOptions.length < 2) {
                    return Promise.reject(
                      new Error('At least 2 options are required'),
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            {(fields, { add, remove }, { errors }) => (
              <div
                data-cy="settings-custom-field-options-container"
                className="mb-2"
              >
                <p
                  data-cy="settings-custom-field-options-label"
                  className="text-sm font-medium mb-2"
                >
                  Options
                </p>
                {fields.map((field, index) => (
                  <Form.Item
                    required={false}
                    key={field.key}
                    className={index === fields.length - 1 ? 'mb-2' : 'mb-3'}
                  >
                    <div
                      data-cy={`settings-custom-field-option-input-${index}`}
                      className="flex items-center gap-2"
                    >
                      <Form.Item
                        {...field}
                        validateTrigger={['onChange', 'onBlur']}
                        rules={[
                          {
                            required: true,
                            whitespace: true,
                            message: 'Option is required',
                          },
                        ]}
                        noStyle
                      >
                        <Input
                          placeholder={`Option ${index + 1}`}
                          id={`settings-custom-field-option-input-${index}`}
                          data-cy={`settings-custom-field-option-input-${index}`}
                        />
                      </Form.Item>
                      {fields.length > 1 && (
                        <MinusCircleOutlined
                          onClick={() => remove(field.name)}
                          className="text-[#ff4d4f]"
                        />
                      )}
                    </div>
                  </Form.Item>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                    id="settings-custom-field-add-option"
                    data-cy="settings-custom-field-add-option"
                  >
                    Add Option
                  </Button>
                  <Form.ErrorList errors={errors} />
                </Form.Item>
              </div>
            )}
          </Form.List>
        )}

        <Row gutter={16} className="mt-2">
          <Col span={12}>
            <div
              id="settings-custom-field-active"
              data-cy="settings-custom-field-active"
              className="border border-[#D9D9D9] rounded-md p-2 h-14"
            >
              <Form.Item name="isActive" valuePropName="checked" noStyle>
                <Checkbox
                  id="settings-custom-field-active-switch"
                  data-cy="settings-custom-field-active-switch"
                >
                  Active
                </Checkbox>
              </Form.Item>
              <p
                data-cy="settings-custom-field-active-description"
                className="text-xs text-gray-500 px-6"
              >
                If the field is active it will show.
              </p>
            </div>
          </Col>
          <Col span={12}>
            <div
              className="border border-[#D9D9D9] rounded-md p-2 h-14"
              data-cy="settings-custom-field-required-switch-wrapper"
            >
              <Form.Item
                name="isRequired"
                valuePropName="checked"
                id="settings-custom-field-required"
                data-cy="settings-custom-field-required"
              >
                <Checkbox
                  id="settings-custom-field-required-switch"
                  data-cy="settings-custom-field-required-switch"
                >
                  Required
                </Checkbox>
                <p
                  data-cy="settings-custom-field-required-description"
                  className="text-xs text-gray-500 px-6"
                >
                  If Selected it must be filled.
                </p>
              </Form.Item>
            </div>
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
              {isEditMode ? 'Save Changes' : 'Create Field'}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CustomFieldModal;
