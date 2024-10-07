import React from 'react';
import { Button, Col, Form, Input, InputNumber, Row, Select } from 'antd';
import { FaInfoCircle } from 'react-icons/fa';
import { CandidateType, JobType } from '@/types/enumTypes';
import { useCandidateState } from '@/store/uistate/features/recruitment/candidate';
import TextArea from 'antd/es/input/TextArea';
import Dragger from 'antd/es/upload/Dragger';
import Image from 'next/image';
import cvUpload from '@/public/image/cvUpload.png';
import { useCreateCandidate } from '@/store/server/features/recruitment/candidate/mutation';
import { useGetJobsByID } from '@/store/server/features/recruitment/job/queries';
import CustomJobQuestionsDisplay from '../customJobQuestions';

const { Option } = Select;

interface InternalApplicantFormProps {
  jobId: string;
  isInternalApplicant: string;
}

const InternalApplicantForm: React.FC<InternalApplicantFormProps> = ({
  jobId,
  isInternalApplicant,
}) => {
  const [form] = Form.useForm();
  const { mutate: createCandidate } = useCreateCandidate();
  const { data: jobDescription } = useGetJobsByID(jobId);

  const handleSubmit = async () => {
    const formValues = form.getFieldsValue();

    const additionalInformation = Object.entries(formValues)
      .filter(([key]) => key.startsWith('question_'))
      .map(([key, value]) => ({
        question: key.replace('question_', ''),
        answer: value || '',
      }));

    const filteredFormValues = Object.fromEntries(
      Object.entries(formValues).filter(
        ([key]) => !key.startsWith('question_'),
      ),
    );

    const formData = new FormData();

    const resumeUrl = filteredFormValues.resumeUrl as
      | {
          file?: { originFileObj?: File };
        }
      | undefined;

    if (resumeUrl?.file?.originFileObj) {
      formData.append('documentName', resumeUrl.file.originFileObj);
    }
    delete filteredFormValues?.resumeUrl;

    const formattedValue = {
      ...filteredFormValues,
      additionalInformation,
      jobInformationId: jobId,
      createdBy: isInternalApplicant,
    };

    formData.append('newFormData', JSON.stringify(formattedValue));

    createCandidate(formData);
  };
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
      <Row gutter={16}>
        <Col xs={24} sm={24} md={12} lg={12} xl={12}>
          <Form.Item
            id="fullNameId"
            name="fullName"
            label={
              <span className="text-md font-semibold text-gray-700">
                Full-Name
              </span>
            }
            rules={[{ required: true, message: 'Please input full name!' }]}
          >
            <Input placeholder="Full Name" className="w-full h-10 text-sm" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={24} md={12} lg={12} xl={12}></Col>
      </Row>
      <Row gutter={16}>
        <Col xs={24} sm={24} md={12} lg={12} xl={12}>
          <Form.Item
            id="emailAddressId"
            name="email"
            label={
              <span className="text-md font-semibold text-gray-700">
                Email Address
              </span>
            }
            rules={[
              {
                required: true,
                message: 'Please input the email address!',
              },
            ]}
          >
            <Input
              type="email"
              className="text-sm w-full h-10"
              placeholder="Email address"
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={24} lg={12} md={12} xl={12}>
          <Form.Item
            id="phoneNumberId"
            name="phone"
            label={
              <span className="text-md font-semibold text-gray-700">
                Phone Number
              </span>
            }
            rules={[
              {
                required: true,
                message: 'Please input the phone number!',
              },
            ]}
          >
            <Input
              type="tel"
              className="text-sm w-full h-10"
              placeholder="Phone number"
            />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col xs={24} sm={24} lg={12} md={12} xl={12}>
          <Form.Item
            id="jobTitle"
            name="jobTitle"
            label={
              <span className="text-md font-semibold text-gray-700">
                Job Title
              </span>
            }
          >
            <Input
              disabled
              placeholder={jobDescription?.jobTitle || 'Unknown Job'}
              variant="filled"
              className="text-sm w-full h-10"
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={24} lg={12} md={12} xl={12}>
          <Form.Item
            id="cgpaId"
            name="cgpa"
            label={
              <span className="text-md font-semibold text-gray-700">CGPA</span>
            }
            rules={[{ required: true, message: 'Please input CGPA' }]}
          >
            <InputNumber className="text-sm w-full h-10" placeholder="CGPA" />
          </Form.Item>
          <div className="flex items-center justify-start gap-1 ml-1">
            <FaInfoCircle />
            <div className="text-xs font-md">Put your point 4.0 scale</div>
          </div>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col xs={24} sm={24} lg={12} md={12} xl={12}>
          <Form.Item
            id="candidateTypeId"
            name="candidateType"
            label={
              <span className="text-md font-semibold text-gray-700">
                Candidate Type
              </span>
            }
            rules={[{ required: true, message: 'Please input the job name!' }]}
          >
            <Select
              className="text-sm w-full h-10"
              placeholder="Select a job type"
            >
              {CandidateType &&
                Object?.values(CandidateType).map((type) => (
                  <Option key={type} value={type}>
                    {type}
                  </Option>
                ))}
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} sm={24} lg={12} md={12} xl={12}>
          <Form.Item
            id="jobId"
            name="job"
            label={
              <span className="text-md font-semibold text-gray-700">Job</span>
            }
            rules={[{ required: true, message: 'Please select a job' }]}
          >
            <Select
              className="text-sm w-full h-10"
              placeholder="Select a job type"
            >
              {JobType &&
                Object?.values(JobType).map((type) => (
                  <Option key={type} value={type}>
                    {type}
                  </Option>
                ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <CustomJobQuestionsDisplay form={form} id={jobId} />

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
