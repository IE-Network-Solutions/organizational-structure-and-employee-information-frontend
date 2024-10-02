'use client';
import { CandidateType, JobType } from '@/types/enumTypes';
import { Button, Col, Form, Input, InputNumber, Row, Select } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import Dragger from 'antd/es/upload/Dragger';
import Image from 'next/image';
import React from 'react';
import { FaInfoCircle } from 'react-icons/fa';
import cvUpload from '@/public/image/cvUpload.png';
import { useCandidateState } from '@/store/uistate/features/recruitment/candidate';
import CustomJobQuestionsDisplay from './_components/CustomJobQuestionsDisplay';
import { useCreateJobFormResponse } from '@/store/server/features/recruitment/job/mutation';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useGetJobsByID } from '@/store/server/features/recruitment/job/queries';

interface Params {
  jobId: string;
}

interface PublicJobFormProps {
  params: Params;
}

const { Option } = Select;

const PublicJobForm = ({ params: { jobId } }: PublicJobFormProps) => {
  const [form] = Form.useForm();
  const { mutate: createJobFormResponse } = useCreateJobFormResponse();

  const { data: jobDescription, isLoading: ResponseLoading } =
    useGetJobsByID(jobId);

  console.log(jobDescription, 'jobDescription');

  const isInternalApplicant = useAuthenticationStore?.getState()?.userId;

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
    console.log(formValues, 'formValues');

    createJobFormResponse(formValues);
  };
  return (
    <>
      <div className="bg-white w-full rounded-lg px-32 py-8">
        <div className="text-center text-2xl font-bold text-primary py-4">
          Submit Application
        </div>
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
            name="documentName"
            label={
              <span className="text-md font-semibold text-gray-700">
                Upload CV
              </span>
            }
            rules={[
              { required: true, message: 'Please choose the document type' },
            ]}
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
          {isInternalApplicant.length > 0 ? (
            <>
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
                    rules={[
                      { required: true, message: 'Please input full name!' },
                    ]}
                  >
                    <Input
                      placeholder="Full Name"
                      className="w-full h-10 text-sm"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={24} md={12} lg={12} xl={12}></Col>
              </Row>
              <Row gutter={16}>
                <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                  <Form.Item
                    id="emailAddressId"
                    name="emailAddress"
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
                    name="phoneNumber"
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
                      placeholder="3D Designer"
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
                      <span className="text-md font-semibold text-gray-700">
                        CGPA
                      </span>
                    }
                    rules={[{ required: true, message: 'Please input CGPA' }]}
                  >
                    <InputNumber
                      className="text-sm w-full h-10"
                      placeholder="CGPA"
                    />
                  </Form.Item>
                  <div className="flex items-center justify-start gap-1 ml-1">
                    <FaInfoCircle />
                    <div className="text-xs font-md">
                      Put your point 4.0 scale
                    </div>
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
                    rules={[
                      { required: true, message: 'Please input the job name!' },
                    ]}
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
                      <span className="text-md font-semibold text-gray-700">
                        Job
                      </span>
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
            </>
          ) : (
            <Form.Item
              id="jobApplyingTo"
              name="jobApplyingTo"
              label={
                <span className="text-md font-semibold text-gray-700">
                  Job Applying to
                </span>
              }
              rules={[
                { required: true, message: 'Please choose the document type' },
              ]}
            >
              <Input
                disabled
                placeholder={jobDescription?.jobTitle}
                className="w-full h-10 text-sm"
              />
            </Form.Item>
          )}
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
      </div>
    </>
  );
};

export default PublicJobForm;
