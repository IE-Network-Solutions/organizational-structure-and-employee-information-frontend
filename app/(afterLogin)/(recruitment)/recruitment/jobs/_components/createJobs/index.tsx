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
    filteredQuestions,
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
          className="text-xl font-bold text-gray-900"
          data-cy="talent-acquisition-create-jobs-drawer-title"
        >
          Create New Job
        </h2>
        <p
          className="mt-1 text-sm text-gray-500"
          data-cy="talent-acquisition-create-jobs-drawer-subtitle"
        >
          Please Fill in all the information correctly
        </p>
      </div>
      <div
        className="mt-4 flex w-full flex-wrap items-center gap-y-2"
        data-cy="talent-acquisition-create-jobs-step-indicators"
      >
        {STEP_LABELS.map((label, index) => (
          <React.Fragment key={label}>
            <div
              className="flex items-center gap-2 shrink-0"
              data-cy={`talent-acquisition-create-jobs-step-${index}`}
            >
              <div
                className={`h-3 w-3 shrink-0 rounded-full ${currentStep >= index ? 'bg-[#6366F1]' : 'bg-gray-300'}`}
                data-cy={`talent-acquisition-create-jobs-step-dot-${index}`}
              />
              <span
                className="text-xs text-gray-700 whitespace-nowrap"
                data-cy={`talent-acquisition-create-jobs-step-label-${index}`}
              >
                {label}
              </span>
            </div>
            {index < STEP_LABELS.length - 1 && (
              <div
                className="mx-1 sm:mx-2 h-0.5 min-w-[12px] sm:min-w-[24px] flex-1 shrink min-w-0"
                style={{
                  backgroundColor: currentStep > index ? '#6366F1' : '#d1d5db',
                }}
                aria-hidden
                data-cy={`talent-acquisition-create-jobs-step-connector-${index}`}
              />
            )}
          </React.Fragment>
        ))}
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
        questions: [
          ...(formValues?.questions?.map((e: any) => ({
            ...e,
            required: e?.required || false,
            id: uuidv4(),
            field:
              e.field?.map((field: any) => ({
                id: uuidv4(),
                value: field?.value ?? field,
              })) || [],
          })) || []),
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
      width={isMobile ? 'calc(100vw - 2rem)' : 960}
      style={isMobile ? { maxWidth: 960, top: 16 } : undefined}
      centered={!isMobile}
      closable={false}
      destroyOnClose
      className="talent-acquisition-create-job-modal"
      data-cy="talent-acquisition-create-jobs-modal"
      title={
        <div
          className={`pr-8 ${isMobile ? 'pr-10' : ''}`}
          data-cy="talent-acquisition-create-jobs-modal-header"
        >
          {addNewDrawerHeader}
        </div>
      }
    >
      <Form
        id="talent-acquisition-create-jobs-form"
        form={form}
        layout="vertical"
        onValuesChange={() => handleAddJobStateUpdate(form.getFieldsValue())}
        onFinish={handlePublish}
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
          <HiringOfferStep form={form} stepChange={handleStepChange} />
        </div>
        <div
          hidden={currentStep !== 2}
          data-cy="talent-acquisition-create-jobs-form-step-2"
        >
          <CreateApplicationForm
            form={form}
            stepChange={handleStepChange}
            isLoading={isCreatingJob}
          />
        </div>
      </Form>
    </Modal>
  );
};

export default CreateJobs;
