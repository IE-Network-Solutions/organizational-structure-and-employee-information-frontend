'use client';
import React, { useEffect, useState } from 'react';
import { Button, Spin, Form } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';

// UI‑state stores
import useStepStore from '@/store/uistate/features/organizationStructure/steper/useStore';
import useScheduleStore from '@/store/uistate/features/organizationStructure/workSchedule/useStore';
import useOrganizationStore from '@/store/uistate/features/organizationStructure/orgState';
import { useFiscalYearDrawerStore } from '@/store/uistate/features/organizations/settings/fiscalYear/useStore';
import { useCompanyProfile } from '@/store/uistate/features/organizationStructure/companyProfile/useStore';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';

// Server mutations & queries
import {
  useCreateFiscalYear,
  useDeleteFiscalYear,
} from '@/store/server/features/organizationStructure/fiscalYear/mutation';
import {
  useCreateSchedule,
  useDeleteSchedule,
} from '@/store/server/features/organizationStructure/workSchedule/mutation';
import {
  useCreateOrgChart,
  useDeleteOrgChart,
} from '@/store/server/features/organizationStructure/organizationalChart/mutation';
import {
  useCreateCompanyInfo,
  useDeleteCompanyInfo,
} from '@/store/server/features/organizationStructure/companyInfo/mutation';
import {
  useUpdateCompanyProfileWithStamp,
  useGetCompanyProfileByTenantId,
} from '@/store/server/features/organizationStructure/companyProfile/mutation';
import { useGetDepartments } from '@/store/server/features/employees/employeeManagment/department/queries';
import {
  useCreateBranch,
  useDeleteBranch,
} from '@/store/server/features/organizationStructure/branchs/mutation';
import { useGetTimeZone } from '@/store/server/features/timesheet/timeZone/queries';
import { useUpdateTimeZone } from '@/store/server/features/timesheet/timeZone/mutation';
import {
  useCreateRecruitmentStatus,
  useDeleteRecruitmentStatus,
} from '@/store/server/features/recruitment/settings/status/mutation';


// Components
import WorkSchedule from './workSchedule';
import OrgChartComponent from './orgChartComponent';
import CompanyProfile from './companyProfile';
import FiscalYearForm from './onBoardingFy';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import { showValidationErrors } from '@/utils/showValidationErrors';
import { useRouter } from 'next/navigation';
import { useGetBranches } from '@/store/server/features/organizationStructure/branchs/queries';
import CustomModal from '@/app/(afterLogin)/(employeeInformation)/_components/sucessModal/successModal';

/**
 * Onboarding multi‑step wizard component
 */
