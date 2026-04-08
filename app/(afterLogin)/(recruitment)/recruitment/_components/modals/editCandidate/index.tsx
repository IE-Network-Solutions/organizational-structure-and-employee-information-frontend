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
import { InboxOutlined } from '@ant-design/icons';
import { PhoneInput } from 'react-international-phone';
import React, { useEffect } from 'react';
import { useGetJobs } from '@/store/server/features/recruitment/job/queries';
import { FaInfoCircle } from 'react-icons/fa';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { CloseOutlined } from '@ant-design/icons';

const { Dragger } = Upload;
const { Option } = Select;

const EditCandidate: React.FC = () => {
  const [form] = Form.useForm();
  const phoneValue = Form.useWatch('phone', form);
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
  const { mutate: updateCandidate } = useUpdateCandidate();

  const updatedBy = useAuthenticationStore.getState().userId;

  const jobsForSelect = React.useMemo(() => {
    const items = (jobList as any)?.items ?? [];
    const now = Date.now();
    const openJobs = items.filter((job: any) => {
      const deadline = job?.jobDeadline
        ? new Date(job.jobDeadline).getTime()
        : null;
      const deadlinePassed =
        typeof deadline === 'number' && Number.isFinite(deadline)
          ? deadline < now
          : false;
      return job?.jobStatus === 'Open' && !deadlinePassed;
    });

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
  }, [jobList, editCandidate]);

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

  const handleFormSubmit = () => {
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
      jobCandidateId: editCandidate?.jobCandidate?.[0]?.id,
      jobInformationId:
        formValues?.jobInformationId ??
        editCandidate?.jobCandidate?.[0]?.jobInformationId,
      updatedBy: updatedBy,
    };
    formData.append('newFormData', JSON.stringify(formattedValues));
    updateCandidate(
      { data: formData, id: selectedCandidateId },
      {
        onSuccess: () => {
          const selectedJobId = formValues?.jobInformationId;
          const selectedJob = jobsForSelect?.find?.(
            (j: any) => j?.id === selectedJobId,
          );

          // Update the selected candidate with the new data
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
                coverLetter: formValues.coverLetter,
              },
            ],
          };
          setSelectedCandidate(updatedCandidate);
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

      form.setFieldsValue({
        fullName: editCandidate?.fullName,
        email: editCandidate?.email,
        phone: candidatePhone,
        jobInformationId: candidateJob?.jobInformationId,
        CGPA: editCandidate?.CGPA ?? editCandidate?.cgpa,
        coverLetter: editCandidate?.jobCandidate?.[0]?.coverLetter || '',
        resumeUrl: candidateResume
          ? {
              uid: candidateResume,
              name: candidateResume,
              status: 'done',
              url: candidateResume,
            }
          : undefined,
      });

      setDocumentFileList(
        candidateResume
          ? [
              {
                uid: candidateResume,
                name: candidateResume,
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

  return (
    editCandidateModal && (
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
        onCancel={() => setEditCandidateModal(false)}
        centered
        width={760}
        style={{ maxWidth: 'calc(100vw - 16px)' }}
        closeIcon={
          <CloseOutlined className="h-4 w-4 text-[rgba(0,0,0,0.65)]" />
        }
        footer={null}
        data-cy="talent-acquisition-edit-candidate-modal"
        bodyStyle={{
          maxHeight: '80vh',
          overflowY: 'auto',
          padding: '6px 24px 20px',
        }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFormSubmit}
          className="[&_.ant-form-item-label]:!pb-1"
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
                  <div
                    className="flex items-center justify-between"
                    data-cy="talent-acquisition-edit-candidate-full-name-label"
                  >
                    <span
                      data-cy="talent-acquisition-edit-candidate-full-name-label-text"
                      className="text-[14px] font-normal text-[#030712]"
                    >
                      Full Name
                    </span>
                    <span
                      className="text-red-500"
                      aria-hidden
                      data-cy="talent-acquisition-edit-candidate-full-name-required"
                    >
                      *
                    </span>
                  </div>
                }
                rules={[{ required: true, message: 'Please input full name!' }]}
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
                      <div
                        className="flex items-center justify-between"
                        data-cy="talent-acquisition-edit-candidate-email-label"
                      >
                        <span
                          data-cy="talent-acquisition-edit-candidate-email-label-text"
                          className="text-[14px] font-normal text-[#030712]"
                        >
                          Email
                        </span>
                        <span
                          className="text-red-500"
                          aria-hidden
                          data-cy="talent-acquisition-edit-candidate-email-required"
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
                      <div
                        className="flex items-center justify-between"
                        data-cy="talent-acquisition-edit-candidate-phone-label"
                      >
                        <span
                          data-cy="talent-acquisition-edit-candidate-phone-label-text"
                          className="text-[14px] font-normal text-[#030712]"
                        >
                          Phone Number
                        </span>
                        <span
                          className="text-red-500"
                          aria-hidden
                          data-cy="talent-acquisition-edit-candidate-phone-required"
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
                      value={phoneValue || ''}
                      onChange={(value) => form.setFieldValue('phone', value)}
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
                      <div
                        className="flex items-center justify-between"
                        data-cy="talent-acquisition-edit-candidate-job-label"
                      >
                        <span
                          data-cy="talent-acquisition-edit-candidate-job-label-text"
                          className="text-[14px] font-normal text-[#030712]"
                        >
                          Job
                        </span>
                        <span
                          className="text-red-500"
                          aria-hidden
                          data-cy="talent-acquisition-edit-candidate-job-required"
                        >
                          *
                        </span>
                      </div>
                    }
                    rules={[{ required: true, message: 'Please select a job' }]}
                  >
                    <Select
                      id="talent-acquisition-edit-candidate-select-job"
                      data-cy="talent-acquisition-edit-candidate-select-job"
                      size="large"
                      className="h-10 w-full [&_.ant-select-selector]:!h-10 [&_.ant-select-selector]:!min-h-10 [&_.ant-select-selection-item]:!leading-[38px]"
                      placeholder="Select job type"
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
                    label={
                      <div
                        className="flex items-center justify-between"
                        data-cy="talent-acquisition-edit-candidate-cgpa-label"
                      >
                        <span
                          data-cy="talent-acquisition-edit-candidate-cgpa-label-text"
                          className="text-[14px] font-normal text-[#030712]"
                        >
                          CGPA
                        </span>
                        <span
                          className="text-red-500"
                          aria-hidden
                          data-cy="talent-acquisition-edit-candidate-cgpa-required"
                        >
                          *
                        </span>
                      </div>
                    }
                    rules={[{ required: true, message: 'Please input CGPA' }]}
                  >
                    <InputNumber
                      id="talent-acquisition-edit-candidate-input-cgpa"
                      data-cy="talent-acquisition-edit-candidate-input-cgpa"
                      min={0}
                      max={4}
                      step={0.01}
                      className="h-10 w-full text-sm"
                      placeholder="0"
                    />
                  </Form.Item>
                  <div
                    id="talent-acquisition-edit-candidate-div-cgpa-info-wrapper"
                    data-cy="talent-acquisition-edit-candidate-div-cgpa-info-wrapper"
                    className="flex items-center justify-start gap-1 ml-1"
                  >
                    <FaInfoCircle />
                    <div
                      id="talent-acquisition-edit-candidate-div-cgpa-info"
                      data-cy="talent-acquisition-edit-candidate-div-cgpa-info"
                      className="text-xs text-gray-500"
                    >
                      Put your point 4.0 scale
                    </div>
                  </div>
                </Col>
              </Row>

              <Form.Item
                name="coverLetter"
                label={
                  <div
                    className="flex items-center justify-between"
                    data-cy="talent-acquisition-edit-candidate-cover-letter-label"
                  >
                    <span
                      className="text-[14px] font-normal text-[#030712]"
                      data-cy="talent-acquisition-edit-candidate-cover-letter-label-text"
                    >
                      Cover Letter
                    </span>
                    <span
                      className="text-red-500"
                      aria-hidden
                      data-cy="talent-acquisition-edit-candidate-cover-letter-required"
                    >
                      *
                    </span>
                  </div>
                }
                rules={[
                  { required: true, message: 'Please input cover letter!' },
                ]}
              >
                <Input.TextArea placeholder="Job description" rows={2} />
              </Form.Item>

              <Form.Item
                id="documentNameId"
                data-cy="talent-acquisition-edit-candidate-form-item-upload-cv"
                name="resumeUrl"
                label={
                  <div
                    className="flex items-center justify-between"
                    data-cy="talent-acquisition-edit-candidate-cv-label"
                  >
                    <span
                      data-cy="talent-acquisition-edit-candidate-cv-label-text"
                      className="text-[14px] font-normal text-[#030712]"
                    >
                      CV
                    </span>
                    <span
                      className="text-red-500"
                      aria-hidden
                      data-cy="talent-acquisition-edit-candidate-cv-required"
                    >
                      *
                    </span>
                  </div>
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
                  accept="application/pdf"
                  className="!rounded-[6px] !border-gray-200 !border-dashed bg-[#F9FAFB]"
                >
                  <p
                    data-cy="-components-modals-editcandidate-index-tsx-index-p-354"
                    className="flex items-center justify-center"
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
                    <p data-cy="-components-modals-editcandidate-index-tsx-index-p-367">
                      Upload your CV
                    </p>
                    <p
                      data-cy="-components-modals-editcandidate-index-tsx-index-p-368"
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
                onClick={() => setEditCandidateModal(false)}
                className="flex h-8 justify-center rounded-[6px] border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 hover:border-[#4096FF] hover:text-[#4096FF]"
              >
                Cancel
              </Button>
              <Button
                id="talent-acquisition-edit-candidate-button-save"
                data-cy="talent-acquisition-edit-candidate-button-save"
                htmlType="submit"
                className="flex h-8 justify-center rounded-[6px] border-none bg-[#1E40AF] px-4 text-sm font-medium text-white hover:bg-[#1D4ED8]"
              >
                Edit
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    )
  );
};

export default EditCandidate;
