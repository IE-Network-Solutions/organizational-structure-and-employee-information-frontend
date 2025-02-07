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

const VariablePayTable = () => {
  const { currentPage, pageSize, searchParams, setCurrentPage, setPageSize } =
    useVariablePayStore();

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
      VpInPercentile: variablePay?.vpScoring?.totalPercentage,
      VpScore: variablePay?.vpScore,
      Benefit: '',
      Action: (
        // <Link href={`employees/manage-employees/${variablePay?.id}`}>
        <Link href={'okr/dashboard'}>
          <Button
            // id={`editUserButton${item?.id}`}
            className="bg-sky-600 px-[10px]  text-white disabled:bg-gray-400 "
          >
            <FaEye />
          </Button>
        </Link>
      ),
    })) || [];

  const handleTableChange = (pagination: any) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
  };

  const columns: TableColumnsType<any> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: true,
      render: (text: string) => <EmployeeDetails empId={text} />,
    },
    {
      title: 'VP in %',
      dataIndex: 'VpInPercentile',
      key: 'VpInPercentile',
      sorter: true,
      render: (text: string) => <div>{text || '-'}</div>,
    },

    {
      title: 'VP Score',
      dataIndex: 'VpScore',
      key: 'VpScore',
      sorter: (a, b) => (a.VpScore || 0) - (b.VpScore || 0),
      render: (text: string) => <div>{text || '-'}</div>,
    },
    {
      title: 'Benefit',
      dataIndex: 'Benefit',
      key: 'Benefit',
      sorter: true,
      render: (text: string) => <div>{text || '-'}</div>,
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

  return (
    <>
      <VariablePayFilter tableData={tableData} />
      <Spin spinning={isLoading || isFetching || refreshLoading}>
        <Table
          className="mt-6"
          columns={columns}
          dataSource={filteredDataSource}
          pagination={{
            current: currentPage,
            pageSize,
            total: tableData.length,
          }}
          onChange={handleTableChange}
        />
        <VariablePayModal data={filteredDataSource} />
      </Spin>
    </>
  );
};

export default VariablePayTable;
