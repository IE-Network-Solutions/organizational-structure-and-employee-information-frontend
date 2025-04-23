'use client';
import { Spin, Tabs } from 'antd';
import React, { useEffect } from 'react';
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
import { combine } from 'zustand/middleware';

export default function OkrTab() {
  const { TabPane } = Tabs;
  const { userId } = useAuthenticationStore();
  const { data: departments } = useGetUserDepartment();
  const { data: departmentUsers } = useGetUserDepartment();
  const { data: userData } = useGetEmployee(userId);
  const departmentId = userData?.employeeJobInformation[0]?.departmentId;
  const users =
    departments
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
  } = useOKRStore();
  const usersInDepartment =
    departmentUsers
      ?.find((i: any) => i.id == searchObjParams?.departmentId)
      ?.users?.map((user: any) => user.id) || [];

  const { data: userObjectives, isLoading,  refetch:userRefetch } = useGetUserObjective(
    userId,
    pageSize,
    currentPage,
    searchObjParams?.metricTypeId,
  );
  const { data: teamObjective, isLoading: teamLoading,  refetch} = useGetTeamObjective(
    teamPageSize,
    teamCurrentPage,
    users,
    searchObjParams.userId,
    searchObjParams?.metricTypeId,
  );
  const { data: companyObjective, isLoading: companyLoading,  refetch:CompanyRefetch } =
    useGetCompanyObjective(
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
    userRefetch();
  }, [pageSize, currentPage]);
  useEffect(() => {
    refetch();
  }, [teamPageSize, teamCurrentPage]);
  useEffect(() => {
    CompanyRefetch();
  }, [companyPageSize, companyCurrentPage]);
  return (
    <div className="mt-6">
      <Tabs defaultActiveKey="1" onChange={(key) => setOkrTab(key)}>
        <TabPane tab="My OKR" key={1}>
          <OkrProgress />
          {isLoading && (
            <Spin
              size="large"
              style={{ color: 'white' }}
              className="text-white text-center flex w-full justify-center"
            />
          )}
          {userObjectives?.items?.length !== 0 ? (
            <>
            
              {userObjectives?.items?.map((obj: any) => (
                <ObjectiveCard key={obj.id} myOkr={true} objective={obj} />
              ))}

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
            </>
          ) : (
            <div className="flex justify-center">
              <EmptyImage />
            </div>
          )}
        </TabPane>
        {canVieTeamOkr && (
          <TabPane tab="Team OKR" key={2}>
            <OkrProgress />
            {teamLoading && (
            <Spin
              size="large"
              style={{ color: 'white' }}
              className="text-white text-center flex w-full justify-center"
            />
          )}
            {teamLoading && (
              <Spin
                size="large"
                style={{ color: 'white' }}
                className="text-white text-center flex w-full justify-center"
              />
            )}
            {teamObjective?.items?.length !== 0 ? (
              <>
                {teamObjective?.items?.map((obj: any) => (
                  <ObjectiveCard key={obj.id} myOkr={false} objective={obj} />
                ))}

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
              </>
            ) : (
              <div className="flex justify-center">
                <EmptyImage />
              </div>
            )}
          </TabPane>
        )}
        {canVieCompanyOkr && (
          <TabPane tab="Company OKR" key={3}>
              {companyLoading && (
            <Spin
              size="large"
              style={{ color: 'white' }}
              className="text-white text-center flex w-full justify-center"
            />
          )}
            <OkrProgress />
            {companyLoading && (
              <Spin
                size="large"
                style={{ color: 'white' }}
                className="text-white text-center flex w-full justify-center"
              />
            )}
            {companyObjective?.items?.length !== 0 ? (
              <>
                {companyObjective?.items?.map((obj: any) => (
                  <ObjectiveCard key={obj.id} myOkr={false} objective={obj} />
                ))}

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
              </>
            ) : (
              <div className="flex justify-center">
                <EmptyImage />
              </div>
            )}
          </TabPane>
        )}

        {canVieCompanyOkr && (
          <TabPane tab="All Employee OKR" key={4}>
            <EmployeeOKRTable />
          </TabPane>
        )}
      </Tabs>
    </div>
  );
}