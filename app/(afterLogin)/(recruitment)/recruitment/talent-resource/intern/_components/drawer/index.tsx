'use client';
import CustomDrawerLayout from '@/components/common/customDrawer';
import {
  Button,
  Col,
  Form,
  Image,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Upload,
  UploadFile,
} from 'antd';
import { UploadChangeParam } from 'antd/es/upload';
import TextArea from 'antd/es/input/TextArea';
import React, { useEffect } from 'react';
import { FaInfoCircle } from 'react-icons/fa';
import cvUpload from '@/public/image/cvUpload.png';
import { useGetDepartments } from '@/store/server/features/employees/employeeManagment/department/queries';
import {
  useCreateIntern,
  useUpdateIntern,
} from '@/store/server/features/recruitment/intern/mutation';
import { useInternStore } from '@/store/uistate/features/recruitment/talent-resource/intern';
import { CustomDrawerFooterButtonProps } from '@/components/common/customDrawer/customDrawerFooterButton';
import { useQueryClient } from 'react-query';
import CustomDrawerFooterButton from '@/components/common/customDrawer/customDrawerFooterButton';

const { Dragger } = Upload;
const { Option } = Select;

// Define interfaces for type safety
interface InternEditData {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  CGPA: number;
  graduateYear: string;
  departmentId: string;
  coverLetter: string;
  resumeUrl?: string;
}

interface DepartmentData {
  id: string;
  name: string;
  description?: string;
  branchId?: string;
}

interface CreateInternApplicantsProps {
  open: boolean;
  onClose: () => boolean;
  editData?: InternEditData; // Replace any with proper interface
  isEdit?: boolean; // Flag to determine if we're in edit mode
}

