import CustomButton from '@/components/common/buttons/customButton';
import {
  Button,
  Tooltip,
  Select,
} from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import SessionFilter from '../filters/SessionFilter';
import MobileFilterModal from '../filters/MobileFilterModal';
import { FaPlus } from 'react-icons/fa';
import { IoMdSwitch } from 'react-icons/io';
import {
  AllPlanningPeriods,
  useDefaultPlanningPeriods,
  useGetPlanning,
  useGetPlanningPeriodsHierarchy,
  useGetUserPlanning,
} from '@/store/server/features/okrPlanningAndReporting/queries';
import { useGetFiscalYearById } from '@/store/server/features/organizationStructure/fiscalYear/queries';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import {
  useApprovalPlanningPeriods,
  // useDeletePlanById,
} from '@/store/server/features/okrPlanningAndReporting/mutations';
import { useGetDepartmentsWithUsers } from '@/store/server/features/employees/employeeManagment/department/queries';
import { useFetchObjectives } from '@/store/server/features/employees/planning/queries';
import dayjs from 'dayjs';
import { groupPlanTasksByKeyResultAndMilestone } from '../dataTransformer/plan';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { PlanningAndReportingStore } from '@/store/uistate/features/planningAndReporting/useStore';
import Image from 'next/image';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import { useIsMobile } from '@/hooks/useIsMobile';
import CustomPagination from '@/components/customPagination';
import PlanCard from '../cards/PlanCard';
import PlanCardSkeleton from '../cards/PlanCardSkeleton';
import { transformToPlanSummary } from '../dataTransformer/vamp';
import { ViewMode, Cadence } from '../types';

