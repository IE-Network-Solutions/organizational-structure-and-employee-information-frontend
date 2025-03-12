'use client';
import React, { useState } from 'react';
import { Button, Table, Tabs } from 'antd';
import { FaPlus } from 'react-icons/fa';
import { GrEdit } from 'react-icons/gr';
import { RiDeleteBin6Line } from 'react-icons/ri';
import ScoringDrawer from './_components/criteria-drawer';
import useDrawerStore from '@/store/uistate/features/okrplanning/okrSetting/assignTargetDrawerStore';
import CriteriaFilters from './_components/criteria-filters';
import {
  useFetchVpScoring,
  useGetCriteriaTargets,
} from '@/store/server/features/okrplanning/okr/criteria/queries';
import { useDeleteVpScoring } from '@/store/server/features/okrplanning/okr/criteria/mutation';
import DeletePopover from '@/components/common/actionButton/deletePopover';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';

function Page() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All Types');

  const { openDrawer } = useDrawerStore();
  const { data: criteriaData, isLoading: criteriaLoading } =
    useGetCriteriaTargets();
  const { data: vpScoringData, isLoading: vpScoringLoading } =
    useFetchVpScoring();
  const { mutate: deleteVpScoring } = useDeleteVpScoring();

  const handleDelete = (id: string) => {
    deleteVpScoring(id);
  };

  const handleSearch = (value: string) => setSearchTerm(value);
  const handleTypeChange = (value: string) => setSelectedType(value);
  const handleEditClick = (id: string) => {
    openDrawer(id);
  };

  const criteriaTypes: string[] = (criteriaData?.items || []).map(
    (item: any) => item.name,
  );

  const availableCriteriaData = criteriaData?.items
    ?.map((item: any) => ({
      key: item.id,
      name: item.name,
      description: item.description,
      sourceService: item.sourceService,
    }))
    .filter((item: any) => {
      const matchesSearch = item.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesType =
        selectedType === 'All Types' ||
        item.name.toLowerCase() === selectedType?.toLowerCase();
      return matchesSearch && matchesType;
    });

  const assignedCriteriaData = vpScoringData?.items
    ?.map((item: any) => ({
      key: item.id,
      name: item.name,
      totalPercentage: item.totalPercentage,
      criteriaCount: item.vpScoringCriterions.length,
      types: item.vpScoringCriterions.map(
        (criterion: any) => criterion.vpCriteria.name,
      ),
    }))
    .filter((item: any) => {
      const matchesSearch = item.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesType =
        selectedType === 'All Types' ||
        item.types.some((type: string) => type === selectedType);

      return matchesSearch && matchesType;
    });

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
      title: 'Criteria Count',
      dataIndex: 'criteriaCount',
      key: 'criteriaCount',
    },
    {
      title: 'Action',
      key: 'action',
      render: (record: any) => (
        <div className="flex space-x-2">
          <AccessGuard permissions={[Permissions.UpdateScoringConfigurations]}>
            <Button
              type="default"
              className="flex items-center space-x-1 bg-blue text-white hover:bg-sky-500 border-none"
              icon={<GrEdit />}
              onClick={() => handleEditClick(record.key)}
            />
          </AccessGuard>

          <DeletePopover onDelete={() => handleDelete(record.key)}>
            <AccessGuard
              permissions={[Permissions.DeleteScoringConfigurations]}
            >
              <Button
                type="default"
                className="flex items-center space-x-1 bg-red-500 text-white hover:bg-red-600 border-none"
                icon={<RiDeleteBin6Line />}
              />
            </AccessGuard>
          </DeletePopover>
        </div>
      ),
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
  ];

  return (
    <div className="p-10 justify-center items-center">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Criteria Management</h1>
        <AccessGuard permissions={[Permissions.CreateScoringConfigurations]}>
          <Button
            type="primary"
            className="flex items-center space-x-2 py-8 px-8"
            icon={<FaPlus />}
            onClick={() => openDrawer()}
          >
            New Scoring Configuration
          </Button>
        </AccessGuard>
      </div>

      <CriteriaFilters
        onSearch={handleSearch}
        onTypeChange={handleTypeChange}
        criteriaNames={['All Types', ...criteriaTypes]}
      />

      <Tabs centered defaultActiveKey="1">
        <Tabs.TabPane tab="Scoring Configuration" key="1">
          <Table
            dataSource={assignedCriteriaData}
            columns={assignedCriteriaColumns}
            pagination={{ pageSize: 5 }}
            loading={vpScoringLoading}
          />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Available Criteria" key="2">
          <Table
            dataSource={availableCriteriaData}
            columns={availableCriteriaColumns}
            pagination={{ pageSize: 5 }}
            loading={criteriaLoading}
          />
        </Tabs.TabPane>
      </Tabs>
      <ScoringDrawer />
    </div>
  );
}

export default Page;
