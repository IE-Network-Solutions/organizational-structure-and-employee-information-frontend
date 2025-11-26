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
        <Space
          id={`payroll-bank-row-actions-view-space-${record.key}`}
          data-cy={`payroll-bank-row-actions-view-space-${record.key}`}
          size="middle"
        >
          <Tooltip data-cy={`payroll-bank-edit-click-button-tooltip-${record.key}`} title="Edit">
            <Button
              id={`payroll-bank-edit-click-button-${record.key}`}
              data-cy={`payroll-bank-edit-click-button-${record.key}`}
              type="primary"
              shape="circle"
              icon={<EditOutlined />}
              onClick={() => handleEdit()}
            />
          </Tooltip>
          <Popconfirm
            id={`payroll-bank-delete-popconfirm-view-component-${record.key}`}
            data-cy={`payroll-bank-delete-popconfirm-view-component-${record.key}`}
            title="Are you sure to delete this bank?"
            onConfirm={() => handleDelete(record.key)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete">
              <Button
                id={`payroll-bank-delete-click-button-${record.key}`}
                data-cy={`payroll-bank-delete-click-button-${record.key}`}
                className="bg-red-600 text-white border-none"
                icon={<DeleteOutlined data-cy={`payroll-bank-delete-click-button-${record.key}`} />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleEdit = () => {};

  const handleDelete = (key: any) => {
    const newData = data.filter((item) => item.key !== key);
    setData(newData);
  };

  const handleAddBank = () => {
    openDrawer();
  };

  return (
    <div
      id="payroll-banks-page-view-container"
      data-cy="payroll-banks-page-view-container"
      className="p-6"
    >
      <div
        id="payroll-banks-header-view-container"
        data-cy="payroll-banks-header-view-container"
        className="flex justify-between items-center"
      >
        <Title
          id="payroll-banks-title-view-text"
          data-cy="payroll-banks-title-view-text"
          level={3}
        >
          Banks
        </Title>
        <Button
          id="payroll-banks-add-click-button"
          data-cy="payroll-banks-add-click-button"
          type="primary"
          icon={<PlusOutlined data-cy="payroll-banks-add-click-button-icon" />}
          onClick={handleAddBank}
          style={{ marginBottom: '16px' }}
        >
          Add Bank
        </Button>
      </div>

      <Table
        id="payroll-banks-table-view-table"
        data-cy="payroll-banks-table-view-table"
        dataSource={data}
        columns={columns}
        pagination={false}
        bordered
      />
        <Drawer data-cy="payroll-banks-drawer-view-component" />
    </div>
  );
};

export default Banks;
