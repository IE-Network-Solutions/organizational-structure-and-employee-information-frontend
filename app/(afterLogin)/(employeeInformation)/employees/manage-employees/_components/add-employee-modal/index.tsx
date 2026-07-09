'use client';

import React, { useEffect, useState } from 'react';
import { Card, Form, Steps, Modal } from 'antd';
import { useAddEmployee } from '@/store/server/features/employees/employeeManagment/mutations';
import { transformData } from '../formData';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import BasicInformationForm from '../allFormData/basicInformationForm';
import JobTimeLineForm from '../allFormData/jobTimeLineForm';
import DocumentUploadForm from '../allFormData/documentUploadForm';
import CustomFieldsForm from '../allFormData/customFieldsForm';
import ButtonContinue from '../allFormData/SaveAndContinueButton';
import { useEmployeeManagementStore } from '@/store/uistate/features/employees/employeeManagment';
import { useGetRolesWithPermission } from '@/store/server/features/employees/settings/role/queries';
import { useGetPermissionGroupsWithOutPagination } from '@/store/server/features/employees/settings/groupPermission/queries';
import CustomModal from '@/app/(afterLogin)/(employeeInformation)/_components/sucessModal/successModal';

type RoleWithPermissions = {
  id: string;
  name: string;
  permissions?: { id: string }[];
};

const getDefaultRole = (roles: RoleWithPermissions[] = []) => {
  if (!roles.length) return null;

  const employeeRole = roles.find(
    (role) => role.name?.toLowerCase() === 'User',
  );

  return employeeRole ?? roles[2] ?? null;
};

const getDefaultPermissions = (
  role: RoleWithPermissions | null,
  groupPermissionData?: {
    items?: { isBasic?: boolean; permissions?: { id: string }[] }[];
  },
) => {
  const basicGroupPermissions =
    groupPermissionData?.items
      ?.filter((item) => item.isBasic)
      .flatMap((item) => item.permissions ?? []) ?? [];

  const rolePermissions =
    role?.permissions?.map((permission) => permission.id) ?? [];

  return Array.from(
    new Set([
      ...rolePermissions,
      ...basicGroupPermissions.map((permission) => permission.id),
    ]),
  );
};

