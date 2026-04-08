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
import { CloseOutlined, InboxOutlined } from '@ant-design/icons';
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
  }, [setIsClient]);

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
      // className="ta-candidate-modal"

      open={createJobDrawer}
      onCancel={onClose}
      title={
        <span
          className="text-[20px] font-bold leading-none text-black"
          data-cy="talent-acquisition-create-candidate-modal-title"
        >
          Add Candidate
        </span>
      }
      width={760}
      style={{ maxWidth: 'calc(100vw - 16px)' }}
      footer={null}
      closeIcon={<CloseOutlined className="h-4 w-4 text-[rgba(0,0,0,0.65)]" />}
      maskClosable={false}
      destroyOnClose
      styles={{ body: { backgroundColor: '#FFFFFF', padding: '6px 0 0' } }}
      classNames={{ body: 'px-6 pb-5' }}
      className="gb-bg-white"
      zIndex={10002}
    >
      <Form
        id="talent-acquisition-job-create-candidate-form"
        data-cy="talent-acquisition-job-create-candidate-form"
        form={form}
        layout="vertical"
        requiredMark={false}
        onFinish={handleSubmit}
        className="pb-1 [&_.ant-form-item-label]:!pb-1"
      >
        <div
          className="mx-auto rounded-[8px] border border-[#D9D9D9] bg-white"
          data-cy="talent-acquisition-create-candidate-form-container"
        >
          <div
            className="px-4 py-4"
            data-cy="talent-acquisition-create-candidate-form-inner"
          >
            <Form.Item
              id="fullNameId"
              name="fullName"
              label={
                <span
                  className="text-[14px] font-normal text-[#030712]"
                  data-cy="talent-acquisition-create-candidate-full-name-label"
                >
                  <span data-cy="talent-acquisition-create-candidate-full-name-label-text">
                    Full Name
                  </span>{' '}
                  <span
                    className="text-red-500"
                    aria-hidden
                    data-cy="talent-acquisition-create-candidate-full-name-required"
                  >
                    *
                  </span>
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
                    <span
                      className="text-[14px] font-normal text-[#030712]"
                      data-cy="talent-acquisition-create-candidate-email-label"
                    >
                      <span data-cy="talent-acquisition-create-candidate-email-label-text">
                        Email
                      </span>{' '}
                      <span
                        className="text-red-500"
                        aria-hidden
                        data-cy="talent-acquisition-create-candidate-email-required"
                      >
                        *
                      </span>
                    </span>
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
                    <span
                      className="text-[14px] font-normal text-[#030712]"
                      data-cy="talent-acquisition-create-candidate-phone-label"
                    >
                      <span data-cy="talent-acquisition-create-candidate-phone-label-text">
                        Phone Number
                      </span>{' '}
                      <span
                        className="text-red-500"
                        aria-hidden
                        data-cy="talent-acquisition-create-candidate-phone-required"
                      >
                        *
                      </span>
                    </span>
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
                    inputClassName="ant-input"
                    className="w-full [&_.react-international-phone-input-container]:!w-full [&_.react-international-phone-input-container]:!rounded-[6px] [&_.react-international-phone-country-selector-button]:!rounded-l-[6px] [&_.react-international-phone-input]:!rounded-r-[6px] [&_.react-international-phone-country-selector-button__flag-emoji]:!hidden [&_.react-international-phone-country-selector-dropdown__list-item-flag-emoji]:!hidden [&_.react-international-phone-country-selector-button]:!h-[40px] [&_.react-international-phone-input]:!h-[40px] [&_.react-international-phone-input]:!flex-1"
                    data-cy={`talent-acquisition-job-create-candidate-input-phone`}
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
                    <span
                      className="text-[14px] font-normal text-[#030712]"
                      data-cy="talent-acquisition-create-candidate-job-label"
                    >
                      <span data-cy="talent-acquisition-create-candidate-job-label-text">
                        Job Type
                      </span>
                      {!jobId ? (
                        <>
                          {' '}
                          <span
                            className="text-red-500"
                            aria-hidden
                            data-cy="talent-acquisition-create-candidate-job-required"
                          >
                            *
                          </span>
                        </>
                      ) : null}
                    </span>
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
                    className="w-full h-10 [&_.ant-select-selector]:!min-h-10 [&_.ant-select-selector]:!h-10 [&_.ant-select-selection-item]:!leading-[38px]"
                    placeholder="Select job type"
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
                    <span
                      className="text-[14px] font-normal text-[#030712]"
                      data-cy="talent-acquisition-create-candidate-cgpa-label"
                    >
                      <span data-cy="talent-acquisition-create-candidate-cgpa-label-text">
                        CGPA
                      </span>{' '}
                      <span
                        className="text-red-500"
                        aria-hidden
                        data-cy="talent-acquisition-create-candidate-cgpa-required"
                      >
                        *
                      </span>
                    </span>
                  }
                  extra={
                    <span
                      data-cy="talent-acquisition-create-candidate-cgpa-info"
                      className="text-xs text-gray-500"
                    >
                      Put your point 4.0 scale
                    </span>
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
              </Col>
            </Row>

            <Form.Item
              id="documentNameId"
              name="resumeUrl"
              label={
                <span
                  className="text-[14px] font-normal text-[#030712]"
                  data-cy="talent-acquisition-create-candidate-cv-label"
                >
                  <span data-cy="talent-acquisition-create-candidate-cv-label-text">
                    CV
                  </span>{' '}
                  <span
                    className="text-red-500"
                    aria-hidden
                    data-cy="talent-acquisition-create-candidate-cv-required"
                  >
                    *
                  </span>
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
                className="!rounded-[6px] !border-gray-200 !border-dashed bg-[#F9FAFB]"
              >
                <p
                  data-cy="-id-components-createcandidate-index-tsx-index-p-384"
                  className="flex items-center justify-center"
                >
                  <InboxOutlined
                    style={{ fontSize: '34px', color: '#1E40AF' }}
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
          </div>
        </div>

        <Form.Item className="!mb-0">
          <div
            id="talent-acquisition-create-candidate-div-buttons"
            data-cy="talent-acquisition-create-candidate-div-buttons"
            className="flex w-full justify-end gap-3 bg-[#fff] px-0 pt-4"
          >
            <Button
              id="talent-acquisition-job-create-candidate-button-cancel"
              data-cy="talent-acquisition-job-create-candidate-button-cancel"
              onClick={onClose}
              className="flex h-8 justify-center rounded-[6px] border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 hover:border-[#4096FF] hover:text-[#4096FF]"
              disabled={isCreatingCandidate}
            >
              Cancel
            </Button>
            <Button
              id="talent-acquisition-job-create-candidate-button-submit"
              data-cy="talent-acquisition-job-create-candidate-button-submit"
              htmlType="submit"
              className="flex h-8 justify-center rounded-[6px] border-none bg-[#1E40AF] px-4 text-sm font-medium text-white hover:bg-[#1D4ED8]"
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
