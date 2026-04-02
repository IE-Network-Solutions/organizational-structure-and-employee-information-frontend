'use client';
import { Button, Spin, Tabs } from 'antd';
import React, { useEffect, useState } from 'react';
import ObjectiveCard from '../objectivecard';
import ObjectiveBasic from '../objectiveBasic';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useIsBasicOkr } from '../../../_utils/okrMode';
import {
  useGetCompanyObjective,
  useGetTeamObjective,
  useGetUserObjective,
} from '@/store/server/features/okrplanning/okr/objective/queries';
import { useOKRStore } from '@/store/uistate/features/okrplanning/okr';
import { useGetUserDepartment } from '@/store/server/features/okrplanning/okr/department/queries';
import { useGetEmployee } from '@/store/server/features/employees/employeeDetail/queries';
import { EmptyImage } from '@/components/emptyIndicator';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import EmployeeOKRTable from '../EmployeeOkr';
import CustomPagination from '@/components/customPagination';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import { useIsMobile } from '@/hooks/useIsMobile';

const TAB_CONFIG = [
  { key: '1', label: 'My OKR' },
  { key: '2', label: 'Team OKR' },
  { key: '3', label: 'Company OKR' },
  { key: '4', label: 'All Employees OKR' },
];

const OKR_STATUS_PILLS = [
  { id: 'due-soon', label: 'Due Soon' },
  { id: 'not-started', label: 'Not Started' },
  { id: 'on-progress', label: 'On progress' },
  { id: 'completed', label: 'Completed' },
  { id: 'overdue', label: 'Overdue' },
] as const;

interface OkrTabProps {
  filterComponent?: React.ReactNode;
  'data-cy'?: string;
}

