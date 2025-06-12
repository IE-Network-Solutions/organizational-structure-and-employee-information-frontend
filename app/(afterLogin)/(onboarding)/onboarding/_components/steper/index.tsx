'use client';
import React, { useEffect, useState } from 'react';
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
  useGetCompanyProfileByTenantId,
  // useUpdateCompanyProfile,
  useUpdateCompanyProfileWithStamp,
} from '@/store/server/features/organizationStructure/companyProfile/mutation';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import TimeZone from './timezone';
import FiscalYearForm from './onBoardingFy';
import { useGetTimeZone } from '@/store/server/features/timesheet/timeZone/queries';
import { useCreateBranch, useDeleteBranch } from '@/store/server/features/organizationStructure/branchs/mutation';
import { useUpdateTimeZone } from '@/store/server/features/timesheet/timeZone/mutation';

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
    // if (departments?.length > 0) {
    //   router.push('/dashboard');
    // }
     if (false) {
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

  const { createWorkSchedule, getSchedule, detail } = useScheduleStore();
  const { data: branches } = useGetBranches();
  const tenantId = useAuthenticationStore.getState().tenantId;

  const { data: companyInformation } = useGetCompanyProfileByTenantId(tenantId);
  const { orgData } = useOrganizationStore();
  // const { getFiscalYear } = useFiscalYearStore();
  const { data } = useGetTimeZone();
 const [detectedTimeZone, setDetectedTimeZone] = useState<string>('');
function getBrowserGMTOffset(): string {
  const offsetMinutes = new Date().getTimezoneOffset();
  const totalMinutes = -offsetMinutes;

  const sign = totalMinutes >= 0 ? '+' : '-';
  const absMinutes = Math.abs(totalMinutes);
  const hours = Math.floor(absMinutes / 60).toString().padStart(2, '0');
  const minutes = (absMinutes % 60).toString().padStart(2, '0');
  return `${sign}${hours}:${minutes}`;
}
  useEffect(() => {
    setDetectedTimeZone(getBrowserGMTOffset());
  }, [getBrowserGMTOffset()]);
  const timeZonePayload={
    timezone: detectedTimeZone,
    id:data? data.id:""
}
const schedulePayload={
  name:"Full-time Schedule",
detail
}
const branchPayload={
    name: "HQ",
    description: "HQ",
    location: "HQ",
    contactNumber: companyInformation?.contactPersonPhoneNumber,
    contactEmail: companyInformation?.contactPersonEmail
}
  const { fiscalYearPayLoad } =
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
  const createBranch = useCreateBranch();
  const deleteBranch= useDeleteBranch();
  const updateTimeZone=useUpdateTimeZone();

  const { companyInfo } = useStep2Store();
  // const updateCompanyProfile = useUpdateCompanyProfile();
  const updateComapnyImageWithStamp = useUpdateCompanyProfileWithStamp();

  function* createResourcesGenerator(
    fiscalYear: any,
    schedule: any,
    orgData: any,
    companyInfo: any,
    companyProfileImage: any,
    timeZone:any,
    branch:any
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
      createFn: updateComapnyImageWithStamp.mutateAsync,
      data: {
        id: tenantId,
        updateClientDto: { companyName },
        companyProfileImage: companyProfileImage?.companyProfileImage,
        companyStamp: companyProfileImage?.companyStamp,
      },
    };
    yield {
      createFn: updateTimeZone.mutateAsync,
      data: timeZone,
    };
    yield {
      createFn: createBranch.mutateAsync,
      deleteFn: deleteBranch.mutateAsync,
      data: branch,
    };
  }

  const onSubmitOnboarding = async () => {
    toggleLoading();
    createWorkSchedule();
    const schedule = getSchedule();

    const successfulRequests: {
      id: string;
      deleteFn: (id: string) => Promise<any>;
    }[] = [];
    const generator: any = createResourcesGenerator(
      fiscalYearPayLoad,
      schedulePayload,
      orgData,
      companyInfo,
      { companyProfileImage, companyStamp },
      timeZonePayload,
      branchPayload,
    );
// console.log( {fiscalYearPayLoad,
//       schedulePayload,
//       orgData,
//       companyInfo,timeZonePayload,branchPayload},"KKKKK")
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
      title: 'Step 1',
      content: (
        
        <FiscalYearForm
        />
    
      ),
    },
    {
      title: 'Step 2',
      content: <WorkSchedule form={form4} />,
    },
    // {
    //   title: 'Step 3',
    //   content: <Branches />,
    // },
    {
      title: 'Step 3',
      content: <OrgChartComponent />,
    },
  ];

  const handleClose = () => {
    togleIsModalVisible();
  };
  console.log(companyInformation,"companyInfo")
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
      lg:flex-row-reverse 
      lg:space-x-2
      items-center
      md:items-center lg:items-center
      tablet-md:px-2
      gap-10
      "
      >
        {/* Left Section */}
        <div className='mx-auto'>
           <div className="pr-0 tablet-md:pr-0 mb-4 md:mb-0 w-full ">
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
            {currentStep +1==1?"Personalize your experience and ensure smooth setup":currentStep +1==2?"Please define fiscal year for Your organization":currentStep +1==3?"Define the work schedule for your organization ":currentStep+1==4?"Create and define your organizational structure":""}
          </h2>
          <p className="text-gray-600 mb-10">
           {currentStep+1==1?"This will help us configure the system to better align with your organizations operation ":currentStep+1==2?"This will help us ensure accurate reporting and data alignment.":currentStep+1==3?"Specify working days and hours to ensure proper planning and resource management.":currentStep+1==4?"Add departments, roles, and reporting hierarchies to ensure clear communication and streamlined workflows.":""}
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
        </div>
       

        {/* Right Section */}
        {currentStep !== 5 && (
          <div className="w-full  mt-8 md:mt-0">
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
