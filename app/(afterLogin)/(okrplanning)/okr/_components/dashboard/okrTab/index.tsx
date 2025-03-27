'use client';
import { Spin, Tabs } from 'antd';
import React from 'react';
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
import CustomPagination from '@/components/customPagination';

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

  const { data: userObjectives, isLoading } = useGetUserObjective(
    userId,
    pageSize,
    currentPage,
    searchObjParams?.metricTypeId,
  );
  const { data: teamObjective, isLoading: teamLoading } = useGetTeamObjective(
    teamPageSize,
    teamCurrentPage,
    users,
    searchObjParams.userId,
    searchObjParams?.metricTypeId,
  );
  const { data: companyObjective, isLoading: companyLoading } =
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

  const onPageChange = (page: number, pageSize?: number) => {
    setCurrentPage(page);
    if (pageSize) {
      setPageSize(pageSize);
    }
  };
  const onTeamPageChange = (page: number, pageSize?: number) => {
    setTeamCurrentPage(page);
    if (pageSize) {
      setTeamPageSize(pageSize);
    }
  };
  const onCompanyPageChange = (page: number, pageSize?: number) => {
    setCompanyCurrentPage(page);
    if (pageSize) {
      setCompanyPageSize(pageSize);
    }
  };
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
                onChange={onPageChange}
                onShowSizeChange={onPageChange}
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
            {teamObjective?.items?.length !== 0 ? (
              <>
                {teamObjective?.items?.map((obj: any) => (
                  <ObjectiveCard key={obj.id} myOkr={false} objective={obj} />
                ))}

                <CustomPagination
                  current={teamObjective?.meta?.currentPage || 1}
                  total={teamObjective?.meta?.totalItems || 1}
                  pageSize={pageSize}
                  onChange={onTeamPageChange}
                  onShowSizeChange={onTeamPageChange}
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
                  pageSize={pageSize}
                  onChange={onCompanyPageChange}
                  onShowSizeChange={onCompanyPageChange}
                />
              </>
            ) : (
              <div className="flex justify-center">
                <EmptyImage />
              </div>
            )}
          </TabPane>
        )}
      </Tabs>
    </div>
  );
}
