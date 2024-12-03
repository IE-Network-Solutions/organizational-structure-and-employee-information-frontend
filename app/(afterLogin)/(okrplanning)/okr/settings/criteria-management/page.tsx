'use client';
import React, { useState } from 'react';
import { Button, Input, Select, Table, Tabs, Drawer, Form, Tag } from 'antd';
import { FaPlus } from 'react-icons/fa';
import { GrEdit } from 'react-icons/gr';
import { RiDeleteBin6Line } from 'react-icons/ri';

const { Search } = Input;
const { Option } = Select;

function Page() {
  const [drawerVisible, setDrawerVisible] = useState(false);

  // Assigned Criteria by Role Data and Columns
  const assignedCriteriaData = [
    {
      key: '1',
      name: 'Manager VP Scoring',
      totalPercentage: '30%',
      assignedRoles: 'Sales Manager, HR Lead',
      criteriaCount: 3,
    },
    {
      key: '2',
      name: 'Sales VP Scoring',
      totalPercentage: '40%',
      assignedRoles: 'Sales Team, Operations Lead',
      criteriaCount: 5,
    },
  ];

  const assignedCriteriaColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Total Percentage',
      dataIndex: 'totalPercentage',
      key: 'totalPercentage',
    },
    {
      title: 'Assigned Roles',
      dataIndex: 'assignedRoles',
      key: 'assignedRoles',
    },
    {
      title: 'Criteria Count',
      dataIndex: 'criteriaCount',
      key: 'criteriaCount',
    },
    {
      title: 'Action',
      key: 'action',
      render: () => (
        <div className="flex space-x-2">
          <Button
            type="default"
            className="flex items-center space-x-1 bg-blue text-white hover:bg-red-600 border-none"
            icon={<GrEdit />}
          />
          <Button
            type="default"
            className="flex items-center space-x-1 bg-red-500 text-white hover:bg-red-600 border-none"
            icon={<RiDeleteBin6Line />}
          />
        </div>
      ),
    },
  ];

  const availableCriteriaData = [
    {
      key: '1',
      name: 'Quality Score',
      description: 'Score based on quality of work',
      sourceService: 'OKR, CFR',
      sourceEndPoint: 'https://api.example.com/criteria/quality-score',
    },
    {
      key: '2',
      name: 'Timeliness',
      description: 'Score based on delivery time',
      sourceService: 'OKR',
      sourceEndPoint: 'https://api.example.com/criteria/timeliness',
    },
  ];

  const availableCriteriaColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Source Service',
      dataIndex: 'sourceService',
      key: 'sourceService',
    },
    {
      title: 'Source Endpoint',
      dataIndex: 'sourceEndPoint',
      key: 'sourceEndPoint',
      render: (text: any) => (
        <a href={text} target="_blank" rel="noopener noreferrer">
          {text}
        </a>
      ),
    },
  ];

  return (
    <div className="p-10 justify-center items-center">
      {/* Header Section */}
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Criteria Management</h1>
        <Button
          type="primary"
          className="flex items-center space-x-2 py-8 px-8"
          icon={<FaPlus />}
          onClick={() => setDrawerVisible(true)}
        >
          New Scoring Configuration
        </Button>
      </div>

      {/* Filter Section */}
      <div className="mb-6 flex space-x-4 justify-between items-center">
        <Search
          placeholder="Search"
          onSearch={(value) => console.log(value)}
          style={{ width: 200 }}
          className="p-8"
        />
        <Select
          defaultValue="All types"
          style={{ width: 150 }}
          onChange={(value) => console.log(value)}
        >
          <Option value="all">All types</Option>
          <Option value="type1">Type 1</Option>
          <Option value="type2">Type 2</Option>
        </Select>
      </div>

      {/* Tabs Section */}
      <Tabs defaultActiveKey="1">
        <Tabs.TabPane tab="Assigned Criteria by Role" key="1">
          <Table
            dataSource={assignedCriteriaData}
            columns={assignedCriteriaColumns}
            pagination={{ pageSize: 5 }}
          />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Available Criteria" key="2">
          <Table
            dataSource={availableCriteriaData}
            columns={availableCriteriaColumns}
            pagination={{ pageSize: 5 }}
          />
        </Tabs.TabPane>
      </Tabs>

      {/* Drawer for New Scoring Configuration */}
      <Drawer
        title="Add New Scoring Configuration"
        placement="right"
        onClose={() => setDrawerVisible(false)}
        visible={drawerVisible}
        width={500}
      >
        <Form layout="vertical">
          <Form.Item label="Name of the Scoring Configuration" required>
            <Input placeholder="Enter the name here" />
          </Form.Item>

          <Form.Item label="Total Percentage" required>
            <Input placeholder="Enter the total percentage" />
          </Form.Item>

          <Form.Item label="Department" required>
            <Select mode="tags" placeholder="Select departments">
              <Option value="Sales Manager">Sales Manager</Option>
              <Option value="Marketing Manager">Marketing Manager</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Users" required>
            <Select mode="tags" placeholder="Select users">
              <Option value="Pristia Candra">Pristia Candra</Option>
              <Option value="Dagmawi H">Dagmawi H</Option>
              <Option value="Christina B">Christina B</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Choose Criteria" required>
            <Select placeholder="Select criteria">
              <Option value="Quality Score">Quality Score</Option>
              <Option value="Timeliness">Timeliness</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Chosen Criteria">
            <div className="flex space-x-4">
              <Tag closable>Quality Score</Tag>
              <Input placeholder="Enter weight" />
            </div>
          </Form.Item>

          <div className="flex justify-end mt-4">
            <Button onClick={() => setDrawerVisible(false)} className="mr-4">
              Cancel
            </Button>
            <Button type="primary">Add</Button>
          </div>
        </Form>
      </Drawer>
    </div>
  );
}

export default Page;
