import { Button, Spin, Table } from 'antd';
import { TableColumnsType } from '@/types/table/table';
import { EmployeeDetails } from '../../../_components/employeeDetails';
import { useVariablePayStore } from '@/store/uistate/features/compensation/benefit';
import VariablePayModal from './VariablePayModal';
import Link from 'next/link';
import { FaEye } from 'react-icons/fa';
import {
  useGetActiveMonth,
  useGetVariablePay,
} from '@/store/server/features/payroll/payroll/queries';
import VariablePayFilter from './variablePayFilter';
import { useGetAllCalculatedVpScore } from '@/store/server/features/okrplanning/okr/dashboard/VP/queries';
import CustomPagination from '@/components/customPagination';
import { useIsMobile } from '@/hooks/useIsMobile';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';

const VariablePayTable = () => {
  const { currentPage, pageSize, searchParams, setCurrentPage, setPageSize } =
    useVariablePayStore();
  const { isMobile, isTablet } = useIsMobile();
  const { data: activeMonth } = useGetActiveMonth();

  const selectedMonthIds =
    typeof searchParams?.selectedMonth === 'string'
      ? (searchParams.selectedMonth as string).split(',')
      : Array.isArray(searchParams?.selectedMonth) &&
          searchParams?.selectedMonth.length > 0
        ? searchParams?.selectedMonth
        : [activeMonth?.id];

  const selectedMonthIdsObject = { monthIds: selectedMonthIds };

  const { data: allUsersVariablePay, isLoading } = useGetVariablePay(
    selectedMonthIdsObject,
  );

  const tableData: any[] =
    allUsersVariablePay?.items?.map((variablePay: any) => ({
      id: variablePay?.id,
      name: variablePay?.userId,
      userId: variablePay?.userId,
      VpInPercentile: variablePay?.vpScoring?.totalPercentage,
      VpScore: variablePay?.vpScore,
      Benefit: '',
      Action: (
        <Link href={`okr/dashboard/${variablePay?.userId}`}>
          <Button
            className="bg-sky-600 px-[10px]  text-white disabled:bg-gray-400 border-none"
            data-testid={`view-vp-button-${variablePay?.userId}`}
          >
            <FaEye />
          </Button>
        </Link>
      ),
    })) || [];

  const columns: TableColumnsType<any> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: true,
      render: (text: string) => (
        <div data-testid={`variable-pay-employee-${text}`}>
          <EmployeeDetails empId={text} />
        </div>
      ),
    },
    {
      title: <span className="truncate">VP in %</span>,
      className: 'text-center',
      dataIndex: 'VpInPercentile',
      key: 'VpInPercentile',
      sorter: true,
      render: (text: string) => (
        <div data-testid="variable-pay-percentage">{text || '-'}</div>
      ),
    },

    {
      title: <span className="truncate">VP Score</span>,
      dataIndex: 'VpScore',
      key: 'VpScore',
      sorter: (a, b) => (a.VpScore || 0) - (b.VpScore || 0),
      render: (text: string) => (
        <div data-testid="variable-pay-score">{text || '-'}</div>
      ),
    },
    {
      title: 'Benefit',
      dataIndex: 'Benefit',
      key: 'Benefit',
      sorter: true,
      render: (text: string) => (
        <div data-testid="variable-pay-benefit">{text || '-'}</div>
      ),
    },
    {
      title: 'Action',
      dataIndex: 'Action',
      key: 'Action',
    },
  ];

  const filteredDataSource = searchParams?.employeeName
    ? tableData.filter(
        (employee: any) => employee?.name === searchParams?.employeeName,
      )
    : tableData;

  const allEmployeesIds: string[] = tableData.map(
    (employee: any) => employee.name,
  );
  const { isLoading: refreshLoading, isFetching } = useGetAllCalculatedVpScore(
    allEmployeesIds,
    false,
  );

  const paginatedData = filteredDataSource.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  return (
    <div
      className="bg-white rounded-lg px-1 py-2 sm:px-6 sm:mr-4"
      data-testid="variable-pay-table-container"
    >
      <VariablePayFilter tableData={tableData} />
      <div data-testid="variable-pay-table-wrapper">
        <Spin
          spinning={isLoading || isFetching || refreshLoading}
          data-testid="variable-pay-table-loading"
        >
          <div className="overflow-x-auto">
            <Table
              className="mt-6"
              columns={columns}
              dataSource={paginatedData}
              pagination={false}
              data-testid="variable-pay-table"
            />
          </div>

          {isMobile || isTablet ? (
            <CustomMobilePagination
              totalResults={filteredDataSource.length}
              pageSize={pageSize}
              onChange={(page, size) => {
                setCurrentPage(page);
                setPageSize(size);
              }}
              onShowSizeChange={(page, size) => {
                setCurrentPage(page);
                setPageSize(size);
              }}
            />
          ) : (
            <CustomPagination
              current={currentPage}
              total={filteredDataSource.length}
              pageSize={pageSize}
              onChange={(page, size) => {
                setCurrentPage(page);
                setPageSize(size);
              }}
              onShowSizeChange={(size) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
              data-testid="variable-pay-pagination"
            />
          )}

          <VariablePayModal data={filteredDataSource} />
        </Spin>
      </div>
    </div>
  );
};

export default VariablePayTable;
