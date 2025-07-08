'use client';
import React, { useEffect } from 'react';
import { Button, Spin } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import useStepStore from '@/store/uistate/features/organizationStructure/steper/useStore';
import WorkSchedule from './workSchedule';
import Branches from './branches';
import OrgChartComponent from './orgChartComponent';
import useScheduleStore from '@/store/uistate/features/organizationStructure/workSchedule/useStore';
import useOrganizationStore from '@/store/uistate/features/organizationStructure/orgState';
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
import { useStep2Store } from '@/store/uistate/features/organizationStructure/comanyInfo/useStore';
import {
  useCreateCompanyInfo,
  useDeleteCompanyInfo,
} from '@/store/server/features/organizationStructure/companyInfo/mutation';
// import { useUpdateCompanyProfile } from '@/store/server/features/organizationStructure/companyProfile/mutation';
// import { useCompanyProfile } from '@/store/uistate/features/organizationStructure/companyProfile/useStore';
import { Form } from 'antd';
import CompanyProfile from './companyProfile';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import { showValidationErrors } from '@/utils/showValidationErrors';
import CustomModal from '@/app/(afterLogin)/(employeeInformation)/_components/sucessModal/successModal';
import { useGetDepartments } from '@/store/server/features/employees/employeeManagment/department/queries';
import { useRouter } from 'next/navigation';
import { useGetBranches } from '@/store/server/features/organizationStructure/branchs/queries';
import CustomWorFiscalYearDrawer from '@/app/(afterLogin)/(organizationalStructure)/organization/settings/_components/fiscalYear/customDrawer';
import { useFiscalYearDrawerStore } from '@/store/uistate/features/organizations/settings/fiscalYear/useStore';
import { useCompanyProfile } from '@/store/uistate/features/organizationStructure/companyProfile/useStore';
import {
  // useUpdateCompanyProfile,
  useUpdateCompanyProfileWithStamp,
} from '@/store/server/features/organizationStructure/companyProfile/mutation';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import TimeZone from './timezone';

const tenantId = useAuthenticationStore.getState().tenantId;

