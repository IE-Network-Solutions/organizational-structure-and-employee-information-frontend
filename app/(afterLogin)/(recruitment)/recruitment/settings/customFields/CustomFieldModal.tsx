'use client';

import { useCreateCustomFieldsTemplate } from '@/store/server/features/recruitment/settings/mutation';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Checkbox, Form, Input, Modal, Radio, Select } from 'antd';
import React, { useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

const FIELD_VALIDATION_OPTIONS = [
  { label: 'Multiple choice', value: 'multiple_choice' },
  { label: 'Checkbox', value: 'checkbox' },
  { label: 'Short text', value: 'short_text' },
  { label: 'Paragraph', value: 'paragraph' },
];

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

  const buildFieldOptions = (
    fieldType: string,
    optionValues: string[] | undefined,
  ): { id: string; value: string }[] => {
    if (fieldType !== 'multiple_choice' && fieldType !== 'checkbox') {
      return [];
    }
    const values =
      optionValues?.filter((v) => v != null && String(v).trim() !== '') ?? [];
    if (values.length < 2) return [];
    return values.map((value) => ({
      id: uuidv4(),
      value: String(value).trim(),
    }));
  };

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      const fieldType = values.fieldValidation;
      const required = values.fieldMode === 'required';
      const optionValues = values.field as string[] | undefined;
      const field = buildFieldOptions(fieldType, optionValues);

      if (
        (fieldType === 'multiple_choice' || fieldType === 'checkbox') &&
        field.length < 2
      ) {
        form.setFields([
          {
            name: 'field',
            errors: ['At least 2 options are required'],
          },
        ]);
        return;
      }

      createQuestion({
        title: values.fieldName,
        createdBy: userId,
        questions: [
          {
            id: uuidv4(),
            fieldType,
            question: values.fieldName,
            required,
            field,
          },
        ],
      });
      onClose();
      form.resetFields();
    });
  };

  const renderOptionInput = (type: string) => {
    switch (type) {
      case 'multiple_choice':
        return <Radio className="mr-2" disabled value="" />;
      case 'checkbox':
        return <Checkbox className="mr-2" disabled value="" />;
      default:
        return null;
    }
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
        data-cy="custom-field-form"
      >
        <Form.Item
          name="fieldName"
          label="Field Name"
          rules={[{ required: true, message: 'Please enter field name' }]}
          required
          data-cy="custom-field-input-name"
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
          data-cy="custom-field-select-validation"
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

        <Form.Item
          noStyle
          shouldUpdate={(prev, curr) =>
            prev?.fieldValidation !== curr?.fieldValidation
          }
          data-cy="custom-field-options-container"
        >
          {() => {
            const fieldType = form.getFieldValue('fieldValidation');
            const showOptions =
              fieldType === 'multiple_choice' || fieldType === 'checkbox';
            if (!showOptions) return null;
            return (
              <Form.List
                name="field"
                initialValue={[]}
                rules={[
                  {
                    validator: async (rule, names) => {
                      if (!names || names.length < 2) {
                        return Promise.reject(
                          new Error('At least 2 options are required'),
                        );
                      }
                    },
                  },
                ]}
                data-cy="custom-field-options-list"
              >
                {(fields, { add, remove }) => (
                  <div
                    className="mb-4"
                    data-cy="custom-field-options-container"
                  >
                    <p
                      className="text-sm font-medium text-gray-700 mb-2"
                      data-cy="custom-field-options-title"
                    >
                      Options
                    </p>
                    {fields.map((field) => (
                      <Form.Item
                        data-cy={`custom-field-option-item-${field.key}`}
                        key={field.key}
                        required={false}
                        className="mb-2"
                      >
                        <div
                          className="flex items-center gap-3"
                          data-cy={`custom-field-option-row-${field.key}`}
                        >
                          {renderOptionInput(fieldType)}
                          <Form.Item
                            {...field}
                            noStyle
                            rules={[
                              {
                                required: true,
                                message: 'Please input an option!',
                              },
                            ]}
                            data-cy="custom-field-input-option"
                          >
                            <Input
                              placeholder="Option"
                              className="h-10 rounded-md flex-1"
                              data-cy={`custom-field-input-option-${field.name}`}
                            />
                          </Form.Item>
                          {fields.length > 0 && (
                            <MinusCircleOutlined
                              className="dynamic-delete-button text-red-500 cursor-pointer text-lg"
                              onClick={() => remove(field.name)}
                              data-cy={`custom-field-button-remove-option-${field.name}`}
                            />
                          )}
                        </div>
                      </Form.Item>
                    ))}
                    <Form.Item
                      className="mb-0"
                      data-cy="custom-field-options-add-form-item"
                    >
                      <div
                        className="flex flex-col items-center justify-center py-2"
                        data-cy="custom-field-options-add-wrapper"
                      >
                        <div
                          role="button"
                          tabIndex={0}
                          onClick={() => add()}
                          onKeyDown={(e) =>
                            e.key === 'Enter' && (e.preventDefault(), add())
                          }
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-primary cursor-pointer hover:opacity-90"
                          data-cy="custom-field-button-add-option"
                        >
                          <PlusOutlined
                            className="text-white text-lg"
                            data-cy="custom-field-button-add-option-icon"
                          />
                        </div>
                        <p
                          className="text-xs font-light text-gray-400 mt-1"
                          data-cy="custom-field-options-add-text"
                        >
                          + Add options
                        </p>
                      </div>
                    </Form.Item>
                  </div>
                )}
              </Form.List>
            );
          }}
        </Form.Item>

        <Form.Item
          name="fieldMode"
          label={null}
          data-cy="custom-field-field-mode"
        >
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
