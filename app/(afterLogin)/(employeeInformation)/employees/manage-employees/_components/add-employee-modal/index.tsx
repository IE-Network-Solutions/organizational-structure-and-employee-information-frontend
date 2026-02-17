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
import { IoCheckmarkSharp } from 'react-icons/io5';
import { useEmployeeManagementStore } from '@/store/uistate/features/employees/employeeManagment';
import CustomModal from '@/app/(afterLogin)/(employeeInformation)/_components/sucessModal/successModal';


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
  } = useEmployeeManagementStore();
  const { mutate: createEmployee, isLoading, isSuccess } = useAddEmployee();
  const { setTempAllowances } = useEmployeeManagementStore();
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);

  useEffect(() => {
    if (isSuccess) {
      setOpen(false);
      setProfileFileList([]);
      setDocumentFileList([]);
      setSelectedPermissions([]);
      setSelectedWorkSchedule(null);
      setCurrent(0);
      setTempAllowances([]); // Clear temp allowances on success
      form.resetFields();
      setIsSuccessModalVisible(true);
    }
  }, [isSuccess, setTempAllowances]);

  const modalHeader = (
    <div>
    <h2 className="text-2xl font-bold text-gray-800 mb-1">
      Add New Employee
    </h2>
    <p className="text-sm text-gray-500">
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
      setOpen(false);
    }
  };

 
  function handleCancel() {
    props?.onClose();
    setTempAllowances([]);
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
          width={900}
          data-cy="user-sidebar-drawer"
          footer={null}
        >

          <div className="my-6">
            <style>{`
              .ant-steps-item-title {
                white-space: nowrap !important;
              }
              .ant-steps-item-process .ant-steps-item-title {
                color: #1e40af !important;
              }
            `}</style>
            
              <Steps
              responsive={false}
                current={current}
                labelPlacement="vertical"
                progressDot
                className="px-4 mx-auto max-w-5xl hidden sm:flex"
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
              <Card
                bordered={false}
                bodyStyle={{ padding: 0 }}
                className="p-2 sm:p-6 mt-2"
                id="user-sidebar-card-basic"
                data-cy="user-sidebar-card-basic"
              >
                <BasicInformationForm
                  form={form}
                  data-cy="user-sidebar-basic-information-form"
                />
                <ButtonContinue
                  handleContinueClick={handleContinueClick}
                  handleBackClick={handleBackClick}
                  data-cy="user-sidebar-button-continue"
                />
              </Card>
            )}
            {current === 1 && (
              <Card
                bodyStyle={{ padding: 0 }}
                className="px-2 pt-2"
                id="user-sidebar-card-job"
                data-cy="user-sidebar-card-job"
              >
                <JobTimeLineForm
                  form={form}
                  data-cy="user-sidebar-job-timeline-form"
                />
                <ButtonContinue
                  handleContinueClick={handleContinueClick}
                  handleBackClick={handleBackClick}
                  data-cy="user-sidebar-button-continue"
                />
              </Card>
            )}
            {current === 2 && (
              <Card
                bodyStyle={{ padding: 0 }}
                className="px-2 pt-2"
                id="user-sidebar-card-additional"
                data-cy="user-sidebar-card-additional"
              >
                <DocumentUploadForm data-cy="user-sidebar-document-upload-form" />
                <ButtonContinue
                  handleContinueClick={handleContinueClick}
                  handleBackClick={handleBackClick}
                  data-cy="user-sidebar-button-continue"
                />
              </Card>
            )}
            {current === 3 && (
              <Card
                bodyStyle={{ padding: 0 }}
                className="px-2 pt-2"
                id="user-sidebar-card-custom"
                data-cy="user-sidebar-card-custom"
              >
                <CustomFieldsForm />
                <ButtonContinue
                  handleBackClick={handleBackClick}
                  handleContinueClick={handleContinueClick}
                  isLoading={isLoading}
                  data-cy="user-sidebar-button-continue"
                />
              </Card>
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
