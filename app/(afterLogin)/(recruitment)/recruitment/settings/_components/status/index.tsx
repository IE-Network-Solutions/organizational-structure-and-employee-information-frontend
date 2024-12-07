import { Button, Card } from 'antd';
import React from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { useRecruitmentStatusStore } from '@/store/uistate/features/recruitment/settings/status';
import RecruitmentStatusDrawer from './statusDrawer';
import { useGetRecruitmentStatuses } from '@/store/server/features/recruitment/settings/status/queries';
import SkeletonLoading from '@/components/common/loadings/skeletonLoading';
import { FaEdit, FaTrashAlt } from 'react-icons/fa';
import DeleteModal from '@/components/common/deleteConfirmationModal';
import { useDeleteRecruitmentStatus } from '@/store/server/features/recruitment/settings/status/mutation';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';

const Status: React.FC = () => {
  const {
    isDeleteModalOpen,
    setIsDrawerOpen,
    setSelectedStatus,
    setEditMode,
    setIsDeleteModalOpen,
    selectedStatus,
  } = useRecruitmentStatusStore();

  const { data: recruitmentStatus, isLoading: fetchLoading } =
    useGetRecruitmentStatuses();

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
  return (
    <div className="p-6">
      {/* Header section */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-semibold">Status</h3>
        <AccessGuard permissions={[Permissions.CreateApplicationStage]}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleOpen}
            className="bg-purple-600 h-16 font-bold"
          >
            Define New Status
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
            <Card key={index} className="shadow-sm rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">
                  {status.title ?? ''}
                </span>

                <div>
                  <AccessGuard permissions={[Permissions.UpdateApplicationStage]}>
                    <Button
                      icon={<FaEdit />}
                      onClick={() => handleEditStatus(status)}
                      type="default"
                      size={'large'}
                      className="border-none text-blue-600 mr-2"
                    />
                  </AccessGuard>
                  <AccessGuard permissions={[Permissions.DeleteApplicationStage]}>
                    <Button
                      icon={<FaTrashAlt />}
                      onClick={() => handleDeleteStatus(status)}
                      type="default"
                      size={'large'}
                      className="border-none text-red-600"
                    />
                  </AccessGuard>
                </div>
              </div>
            </Card>
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
    </div>
  );
};

export default Status;
