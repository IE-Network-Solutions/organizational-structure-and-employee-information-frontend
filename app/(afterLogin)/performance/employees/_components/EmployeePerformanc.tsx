import React, { useEffect, useMemo, useCallback } from 'react';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useOKRStore } from '@/store/uistate/features/okrplanning/okr';
import { useGetEmployeeOkr } from '@/store/server/features/okrplanning/okr/objective/queries';
import { useGetEmployee } from '@/store/server/features/employees/employeeManagment/queries';
import { LoadingOutlined } from '@ant-design/icons';
import { useGetSessionById } from '@/store/server/features/payroll/payroll/queries';
import CustomPagination from '@/components/customPagination';
import { TableSkeleton } from '@/components/tableSkeleton';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import { useIsMobile } from '@/hooks/useIsMobile';
import OkrSearch from '@/app/(afterLogin)/(okrplanning)/okr/_components/dashboard/searchfilter';

// ---------------------------------------------------------------------------
// TEMP: Mock table data for UI preview. Set to false or remove this block when
// real API data should be used again (search "MOCK_EMPLOYEE_PERFORMANCE" to
// delete all related code).
// ---------------------------------------------------------------------------
const USE_MOCK_EMPLOYEE_PERFORMANCE_DATA = false;

type MockPerformanceRow = {
  id: string;
  employee: string;
  jobTitle: string;
  quarter: string;
  department: string;
  okrScore: number;
};

const MOCK_EMPLOYEE_PERFORMANCE_ROWS: MockPerformanceRow[] = [
  {
    id: 'mock-1',
    employee: 'Robel Zeleke',
    jobTitle: 'Software Developer',
    quarter: 'FY-2018 Q1',
    department: 'Software Development',
    okrScore: 90,
  },
  {
    id: 'mock-2',
    employee: 'Sara Mengistu',
    jobTitle: 'Product Designer',
    quarter: 'FY-2018 Q1',
    department: 'Product',
    okrScore: 88,
  },
  {
    id: 'mock-3',
    employee: 'Daniel Haile',
    jobTitle: 'Engineering Manager',
    quarter: 'FY-2018 Q2',
    department: 'Engineering',
    okrScore: 92,
  },
  {
    id: 'mock-4',
    employee: 'Hanna Tesfaye',
    jobTitle: 'QA Engineer',
    quarter: 'FY-2018 Q2',
    department: 'Quality Assurance',
    okrScore: 76,
  },
  {
    id: 'mock-5',
    employee: 'Yonas Alemayehu',
    jobTitle: 'Software Developer',
    quarter: 'FY-2018 Q3',
    department: 'Software Development',
    okrScore: 84,
  },
  {
    id: 'mock-6',
    employee: 'Meron Getachew',
    jobTitle: 'Data Analyst',
    quarter: 'FY-2018 Q3',
    department: 'Analytics',
    okrScore: 71,
  },
  {
    id: 'mock-7',
    employee: 'Tekle Wolde',
    jobTitle: 'DevOps Engineer',
    quarter: 'FY-2018 Q4',
    department: 'Platform',
    okrScore: 95,
  },
  {
    id: 'mock-8',
    employee: 'Liya Bekele',
    jobTitle: 'Product Designer',
    quarter: 'FY-2018 Q4',
    department: 'Product',
    okrScore: 82,
  },
  {
    id: 'mock-9',
    employee: 'Henok Girma',
    jobTitle: 'Software Developer',
    quarter: 'FY-2018 Q1',
    department: 'Software Development',
    okrScore: 68,
  },
  {
    id: 'mock-10',
    employee: 'Selamawit Assefa',
    jobTitle: 'Scrum Master',
    quarter: 'FY-2018 Q2',
    department: 'Delivery',
    okrScore: 79,
  },
  {
    id: 'mock-11',
    employee: 'Binyam Tadesse',
    jobTitle: 'Tech Lead',
    quarter: 'FY-2018 Q3',
    department: 'Software Development',
    okrScore: 91,
  },
  {
    id: 'mock-12',
    employee: 'Eden Solomon',
    jobTitle: 'UX Researcher',
    quarter: 'FY-2018 Q4',
    department: 'Product',
    okrScore: 86,
  },
];
// ---------------------------------------------------------------------------

