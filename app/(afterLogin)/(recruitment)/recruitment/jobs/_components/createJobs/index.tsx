'use client';
import { useJobState } from '@/store/uistate/features/recruitment/jobs';
import { Form, Steps } from 'antd';
import React from 'react';
import { IoCheckmarkSharp } from 'react-icons/io5';
import { useDebounce } from '@/utils/useDebounce';
import { v4 as uuidv4 } from 'uuid';
import { useCreateJobs } from '@/store/server/features/recruitment/job/mutation';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import dayjs from 'dayjs';
import CustomDrawerLayout from '@/components/common/customDrawer';
import CreateNewJob from './createNewJob';
import CreateApplicationForm from './createApplicationForm';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';

const { Step } = Steps;

const CreateJobs: React.FC = () => {
  const [form] = Form.useForm();
  const createdBy = useAuthenticationStore.getState().userId;
  const {
    addNewDrawer,
    currentStep,
    setFormValues,
    setAddNewDrawer,
    setCurrentStep,
    setAddJobModalResult,
    setSelectedJobId,
    filteredQuestions,
    setSelectedQuestions,
  } = useJobState();
  const { mutate: createJob, isLoading: isCreatingJob } = useCreateJobs();

  const customDot = (step: number) =>
    (
      <div
        className={`border-2 rounded-full h-8 w-8 flex items-center justify-center ${currentStep >= step ? 'bg-indigo-700 text-white' : 'bg-white border-gray-300 text-gray-500'}`}
        data-cy={`talent-acquisition-create-jobs-step-dot-${step}`}
      >
        <div
          style={{ fontSize: '24px', lineHeight: '24px' }}
          data-cy={`talent-acquisition-create-jobs-step-dot-content-${step}`}
        >
          {currentStep >= step ? (
            <IoCheckmarkSharp
              className="text-xs font-bold"
              data-cy={`talent-acquisition-create-jobs-step-dot-checkmark-${step}`}
            />
          ) : (
            <span
              data-cy={`talent-acquisition-create-jobs-step-dot-bullet-${step}`}
            >
              •
            </span>
          )}
        </div>
      </div>
    ) as React.ReactNode;
  const handleStepChange = (value: number) => {
    setCurrentStep(value);
  };

  const addNewDrawerHeader = (
    <div
      className="flex flex-col items-center"
      data-cy="talent-acquisition-create-jobs-drawer-header-container"
    >
      {currentStep === 0 ? (
        <div
          className="flex justify-center text-xl font-extrabold text-gray-800 p-2"
          data-cy="talent-acquisition-create-jobs-drawer-header-step-0"
        >
          <span data-cy="talent-acquisition-create-jobs-drawer-header-step-0-text">
            Create New Job
          </span>
        </div>
      ) : null}
      {currentStep !== 0 ? (
        <div
          className="flex justify-center text-xl font-extrabold text-gray-800 p-4"
          data-cy="talent-acquisition-create-jobs-drawer-header-step-1"
        >
          <span data-cy="talent-acquisition-create-jobs-drawer-header-step-1-text">
            Create Application Forms
          </span>
        </div>
      ) : null}
      <div
        className="flex items-center justify-between"
        data-cy="talent-acquisition-create-jobs-steps-container"
      >
        <Steps
          data-cy="talent-acquisition-create-jobs-steps"
          current={currentStep}
          onChange={handleStepChange}
          size="default"
          responsive={false}
          className="w-full"
        >
          <Step
            icon={customDot(0)}
            data-cy="talent-acquisition-create-jobs-step-0"
          />
          <Step
            icon={customDot(1)}
            data-cy="talent-acquisition-create-jobs-step-1"
          />
        </Steps>
      </div>
    </div>
  );
  const handleCloseDrawer = () => {
    setAddNewDrawer(false);
    form.resetFields();
  };

  const handleAddJobStateUpdate = useDebounce(setFormValues, 1500);

  const handlePublish = async () => {
    try {
      // Validate all form fields before proceeding
      await form.validateFields();

      const formValues = form.getFieldsValue();

      const formattedValue = {
        ...formValues,
        createdBy,
        jobDeadline: dayjs(formValues?.jobDeadline).format('YYYY-MM-DD'),
        yearOfExperience: Number(formValues?.yearOfExperience),
        departmentId: formValues?.department,
        questions: [
          ...(formValues?.questions?.map((e: any) => {
            return {
              ...e,
              required: e?.required || false,
              id: uuidv4(),
              field: e.field.map((field: any) => {
                return {
                  id: uuidv4(),
                  value: field,
                };
              }),
            };
          }) || []),
          ...(filteredQuestions?.flatMap((template: any) =>
            template.form?.map((formItem: any) => ({
              id: uuidv4(),
              fieldType: formItem.fieldType,
              question: formItem.question,
              required: formItem.required || false,
              field:
                formItem.field?.map((field: any) => ({
                  id: uuidv4(),
                  value: field.value || field,
                })) || [],
            })),
          ) || []),
        ],
      };
      createJob(formattedValue, {
        onSuccess: (response) => {
          setAddJobModalResult(true);
          const newJobId = response?.id;
          setSelectedJobId(newJobId);
          setAddNewDrawer(false);
          form.resetFields();
          setCurrentStep(0);
          setSelectedQuestions([]);
        },
      });
    } catch (error) {
      // If validation fails, the error will be caught here and no request will be sent
      NotificationMessage.error({
        message: 'Validation Failed',
        description: 'Please check all required fields before publishing.',
      });
    }
  };

  return addNewDrawer ? (
    <CustomDrawerLayout
      data-cy="talent-acquisition-create-jobs-drawer"
      open={addNewDrawer}
      onClose={handleCloseDrawer}
      modalHeader={addNewDrawerHeader}
      width="40%"
      footer={null}
      customMobileHeight="90vh"
    >
      <Form
        id="talent-acquisition-create-jobs-form"
        data-cy="talent-acquisition-create-jobs-form"
        form={form}
        layout="vertical"
        onValuesChange={() => {
          handleAddJobStateUpdate(form.getFieldsValue());
        }}
        onFinish={() => {
          handlePublish();
        }}
      >
        <div
          style={{ height: 'auto' }}
          hidden={currentStep !== 0}
          data-cy="talent-acquisition-create-jobs-form-step-0"
        >
          <CreateNewJob
            form={form}
            close={handleCloseDrawer}
            stepChange={handleStepChange}
          />
        </div>
        <div
          hidden={currentStep !== 1}
          data-cy="talent-acquisition-create-jobs-form-step-1"
        >
          <CreateApplicationForm
            form={form}
            stepChange={handleStepChange}
            isLoading={isCreatingJob}
          />
        </div>
      </Form>
    </CustomDrawerLayout>
  ) : (
    <div data-cy="talent-acquisition-create-jobs-drawer-empty"></div>
  );
};

export default CreateJobs;
