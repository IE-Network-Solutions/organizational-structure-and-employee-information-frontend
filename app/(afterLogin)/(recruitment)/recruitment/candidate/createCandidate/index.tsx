import CustomDrawerLayout from '@/components/common/customDrawer';
import { useCandidateState } from '@/store/uistate/features/recruitment/candidate';
import {
  Button,
  Col,
  Form,
  Image,
  Input,
  InputNumber,
  Row,
  Select,
  Upload,
} from 'antd';
import TextArea from 'antd/es/input/TextArea';
import React, { useEffect } from 'react';
import { FaInfoCircle } from 'react-icons/fa';
import cvUpload from '@/public/image/cvUpload.png';
import { CandidateType, JobType } from '@/types/enumTypes';
import { useCreateCandidate } from '@/store/server/features/recruitment/candidate/mutation';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useGetJobs } from '@/store/server/features/recruitment/job/queries';

const { Dragger } = Upload;
const { Option } = Select;

interface CreateCandidateProps {
  onClose: () => void;
}

const CreateCandidate: React.FC<CreateCandidateProps> = ({ onClose }) => {
  const [form] = Form.useForm();
  const { data: jobList } = useGetJobs();

  const isInternalApplicant = useAuthenticationStore.getState().userId;
  const {
    createJobDrawer,
    documentFileList,
    setDocumentFileList,
    removeDocument,
    isClient,
    setIsClient,
  } = useCandidateState();

  const { mutate: createCandidate } = useCreateCandidate();

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
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  const createJobDrawerHeader = (
    <div className="flex justify-center text-xl font-extrabold text-gray-800 p-4">
      New Candidate
    </div>
  );

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
      // jobInformationId: jobId,
      createdBy: isInternalApplicant,
    };
    formData.append('newFormData', JSON.stringify(formattedValues));

    createCandidate(formData);
  };

  return (
    <CustomDrawerLayout
      open={createJobDrawer}
      onClose={onClose}
      modalHeader={createJobDrawerHeader}
      width="40%"
      footer={null}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={() => {
          handleSubmit();
        }}
      >
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
                { required: true, message: 'Please input the phone number!' },
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
                {jobList &&
                  jobList?.items?.map((job: any) => (
                    <Option key={job?.id} value={job?.id}>
                      {job?.jobTitle}
                    </Option>
                  ))}
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} sm={24} lg={12} md={12} xl={12}>
            <Form.Item
              id="jobTypeId"
              name="jobType"
              label={
                <span className="text-md font-semibold text-gray-700">
                  Job Type
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
              id="cgpaId"
              name="cgpa"
              label={
                <span className="text-md font-semibold text-gray-700">
                  CGPA
                </span>
              }
              rules={[{ message: 'Please input CGPA' }]}
            >
              <InputNumber
                min={0}
                max={4}
                step={0.01}
                className="text-sm w-full h-10"
                placeholder="CGPA"
              />
              <div className="flex items-center justify-start gap-1 ml-1">
                <FaInfoCircle />
                <div className="text-xs font-md">Put your point 4.0 scale</div>
              </div>
            </Form.Item>
          </Col>
        </Row>

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
            <p>
              <Image
                preview={false}
                className="w-full max-w-xs"
                src={cvUpload.src}
                alt="Loading"
              />
            </p>
            <div className="flex flex-col justify-center items-center text-md font-semibold text-gray-950">
              <p>Upload your CV</p>
              <p className="text-gray-400 text-sm font-normal">
                or drag and drop it here
              </p>
            </div>
          </Dragger>
        </Form.Item>
        <div className="text-sm font-md mb-5 ">
          Max file size : 5MB. File format : .pdf
        </div>

        <Form.Item>
          <div className="flex justify-center absolute w-full bg-[#fff] px-6 py-6 gap-6">
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
              Create
            </Button>
          </div>
        </Form.Item>
      </Form>
    </CustomDrawerLayout>
  );
};

export default CreateCandidate;
