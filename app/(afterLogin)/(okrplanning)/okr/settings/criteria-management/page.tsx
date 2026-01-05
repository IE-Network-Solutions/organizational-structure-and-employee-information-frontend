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

interface AssignedCriteriaRecord {
  key: string;
  name: string;
  totalPercentage: string;
  criteriaCount: number;
  types: string[];
}

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
      totalPercentage: `${item.totalPercentage}%`,
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
      sorter: (a: AssignedCriteriaRecord, b: AssignedCriteriaRecord) =>
        a.name.localeCompare(b.name),
    },
    {
      title: 'Total Percentage',
      dataIndex: 'totalPercentage',
      key: 'totalPercentage',
      defaultSortOrder: 'descend' as const,
      sorter: (a: AssignedCriteriaRecord, b: AssignedCriteriaRecord) =>
        parseFloat(a.totalPercentage) - parseFloat(b.totalPercentage),
    },
    {
      title: 'Criteria Count',
      dataIndex: 'criteriaCount',
      key: 'criteriaCount',
    },
    {
      title: 'Action',
      key: 'action',
      render: (record: AssignedCriteriaRecord) => (
        <div
          className="flex space-x-2"
          id={`okr-criteria-assigned-table-actions-${record.key}`}
          data-cy={`okr-criteria-assigned-table-actions-${record.key}`}
        >
          <AccessGuard
            data-cy="okr-criteria-assigned-table-edit-button-access-guard-display-guard"
            permissions={[Permissions.UpdateVpScoringConfigurations]}
          >
            <Button
              type="default"
              className="flex items-center space-x-1 bg-blue text-white hover:bg-sky-500 border-none"
              icon={<GrEdit />}
              onClick={() => handleEditClick(record.key)}
              id={`okr-criteria-assigned-table-edit-button-${record.key}`}
              data-cy={`okr-criteria-assigned-table-edit-button-${record.key}`}
            />
          </AccessGuard>

          <DeletePopover
            onDelete={() => handleDelete(record.key)}
            data-cy={`okr-criteria-assigned-table-delete-popover-${record.key}`}
          >
            <AccessGuard
              data-cy="okr-criteria-assigned-table-delete-button-access-guard-display-guard"
              permissions={[Permissions.DeleteVpScoringConfigurations]}
            >
              <Button
                type="default"
                className="flex items-center space-x-1 bg-red-500 text-white hover:bg-red-600 border-none"
                icon={
                  <RiDeleteBin6Line
                    data-cy={`okr-criteria-assigned-table-delete-button-icon-${record.key}`}
                  />
                }
                id={`okr-criteria-assigned-table-delete-button-${record.key}`}
                data-cy={`okr-criteria-assigned-table-delete-button-${record.key}`}
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
    <div
      className="p-5 rounded-2xl bg-white "
      id="okr-criteria-management-container"
      data-cy="okr-criteria-management-container"
    >
      {/* Desktop layout: visible from md and up */}
      <div
        className="hidden md:flex justify-between mb-6"
        id="okr-criteria-management-desktop-header"
        data-cy="okr-criteria-management-desktop-header"
      >
        <h1
          className="text-2xl font-bold md:text-lg"
          id="okr-criteria-management-desktop-title"
          data-cy="okr-criteria-management-desktop-title"
        >
          Criteria Management
        </h1>
        <AccessGuard
          data-cy="okr-criteria-management-desktop-add-button-access-guard-display-guard"
          permissions={[Permissions.CreateVpScoringConfigurations]}
        >
          <Button
            type="primary"
            className="bg-blue-500 hover:bg-blue-600 focus:bg-blue-600 md:w-auto"
            icon={<FaPlus />}
            onClick={() => openDrawer()}
            id="okr-criteria-management-desktop-add-button"
            data-cy="okr-criteria-management-desktop-add-button"
          >
            <span
              className="hidden lg:block"
              id="okr-criteria-management-desktop-add-button-label"
              data-cy="okr-criteria-management-desktop-add-button-label"
            >
              Scoring Configuration
            </span>
          </Button>
        </AccessGuard>
      </div>
      <div
        className="hidden md:block w-full"
        id="okr-criteria-management-desktop-filters-wrapper"
        data-cy="okr-criteria-management-desktop-filters-wrapper"
      >
        <CriteriaFilters
          onSearch={handleSearch}
          onTypeChange={handleTypeChange}
          criteriaNames={['All Types', ...criteriaTypes]}
          data-cy="okr-criteria-management-desktop-filters"
        />
      </div>

      {/* Mobile layout: visible on small screens */}
      <div
        className="md:hidden"
        id="okr-criteria-management-mobile-section"
        data-cy="okr-criteria-management-mobile-section"
      >
        <h1
          className="text-lg font-bold md:text-lg"
          id="okr-criteria-management-mobile-title"
          data-cy="okr-criteria-management-mobile-title"
        >
          Criteria Management
        </h1>
        <div
          className="mt-4 flex justify-between gap-4"
          id="okr-criteria-management-mobile-toolbar"
          data-cy="okr-criteria-management-mobile-toolbar"
        >
          <CriteriaFilters
            onSearch={handleSearch}
            onTypeChange={handleTypeChange}
            criteriaNames={['All Types', ...criteriaTypes]}
            data-cy="okr-criteria-management-mobile-filters"
          />
          <AccessGuard
            data-cy="okr-criteria-management-mobile-add-button-access-guard-display-guard"
            permissions={[Permissions.CreateVpScoringConfigurations]}
          >
            <Button
              type="primary"
              className="bg-blue-500 hover:bg-blue-600 focus:bg-blue-600 w-10 md:w-auto h-10"
              icon={<FaPlus />}
              onClick={() => openDrawer()}
              id="okr-criteria-management-mobile-add-button"
              data-cy="okr-criteria-management-mobile-add-button"
            >
              <span
                className="hidden lg:block"
                id="okr-criteria-management-mobile-add-button-label"
                data-cy="okr-criteria-management-mobile-add-button-label"
              >
                {' '}
                Scoring Configuration
              </span>
            </Button>
          </AccessGuard>
        </div>
      </div>

      <div
        className="flex  overflow-x-auto scrollbar-none w-full"
        id="okr-criteria-management-tabs-wrapper"
        data-cy="okr-criteria-management-tabs-wrapper"
      >
        <div
          className="w-full"
          id="okr-criteria-management-tabs-container"
          data-cy="okr-criteria-management-tabs-container"
        >
          <Tabs
            centered
            defaultActiveKey="1"
            id="okr-criteria-management-tabs"
            data-cy="okr-criteria-management-tabs"
          >
            <Tabs.TabPane
              tab="Scoring Configuration"
              key="1"
              id="okr-criteria-management-tab-scoring"
              data-cy="okr-criteria-management-tab-scoring"
            >
              <Table
                dataSource={assignedCriteriaData}
                columns={assignedCriteriaColumns}
                pagination={{ pageSize: 5 }}
                loading={vpScoringLoading}
                id="okr-criteria-management-assigned-table"
                data-cy="okr-criteria-management-assigned-table"
              />
            </Tabs.TabPane>
            <Tabs.TabPane
              tab="Available Criteria"
              key="2"
              id="okr-criteria-management-tab-available"
              data-cy="okr-criteria-management-tab-available"
            >
              <Table
                dataSource={availableCriteriaData}
                columns={availableCriteriaColumns}
                pagination={{ pageSize: 5 }}
                loading={criteriaLoading}
                id="okr-criteria-management-available-table"
                data-cy="okr-criteria-management-available-table"
              />
            </Tabs.TabPane>
          </Tabs>
        </div>
      </div>
      <ScoringDrawer data-cy="okr-criteria-management-drawer" />
    </div>
  );
}

export default Page;
