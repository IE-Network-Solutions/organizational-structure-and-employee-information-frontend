'use client';
import React, { useState } from 'react';
import { Button, Input, Select, Table } from 'antd';
import { FaPlus } from 'react-icons/fa';
import { GrEdit } from 'react-icons/gr';
import { RiDeleteBin6Line } from 'react-icons/ri';
import useDrawerStore from '@/store/uistate/features/okrplanning/okrSetting/assignTargetDrawerStore';
import AssignTargetDrawer from './_components/assign-target-drawer';
import TargetFilters from './_components/target-filters';

const { Search } = Input;
const { Option } = Select;

function Page() {
  const { openDrawer } = useDrawerStore();

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
            onClick={() => {}}
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
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Target Assignment</h1>
        <Button
          type="primary"
          className="flex items-center space-x-2 py-8 px-8"
          icon={<FaPlus />}
          onClick={openDrawer}
        >
          Assign Target
        </Button>
      </div>

      <TargetFilters />
      <Table
        dataSource={dataSource}
        columns={columns}
        pagination={{ pageSize: 5 }}
      />

      <AssignTargetDrawer />
    </div>
  );
}

export default Page;
