import React, { useEffect, useMemo, useCallback } from 'react';
import { Table, Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useOKRStore } from '@/store/uistate/features/okrplanning/okr';
import { useGetEmployeeOkr } from '@/store/server/features/okrplanning/okr/objective/queries';
import { useGetEmployee } from '@/store/server/features/employees/employeeManagment/queries';
import { LoadingOutlined } from '@ant-design/icons';
import { useGetSessionById } from '@/store/server/features/payroll/payroll/queries';
import CustomPagination from '@/components/customPagination';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import { useIsMobile } from '@/hooks/useIsMobile';

// Memoized score tag component to prevent unnecessary re-renders
const ScoreTag = React.memo(({ score }: { score: number }): JSX.Element => {
  if (score >= 90)
    return (
      <span className="block w-24 text-center bg-green-100 text-green-600 px-3 py-1 rounded-full text-xs font-semibold">
        {score?.toLocaleString()}%
      </span>
    );
  if (score >= 75)
    return (
      <span className="block w-24 text-center bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-semibold">
        {score?.toLocaleString()}%
      </span>
    );
  return (
    <span className="block w-24 text-center bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-semibold">
      {score?.toLocaleString()}%
    </span>
  );
});

// Memoized employee details component to prevent unnecessary re-renders
const EmployeeDetails = React.memo(
  ({ empId, type }: { empId: string; type: string }) => {
    const { data: userDetails, isLoading, error } = useGetEmployee(empId);

    if (isLoading)
      return (
        <>
          <LoadingOutlined />
        </>
      );

    if (error || !userDetails) return '-';

    const userName =
      `${userDetails?.firstName} ${userDetails?.middleName} ${userDetails?.lastName} ` ||
      '-';
    const email = `${userDetails?.email} ` || '-';
    const profileImage = userDetails?.profileImage;
    const jobPosition =
      `${userDetails?.employeeJobInformation[0]?.position?.name} ` || '-';
    const department =
      `${userDetails?.employeeJobInformation[0]?.department?.name} ` || '-';
    return (
      <>
        {type === 'user' ? (
          <div className="flex gap-2">
            <Avatar src={profileImage} icon={<UserOutlined />} />
            <div>
              {userName}
              <div className="text-xs text-gray-500">{email}</div>
            </div>
          </div>
        ) : (
          <span className="text-xs text-gray-500">
            {type == 'job' ? jobPosition : department}
          </span>
        )}
      </>
    );
  },
);

// Memoized session detail component to prevent unnecessary re-renders
const SessionDetail = React.memo(({ sessionId }: { sessionId: string[] }) => {
  const { data: session, isLoading, error } = useGetSessionById(sessionId);

  if (isLoading)
    return (
      <>
        <LoadingOutlined />
      </>
    );

  if (error || !session) return '-';

  const sessionName = `${session?.name}` || '-';

  return <span className="text-xs text-gray-500">{sessionName}</span>;
});

const EmployeeOKRTable: React.FC = () => {
  const {
    searchObjParams,
    sessionIds,
    employeePageSize,
    employeeCurrentPage,
    setEmployeePageSize,
    setEmployeeCurrentPage,
  } = useOKRStore();

  const {
    data: employeeOkr,
    isLoading,
    refetch,
  } = useGetEmployeeOkr(
    sessionIds,
    searchObjParams,
    employeePageSize,
    employeeCurrentPage,
  );

  const { isMobile, isTablet } = useIsMobile();

  // Memoize columns to prevent unnecessary re-renders
  const columns = useMemo(
    () => [
      {
        title: 'Employee Name',
        dataIndex: 'userId',
        key: 'userId',
        render: (userId: string) => (
          <EmployeeDetails type="user" empId={userId} />
        ),
      },
      {
        title: 'Job Title',
        dataIndex: 'title',
        key: 'title',
        render: (notused: any, render: any) => (
          <EmployeeDetails type="job" empId={render?.userId} />
        ),
      },
      {
        title: 'Department',
        dataIndex: 'department',
        key: 'department',
        render: (notused: any, render: any) => (
          <EmployeeDetails type="department" empId={render?.userId} />
        ),
      },
      {
        title: 'Quarter',
        dataIndex: 'quarter',
        key: 'quarter',
        render: (notused: any, render: any) => (
          <SessionDetail sessionId={render?.sessionId} />
        ),
      },
      {
        title: 'OKR Score',
        dataIndex: 'okrScore',
        key: 'okrScore',
        render: (score: number) => <ScoreTag score={score} />,
      },
    ],
    [],
  );

  // Memoize data source to prevent unnecessary re-renders
  const dataSource = useMemo(
    () => (Array.isArray(employeeOkr?.items) ? employeeOkr?.items : []),
    [employeeOkr?.items],
  );

  // Memoize pagination change handler
  const onPageChange = useCallback(
    (page: number, pageSize?: number) => {
      setEmployeeCurrentPage(page);
      if (pageSize) {
        setEmployeePageSize(pageSize);
      }
    },
    [setEmployeeCurrentPage, setEmployeePageSize],
  );

  useEffect(() => {
    refetch();
  }, [sessionIds, refetch]);

  return (
    <div className="py-6">
      <Table
        columns={columns}
        dataSource={dataSource}
        pagination={false}
        loading={isLoading}
        scroll={{ y: 400 }} // Add vertical scrolling with fixed height
        rowKey="id" // Ensure each row has a unique key
      />

      {isMobile || isTablet ? (
        <CustomMobilePagination
          totalResults={employeeOkr?.meta?.totalItems ?? 0}
          pageSize={employeePageSize}
          onChange={onPageChange}
          onShowSizeChange={onPageChange}
        />
      ) : (
        <CustomPagination
          current={employeeOkr?.meta?.currentPage ?? 0}
          total={employeeOkr?.meta?.totalItems ?? 0}
          pageSize={employeePageSize}
          onChange={onPageChange}
          onShowSizeChange={(pageSize) => setEmployeePageSize(pageSize)}
        />
      )}
    </div>
  );
};

ScoreTag.displayName = 'ScoreTag';
EmployeeDetails.displayName = 'EmployeeDetails';
SessionDetail.displayName = 'SessionDetail';

export default React.memo(EmployeeOKRTable);
