import { Button, Form, FormInstance } from 'antd';
import React from 'react';
import { CiCircleInfo } from 'react-icons/ci';
import ApplicationFormDragDrop from './applicationFormDragDrop';
import CustomFieldsSelector from './customFieldSelector';

const EXISTING_FIELDS = [
  { key: '1', name: 'Full Name' },
  { key: '2', name: 'Email' },
  { key: '3', name: 'Phone Number' },
  { key: '4', name: 'CGPA' },
  { key: '5', name: 'CV Upload' },
];

interface ApplicationFormProps {
  stepChange: (value: number) => void;
  form: FormInstance;
  isLoading?: boolean;
}

const CreateApplicationForm: React.FC<ApplicationFormProps> = ({
  stepChange,
  form,
  isLoading = false,
}) => {
  return (
    <div
      className="p-4 sm:p-2"
      data-cy="talent-acquisition-create-application-form-container"
    >
      {/* Existing Fields */}
      <div
        className="mb-6"
        data-cy="talent-acquisition-create-application-form-existing-fields-container"
      >
        <h3
          className="text-sm font-semibold text-gray-900"
          data-cy="talent-acquisition-create-application-form-existing-fields-title"
        >
          Existing Fields
        </h3>
        <div
          className="mt-1 flex items-start gap-1.5 text-xs text-gray-500"
          data-cy="talent-acquisition-create-application-form-existing-fields-hint"
        >
          <CiCircleInfo className="mt-0.5 h-4 w-4 shrink-0" />
          <span data-cy="talent-acquisition-create-application-form-existing-fields-hint-text">
            These fields are automatically created for you, no need to set them
            up again. Effortlessly integrated and ready to use.
          </span>
        </div>
        <div
          className="mt-3 flex flex-wrap gap-2"
          data-cy="talent-acquisition-create-application-form-existing-fields-list"
        >
          {EXISTING_FIELDS.map((item) => (
            <span
              key={item.key}
              className="rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-sm text-gray-700"
              data-cy={`talent-acquisition-create-application-form-existing-field-${item.key}`}
            >
              {item.name}
            </span>
          ))}
        </div>
      </div>

      {/* Create or Select Custom Fields */}
      <div
        className="mb-6"
        data-cy="talent-acquisition-create-application-form-custom-fields-container"
      >
        <h3
          className="text-sm font-semibold text-gray-900"
          data-cy="talent-acquisition-create-application-form-custom-fields-title"
        >
          Create or Select Custom Fields
        </h3>
        <div
          className="mt-3"
          data-cy="talent-acquisition-create-application-form-drag-drop-wrap"
        >
          <ApplicationFormDragDrop form={form} />
        </div>
      </div>

      <div
        className="mb-6"
        data-cy="talent-acquisition-create-application-form-template-questions-container"
      >
        <CustomFieldsSelector />
      </div>

      <Form.Item className="mb-0">
        <div
          className="flex flex-col sm:flex-row justify-end gap-3 bg-white pt-4"
          data-cy="talent-acquisition-create-application-form-actions"
        >
          <Button
            onClick={() => stepChange(1)}
            className="h-11 w-full sm:min-w-[100px] sm:w-auto rounded-lg border-gray-300 text-gray-700"
            disabled={isLoading}
            data-cy="talent-acquisition-create-application-form-button-back"
          >
            Back
          </Button>
          <Button
            htmlType="submit"
            type="primary"
            className="h-11 w-full sm:min-w-[100px] sm:w-auto rounded-lg !bg-[#6366F1] hover:!bg-[#4F46E5]"
            loading={isLoading}
            disabled={isLoading}
            data-cy="talent-acquisition-create-application-form-button-publish"
          >
            Publish
          </Button>
        </div>
      </Form.Item>
    </div>
  );
};

export default CreateApplicationForm;
