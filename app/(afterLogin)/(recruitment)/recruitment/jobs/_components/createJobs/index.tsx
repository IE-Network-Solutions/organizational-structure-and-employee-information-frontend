'use client';
import CustomDrawerLayout from '@/components/common/customDrawer';
import { useJobState } from '@/store/uistate/features/recruitment/jobs';
import { Form, Steps } from 'antd';
import React from 'react';
import { IoCheckmarkSharp } from 'react-icons/io5';
import CreateNewJob from './createNewJob';
import CreateApplicationForm from './createApplicationForm';
import { useDebounce } from '@/utils/useDebounce';

const { Step } = Steps;

const CreateJobs: React.FC = () => {
  const [form] = Form.useForm();
  const {
    addNewDrawer,
    currentStep,
    addQuestion,
    setAddNewDrawer,
    setCurrentStep,
  } = useJobState();

  const customDot = (step: number) => (
    <div
      className={`border-2 rounded-full h-8 w-8 flex items-center justify-center ${currentStep >= step ? 'bg-indigo-700 text-white' : 'bg-white border-gray-300 text-gray-500'}`}
    >
      <div style={{ fontSize: '24px', lineHeight: '24px' }}>
        {currentStep >= step ? (
          <IoCheckmarkSharp className="text-xs font-bold" />
        ) : (
          '•'
        )}
      </div>
    </div>
  );
  const handleStepChange = (value: number) => {
    setCurrentStep(value);
  };
  const addNewDrawerHeader = (
    <div className="flex flex-col items-center">
      <div className="flex items-center justify-between">
        <Steps
          current={currentStep}
          onChange={handleStepChange}
          size="default"
          className="w-full"
        >
          <Step icon={customDot(0)} />
          <Step icon={customDot(1)} />
        </Steps>
      </div>
      {currentStep === 0 ? (
        <div className="flex justify-center text-xl font-extrabold text-gray-800 p-4">
          Create New Job
        </div>
      ) : (
        <div className="flex justify-center text-xl font-extrabold text-gray-800 p-4">
          Create Application Forms
        </div>
      )}
    </div>
  );
  const handleCloseDrawer = () => {
    setAddNewDrawer(false);
    form.resetFields();
  };

  const handleAddJobStateUpdate = useDebounce(addQuestion, 1500);

  return (
    addNewDrawer && (
      <CustomDrawerLayout
        open={addNewDrawer}
        onClose={handleCloseDrawer}
        modalHeader={addNewDrawerHeader}
        width="40%"
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onValuesChange={() => {
            handleAddJobStateUpdate(form.getFieldsValue()?.questions);
          }}
        >
          <div style={{ height: 'auto' }} hidden={currentStep !== 0}>
            <CreateNewJob
              form={form}
              close={handleCloseDrawer}
              stepChange={handleStepChange}
            />
          </div>
          <div hidden={currentStep !== 1}>
            <CreateApplicationForm form={form} stepChange={handleStepChange} />
          </div>
        </Form>
      </CustomDrawerLayout>
    )
  );
};

export default CreateJobs;