const OnboardingSteper: React.FC = () => {
  /* -------------------------------------------------------------------------- */
  /*                               form instances                               */
  /* -------------------------------------------------------------------------- */
  const [formCompany] = Form.useForm();
  const [formFiscal] = Form.useForm();
  const [formSchedule] = Form.useForm();
  const forms = [formCompany, formFiscal, formSchedule];

  /* -------------------------------------------------------------------------- */
  /*                               external data                                */
  /* -------------------------------------------------------------------------- */

  const { data: departments } = useGetDepartments();
  const router = useRouter();
  useEffect(() => {
    if (departments?.length) {
      router.push('/dashboard');
    }
  }, [departments?.length]);

  const {
    currentStep,
    nextStep,
    prevStep,
    loading,
    toggleLoading,
    isModalVisible,
    togleIsModalVisible,
  } = useStepStore();
  const { createWorkSchedule, detail } = useScheduleStore();
  const { orgData } = useOrganizationStore();
  const { fiscalYearPayLoad } = useFiscalYearDrawerStore();
  const { companyName, companyProfileImage, companyStamp } =
    useCompanyProfile();

  const { data: branches } = useGetBranches();
  const { data: timeZoneRow } = useGetTimeZone();
  const tenantId = useAuthenticationStore.getState().tenantId;
  const userId = useAuthenticationStore.getState().userId;
  const { data: companyInformation } = useGetCompanyProfileByTenantId(tenantId);

  /* -------------------------------------------------------------------------- */
  /*                             helper: time‑zone                              */
  /* -------------------------------------------------------------------------- */
  const [detectedTimeZone, setDetectedTimeZone] = useState<string>('');
  useEffect(() => {
    const offsetMinutes = new Date().getTimezoneOffset();
    const totalMinutes = -offsetMinutes;
    const sign = totalMinutes >= 0 ? '+' : '-';
    const absMinutes = Math.abs(totalMinutes);
    const hours = Math.floor(absMinutes / 60)
      .toString()
      .padStart(2, '0');
    const minutes = (absMinutes % 60).toString().padStart(2, '0');
    setDetectedTimeZone(`${sign}${hours}:${minutes}`);
  }, []);

  /* -------------------------------------------------------------------------- */
  /*                              static payloads                              */
  /* -------------------------------------------------------------------------- */
  const schedulePayload = {
    name: 'Full‑time Schedule',
    detail,
  };
  const timeZonePayload = {
    timezone: detectedTimeZone,
    id: timeZoneRow ? timeZoneRow.id : '',
  };
  const branchPayload = {
    name: 'HQ',
    description: 'HQ',
    location: 'HQ',
    contactNumber: companyInformation?.contactPersonPhoneNumber,
    contactEmail: companyInformation?.contactPersonEmail,
  };
  const applicantStatusPayload = {
    title: 'Initial Stage',
    description: 'Initial Stage',
    createdBy: userId,
  };

  /* -------------------------------------------------------------------------- */
  /*                              server actions                                */
  /* -------------------------------------------------------------------------- */
  const createFiscalYear = useCreateFiscalYear();
  const deleteFiscalYear = useDeleteFiscalYear();
  const createSchedule = useCreateSchedule();
  const deleteSchedule = useDeleteSchedule();
  const createOrgChart = useCreateOrgChart();
  const deleteOrgChart = useDeleteOrgChart();
  const createCompanyInfo = useCreateCompanyInfo();
  const deleteCompanyInfo = useDeleteCompanyInfo();
  const createBranch = useCreateBranch();
  const deleteBranch = useDeleteBranch();
  const updateTimeZone = useUpdateTimeZone();
  const createApplicantStatus = useCreateRecruitmentStatus();
  const deleteApplicantStatus = useDeleteRecruitmentStatus();
  const updateCompanyImageWithStamp = useUpdateCompanyProfileWithStamp();

  /* -------------------------------------------------------------------------- */
  /*                        generator for sequential calls                      */
  /* -------------------------------------------------------------------------- */
  function* createResourcesGenerator(
    fiscalYear: any,
    schedule: any,
    orgData: any,
    companyInfo: any,
    timeZone: any,
    branch: any,
    applicantStatus: any,
  ) {
    yield {
      createFn: createFiscalYear.mutateAsync,
      deleteFn: deleteFiscalYear.mutateAsync,
      data: fiscalYear,
    };
    yield {
      createFn: createSchedule.mutateAsync,
      deleteFn: deleteSchedule.mutateAsync,
      data: schedule,
    };
    yield {
      createFn: createOrgChart.mutateAsync,
      deleteFn: deleteOrgChart.mutateAsync,
      data: orgData,
    };
    yield {
      createFn: createCompanyInfo.mutateAsync,
      deleteFn: deleteCompanyInfo.mutateAsync,
      data: companyInfo,
    };
    yield {
      createFn: updateCompanyImageWithStamp.mutateAsync,
      data: {
        id: tenantId,
        updateClientDto: { companyName },
        companyProfileImage: companyProfileImage?.companyProfileImage,
        companyStamp: companyStamp?.companyStamp,
      },
    };
    yield { createFn: updateTimeZone.mutateAsync, data: timeZone };
    yield {
      createFn: createBranch.mutateAsync,
      deleteFn: deleteBranch.mutateAsync,
      data: branch,
    };
    yield {
      createFn: createApplicantStatus.mutateAsync,
      deleteFn: deleteApplicantStatus.mutateAsync,
      data: applicantStatus,
    };
  }

  /* -------------------------------------------------------------------------- */
  /*                              submit handler                                */
  /* -------------------------------------------------------------------------- */
  const onSubmitOnboarding = async () => {
    // 1. validate all forms
    try {
      await Promise.all(forms.map((f) => f.validateFields()));
    } catch (error: any) {
      showValidationErrors(error?.errorFields);
      return;
    }

    // 2. gather payload after validation
    const companyInfoPayload = formCompany.getFieldsValue();

    toggleLoading();
    createWorkSchedule();

    /* keep track of successful requests so that we can roll back on error */
    const successfulRequests: {
      deletePayload: any;
      deleteFn: (payload: any) => Promise<any>;
    }[] = [];

    const generator = createResourcesGenerator(
      fiscalYearPayLoad,
      schedulePayload,
      orgData,
      companyInfoPayload,
      timeZonePayload,
      branchPayload,
      applicantStatusPayload,
    );

    try {
      for (const { createFn, deleteFn, data } of generator) {
        const response = await createFn(data);
        // For rollback, use the same payload as was used for creation, or adapt as needed
        if (deleteFn && response) {
          // If the delete function expects a different payload, adapt here as needed
          successfulRequests.push({
            deletePayload: response?.id ?? data,
            deleteFn,
          });
        }
      }

      NotificationMessage.success({
        message: 'Success',
        description: 'All Requests Successfully Created',
      });
      togleIsModalVisible();
    } catch (err) {
      // rollback
      await Promise.all(
        successfulRequests.map(({ deletePayload, deleteFn }) =>
          deleteFn(deletePayload),
        ),
      );
      NotificationMessage.error({
        message: 'Error',
        description:
          'An error occurred while processing onboarding. Rolled back changes.',
      });
    }

    toggleLoading();
  };

  /* -------------------------------------------------------------------------- */
  /*                         next/previous step handler                         */
  /* -------------------------------------------------------------------------- */
  const handleNextStep = () => {
    // last index = steps.length - 1 (3)
    if (currentStep >= 3) {
      // on the review step… just make sure at least one branch exists
      if (branches && branches.items?.length) {
        nextStep();
      } else {
        NotificationMessage.warning({
          message: 'Branch not created',
          description: 'You have to create at least one branch',
        });
      }
      return;
    }

    // validate only the current form before moving on
    if (currentStep < forms.length) {
      forms[currentStep]
        .validateFields()
        .then(() => nextStep())
        .catch((e) => showValidationErrors([e?.errorFields[0]]));
    } else {
      nextStep();
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                                    UI                                      */
  /* -------------------------------------------------------------------------- */
  const steps = [
    { title: 'Step 1', content: <CompanyProfile form={formCompany} /> },
    { title: 'Step 2', content: <FiscalYearForm form={formFiscal} /> },
    { title: 'Step 3', content: <WorkSchedule form={formSchedule} /> },
    { title: 'Step 4', content: <OrgChartComponent /> },
  ];

  const handleCloseModal = () => togleIsModalVisible();

  return (
    <div className="flex flex-col items-center p-4 mobile-sm:p-2 mobile-md:p-4 mobile-lg:p-6 tablet-md:p-8 lg:p-12">
      <div className="bg-white w-full rounded-lg flex flex-col p-4 lg:flex-row-reverse items-center gap-10">
        {/* Left section: copy, progress & buttons */}
        <div className="mx-auto pr-0 w-full">
          {/* progress dots */}
          <div className="flex items-center mb-8">
            {steps.map((notused, index) => (
              <div
                key={index}
                className={`w-6 h-5 rounded mr-2 ${currentStep >= index ? 'bg-blue' : 'bg-gray-300'}`}
              />
            ))}
          </div>

          <div className="text-xl font-bold text-gray-600 mb-8">
            STEP {currentStep + 1} OF {steps.length}
          </div>

          {/* dynamic heading/description */}
          {(() => {
            switch (currentStep) {
              case 0:
                return (
                  <>
                    <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4">
                      Personalize your experience and ensure smooth setup
                    </h2>
                    <p className="text-gray-600 mb-10">
                      This will help us configure the system to better align
                      with your organizations operation.
                    </p>
                  </>
                );
              case 1:
                return (
                  <>
                    <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4">
                      Define fiscal year for your organisation
                    </h2>
                    <p className="text-gray-600 mb-10">
                      This will help us ensure accurate reporting and data
                      alignment.
                    </p>
                  </>
                );
              case 2:
                return (
                  <>
                    <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4">
                      Define the work schedule for your organisation
                    </h2>
                    <p className="text-gray-600 mb-10">
                      Specify working days and hours to ensure proper planning
                      and resource management.
                    </p>
                  </>
                );
              case 3:
                return (
                  <>
                    <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4">
                      Create and define your organisational structure
                    </h2>
                    <p className="text-gray-600 mb-10">
                      Add departments, roles, and reporting hierarchies to
                      ensure clear communication and streamlined workflows.
                    </p>
                  </>
                );
              default:
                return null;
            }
          })()}

          {/* buttons (desktop) */}
          <div className="hidden tablet-md:flex space-x-4 items-center">
            {currentStep > 0 && (
              <Button
                onClick={prevStep}
                icon={<ArrowLeftOutlined />}
                className="w-36 h-16"
                size="large"
                id="goBackButton"
                disabled={currentStep === 0}
              >
                Go Back
              </Button>
            )}
            <Button
              onClick={
                currentStep === steps.length - 1
                  ? onSubmitOnboarding
                  : handleNextStep
              }
              type="primary"
              size="large"
              className="w-36 h-16 bg-blue disabled:bg-blue"
              id={
                currentStep === steps.length - 1
                  ? 'finishButton'
                  : 'continueButton'
              }
              disabled={loading}
            >
              {loading ? (
                <Spin size="large" style={{ color: 'white' }} />
              ) : currentStep === steps.length - 1 ? (
                'Submit'
              ) : (
                'Continue'
              )}
            </Button>
          </div>
        </div>

        {/* Right section: actual step content (desktop) */}
        <div className="w-full mt-8 md:mt-0 tablet-md:block hidden">
          {steps.map((step, idx) => (
            <div
              key={idx}
              style={{ display: idx === currentStep ? 'block' : 'none' }}
            >
              {step.content}
            </div>
          ))}
        </div>
      </div>

      {/* buttons + step content for mobile */}
      <div className="tablet-md:hidden w-full mt-8">
        {steps.map((step, idx) => (
          <div
            key={idx}
            style={{ display: idx === currentStep ? 'block' : 'none' }}
          >
            {step.content}
          </div>
        ))}
        <div className="flex space-x-4 mt-6 items-center">
          {currentStep > 0 && (
            <Button
              onClick={prevStep}
              icon={<ArrowLeftOutlined />}
              className="w-36 h-16"
              size="large"
              id="goBackButtonMobile"
              disabled={currentStep === 0}
            >
              Go Back
            </Button>
          )}
          <Button
            onClick={
              currentStep === steps.length - 1
                ? onSubmitOnboarding
                : handleNextStep
            }
            type="primary"
            size="large"
            className="w-36 h-16 bg-blue disabled:bg-blue"
            id={
              currentStep === steps.length - 1
                ? 'finishButtonMobile'
                : 'continueButtonMobile'
            }
            disabled={loading}
          >
            {loading ? (
              <Spin size="large" style={{ color: 'white' }} />
            ) : currentStep === steps.length - 1 ? (
              'Submit'
            ) : (
              'Continue'
            )}
          </Button>
        </div>
      </div>

      {/* Success modal */}
      <CustomModal
        visible={isModalVisible}
        onClose={handleCloseModal}
        text="You have successfully finished the onboarding process"
        route="/dashboard"
      />
    </div>
  );
};

export default OnboardingSteper;