const AddEmployeeModal = (props: any) => {
  const [form] = Form.useForm();
  const {
    setCurrent,
    current,
    open,
    setOpen,
    setProfileFileList,
    setDocumentFileList,
    setSelectedPermissions,
    setSelectedWorkSchedule,
    employeePrefillData,
    setEmployeePrefillData,
    isEmployeeModalFromCandidateMove,
    setIsEmployeeModalFromCandidateMove,
  } = useEmployeeManagementStore();
  const { mutate: createEmployee, isLoading, isSuccess } = useAddEmployee();
  const { data: rolesWithPermission } = useGetRolesWithPermission();
  const { data: groupPermissionData } =
    useGetPermissionGroupsWithOutPagination();
  const { setTempAllowances } = useEmployeeManagementStore();
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);

  useEffect(() => {
    if (!open || !employeePrefillData) return;

    form.resetFields();
    form.setFieldsValue(employeePrefillData);
    setCurrent(0);
    setEmployeePrefillData(null);
  }, [open, employeePrefillData, form, setCurrent, setEmployeePrefillData]);

  useEffect(() => {
    if (isSuccess) {
      setOpen(false);
      setProfileFileList([]);
      setDocumentFileList([]);
      setSelectedPermissions([]);
      setSelectedWorkSchedule(null);
      setCurrent(0);
      setTempAllowances([]);
      setEmployeePrefillData(null);
      setIsEmployeeModalFromCandidateMove(false);
      form.resetFields();
      setIsSuccessModalVisible(true);
    }
  }, [isSuccess, setTempAllowances, setEmployeePrefillData]);

  const modalHeader = (
    <div data-cy="add-employee-modal-header-div">
      <h2
        data-cy="add-employee-modal-header-h2"
        className="text-xl font-bold text-black mb-1"
      >
        Add New Employee
      </h2>
      <p
        data-cy="add-employee-modal-header-p"
        className="text-sm text-black font-normal"
      >
        Please Fill in all the information correctly.
      </p>
    </div>
  );

  const handleCreateUser = async () => {
    await form.validateFields();
    const allValues = form.getFieldsValue(true);

    const formData = transformData(allValues);
    createEmployee(formData);
  };

  const handleSkip = async () => {
    const fieldsToValidate = ['userFirstName', 'userLastName'];
    if (form.getFieldValue('userMiddleName')) {
      fieldsToValidate.push('userMiddleName');
    }
    if (form.getFieldValue('userEmail')) {
      fieldsToValidate.push('userEmail');
    }

    try {
      await form.validateFields(fieldsToValidate);
    } catch {
      NotificationMessage.error({
        message: 'Please ensure prefilled candidate information is valid',
      });
      return;
    }

    const defaultRole = getDefaultRole(rolesWithPermission);
    if (!defaultRole) {
      NotificationMessage.error({
        message: 'No default role is available. Please add a role first.',
      });
      return;
    }

    const defaultPermissions = getDefaultPermissions(
      defaultRole,
      groupPermissionData,
    );
    if (!defaultPermissions.length) {
      NotificationMessage.error({
        message:
          'No default permissions are available. Please configure role permissions first.',
      });
      return;
    }

    const allValues = {
      ...form.getFieldsValue(true),
      roleId: defaultRole.id,
      setOfPermission: defaultPermissions,
    };
    const formData = transformData(allValues);

    createEmployee(formData, {
      onError: (error: any) => {
        NotificationMessage.error({
          message:
            error?.response?.data?.message ||
            error?.message ||
            'Failed to create employee from candidate data',
        });
      },
    });
  };
  const handleContinueClick = async () => {
    if (current !== 3) {
      // await form.validateFields();
      await form.validateFields();
      setCurrent(current + 1);
    } else {
      form.submit(); // Submit the form on the last step
    }
  };
  const handleBackClick = () => {
    if (current !== 0) {
      setCurrent(current - 1);
    } else {
      form.resetFields();
      setCurrent(0);
      setIsEmployeeModalFromCandidateMove(false);
      setOpen(false);
    }
  };

  function handleCancel() {
    props?.onClose();
    setTempAllowances([]);
    setEmployeePrefillData(null);
    setIsEmployeeModalFromCandidateMove(false);
    form.resetFields();
    setProfileFileList([]);
    setCurrent(0);
  }

  return (
    <>
      {open && (
        <Modal
          open={open}
          onCancel={handleCancel}
          title={modalHeader}
          data-cy="user-sidebar-drawer"
          footer={null}
          width={902}
          zIndex={10002}
        >
          <div data-cy="user-sidebar-steps-container" className="my-6">
            <style data-cy="user-sidebar-steps-style">{`
              /* Keep step labels on a single line */
              .user-sidebar-steps .ant-steps-item-title {
                white-space: nowrap !important;
              }

              /* Active and completed steps: primary blue (match screenshot) */
              .user-sidebar-steps .ant-steps-item-process .ant-steps-item-title,
              .user-sidebar-steps .ant-steps-item-finish .ant-steps-item-title {
                color: #1e40af !important;
              }

              /* Upcoming steps: light gray */
              .user-sidebar-steps .ant-steps-item-wait .ant-steps-item-title {
                color: #d9d9d9 !important;
              }
            `}</style>

            <Steps
              responsive={false}
              current={current}
              labelPlacement="vertical"
              progressDot
              className="user-sidebar-steps px-4 mx-auto max-w-5xl hidden sm:flex"
              items={[
                { title: 'Personal Information' },
                { title: 'Employee Information' },
                { title: 'Documentation' },
                { title: 'Custom Fields' },
              ]}
              data-cy="user-sidebar-steps"
            />
          </div>

          <Form
            form={form}
            name="dependencies"
            autoComplete="off"
            style={{ maxWidth: '100%' }}
            requiredMark={false}
            layout="vertical"
            onFinish={handleCreateUser}
            onFinishFailed={() =>
              NotificationMessage.error({
                message: 'Something wrong or unfilled',
                description: 'please back and check the unfilled fields',
              })
            }
            id="user-sidebar-form"
            data-cy="user-sidebar-form"
          >
            {current === 0 && (
              <>
                <Card
                  bodyStyle={{ padding: 0 }}
                  className="p-2 mt-2 border-[1px] border-[#D9D9D9]"
                  id="user-sidebar-card-basic"
                  data-cy="user-sidebar-card-basic"
                >
                  <BasicInformationForm
                    form={form}
                    data-cy="user-sidebar-basic-information-form"
                  />
                </Card>
                <ButtonContinue
                  handleContinueClick={handleContinueClick}
                  handleBackClick={handleBackClick}
                  showSkip={isEmployeeModalFromCandidateMove}
                  onSkipClick={handleSkip}
                  isSkipLoading={isLoading}
                  data-cy="user-sidebar-button-continue"
                />
              </>
            )}
            {current === 1 && (
              <>
                <Card
                  bodyStyle={{ padding: 0 }}
                  className="px-2 pt-2 border-[1px] border-[#D9D9D9]"
                  id="user-sidebar-card-job"
                  data-cy="user-sidebar-card-job"
                >
                  <JobTimeLineForm
                    form={form}
                    data-cy="user-sidebar-job-timeline-form"
                  />
                </Card>
                <ButtonContinue
                  handleContinueClick={handleContinueClick}
                  handleBackClick={handleBackClick}
                  data-cy="user-sidebar-button-continue"
                />
              </>
            )}
            {current === 2 && (
              <>
                <Card
                  bodyStyle={{ padding: 0 }}
                  className="pt-2"
                  id="user-sidebar-card-additional"
                  data-cy="user-sidebar-card-additional"
                  bordered={false}
                  style={{ border: 'none', boxShadow: 'none' }}
                >
                  <DocumentUploadForm data-cy="user-sidebar-document-upload-form" />
                </Card>
                <ButtonContinue
                  handleContinueClick={handleContinueClick}
                  handleBackClick={handleBackClick}
                  data-cy="user-sidebar-button-continue"
                />
              </>
            )}
            {current === 3 && (
              <>
                <Card
                  bodyStyle={{ padding: 0 }}
                  className="px-2 py-2"
                  id="user-sidebar-card-custom"
                  data-cy="user-sidebar-card-custom"
                  bordered={false}
                  style={{ border: 'none', boxShadow: 'none' }}
                >
                  <CustomFieldsForm />
                </Card>
                <ButtonContinue
                  handleBackClick={handleBackClick}
                  handleContinueClick={handleContinueClick}
                  isLoading={isLoading}
                  data-cy="user-sidebar-button-continue"
                />
              </>
            )}
          </Form>
        </Modal>
      )}

      <CustomModal
        visible={isSuccessModalVisible}
        onClose={() => {
          setIsSuccessModalVisible(false);
        }}
        text="You have successfully added new employee"
        route=""
        data-cy="user-sidebar-success-modal"
      />
    </>
  );
};

export default AddEmployeeModal;
