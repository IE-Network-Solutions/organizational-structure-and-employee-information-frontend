'use client';
import React, { useState } from 'react';
import { Table, Button, Space, Tooltip, Popconfirm, Typography } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import useDrawerStore from '@/store/uistate/features/okrplanning/okrSetting/assignTargetDrawerStore';
import Drawer from './_components/drawer';
const { Title } = Typography;

const Banks = () => {
  const { openDrawer } = useDrawerStore();

  const [data, setData] = useState([
    {
      key: '1',
      shortForm: 'ENAT',
      email: 'enat@gmail.com',
      phone: '09090909',
      contactBranch: 'Mulumebet',
      address: 'Haya Hulet',
    },
    {
      key: '2',
      shortForm: 'CBE',
      email: 'cbe@gmail.com',
      phone: '09090909',
      contactBranch: 'Legehar',
      address: 'Legehar',
    },
    {
      key: '3',
      shortForm: 'ENAT',
      email: 'enat@gmail.com',
      phone: '09090909',
      contactBranch: 'Mulumebet',
      address: 'Haya Hulet',
    },
    {
      key: '4',
      shortForm: 'CBE',
      email: 'cbe@gmail.com',
      phone: '09090909',
      contactBranch: 'Legehar',
      address: 'Legehar',
    },
  ]);

  const columns = [
    {
      title: 'Short Form',
      dataIndex: 'shortForm',
      key: 'shortForm',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Contact Branch',
      dataIndex: 'contactBranch',
      key: 'contactBranch',
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: 'Action',
      key: 'action',
      render: (text: any, record: any) => (
        <Space size="middle">
          <Tooltip title="Edit">
            <Button
              type="primary"
              shape="circle"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Are you sure to delete this bank?"
            onConfirm={() => handleDelete(record.key)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete">
              <Button
                className="bg-red-600 text-white border-none"
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleEdit = (record: any) => {
    console.log('Editing:', record);
  };

  const handleDelete = (key: any) => {
    const newData = data.filter((item) => item.key !== key);
    setData(newData);
  };

  const handleAddBank = () => {
    openDrawer();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center">
        <Title level={3}>Banks</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddBank}
          style={{ marginBottom: '16px' }}
        >
          Add Bank
        </Button>
      </div>

      <Table dataSource={data} columns={columns} pagination={false} bordered />
      <Drawer />
    </div>
  );
};

export default Banks;
