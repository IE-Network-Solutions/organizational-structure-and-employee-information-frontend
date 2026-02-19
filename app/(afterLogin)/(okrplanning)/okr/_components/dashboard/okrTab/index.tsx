'use client';
import { Spin } from 'antd';
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
import OkrProgress from '../okrprogress';
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

interface OkrTabProps {
  filterComponent?: React.ReactNode;
  'data-cy'?: string;
}

export default function OkrTab({ filterComponent, 'data-cy': dataCy }: OkrTabProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [activeKey, setActiveKey] = useState<string>('1');
  const { userId } = useAuthenticationStore();
  const { data: departmentUsers } = useGetUserDepartment();
  const { data: userData } = useGetEmployee(userId);
  const isBasicOkr = useIsBasicOkr();
  const departmentId = userData?.employeeJobInformation[0]?.departmentId;
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
                    <div
                      id="team-okr-tab-content"
                      data-cy="okr-team-okr-tab-content"
                    >
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
                              totalResults={
                                teamObjective?.meta?.totalItems ?? 0
                              }
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
                              totalResults={
                                companyObjective?.meta?.totalItems ?? 0
                              }
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

  const currentContent = tabContent.find((t) => t.key === activeKey)?.children;

  return (
    <div id="okr-tab-container" data-cy={dataCy || 'okr-tab-container'}>
      {activeKey !== '4' && <OkrProgress data-cy="okr-progress" />}
      <div className="flex justify-between items-center gap-3 border-b border-gray-200 mb-6">
        <div className="flex space-x-6 flex-1 min-w-0 overflow-x-auto pb-px">
          {visibleTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => handleTabChange(tab.key)}
              className={`whitespace-nowrap py-3 px-1 text-sm font-medium transition-colors border-b-2 ${
                activeKey === tab.key
                  ? 'border-okr-primary text-okr-primary font-semibold'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              data-cy={`okr-tab-${tab.key}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {activeKey !== '4' && (
          <div className="flex-shrink-0" data-cy="okr-filter-inline-container">
            {filterComponent}
          </div>
        )}
      </div>
      <div id="okr-tabs" data-cy="okr-tabs" className="mt-6">
        {currentContent}
      </div>
    </div>
  );
}
