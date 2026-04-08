import { Button, Form, FormInstance } from 'antd';
import React from 'react';
import ApplicationFormDragDrop from './applicationFormDragDrop';

const EXISTING_FIELDS = [
  { key: '1', name: 'Full Name' },
  { key: '2', name: 'Email' },
  { key: '3', name: 'Phone Number' },
  { key: '4', name: 'CGPA' },
  { key: '5', name: 'CV Upload' },
];

interface ApplicationFormProps {
  form: FormInstance;
  isLoading?: boolean;
  close: () => void;
}

const CreateApplicationForm: React.FC<ApplicationFormProps> = ({
  form,
  isLoading = false,
  close,
}) => {
  const InformationIcon = () => (
    <svg
      width="11"
      height="11"
      viewBox="0 0 11 11"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      data-cy="talent-acquisition-create-application-form-information-icon"
    >
      <path
        d="M5.25 0C2.35078 0 0 2.35078 0 5.25C0 8.14922 2.35078 10.5 5.25 10.5C8.14922 10.5 10.5 8.14922 10.5 5.25C10.5 2.35078 8.14922 0 5.25 0ZM4.875 2.71875C4.875 2.66719 4.91719 2.625 4.96875 2.625H5.53125C5.58281 2.625 5.625 2.66719 5.625 2.71875V5.90625C5.625 5.95781 5.58281 6 5.53125 6H4.96875C4.91719 6 4.875 5.95781 4.875 5.90625V2.71875ZM5.25 7.875C5.1028 7.872 4.96265 7.81141 4.85961 7.70625C4.75658 7.60109 4.69887 7.45973 4.69887 7.3125C4.69887 7.16527 4.75658 7.02391 4.85961 6.91875C4.96265 6.81359 5.1028 6.753 5.25 6.75C5.3972 6.753 5.53735 6.81359 5.64039 6.91875C5.74342 7.02391 5.80113 7.16527 5.80113 7.3125C5.80113 7.45973 5.74342 7.60109 5.64039 7.70625C5.53735 7.81141 5.3972 7.872 5.25 7.875Z"
        fill="black"
        fillOpacity="0.45"
        data-cy="talent-acquisition-create-application-form-information-icon-path"
      />
    </svg>
  );

  return (
    <div
      className="flex min-h-[440px] flex-col"
      data-cy="talent-acquisition-create-application-form-container"
    >
      {/* Existing Fields */}
      <div
        className="mb-6"
        data-cy="talent-acquisition-create-application-form-existing-fields-container"
      >
        <h3
          className="text-sm font-normal text-[#030712]"
          data-cy="talent-acquisition-create-application-form-existing-fields-title"
        >
          Existing Fields
        </h3>
        <div
          className="mt-1 flex items-start gap-1.5 text-[10px] font-normal text-[rgba(0,0,0,0.45)]"
          data-cy="talent-acquisition-create-application-form-existing-fields-hint"
        >
          <span
            className="mt-[2px] shrink-0"
            data-cy="talent-acquisition-create-application-form-information-icon-wrap"
          >
            <InformationIcon />
          </span>
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
              className="rounded-[4px] border border-[#D9D9D9] bg-white px-2 py-1 text-[12px] font-normal text-[rgba(0,0,0,0.7)]"
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
          className="text-sm font-normal text-[#030712]"
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
          className="mt-auto flex flex-col justify-end gap-2 bg-white pt-4 sm:flex-row"
          data-cy="talent-acquisition-create-application-form-actions"
        >
          <Button
            onClick={close}
            className="!h-8 w-full !rounded-md !border-[#D9D9D9] !bg-white !px-4 !text-[14px] !font-normal !text-[rgba(0,0,0,0.7)] hover:!border-[#1E40AF] hover:!text-[#1E40AF] sm:w-auto sm:min-w-[72px]"
            disabled={isLoading}
            data-cy="talent-acquisition-create-application-form-button-cancel"
          >
            Cancel
          </Button>
          <Button
            htmlType="submit"
            type="primary"
            className="!h-8 w-full !rounded-md !border !border-solid !border-[#1E40AF] !bg-[#1E40AF] !px-4 !text-[14px] !font-normal !text-white hover:!border-[#1D4ED8] hover:!bg-[#1D4ED8] sm:w-auto sm:min-w-[76px]"
            loading={isLoading}
            disabled={isLoading}
            data-cy="talent-acquisition-create-application-form-button-publish"
          >
            Continue
          </Button>
        </div>
      </Form.Item>
    </div>
  );
};

export default CreateApplicationForm;
