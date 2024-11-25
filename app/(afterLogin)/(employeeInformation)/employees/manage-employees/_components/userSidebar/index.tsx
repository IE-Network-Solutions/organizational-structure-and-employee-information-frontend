'use client';
import React, { useEffect } from 'react';
import { Card, Form, Steps } from 'antd';
import CustomDrawerLayout from '@/components/common/customDrawer';
import { useAddEmployee } from '@/store/server/features/employees/employeeManagment/mutations';
import { transformData } from '../formData';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import BasicInformationForm from '../allFormData/basicInformationForm';
import EmployeeAddressForm from '../allFormData/employeeAddressForm';
import EmergencyContactForm from '../allFormData/emergencyContactForm';
import JobTimeLineForm from '../allFormData/jobTimeLineForm';
import BankInformationForm from '../allFormData/bankAccountForm';
import RolePermissionForm from '../allFormData/rolePermisisonForm';
import WorkScheduleForm from '../allFormData/workScheduleForm';
import DocumentUploadForm from '../allFormData/documentUploadForm';
import AdditionalInformationForm from '../allFormData/additionalInformationForm';
import ButtonContinue from '../allFormData/SaveAndContinueButton';
import { IoCheckmarkSharp } from 'react-icons/io5';
import { useEmployeeManagementStore } from '@/store/uistate/features/employees/employeeManagment';

const { Step } = Steps;

export const fieldGroups: Record<number, ([string, string] | string)[]> = {
  0: [
    'profileImage',
    'userFirstName',
    'userMiddleName',
    'userLastName',
    'userEmail',
    'employeeGender',
    'dateOfBirth',
    'nationalityId',
    'martialStatus',
    ['address', 'country'],
    ['address', 'city'],
    'addressStreet',
    'addressPostalCode',
    'addressState',
    'addressType',
    ['emergencyContact', 'firstName'],
    ['emergencyContact', 'lastName'],
    ['emergencyContact', 'email'],
    ['emergencyContact', 'gender'],
    ['emergencyContact', 'dateOfBirth'],
    ['emergencyContact', 'nationality'],
    ['bankInformation', 'bankName'],
    ['bankInformation', 'branch'],
    ['bankInformation', 'accountName'],
    ['bankInformation', 'accountNumber'],
  ],
  1: [
    'effectiveStartDate',
    'positionId',
    'employementTypeId',
    'departmentId',
    'branchId',
    'effectiveEndDate',
    'departmentLeadOrNot',
    'employmentContractType',
    'roleId',
    'setOfPermission',
    'workScheduleId',
  ],
  2: ['documentName'],
};

const UserSidebar = (props: any) => {
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
  } = useEmployeeManagementStore();
  const { mutate: createEmployee, isLoading, isSuccess } = useAddEmployee();

  useEffect(() => {
    if (isSuccess) {
      resetFormFields();
    }
  }, [isSuccess]);

  const resetFormFields = () => {
    setOpen(false);
    setProfileFileList([]);
    setDocumentFileList([]);
    setSelectedPermissions([]);
    setSelectedWorkSchedule(null);
    setCurrent(0);
    form.resetFields();
  };

  const handleAllChange = async (value: number) => {
    if (value < 0) {
      resetFormFields();
      return;
    }

    if (current === 2 && value > 2) {
      try {
        await form.validateFields(fieldGroups[2]);
        const allValues = form.getFieldsValue(true);
        createEmployee(transformData(allValues));
      } catch {
        NotificationMessage.error({
          message: 'Error in the form.',
          description: 'Please check all the fields.',
        });
      }
      return;
    }

    if (value > current) {
      const stepsToValidate = Array.from(
        { length: value - current },
        (s, i) => current + i,
      );
      try {
        for (const step of stepsToValidate) {
          await form.validateFields(fieldGroups[step]);
        }
        setCurrent(value);
      } catch {
        NotificationMessage.error({
          message: 'Error in the form.',
          description: 'Please check all the fields.',
        });
        setCurrent(current);
      }
    } else {
      setCurrent(value);
    }
  };

  const modalHeader = (
    <div className="flex justify-center text-xl font-extrabold text-gray-800 p-4">
      Add New Employee
    </div>
  );

  const customDot = (step: number) => (
    <div
      className={`border-2 rounded-full h-8 w-8 flex items-center justify-center ${current >= step ? 'bg-indigo-700 text-white' : 'bg-white border-gray-300 text-gray-500'}`}
    >
      <div style={{ fontSize: '24px', lineHeight: '24px' }}>
        {current >= step ? (
          <IoCheckmarkSharp className="text-xs font-bold" />
        ) : (
          '•'
        )}
      </div>
    </div>
  );

  return (
    open && (
      <CustomDrawerLayout
        open={open}
        onClose={props?.onClose}
        modalHeader={modalHeader}
        width="40%"
      >
        <Steps
          current={current}
          size="small"
          className="my-6 sm:my-10"
          onChange={handleAllChange}
        >
          <Step icon={customDot(0)} />
          <Step icon={customDot(1)} />
          <Step icon={customDot(2)} />
        </Steps>
        <Form
          form={form}
          name="dependencies"
          autoComplete="off"
          style={{ maxWidth: '100%' }}
          layout="vertical"
          onFinish={handleAllChange}
        >
          <Card hidden={current !== 0} className="p-4 sm:p-6">
            <BasicInformationForm form={form} />
            <EmployeeAddressForm />
            <EmergencyContactForm />
            <BankInformationForm />
            <ButtonContinue handleAllChange={handleAllChange} />
          </Card>
          <Card hidden={current !== 1} className="p-4 sm:p-6">
            <JobTimeLineForm />
            <RolePermissionForm form={form} />
            <WorkScheduleForm />
            <ButtonContinue handleAllChange={handleAllChange} />
          </Card>
          <Card hidden={current !== 2} className="p-4 sm:p-6">
            <AdditionalInformationForm />
            <DocumentUploadForm />
            <ButtonContinue
              handleAllChange={handleAllChange}
              isLoading={isLoading}
            />
          </Card>
        </Form>
      </CustomDrawerLayout>
    )
  );
};

export default UserSidebar;
