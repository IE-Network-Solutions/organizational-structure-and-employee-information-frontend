'use client';
import React, { useState } from 'react';
import { Spin, Dropdown, MenuProps, Tag } from 'antd';
import ScoringModal from './_components/criteria-drawer';
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

        {vpScoringLoading ? (
          <div
            className="flex justify-center items-center py-20"
            data-cy="okr-criteria-management-loading"
          >
            <Spin size="large" />
          </div>
        ) : (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            id="okr-criteria-management-cards-grid"
            data-cy="okr-criteria-management-cards-grid"
          >
            {assignedCriteriaData?.map((item: any) => (
              <div
                key={item.key}
                className="bg-white border border-[#d9d9d9] rounded-[8px] p-5 hover:shadow-sm transition-shadow relative"
                id={`okr-criteria-card-${item.key}`}
                data-cy={`okr-criteria-card-${item.key}`}
              >
                {/* Top Row: Name and Menu */}
                <div
                  className="flex justify-between items-start mb-6"
                  data-cy={`okr-criteria-card-header-${item.key}`}
                >
                  <p
                    className="text-[15px] font-semibold text-[#262626] flex-1 mr-2 leading-tight"
                    id={`okr-criteria-card-name-${item.key}`}
                    data-cy={`okr-criteria-card-name-${item.key}`}
                  >
                    {item.name}
                  </p>
                  <div
                    id={`okr-criteria-card-menu-wrapper-${item.key}`}
                    data-cy={`okr-criteria-card-menu-wrapper-${item.key}`}
                  >
                    <Dropdown
                      menu={{ items: getMenuItems(item) }}
                      trigger={['click']}
                      placement="bottomRight"
                    >
                      <button
                        className="w-8 h-8 flex items-center justify-center border border-[#d9d9d9] rounded-[6px] text-[#8c8c8c] hover:text-[#262626] hover:border-[#2b54ad] transition-colors"
                        onClick={(e) => e.stopPropagation()}
                        data-cy={`okr-criteria-card-menu-button-${item.key}`}
                      >
                        <EllipsisOutlined className="text-lg" />
                      </button>
                    </Dropdown>
                  </div>
                </div>

                {/* Bottom Row: Score and Count boxes */}
                <div
                  className="flex items-center justify-between"
                  data-cy={`okr-criteria-card-footer-${item.key}`}
                >
                  <Tag
                    className="px-2 py-0.5 text-[12px] font-medium text-[#595959] border-[#d9d9d9] bg-[#fafafa] rounded-[4px] m-0"
                    id={`okr-criteria-card-percentage-${item.key}`}
                    data-cy={`okr-criteria-card-percentage-${item.key}`}
                  >
                    Total %: {item.totalPercentage.replace('%', '')}
                  </Tag>
                  <Tag
                    className="px-2 py-0.5 text-[12px] font-medium text-[#595959] border-[#d9d9d9] bg-[#fafafa] rounded-[4px] m-0"
                    id={`okr-criteria-card-count-${item.key}`}
                    data-cy={`okr-criteria-card-count-${item.key}`}
                  >
                    Count: {item.criteriaCount}
                  </Tag>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <ScoringDrawer data-cy="okr-criteria-management-drawer" />
    </div>
  );
}

export default Page;
