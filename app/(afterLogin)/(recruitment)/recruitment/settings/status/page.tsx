'use client';
import { Button, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import React, { useCallback, useEffect } from 'react';
import { useRecruitmentStatusStore } from '@/store/uistate/features/recruitment/settings/status';
import RecruitmentStatusDrawer from './statusDrawer';
import { useGetRecruitmentStatuses } from '@/store/server/features/recruitment/settings/status/queries';
import SkeletonLoading from '@/components/common/loadings/skeletonLoading';
import DeleteModal from '@/components/common/deleteConfirmationModal';
import { useDeleteRecruitmentStatus } from '@/store/server/features/recruitment/settings/status/mutation';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { MoreHorizontal, Pencil, Trash2, UserPlus } from 'lucide-react';
import { useSettingsAddButton } from '../SettingsAddButtonContext';
import { useIsMobile } from '@/hooks/useIsMobile';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import CustomPagination from '@/components/customPagination';

const canUpdate = () =>
  AccessGuard.checkAccess({
    permissions: [Permissions.UpdateApplicationStage],
  });
const canDelete = () =>
  AccessGuard.checkAccess({
    permissions: [Permissions.DeleteApplicationStage],
  });

function getLevelLabel(order: number, total: number): string {
  if (order === total && total > 0) return 'Last Stage';
  const n = order;
  if (n === 1) return '1st Level';
  if (n === 2) return '2nd Level';
  if (n === 3) return '3rd Level';
  return `${n}th Level`;
}

const Status: React.FC = () => {
  const {
    isDeleteModalOpen,
    setIsDrawerOpen,
    setSelectedStatus,
    setEditMode,
    setIsDeleteModalOpen,
    selectedStatus,
    setCurrentPage,
    setPage,
    pageSize,
    currentPage,
  } = useRecruitmentStatusStore();

  const { isMobile, isTablet } = useIsMobile();

  const { data: recruitmentStatus, isLoading: fetchLoading } =
    useGetRecruitmentStatuses(pageSize, currentPage);

  const { mutate: deleteRecruitmentStatus } = useDeleteRecruitmentStatus();
  const handleEditStatus = (status: any) => {
    setSelectedStatus(status);
    setIsDrawerOpen(true);
    setEditMode(true);
  };

  const handleDeleteStatus = (status: any) => {
    setSelectedStatus(status);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = () => {
    deleteRecruitmentStatus(selectedStatus?.id);
    setIsDeleteModalOpen(false);
    setSelectedStatus(null);
  };

  const handleOpen = useCallback(() => {
    setIsDrawerOpen(true);
    setEditMode(false);
    setSelectedStatus(null);
  }, [setIsDrawerOpen, setEditMode, setSelectedStatus]);

  const { setAddAction } = useSettingsAddButton();
  const canCreate = AccessGuard.checkAccess({
    permissions: [Permissions.CreateApplicationStage],
  });
  useEffect(() => {
    if (canCreate) setAddAction(() => handleOpen);
    return () => setAddAction(null);
  }, [setAddAction, canCreate, handleOpen]);

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
  const totalItems = recruitmentStatus?.meta?.totalItems ?? 0;

  return (
    <div
      className="p-5 rounded-2xl bg-white h-full"
      data-cy="talent-acquisition-status-page-container"
    >
      {/* Header: Define Status button on the right (desktop only; mobile uses tab bar Add button) */}
      <div
        className="hidden md:flex justify-end items-center mb-6"
        data-cy="talent-acquisition-status-page-header"
      >
        <AccessGuard permissions={[Permissions.CreateApplicationStage]}>
          <Button
            type="primary"
            id="createStatusButton"
            data-cy="talent-acquisition-status-button-define-new"
            onClick={handleOpen}
            className="h-10 px-4 recruitment-settings-primary-btn"
            icon={
              <UserPlus
                size={18}
                data-cy="talent-acquisition-status-button-define-new-icon"
              />
            }
          >
            <span
              className="hidden sm:inline"
              data-cy="talent-acquisition-status-button-define-new-text"
            >
              Define Status
            </span>
          </Button>
        </AccessGuard>
      </div>

      {/* Status cards grid */}
      <div
        data-cy="recruitment-settings-status-page-tsx-page-div-107"
        className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full"
      >
        {fetchLoading ? (
          <SkeletonLoading
            alignment="vertical"
            componentType="card"
            count={4}
            type="default"
          />
        ) : (
          recruitmentStatus?.items?.map((status: any, index: number) => {
            const order = (currentPage - 1) * pageSize + index + 1;
            const isLastStage = order === totalItems && totalItems > 0;
            const levelLabel = getLevelLabel(order, totalItems);

            const menuItems: MenuProps['items'] = [
              canUpdate() && {
                key: 'edit',
                label: 'Edit',
                icon: <Pencil size={14} className="text-gray-900" />,
                disabled: status?.isFixed === true,
                onClick: () => handleEditStatus(status),
              },
              canDelete() && {
                key: 'delete',
                label: 'Delete',
                icon: <Trash2 size={14} className="text-gray-900" />,
                danger: true,
                disabled: status?.isFixed === true,
                onClick: () => handleDeleteStatus(status),
              },
            ].filter(Boolean) as MenuProps['items'];

            const showMenu = !isLastStage && menuItems && menuItems.length > 0;

            return (
              <div
                key={status?.id ?? index}
                className="recruitment-settings-card relative p-4 min-h-[120px]"
                data-cy="recruitment-settings-status-card"
              >
                {showMenu && (
                  <div
                    className="absolute top-3 right-3"
                    data-cy="talent-acquisition-status-card-menu-wrapper"
                  >
                    <Dropdown
                      menu={{ items: menuItems }}
                      trigger={['click']}
                      placement="bottomRight"
                      overlayClassName="recruitment-settings-dropdown-overlay"
                    >
                      <button
                        type="button"
                        className="recruitment-settings-more-btn p-1 text-gray-500"
                        data-cy={`talent-acquisition-status-card-menu-${status?.id}`}
                        aria-label="More options"
                      >
                        <MoreHorizontal size={18} />
                      </button>
                    </Dropdown>
                  </div>
                )}
                <div
                  className="flex flex-wrap items-center gap-2 pr-8"
                  data-cy="talent-acquisition-status-card-content"
                >
                  <h3
                    className="recruitment-settings-card-title text-[14px] font-normal"
                    data-cy="recruitment-settings-status-card-title"
                  >
                    {status?.title}
                  </h3>
                  <span
                    className="recruitment-settings-card-level inline-block px-2.5 py-0.5 rounded"
                    data-cy="recruitment-settings-status-card-level"
                  >
                    {levelLabel}
                  </span>
                </div>
                {status?.description && (
                  <p
                    className="recruitment-settings-card-description mt-2 leading-snug"
                    data-cy="recruitment-settings-status-card-description"
                  >
                    {status.description}
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>
      <RecruitmentStatusDrawer />
      <DeleteModal
        open={isDeleteModalOpen}
        onCancel={() => {
          setIsDeleteModalOpen(false);
        }}
        onConfirm={handleDelete}
        title="Delete Status"
        deleteMessage="Are you Sure you want to delete this state ?"
        hideImage
        danger
        modalClassName="recruitment-settings-delete-modal"
      />

      {isMobile || isTablet ? (
        <div
          className="mt-6"
          data-cy="talent-acquisition-status-mobile-pagination"
        >
          <CustomMobilePagination
            totalResults={recruitmentStatus?.meta?.totalItems ?? 1}
            pageSize={pageSize}
            onChange={onPageChange}
            onShowSizeChange={onPageChange}
          />
        </div>
      ) : (
        <CustomPagination
          current={currentPage}
          total={recruitmentStatus?.meta?.totalItems ?? 1}
          pageSize={pageSize}
          onChange={onPageChange}
          onShowSizeChange={onSizeChange}
        />
      )}
    </div>
  );
};

export default Status;
