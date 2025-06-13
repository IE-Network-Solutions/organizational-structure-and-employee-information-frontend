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
    <div className="flex justify-center text-lg font-bold text-gray-800 py-0 sm:py-6">
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

  const customDot = (step: number) => {
    if (current > step) {
      // Completed step: blue circle with checkmark
      return (
        <div className="border-2 border-indigo-700 bg-indigo-700 rounded-full h-6 w-6 flex items-center justify-center">
          <IoCheckmarkSharp className="text-white text-[12px] font-bold" />
        </div>
      );
    } else if (current === step) {
      // Current step: blue dot in blue-outlined circle
      return (
        <div className="border-2 border-indigo-700 rounded-full h-6 w-6 flex items-center justify-center">
          <span className="bg-indigo-700 rounded-full h-2.5 w-2.5 block"></span>
        </div>
      );
    } else {
      // Upcoming step: empty gray-outlined circle
      return (
        <div className="border-2 border-gray-300 rounded-full h-6 w-6 flex items-center justify-center"></div>
      );
    }
  };
  function handleCancel() {
    props?.onClose();
    form.resetFields();
    setProfileFileList([]);
  }
  return (
    open && (
      <CustomDrawerLayout
        open={open}
        onClose={handleCancel}
        modalHeader={modalHeader}
        width="40%"
      >
        <Steps
          current={current}
          size="small"
          responsive={false}
          // onChange={onChange}
          className="flex justify-center items-center my-0 sm:my-4 max-w-[200px] mx-auto scale-90"
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
          onFinish={handleCreateUser}
          onFinishFailed={() =>
            NotificationMessage.error({
              message: 'Something wrong or unfilled',
              description: 'please back and check the unfilled fields',
            })
          }
        >
          {current === 0 && (
            <Card
              bordered={false}
              bodyStyle={{ padding: 0 }}
              className="p-2 sm:p-6 mt-2"
            >
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
            <Card bodyStyle={{ padding: 0 }} className="p-2 sm:p-6">
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
            <Card bodyStyle={{ padding: 0 }} className="p-2 sm:p-6">
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
