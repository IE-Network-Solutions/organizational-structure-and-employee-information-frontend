import CustomButton from '@/components/common/buttons/customButton';
import {
  Button,
  Menu,
  Tooltip,
  Select,
} from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import SessionFilter from '../filters/SessionFilter';
import MobileFilterModal from '../filters/MobileFilterModal';
import { FaPlus } from 'react-icons/fa';
import {
  AllPlanningPeriods,
  useDefaultPlanningPeriods,
  useGetReporting,
  useGetUserPlanning,
} from '@/store/server/features/okrPlanningAndReporting/queries';
import { useGetFiscalYearById } from '@/store/server/features/organizationStructure/fiscalYear/queries';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { useGetDepartmentsWithUsers } from '@/store/server/features/employees/employeeManagment/department/queries';
import dayjs from 'dayjs';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { PlanningAndReportingStore } from '@/store/uistate/features/planningAndReporting/useStore';
import Image from 'next/image';
import { IoIosOpen, IoMdSwitch } from 'react-icons/io';
import { IoCheckmarkSharp } from 'react-icons/io5';
import { AiOutlineEdit } from 'react-icons/ai';
import {
  useApprovalReporting,
  // useDeleteReportById,
} from '@/store/server/features/okrPlanningAndReporting/mutations';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import { useIsMobile } from '@/hooks/useIsMobile';
import CustomPagination from '@/components/customPagination';
import PlanCard from '../vamp/PlanCard';
import PlanCardSkeleton from '../vamp/PlanCardSkeleton';
import { transformReportToPlanSummary } from '../vamp/dataTransformer';
import { Cadence } from '../vamp/types';

