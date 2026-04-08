'use client';

import { useJobState } from '@/store/uistate/features/recruitment/jobs';
import { Form, Modal } from 'antd';
import React from 'react';
import { useDebounce } from '@/utils/useDebounce';
import { v4 as uuidv4 } from 'uuid';
import { useCreateJobs } from '@/store/server/features/recruitment/job/mutation';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import dayjs from 'dayjs';
import JobDetailsStep from './jobDetailsStep';
import HiringOfferStep from './hiringOfferStep';
import CreateApplicationForm from './createApplicationForm';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { IoClose } from 'react-icons/io5';
import { useIsMobile } from '@/hooks/useIsMobile';

const STEP_LABELS = ['Job Details', 'Hiring and offer', 'Application Form'];

const CreateJobs: React.FC = () => {
  const { isMobile } = useIsMobile();
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
    setSelectedQuestions,
  } = useJobState();
  const { mutate: createJob, isLoading: isCreatingJob } = useCreateJobs();

  const handleStepChange = (value: number) => {
    setCurrentStep(value);
  };

  const addNewDrawerHeader = (
    <div
      className="relative w-full"
      data-cy="talent-acquisition-create-jobs-drawer-header-container"
    >
      <button
        type="button"
        onClick={() => {
          setAddNewDrawer(false);
          form.resetFields();
          setCurrentStep(0);
        }}
        className="absolute right-0 top-0 flex h-8 w-8 items-center justify-center rounded text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        aria-label="Close"
        data-cy="talent-acquisition-create-jobs-drawer-close"
      >
        <IoClose className="h-5 w-5" />
      </button>
      <div
        className="pr-10"
        data-cy="talent-acquisition-create-jobs-drawer-title-wrap"
      >
        <h2
          className="text-[20px] font-bold leading-tight text-black"
          data-cy="talent-acquisition-create-jobs-drawer-title"
        >
          Create New Job
        </h2>
        <p
          className="mt-1 text-sm font-normal text-black"
          data-cy="talent-acquisition-create-jobs-drawer-subtitle"
        >
          Please Fill in all the information correctly
        </p>
      </div>
      <div
        className="mx-auto mt-5 w-full max-w-[560px]"
        data-cy="talent-acquisition-create-jobs-step-indicators"
      >
        <div
          className="relative grid grid-cols-3 items-start"
          data-cy="talent-acquisition-create-jobs-step-progress-wrapper"
        >
          <div
            className="pointer-events-none absolute left-[16.67%] right-[16.67%] top-[5px] h-[2px] bg-[#D9D9D9]"
            data-cy="talent-acquisition-create-jobs-step-progress-track"
          />
          <div
            className={`pointer-events-none absolute left-[16.67%] top-[5px] h-[2px] ${
              currentStep === 0
                ? 'w-[16.67%]'
                : currentStep === 1
                  ? 'w-1/2'
                  : 'w-2/3'
            } bg-[#1E40AF] transition-all`}
            data-cy="talent-acquisition-create-jobs-step-progress-fill"
          />
          {STEP_LABELS.map((label, index) => (
            <button
              key={label}
              type="button"
              onClick={() => {
                if (index <= currentStep) {
                  setCurrentStep(index);
                }
              }}
              disabled={index > currentStep}
              className="z-[1] flex min-w-0 flex-1 flex-col items-center gap-2 bg-transparent p-0 disabled:cursor-default"
              data-cy={`talent-acquisition-create-jobs-step-${index}`}
            >
              <div
                className={`h-[10px] w-[10px] shrink-0 rounded-full border-2 ${
                  currentStep >= index
                    ? 'border-[#1E40AF] bg-[#1E40AF]'
                    : 'border-[#D9D9D9] bg-white'
                }`}
                data-cy={`talent-acquisition-create-jobs-step-dot-${index}`}
              />
              <span
                className={`whitespace-nowrap text-[12px] font-normal leading-none sm:text-[14px] ${
                  currentStep >= index ? 'text-[#1E40AF]' : 'text-[#8C8C8C]'
                }`}
                data-cy={`talent-acquisition-create-jobs-step-label-${index}`}
              >
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const handleCloseDrawer = () => {
    setAddNewDrawer(false);
    form.resetFields();
    setCurrentStep(0);
    setSelectedQuestions([]);
  };

  const handleAddJobStateUpdate = useDebounce(setFormValues, 1500);

  const handlePublish = async () => {
    try {
      await form.validateFields();
      const formValues = form.getFieldsValue();
      const formattedValue = {
        ...formValues,
        createdBy,
        jobDeadline: dayjs(formValues?.jobDeadline).format('YYYY-MM-DD'),
        yearOfExperience: Number(formValues?.yearOfExperience ?? 0),
        departmentId: formValues?.department,
        compensation:
          formValues?.compensation != null
            ? Number(formValues.compensation)
            : formValues?.compensation,
        questions:
          formValues?.questions?.map((e: any) => ({
            ...e,
            required: e?.required || false,
            id: uuidv4(),
            field:
              e.field?.map((field: any) => ({
                id: uuidv4(),
                value: field?.value ?? field,
              })) || [],
          })) || [],
      };
      createJob(formattedValue, {
        onSuccess: (response) => {
          setAddJobModalResult(true);
          setSelectedJobId(response?.id);
          setAddNewDrawer(false);
          form.resetFields();
          setCurrentStep(0);
          setSelectedQuestions([]);
        },
      });
    } catch (error) {
      NotificationMessage.error({
        message: 'Validation Failed',
        description: 'Please check all required fields before publishing.',
      });
    }
  };

  return (
    <Modal
      open={addNewDrawer}
      onCancel={handleCloseDrawer}
      footer={null}
      width={isMobile ? 'calc(100vw - 16px)' : 809}
      style={
        isMobile
          ? { maxWidth: '100vw', width: '100%', top: 16, margin: 0 }
          : undefined
      }
      centered={!isMobile}
      closable={false}
      destroyOnClose
      className="talent-acquisition-create-job-modal"
      classNames={{
        header: '!mb-0 !px-6 !pb-0 !pt-6',
        body: isMobile
          ? '!px-6 !pb-6 !pt-4'
          : currentStep === 2
            ? '!h-[612px] !overflow-hidden !px-6 !pb-6 !pt-4'
            : '!h-[560px] !overflow-hidden !px-6 !pb-6 !pt-4',
      }}
      styles={{
        content: isMobile
          ? { borderRadius: 8, padding: 0 }
          : {
              borderRadius: 8,
              padding: 0,
              height: currentStep === 2 ? 740 : 688,
            },
        body: isMobile
          ? {}
          : { overflow: 'hidden' },
      }}
      data-cy="talent-acquisition-create-jobs-modal"
      title={
        <div data-cy="talent-acquisition-create-jobs-modal-header">
          {addNewDrawerHeader}
        </div>
      }
    >
      <Form
        id="talent-acquisition-create-jobs-form"
        form={form}
        layout="vertical"
        requiredMark={false}
        onValuesChange={() => handleAddJobStateUpdate(form.getFieldsValue())}
        onFinish={handlePublish}
        className="[&_.ant-form-item-label]:!pb-2"
      >
        <div
          hidden={currentStep !== 0}
          data-cy="talent-acquisition-create-jobs-form-step-0"
        >
          <JobDetailsStep
            form={form}
            close={handleCloseDrawer}
            stepChange={handleStepChange}
          />
        </div>
        <div
          hidden={currentStep !== 1}
          data-cy="talent-acquisition-create-jobs-form-step-1"
        >
          <HiringOfferStep
            form={form}
            stepChange={handleStepChange}
            close={handleCloseDrawer}
          />
        </div>
        <div
          hidden={currentStep !== 2}
          data-cy="talent-acquisition-create-jobs-form-step-2"
        >
          <CreateApplicationForm
            form={form}
            isLoading={isCreatingJob}
            close={handleCloseDrawer}
          />
        </div>
      </Form>
    </Modal>
  );
};

export default CreateJobs;
