'use client';
import { Button, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import React, { useEffect } from 'react';
import { useTalentPoolSettingsStore } from '@/store/uistate/features/recruitment/settings/talentPoolCategory';
import { useGetTalentPoolCategory } from '@/store/server/features/recruitment/tallentPoolCategory/query';
import CustomDeleteTalentPool from '../deleteModal';
import SkeletonLoading from '@/components/common/loadings/skeletonLoading';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { MoreHorizontal, Pencil, Trash2, UserPlus } from 'lucide-react';
import TalentPoolDrawer from '../customDrawer';
import { useSettingsAddButton } from '../../SettingsAddButtonContext';
import { useIsMobile } from '@/hooks/useIsMobile';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import CustomPagination from '@/components/customPagination';

const canUpdate = () =>
  AccessGuard.checkAccess({
    permissions: [Permissions.UpdateTalentPoolCategory],
  });
const canDelete = () =>
  AccessGuard.checkAccess({
    permissions: [Permissions.DeleteTalentPoolCategory],
  });

function TalentPoolCategoryTab() {
  const {
    openDrawer,
    setEditMode,
    setDeleteMode,
    setSelectedTalentPool,
    setCurrentPage,
    setPage,
    pageSize,
    currentPage,
  } = useTalentPoolSettingsStore();

  const { isMobile, isTablet } = useIsMobile();

  const { data: talentPoolCategories, isLoading: fetchLoading } =
    useGetTalentPoolCategory(pageSize, currentPage);

  const handleEditTalentPoolCategory = (data: any): void => {
    openDrawer();
    setEditMode(true);
    setSelectedTalentPool(data);
  };

  const handleDeleteTalentPoolCategory = (data: any): void => {
    setSelectedTalentPool(data);
    setDeleteMode(true);
  };

  const onPageChange = (page: number, pageSize?: number) => {
    setCurrentPage(page);
    if (pageSize) {
      setPage(pageSize);
    }
  };
  const onSizeChange = (size: number) => {
    setPage(size);
    setCurrentPage(1);
  };

  const { setAddAction } = useSettingsAddButton();
  const canCreate = AccessGuard.checkAccess({
    permissions: [Permissions.CreateTalentPool],
  });
  useEffect(() => {
    if (canCreate) setAddAction(() => openDrawer);
    return () => setAddAction(null);
  }, [setAddAction, canCreate, openDrawer]);

  return (
    <div
      className="p-5 rounded-2xl bg-white h-full"
      data-cy="talent-acquisition-talent-pool-category-page-container"
    >
      {/* Header: Add Category button on the right (desktop only; mobile uses tab bar Add button) */}
      <div
        className="hidden md:flex justify-end items-center mb-6"
        data-cy="talent-acquisition-talent-pool-category-page-header"
      >
        <AccessGuard permissions={[Permissions.CreateTalentPool]}>
          <Button
            type="primary"
            id="createTalentPoolButton"
            data-cy="talent-acquisition-talent-pool-category-button-new"
            onClick={openDrawer}
            className="h-10 px-4 recruitment-settings-primary-btn"
            icon={
              <UserPlus
                size={18}
                data-cy="talent-acquisition-talent-pool-category-button-new-icon"
              />
            }
          >
            <span
              className="hidden sm:inline"
              data-cy="talent-acquisition-talent-pool-category-button-new-text"
            >
              Add Category
            </span>
          </Button>
        </AccessGuard>
      </div>

      {/* Talent Pool Category cards grid */}
      <div
        data-cy="settings-talentpoolcategory-talentpoolcategorytab-page-tsx-page-div-94"
        className="grid grid-cols-1 lg:grid-cols-3 gap-4 w-full"
      >
        {fetchLoading ? (
          <SkeletonLoading
            alignment="vertical"
            componentType="card"
            count={6}
            type="default"
          />
        ) : (
          talentPoolCategories?.items?.map((talentPool: any, index: number) => {
            const menuItems: MenuProps['items'] = [
              canUpdate() && {
                key: 'edit',
                label: 'Edit',
                icon: <Pencil size={14} />,
                onClick: () => handleEditTalentPoolCategory(talentPool),
              },
              canDelete() && {
                key: 'delete',
                label: 'Delete',
                icon: <Trash2 size={14} />,
                danger: true,
                onClick: () => handleDeleteTalentPoolCategory(talentPool),
              },
            ].filter(Boolean) as MenuProps['items'];

            const showMenu = menuItems && menuItems.length > 0;

            return (
              <div
                key={talentPool?.id ?? index}
                className="recruitment-settings-card relative p-4 flex items-center justify-between min-h-[56px]"
                data-cy="talent-acquisition-talent-pool-category-card"
              >
                <span
                  className="recruitment-settings-card-title font-medium text-gray-900"
                  data-cy={`talent-acquisition-talent-pool-category-card-title-${talentPool?.id}`}
                >
                  {talentPool?.title}
                </span>
                {showMenu && (
                    <Dropdown
                      menu={{ items: menuItems }}
                      trigger={['click']}
                      placement="bottomRight"
                      overlayClassName="recruitment-settings-dropdown-overlay"
                    >
                    <button
                      type="button"
                      className="recruitment-settings-more-btn p-1 text-gray-500"
                      data-cy={`talent-acquisition-talent-pool-category-card-menu-${talentPool?.id}`}
                      aria-label="More options"
                    >
                      <MoreHorizontal size={18} />
                    </button>
                  </Dropdown>
                )}
              </div>
            );
          })
        )}
      </div>
      <TalentPoolDrawer />
      <CustomDeleteTalentPool />
      {isMobile || isTablet ? (
        <div className="mt-6">
          <CustomMobilePagination
            totalResults={talentPoolCategories?.meta?.totalItems ?? 1}
            pageSize={pageSize}
            onChange={onPageChange}
            onShowSizeChange={onPageChange}
          />
        </div>
      ) : (
        <CustomPagination
          current={currentPage}
          total={talentPoolCategories?.meta?.totalItems ?? 1}
          pageSize={pageSize}
          onChange={onPageChange}
          onShowSizeChange={onSizeChange}
        />
      )}
    </div>
  );
}

export default TalentPoolCategoryTab;
