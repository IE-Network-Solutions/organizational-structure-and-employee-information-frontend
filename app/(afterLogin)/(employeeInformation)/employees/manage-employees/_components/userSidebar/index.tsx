'use client';

import React from 'react';
import { Card, Form,Steps } from 'antd';
import { useEmployeeManagmentStore } from '@/store/uistate/features/employees/employeeManagment';
import CustomDrawerLayout from '@/components/common/customDrawer';
import {useAddEmployee} from '@/store/server/features/employees/employeeManagment/mutations';
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

const { Step } = Steps;
const UserSidebar = (props: any) => {
  const [form] = Form.useForm();
  const {setCurrent,current,open}=useEmployeeManagmentStore();
  const useCreateEmployeeMutation = useAddEmployee();

  const modalHeader = <div className="flex justify-center text-xl font-extrabold text-gray-800 "> Add New Employee</div>;
  const handleCreateUser = (values:any) => {
    useCreateEmployeeMutation?.mutate(transformData(values))
  };
  const onChange = (value: number) => {
    setCurrent(value);
  };
  const customDot = <div className='border-2 rounded-full h-8 w-8'><div  style={{ fontSize: '24px', lineHeight: '24px' }}>•</div></div> ;
  return (
    open && (
      <CustomDrawerLayout
        open={open}
        onClose={props?.onClose}
        modalHeader={modalHeader}
        width='40%'
      >
        {/* //${current === 0 ? 'bg-red-600' : ''} */}
      <Steps  current={current} size='small' onChange={onChange} className={`my-10 `}>
        <Step icon={customDot}  />
        <Step icon={customDot} />
        <Step icon={customDot} />
      </Steps>
      <Form
        form={form}
        name="dependencies"
        autoComplete="off"
        style={{ maxWidth: '100%' }}
        layout="vertical"
        onFinishFailed={()=>NotificationMessage.error({ message:"some thing wrong or unfilled", description:"check back again" })}
        onFinish={handleCreateUser}
      >
        <Card hidden={current!==0}>
          <BasicInformationForm/>
          <EmployeeAddressForm/>
          <EmergencyContactForm/>
          <BankInformationForm/>
          <ButtonContinue />
        </Card>
        <Card hidden={current!==1}>
          <JobTimeLineForm/>
          <RolePermissionForm/>
          <WorkScheduleForm/>
          <ButtonContinue/>
        </Card>
        <Card hidden={current!==2}>
          <AdditionalInformationForm/>
          <DocumentUploadForm/>
          <ButtonContinue />
        </Card>
        </Form>
      </CustomDrawerLayout>
    )
  );
};

export default UserSidebar;
