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
import { useCreateCandidate } from '@/store/server/features/recruitment/candidate/mutation';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useGetJobs } from '@/store/server/features/recruitment/job/queries';
import { useGetStages } from '@/store/server/features/recruitment/candidate/queries';

const { Dragger } = Upload;
const { Option } = Select;

interface CreateCandidateProps {
  onClose: () => void;
  jobId?: string;
}

const CreateCandidate: React.FC<CreateCandidateProps> = ({
  onClose,
  jobId,
}) => {
  const [form] = Form.useForm();

  const {
    createJobDrawer,
    documentFileList,
    setDocumentFileList,
    removeDocument,
    isClient,
    setIsClient,
    setCreateJobDrawer,
    currentPage,
    pageSize,
  } = useCandidateState();

  const { searchParams } = useCandidateState();

  const { data: jobList } = useGetJobs(
    searchParams?.whatYouNeed || '',
    currentPage,
    pageSize,
  );

  const isInternalApplicant = useAuthenticationStore.getState().userId;
  const { data: statusStage } = useGetStages();

  const { mutate: createCandidate, isLoading: isCreatingCandidate } =
    useCreateCandidate();

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
    <div className="flex justify-center text-xl font-extrabold text-gray-800 ">
      Add New Candidate
    </div>
  );

  const handleSubmit = async () => {
    const formValues = form.getFieldsValue();
    const formData = new FormData();

    // Get the actual file from documentFileList (the Upload component's file list)
    const fileToUpload =
      documentFileList?.[0]?.originFileObj || documentFileList?.[0];

    if (fileToUpload && fileToUpload instanceof File) {
      formData.append('documentName', fileToUpload);
    }

    // Remove resumeUrl from form values since we're handling file separately
    delete formValues?.resumeUrl;

    const formattedValues = {
      ...formValues,
      isExternal: isInternalApplicant === ' ' ? true : false,
      createdBy: isInternalApplicant,
      jobInformationId: jobId && jobId ? jobId : formValues?.jobInformationId,
      applicantStatusStageId: formValues?.stageId,
    };

    // Append each field individually instead of as JSON string
    // This way backend can access body.email, body.phone, etc. directly
    Object.keys(formattedValues).forEach((key) => {
      const value = formattedValues[key];
      if (value !== undefined && value !== null) {
        formData.append(
          key,
          typeof value === 'object' ? JSON.stringify(value) : String(value),
        );
      }
    });

    createCandidate(formData, {
      onSuccess: () => {
        setCreateJobDrawer(false);
        form.resetFields();
        setDocumentFileList([]);
      },
    });
  };

  return (
    <CustomDrawerLayout
      data-cy="talent-acquisition-job-create-candidate-drawer"
      open={createJobDrawer}
      onClose={onClose}
      modalHeader={createJobDrawerHeader}
      width="40%"
      customMobileHeight="75vh"
      footer={
        <Form.Item>
          <div className="flex justify-center w-full bg-[#fff] gap-6 p-3">
            <Button
              id="talent-acquisition-job-create-candidate-button-cancel"
              data-cy="talent-acquisition-job-create-candidate-button-cancel"
              onClick={onClose}
              className="flex justify-center text-sm font-medium text-gray-800 bg-white p-4 px-10 h-10 hover:border-gray-500 border-gray-300"
              disabled={isCreatingCandidate}
            >
              Cancel
            </Button>
            <Button
              id="talent-acquisition-job-create-candidate-button-submit"
              data-cy="talent-acquisition-job-create-candidate-button-submit"
              onClick={() => form.submit()}
              className="flex justify-center text-sm font-medium text-white bg-primary p-4 px-10 h-10 border-none"
              loading={isCreatingCandidate}
              disabled={isCreatingCandidate}
            >
              Create
            </Button>
          </div>
        </Form.Item>
      }
    >
      <Form
        id="talent-acquisition-job-create-candidate-form"
        data-cy="talent-acquisition-job-create-candidate-form"
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
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
            {
              pattern: /^[a-zA-Z\s]+$/,
              message: 'Only letters and spaces are allowed!',
            },
          ]}
        >
          <Input
            id="talent-acquisition-job-create-candidate-input-full-name"
            data-cy="talent-acquisition-job-create-candidate-input-full-name"
            placeholder="Full Name"
            className="w-full h-10 text-sm"
          />
        </Form.Item>

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
                { required: true, message: 'Please input the email address!' },
                {
                  type: 'email',
                  message: 'Please enter a valid email address!',
                },
              ]}
            >
              <Input
                id="talent-acquisition-job-create-candidate-input-email"
                data-cy="talent-acquisition-job-create-candidate-input-email"
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
                { required: true, message: 'Please input the phone number!' },
                {
                  pattern: /^\+?[0-9]\d{1,14}$/,
                  message: 'Please enter a valid phone number!',
                },
              ]}
            >
              <Input
                id="talent-acquisition-job-create-candidate-input-phone"
                data-cy="talent-acquisition-job-create-candidate-input-phone"
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
              name="jobInformationId"
              label={
                <span className="text-md font-semibold text-gray-700">Job</span>
              }
              rules={
                jobId
                  ? []
                  : [{ required: true, message: 'Please select a job' }]
              }
            >
              <Select
                id="talent-acquisition-job-create-candidate-select-job"
                data-cy="talent-acquisition-job-create-candidate-select-job"
                className="text-sm w-full h-10"
                placeholder="Select a job type"
                disabled={!!jobId}
              >
                {jobList &&
                  jobList?.items?.map((job: any) => (
                    <Option
                      key={job?.id}
                      value={job?.id}
                      id={`talent-acquisition-job-create-candidate-option-job-${job?.id}`}
                      data-cy={`talent-acquisition-job-create-candidate-option-job-${job?.id}`}
                    >
                      {job?.jobTitle}
                    </Option>
                  ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} lg={12} md={12} xl={12}>
            <Form.Item
              id="cgpaId"
              name="CGPA"
              label={
                <span className="text-md font-semibold text-gray-700">
                  CGPA
                </span>
              }
              rules={[{ required: true, message: 'Please input CGPA' }]}
            >
              <InputNumber
                id="talent-acquisition-job-create-candidate-input-cgpa"
                data-cy="talent-acquisition-job-create-candidate-input-cgpa"
                min={0}
                max={4}
                step={0.01}
                className="text-sm w-full h-10"
                placeholder="CGPA"
              />
            </Form.Item>
            <div className="flex items-center justify-start gap-1 ml-1">
              <FaInfoCircle />
              <div className="text-xs font-md">Put your point 4.0 scale</div>
            </div>
          </Col>
        </Row>
        <Form.Item
          id="stageId"
          name="stageId"
          label={
            <span className="text-md font-semibold text-gray-700">Stage</span>
          }
        >
          <Select
            id="talent-acquisition-job-create-candidate-input-full-name"
            data-cy="talent-acquisition-job-create-candidate-input-full-name"
            placeholder="Select a stage"
            className="w-full h-10 text-sm"
          >
            {statusStage &&
              statusStage?.items?.map((stage: any) => (
                <Option
                  key={stage?.id}
                  value={stage?.id}
                  id={`talent-acquisition-job-create-candidate-option-stage-${stage?.id}`}
                  data-cy={`talent-acquisition-job-create-candidate-option-stage-${stage?.id}`}
                >
                  {stage?.title}
                </Option>
              ))}
          </Select>
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
            id="talent-acquisition-job-create-candidate-textarea-cover-letter"
            data-cy="talent-acquisition-job-create-candidate-textarea-cover-letter"
          />
        </Form.Item>

        <Form.Item
          id="documentNameId"
          name="resumeUrl"
          label={
            <span className="text-md font-semibold text-gray-700">
              Upload CV
            </span>
          }
          rules={[{ required: true, message: 'Please upload your CV' }]}
        >
          <Dragger
            id="talent-acquisition-job-create-candidate-upload-cv"
            data-cy="talent-acquisition-job-create-candidate-upload-cv"
            name="documentName"
            fileList={documentFileList}
            onChange={handleDocumentChange}
            onRemove={handleDocumentRemove}
            customRequest={customRequest}
            listType="picture"
            accept=".pdf,.doc,.docx"
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
        <div className="text-sm font-md mb-8">
          Max file size: 5MB. File formats: .pdf, .doc, .docx
        </div>
      </Form>
    </CustomDrawerLayout>
  );
};

export default CreateCandidate;
