'use client';
import React, { useState } from 'react';
import { Table, Tag, Button, Space } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import Filters from './_components/filters';
import { useRouter } from 'next/navigation';
import Drawer from './_components/drawer';
import useDrawerStore from '@/store/uistate/features/okrplanning/okrSetting/assignTargetDrawerStore';

const EmployeeInformation = () => {
  const [searchText, setSearchText] = useState('');
  const router = useRouter();
  const { openDrawer } = useDrawerStore();

  const handleEdit = (e: any) => {
    e.stopPropagation();
    openDrawer();
  };
  const handleDelete = (e: any) => {
    e.stopPropagation();
  };

  const dataSource = [
    {
      key: '1',
      name: 'Abraham Dulla',
      job: 'Product Design Lead',
      salary: '10,000 ETB',
      allowances: ['Transport', 'Housing'],
      bank: 'Enat Bank',
      account: '1000000000000000',
    },
    {
      key: '2',
      name: 'Hanna Baptista',
      job: 'Product Design Lead',
      salary: '20,000 ETB',
      allowances: ['Transport'],
      bank: 'Not Available',
      account: 'Not Available',
    },
    {
      key: '3',
      name: 'Miracle Geidt',
      job: 'Product Design Lead',
      salary: '20,000 ETB',
      allowances: ['Not Entitled'],
      bank: 'CBE',
      account: '1000000000000000',
    },
    {
      key: '4',
      name: 'Rayna Torff',
      job: 'Product Design Lead',
      salary: '20,000 ETB',
      allowances: ['Transport', 'Housing', 'Travel'],
      bank: 'Enat',
      account: '1000000000000000',
    },
    {
      key: '5',
      name: 'Giana Lipshutz',
      job: 'Product Design Lead',
      salary: '20,000 ETB',
      allowances: ['Housing'],
      bank: 'CBE',
      account: '1000000000000000',
    },
    // Add more records here
  ];

  const columns = [
    {
      title: 'Employee',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Job Information',
      dataIndex: 'job',
      key: 'job',
    },
    {
      title: 'Basic Salary',
      dataIndex: 'salary',
      key: 'salary',
    },
    {
      title: 'Entitled Allowances',
      dataIndex: 'allowances',
      key: 'allowances',
      render: (allowances: any) =>
        allowances.map((item: any) => {
          let color = item === 'Not Entitled' ? 'red' : 'blue';
          return (
            <Tag color={color} key={item}>
              {item}
            </Tag>
          );
        }),
    },
    {
      title: 'Bank',
      dataIndex: 'bank',
      key: 'bank',
      render: (text: any) => (
        <span style={{ color: text === 'Not Available' ? 'red' : 'black' }}>
          {text}
        </span>
      ),
    },
    {
      title: 'Account Number',
      dataIndex: 'account',
      key: 'account',
      render: (text: any) => (
        <span style={{ color: text === 'Not Available' ? 'red' : 'black' }}>
          {text}
        </span>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (record: any) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined onClick={(e) => handleEdit(e)} />}
          />
          <Button
            type="default"
            className="bg-red-500 text-white"
            icon={<DeleteOutlined onClick={(e) => handleDelete(e)} />}
          />
        </Space>
      ),
    },
  ];

  // Search filter handler
  const handleSearch = (value: any) => {
    setSearchText(value);
  };
  const handleDetail = (value: any) => {
    router.push(`/employee-information/${value.key}`);
  };

  return (
    <div className="p-5">
      <h2 className="py-4">Employees Payroll Information</h2>
      <Filters />
      <Table
        dataSource={dataSource.filter((item) =>
          item.name.toLowerCase().includes(searchText.toLowerCase()),
        )}
        columns={columns}
        onRow={(record) => ({
          onClick: () => handleDetail(record),
          style: { cursor: 'pointer' },
        })}
        pagination={{
          pageSize: 5,
          showSizeChanger: true,
          showQuickJumper: true,
        }}
      />
      <Drawer />
    </div>
  );
};

export default EmployeeInformation;
