'use client';
import React, { useMemo, useState } from 'react';
import { Dropdown, MenuProps, Tag } from 'antd';
import ScoringModal from './_components/criteria-drawer';
import CriteriaManagementPageSkeleton from './_components/criteriaManagementPageSkeleton';
import EmptyState from '@/components/empty';
import useDrawerStore from '@/store/uistate/features/okrplanning/okrSetting/assignTargetDrawerStore';
import CriteriaFilters from './_components/criteria-filters';
import {
  useFetchVpScoring,
  useGetCriteriaTargets,
} from '@/store/server/features/okrplanning/okr/criteria/queries';
import { useDeleteVpScoring } from '@/store/server/features/okrplanning/okr/criteria/mutation';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { EllipsisOutlined } from '@ant-design/icons';
import { MdDeleteForever, MdModeEditOutline } from 'react-icons/md';

function Page() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All Types');

  const { openDrawer } = useDrawerStore();
  const { data: criteriaData } = useGetCriteriaTargets();
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

  const rawItems = vpScoringData?.items ?? [];

  const baseMappedCriteria = useMemo(() => {
    return rawItems.map((item: any) => ({
      key: item.id,
      name: item.name,
      totalPercentage: `${item.totalPercentage}%`,
      criteriaCount: item.vpScoringCriterions.length,
      types: item.vpScoringCriterions.map(
        (criterion: any) => criterion.vpCriteria.name,
      ),
    }));
  }, [rawItems]);

  const assignedCriteriaData = useMemo(() => {
    return baseMappedCriteria.filter((item: any) => {
      const matchesSearch = item.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesType =
        selectedType === 'All Types' ||
        item.types.some((type: string) => type === selectedType);

      return matchesSearch && matchesType;
    });
  }, [baseMappedCriteria, searchTerm, selectedType]);

  const hasActiveFilters =
    searchTerm.trim().length > 0 || selectedType !== 'All Types';

  const canCreateVpScoring = AccessGuard.checkAccess({
    permissions: [Permissions.CreateVpScoringConfigurations],
  });

  const openCreateScoring = () => {
    openDrawer();
  };

  const isFilteredOnlyEmpty =
    assignedCriteriaData.length === 0 &&
    baseMappedCriteria.length > 0 &&
    hasActiveFilters;

  const getMenuItems = (item: any): MenuProps['items'] => {
    return [
      {
        key: 'edit',
        label: (
          <AccessGuard
            permissions={[Permissions.UpdateVpScoringConfigurations]}
            data-cy={`okr-criteria-card-edit-access-guard-${item.key}`}
          >
            <div
              className="flex items-center gap-3 py-1"
              onClick={() => handleEditClick(item.key)}
              id={`okr-criteria-card-edit-menu-item-${item.key}`}
              data-cy={`okr-criteria-card-edit-menu-item-${item.key}`}
            >
              <MdModeEditOutline className="text-[#595959] text-xl" />
              <span
                className="text-[15px] text-[#262626]"
                data-cy={`okr-criteria-card-edit-text-${item.key}`}
              >
                Edit OKR
              </span>
            </div>
          </AccessGuard>
        ),
      },
      {
        type: 'divider',
      },
      {
        key: 'delete',
        label: (
          <AccessGuard
            permissions={[Permissions.DeleteVpScoringConfigurations]}
            data-cy={`okr-criteria-card-delete-access-guard-${item.key}`}
          >
            <div
              className="flex items-center gap-3 py-1 text-red-600"
              onClick={() => handleDelete(item.key)}
              id={`okr-criteria-card-delete-menu-item-${item.key}`}
              data-cy={`okr-criteria-card-delete-menu-item-${item.key}`}
            >
              <MdDeleteForever className="text-xl" />
              <span
                className="text-[15px]"
                data-cy={`okr-criteria-card-delete-text-${item.key}`}
              >
                Delete OKR
              </span>
            </div>
          </AccessGuard>
        ),
      },
    ];
  };

  return (
    <div className="w-full" data-cy="okr-criteria-management-page-container">
      {/* Container with Border - Now includes Search/Filter and Cards */}
      <div
        className="rounded-xl pt-5 px-8 pb-8 bg-white min-h-[400px]"
        id="okr-criteria-management-main-container"
        data-cy="okr-criteria-management-main-container"
      >
        {/* Search and Filter Row inside the container */}
        <CriteriaFilters
          onSearch={handleSearch}
          onTypeChange={handleTypeChange}
          criteriaNames={['All Types', ...criteriaTypes]}
          data-cy="okr-criteria-management-filters"
        />

        {vpScoringLoading ? (
          <CriteriaManagementPageSkeleton />
        ) : assignedCriteriaData.length === 0 ? (
          <div
            className="flex min-h-[280px] items-center justify-center py-8"
            data-cy="okr-criteria-management-empty"
            id="okrCriteriaManagementEmptyId"
          >
            <EmptyState
              title={
                isFilteredOnlyEmpty
                  ? 'No scoring configurations match your filters'
                  : 'No VP scoring configurations yet'
              }
              description={
                isFilteredOnlyEmpty
                  ? 'Try adjusting search or the criteria type filter.'
                  : 'Add scoring to define how VP criteria contribute to targets.'
              }
              actionText={
                canCreateVpScoring && !isFilteredOnlyEmpty
                  ? 'Add scoring'
                  : undefined
              }
              onAction={
                canCreateVpScoring && !isFilteredOnlyEmpty
                  ? openCreateScoring
                  : undefined
              }
            />
          </div>
        ) : (
          <div
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
            id="okr-criteria-management-cards-grid"
            data-cy="okr-criteria-management-cards-grid"
          >
            {assignedCriteriaData.map((item: any) => (
              <div
                key={item.key}
                className="relative rounded-[8px] bg-[#F9FAFB] p-5 transition-shadow hover:shadow-sm"
                id={`okr-criteria-card-${item.key}`}
                data-cy={`okr-criteria-card-${item.key}`}
              >
                <div
                  className="mb-6 flex items-start justify-between"
                  data-cy={`okr-criteria-card-header-${item.key}`}
                >
                  <p
                    className="mr-2 flex-1 text-[15px] font-semibold leading-tight text-[#262626]"
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
                        type="button"
                        className="flex h-8 w-8 items-center justify-center text-[#8c8c8c] transition-colors hover:text-[#262626] bg-transparent border-none cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                        data-cy={`okr-criteria-card-menu-button-${item.key}`}
                      >
                        <EllipsisOutlined style={{ fontSize: 14 }} />
                      </button>
                    </Dropdown>
                  </div>
                </div>

                <div
                  className="flex items-center justify-between"
                  data-cy={`okr-criteria-card-footer-${item.key}`}
                >
                  <Tag
                    className="m-0 rounded-[4px] border-[#d9d9d9] bg-[#fafafa] px-2 py-0.5 text-[12px] font-medium text-[#595959]"
                    id={`okr-criteria-card-percentage-${item.key}`}
                    data-cy={`okr-criteria-card-percentage-${item.key}`}
                  >
                    Total %: {item.totalPercentage.replace('%', '')}
                  </Tag>
                  <Tag
                    className="m-0 rounded-[4px] border-[#d9d9d9] bg-[#fafafa] px-2 py-0.5 text-[12px] font-medium text-[#595959]"
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
      <ScoringModal data-cy="okr-criteria-management-drawer" />
    </div>
  );
}

export default Page;
