import React, { useState } from 'react';
import { Select, Space, Spin, Table } from 'antd';
import { TableColumnsType } from '@/types/table/table';
import { useGetVariablePay } from '@/store/server/features/okrplanning/okr/dashboard/queries';
import { EmployeeDetails } from '../../../_components/employeeDetails';
import { useVariablePayStore } from '@/store/uistate/features/compensation/benefit';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { useGetAllMonth } from '@/store/server/features/okrplanning/okr/dashboard/VP/queries';

const VariablePayTable = () => {
  const { data: allUsersVariablePay, isLoading } = useGetVariablePay();
  const { currentPage, pageSize, setCurrentPage, setPageSize } =
    useVariablePayStore();
  const [searchQuery, setSearchQuery] = useState('');
  const { data: employeeData } = useGetAllUsers();
  const { data: months } = useGetAllMonth();

  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

  const tableData =
    allUsersVariablePay?.items?.map((variablePay: any) => ({
      id: variablePay?.id,
      name: variablePay?.userId,
      VpInPercentile: variablePay?.vpScoring?.totalPercentage,
      VpInBirr: '',
      VpScore: variablePay?.vpScore,
      Benefit: '',
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
      label: `${emp.firstName || ''} ${emp.lastName}`, // Full name as label
      employeeData: emp,
    })) || [];

  const monthOptions =
      months?.items?.map((month: any) => ({
        value: month.id,
        label: month.name, // Assuming month has a 'name' field
      })) || [];

  const filteredDataSource = searchQuery
    ? tableData.filter(
        (employee: any) =>
          employee.name?.toLowerCase() === searchQuery?.toLowerCase(),
      )
    : tableData;
  return (
    <Spin spinning={isLoading}>
      <Space
        direction="horizontal"
        size="large"
        style={{ width: '100%', justifyContent: 'end', marginBottom: 16 }}
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
          style={{ width: 300 }} // Set a width for better UX
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
          onChange={setSelectedMonth}
        />
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
