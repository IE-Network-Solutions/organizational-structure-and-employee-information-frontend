'use client';
import { Button, Typography } from 'antd';
import React from 'react';
import { FaPlus } from 'react-icons/fa';
import { useTalentPoolSettingsStore } from '@/store/uistate/features/recruitment/settings/talentPoolCategory';
import { useGetTalentPoolCategory } from '@/store/server/features/recruitment/tallentPoolCategory/query';
import CustomDeleteTalentPool from '../deleteModal';
import SkeletonLoading from '@/components/common/loadings/skeletonLoading';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { Pencil, Trash2 } from 'lucide-react';
import TalentPoolDrawer from '../customDrawer';
import { useIsMobile } from '@/hooks/useIsMobile';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import CustomPagination from '@/components/customPagination';

const { Title } = Typography;

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

  const handleEditTalentPoolCategory = (data: any) => {
    openDrawer();
    setEditMode(true);
    setSelectedTalentPool(data);
  };

  const handleDeleteTalentPoolCategory = (data: any) => {
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
  return (
    <div
      className="p-5 rounded-2xl bg-white h-full"
      data-cy="talent-acquisition-talent-pool-category-page-container"
    >
      {/* Header section */}
      <div
        className="flex justify-between items-center mb-4"
        data-cy="talent-acquisition-talent-pool-category-page-header"
      >
        <Title
          level={5}
          data-cy="talent-acquisition-talent-pool-category-page-title"
        >
          Talent Pool Category
        </Title>
        <AccessGuard permissions={[Permissions.CreateTalentPool]}>
          <Button
            type="primary"
            id="createTalentPoolButton"
            data-cy="talent-acquisition-talent-pool-category-button-new"
            onClick={openDrawer}
            className="h-10 w-10 sm:w-auto"
            icon={
              <FaPlus data-cy="talent-acquisition-talent-pool-category-button-new-icon" />
            }
          >
            <span
              className="hidden lg:inline"
              data-cy="talent-acquisition-talent-pool-category-button-new-text"
            >
              {' '}
              Talent Pool Category
            </span>
          </Button>
        </AccessGuard>
      </div>
      <div
        data-cy="settings-talentpoolcategory-talentpoolcategorytab-page-tsx-page-div-94"
        className="space-y-4 w-full"
      >
        {fetchLoading ? (
          <>
            <SkeletonLoading
              alignment="vertical"
              componentType="card"
              count={3}
              type="default"
            />
          </>
        ) : (
          talentPoolCategories?.items?.map((talentPool: any, index: number) => (
            <div
              key={index}
              className="flex items-center justify-between gap-3 my-5 mx-2 border-gray-100 border-[1px] rounded-md px-2 py-4"
              data-cy="recruitment-recruitment-settings-talentpoolcategory-talentpoolcategorytab-page-tsx-div-109"
            >
              <div
                data-cy="settings-talentpoolcategory-talentpoolcategorytab-page-tsx-page-div-110"
                className="text-medium font-medium"
              >
                {talentPool?.title}
              </div>

              <div
                data-cy="settings-talentpoolcategory-talentpoolcategorytab-page-tsx-page-div-112"
                className="flex items-center justify-center gap-2"
              >
                <AccessGuard
                  permissions={[Permissions.UpdateTalentPoolCategory]}
                >
                  <div
                    data-cy="settings-talentpoolcategory-talentpoolcategorytab-page-tsx-page-div-116"
                    className="bg-[#2f78ee] w-7 h-7 rounded-md flex items-center justify-center"
                  >
                    <Pencil
                      id={`talent-acquisition-talent-pool-category-button-edit-${talentPool?.id}`}
                      data-cy={`talent-acquisition-talent-pool-category-button-edit-${talentPool?.id}`}
                      size={15}
                      className="text-white cursor-pointer"
                      onClick={() => handleEditTalentPoolCategory(talentPool)}
                    />
                  </div>
                </AccessGuard>
                <AccessGuard
                  permissions={[Permissions.DeleteTalentPoolCategory]}
                >
                  <div
                    data-cy="settings-talentpoolcategory-talentpoolcategorytab-page-tsx-page-div-129"
                    className="bg-[#e03137] w-7 h-7 rounded-md flex items-center justify-center"
                  >
                    <Trash2
                      id={`talent-acquisition-talent-pool-category-button-delete-${talentPool?.id}`}
                      data-cy={`talent-acquisition-talent-pool-category-button-delete-${talentPool?.id}`}
                      size={15}
                      className="text-white cursor-pointer"
                      onClick={() => handleDeleteTalentPoolCategory(talentPool)}
                    />
                  </div>
                </AccessGuard>
              </div>
            </div>
          ))
        )}
      </div>
      <TalentPoolDrawer />
      <CustomDeleteTalentPool />
      {isMobile || isTablet ? (
        <CustomMobilePagination
          totalResults={talentPoolCategories?.meta?.totalItems ?? 1}
          pageSize={pageSize}
          onChange={onPageChange}
          onShowSizeChange={onPageChange}
        />
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