const OnboaringSteper: React.FC = () => {
  const [form1] = Form.useForm();
  const [form2] = Form.useForm();
  const [form3] = Form.useForm();
  const [form4] = Form.useForm();
  const forms = [form1, form2, form3, form4];

  const { data: departments } = useGetDepartments();
  const { calendarType } = useFiscalYearDrawerStore();
  const router = useRouter();
  useEffect(() => {
    if (departments?.length > 0) {
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
  } = useStepStore((state) => state);

  const { createWorkSchedule, getSchedule } = useScheduleStore();
  const { data: branches } = useGetBranches();

  const { orgData } = useOrganizationStore();
  // const { getFiscalYear } = useFiscalYearStore();

  const { fiscalYearFormValues, sessionFormValues, monthRangeValues } =
    useFiscalYearDrawerStore();
  const { companyName, companyProfileImage, companyStamp } =
    useCompanyProfile();

  const createFiscalYear = useCreateFiscalYear();

  const deleteFiscalYear = useDeleteFiscalYear();
  const createSchedule = useCreateSchedule();
  const deleteSchedule = useDeleteSchedule();
  const createOrgChart = useCreateOrgChart();
  const deleteOrgChart = useDeleteOrgChart();
  const createCompanyInfo = useCreateCompanyInfo();
  const deleteCompanyInfo = useDeleteCompanyInfo();
  const { companyInfo } = useStep2Store();
  // const updateCompanyProfile = useUpdateCompanyProfile();
  const updateComapnyImageWithStamp = useUpdateCompanyProfileWithStamp();

  function* createResourcesGenerator(
    fiscalYear: any,
    schedule: any,
    orgData: any,
    companyInfo: any,
    companyProfileImage: any,
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
    // yield {
    //   createFn: updateCompanyProfile.mutateAsync,
    //   data: { id: tenantId, companyProfileImage: companyProfileImage},
    // };
    yield {
      createFn: updateComapnyImageWithStamp.mutateAsync,
      data: {
        id: tenantId,
        updateClientDto: { companyName },
        companyProfileImage: companyProfileImage?.companyProfileImage,
        companyStamp: companyProfileImage?.companyStamp,
      },
    };
  }

  const onSubmitOnboarding = async () => {
    toggleLoading();
    createWorkSchedule();

    const getTransformedFiscalYear = (
      monthFormValues: any,
      sessionFormValues: any,
    ) => {
      const months = Object.keys(monthFormValues)
        .filter((key) => key.startsWith('monthName_'))
        /* eslint-disable-next-line @typescript-eslint/naming-convention */
        .map((_, index) => ({
          /* eslint-enable @typescript-eslint/naming-convention */

          name: monthFormValues[`monthName_${index + 1}`],
          description: monthFormValues[`monthDescription_${index + 1}`],
          startDate: monthFormValues[`monthStartDate_${index + 1}`],
          endDate: monthFormValues[`monthEndDate_${index + 1}`],
        }));

      const sessions = [];
      if (calendarType === 'Quarter') {
        sessions.push(
          ...sessionFormValues?.sessionData.map((session: any, index: any) => ({
            name: session.sessionName || `Session ${index + 1}`,
            description:
              session.sessionDescription ||
              `Description for Session ${index + 1}`,
            startDate: session.sessionStartDate || '',
            endDate: session.sessionEndDate || '',
            months: months.slice(index * 3, (index + 1) * 3),
          })),
        );
      } else if (calendarType === 'Semester') {
        sessions.push(
          ...sessionFormValues?.sessionData.map((session: any, index: any) => ({
            name: session.sessionName || `Session ${index + 1}`,
            description:
              session.sessionDescription ||
              `Description for Session ${index + 1}`,
            startDate: session.sessionStartDate || '',
            endDate: session.sessionEndDate || '',
            months: months.slice(index * 6, (index + 1) * 6),
          })),
        );
      } else if (calendarType === 'Year') {
        sessions.push(
          ...sessionFormValues?.sessionData.map((session: any) => ({
            name: session?.sessionName || 'Session 1',
            description:
              session?.sessionDescription || 'Description for Session 1',
            startDate: session?.sessionStartDate || '',
            endDate: session?.sessionEndDate || '',
            months,
          })),
        );
      }

      return sessions;
    };

    const fiscalYearData = getTransformedFiscalYear(
      monthRangeValues,
      sessionFormValues,
    );

    const fiscalYear = {
      name: fiscalYearFormValues?.fiscalYearName,
      startDate: fiscalYearFormValues?.fiscalYearStartDate,
      endDate: fiscalYearFormValues?.fiscalYearEndDate,
      description: fiscalYearFormValues?.fiscalYearDescription,
      sessions: fiscalYearData?.map((session: any) => ({
        name: session?.name,
        description: session?.description,
        startDate: session?.startDate,
        endDate: session?.endDate,
        months: session?.months.map((month: any) => ({
          name: month?.name,
          description: month?.description,
          startDate: month?.startDate,
          endDate: month?.endDate,
        })),
      })),
    };
    const schedule = getSchedule();

    const successfulRequests: {
      id: string;
      deleteFn: (id: string) => Promise<any>;
    }[] = [];
    const generator: any = createResourcesGenerator(
      fiscalYear,
      schedule,
      orgData,
      companyInfo,
      { companyProfileImage, companyStamp },
    );

    try {
      for (const { createFn, deleteFn, data } of generator) {
        const response = await createFn(data);
        const id = response.id;

        if (deleteFn) {
          successfulRequests.push({ id, deleteFn });
        } else {
          togleIsModalVisible();
        }
      }
      NotificationMessage.success({
        message: 'Success',
        description: `All Requests Successfully Created`,
      });
    } catch (error: any) {
      await Promise.all(
        successfulRequests.map(({ id, deleteFn }) => deleteFn(id)),
      );
    }
    toggleLoading();
  };

  const handleNextStep = () => {
    if (currentStep >= 4) {
      branches && branches?.items?.length >= 1
        ? nextStep()
        : NotificationMessage.warning({
            message: 'Branch Is not created Error',
            description: 'You have to create at least one branch',
          });
    } else {
      forms[currentStep]
        .validateFields()
        .then(() => {
          nextStep();
        })
        .catch((errorInfo: any) => {
          showValidationErrors(errorInfo?.errorFields);
        });
    }
  };

  const steps = [
    {
      title: 'Step 1',
      content: <CompanyProfile form={form1} />,
    },
    {
      title: 'Step 2',
      content: <TimeZone />,
    },
    {
      title: 'Step 3',
      content: (
        <CustomWorFiscalYearDrawer
          form={form3}
          handleNextStep={handleNextStep}
        />
      ),
    },
    {
      title: 'Step 4',
      content: <WorkSchedule form={form4} />,
    },
    {
      title: 'Step 5',
      content: <Branches />,
    },
    {
      title: 'Step 6',
      content: <OrgChartComponent />,
    },
  ];

  const handleClose = () => {
    togleIsModalVisible();
  };

  return (
    <div className="flex flex-col items-center p-4 mobile-sm:p-2 mobile-md:p-4 mobile-lg:p-6 tablet-md:p-8 lg:p-12">
      <div
        className="
      bg-white 
      w-full
      rounded-lg
      flex flex-col 
      p-4
      mobile-sm:p-2
      mobile-md:p-2
      mobile-lg:p-2 
      tablet-md:p-4  
      lg:p-4
      lg:flex-row 
      lg:space-x-2
      items-center
      md:items-stretch lg:items-stretch
      tablet-md:px-2
      "
      >
        {/* Left Section */}
        <div className="flex-1 pr-0 tablet-md:pr-0 mb-4 md:mb-0 w-full">
          <div className="flex items-center mb-4 md:mb-8">
            <div className="flex items-center">
              {/*eslint-disable @typescript-eslint/naming-convention */}
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-6 h-5 rounded mr-2 ${currentStep >= index ? 'bg-blue' : 'bg-gray-300'}`}
                />
              ))}
              {/*eslint-enable @typescript-eslint/naming-convention */}
            </div>
          </div>
          <div className="text-xl font-bold text-gray-600 mb-8">
            STEP {currentStep + 1} OF {steps.length}
          </div>
          <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4">
            We can now create a workspace for your team.
          </h2>
          <p className="text-gray-600 mb-10">
            Please fill out your teams in your company
          </p>

          {currentStep == 5 && (
            <div className="overflow-x-auto my-8">
              {steps[currentStep].content}
            </div>
          )}

          <div className="hidden tablet-md:flex space-x-2 md:space-x-4 justify-start items-center">
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
                <Spin
                  size="large"
                  style={{ color: 'white' }}
                  className="text-white"
                />
              ) : currentStep === steps.length - 1 ? (
                'Submit'
              ) : (
                'Continue'
              )}
            </Button>
          </div>
        </div>

        {/* Right Section */}
        {currentStep !== 5 && (
          <div className="w-full lg:w-1/2 mt-8 md:mt-0">
            {steps[currentStep].content}
          </div>
        )}

        <div className="flex space-x-2 md:space-x-4 justify-start items-center tablet-md:hidden ">
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
              <Spin
                size="large"
                style={{ color: 'white' }}
                className="text-white"
              />
            ) : currentStep === steps.length - 1 ? (
              'Submit'
            ) : (
              'Continue'
            )}
          </Button>
        </div>
      </div>
      <CustomModal
        visible={isModalVisible}
        onClose={handleClose}
        text="You have successfully finished onboarding process"
        route={`/dashboard`}
      />
    </div>
  );
};

export default OnboaringSteper;
