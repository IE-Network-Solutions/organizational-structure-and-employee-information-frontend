'use client';
import CustomDrawerLayout from '@/components/common/customDrawer';
import {
  Col,
  Form,
  Image,
  Input,
  InputNumber,
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
}: CreateInternApplicantsProps) => {
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
    <div className=" text-xl font-extrabold text-gray-800 ">
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
    },
    {
      label: isEdit ? 'Update' : 'Create',
      key: 'create',
      className: 'h-[40px]  text-base',
      size: 'large',
      type: 'primary',
      loading: isEdit ? isUpdateLoading : isCreateLoading,
      onClick: () => form.submit(),
    },
  ];

  const handleSubmit = async () => {
    const formValues = form.getFieldsValue();
    // Determine resume URL - use new upload if available, otherwise keep existing
    let resumeUrl = '';
    if (documentFileList.length > 0) {
      // New file uploaded
      resumeUrl = documentFileList[0].name || documentFileList[0].url;
    } else if (isEdit && editData?.resumeUrl) {
      // Keep existing resume URL when editing
      resumeUrl = editData.resumeUrl;
    }

    const internData = {
      fullName: formValues.fullName,
      email: formValues.email,
      phone: formValues.phone,
      CGPA: formValues.CGPA,
      graduateYear: formValues.yearOfGraduation, // Map yearOfGraduation to graduateYear
      departmentId: formValues.department, // Map department to departmentId
      coverLetter: formValues.coverLetter,
      resumeUrl: resumeUrl,
    };

    if (isEdit && editData) {
      // Update existing talent roaster
      updateIntern(
        { id: editData.id, data: internData },
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
      // Create new talent roaster
      createIntern(internData, {
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
    <CustomDrawerLayout
      open={open}
      onClose={onClose}
      modalHeader={internApplicantsDrawerHeader}
      width="40%"
      customMobileHeight="75vh"
      footer={<CustomDrawerFooterButton buttons={footerModalItems} />}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
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
          <Input placeholder="Full Name" className="w-full h-10 text-sm" />
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
                  pattern: /^\+?[1-9]\d{1,14}$/,
                  message: 'Please enter a valid phone number!',
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
          <Col xs={24} sm={24} lg={24} md={24} xl={24}>
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
          id="yearOfGraduationId"
          name="yearOfGraduation"
          label={
            <span className="text-md font-semibold text-gray-700">
              Year of Graduation
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
            placeholder="Year of Graduation"
            className="w-full h-10 text-sm"
          />
        </Form.Item>

        <Form.Item
          id="departmentId"
          name="department"
          label={
            <span className="text-md font-semibold text-gray-700">
              Department
            </span>
          }
          rules={[{ required: true, message: 'Please input department!' }]}
        >
          <Select placeholder="Department" className="w-full h-10 text-sm">
            {EmployeeDepartment?.map((item: DepartmentData) => (
              <Option key={item?.id} value={item?.id}>
                {item?.name}
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
            name="documentName"
            fileList={documentFileList}
            onChange={handleDocumentChange}
            onRemove={handleDocumentRemove}
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

export default CreateInternApplicants;