// Memoized score tag component to prevent unnecessary re-renders
const ScoreTag = React.memo(({ score }: { score: number }): JSX.Element => {
  return (
    <span
      className="inline-flex w-[29px] h-[22px] justify-center rounded-md border border-gray-200 bg-gray-100  text-center text-xs font-medium text-black/70 py-0.5"
      data-cy={`performance-employee-okr-score-tag-${score}`}
    >
      {score?.toLocaleString()}
    </span>
  );
});
ScoreTag.displayName = 'ScoreTag';

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
    const jobPosition =
      `${userDetails?.employeeJobInformation[0]?.position?.name} ` || '-';
    const department =
      `${userDetails?.employeeJobInformation[0]?.department?.name} ` || '-';
    return (
      <>
        {type === 'user' ? (
          <span
            className="text-sm text-gray-900"
            data-cy="employee-okr-user-details"
          >
            {userName}
          </span>
        ) : (
          <span
            className="text-sm text-gray-900"
            data-cy={`employee-okr-${type}-info`}
          >
            {type == 'job' ? jobPosition : department}
          </span>
        )}
      </>
    );
  },
);
EmployeeDetails.displayName = 'EmployeeDetails';

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

  return (
    <span className="text-sm text-gray-900" data-cy="employee-okr-session-name">
      {sessionName}
    </span>
  );
});
SessionDetail.displayName = 'SessionDetail';

