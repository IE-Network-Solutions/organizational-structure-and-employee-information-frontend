'use client';
import React, { useState } from 'react';
import { Table, Button, Space, Popconfirm, Typography } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';

const { Title } = Typography;

const CostSharing = () => {
  const [data, setData] = useState([
    { key: '1', name: 'Cost Sharing', amount: '10%' },
  ]);

  const handleDelete = (key: any) => {
    setData(data.filter((item) => item.key !== key));
  };

  const handleEdit = () => {};

  const handleAdd = () => {};

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
    },
    {
      title: 'Action',
      key: 'action',
      render: (text: any, record: any) => (
        <Space size="middle">
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit()}
            type="primary"
          />
          <Popconfirm
            title="Are you sure you want to delete this entry?"
            onConfirm={() => handleDelete(record.key)}
            okText="Yes"
            cancelText="No"
          >
            <Button icon={<DeleteOutlined />} type="primary" danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center">
        <Title level={3}>Cost Sharing</Title>

        <Button
          type="default"
          className="bg-slate-200 border-none text-gray-400"
          icon={<PlusOutlined />}
          style={{ marginBottom: '20px' }}
          onClick={handleAdd}
        >
          Cost Share
        </Button>
      </div>

      <Table dataSource={data} columns={columns} pagination={false} />
    </div>
  );
};

export default CostSharing;
