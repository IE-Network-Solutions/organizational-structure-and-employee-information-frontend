'use client';
import {
  Col,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Upload,
  UploadFile,
} from 'antd';
import { UploadChangeParam } from 'antd/es/upload/interface';
import { useEffect } from 'react';
import TextArea from 'antd/es/input/TextArea';
import {
  useCreateTalentRoaster,
  useUpdateTalentRoaster,
} from '@/store/server/features/recruitment/talent-roaster/mutation';
import { useEmployeeDepartments } from '@/store/server/features/employees/employeeManagment/queries';
import CustomDrawerFooterButton, {
  CustomDrawerFooterButtonProps,
} from '@/components/common/customDrawer/customDrawerFooterButton';
import { useTalentRoasterStore } from '@/store/uistate/features/recruitment/talent-resource/talent-roaster';
import { useQueryClient } from 'react-query';
import { Inbox } from 'lucide-react';

const { Dragger } = Upload;
const { Option } = Select;

// Define interfaces for proper typing
interface TalentRoasterItem {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  CGPA: number;
  departmentId: string;
  graduateYear: string;
  coverLetter?: string;
  resumeUrl?: string;
}

interface DepartmentData {
  id: string;
  name: string;
  description?: string;
  branchId?: string;
}

interface CreateTalentRoasterProps {
  open: boolean;
  onClose: () => boolean;
  editData?: TalentRoasterItem;
  isEdit?: boolean;
}

