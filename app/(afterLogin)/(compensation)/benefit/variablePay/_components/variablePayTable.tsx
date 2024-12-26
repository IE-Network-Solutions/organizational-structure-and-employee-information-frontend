import React from 'react';
import { Input, Select, Space, Spin, Table } from 'antd';
import { TableColumnsType } from '@/types/table/table';
import { SearchOutlined } from '@ant-design/icons';
import { useGetVariablePay } from '@/store/server/features/okrplanning/okr/dashboard/queries';

const VariablePayTable = () => {
  const { data: allUsersVariablePay, isLoading } = useGetVariablePay();

  console.log("allUsersVariablePay", allUsersVariablePay);


  const sampleClosedDates = [
    {
      id: 1,
      name: 'End of Q1',
      VpInPercentile: 'Rate',
      VpInBirr: '20% of salery',
      VpScore: 'Finance Team',
      Benefit: '20% of salery',
    },
    {
      id: 2,
      name: 'Mid-Year Review',
      VpInPercentile: 'Fixed',
      VpInBirr: 1500,
      VpScore: 'All Departments',
      Benefit: '20% of salery',
    },
    {
      id: 3,
      name: 'End of Fiscal Year',
      VpInPercentile: 'Fixed',
      VpInBirr: 5000,
      VpScore: 'Management',
      Benefit: '20% of salery',
    },
    {
      id: 4,
      name: 'Special Bonus',
      VpInPercentile: 'Fixed',
      VpInBirr: 2000,
      VpScore: 'HR & Admin',
      Benefit: '20% of salery',
    },
  ];
  

  const columns: TableColumnsType<any> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: true,
      render: (text: string) => <div>{text || '-'}</div>,
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

  return (
    <Spin spinning={isLoading}>
      <Space
        direction="horizontal"
        size="large"
        style={{ width: '100%', justifyContent: 'end', marginBottom: 16 }}
      >
        <Input addonBefore={<SearchOutlined />} placeholder="large size" />
        <Select
          placeholder="Sort by"
          style={{ width: 150 }}
          options={[
            { value: 'age', label: 'Age' },
            { value: 'name', label: 'Name' },
            { value: 'date', label: 'Date' },
          ]}
        />
        <Select
          placeholder="Filter by"
          style={{ width: 150 }}
          options={[
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
            { value: 'closed', label: 'Closed' },
          ]}
        />
        <Select
          placeholder="Filter by"
          style={{ width: 150 }}
          options={[
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
            { value: 'closed', label: 'Closed' },
          ]}
        />
      </Space>
      <Table
        className="mt-6"
        columns={columns}
        dataSource={sampleClosedDates}
        pagination={false}
      />
    </Spin>
  );
};

export default VariablePayTable;