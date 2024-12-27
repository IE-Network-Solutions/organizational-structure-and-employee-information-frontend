import React, { useState } from 'react';
import { Input, Select, Space, Spin, Table } from 'antd';
import { TableColumnsType } from '@/types/table/table';
import { SearchOutlined } from '@ant-design/icons';
import { useGetVariablePay } from '@/store/server/features/okrplanning/okr/dashboard/queries';
import { EmployeeDetails } from '../../../_components/employeeDetails';
import { useVariablePayStore } from '@/store/uistate/features/compensation/benefit';

const VariablePayTable = () => {

  const { data: allUsersVariablePay, isLoading } = useGetVariablePay();
  const { currentPage, pageSize, setCurrentPage, setPageSize} = useVariablePayStore();

  const tableData = allUsersVariablePay?.items?.map((variablePay: any) => ({
    id: variablePay.id,
    name: variablePay.userId,
    VpInPercentile: variablePay.vpScoring.totalPercentage,
    VpInBirr: '',
    VpScore: variablePay.vpScore,
    Benefit: '',
  })) || [];

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
      sorter: true,
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

  const handleTableChange = (pagination: any) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
  };

  return (
    <Spin spinning={isLoading}>
      <Space
        direction="horizontal"
        size="large"
        style={{ width: '100%', justifyContent: 'end', marginBottom: 16 }}
      >
        <Input addonBefore={<SearchOutlined />} placeholder="Search by name" />
        <Select
          placeholder="Sort by VP Score"
          style={{ width: 150 }}
          options={[
            { value: 'ascending', label: 'Ascending' },
            { value: 'descending', label: 'Descending' },
          ]}
        />
        <Select
          placeholder="Filter by"
          style={{ width: 150 }}
          options={[
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
          ]}
        />
        <Select
          placeholder="Filter by month"
          style={{ width: 150 }}
          options={[
            { value: 'January', label: 'January' },
            { value: 'February', label: 'February' },
          ]}
        />
      </Space>
      <Table
        className="mt-6"
        columns={columns}
        dataSource={tableData}
        pagination={{
          current: currentPage,
          pageSize,
          total: tableData.length,
          showSizeChanger: true,
        }}
        onChange={handleTableChange}
      />
    </Spin>
  );
};

export default VariablePayTable;