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
      setOpen(false);
      setProfileFileList([]);
      setDocumentFileList([]);
      setSelectedPermissions([]);
      setSelectedWorkSchedule(null);
      setCurrent(0);
      form.resetFields();
    }
  }, [isSuccess]);

  const modalHeader = (
    <div className="flex justify-center text-xl font-extrabold text-gray-800 p-4">
      Add New Employee
    </div>
  );

  const handleCreateUser = async () => {
    await form.validateFields();
    const allValues = form.getFieldsValue(true);
    createEmployee(transformData(allValues));
  };
  const handleContinueClick = async () => {
    if (current !== 2) {
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
      setOpen(false);
    }
  };

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
          // onChange={onChange}
          className="px-32 sm:my-10"
        >
          <Step icon={customDot(1)} />
          <Step icon={customDot(2)} />
          <Step icon={customDot(3)} />
        </Steps>
        <Form
          form={form}
          name="dependencies"
          autoComplete="off"
          style={{ maxWidth: '100%' }}
          layout="vertical"
          onFinish={handleCreateUser}
          onFinishFailed={() =>
            NotificationMessage.error({
              message: 'Something wrong or unfilled',
              description: 'please back and check the unfilled fields',
            })
          }
        >
          {current === 0 && (
            <Card className="p-4 sm:p-6">
              <BasicInformationForm form={form} />
              <EmployeeAddressForm />
              <EmergencyContactForm />
              <BankInformationForm />
              <ButtonContinue
                handleContinueClick={handleContinueClick}
                handleBackClick={handleBackClick}
              />
            </Card>
          )}
          {current === 1 && (
            <Card className="p-4 sm:p-6">
              <JobTimeLineForm />
              <RolePermissionForm form={form} />
              <WorkScheduleForm />
              <ButtonContinue
                handleContinueClick={handleContinueClick}
                handleBackClick={handleBackClick}
              />
            </Card>
          )}
          {current === 2 && (
            <Card className="p-4 sm:p-6">
              <AdditionalInformationForm />
              <DocumentUploadForm />
              <ButtonContinue
                handleBackClick={handleBackClick}
                handleContinueClick={handleContinueClick}
                isLoading={isLoading}
              />
            </Card>
          )}
        </Form>
      </CustomDrawerLayout>
    )
  );
};

export default UserSidebar;
