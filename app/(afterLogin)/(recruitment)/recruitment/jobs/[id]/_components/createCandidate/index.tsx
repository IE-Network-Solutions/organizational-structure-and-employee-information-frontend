import { useCandidateState } from '@/store/uistate/features/recruitment/candidate';
import {
  Button,
  Col,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Upload,
} from 'antd';
import React, { useEffect } from 'react';
import { FaInfoCircle } from 'react-icons/fa';
import { InboxOutlined } from '@ant-design/icons';
import { useCreateCandidate } from '@/store/server/features/recruitment/candidate/mutation';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useGetJobs } from '@/store/server/features/recruitment/job/queries';
import { useGetStages } from '@/store/server/features/recruitment/candidate/queries';
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';

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

  const openJobs = React.useMemo(() => {
    const items = (jobList as any)?.items ?? [];
    const now = Date.now();
    return items.filter((job: any) => {
      const deadline = job?.jobDeadline
        ? new Date(job.jobDeadline).getTime()
        : null;
      const deadlinePassed =
        typeof deadline === 'number' && Number.isFinite(deadline)
          ? deadline < now
          : false;
      const status = job?.jobStatus;
      return status === 'Open' && !deadlinePassed;
    });
  }, [jobList]);

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
    // Stage is not selected in the UI anymore; we will pick the initial stage.
    delete formValues?.stageId;

    const initialStageId =
      (statusStage as any)?.items?.find?.((s: any) => s?.isInitial)?.id ??
      (statusStage as any)?.items?.[0]?.id;

    const formattedValues = {
      ...formValues,
      isExternal: isInternalApplicant === ' ' ? true : false,
      createdBy: isInternalApplicant,
      jobInformationId: jobId && jobId ? jobId : formValues?.jobInformationId,
      applicantStatusStageId: initialStageId,
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
    <Modal
      data-cy="talent-acquisition-job-create-candidate-drawer"
      className="ta-candidate-modal"
      open={createJobDrawer}
      onCancel={onClose}
      footer={null}
      width={630}
      title={
        <div
          id="talent-acquisition-create-candidate-div-header"
          data-cy="talent-acquisition-create-candidate-div-header"
          className="flex flex-col"
        >
          <span
            className="text-lg font-bold text-gray-900"
            data-cy="talent-acquisition-create-candidate-modal-title"
          >
            Add New Candidate
          </span>
          <span
            className="text-sm font-normal text-gray-600 mt-1 pl-0.5"
            data-cy="talent-acquisition-create-candidate-modal-subtitle"
          >
            Please Fill in all the information correctly
          </span>
        </div>
      }
      maskClosable={false}
      destroyOnClose
      styles={{
        body: {
          backgroundColor: '#FFFFFF',
          padding: 16,
        },
      }}
      zIndex={10002}
    >
      <Form
        id="talent-acquisition-job-create-candidate-form"
        data-cy="talent-acquisition-job-create-candidate-form"
        form={form}
        layout="vertical"
        requiredMark={false}
        onFinish={handleSubmit}
      >
        <div
          className="bg-white border border-[#D9D9D9] rounded-lg -mx-3 sm:mx-0"
          data-cy="talent-acquisition-create-candidate-form-container"
        >
          <div
            className="px-3 sm:px-4 py-2"
            data-cy="talent-acquisition-create-candidate-form-inner"
          >
            <Form.Item
              id="fullNameId"
              name="fullName"
              label={
                <div
                  className="flex items-center justify-between"
                  data-cy="talent-acquisition-create-candidate-full-name-label"
                >
                  <span
                    data-cy="talent-acquisition-create-candidate-full-name-label-text"
                    className="text-sm font-medium text-gray-700"
                  >
                    Full Name
                  </span>
                  <span
                    className="text-red-500"
                    aria-hidden
                    data-cy="talent-acquisition-create-candidate-full-name-required"
                  >
                    *
                  </span>
                </div>
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
                    <div
                      className="flex items-center justify-between"
                      data-cy="talent-acquisition-create-candidate-email-label"
                    >
                      <span
                        data-cy="talent-acquisition-create-candidate-email-label-text"
                        className="text-sm font-medium text-gray-700"
                      >
                        Email
                      </span>
                      <span
                        className="text-red-500"
                        aria-hidden
                        data-cy="talent-acquisition-create-candidate-email-required"
                      >
                        *
                      </span>
                    </div>
                  }
                  rules={[
                    {
                      required: true,
                      message: 'Please input the email address!',
                    },
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
                    placeholder="test@mail.com"
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={24} lg={12} md={12} xl={12}>
                <Form.Item
                  id="phoneNumberId"
                  name="phone"
                  label={
                    <div
                      className="flex items-center justify-between"
                      data-cy="talent-acquisition-create-candidate-phone-label"
                    >
                      <span
                        data-cy="talent-acquisition-create-candidate-phone-label-text"
                        className="text-sm font-medium text-gray-700"
                      >
                        Phone Number
                      </span>
                      <span
                        className="text-red-500"
                        aria-hidden
                        data-cy="talent-acquisition-create-candidate-phone-required"
                      >
                        *
                      </span>
                    </div>
                  }
                  rules={[
                    {
                      required: true,
                      message: 'Please input the phone number!',
                    },
                    {
                      pattern: /^\+?[0-9]\d{1,14}$/,
                      message: 'Please enter a valid phone number!',
                    },
                  ]}
                >
                  <PhoneInput
                    defaultCountry="et"
                    placeholder="Input"
                    className="!rounded-lg !bg-gray-100 !border-gray-300 w-full [&_.react-international-phone-input-container]:!rounded-lg [&_.react-international-phone-input-container]:!bg-gray-100 [&_.react-international-phone-input-container]:!border-gray-300 [&_.react-international-phone-country-selector-button__flag-emoji]:!hidden [&_.react-international-phone-country-selector-dropdown__list-item-flag-emoji]:!hidden"
                    style={
                      {
                        '--react-international-phone-height': '40px',
                        '--react-international-phone-background-color':
                          '#f5f5f5',
                        '--react-international-phone-border-radius': '8px',
                        '--react-international-phone-border-color': '#d9d9d9',
                      } as React.CSSProperties
                    }
                    inputClassName="!bg-transparent !border-0 text-sm placeholder:text-gray-400 focus:!shadow-none"
                    data-cy="talent-acquisition-job-create-candidate-input-phone"
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
                    <div
                      className="flex items-center justify-between"
                      data-cy="talent-acquisition-create-candidate-job-label"
                    >
                      <span
                        data-cy="talent-acquisition-create-candidate-job-label-text"
                        className="text-sm font-medium text-gray-700"
                      >
                        Job
                      </span>
                      {!jobId ? (
                        <span
                          className="text-red-500"
                          aria-hidden
                          data-cy="talent-acquisition-create-candidate-job-required"
                        >
                          *
                        </span>
                      ) : null}
                    </div>
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
                    size="large"
                    className="w-full"
                    placeholder="Select a job type"
                    disabled={!!jobId}
                    popupClassName="org-structure-branch-select-dropdown"
                  >
                    {openJobs?.map((job: any) => (
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
                    <div
                      className="flex items-center justify-between"
                      data-cy="talent-acquisition-create-candidate-cgpa-label"
                    >
                      <span
                        data-cy="talent-acquisition-create-candidate-cgpa-label-text"
                        className="text-sm font-medium text-gray-700"
                      >
                        CGPA
                      </span>
                      <span
                        className="text-red-500"
                        aria-hidden
                        data-cy="talent-acquisition-create-candidate-cgpa-required"
                      >
                        *
                      </span>
                    </div>
                  }
                  rules={[
                    { required: true, message: 'Please input CGPA' },
                    {
                      validator: async (rule, value) => {
                        void rule;
                        if (
                          value === undefined ||
                          value === null ||
                          value === ''
                        )
                          return;
                        const num = Number(value);
                        if (!Number.isFinite(num)) return;
                        if (num > 4)
                          throw new Error(
                            'CGPA must be less than or equal to 4',
                          );
                        if (num < 0)
                          throw new Error(
                            'CGPA must be greater than or equal to 0',
                          );
                      },
                    },
                  ]}
                >
                  <div
                    data-cy="talent-acquisition-job-create-candidate-input-cgpa-contanier"
                    className="relative h-10 w-full flex items-center"
                  >
                    <InputNumber
                      id="talent-acquisition-job-create-candidate-input-cgpa"
                      data-cy="talent-acquisition-job-create-candidate-input-cgpa"
                      min={0}
                      max={4}
                      step={0.01}
                      controls={false}
                      className="text-sm w-full h-10 flex items-center" // preserve h-9, add flex alignment (redundancy okay for InputNumber container fix)
                      placeholder="0"
                    />
                  </div>
                </Form.Item>
                <div
                  data-cy="-id-components-createcandidate-index-tsx-index-div-311"
                  className="flex items-center justify-start gap-1 ml-1"
                >
                  <FaInfoCircle />
                  <div
                    data-cy="-id-components-createcandidate-index-tsx-index-div-313"
                    className="text-xs text-gray-500"
                  >
                    Put your point 4.0 scale
                  </div>
                </div>
              </Col>
            </Row>

            <Form.Item
              id="documentNameId"
              name="resumeUrl"
              label={
                <div
                  className="flex items-center justify-between"
                  data-cy="talent-acquisition-create-candidate-cv-label"
                >
                  <span
                    data-cy="talent-acquisition-create-candidate-cv-label-text"
                    className="text-sm font-medium text-gray-700"
                  >
                    CV
                  </span>
                  <span
                    className="text-red-500"
                    aria-hidden
                    data-cy="talent-acquisition-create-candidate-cv-required"
                  >
                    *
                  </span>
                </div>
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
                className="!border-gray-200 !border-dashed !rounded-2xl bg-[#F9FAFB]"
              >
                <p
                  data-cy="-id-components-createcandidate-index-tsx-index-p-384"
                  className="flex items-center justify-center"
                >
                  <InboxOutlined
                    style={{ fontSize: '40px', color: '#1E40AF' }}
                    className="text-primary"
                  />
                </p>
                <div
                  data-cy="-id-components-createcandidate-index-tsx-index-div-392"
                  className="flex flex-col justify-center items-center text-sm font-medium text-gray-700"
                >
                  <p data-cy="-id-components-createcandidate-index-tsx-index-p-393">
                    Upload your CV
                  </p>
                  <p
                    data-cy="-id-components-createcandidate-index-tsx-index-p-394"
                    className="text-gray-400 text-sm font-normal"
                  >
                    or drag and drop it here
                  </p>
                </div>
              </Dragger>
            </Form.Item>
            <div
              data-cy="-id-components-createcandidate-index-tsx-index-div-400"
              className="text-xs text-gray-500 mb-4"
            >
              Max file size: 5MB. File formats: .pdf, .doc, .docx
            </div>
          </div>
        </div>

        <Form.Item>
          <div
            id="talent-acquisition-create-candidate-div-buttons"
            data-cy="talent-acquisition-create-candidate-div-buttons"
            className="flex justify-end w-full bg-[#fff] px-0 pt-4 gap-3"
          >
            <Button
              id="talent-acquisition-job-create-candidate-button-cancel"
              data-cy="talent-acquisition-job-create-candidate-button-cancel"
              onClick={onClose}
              className="flex justify-center text-sm font-medium text-gray-800 bg-white px-3 h-8 hover:border-[#4096FF] border-gray-300 hover:text-[#4096FF]"
              disabled={isCreatingCandidate}
            >
              Cancel
            </Button>
            <Button
              id="talent-acquisition-job-create-candidate-button-submit"
              data-cy="talent-acquisition-job-create-candidate-button-submit"
              htmlType="submit"
              className="flex justify-center text-sm font-medium text-white bg-primary px-3 h-8 border-none hover:bg-[#4096FF]"
              loading={isCreatingCandidate}
              disabled={isCreatingCandidate}
            >
              Create
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateCandidate;
