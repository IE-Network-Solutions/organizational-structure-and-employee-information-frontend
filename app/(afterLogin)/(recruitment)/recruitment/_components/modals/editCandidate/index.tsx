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
  Upload,
} from 'antd';

import React, { useEffect } from 'react';
import { useGetJobs } from '@/store/server/features/recruitment/job/queries';
import { FaInfoCircle } from 'react-icons/fa';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { InboxOutlined } from '@ant-design/icons';
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';

const { Dragger } = Upload;

const EditCandidate: React.FC = () => {
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

  useGetJobs(searchParams?.whatYouNeed || '', currentPage, pageSize);
  const { mutate: updateCandidate } = useUpdateCandidate();

  const updatedBy = useAuthenticationStore.getState().userId;

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
      jobInformationId: editCandidate?.jobCandidate?.[0]?.jobInformationId,
      updatedBy: updatedBy,
    };
    formData.append('newFormData', JSON.stringify(formattedValues));
    updateCandidate(
      { data: formData, id: selectedCandidateId },
      {
        onSuccess: () => {
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
      form.setFieldsValue({
        fullName: editCandidate?.fullName,
        email: editCandidate?.email,
        phone: editCandidate?.phone || editCandidate?.phoneNumber,
        jobInformationId: editCandidate?.jobCandidate?.map(
          (item: any) => item?.jobInformation?.jobTitle,
        ),
        CGPA: editCandidate?.CGPA,
        coverLetter: editCandidate?.jobCandidate?.[0]?.coverLetter || '',
        resumeUrl: editCandidate?.resumeUrl
          ? {
              uid: editCandidate?.resumeUrl,
              name: editCandidate?.resumeUrl,
              status: 'done',
              url: editCandidate?.resumeUrl,
            }
          : undefined,
      });
    }
  }, [editCandidate, selectedCandidateId]);

  return (
    <Modal
      open={editCandidateModal}
      onCancel={() => setEditCandidateModal(false)}
      footer={null}
      width={630}
      title={
        <div
          id="talent-acquisition-edit-candidate-div-header"
          data-cy="talent-acquisition-edit-candidate-div-header"
          className="text-lg font-semibold text-gray-900"
        >
          Edit Candidate
        </div>
      }
      maskClosable={false}
      destroyOnClose
      styles={{
        body: {
          backgroundColor: '#FFFFFF',
          padding: 32,
        },
      }}
      data-cy="talent-acquisition-edit-candidate-modal"
      zIndex={10002}
    >
      <Form
        id="talent-acquisition-edit-candidate-form"
        data-cy="talent-acquisition-edit-candidate-form"
        form={form}
        layout="vertical"
        initialValues={editCandidate}
        onFinish={() => {
          handleFormSubmit();
        }}
      >
        <div
          className="bg-white border border-[#D9D9D9] rounded-lg px-4 py-2"
          data-cy="talent-acquisition-edit-candidate-form-container"
        >
          <Form.Item
            id="fullNameId"
            data-cy="talent-acquisition-edit-candidate-form-item-full-name"
            name="fullName"
            label={
              <span
                data-cy="-components-modals-editcandidate-index-tsx-index-span-169"
                className="text-sm font-medium text-gray-700"
              >
                Full Name{' '}
              </span>
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
                  <span
                    data-cy="-components-modals-editcandidate-index-tsx-index-span-189"
                    className="text-sm font-medium text-gray-700"
                  >
                    Email{' '}
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
                    data-cy="-components-modals-editcandidate-index-tsx-index-span-219"
                    className="text-sm font-medium text-gray-700"
                  >
                    Phone Number{' '}
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
                <PhoneInput
                  defaultCountry="et"
                  placeholder="Input"
                  className="!rounded-lg !bg-gray-100 !border-gray-300 w-full [&_.react-international-phone-input-container]:!rounded-lg [&_.react-international-phone-input-container]:!bg-gray-100 [&_.react-international-phone-input-container]:!border-gray-300 [&_.react-international-phone-country-selector-button__flag-emoji]:!hidden [&_.react-international-phone-country-selector-dropdown__list-item-flag-emoji]:!hidden"
                  style={
                    {
                      '--react-international-phone-height': '40px',
                      '--react-international-phone-background-color': '#f5f5f5',
                      '--react-international-phone-border-radius': '8px',
                      '--react-international-phone-border-color': '#d9d9d9',
                    } as React.CSSProperties
                  }
                  inputClassName="!bg-transparent !border-0 text-sm placeholder:text-gray-400 focus:!shadow-none"
                  data-cy="talent-acquisition-edit-candidate-input-phone"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={24} lg={12} md={12} xl={12}>
              <Form.Item
                id="cgpaId"
                name="CGPA"
                label={
                  <span
                    data-cy="-components-modals-editcandidate-index-tsx-index-span-279"
                    className="text-sm font-medium text-gray-700"
                  >
                    CGPA{' '}
                  </span>
                }
                rules={[{ required: true, message: 'Please input CGPA' }]}
              >
                <InputNumber
                  id="talent-acquisition-edit-candidate-input-cgpa"
                  data-cy="talent-acquisition-edit-candidate-input-cgpa"
                  min={0}
                  max={4}
                  step={0.01}
                  className="text-sm w-full h-10"
                  placeholder="CGPA"
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
            id="documentNameId"
            data-cy="talent-acquisition-edit-candidate-form-item-upload-cv"
            name="resumeUrl"
            label={
              <span
                data-cy="-components-modals-editcandidate-index-tsx-index-span-335"
                className="text-sm font-medium text-gray-700"
              >
                CV{' '}
              </span>
            }
            rules={[
              { required: true, message: 'Please choose the document type' },
            ]}
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
              className="!border-gray-200 !border-dashed !rounded-2xl bg-[#F9FAFB]"
            >
              <p
                data-cy="-components-modals-editcandidate-index-tsx-index-p-354"
                className="flex items-center justify-center"
              >
                <InboxOutlined
                  style={{ fontSize: '40px', color: '#1E40AF' }}
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
          <Form.Item
            id="resumeUrlId"
            name="resumeUrl"
            label={
              <span
                data-cy="-components-modals-editcandidate-index-tsx-index-span-385"
                className="text-md font-semibold text-gray-700"
              >
                Resume
              </span>
            }
          >
            {editCandidate?.resumeUrl ? (
              <a
                id="talent-acquisition-edit-candidate-link-download-resume"
                data-cy="talent-acquisition-edit-candidate-link-download-resume"
                href={editCandidate.resumeUrl.replace(
                  'open?id=',
                  'uc?export=download&id=',
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                Download Resume
              </a>
            ) : (
              <span
                data-cy="-components-modals-editcandidate-index-tsx-index-span-405"
                className="text-gray-500"
              >
                No resume uploaded
              </span>
            )}
          </Form.Item>
        </div>
        <Form.Item>
          <div
            id="talent-acquisition-edit-candidate-div-buttons"
            data-cy="talent-acquisition-edit-candidate-div-buttons"
            className="flex justify-end w-full bg-[#fff] px-0 pt-4 gap-3"
          >
            <Button
              id="talent-acquisition-edit-candidate-button-cancel"
              data-cy="talent-acquisition-edit-candidate-button-cancel"
              onClick={() => setEditCandidateModal(false)}
              className="flex justify-center text-sm font-medium text-gray-800 bg-white px-3 h-8 hover:border-[#4096FF] hover:text-[#4096FF] border-gray-300"
            >
              Cancel
            </Button>
            <Button
              id="talent-acquisition-edit-candidate-button-save"
              data-cy="talent-acquisition-edit-candidate-button-save"
              htmlType="submit"
              className="flex justify-center text-sm font-medium text-white bg-primary px-3 h-8 border-none hover:bg-[#4096FF]"
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
