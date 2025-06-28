'use client';
import { Button, Typography } from 'antd';
import React from 'react';
import { useRecruitmentStatusStore } from '@/store/uistate/features/recruitment/settings/status';
import RecruitmentStatusDrawer from './statusDrawer';
import { useGetRecruitmentStatuses } from '@/store/server/features/recruitment/settings/status/queries';
import SkeletonLoading from '@/components/common/loadings/skeletonLoading';
import { FaPlus } from 'react-icons/fa';
import DeleteModal from '@/components/common/deleteConfirmationModal';
import { useDeleteRecruitmentStatus } from '@/store/server/features/recruitment/settings/status/mutation';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { Pencil, Trash2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/useIsMobile';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import CustomPagination from '@/components/customPagination';

const { Title } = Typography;

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

  const handleOpen = () => {
    setIsDrawerOpen(true);
    setEditMode(false);
    setSelectedStatus(null);
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
    <div className="p-5 rounded-2xl bg-white h-full">
      {/* Header section */}
      <div className="flex justify-between items-center mb-4">
        <Title level={5}>Define New Status</Title>
        <AccessGuard permissions={[Permissions.CreateApplicationStage]}>
          <Button
            type="primary"
            id="createStatusButton"
            onClick={handleOpen}
            className="h-10 w-10 sm:w-auto"
            icon={<FaPlus />}
          >
            <span className="hidden lg:inline">Define New Status</span>
          </Button>
        </AccessGuard>
      </div>

      <div className="space-y-4 w-full">
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
          recruitmentStatus?.items?.map((status: any, index: number) => (
            <div
              key={index}
              className="flex items-center justify-between gap-3 my-5 mx-2 border-gray-100 border-[1px] rounded-md px-2 py-4"
            >
              <div className="text-medium font-medium">{status?.title}</div>
              <div className="flex items-center justify-center gap-2">
                <AccessGuard permissions={[Permissions.UpdateApplicationStage]}>
                  <div className="bg-[#2f78ee] w-7 h-7 rounded-md flex items-center justify-center">
                    <Pencil
                      size={15}
                      className="text-white cursor-pointer"
                      onClick={() => handleEditStatus(status)}
                    />
                  </div>
                </AccessGuard>
                <AccessGuard permissions={[Permissions.DeleteApplicationStage]}>
                  <div className="bg-[#e03137] w-7 h-7 rounded-md flex items-center justify-center">
                    <Trash2
                      size={15}
                      className="text-white cursor-pointer"
                      onClick={() => handleDeleteStatus(status)}
                    />
                  </div>
                </AccessGuard>
              </div>
            </div>
          ))
        )}
      </div>
      <RecruitmentStatusDrawer />
      <DeleteModal
        open={isDeleteModalOpen}
        onCancel={() => {
          setIsDeleteModalOpen(false);
        }}
        onConfirm={handleDelete}
      />

      {isMobile || isTablet ? (
        <CustomMobilePagination
          totalResults={recruitmentStatus?.meta?.totalItems ?? 1}
          pageSize={pageSize}
          onChange={onPageChange}
          onShowSizeChange={onPageChange}
        />
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
