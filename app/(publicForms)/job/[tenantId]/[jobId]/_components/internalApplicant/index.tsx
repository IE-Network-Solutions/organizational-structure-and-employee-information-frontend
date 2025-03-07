import React from 'react';
import { Button, Form, Input } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import Image from 'next/image';
import Dragger from 'antd/es/upload/Dragger';
import cvUpload from '@/public/image/cvUpload.png';
import { useCandidateState } from '@/store/uistate/features/recruitment/candidate';
import { useCreateCandidate } from '@/store/server/features/recruitment/candidate/mutation';

interface InternalApplicantFormProps {
  jobId: string;
  jobTitle: string;
  isInternalApplicant: string;
}

const InternalApplicantForm: React.FC<InternalApplicantFormProps> = ({
  jobId,
  jobTitle,
  isInternalApplicant,
}) => {
  const [form] = Form.useForm();
  const { mutate: createCandidate } = useCreateCandidate();

  const { documentFileList, setDocumentFileList, removeDocument } =
    useCandidateState();

  const handleDocumentChange = (info: any) => {
    const fileList = Array.isArray(info.fileList) ? info.fileList : [];
    setDocumentFileList(fileList);
  };
  const handleDocumentRemove = (file: any) => {
    removeDocument(file.uid);
  };

  const customRequest = ({ onSuccess }: any) => {
    setTimeout(() => {
      onSuccess('ok');
    }, 0);
  };

  const handleSubmit = async () => {
    const formValues = form.getFieldsValue();
    const formData = new FormData();

    const resumeUrl = formValues.resumeUrl as
      | {
          file?: { originFileObj?: File };
        }
      | undefined;

    if (resumeUrl?.file?.originFileObj) {
      formData.append('documentName', resumeUrl.file.originFileObj);
    }
    delete formValues?.resumeUrl;

    const formattedValues = {
      ...formValues,
      jobInformationId: jobId,
      isExternal: isInternalApplicant === ' ' ? true : false,
      createdBy: isInternalApplicant,
    };
    formData.append('newFormData', JSON.stringify(formattedValues));

    createCandidate(formData);
    form.resetFields();
  };

  return (
    <Form
      form={form}
      layout="vertical"
      requiredMark={false}
      onFinish={() => {
        handleSubmit();
      }}
    >
      <Form.Item
        id="documentNameId"
        name="resumeUrl"
        label={
          <span className="text-md font-semibold text-gray-700">Upload CV</span>
        }
        rules={[{ required: true, message: 'Please choose the document type' }]}
      >
        <Dragger
          name="documentName"
          fileList={documentFileList}
          onChange={handleDocumentChange}
          onRemove={handleDocumentRemove}
          customRequest={customRequest}
          listType="picture"
          accept="*/*"
        >
          <div className="flex items-center justify-center">
            <Image
              className="flex items-center justify-center"
              src={cvUpload.src}
              alt="Loading"
              width={30}
              height={30}
            />
          </div>
          <div className="flex flex-col justify-center items-center text-md font-semibold text-gray-950">
            <p>Upload your CV</p>
            <p className="text-gray-400 text-sm font-normal">
              or drag and drop it here
            </p>
          </div>
        </Dragger>
      </Form.Item>
      <div className="text-xs font-sm mb-5 ">
        Max file size : 5MB. File format : .pdf
      </div>
      <Form.Item
        name="jobApplyingTo"
        label="Job Applying to"
        initialValue={jobTitle}
      >
        <Input disabled className="w-full h-10 text-sm" />
      </Form.Item>

      <Form.Item
        id="coverLetterId"
        name="coverLetter"
        label={
          <span className="text-md font-semibold text-gray-700">
            Cover Letter
          </span>
        }
        rules={[{ required: true, message: 'Please input cover letter' }]}
      >
        <TextArea
          rows={4}
          className="text-sm w-full"
          placeholder="Please enter your cover letter here"
        />
      </Form.Item>

      <Form.Item>
        <div className="flex justify-center w-full bg-[#fff] px-6 py-6 gap-6">
          <Button
            type="primary"
            className="flex justify-center text-sm font-medium text-gray-800 bg-white p-4 px-10 h-12 hover:border-gray-500 border-gray-300"
          >
            Cancel
          </Button>
          <Button
            htmlType="submit"
            className="flex justify-center text-sm font-medium text-white bg-primary p-4 px-10 h-12"
          >
            Submit
          </Button>
        </div>
      </Form.Item>
    </Form>
  );
};

export default InternalApplicantForm;
