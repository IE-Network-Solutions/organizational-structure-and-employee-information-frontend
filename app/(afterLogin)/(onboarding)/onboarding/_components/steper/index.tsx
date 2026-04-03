'use client';
import React, { useEffect, useState } from 'react';
import { Form } from 'antd';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

dayjs.extend(isBetween);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

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
import { FiscalYear } from '@/store/server/features/organizationStructure/fiscalYear/interface';
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
import CustomModal from '@/app/(afterLogin)/(employeeInformation)/_components/sucessModal/successModal';
import Welcome from './welcome';
import OnboardingModalBackground from './OnboardingModalBackground';
import { Department, OrgData } from '@/types/dashboard/organization';

/**
 * Onboarding simplified flow
 */
const OnboardingSteper: React.FC = () => {
  const [showWelcome, setShowWelcome] = useState(true);

  /* -------------------------------------------------------------------------- */
  /*                               form instances                               */
  /* -------------------------------------------------------------------------- */
  const [formCompany] = Form.useForm();
  const [formFiscal] = Form.useForm();
  const [formSchedule] = Form.useForm();

  /* -------------------------------------------------------------------------- */
  /*                               external data                                */
  /* -------------------------------------------------------------------------- */
  const { data: departments } = useGetDepartments();
  const router = useRouter();
  useEffect(() => {
    if (departments?.length) {
      router.push('/dashboard');
    }
  }, [departments?.length, router]);

  const { loading, toggleLoading, isModalVisible, togleIsModalVisible } =
    useStepStore();

  const { createWorkSchedule, detail } = useScheduleStore();
  const { orgData } = useOrganizationStore();
  const { fiscalYearPayLoad } = useFiscalYearDrawerStore();
  const { companyName, companyProfileImage, companyStamp } =
    useCompanyProfile();

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
  const schedulePayload = { name: 'Full‑time Schedule', detail };
  const timeZonePayload = {
    timezone: detectedTimeZone,
    id: timeZoneRow ? timeZoneRow.id : '',
  };
  const branchPayload = {
    name: 'HQ',
    description: 'HQ',
    location: 'HQ',
    contactNumber: companyInformation?.contactPersonPhoneNumber || '',
    contactEmail: companyInformation?.contactPersonEmail || '',
    tenantId: tenantId || '',
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

  const assignBranchIdToDepartments = (
    departments: Department[] = [],
    fallbackBranchId: string,
  ): Department[] =>
    departments.map((department) => ({
      ...department,
      branchId: department.branchId || fallbackBranchId,
      department: assignBranchIdToDepartments(
        department.department || [],
        fallbackBranchId,
      ),
    }));

  const buildOrgDataWithBranchId = (
    sourceOrgData: OrgData,
    fallbackBranchId: string,
  ): OrgData => ({
    ...sourceOrgData,
    branchId: sourceOrgData.branchId || fallbackBranchId,
    department: assignBranchIdToDepartments(
      sourceOrgData.department || [],
      fallbackBranchId,
    ),
  });

  /* -------------------------------------------------------------------------- */
  /*                        generator for sequential calls                      */
  /* -------------------------------------------------------------------------- */
  function* createResourcesGenerator(
    fiscalYear: any,
    schedule: any,
    orgData: any,
    companyInfo: any,
    timeZone: any,
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
      createFn: createApplicantStatus.mutateAsync,
      deleteFn: deleteApplicantStatus.mutateAsync,
      data: applicantStatus,
    };
  }

  /* -------------------------------------------------------------------------- */
  /*                              submit handler                                */
  /* -------------------------------------------------------------------------- */
  const onSubmitOnboarding = async () => {
    toggleLoading();
    try {
      // Validate the fiscal form first (Step 2)
      await formFiscal.validateFields();

      // For Steps 1 and 3, skip validation if fields aren't fully interactable,
      // OR ensure they are populated via their background components.
      // We'll try to validate all just in case.
      await Promise.all([
        formCompany.validateFields(),
        formSchedule.validateFields(),
      ]);
    } catch (error: any) {
      showValidationErrors(error?.errorFields);
      toggleLoading();
      return;
    }

    const companyInfoPayload = formCompany.getFieldsValue();
    createWorkSchedule();

    const successfulRequests: {
      deletePayload: any;
      deleteFn: (payload: any) => Promise<any>;
    }[] = [];

    // Construct payload exactly like organization settings drawer does
    if (
      !fiscalYearPayLoad ||
      !fiscalYearPayLoad.sessions ||
      fiscalYearPayLoad.sessions.length === 0
    ) {
      NotificationMessage.error({
        message: 'Error',
        description: 'Missing required fiscal year data.',
      });
      toggleLoading();
      return;
    }

    const now = dayjs();

    // Build payload matching organization settings structure exactly
    // Format dates: startDate as Dayjs object, endDate as formatted string (same as organization settings)
    const payload: FiscalYear = {
      name: fiscalYearPayLoad.name,
      startDate: dayjs(fiscalYearPayLoad.startDate),
      endDate: dayjs(fiscalYearPayLoad.endDate).format('YYYY-MM-DD'),
      description: fiscalYearPayLoad.description || '',
      sessions: fiscalYearPayLoad.sessions.map((session: any) => ({
        name: session.name,
        startDate: dayjs(session.startDate).format('YYYY-MM-DD'),
        endDate: dayjs(session.endDate).format('YYYY-MM-DD'),
        description: session.description || '',
        months:
          session.months?.map((month: any) => ({
            name: month.name,
            startDate: dayjs(month.startDate).format('YYYY-MM-DD'),
            endDate: dayjs(month.endDate).format('YYYY-MM-DD'),
            description: month.description || '',
          })) || [],
      })),
    };

    // Calculate isActive exactly like organization settings
    const fyStart = dayjs(payload.startDate);
    const fyEnd = dayjs(payload.endDate);

    const activeFiscalYearPayload = {
      ...payload,
      isActive: now.isBetween(fyStart, fyEnd, null, '[]'),
      sessions:
        payload.sessions?.map((session: any) => {
          const sStart = dayjs(session.startDate);
          const sEnd = dayjs(session.endDate);
          return {
            ...session,
            active: now.isBetween(sStart, sEnd, null, '[]'),
            months:
              session.months?.map((month: any) => ({
                ...month,
                active: now.isBetween(
                  dayjs(month.startDate),
                  dayjs(month.endDate),
                  null,
                  '[]',
                ),
              })) || [],
          };
        }) || [],
    };

    try {
      const createdBranch = await createBranch.mutateAsync(branchPayload);
      const createdBranchId = createdBranch?.id;

      if (!createdBranchId) {
        throw new Error('Branch creation did not return an id');
      }

      successfulRequests.push({
        deletePayload: createdBranchId,
        deleteFn: deleteBranch.mutateAsync,
      });

      const orgDataWithBranchId = buildOrgDataWithBranchId(
        orgData,
        createdBranchId,
      );

      const generator = createResourcesGenerator(
        activeFiscalYearPayload,
        schedulePayload,
        orgDataWithBranchId,
        companyInfoPayload,
        timeZonePayload,
        applicantStatusPayload,
      );

      for (const { createFn, deleteFn, data } of generator) {
        const response = await createFn(data);
        if (deleteFn && response) {
          successfulRequests.push({
            deletePayload: response?.id ?? data,
            deleteFn,
          });
        }
      }
      NotificationMessage.success({
        message: 'Success',
        description: 'Onboarding Successfully Completed',
      });
      togleIsModalVisible();
    } catch (err) {
      await Promise.all(
        successfulRequests.map(({ deletePayload, deleteFn }) =>
          deleteFn(deletePayload),
        ),
      );
      NotificationMessage.error({
        message: 'Error',
        description: 'An error occurred. Rolled back changes.',
      });
    }
    toggleLoading();
  };

  const handleCloseModal = () => togleIsModalVisible();

  return (
    <>
      {showWelcome && <Welcome onComplete={() => setShowWelcome(false)} />}

      <div
        className="h-screen w-full flex items-center justify-center p-6 relative overflow-hidden"
        data-cy="onboarding-stepper-container"
      >
        {/* Background skeleton: sidebar + top bar + placeholder boxes (matches reference images) */}
        <OnboardingModalBackground />

        {/* Main View: Fiscal Year modal stays visible; loading shown on its button */}
        {!showWelcome && (
          <div
            className="z-10 w-full flex justify-center overflow-hidden"
            data-cy="onboarding-fiscal-form-wrap"
          >
            <FiscalYearForm
              form={formFiscal}
              onNext={onSubmitOnboarding}
              isLoading={loading}
            />
          </div>
        )}

        {/* Hidden Background Steps: They still run useEffects to populate formCompany and formSchedule */}
        <div className="hidden" data-cy="onboarding-hidden-steps">
          <CompanyProfile form={formCompany} />
          <WorkSchedule form={formSchedule} />
          <OrgChartComponent />
        </div>

        {/* Success modal */}
        <CustomModal
          visible={isModalVisible}
          onClose={handleCloseModal}
          text="You have successfully finished the onboarding process"
          route="/dashboard"
        />
      </div>
    </>
  );
};

export default OnboardingSteper;