function Reporting() {
  const {
    setOpenReportModal,
    selectedUser,
    setSelectedUser,
    activePlanPeriod,
    setSelectedReportId,
    setSelectedPlanId,
    activeTab,
    pageReporting,
    setPageReporting,
    pageSizeReporting,
    activePlanPeriodId,
    setPageSizeReporting,
    selectedSessionIds,
    selectedFiscalYearId,
    allSessionsOfYear,
  } = PlanningAndReportingStore();
  const { data: employeeData } = useGetAllUsers();
  const { userId } = useAuthenticationStore();
  const { data: departmentData } = useGetDepartmentsWithUsers();
  const [selectedDepartment, setSelectedDepartment] = useState<string | undefined>(undefined);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedPlanType, setSelectedPlanType] = useState<string>('all');
  const { data: planningPeriods } = useDefaultPlanningPeriods();
  const { data: userPlanningPeriods } = AllPlanningPeriods();
  const { isMobile, isTablet } = useIsMobile();
  const { data: selectedFiscalYear } = useGetFiscalYearById(
    selectedFiscalYearId || '',
  );
  const hasPermission = AccessGuard.checkAccess({
    permissions: [
      Permissions.ViewDailyPlan,
      Permissions.ViewWeeklyPlan,
      Permissions.ViewMonthlyPlan,
    ],
  });

  // const planningPeriod = [...(planningPeriods?.items ?? [])].reverse();

  // const { mutate: handleDeleteReport, isLoading: loadingDeleteReport } =
  //   useDeleteReportById();

  const { mutate: ReportApproval, isLoading: isApprovalLoading } =
    useApprovalReporting();
  // const planningPeriodId = planningPeriod?.[activePlanPeriod - 1]?.id;
  const planningPeriodId =
    activePlanPeriodId || userPlanningPeriods?.[activePlanPeriod - 1]?.id;

  // const userPlanningPeriodId =
  //   userPlanningPeriods?.[activePlanPeriod - 1]?.planningPeriodId;
  const userPlanningPeriodId = userPlanningPeriods?.find(
    (item) => item?.planningPeriodId === planningPeriodId,
  )?.planningPeriodId;

  const { data: allUserPlanning, isLoading: getUserPlanningLoading } =
    useGetUserPlanning(planningPeriodId ?? '', activeTab.toString());
  const { data: allReporting, isLoading: getReportLoading } = useGetReporting({
    userId: selectedUser,
    planPeriodId: planningPeriodId ?? '',
    pageReporting,
    pageSizeReporting,
    // If no sessions selected but year is selected, send all sessions
    // If sessions are selected, send only those
    sessionId:
      selectedSessionIds.length > 0
        ? selectedSessionIds
        : allSessionsOfYear.length > 0
          ? allSessionsOfYear
          : [],
  });
  const getPlanningPeriodDetail = (id: string) => {
    const planningPeriodDetail = planningPeriods?.items?.find(
      (period: any) => period?.id === id,
    );
    return planningPeriodDetail || {}; // Return an empty object if planningPeriodDetail is undefined
  };
  // const { data: allUnReportedPlanningTask } = useGetUnReportedPlanning(
  //   planningPeriodId ?? '',
  //   activeTab,
  // );

  // const activeTabName = planningPeriod?.[activePlanPeriod - 1]?.name;
  const activeTabName = getPlanningPeriodDetail(planningPeriodId ?? '')?.name;

  useEffect(() => {
    setPageReporting(1);
    setPageSizeReporting(10);
  }, [activeTab, setPageReporting, setPageSizeReporting]);

  // Build employee options from real data
  const employeeOptions = useMemo(() => {
    const options = [{ label: 'All employees', value: 'all' }];
    if (employeeData?.items) {
      employeeData.items.forEach((emp: any) => {
        const name = `${emp.firstName || ''} ${emp.middleName || ''} ${emp.lastName || ''}`.trim();
        if (name) {
          options.push({ label: name, value: emp.id });
        }
      });
    }
    return options;
  }, [employeeData]);

  // Get the current selected employee value - only if it exists in options
  const getSelectedEmployeeValue = () => {
    const currentValue = selectedUser?.[0];
    if (!currentValue || currentValue === 'all' || currentValue === 'subordinate') {
      return 'all';
    }
    // Check if the value exists in employeeOptions
    const optionExists = employeeOptions.some(opt => opt.value === currentValue);
    // Only return the value if the option exists, otherwise return undefined to show placeholder
    return optionExists ? currentValue : undefined;
  };

  // Build department options from real data
  const departmentOptions = useMemo(() => {
    const options = [{ label: 'All Departments', value: 'all' }];
    if (departmentData) {
      departmentData.forEach((dept: any) => {
        if (dept.name) {
          options.push({ label: dept.name, value: dept.id });
        }
      });
    }
    return options;
  }, [departmentData]);

  // Plan type options
  const planTypeOptions = [
    { label: 'All Plans', value: 'all' },
    { label: 'My Plans', value: 'myPlan' },
    { label: 'Subordinate Plans', value: 'subordinatePlan' },
  ];

  // Helper function to get user IDs by department
  const getUserIdsByDepartmentId = (departmentId: string) => {
    const department = departmentData?.find((dep: any) => dep.id === departmentId);
    if (department && department.users) {
      return department.users.map((user: any) => user.id);
    }
    return [];
  };

  // Handle employee filter change
  const handleEmployeeChange = (value: string) => {
    setSelectedDepartment(undefined);
    setSelectedPlanType('all');
    if (value === 'all') {
      setSelectedUser(['all']);
    } else {
      setSelectedUser([value]);
    }
  };

  // Handle plan type filter change
  const handlePlanTypeChange = (value: string) => {
    setSelectedDepartment(undefined);
    setSelectedPlanType(value);

    if (value === 'all') {
      setSelectedUser(['all']);
    } else if (value === 'myPlan') {
      setSelectedUser([userId]);
    } else if (value === 'subordinatePlan') {
      const subordinates = employeeData?.items
        ?.filter(
          (employee: any) =>
            (employee?.delegatedTo?.id || employee.reportingTo?.id) === userId,
        )
        .map((employee: any) => employee.id) || [];
      setSelectedUser(subordinates.length > 0 ? ['subordinate', ...subordinates] : ['subordinate']);
    }
  };

  // Handle department filter change
  const handleDepartmentChange = (value: string) => {
    setSelectedPlanType('all');
    setSelectedDepartment(value);

    if (value === 'all') {
      setSelectedUser(['all']);
    } else {
      const userIds = getUserIdsByDepartmentId(value);
      setSelectedUser(userIds.length > 0 ? userIds : []);
    }
  };

  const getEmployeeData = (id: string) => {
    const employeeDataDetail = employeeData?.items?.find(
      (emp: any) => emp?.id === id,
    );

    return employeeDataDetail || {}; // Return an empty object if employeeDataDetail is undefined
  };
  const handleApproveHandler = (id: string, value: boolean) => {
    const data = {
      id: id,
      value: value,
    };
    ReportApproval(data);
  };


  // Check if data belongs to an active session
  const isDataFromActiveSession = (createdAt: string): boolean => {
    // If no fiscal year is selected, allow all actions (default behavior)
    if (!selectedFiscalYearId || !selectedFiscalYear?.sessions) {
      return true;
    }

    const dataDate = dayjs(createdAt);

    // Check if the data falls within any active session
    const activeSession = selectedFiscalYear.sessions.find((session) => {
      const sessionStart = dayjs(session.startDate);
      const sessionEnd = dayjs(session.endDate);
      return (
        session.active &&
        (dataDate.isAfter(sessionStart) || dataDate.isSame(sessionStart)) &&
        (dataDate.isBefore(sessionEnd) || dataDate.isSame(sessionEnd))
      );
    });

    return !!activeSession;
  };

  // utils/dateHelpers.ts
  const getDateLabel = (createdAt: string, activeTabName: string): string => {
    const planDate = dayjs(createdAt);
    const today = dayjs();

    if (planDate.isSame(today, 'day') && activeTabName === 'Daily') {
      return activeTabName === 'Daily' ? "Today's Plan" : "Today's Report";
    }

    if (activeTabName === 'Weekly') {
      const thisFriday = dayjs().day(5);
      const adjustedThisFriday =
        today.day() > 5 ? thisFriday.add(7, 'day') : thisFriday;
      const lastFriday = adjustedThisFriday.subtract(7, 'day');

      if (
        (planDate.isSame(lastFriday, 'day') || planDate.isAfter(lastFriday)) &&
        (planDate.isSame(adjustedThisFriday, 'day') ||
          planDate.isBefore(adjustedThisFriday))
      ) {
        return 'This Week Plan';
      }
    }

    return '';
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pb-4">
        {hasPermission && (
          <>
            <Select
              className="w-full min-w-[180px] flex-1 md:w-auto [&_.ant-select-selector]:!border-[#E5E7EB] [&_.ant-select-selector]:!rounded-lg [&_.ant-select-selector]:!bg-[#F5F5F7] [&_.ant-select-selector]:!py-2.5 [&_.ant-select-selector]:!px-3 [&_.ant-select-selector]:!min-h-[48px] [&_.ant-select-selector]:!h-12 [&_.ant-select-selection-placeholder]:!text-[#8F94A3] [&_.ant-select-selection-placeholder]:!leading-7 [&_.ant-select-selection-placeholder]:!pt-0 [&_.ant-select-selection-item]:!text-[#161A2C] [&_.ant-select-selection-item]:!leading-7 [&_.ant-select-selection-item]:!pt-0 [&.ant-select]:!h-12 [&.ant-select-focused_.ant-select-selector]:!border-[#574CFF] [&.ant-select-focused_.ant-select-selector]:!shadow-[0_0_0_2px_rgba(87,76,255,0.1)] [&.ant-select-focused_.ant-select-selector]:!bg-[#F5F5F7] [&.ant-select-open_.ant-select-selector]:!bg-[#F5F5F7]"
              placeholder="Select employee"
              options={employeeOptions}
              onChange={handleEmployeeChange}
              value={getSelectedEmployeeValue()}
              loading={!employeeData}
              size="large"
              showSearch
              optionFilterProp="label"
              filterOption={(input, option) =>
                (option?.label?.toString().toLowerCase().includes(input.toLowerCase())) ?? false
              }
              notFoundContent={!employeeData ? 'Loading...' : 'No employees found'}
            />
            <div className="hidden md:contents">
              <Select
                className="w-full min-w-[160px] flex-1 md:w-auto [&_.ant-select-selector]:!border-[#E5E7EB] [&_.ant-select-selector]:!rounded-lg [&_.ant-select-selector]:!bg-[#F5F5F7] [&_.ant-select-selector]:!py-2.5 [&_.ant-select-selector]:!px-3 [&_.ant-select-selector]:!min-h-[48px] [&_.ant-select-selector]:!h-12 [&_.ant-select-selection-placeholder]:!text-[#8F94A3] [&_.ant-select-selection-placeholder]:!leading-7 [&_.ant-select-selection-placeholder]:!pt-0 [&_.ant-select-selection-item]:!text-[#161A2C] [&_.ant-select-selection-item]:!leading-7 [&_.ant-select-selection-item]:!pt-0 [&.ant-select]:!h-12 [&.ant-select-focused_.ant-select-selector]:!border-[#574CFF] [&.ant-select-focused_.ant-select-selector]:!shadow-[0_0_0_2px_rgba(87,76,255,0.1)] [&.ant-select-focused_.ant-select-selector]:!bg-[#F5F5F7] [&.ant-select-open_.ant-select-selector]:!bg-[#F5F5F7]"
                placeholder="Plan type"
                options={planTypeOptions}
                onChange={handlePlanTypeChange}
                value={selectedPlanType}
                size="large"
              />
              <Select
                className="w-full min-w-[160px] flex-1 md:w-auto [&_.ant-select-selector]:!border-[#E5E7EB] [&_.ant-select-selector]:!rounded-lg [&_.ant-select-selector]:!bg-[#F5F5F7] [&_.ant-select-selector]:!py-2.5 [&_.ant-select-selector]:!px-3 [&_.ant-select-selector]:!min-h-[48px] [&_.ant-select-selector]:!h-12 [&_.ant-select-selection-placeholder]:!text-[#8F94A3] [&_.ant-select-selection-placeholder]:!leading-7 [&_.ant-select-selection-placeholder]:!pt-0 [&_.ant-select-selection-item]:!text-[#161A2C] [&_.ant-select-selection-item]:!leading-7 [&_.ant-select-selection-item]:!pt-0 [&.ant-select]:!h-12 [&.ant-select-focused_.ant-select-selector]:!border-[#574CFF] [&.ant-select-focused_.ant-select-selector]:!shadow-[0_0_0_2px_rgba(87,76,255,0.1)] [&.ant-select-focused_.ant-select-selector]:!bg-[#F5F5F7] [&.ant-select-open_.ant-select-selector]:!bg-[#F5F5F7]"
                placeholder="Department"
                options={departmentOptions}
                onChange={handleDepartmentChange}
                value={selectedDepartment || 'all'}
                size="large"
                showSearch
                optionFilterProp="label"
                filterOption={(input, option) =>
                  (option?.label?.toString().toLowerCase().includes(input.toLowerCase())) ?? false
                }
              />
            </div>
          </>
        )}
        <div className="hidden md:contents">
          <SessionFilter />
        </div>
        <Button
          className="md:hidden w-12 h-12 flex items-center justify-center border-[#E5E7EB] rounded-lg bg-[#F5F5F7]"
          icon={<IoMdSwitch size={20} />}
          onClick={() => setIsFilterModalOpen(true)}
        />
        <Tooltip
          title={
            !allUserPlanning || allUserPlanning.length === 0
              ? 'Please Create Plan First'
              : ''
          }
        >
          <div style={{ display: 'inline-block' }}>
            <CustomButton
              disabled={
                !allUserPlanning || allUserPlanning.length === 0
              }
              title={
                <span className="hidden sm:block">
                  {`Create ${activeTabName} Report`}
                </span>
              }
              id="createActiveTabName"
              icon={<FaPlus className="ml-2 sm:ml-0" />}
              onClick={() => setOpenReportModal(true)}
              className={`${!userPlanningPeriodId ? 'hidden' : ''} bg-blue-600 hover:bg-blue-700 w-10 h-10 sm:w-auto sm:min-w-[180px]`}
              loading={getUserPlanningLoading}
            />
          </div>
        </Tooltip>
      </div>

      <section className="mt-8">
        <div className="space-y-6">
          {getReportLoading ? (
            Array.from({ length: 3 }).map((_item, i) => <PlanCardSkeleton key={i} />)
          ) : (
            allReporting?.items?.map((dataItem: any) => {
              const cadence = activeTabName?.toLowerCase() as Cadence || 'weekly';
              const plan = transformReportToPlanSummary(dataItem, cadence, employeeData);

              return (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  viewMode="reporting"
                  activeCadence={cadence}
                  onApprove={() => handleApproveHandler(dataItem.id, true)}
                  onOpen={() => handleApproveHandler(dataItem.id, false)}
                  onEdit={() => {
                    setSelectedReportId(dataItem.id);
                    setSelectedPlanId(dataItem.planId);
                  }}
                  canApprove={userId === (getEmployeeData(dataItem?.userId ?? dataItem?.createdBy)?.reportingTo?.id || getEmployeeData(dataItem?.userId ?? dataItem?.createdBy)?.delegatedTo?.id)}
                  canEdit={userId === (dataItem?.userId ?? dataItem?.createdBy) && dataItem?.plan?.isReportValidated == false && isDataFromActiveSession(dataItem?.createdAt)}
                  isApprovalLoading={isApprovalLoading}
                  dateLabel={getDateLabel(dataItem?.createdAt, activeTabName)}
                />
              );
            })
          )}
        </div>
      </section>

      {isMobile || isTablet ? (
        <CustomMobilePagination
          totalResults={allReporting?.meta?.totalItems ?? 0}
          pageSize={pageSizeReporting}
          onChange={(page, pageSize) => {
            setPageReporting(page);
            setPageSizeReporting(pageSize);
          }}
          onShowSizeChange={(size) => {
            setPageSizeReporting(size);
            setPageReporting(1);
          }}
        />
      ) : (
        <CustomPagination
          total={allReporting?.meta?.totalItems}
          current={pageReporting}
          pageSize={pageSizeReporting}
          onShowSizeChange={(size) => {
            setPageSizeReporting(size);
            setPageReporting(1);
          }}
          onChange={(page, pageSize) => {
            setPageReporting(page);
            setPageSizeReporting(pageSize);
          }}
        />
      )}
      {allReporting?.items?.length <= 0 && (
        <div className="flex justify-center">
          <div>
            <p className="flex justify-center items-center h-[200px]">
              <Image
                src="/image/undraw_empty_re_opql 1.svg"
                width={300}
                height={300}
                alt="Picture of the author"
              />
            </p>
            <p className="flex justify-center items-center mt-4 text-xl text-gray-950 font-extrabold">
              There is no Reported data !!
            </p>
          </div>
        </div>
      )}
      <MobileFilterModal
        open={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApply={() => setIsFilterModalOpen(false)}
        planTypeOptions={planTypeOptions}
        selectedPlanType={selectedPlanType}
        onPlanTypeChange={handlePlanTypeChange}
        departmentOptions={departmentOptions}
        selectedDepartment={selectedDepartment}
        onDepartmentChange={handleDepartmentChange}
        showPlanType={hasPermission}
        showDepartment={hasPermission}
      />
    </div>
  );
}
export default Reporting;