const CreateInternApplicants: React.FC<CreateInternApplicantsProps> = ({
  open,
  onClose,
  editData,
  isEdit = false,
}) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const { documentFileList, setDocumentFileList, removeDocument } =
    useInternStore();

  const { data: EmployeeDepartment } = useGetDepartments();

  const { mutate: createIntern, isLoading: isCreateLoading } =
    useCreateIntern();
  const { mutate: updateIntern, isLoading: isUpdateLoading } =
    useUpdateIntern();

  const handleDocumentChange = (info: UploadChangeParam<UploadFile>) => {
    const fileList = Array.isArray(info.fileList) ? info.fileList : [];
    setDocumentFileList(fileList);
  };
  const handleDocumentRemove = (file: UploadFile) => {
    removeDocument(file.uid);
  };

  // Populate form when editing
  useEffect(() => {
    if (isEdit && editData && open) {
      form.setFieldsValue({
        fullName: editData.fullName,
        email: editData.email,
        phone: editData.phone,
        CGPA: editData.CGPA,
        yearOfGraduation: editData.graduateYear,
        department: editData.departmentId,
        coverLetter: editData.coverLetter,
      });

      // Handle resume file if it exists
      if (editData.resumeUrl) {
        const fileObj: UploadFile = {
          uid: '-1',
          name: editData.resumeUrl,
          status: 'done',
          url: editData.resumeUrl,
        };
        setDocumentFileList([fileObj]);
      }
    } else if (!isEdit && open) {
      // Reset form when opening for create
      form.resetFields();
      setDocumentFileList([]);
    }
  }, [isEdit, editData, open, form, setDocumentFileList]);

  const internApplicantsDrawerHeader = (
    <div
      id="talent-acquisition-intern-drawer-header"
      data-cy="talent-acquisition-intern-drawer-header"
      className=" text-xl font-extrabold text-gray-800 "
    >
      {isEdit ? 'Edit Intern Applicant' : 'Intern Applicants'}
    </div>
  );

  const footerModalItems: CustomDrawerFooterButtonProps[] = [
    {
      label: 'Cancel',
      key: 'cancel',
      className: 'h-[40px] text-base',
      size: 'large',
      onClick: onClose,
      id: 'talent-acquisition-intern-button-cancel',
      'data-cy': 'talent-acquisition-intern-button-cancel',
    },
    {
      label: isEdit ? 'Update' : 'Create',
      key: 'create',
      className: 'h-[40px]  text-base',
      size: 'large',
      type: 'primary',
      loading: isEdit ? isUpdateLoading : isCreateLoading,
      onClick: () => form.submit(),
      id: isEdit
        ? 'talent-acquisition-intern-button-update'
        : 'talent-acquisition-intern-button-create',
      'data-cy': isEdit
        ? 'talent-acquisition-intern-button-update'
        : 'talent-acquisition-intern-button-create',
    },
  ];

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

    const internData = {
      ...formValues,
      graduateYear: formValues.yearOfGraduation, // Map the field name to match database
      departmentId: formValues.department,
    };

    // Remove the original field name to avoid duplication
    delete internData.yearOfGraduation;
    delete internData.department;
    formData.append('newFormData', JSON.stringify(internData));

    if (isEdit && editData) {
      // Update existing intern
      updateIntern(
        { id: editData.id, data: formData },
        {
          onSuccess: () => {
            queryClient.invalidateQueries('intern');
            form.resetFields();
            setDocumentFileList([]);
            onClose();
          },
        },
      );
    } else {
      // Create new intern
      createIntern(formData, {
        onSuccess: () => {
          queryClient.invalidateQueries('intern');
          form.resetFields();
          setDocumentFileList([]);
          onClose();
        },
      });
    }
  };

  return (
    <Modal
      data-cy="talent-acquisition-intern-drawer"
      open={open}
      onCancel={onClose}
      title={
        <div
          id="talent-acquisition-talent-roaster-drawer-header"
          data-cy="talent-acquisition-talent-roaster-drawer-header"
          className="px-3"
        >
          <h2 className="text-xl font-bold text-gray-800 m-0">
            {isEdit ? 'Edit Intern Applicant' : 'Intern Applicants'}{' '}
          </h2>
          <p className="text-sm text-gray-500 mt-1 mb-0 font-normal">
            Please fill in all the information correctly
          </p>
        </div>
      }
      footer={
        <div className="flex justify-end gap-3 px-20">
          <Button type="default" onClick={onClose}>
            Cancel
          </Button>
          <Button type="primary" onClick={() => form.submit()}>
            {isEdit ? 'Update' : 'Create'}
          </Button>
        </div>
      }
      centered
      bodyStyle={{ padding: 0 }}
      zIndex={10002}
      className="sm:w-3/5 sm:h-[95vh]"
    >
      <div className="sm:pt-10 sm:mx-20">
        <div className="rounded-lg bg-gray-50/50 py-5 px-5 border-2 border-[#d9d9d9]">
          <Form
            id="talent-acquisition-intern-form"
            data-cy="talent-acquisition-intern-form"
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Form.Item
              id="fullNameId"
              name="fullName"
              label={
                <span
                  data-cy="intern-components-drawer-index-tsx-index-span-225"
                  className="text-md font-semibold text-gray-700"
                >
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
                id="talent-acquisition-intern-input-full-name"
                data-cy="talent-acquisition-intern-input-full-name"
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
                      data-cy="intern-components-drawer-index-tsx-index-span-251"
                      className="text-md font-semibold text-gray-700"
                    >
                      Email Address
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
                    id="talent-acquisition-intern-input-email"
                    data-cy="talent-acquisition-intern-input-email"
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
                    <span
                      data-cy="intern-components-drawer-index-tsx-index-span-278"
                      className="text-md font-semibold text-gray-700"
                    >
                      Phone Number
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
                  <Input
                    id="talent-acquisition-intern-input-phone"
                    data-cy="talent-acquisition-intern-input-phone"
                    type="tel"
                    className="text-sm w-full h-10"
                    placeholder="Phone number"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} sm={24} lg={24} md={24} xl={24}>
                <Form.Item
                  id="cgpaId"
                  name="CGPA"
                  label={
                    <span
                      data-cy="intern-components-drawer-index-tsx-index-span-307"
                      className="text-md font-semibold text-gray-700"
                    >
                      CGPA
                    </span>
                  }
                  rules={[{ required: true, message: 'Please input CGPA' }]}
                >
                  <InputNumber
                    id="talent-acquisition-intern-input-cgpa"
                    data-cy="talent-acquisition-intern-input-cgpa"
                    type="number"
                    min={0}
                    max={4}
                    step={0.01}
                    className="text-sm w-full h-10"
                    placeholder="CGPA"
                  />
                </Form.Item>
                <div
                  data-cy="talent-acquisition-intern-drawer-div-cgpa-info"
                  className="flex items-center justify-start gap-1 ml-1"
                >
                  <FaInfoCircle />
                  <div
                    data-cy="intern-components-drawer-index-tsx-index-div-329"
                    className="text-xs font-md"
                  >
                    Put your point 4.0 scale
                  </div>
                </div>
              </Col>
            </Row>

            <Form.Item
              id="yearOfGraduationId"
              name="yearOfGraduation"
              label={
                <span
                  data-cy="intern-components-drawer-index-tsx-index-span-338"
                  className="text-md font-semibold text-gray-700"
                >
                  Expected Year of Graduation
                </span>
              }
              rules={[
                { required: true, message: 'Please input year of graduation!' },
                {
                  pattern: /^\d{4}$/,
                  message: 'Please enter a valid year!',
                },
              ]}
            >
              <Input
                id="talent-acquisition-intern-input-year-graduation"
                data-cy="talent-acquisition-intern-input-year-graduation"
                placeholder="Expected Year of Graduation"
                className="w-full h-10 text-sm"
              />
            </Form.Item>

            <Form.Item
              id="departmentId"
              name="department"
              label={
                <span
                  data-cy="intern-components-drawer-index-tsx-index-span-362"
                  className="text-md font-semibold text-gray-700"
                >
                  Department
                </span>
              }
              rules={[{ required: true, message: 'Please input department!' }]}
            >
              <Select
                id="talent-acquisition-intern-select-department"
                data-cy="talent-acquisition-intern-select-department"
                placeholder="Department"
                className="w-full h-10 text-sm"
                showSearch
                allowClear
                filterOption={(input, option) =>
                  String(option?.children ?? '')
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              >
                {EmployeeDepartment?.map((item: DepartmentData) => (
                  <Option
                    key={item?.id}
                    value={item?.id}
                    id={`talent-acquisition-intern-option-department-${item?.id}`}
                    data-cy={`talent-acquisition-intern-option-department-${item?.id}`}
                  >
                    {item?.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              id="coverLetterId"
              name="coverLetter"
              label={
                <span
                  data-cy="intern-components-drawer-index-tsx-index-span-397"
                  className="text-md font-semibold text-gray-700"
                >
                  Cover Letter
                </span>
              }
              rules={[{ required: true, message: 'Please input cover letter' }]}
            >
              <TextArea
                id="talent-acquisition-intern-textarea-cover-letter"
                data-cy="talent-acquisition-intern-textarea-cover-letter"
                rows={4}
                className="text-sm w-full"
                placeholder="Please enter your cover letter here"
              />
            </Form.Item>

            <Form.Item
              id="documentNameId"
              name="resumeUrl"
              label={
                <span
                  data-cy="intern-components-drawer-index-tsx-index-span-416"
                  className="text-md font-semibold text-gray-700"
                >
                  Upload CV
                </span>
              }
              rules={[
                {
                  required:
                    !isEdit ||
                    (isEdit &&
                      !editData?.resumeUrl &&
                      documentFileList.length === 0),
                  message: 'Please upload your CV',
                },
              ]}
            >
              <Dragger
                id="talent-acquisition-intern-upload-cv"
                data-cy="talent-acquisition-intern-upload-cv"
                name="documentName"
                fileList={documentFileList}
                onChange={handleDocumentChange}
                onRemove={handleDocumentRemove}
                listType="picture"
                accept=".pdf,.doc,.docx"
              >
                <p data-cy="intern-components-drawer-index-tsx-index-p-441">
                  <Image
                    preview={false}
                    className="w-full max-w-xs"
                    src={cvUpload.src}
                    alt="Loading"
                  />
                </p>
                <div
                  data-cy="intern-components-drawer-index-tsx-index-div-449"
                  className="flex flex-col justify-center items-center text-md font-semibold text-gray-950"
                >
                  <p data-cy="intern-components-drawer-index-tsx-index-p-450">
                    Upload your CV
                  </p>
                  <p
                    data-cy="intern-components-drawer-index-tsx-index-p-451"
                    className="text-gray-400 text-sm font-normal"
                  >
                    or drag and drop it here
                  </p>
                </div>
              </Dragger>
            </Form.Item>
            <div
              data-cy="intern-components-drawer-index-tsx-index-div-457"
              className="text-sm font-md mb-8"
            >
              Max file size: 5MB. File formats: .pdf, .doc, .docx
            </div>
          </Form>
        </div>
      </div>
    </Modal>
  );
};

export default CreateInternApplicants;
