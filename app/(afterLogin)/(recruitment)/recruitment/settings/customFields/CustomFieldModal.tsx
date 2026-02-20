'use client';

import { useCreateCustomFieldsTemplate } from '@/store/server/features/recruitment/settings/mutation';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { Button, Form, Input, Modal, Radio, Select } from 'antd';
import React, { useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

const FIELD_VALIDATION_OPTIONS = [
  { label: 'Text Field', value: 'short_text' },
  { label: 'Text Area', value: 'paragraph' },
  { label: 'Checkbox', value: 'checkbox' },
  { label: 'Radio box', value: 'multiple_choice' },
  { label: 'Dropdown', value: 'dropdown' },
];

function getDefaultFieldOptions(
  fieldType: string,
): { id: string; value: string }[] {
  if (fieldType === 'multiple_choice' || fieldType === 'checkbox') {
    return [
      { id: uuidv4(), value: 'Option 1' },
      { id: uuidv4(), value: 'Option 2' },
    ];
  }
  return [];
}

interface CustomFieldModalProps {
  open: boolean;
  onClose: () => void;
  /** Pre-selected field type when opened from drag-and-drop */
  initialFieldType?: string | null;
}

const CustomFieldModal: React.FC<CustomFieldModalProps> = ({
  open,
  onClose,
  initialFieldType = null,
}) => {
  const [form] = Form.useForm();
  const userId = useAuthenticationStore.getState().userId;
  const { mutate: createQuestion } = useCreateCustomFieldsTemplate();

  useEffect(() => {
    if (open) {
      if (initialFieldType) {
        form.setFieldsValue({ fieldValidation: initialFieldType });
      } else {
        form.resetFields();
      }
    }
  }, [open, initialFieldType, form]);

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      const fieldType = values.fieldValidation;
      const required = values.fieldMode === 'required';
      createQuestion({
        title: values.fieldName,
        createdBy: userId,
        questions: [
          {
            id: uuidv4(),
            fieldType,
            question: values.fieldName,
            required,
            field: getDefaultFieldOptions(fieldType).map((o) => ({
              id: o.id,
              value: o.value,
            })),
          },
        ],
      });
      onClose();
      form.resetFields();
    });
  };

  return (
    <Modal
      title="Custom Field"
      open={open}
      onCancel={onClose}
      footer={null}
      closable
      centered
      width={480}
      destroyOnClose
      rootClassName="recruitment-settings-status-modal"
      data-cy="custom-field-modal"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ fieldMode: 'active' }}
      >
        <Form.Item
          name="fieldName"
          label="Field Name"
          rules={[{ required: true, message: 'Please enter field name' }]}
          required
        >
          <Input
            placeholder="Input"
            className="h-10 rounded-md"
            data-cy="custom-field-input-name"
          />
        </Form.Item>

        <Form.Item
          name="fieldValidation"
          label="Field Validation"
          rules={[
            { required: true, message: 'Please select field validation' },
          ]}
          required
        >
          <Select
            placeholder="Select"
            className="h-10 rounded-md w-full"
            options={FIELD_VALIDATION_OPTIONS}
            data-cy="custom-field-select-validation"
          />
        </Form.Item>
        <p
          className="text-sm text-gray-500 -mt-2 mb-4"
          data-cy="custom-field-validation-description"
        >
          Select a field validation type.
        </p>

        <Form.Item name="fieldMode" label={null}>
          <Radio.Group className="w-full" data-cy="custom-field-radio-group">
            <div className="mb-3" data-cy="custom-field-radio-active-wrapper">
              <Radio value="active" data-cy="custom-field-radio-active">
                <span
                  className="font-medium text-gray-900"
                  data-cy="custom-field-radio-active-label"
                >
                  Active
                </span>
              </Radio>
              <p
                className="text-sm text-gray-500 ml-6 mt-0.5"
                data-cy="custom-field-radio-active-description"
              >
                If the field is active will show.
              </p>
            </div>
            <div data-cy="custom-field-radio-required-wrapper">
              <Radio value="required" data-cy="custom-field-radio-required">
                <span
                  className="font-medium text-gray-900"
                  data-cy="custom-field-radio-required-label"
                >
                  Required
                </span>
              </Radio>
              <p
                className="text-sm text-gray-500 ml-6 mt-0.5"
                data-cy="custom-field-radio-required-description"
              >
                If selected it must be filled.
              </p>
            </div>
          </Radio.Group>
        </Form.Item>

        <div
          className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100"
          data-cy="custom-field-modal-actions"
        >
          <Button
            type="default"
            className="px-6 py-2 rounded-md"
            onClick={onClose}
            data-cy="custom-field-button-cancel"
          >
            Cancel
          </Button>
          <Button
            type="primary"
            className="recruitment-settings-status-primary-btn px-6 py-2 rounded-md"
            htmlType="submit"
            data-cy="custom-field-button-create"
          >
            Create Field
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default CustomFieldModal;
