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
        className="border border-[#f0f0f0] rounded-xl pt-5 px-8 pb-8 bg-white min-h-[400px]"
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
                className="bg-white border border-[#d9d9d9] rounded-[8px] py-3 px-4 min-h-[78px] hover:shadow-sm transition-shadow relative flex flex-col justify-between"
                id={`okr-criteria-card-${item.key}`}
                data-cy={`okr-criteria-card-${item.key}`}
              >
                {/* Top Row: Name and Menu */}
                <div
                  className="flex justify-between items-start"
                  data-cy={`okr-criteria-card-header-${item.key}`}
                >
                  <p
                    className="text-[14px] font-normal text-black flex-1 mr-2 leading-tight"
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
                        className="w-6 h-6 flex items-center justify-center border border-[#d9d9d9] rounded-[6px] text-[#374151] transition-colors"
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
                    className="h-[22px] px-2 py-0.5 text-[12px] font-medium text-[#595959] border-[#d9d9d9] bg-[#fafafa] rounded-[4px] m-0 inline-flex items-center"
                    id={`okr-criteria-card-percentage-${item.key}`}
                    data-cy={`okr-criteria-card-percentage-${item.key}`}
                  >
                    Total %: {item.totalPercentage.replace('%', '')}
                  </Tag>
                  <Tag
                    className="h-[22px] px-2 py-0.5 text-[12px] font-medium text-[#595959] border-[#d9d9d9] bg-[#fafafa] rounded-[4px] m-0 inline-flex items-center"
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
