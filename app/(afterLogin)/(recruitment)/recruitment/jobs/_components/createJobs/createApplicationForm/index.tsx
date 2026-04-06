import { Button, Form, FormInstance } from 'antd';
import React from 'react';
import { CiCircleInfo } from 'react-icons/ci';
import ApplicationFormDragDrop from './applicationFormDragDrop';

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

      <Form.Item className="mb-0">
        <div
          className="flex flex-col justify-end gap-2 bg-white pt-4 sm:flex-row"
          data-cy="talent-acquisition-create-application-form-actions"
        >
          <Button
            onClick={() => stepChange(1)}
            className="!h-9 w-full !border-[#D9D9D9] !bg-white !px-4 !text-[14px] !font-normal !text-[rgba(0,0,0,0.7)] hover:!border-[#1E40AF] hover:!text-[#1E40AF] sm:w-auto sm:min-w-[100px]"
            disabled={isLoading}
            data-cy="talent-acquisition-create-application-form-button-cancel"
          >
            Back
          </Button>
          <Button
            htmlType="submit"
            type="primary"
            className="!h-9 w-full !border !border-solid !border-[#1E40AF] !bg-[#1E40AF] !px-4 !text-[14px] !font-normal !text-white hover:!border-[#1D4ED8] hover:!bg-[#1D4ED8] sm:w-auto sm:min-w-[100px]"
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
