'use client';
import React from 'react';
import { Button, Table, Tabs } from 'antd';
import { FaEye, FaPlus } from 'react-icons/fa';
import { GrEdit } from 'react-icons/gr';
import { RiDeleteBin6Line } from 'react-icons/ri';
import ScoringDrawer from './_components/criteria-drawer';
import useDrawerStore from '@/store/uistate/features/okrplanning/okrSetting/assignTargetDrawerStore';
import CriteriaFilters from './_components/criteria-filters';

function Page() {
  const { openDrawer } = useDrawerStore();

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
            className="flex items-center space-x-1 bg-purple text-white hover:bg-indigo-500 border-none"
            icon={<FaEye />}
          />
          <Button
            type="default"
            className="flex items-center space-x-1 bg-blue text-white hover:bg-sky-500 border-none"
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
          onClick={openDrawer}
        >
          New Scoring Configuration
        </Button>
      </div>

      <CriteriaFilters />

      <Tabs centered defaultActiveKey="1">
        <Tabs.TabPane tab="Scoring Configuration" key="1">
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
      <ScoringDrawer />
    </div>
  );
}

export default Page;