export default function EmployeePerformanceTable() {
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
    undefined,
    { enabled: !USE_MOCK_EMPLOYEE_PERFORMANCE_DATA },
  );

  const { isMobile, isTablet } = useIsMobile();

  const columns = useMemo<ColumnsType<any>>(
    () =>
      USE_MOCK_EMPLOYEE_PERFORMANCE_DATA
        ? [
            {
              title: (
                <span
                  className="text-sm text-black/70 font-bold"
                  data-cy="performance-employee-mock-col-employee"
                >
                  Employee
                </span>
              ),
              key: 'employee',
              render: (unusedRecord: unknown, row: MockPerformanceRow) => (
                <span
                  className="text-sm text-black/70 font-normal"
                  data-cy={`performance-employee-mock-cell-employee-${row.id}`}
                >
                  {row.employee}
                </span>
              ),
            },
            {
              title: (
                <span
                  className="text-sm text-black/70 font-bold"
                  data-cy="performance-employee-mock-col-job-title"
                >
                  Job Title
                </span>
              ),
              key: 'jobTitle',
              render: (unusedRecord: unknown, row: MockPerformanceRow) => (
                <span
                  className="text-sm text-black/70 font-normal"
                  data-cy={`performance-employee-mock-cell-job-${row.id}`}
                >
                  {row.jobTitle}
                </span>
              ),
            },
            {
              title: (
                <span
                  className="text-sm text-black/70 font-bold"
                  data-cy="performance-employee-mock-col-quarter"
                >
                  Quarter
                </span>
              ),
              key: 'quarter',
              render: (unusedRecord: unknown, row: MockPerformanceRow) => (
                <span
                  className="text-sm text-black/70 font-normal"
                  data-cy={`performance-employee-mock-cell-quarter-${row.id}`}
                >
                  {row.quarter}
                </span>
              ),
            },
            {
              title: (
                <span
                  className="text-sm text-black/70 font-bold"
                  data-cy="performance-employee-mock-col-department"
                >
                  Department
                </span>
              ),
              key: 'department',
              render: (unusedRecord: unknown, row: MockPerformanceRow) => (
                <span
                  className="text-sm text-black/70 font-normal"
                  data-cy={`performance-employee-mock-cell-department-${row.id}`}
                >
                  {row.department}
                </span>
              ),
            },
            {
              title: (
                <span
                  className="text-sm text-black/70 font-bold"
                  data-cy="performance-employee-mock-col-okr-score"
                >
                  OKR Score
                </span>
              ),
              key: 'okrScore',
              align: 'center' as const,
              render: (unusedRecord: unknown, row: MockPerformanceRow) => (
                <ScoreTag score={row.okrScore} />
              ),
            },
          ]
        : [
            {
              title: (
                <span
                  className="text-sm text-black/70 font-bold"
                  data-cy="performance-employee-col-employee"
                >
                  Employee
                </span>
              ),
              dataIndex: 'userId',
              key: 'userId',
              render: (userId: string) => (
                <span
                  className="text-sm text-black/70 font-normal"
                  data-cy={`performance-employee-cell-employee-${userId}`}
                >
                  <EmployeeDetails type="user" empId={userId} />
                </span>
              ),
            },
            {
              title: (
                <span
                  className="text-sm text-black/70 font-bold"
                  data-cy="performance-employee-col-job-title"
                >
                  Job Title
                </span>
              ),
              dataIndex: 'title',
              key: 'title',
              render: (titleValue: any, record: any) => (
                <span
                  className="text-sm text-black/70 font-normal"
                  data-cy={`performance-employee-cell-job-${record?.userId ?? 'row'}`}
                >
                  <EmployeeDetails type="job" empId={record?.userId} />
                </span>
              ),
            },
            {
              title: (
                <span
                  className="text-sm text-black/70 font-bold"
                  data-cy="performance-employee-col-quarter"
                >
                  Quarter
                </span>
              ),
              dataIndex: 'quarter',
              key: 'quarter',
              render: (quarterValue: any, record: any) => (
                <span
                  className="text-sm text-black/70 font-normal"
                  data-cy="performance-employee-cell-quarter"
                >
                  <SessionDetail sessionId={record?.sessionId ?? []} />
                </span>
              ),
            },
            {
              title: (
                <span
                  className="text-sm text-black/70 font-bold"
                  data-cy="performance-employee-col-department"
                >
                  Department
                </span>
              ),
              dataIndex: 'department',
              key: 'department',
              render: (deptValue: any, record: any) => (
                <span
                  className="text-sm text-black/70 font-normal"
                  data-cy={`performance-employee-cell-department-${record?.userId ?? 'row'}`}
                >
                  <EmployeeDetails type="department" empId={record?.userId} />
                </span>
              ),
            },
            {
              title: (
                <span
                  className="text-sm text-black/70 font-bold"
                  data-cy="performance-employee-col-okr-score"
                >
                  OKR Score
                </span>
              ),
              dataIndex: 'okrScore',
              key: 'okrScore',
              align: 'center' as const,
              render: (score: number) => <ScoreTag score={score} />,
            },
          ],
    [],
  );

  const dataSource = useMemo<any[]>(() => {
    if (USE_MOCK_EMPLOYEE_PERFORMANCE_DATA) {
      const start = (employeeCurrentPage - 1) * employeePageSize;
      return MOCK_EMPLOYEE_PERFORMANCE_ROWS.slice(
        start,
        start + employeePageSize,
      );
    }
    return Array.isArray(employeeOkr?.items) ? employeeOkr?.items : [];
  }, [employeeOkr?.items, employeeCurrentPage, employeePageSize]);

  const tableLoading = USE_MOCK_EMPLOYEE_PERFORMANCE_DATA ? false : isLoading;

  const paginationTotal = USE_MOCK_EMPLOYEE_PERFORMANCE_DATA
    ? MOCK_EMPLOYEE_PERFORMANCE_ROWS.length
    : (employeeOkr?.meta?.totalItems ?? 0);

  const paginationCurrent = USE_MOCK_EMPLOYEE_PERFORMANCE_DATA
    ? employeeCurrentPage
    : (employeeOkr?.meta?.currentPage ?? 0);

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
    if (USE_MOCK_EMPLOYEE_PERFORMANCE_DATA) return;
    refetch();
  }, [sessionIds, refetch]);

  return (
    <div
      id="okr-employee-okr-table-container"
      data-cy="okr-employee-okr-table-container"
      className="rounded-lg border border-gray-200 bg-white shadow-sm"
    >
      <div data-cy="performance-employee-okr-table-inner">
        <div
          className="mb-4 flex w-full flex-col gap-4 p-4"
          data-cy="performance-employee-okr-filters"
        >
          <OkrSearch allEmployeeLayout filterInPopover />
        </div>
        {tableLoading ? (
          <TableSkeleton columns={columns} />
        ) : (
          <Table
            id="okr-employee-okr-table"
            data-cy="okr-employee-okr-table"
            // className="performance-employee-table [&_.ant-table-thead>tr>th]:!bg-gray-100 [&_.ant-table-thead>tr>th]:!text-gray-700 [&_.ant-table-thead>tr>th]:font-semibold [&_.ant-table-cell]:py-3"
            columns={columns}
            dataSource={dataSource}
            pagination={false}
            scroll={{ y: 400 }}
            rowKey="id"
            rowClassName={(rowRecord, index) =>
              index !== undefined && index % 2 === 1
                ? 'bg-[#F9FAFB]'
                : 'bg-white'
            }
          />
        )}
      </div>

      <div
        className="border-t border-gray-100 px-4 pb-2 md:px-6"
        data-cy="performance-employee-okr-pagination-wrap"
      >
        {isMobile || isTablet ? (
          <CustomMobilePagination
            data-cy="okr-employee-okr-mobile-pagination"
            totalResults={paginationTotal}
            pageSize={employeePageSize}
            currentPage={employeeCurrentPage}
            onChange={onPageChange}
            onShowSizeChange={onPageChange}
          />
        ) : (
          <CustomPagination
            data-cy="okr-employee-okr-desktop-pagination"
            current={paginationCurrent}
            total={paginationTotal}
            pageSize={employeePageSize}
            onChange={onPageChange}
            onShowSizeChange={(pageSize) => setEmployeePageSize(pageSize)}
          />
        )}
      </div>
    </div>
  );
}