function Planning() {
  const {
    setOpen,
    selectedUser,
    setSelectedUser,
    activePlanPeriod,
    setSelectedPlanId,
    setEditing,
    page,
    setPage,
    pageSize,
    setPageSize,
    activeTab,
    activePlanPeriodId,
    selectedSessionIds,
    selectedFiscalYearId,
    allSessionsOfYear,
  } = PlanningAndReportingStore();
  const { data: employeeData } = useGetAllUsers();
  const { isMobile, isTablet } = useIsMobile();
  const { userId } = useAuthenticationStore();
  const [selectedDepartment, setSelectedDepartment] = useState<string | undefined>(undefined);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedPlanType, setSelectedPlanType] = useState<string>('all');
  const { data: selectedFiscalYear } = useGetFiscalYearById(
    selectedFiscalYearId || '',
  );
  const { mutate: approvalPlanningPeriod, isLoading: isApprovalLoading } =
    useApprovalPlanningPeriods();
  const { data: departmentData } = useGetDepartmentsWithUsers();
  const { data: planningPeriods } = useDefaultPlanningPeriods();
  const { data: userPlanningPeriods } = AllPlanningPeriods();

  // const hasPermission = AccessGuard.checkAccess({
  //   permissions: [
  //     Permissions.ViewDailyPlan,
  //     Permissions.ViewWeeklyPlan,
  //     Permissions.ViewMonthlyPlan,
  //   ],
  // });

  const getPlanningPeriodDetail = (id: string) => {
    const planningPeriodDetail = planningPeriods?.items?.find(
      (period: any) => period?.id === id,
    );
    return planningPeriodDetail || {}; // Return an empty object if planningPeriodDetail is undefined
  };
  // const planningPeriod = [...(planningPeriods?.items ?? [])].reverse();

  // const { mutate: handleDeletePlan, isLoading: loadingDeletePlan } =
  //   useDeletePlanById();
  const { data: objective } = useFetchObjectives(userId);
  // const planningPeriodId = planningPeriod?.[activePlanPeriod - 1]?.id;
  const planningPeriodId =
    activePlanPeriodId || userPlanningPeriods?.[activePlanPeriod - 1]?.id;
  // const userPlanningPeriodId =userPlanningPeriods?.[activePlanPeriod - 1]?.planningPeriodId;
  const userPlanningPeriodId = userPlanningPeriods?.find(
    (item) => item?.planningPeriodId === planningPeriodId,
  )?.planningPeriodId;

  const { data: allPlanning, isLoading: getPlanningLoading } = useGetPlanning({
    userId: selectedUser,
    planPeriodId: planningPeriodId ?? '',
    page,
    pageSize,
    // If no sessions selected but year is selected, send all sessions
    // If sessions are selected, send only those
    sessionId:
      selectedSessionIds.length > 0
        ? selectedSessionIds
        : allSessionsOfYear.length > 0
          ? allSessionsOfYear
          : [],
  });
  const { data: allUserPlanning } = useGetUserPlanning(
    planningPeriodId ?? '',
    activeTab.toString(),
  );

  useEffect(() => {
    setPage(1);
    setPageSize(10);
  }, [activeTab, setPage, setPageSize]);

  // Helper function to get user IDs by department
  const getUserIdsByDepartmentId = (departmentId: string) => {
    const department = departmentData?.find((dep: any) => dep.id === departmentId);
    if (department && department.users) {
      return department.users.map((user: any) => user.id);
    }
    return [];
  };

  // Build employee options from real data - filter by selected department
  const employeeOptions = useMemo(() => {
    const options = [{ label: 'All employees', value: 'all' }];
    if (employeeData?.items) {
      let employeesToShow = employeeData.items;
      
      // If a department is selected, filter employees by that department
      if (selectedDepartment && selectedDepartment !== 'all') {
        const departmentUserIds = getUserIdsByDepartmentId(selectedDepartment);
        employeesToShow = employeeData.items.filter((emp: any) => 
          departmentUserIds.includes(emp.id)
        );
      }
      
      employeesToShow.forEach((emp: any) => {
        const name = `${emp.firstName || ''} ${emp.middleName || ''} ${emp.lastName || ''}`.trim();
        if (name) {
          options.push({ label: name, value: emp.id });
        }
      });
    }
    return options;
  }, [employeeData, selectedDepartment, departmentData]);

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
    setSelectedDepartment(value);

    if (value === 'all') {
      // If department is 'all', restore based on plan type
      if (selectedPlanType === 'all') {
        setSelectedUser(['all']);
      } else if (selectedPlanType === 'myPlan') {
        setSelectedUser([userId]);
      } else if (selectedPlanType === 'subordinatePlan') {
        const subordinates = employeeData?.items
          ?.filter(
            (employee: any) =>
              (employee?.delegatedTo?.id || employee.reportingTo?.id) === userId,
          )
          .map((employee: any) => employee.id) || [];
        setSelectedUser(subordinates.length > 0 ? ['subordinate', ...subordinates] : ['subordinate']);
      }
    } else {
      // Apply department filter while preserving plan type
      const departmentUserIds = getUserIdsByDepartmentId(value);
      
      if (selectedPlanType === 'all') {
        setSelectedUser(departmentUserIds.length > 0 ? departmentUserIds : []);
      } else if (selectedPlanType === 'myPlan') {
        // Only include current user if they're in the selected department
        const userInDepartment = departmentUserIds.includes(userId);
        setSelectedUser(userInDepartment ? [userId] : []);
      } else if (selectedPlanType === 'subordinatePlan') {
        // Filter subordinates within the selected department
        const subordinates = employeeData?.items
          ?.filter(
            (employee: any) =>
              (employee?.delegatedTo?.id || employee.reportingTo?.id) === userId &&
              departmentUserIds.includes(employee.id),
          )
          .map((employee: any) => employee.id) || [];
        setSelectedUser(subordinates.length > 0 ? ['subordinate', ...subordinates] : ['subordinate']);
      }
    }
  };

  const transformedData = groupPlanTasksByKeyResultAndMilestone(
    allPlanning?.items ?? [],
  );

  // const activeTabName = planningPeriod?.[activePlanPeriod - 1]?.name;
  const activeTabName = getPlanningPeriodDetail(planningPeriodId ?? '')?.name;

  // Transform to PlanSummary format for vamp view
  // Transform even if employeeData is not ready - UserInfo will show skeleton
  const planSummaries = useMemo(() => {
    return transformedData?.map((dataItem: any) => {
      const cadence = activeTabName?.toLowerCase() as Cadence || 'weekly';
      return transformToPlanSummary(dataItem, 'planning' as ViewMode, cadence, employeeData);
    }) || [];
  }, [transformedData, employeeData, activeTabName]);

  const handleApproveHandler = (id: string, value: boolean) => {
    const data = {
      id: id,
      value: value,
    };
    approvalPlanningPeriod(data);
  };

  const getEmployeeData = (id: string) => {
    const employeeDataDetail = employeeData?.items?.find(
      (emp: any) => emp?.id === id,
    );

    return employeeDataDetail || {}; // Return an empty object if employeeDataDetail is undefined
  };
  const { data: planningPeriodHierarchy, isLoading } =
    useGetPlanningPeriodsHierarchy(
      userId,
      planningPeriodId || '', // Provide a default string value if undefined
    );

  const isActive = planningPeriodHierarchy?.parentPlan
    ? (planningPeriodHierarchy?.parentPlan?.plans?.length ?? 0) === 0 ||
    (planningPeriodHierarchy?.parentPlan?.plans?.filter(
      (i: any) => !i.isReported,
    ).length ?? 0) === 0
    : false;

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

  const getDateLabel = (createdAt: string, activeTabName: string): string => {
    const planDate = dayjs(createdAt);
    const today = dayjs();

    if (planDate.isSame(today, 'day') && activeTabName === 'Daily') {
      return "Today's Plan";
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
            id="planning-plan-type-select"
            data-cy="planning-plan-type-select"
            className="w-full min-w-[160px] flex-1 md:w-auto [&_.ant-select-selector]:!border-[#E5E7EB] [&_.ant-select-selector]:!rounded-lg [&_.ant-select-selector]:!bg-[#F5F5F7] [&_.ant-select-selector]:!py-2.5 [&_.ant-select-selector]:!px-3 [&_.ant-select-selector]:!min-h-[48px] [&_.ant-select-selector]:!h-12 [&_.ant-select-selection-placeholder]:!text-[#8F94A3] [&_.ant-select-selection-placeholder]:!leading-7 [&_.ant-select-selection-placeholder]:!pt-0 [&_.ant-select-selection-item]:!text-[#161A2C] [&_.ant-select-selection-item]:!leading-7 [&_.ant-select-selection-item]:!pt-0 [&.ant-select]:!h-12 [&.ant-select-focused_.ant-select-selector]:!border-[#574CFF] [&.ant-select-focused_.ant-select-selector]:!shadow-[0_0_0_2px_rgba(87,76,255,0.1)] [&.ant-select-focused_.ant-select-selector]:!bg-[#F5F5F7] [&.ant-select-open_.ant-select-selector]:!bg-[#F5F5F7]"
            placeholder="Plan type"
            options={planTypeOptions}
            onChange={handlePlanTypeChange}
            value={selectedPlanType}
            size="large"
          />
          <Select
            id="planning-department-select"
            data-cy="planning-department-select"
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
          <SessionFilter />
        </div>
        <Button
          id="planning-mobile-filter-button"
          data-cy="planning-mobile-filter-button"
          className="md:hidden w-12 h-12 flex items-center justify-center border-[#E5E7EB] rounded-lg bg-[#F5F5F7]"
          icon={<IoMdSwitch size={20} />}
          onClick={() => setIsFilterModalOpen(true)}
        />
        <Tooltip
          title={
            allUserPlanning?.length != 0
              ? `Report planned tasks before you create ${activeTabName} plan`
              : objective?.items?.length === 0
                ? 'Create Objective before you Plan'
                : planningPeriodHierarchy?.parentPlan?.plans?.length == 0 ||
                  planningPeriodHierarchy?.parentPlan?.plans?.filter(
                    (i: any) => i.isReported === false,
                  )?.length == 0
                  ? `Please create ${planningPeriodHierarchy?.parentPlan?.name} Plan before creating ${activeTabName} Plan`
                  : ''
          }
        >
          <div style={{ display: 'inline-block' }}>
            {userPlanningPeriodId && (
              <CustomButton
                disabled={
                  (allUserPlanning && allUserPlanning.length > 0) ||
                  isActive ||
                  (objective?.items?.length ?? 0) === 0
                }
                loading={isLoading}
                title={
                  <span className="hidden sm:block">
                    {`Create ${activeTabName} Plan`}
                  </span>
                }
                id="createActiveTabName"
                icon={<FaPlus className="ml-2 sm:ml-0" />}
                onClick={() => setOpen(true)}
                className={`${!userPlanningPeriodId ? 'hidden' : ''} bg-blue-600 hover:bg-blue-700 w-10 h-10 sm:w-auto sm:min-w-[180px]`}
              />
            )}
          </div>
        </Tooltip>
      </div>

      <section className="mt-8">
        <div className="space-y-6">
          {getPlanningLoading ? (
            Array.from({ length: 3 }).map((unusedItem, i) => <PlanCardSkeleton key={i} />)
          ) : (
            planSummaries.map((plan: any) => {
              // Get original dataItem for actions
              const originalDataItem = transformedData?.find((item: any) => item.id === plan.id);
              if (!originalDataItem) return null;

              return (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  viewMode="planning"
                  activeCadence={activeTabName?.toLowerCase() as Cadence || 'weekly'}
                  // Pass action handlers as props if needed
                  onApprove={() => handleApproveHandler(originalDataItem.id, true)}
                  onOpen={() => handleApproveHandler(originalDataItem.id, false)}
                  onEdit={() => {
                    setEditing(true);
                    setSelectedPlanId(originalDataItem.id);
                    setOpen(true);
                  }}
                  canApprove={userId === (getEmployeeData(originalDataItem?.userId)?.delegatedTo?.id || getEmployeeData(originalDataItem?.userId)?.reportingTo?.id)}
                  canEdit={userId === originalDataItem?.userId && originalDataItem?.isValidated == false && originalDataItem?.isReported == false && isDataFromActiveSession(originalDataItem?.createdAt)}
                  isApprovalLoading={isApprovalLoading}
                  dateLabel={getDateLabel(originalDataItem?.createdAt, activeTabName)}
                />
              );
            })
          )}
        </div>
      </section>
      {isMobile || isTablet ? (
        <CustomMobilePagination
          totalResults={allPlanning?.meta?.totalItems ?? 0}
          pageSize={pageSize}
          onChange={(page, pageSize) => {
            setPage(page);
            setPageSize(pageSize);
          }}
          onShowSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
        />
      ) : (
        <CustomPagination
          current={page}
          total={allPlanning?.meta?.totalItems || 1}
          pageSize={pageSize}
          onChange={(page, pageSize) => {
            setPage(page);
            setPageSize(pageSize);
          }}
          onShowSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
        />
      )}
      {/* <Pagination
          disabled={!allPlanning?.items?.length} // Ensures no crash if items is undefined
          className="flex justify-end"
            total={allPlanning?.meta?.totalItems} // Ensures total count instead of pages
          current={page}
          pageSize={pageSize} // Dynamically control page size
          showSizeChanger // Allows user to change page size
          onChange={(page, pageSize) => {
            setPage(page);
            setPageSize(pageSize); // Ensure page size updates dynamically
          }}
          pageSizeOptions={['10', '20', '50', '100']}
        /> */}

      {transformedData?.length <= 0 && (
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
              There is no Planned data !!
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
      />
    </div>
  );
}
export default Planning;