const CreateTalentRoaster: React.FC<CreateTalentRoasterProps> = ({
  open,
  onClose,
  editData,
  isEdit = false,
}) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const { documentFileList, setDocumentFileList, removeDocument } =
    useTalentRoasterStore();
  const { data: EmployeeDepartment } = useEmployeeDepartments() as {
    data: DepartmentData[] | undefined;
  };

  const { mutate: createTalentRoaster, isLoading: isCreateLoading } =
    useCreateTalentRoaster();
  const { mutate: updateTalentRoaster, isLoading: isUpdateLoading } =
    useUpdateTalentRoaster();

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

  const footerModalItems: CustomDrawerFooterButtonProps[] = [
    {
      label: 'Cancel',
      key: 'cancel',
      className: 'h-8 border-[1px] border-[#d9d9d9] font-normal',
      size: 'large',
      onClick: onClose,
      id: 'talent-acquisition-talent-roaster-button-cancel',
      'data-cy': 'talent-acquisition-talent-roaster-button-cancel',
    },
    {
      label: isEdit ? 'Update' : 'Create',
      key: 'create',
      className: 'h-8 font-normal',
      size: 'large',
      type: 'primary',
      loading: isEdit ? isUpdateLoading : isCreateLoading,
      onClick: () => form.submit(),
      id: isEdit
        ? 'talent-acquisition-talent-roaster-button-update'
        : 'talent-acquisition-talent-roaster-button-create',
      'data-cy': isEdit
        ? 'talent-acquisition-talent-roaster-button-update'
        : 'talent-acquisition-talent-roaster-button-create',
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

    const talentRoasterData = {
      ...formValues,
      graduateYear: formValues.yearOfGraduation, // Map the field name to match database
      departmentId: formValues.department,
    };

    // Remove the original field name to avoid duplication
    delete talentRoasterData.yearOfGraduation;
    delete talentRoasterData.department;

    formData.append('newFormData', JSON.stringify(talentRoasterData));

    if (isEdit && editData) {
      // Update existing talent roaster
      updateTalentRoaster(
        { id: editData.id, data: formData },
        {
          onSuccess: () => {
            queryClient.invalidateQueries('talentRoaster');
            form.resetFields();
            setDocumentFileList([]);
            onClose();
          },
        },
      );
    } else {
      // Create new talent roaster
      createTalentRoaster(formData, {
        onSuccess: () => {
          queryClient.invalidateQueries('talentRoaster');
          form.resetFields();
          setDocumentFileList([]);
          onClose();
        },
      });
    }
  };

  return (
    <Modal
      data-cy="talent-acquisition-talent-roaster-drawer"
      open={open}
      onCancel={onClose}
      title={
        <div
          id="talent-acquisition-talent-roaster-drawer-header"
          data-cy="talent-acquisition-talent-roaster-drawer-header"
          className="px-3"
        >
          <h2
            data-cy="talent-acquisition-talent-roaster-drawer-title"
            className="text-xl font-bold text-black m-0"
          >
            {isEdit
              ? 'Edit Talent Roaster Applicant'
              : 'Add Talent Roaster Applicant'}
          </h2>
          <p
            data-cy="talent-acquisition-talent-roaster-drawer-description"
            className="text-sm text-black mt-1 mb-0 font-normal"
          >
            Please fill in all the information correctly
          </p>
        </div>
      }
      footer={
        <div
          data-cy="talent-acquisition-talent-roaster-drawer-footer"
          className="flex justify-end gap-2 sm:px-20"
        >
          <CustomDrawerFooterButton buttons={footerModalItems} />
        </div>
      }
      centered
      bodyStyle={{ padding: 0 }}
      zIndex={10002}
      className="sm:w-3/5 sm:h-[95vh]"
    >
      <div
        data-cy="talent-acquisition-talent-roaster-drawer-body"
        className="sm:pt-10 sm:mx-20"
      >
        <div
          data-cy="talent-acquisition-talent-roaster-drawer-body-form"
          className="rounded-lg  py-5 px-5 border-[1px] border-[#d9d9d9]"
        >
          <Form
            id="talent-acquisition-talent-roaster-form"
            data-cy="talent-acquisition-talent-roaster-form"
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            requiredMark={false}
          >
            <Form.Item
              data-cy="talent-acquisition-talent-roaster-form-item-full-name"
              id="fullNameId"
              name="fullName"
              label={
                <span
                  data-cy="talent-roaster-components-drawer-index-tsx-index-span-230"
                  className="text-sm font-normal text-black"
                >
                  Full Name{' '}
                  <span className="text-error" data-cy="custom-label-required">
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
                id="talent-acquisition-talent-roaster-input-full-name"
                data-cy="talent-acquisition-talent-roaster-input-full-name"
                placeholder="Full Name"
                className="w-full h-10 text-sm"
              />
            </Form.Item>

            <Row gutter={16}>
              <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                <Form.Item
                  data-cy="talent-acquisition-talent-roaster-form-item-email"
                  id="emailAddressId"
                  name="email"
                  label={
                    <span
                      data-cy="talent-roaster-components-drawer-index-tsx-index-span-256"
                      className="text-sm font-normal text-black"
                    >
                      Email Address{' '}
                      <span
                        className="text-error"
                        data-cy="custom-label-required"
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
                    id="talent-acquisition-talent-roaster-input-email"
                    data-cy="talent-acquisition-talent-roaster-input-email"
                    type="email"
                    className="text-sm w-full h-10"
                    placeholder="Email address"
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={24} lg={12} md={12} xl={12}>
                <Form.Item
                  data-cy="talent-acquisition-talent-roaster-form-item-phone"
                  id="phoneNumberId"
                  name="phone"
                  label={
                    <span
                      data-cy="talent-roaster-components-drawer-index-tsx-index-span-283"
                      className="text-sm font-normal text-black"
                    >
                      Phone Number{' '}
                      <span
                        className="text-error"
                        data-cy="custom-label-required"
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
                  <Input
                    id="talent-acquisition-talent-roaster-input-phone"
                    data-cy="talent-acquisition-talent-roaster-input-phone"
                    type="tel"
                    className="text-sm w-full h-10"
                    placeholder="Phone number"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              
              <Col xs={12} sm={12} lg={12} md={12} xl={12}>
                <Form.Item
                  id="yearOfGraduationId"
                  name="yearOfGraduation"
                  label={
                    <span
                      data-cy="talent-roaster-components-drawer-index-tsx-index-span-344"
                      className="text-sm font-normal text-black"
                    >
                      Year of Graduation{' '}
                      <span
                        className="text-error"
                        data-cy="custom-label-required"
                      >
                        *
                      </span>
                    </span>
                  }
                  rules={[
                    {
                      required: true,
                      message: 'Please input year of graduation!',
                    },
                    {
                      pattern: /^\d{4}$/,
                      message: 'Please enter a valid year!',
                    },
                  ]}
                >
                  <Input
                    id="talent-acquisition-talent-roaster-input-year-graduation"
                    data-cy="talent-acquisition-talent-roaster-input-year-graduation"
                    placeholder="Year of Graduation"
                    className="w-full h-10 text-sm"
                  />
                </Form.Item>
              </Col>
              <Col xs={12} sm={12} lg={12} md={12} xl={12}>
                <Form.Item
                  data-cy="talent-acquisition-talent-roaster-form-item-cgpa"
                  id="cgpaId"
                  name="CGPA"
                  label={
                    <span
                      data-cy="talent-roaster-components-drawer-index-tsx-index-span-312"
                      className="text-sm font-normal text-black"
                    >
                      CGPA{' '}
                      <span
                        className="text-error"
                        data-cy="custom-label-required"
                      >
                        *
                      </span>
                    </span>
                  }
                  rules={[{ required: true, message: 'Please input CGPA' }]}
                >
                  <InputNumber
                    id="talent-acquisition-talent-roaster-input-cgpa"
                    data-cy="talent-acquisition-talent-roaster-input-cgpa"
                    type="number"
                    min={0}
                    max={4}
                    step={0.01}
                    className="text-sm w-full h-10"
                    placeholder="CGPA"
                  />
                </Form.Item>
                
                  <div
                    data-cy="talent-roaster-components-drawer-index-tsx-index-div-335"
                    className="text-xs font-normal text-black opacity-45"
                  >
                    Put your point 4.0 scale
                  </div>
              </Col>
            </Row>

            <Form.Item
              id="departmentId"
              name="department"
              className='mt-2'
              label={
                <span
                  data-cy="talent-roaster-components-drawer-index-tsx-index-span-368"
                  className="text-sm font-normal text-black"
                >
                  Department{' '}
                  <span className="text-error" data-cy="custom-label-required">
                    *
                  </span>
                </span>
              }
              rules={[{ required: true, message: 'Please input department!' }]}
            >
              <Select
                id="talent-acquisition-talent-roaster-select-department"
                data-cy="talent-acquisition-talent-roaster-select-department"
                placeholder="Select department"
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
                    id={`talent-acquisition-talent-roaster-option-department-${item?.id}`}
                    data-cy={`talent-acquisition-talent-roaster-option-department-${item?.id}`}
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
                  data-cy="talent-roaster-components-drawer-index-tsx-index-span-404"
                  className="text-sm font-normal text-black"
                >
                  Cover Letter{' '}
                  <span className="text-error" data-cy="custom-label-required">
                    *
                  </span>
                </span>
              }
              rules={[{ required: true, message: 'Please input cover letter' }]}
            >
              <TextArea
                id="talent-acquisition-talent-roaster-textarea-cover-letter"
                data-cy="talent-acquisition-talent-roaster-textarea-cover-letter"
                className="text-sm w-full"
                placeholder="Please enter your cover letter here"
              />
            </Form.Item>

            <Form.Item
              id="documentNameId"
              name="resumeUrl"
              label={
                <span
                  data-cy="talent-roaster-components-drawer-index-tsx-index-span-423"
                  className="text-sm font-normal text-black"
                >
                  Upload CV{' '}
                  <span className="text-error" data-cy="custom-label-required">
                    *
                  </span>
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
                id="talent-acquisition-talent-roaster-upload-cv"
                data-cy="talent-acquisition-talent-roaster-upload-cv"
                name="documentName"
                fileList={documentFileList}
                onChange={handleDocumentChange}
                onRemove={handleDocumentRemove}
                listType="picture"
                accept=".pdf,.doc,.docx"
              >
                <div
                  data-cy="talent-acquisition-talent-roaster-upload-cv-icon"
                  className="flex items-center justify-center"
                >
                  <Inbox className="w-10 h-10 text-primary" />
                </div>

                <div
                  data-cy="talent-roaster-components-drawer-index-tsx-index-div-456"
                  className="flex flex-col justify-center items-center text-md font-normal"
                >
                  <p className='font-normal text-black opacity-70' data-cy="talent-roaster-components-drawer-index-tsx-index-p-457">
                    Upload your CV
                  </p>
                  <p
                    data-cy="talent-roaster-components-drawer-index-tsx-index-p-458"
                    className="text-gray-400 text-sm font-normal"
                  >
                    or drag and drop it here
                  </p>
                </div>
              </Dragger>
            </Form.Item>
          </Form>
        </div>
      </div>
    </Modal>
  );
};

export default CreateTalentRoaster;