export default function OkrTab({
  filterComponent,
  'data-cy': dataCy,
}: OkrTabProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [activeKey, setActiveKey] = useState<string>('1');
  const [selectedStatusPill, setSelectedStatusPill] = useState<string | null>(
    null,
  );
  const { userId } = useAuthenticationStore();
  const { data: departmentUsers } = useGetUserDepartment();
  const { data: userData } = useGetEmployee(userId);
  const isBasicOkr = useIsBasicOkr();
  const departmentId = userData?.employeeJobInformation?.[0]?.departmentId;
  const users =
    departmentUsers
      ?.find((i: any) => i.id === departmentId)
      ?.users?.map((user: any) => user.id) || [];

  const {
    pageSize,
    setPageSize,
    currentPage,
    setCurrentPage,
    searchObjParams,
    fiscalYearId,
    sessionIds,
    setTeamCurrentPage,
    setTeamPageSize,
    teamCurrentPage,
    teamPageSize,
    setCompanyCurrentPage,
    setCompanyPageSize,
    companyCurrentPage,
    companyPageSize,
    okrTab,
    setOkrTab,
  } = useOKRStore();
  const { isMobile, isTablet } = useIsMobile();
  const usersInDepartment =
    departmentUsers
      ?.find((i: any) => i.id == searchObjParams?.departmentId)
      ?.users?.map((user: any) => user.id) || [];

  const {
    data: userObjectives,
    isLoading,
    isFetching: userFetching,
    refetch: userRefetch,
  } = useGetUserObjective(
    userId,
    pageSize,
    currentPage,
    searchObjParams?.metricTypeId,
    fiscalYearId,
    sessionIds,
  );
  const {
    data: teamObjective,
    isLoading: teamLoading,
    isFetching: teamFetching,
    refetch,
  } = useGetTeamObjective(
    teamPageSize,
    teamCurrentPage,
    users,
    searchObjParams.userId || userId, // Use current userId if searchObjParams.userId is empty
    searchObjParams?.metricTypeId || '', // Provide empty string as fallback
    fiscalYearId,
    sessionIds,
  );

  const {
    data: companyObjective,
    isLoading: companyLoading,
    isFetching: companyFetching,
    refetch: CompanyRefetch,
  } = useGetCompanyObjective(
    userId,
    companyPageSize,
    companyCurrentPage,
    usersInDepartment,
    searchObjParams.userId,
    searchObjParams?.metricTypeId,
    fiscalYearId,
    sessionIds,
  );

  const isUserLoading = isLoading || userFetching;
  const isTeamLoading = teamLoading || teamFetching;
  const isCompanyLoading = companyLoading || companyFetching;

  const canVieTeamOkr = AccessGuard.checkAccess({
    permissions: [Permissions.ViewTeamOkr],
  });
  const canVieCompanyOkr = AccessGuard.checkAccess({
    permissions: [Permissions.ViewCompanyOkr],
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      userRefetch();
    }
  }, [pageSize, currentPage, isMounted]);

  useEffect(() => {
    if (isMounted) {
      refetch();
    }
  }, [teamPageSize, teamCurrentPage, isMounted]);

  // Refetch Team OKR when year/session filters change
  useEffect(() => {
    if (isMounted) {
      refetch();
    }
  }, [fiscalYearId, sessionIds, isMounted]);

  useEffect(() => {
    if (isMounted) {
      CompanyRefetch();
    }
  }, [companyPageSize, companyCurrentPage, isMounted]);

  useEffect(() => {
    setActiveKey(String(okrTab));
  }, [okrTab]);

  // Return null or loading state during SSR
  if (!isMounted) {
    return (
      <div
        className="mt-6 flex justify-center items-center min-h-[200px]"
        data-cy="okr-tab-loading-container"
      >
        <Spin size="large" />
      </div>
    );
  }

  const handleTabChange = (key: string) => {
    setOkrTab(key);
    setActiveKey(key);
  };

  const visibleTabs = TAB_CONFIG.filter((tab) => {
    if (tab.key === '2' && !canVieTeamOkr) return false;
    if ((tab.key === '3' || tab.key === '4') && !canVieCompanyOkr) return false;
    return true;
  });

  const tabContent = [
    {
      key: '1',
      label: 'My OKR',
      children: (
        <div id="my-okr-tab-content" data-cy="okr-my-okr-tab-content">
          {isUserLoading && (
            <Spin
              data-cy="okr-my-okr-loading-spin"
              size="large"
              style={{ color: 'white' }}
              className="text-white text-center flex w-full justify-center"
            />
          )}
          {userObjectives?.items?.length !== 0 && (
            <div
              id="my-okr-objectives-list"
              data-cy="okr-my-okr-objectives-list"
            >
              {userObjectives?.items?.map((obj: any) =>
                isBasicOkr ? (
                  <ObjectiveBasic
                    data-cy={`okr-my-okr-objective-basic-card-${obj?.id}`}
                    key={obj.id}
                    myOkr={true}
                    objective={obj}
                  />
                ) : (
                  <ObjectiveCard
                    data-cy={`okr-my-okr-objective-card-${obj?.id}`}
                    key={obj.id}
                    myOkr={true}
                    objective={obj}
                  />
                ),
              )}
              {isMobile || isTablet ? (
                <CustomMobilePagination
                  data-cy="okr-my-okr-mobile-pagination"
                  totalResults={userObjectives?.meta?.totalItems ?? 0}
                  pageSize={pageSize}
                  currentPage={currentPage}
                  onChange={(page, pageSize) => {
                    setCurrentPage(page);
                    setPageSize(pageSize);
                  }}
                  onShowSizeChange={(size) => {
                    setPageSize(size);
                  }}
                />
              ) : (
                <CustomPagination
                  current={userObjectives?.meta?.currentPage || 1}
                  total={userObjectives?.meta?.totalItems || 1}
                  pageSize={pageSize}
                  onChange={(page, pageSize) => {
                    setCurrentPage(page);
                    setPageSize(pageSize);
                  }}
                  onShowSizeChange={(size) => {
                    setPageSize(size);
                    setCurrentPage(1);
                  }}
                />
              )}
            </div>
          )}
          {userObjectives?.items?.length === 0 && (
            <div
              id="my-okr-empty-state"
              data-cy="okr-my-okr-empty-state"
              className="flex justify-center"
            >
              <EmptyImage />
            </div>
          )}
        </div>
      ),
    },
    ...(canVieTeamOkr
      ? [
          {
            key: '2',
            label: 'Team OKR',
            children: (
              <div id="team-okr-tab-content" data-cy="okr-team-okr-tab-content">
                {isTeamLoading && (
                  <Spin
                    data-cy="okr-team-okr-loading-spin"
                    size="large"
                    style={{ color: 'white' }}
                    className="text-white text-center flex w-full justify-center"
                  />
                )}
                {teamObjective?.items?.length !== 0 && (
                  <div
                    id="team-okr-objectives-list"
                    data-cy="okr-team-okr-objectives-list"
                  >
                    {teamObjective?.items?.map((obj: any) =>
                      isBasicOkr ? (
                        <ObjectiveBasic
                          key={obj.id}
                          myOkr={false}
                          objective={obj}
                        />
                      ) : (
                        <ObjectiveCard
                          key={obj.id}
                          myOkr={false}
                          objective={obj}
                        />
                      ),
                    )}
                    {isMobile || isTablet ? (
                      <CustomMobilePagination
                        data-cy="okr-team-okr-mobile-pagination"
                        totalResults={teamObjective?.meta?.totalItems ?? 0}
                        pageSize={teamPageSize}
                        currentPage={teamCurrentPage}
                        onChange={(page, pageSize) => {
                          setTeamCurrentPage(page);
                          setTeamPageSize(pageSize);
                        }}
                        onShowSizeChange={(size) => {
                          setTeamPageSize(size);
                        }}
                      />
                    ) : (
                      <CustomPagination
                        data-cy="okr-team-okr-pagination"
                        current={teamObjective?.meta?.currentPage || 1}
                        total={teamObjective?.meta?.totalItems || 1}
                        pageSize={teamPageSize}
                        onChange={(page, pageSize) => {
                          setTeamCurrentPage(page);
                          setTeamPageSize(pageSize);
                        }}
                        onShowSizeChange={(size) => {
                          setTeamPageSize(size);
                          setTeamCurrentPage(1);
                        }}
                      />
                    )}
                  </div>
                )}
                {teamObjective?.items?.length === 0 && (
                  <div
                    id="team-okr-empty-state"
                    data-cy="okr-team-okr-empty-state"
                    className="flex justify-center"
                  >
                    <EmptyImage data-cy="okr-team-okr-empty-image" />
                  </div>
                )}
              </div>
            ),
          },
        ]
      : []),
    ...(canVieCompanyOkr
      ? [
          {
            key: '3',
            label: 'Company OKR',
            children: (
              <div
                id="company-okr-tab-content"
                data-cy="okr-company-okr-tab-content"
              >
                {isCompanyLoading && (
                  <Spin
                    data-cy="okr-company-okr-loading-spin"
                    size="large"
                    style={{ color: 'white' }}
                    className="text-white text-center flex w-full justify-center"
                  />
                )}
                {companyObjective?.items?.length !== 0 && (
                  <div
                    id="company-okr-objectives-list"
                    data-cy="okr-company-okr-objectives-list"
                  >
                    {companyObjective?.items?.map((obj: any) =>
                      isBasicOkr ? (
                        <ObjectiveBasic
                          data-cy={`okr-company-okr-objective-basic-card-${obj?.id}`}
                          key={obj.id}
                          myOkr={false}
                          objective={obj}
                        />
                      ) : (
                        <ObjectiveCard
                          data-cy={`okr-company-okr-objective-card-${obj?.id}`}
                          key={obj.id}
                          myOkr={false}
                          objective={obj}
                        />
                      ),
                    )}
                    {isMobile || isTablet ? (
                      <CustomMobilePagination
                        data-cy="okr-company-okr-mobile-pagination"
                        totalResults={companyObjective?.meta?.totalItems ?? 0}
                        pageSize={companyPageSize}
                        currentPage={companyCurrentPage}
                        onChange={(page, pageSize) => {
                          setCompanyCurrentPage(page);
                          setCompanyPageSize(pageSize);
                        }}
                        onShowSizeChange={(size) => {
                          setCompanyPageSize(size);
                        }}
                      />
                    ) : (
                      <CustomPagination
                        data-cy="okr-company-okr-pagination"
                        current={companyObjective?.meta?.currentPage || 1}
                        total={companyObjective?.meta?.totalItems || 1}
                        pageSize={companyPageSize}
                        onChange={(page, pageSize) => {
                          setCompanyCurrentPage(page);
                          setCompanyPageSize(pageSize);
                        }}
                        onShowSizeChange={(size) => {
                          setCompanyPageSize(size);
                          setCompanyCurrentPage(1);
                        }}
                      />
                    )}
                  </div>
                )}
                {companyObjective?.items?.length === 0 && (
                  <div
                    id="company-okr-empty-state"
                    data-cy="okr-company-okr-empty-state"
                    className="flex justify-center"
                  >
                    <EmptyImage data-cy="okr-company-okr-empty-image" />
                  </div>
                )}
              </div>
            ),
          },
          {
            key: '4',
            label: 'All Employees OKR',
            children: (
              <div
                id="all-employee-okr-tab-content"
                data-cy="okr-all-employee-okr-tab-content"
              >
                <EmployeeOKRTable data-cy="okr-all-employee-okr-table" />
              </div>
            ),
          },
        ]
      : []),
  ];

  const contentByKey = new Map(
    tabContent.map((entry) => [entry.key, entry.children]),
  );

  const tabItems = visibleTabs.map((tab) => ({
    key: tab.key,
    label: (
      <div
        className={`text-base font-normal m-0 ${
          activeKey === tab.key
            ? 'text-okr-primary font-semibold'
            : 'text-gray-800'
        }`}
        data-cy={`okr-tab-${tab.key}`}
        id={`okr-tab-label-${tab.key}`}
      >
        {tab.label}
      </div>
    ),
    children: contentByKey.get(tab.key) ?? null,
  }));

  return (
    <div id="okr-tab-container" data-cy={dataCy || 'okr-tab-container'}>
      <Tabs
        activeKey={activeKey}
        onChange={handleTabChange}
        items={tabItems}
        moreIcon={false}
        tabBarStyle={{
          marginBottom: 0,
          marginLeft: 0,
          paddingLeft: 0,
          paddingRight: 0,
        }}
        tabBarExtraContent={
          <div
            className="flex flex-wrap items-center justify-end gap-1 max-w-full"
            data-cy="okr-tab-bar-extra"
          >
            <div
              className="flex flex-wrap items-center gap-0.5"
              data-cy="okr-status-pills-row"
            >
              {OKR_STATUS_PILLS.map((pill) => {
                const isSelected = selectedStatusPill === pill.id;
                return (
                  <Button
                    key={pill.id}
                    type="default"
                    size="small"
                    data-cy={`okr-status-pill-${pill.id}`}
                    onClick={() =>
                      setSelectedStatusPill((prev) =>
                        prev === pill.id ? null : pill.id,
                      )
                    }
                    className={
                      isSelected
                        ? '!rounded-md !h-7 !min-h-0 !px-2 !py-0 !leading-none border-okr-primary text-okr-primary !bg-[#FAFAFA] hover:!bg-[#FAFAFA] hover:!border-okr-primary hover:!text-okr-primary'
                        : '!rounded-md !h-7 !min-h-0 !px-2 !py-0 !leading-none border-gray-200 text-gray-700 !bg-[#FAFAFA] hover:!bg-[#F0F0F0] hover:!border-gray-300 hover:!text-gray-800'
                    }
                  >
                    {pill.label}
                  </Button>
                );
              })}
            </div>
            {activeKey !== '4' ? (
              <div
                className="flex-shrink-0"
                data-cy="okr-filter-inline-container"
              >
                {filterComponent}
              </div>
            ) : null}
          </div>
        }
        className="[&_.ant-tabs-tab]:py-4 [&_.ant-tabs-tab-btn]:py-2 [&_.ant-tabs-nav]:mb-0 [&_.ant-tabs-nav-wrap]:!px-0 [&_.ant-tabs-nav-list]:!px-0 [&_.ant-tabs-nav-wrap]:before:!left-0 [&_.ant-tabs-nav-wrap]:after:!right-0 [&_.ant-tabs-content-holder]:mt-6"
        data-cy="okr-tabs"
        id="okr-tabs"
        destroyInactiveTabPane={false}
      />
    </div>
  );
}
