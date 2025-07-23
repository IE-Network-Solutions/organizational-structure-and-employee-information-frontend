'use client';
import { Spin, Tabs } from 'antd';
import React, { useEffect, useState } from 'react';
import ObjectiveCard from '../objectivecard';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
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
import dynamic from 'next/dynamic';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import { useIsMobile } from '@/hooks/useIsMobile';

// Dynamically import Tabs with no SSR to avoid hydration issues
const DynamicTabs = dynamic(() => Promise.resolve(Tabs), { ssr: false });

export default function OkrTab() {
  const [isMounted, setIsMounted] = useState(false);
  const { userId } = useAuthenticationStore();
  // const { data: departments } = useGetUserDepartment();
  const { data: departmentUsers } = useGetUserDepartment();
  const { data: userData } = useGetEmployee(userId);
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
    setTeamCurrentPage,
    setTeamPageSize,
    teamCurrentPage,
    teamPageSize,
    setCompanyCurrentPage,
    setCompanyPageSize,
    companyCurrentPage,
    companyPageSize,
    setOkrTab,
    okrTab,
  } = useOKRStore();
  const { isMobile, isTablet } = useIsMobile();
  const usersInDepartment =
    departmentUsers
      ?.find((i: any) => i.id == searchObjParams?.departmentId)
      ?.users?.map((user: any) => user.id) || [];

  const {
    data: userObjectives,
    isLoading,
    refetch: userRefetch,
  } = useGetUserObjective(
    userId,
    pageSize,
    currentPage,
    searchObjParams?.metricTypeId,
  );
  const {
    data: teamObjective,
    isLoading: teamLoading,
    refetch,
  } = useGetTeamObjective(
    teamPageSize,
    teamCurrentPage,
    users,
    searchObjParams.userId || userId, // Use current userId if searchObjParams.userId is empty
    searchObjParams?.metricTypeId || '', // Provide empty string as fallback
  );



  const {
    data: companyObjective,
    isLoading: companyLoading,
    refetch: CompanyRefetch,
  } = useGetCompanyObjective(
    userId,
    companyPageSize,
    companyCurrentPage,
    usersInDepartment,
    searchObjParams.userId,
    searchObjParams?.metricTypeId,
  );

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

  useEffect(() => {
    if (isMounted) {
      CompanyRefetch();
    }
  }, [companyPageSize, companyCurrentPage, isMounted]);

  // Return null or loading state during SSR
  if (!isMounted) {
    return (
      <div className="mt-6 flex justify-center items-center min-h-[200px]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="mt-6">
      <DynamicTabs
        defaultActiveKey="1"
        onChange={(key) => setOkrTab(key)}
        items={[
          {
            key: '1',
            label: 'My OKR',
            children: (
              <div>
                <OkrProgress />
                {isLoading && (
                  <Spin
                    size="large"
                    style={{ color: 'white' }}
                    className="text-white text-center flex w-full justify-center"
                  />
                )}
                {userObjectives?.items?.length !== 0 && (
                  <div>
                    {userObjectives?.items?.map((obj: any) => (
                      <ObjectiveCard
                        key={obj.id}
                        myOkr={true}
                        objective={obj}
                      />
                    ))}
                    {isMobile || isTablet ? (
                      <CustomMobilePagination
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
                  <div className="flex justify-center">
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
                    <div>
                      <OkrProgress />
                      {teamLoading && (
                        <Spin
                          size="large"
                          style={{ color: 'white' }}
                          className="text-white text-center flex w-full justify-center"
                        />
                      )}
                      {teamObjective?.items?.length !== 0 && (
                        <div>
                          {teamObjective?.items?.map((obj: any) => (
                            <ObjectiveCard
                              key={obj.id}
                              myOkr={false}
                              objective={obj}
                            />
                          ))}
                          {isMobile || isTablet ? (
                            <CustomMobilePagination
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
                        <div className="flex justify-center">
                          <EmptyImage />
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
                    <div>
                      {companyLoading && (
                        <Spin
                          size="large"
                          style={{ color: 'white' }}
                          className="text-white text-center flex w-full justify-center"
                        />
                      )}
                      <OkrProgress />
                      {companyObjective?.items?.length !== 0 && (
                        <div>
                          {companyObjective?.items?.map((obj: any) => (
                            <ObjectiveCard
                              key={obj.id}
                              myOkr={false}
                              objective={obj}
                            />
                          ))}
                          {isMobile || isTablet ? (
                            <CustomMobilePagination
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
                        <div className="flex justify-center">
                          <EmptyImage />
                        </div>
                      )}
                    </div>
                  ),
                },
                {
                  key: '4',
                  label: 'All Employee OKR',
                  children: (
                    <div>
                      <EmployeeOKRTable />
                    </div>
                  ),
                },
              ]
            : []),
        ]}
      />
    </div>
  );
}
