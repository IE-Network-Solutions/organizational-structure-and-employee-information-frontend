import { useUpdateCandidate } from '@/store/server/features/recruitment/candidate/mutation';
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
import { CloseOutlined, InboxOutlined } from '@ant-design/icons';
import { PhoneInput } from 'react-international-phone';
import React, { useEffect } from 'react';
import { useGetJobs } from '@/store/server/features/recruitment/job/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';

const { Dragger } = Upload;
const { Option } = Select;

type EditCandidateProps = {
  jobId?: string;
  'data-cy'?: string;
};

const EditCandidate: React.FC<EditCandidateProps> = ({
  jobId,
  'data-cy': dataCyProp,
}) => {
  const [form] = Form.useForm();
  const { searchParams } = useCandidateState();

  const {
    editCandidateModal,
    editCandidate,
    selectedCandidateId,
    setDocumentFileList,
    removeDocument,
    documentFileList,
    setEditCandidateModal,
    setSelectedCandidate,
    currentPage,
    pageSize,
  } = useCandidateState();

  const { data: jobList } = useGetJobs(
    searchParams?.whatYouNeed || '',
    currentPage,
    pageSize,
  );
  const { mutate: updateCandidate, isLoading: isUpdatingCandidate } =
    useUpdateCandidate();

  const updatedBy = useAuthenticationStore.getState().userId;

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
      return job?.jobStatus === 'Open' && !deadlinePassed;
    });
  }, [jobList]);

  const jobsForSelect = React.useMemo(() => {
    const currentJob = editCandidate?.jobCandidate?.[0]?.jobInformation;
    const currentJobId = editCandidate?.jobCandidate?.[0]?.jobInformationId;
    const hasCurrent =
      currentJobId && openJobs.some((j: any) => j?.id === currentJobId);

    return hasCurrent || !currentJobId
      ? openJobs
      : [
          ...openJobs,
          {
            id: currentJobId,
            jobTitle: currentJob?.jobTitle ?? 'Current job',
          },
        ];
  }, [openJobs, editCandidate]);

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

  const handleEditClose = () => {
    form.resetFields();
    setDocumentFileList([]);
    setEditCandidateModal(false);
  };

  const handleFormSubmit = () => {
    const formValues = form.getFieldsValue();
    const formData = new FormData();

    const fileToUpload =
      documentFileList?.[0]?.originFileObj || documentFileList?.[0];

    if (fileToUpload && fileToUpload instanceof File) {
      formData.append('documentName', fileToUpload);
    }

    delete formValues?.resumeUrl;

    const effectiveJobId =
      jobId && jobId.length > 0
        ? jobId
        : (formValues?.jobInformationId ??
          editCandidate?.jobCandidate?.[0]?.jobInformationId);

    const formattedValues = {
      ...formValues,
      coverLetter: editCandidate?.jobCandidate?.[0]?.coverLetter ?? '',
      jobCandidateId: editCandidate?.jobCandidate?.[0]?.id,
      jobInformationId: effectiveJobId,
      updatedBy: updatedBy,
    };

    formData.append('newFormData', JSON.stringify(formattedValues));
    updateCandidate(
      { data: formData, id: selectedCandidateId },
      {
        onSuccess: () => {
          const selectedJobId = effectiveJobId;
          const selectedJob = jobsForSelect?.find?.(
            (j: any) => j?.id === selectedJobId,
          );

          const updatedCandidate = {
            ...editCandidate,
            fullName: formValues.fullName,
            email: formValues.email,
            phone: formValues.phone,
            phoneNumber: formValues.phone,
            jobCandidate: [
              {
                ...editCandidate?.jobCandidate?.[0],
                jobInformationId:
                  selectedJobId ??
                  editCandidate?.jobCandidate?.[0]?.jobInformationId,
                jobInformation: selectedJob
                  ? {
                      ...(editCandidate?.jobCandidate?.[0]?.jobInformation ??
                        {}),
                      jobTitle:
                        selectedJob?.jobTitle ??
                        editCandidate?.jobCandidate?.[0]?.jobInformation
                          ?.jobTitle,
                    }
                  : editCandidate?.jobCandidate?.[0]?.jobInformation,
                coverLetter:
                  editCandidate?.jobCandidate?.[0]?.coverLetter ?? '',
              },
            ],
          };
          setSelectedCandidate(updatedCandidate);
          form.resetFields();
          setDocumentFileList([]);
          setEditCandidateModal(false);
        },
      },
    );
  };

  useEffect(() => {
    if (editCandidate && selectedCandidateId) {
      const candidateJob = editCandidate?.jobCandidate?.[0];
      const candidatePhone = editCandidate?.phone || editCandidate?.phoneNumber;
      const candidateResume = editCandidate?.resumeUrl;
      const displayName =
        editCandidate?.documentName ||
        (candidateResume
          ? candidateResume.split('/').pop() || 'CV.pdf'
          : 'CV.pdf');

      form.setFieldsValue({
        fullName: editCandidate?.fullName,
        email: editCandidate?.email,
        phone: candidatePhone,
        jobInformationId: candidateJob?.jobInformationId,
        CGPA: editCandidate?.CGPA ?? editCandidate?.cgpa,
      });

      setDocumentFileList(
        candidateResume
          ? [
              {
                uid: `cv-${editCandidate?.id ?? 'existing'}`,
                name: displayName,
                status: 'done',
                url: candidateResume,
              } as any,
            ]
          : [],
      );
    } else {
      form.resetFields();
      setDocumentFileList([]);
    }
  }, [editCandidate, selectedCandidateId, form, setDocumentFileList]);

  const modalDataCy = dataCyProp ?? 'talent-acquisition-edit-candidate-modal';

  return (
    <Modal
      title={
        <span
          className="text-[20px] font-bold leading-none text-black"
          data-cy="talent-acquisition-edit-candidate-modal-title"
        >
          Edit Candidate
        </span>
      }
      open={editCandidateModal}
      onCancel={handleEditClose}
      centered={false}
      width={760}
      style={{ maxWidth: 'calc(100vw - 16px)' }}
      closeIcon={
        <CloseOutlined className="h-4 w-4 text-[rgba(0,0,0,0.65)]" />
      }
      footer={null}
      maskClosable={false}
      destroyOnClose
      styles={{ body: { backgroundColor: '#FFFFFF', padding: '6px 0 0' } }}
      classNames={{ body: 'px-6 pb-5' }}
      className="gb-bg-white"
      zIndex={10002}
      data-cy={modalDataCy}
    >
      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        onFinish={handleFormSubmit}
        className="pb-1 [&_.ant-form-item-label]:!pb-1"
      >
        <div
          className="mx-auto rounded-[8px] border border-[#D9D9D9] bg-white"
          data-cy="talent-acquisition-edit-candidate-form-container"
        >
          <div
            className="px-4 py-4"
            data-cy="talent-acquisition-edit-candidate-form-inner"
          >
            <Form.Item
              id="fullNameId"
              data-cy="talent-acquisition-edit-candidate-form-item-full-name"
              name="fullName"
              label={
                <span
                  className="text-[14px] font-normal text-[#030712]"
                  data-cy="talent-acquisition-edit-candidate-full-name-label"
                >
                  <span data-cy="talent-acquisition-edit-candidate-full-name-label-text">
                    Full Name
                  </span>{' '}
                  <span
                    className="text-red-500"
                    aria-hidden
                    data-cy="talent-acquisition-edit-candidate-full-name-required"
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
                id="talent-acquisition-edit-candidate-input-full-name"
                data-cy="talent-acquisition-edit-candidate-input-full-name"
                placeholder="Full Name"
                className="w-full h-10 text-sm"
              />
            </Form.Item>

            <Row gutter={16}>
              <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                <Form.Item
                  id="emailAddressId"
                  data-cy="talent-acquisition-edit-candidate-form-item-email"
                  name="email"
                  label={
                    <span
                      className="text-[14px] font-normal text-[#030712]"
                      data-cy="talent-acquisition-edit-candidate-email-label"
                    >
                      <span data-cy="talent-acquisition-edit-candidate-email-label-text">
                        Email
                      </span>{' '}
                      <span
                        className="text-red-500"
                        aria-hidden
                        data-cy="talent-acquisition-edit-candidate-email-required"
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
                    id="talent-acquisition-edit-candidate-input-email"
                    data-cy="talent-acquisition-edit-candidate-input-email"
                    type="email"
                    className="text-sm w-full h-10"
                    placeholder="test@mail.com"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} lg={12} md={12} xl={12}>
                <Form.Item
                  id="phoneNumberId"
                  data-cy="talent-acquisition-edit-candidate-form-item-phone"
                  name="phone"
                  label={
                    <span
                      className="text-[14px] font-normal text-[#030712]"
                      data-cy="talent-acquisition-edit-candidate-phone-label"
                    >
                      <span data-cy="talent-acquisition-edit-candidate-phone-label-text">
                        Phone Number
                      </span>{' '}
                      <span
                        className="text-red-500"
                        aria-hidden
                        data-cy="talent-acquisition-edit-candidate-phone-required"
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
                    data-cy="talent-acquisition-edit-candidate-input-phone"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} sm={24} lg={12} md={12} xl={12}>
                <Form.Item
                  id="jobId"
                  data-cy="talent-acquisition-edit-candidate-form-item-job"
                  name="jobInformationId"
                  label={
                    <span
                      className="text-[14px] font-normal text-[#030712]"
                      data-cy="talent-acquisition-edit-candidate-job-label"
                    >
                      <span data-cy="talent-acquisition-edit-candidate-job-label-text">
                        Job Type
                      </span>
                      {!jobId ? (
                        <>
                          {' '}
                          <span
                            className="text-red-500"
                            aria-hidden
                            data-cy="talent-acquisition-edit-candidate-job-required"
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
                    id="talent-acquisition-edit-candidate-select-job"
                    data-cy="talent-acquisition-edit-candidate-select-job"
                    size="large"
                    className="w-full h-10 [&_.ant-select-selector]:!min-h-10 [&_.ant-select-selector]:!h-10 [&_.ant-select-selection-item]:!leading-[38px]"
                    placeholder="Select job type"
                    disabled={!!jobId}
                    popupClassName="org-structure-branch-select-dropdown"
                  >
                    {jobsForSelect?.map((job: any) => (
                      <Option
                        key={job?.id}
                        value={job?.id}
                        id={`talent-acquisition-edit-candidate-option-job-${job?.id}`}
                        data-cy={`talent-acquisition-edit-candidate-option-job-${job?.id}`}
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
                  data-cy="talent-acquisition-edit-candidate-form-item-cgpa"
                  label={
                    <span
                      className="text-[14px] font-normal text-[#030712]"
                      data-cy="talent-acquisition-edit-candidate-cgpa-label"
                    >
                      <span data-cy="talent-acquisition-edit-candidate-cgpa-label-text">
                        CGPA
                      </span>{' '}
                      <span
                        className="text-red-500"
                        aria-hidden
                        data-cy="talent-acquisition-edit-candidate-cgpa-required"
                      >
                        *
                      </span>
                    </span>
                  }
                  extra={
                    <span
                      data-cy="talent-acquisition-edit-candidate-cgpa-info"
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
                    data-cy="talent-acquisition-edit-candidate-input-cgpa-container"
                    className="relative h-10 w-full flex items-center"
                  >
                    <InputNumber
                      id="talent-acquisition-edit-candidate-input-cgpa"
                      data-cy="talent-acquisition-edit-candidate-input-cgpa"
                      min={0}
                      max={4}
                      step={0.01}
                      controls={false}
                      className="text-sm w-full h-10 flex items-center"
                      placeholder="0"
                    />
                  </div>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              id="documentNameId"
              data-cy="talent-acquisition-edit-candidate-form-item-upload-cv"
              name="resumeUrl"
              label={
                <span
                  className="text-[14px] font-normal text-[#030712]"
                  data-cy="talent-acquisition-edit-candidate-cv-label"
                >
                  <span data-cy="talent-acquisition-edit-candidate-cv-label-text">
                    CV
                  </span>{' '}
                  <span
                    className="text-red-500"
                    aria-hidden
                    data-cy="talent-acquisition-edit-candidate-cv-required"
                  >
                    *
                  </span>
                </span>
              }
              rules={[{ required: true, message: 'Please upload your CV' }]}
            >
              <Dragger
                id="talent-acquisition-edit-candidate-upload-cv"
                data-cy="talent-acquisition-edit-candidate-upload-cv"
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
                  className="flex items-center justify-center"
                  data-cy="talent-acquisition-edit-candidate-upload-cv-icon-wrap"
                >
                  <InboxOutlined
                    style={{ fontSize: '34px', color: '#1E40AF' }}
                    className="text-primary"
                  />
                </p>
                <div
                  id="talent-acquisition-edit-candidate-div-upload-cv-info"
                  data-cy="talent-acquisition-edit-candidate-div-upload-cv-info"
                  className="flex flex-col justify-center items-center text-sm font-medium text-gray-700"
                >
                  <p data-cy="talent-acquisition-edit-candidate-upload-cv-primary">
                    Upload your CV
                  </p>
                  <p
                    data-cy="talent-acquisition-edit-candidate-upload-cv-hint"
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
            id="talent-acquisition-edit-candidate-div-buttons"
            data-cy="talent-acquisition-edit-candidate-div-buttons"
            className="flex w-full justify-end gap-3 bg-[#fff] px-0 pt-4"
          >
            <Button
              id="talent-acquisition-edit-candidate-button-cancel"
              data-cy="talent-acquisition-edit-candidate-button-cancel"
              onClick={handleEditClose}
              className="flex h-8 justify-center rounded-[6px] border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 hover:border-[#4096FF] hover:text-[#4096FF]"
              disabled={isUpdatingCandidate}
            >
              Cancel
            </Button>
            <Button
              id="talent-acquisition-edit-candidate-button-save"
              data-cy="talent-acquisition-edit-candidate-button-save"
              htmlType="submit"
              className="flex h-8 justify-center rounded-[6px] border-none bg-[#1E40AF] px-4 text-sm font-medium text-white hover:bg-[#1D4ED8]"
              loading={isUpdatingCandidate}
              disabled={isUpdatingCandidate}
            >
              Edit
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditCandidate;
