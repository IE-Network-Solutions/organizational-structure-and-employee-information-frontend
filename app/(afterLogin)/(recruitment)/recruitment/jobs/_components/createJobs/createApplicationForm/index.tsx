import { Button, Col, Form, FormInstance, Row } from 'antd';
import React from 'react';
import { CiCircleInfo } from 'react-icons/ci';
import DynamicJobForm from './dynamicJobForm';
import CustomFieldsSelector from './customFieldSelector';

const staticField = [
  { key: '1', name: 'Full Name Input Field' },
  { key: '2', name: 'CV Upload File' },
  { key: '3', name: 'CGPA' },
  { key: '4', name: 'Email' },
  { key: '5', name: 'Phone Number' },
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
      className="p-2"
      data-cy="talent-acquisition-create-application-form-container"
    >
      <CustomFieldsSelector />
      <div
        className="my-4"
        data-cy="talent-acquisition-create-application-form-existing-fields-container"
      >
        <div
          className="text-md font-semibold"
          data-cy="talent-acquisition-create-application-form-existing-fields-title"
        >
          Existing Fields
        </div>
        <div
          data-cy="-components-createjobs-createapplicationform-index-tsx-index-div-40"
          className="flex items-center justify-start text-[10px] text-gray-400 font-normal gap-1 my-1 h-10"
        >
          <CiCircleInfo />
          These fields are automatically created for you-no need to set them up
          again. Effortlessly integrated and ready to use!
        </div>
        <div data-cy="-components-createjobs-createapplicationform-index-tsx-index-div-45">
          <Row gutter={16}>
            {staticField?.map((item: any) => (
              <Col key={item?.key} xs={24} sm={24} lg={12} md={12} xl={12}>
                <div
                  data-cy="-components-createjobs-createapplicationform-index-tsx-index-div-49"
                  className="w-full rounded-md border-gray-200 border p-3 bg-gray-100 my-1 text-sm font-normal"
                >
                  {item?.name}
                </div>
              </Col>
            ))}
          </Row>
        </div>
        <DynamicJobForm form={form} />
      </div>
      <Form.Item>
        <div
          data-cy="-components-createjobs-createapplicationform-index-tsx-index-div-59"
          className="flex justify-center w-full  bg-[#fff] px-6 py-6 gap-6"
        >
          <Button
            id="talent-acquisition-create-application-form-button-back"
            data-cy="talent-acquisition-create-application-form-button-back"
            onClick={() => stepChange(0)}
            className="flex justify-center text-sm font-medium text-gray-800 bg-white p-4 px-10 h-10 hover:border-gray-500 border-gray-300"
            disabled={isLoading}
          >
            Back
          </Button>
          <Button
            id="talent-acquisition-create-application-form-button-publish"
            data-cy="talent-acquisition-create-application-form-button-publish"
            htmlType="submit"
            className="flex justify-center text-sm font-medium text-white bg-primary p-4 px-10 h-10 border-none"
            loading={isLoading}
            disabled={isLoading}
          >
            Publish
          </Button>
        </div>
      </Form.Item>
    </div>
  );
};

export default CreateApplicationForm;
