'use client';
import React, { useState } from 'react';
import { Button, Drawer, Input, Select, Table } from 'antd';
import { FaPlus } from 'react-icons/fa';
import { GrEdit } from 'react-icons/gr';
import { RiDeleteBin6Line } from 'react-icons/ri';

const { Search } = Input;
const { Option } = Select;

function Page() {
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);

  const handleOpen = () => setIsDrawerVisible(true);
  const handleClose = () => setIsDrawerVisible(false);

  // Table Data and Columns
  const dataSource = [
    {
      key: '1',
      department: 'Manager VP Scoring',
      criteriaName: 'Criteria 1',
      month1: '10%',
      month2: '15%',
      month3: '5%',
    },
    {
      key: '2',
      department: 'Sales VP Scoring',
      criteriaName: 'Criteria 2',
      month1: '20%',
      month2: '10%',
      month3: '10%',
    },
  ];

  const columns = [
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: 'Criteria Name',
      dataIndex: 'criteriaName',
      key: 'criteriaName',
    },
    {
      title: 'Month 1',
      dataIndex: 'month1',
      key: 'month1',
    },
    {
      title: 'Month 2',
      dataIndex: 'month2',
      key: 'month2',
    },
    {
      title: 'Month 3',
      dataIndex: 'month3',
      key: 'month3',
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
            onClick={handleOpen}
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

  return (
    <div className="p-10">
      {/* Header Section */}
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Target Assignment</h1>
        <Button
          type="primary"
          className="flex items-center space-x-2 py-8 px-8"
          icon={<FaPlus />}
          onClick={handleOpen}
        >
          Assign Target
        </Button>
      </div>

      {/* Filter Section */}
      <div className="mb-6 flex gap-4">
        <Search
          placeholder="Search"
          onSearch={(value) => console.log(value)}
          className="w-full sm:w-2/3"
        />
        <Select
          defaultValue="All types"
          className="w-full sm:w-1/3"
          onChange={(value) => console.log(value)}
        >
          <Option value="all">All types</Option>
          <Option value="type1">Type 1</Option>
          <Option value="type2">Type 2</Option>
        </Select>
      </div>

      {/* Table Section */}
      <Table
        dataSource={dataSource}
        columns={columns}
        pagination={{ pageSize: 5 }}
      />

      {/* Drawer Section */}
      <Drawer
        title="Assign Target"
        placement="right"
        width={500}
        onClose={handleClose}
        visible={isDrawerVisible}
      >
        <div className="p-4">
          <div className="mb-4">
            <label>Choose Department:</label>
            <Select placeholder="Select Department" className="w-full mt-2">
              <Option value="department1">Department 1</Option>
              <Option value="department2">Department 2</Option>
            </Select>
          </div>

          <div className="mb-4">
            <label>Choose Criteria:</label>
            <Select placeholder="Select Criteria" className="w-full mt-2">
              <Option value="criteria1">Criteria 1</Option>
              <Option value="criteria2">Criteria 2</Option>
            </Select>
          </div>

          <div className="mb-4">
            <label>Month:</label>
            <Select placeholder="Select Month" className="w-full mt-2">
              <Option value="month1">Month 1</Option>
              <Option value="month2">Month 2</Option>
              <Option value="month3">Month 3</Option>
            </Select>
          </div>

          <div className="mb-4">
            <label>Target:</label>
            <Input placeholder="Enter Target" className="w-full mt-2" />
          </div>

          <div className="mb-4">
            <label>Weight:</label>
            <Input placeholder="Enter Weight" className="w-full mt-2" />
          </div>

          <div className="mb-4">
            <label>Is it a Deductible Criteria?</label>
            <input type="checkbox" className="ml-2" />
          </div>

          <div className="flex justify-end">
            <Button type="primary" onClick={handleClose} className="mr-4">
              Assign
            </Button>
            <Button onClick={handleClose}>Cancel</Button>
          </div>
        </div>
      </Drawer>
    </div>
  );
}

export default Page;
