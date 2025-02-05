import { Button, Select, Space, Spin, Table } from 'antd';
import { TableColumnsType } from '@/types/table/table';
import { useGetVariablePay } from '@/store/server/features/okrplanning/okr/dashboard/queries';
import { useGetAllCalculatedVpScore } from '@/store/server/features/okrplanning/okr/dashboard/VP/queries';

import { EmployeeDetails } from '../../../_components/employeeDetails';
import { useVariablePayStore } from '@/store/uistate/features/compensation/benefit';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { useGetAllMonth } from '@/store/server/features/okrplanning/okr/dashboard/VP/queries';
import { useState } from 'react';

const VariablePayTable = () => {
  const { data: allUsersVariablePay, isLoading } = useGetVariablePay();
  const { currentPage, pageSize, setCurrentPage, setPageSize } =
    useVariablePayStore();
  const [searchQuery, setSearchQuery] = useState('');
  const { data: employeeData } = useGetAllUsers();
  const { data: months } = useGetAllMonth();

  const tableData: any[] =
    allUsersVariablePay?.items?.map((variablePay: any) => ({
      id: variablePay?.id,
      name: variablePay?.userId,
      VpInPercentile: variablePay?.vpScoring?.totalPercentage,
      VpInBirr: '',
      VpScore: variablePay?.vpScore,
      Benefit: '',
    })) || [];

  const allEmployeesIds: string[] = tableData.map(
    (employee: any) => employee.name,
  );

  const {
    refetch,
    isLoading: UpdatedIsLoading,
    isFetching,
  } = useGetAllCalculatedVpScore(allEmployeesIds, false);

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
      title: 'Total VP in Birr',
      dataIndex: 'VpInBirr',
      key: 'VpInBirr',
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
  ];

  const handleSearchChange = (value: any) => {
    setSearchQuery(value);
  };

  const options =
    employeeData?.items?.map((emp: any) => ({
      value: emp.id,
      label: `${emp?.firstName || ''} ${emp?.middleName} ${emp?.lastName}`, // Full name as label
      employeeData: emp,
    })) || [];

  const monthOptions =
    months?.items?.map((month: any) => ({
      value: month.id,
      label: month.name,
    })) || [];

  const filteredDataSource = searchQuery
    ? tableData.filter(
        (employee: any) =>
          employee.name?.toLowerCase() === searchQuery?.toLowerCase(),
      )
    : tableData;
  return (
    <Spin spinning={isLoading || UpdatedIsLoading || isFetching}>
      <Space
        direction="horizontal"
        size="large"
        style={{ width: '100%', justifyContent: 'start', marginBottom: 16 }}
      >
        <Select
          showSearch
          allowClear
          className="min-h-12"
          placeholder="Search by name"
          onChange={handleSearchChange}
          filterOption={(input, option) => {
            const label = option?.label;
            return (
              typeof label === 'string' &&
              label.toLowerCase().includes(input.toLowerCase())
            );
          }}
          options={options}
          style={{ width: 300 }}
        />{' '}
        <Select
          placeholder="Filter by"
          style={{ width: 150 }}
          className="min-h-12"
          options={[
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
          ]}
        />
        <Select
          placeholder="Filter by month"
          style={{ width: 150 }}
          className="min-h-12"
          options={monthOptions}
          onChange={() => {}}
        />
        <Button type="primary" onClick={() => refetch()}>
          Refresh VP
        </Button>
      </Space>
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
    </Spin>
  );
};

export default VariablePayTable;
