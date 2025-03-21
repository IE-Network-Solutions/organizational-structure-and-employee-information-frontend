'use client';
import React from 'react';
import { Button, List } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import AppreciationTypeDrawer from './_components/appreciation-type';
import { useGetAppreciationType } from '@/store/server/features/okrplanning/monitoring-evaluation/appreciation-type/queries';
import { useDeleteAppType } from '@/store/server/features/okrplanning/monitoring-evaluation/appreciation-type/mutations';
import DeleteModal from '@/components/common/deleteConfirmationModal';
import { useAppTypeStore } from '@/store/uistate/features/okrplanning/monitoring-evaluation/appreciation-type';
import { AppreciationType } from '@/store/uistate/features/okrplanning/monitoring-evaluation/appreciation-type/interface';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';

const DefineAppreciation = () => {
  const {
    open,
    setOpen,
    openDeleteModal,
    setOpenDeleteModal,
    deletedId,
    setDeletedId,
    appType,
    setAppType,
  } = useAppTypeStore();

  const { mutate: deleteAppType } = useDeleteAppType();
  const showDrawer = () => {
    setOpen(true);
  };
  const onClose = () => {
    setOpen(false);
  };
  const showDeleteModal = (id: string) => {
    setOpenDeleteModal(true);
    setDeletedId(id);
  };
  const onCloseDeleteModal = () => {
    setOpenDeleteModal(false);
  };
  const handleEditModal = (value: AppreciationType) => {
    setAppType({ ...value, weight: Number(value.weight) });
    setOpen(true);
  };
  function handleDeleteAppType(id: string) {
    deleteAppType(id, {
      onSuccess: () => {
        onCloseDeleteModal();
      },
    });
  }
  const { data: appTypes, isLoading } = useGetAppreciationType();
  return (
    <div className="p-6   w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Appreciation</h2>
        <AccessGuard permissions={[Permissions.CreateAppreciationType]}>
          <Button
            type="primary"
            className="bg-blue-500 hover:bg-blue-600 focus:bg-blue-600"
            onClick={showDrawer}
          >
            + Add Type
          </Button>
        </AccessGuard>
      </div>

      <List
        dataSource={appTypes?.items}
        loading={isLoading}
        renderItem={(item) => (
          <List.Item className="flex justify-between items-center py-4 px-4 rounded-xl my-3 border border-gray-200">
            <span className="">{item?.name}</span>
            <div>
              <AccessGuard permissions={[Permissions.UpdateAppreciationType]}>
                <Button
                  icon={<EditOutlined />}
                  className="mr-2 bg-blue text-white"
                  shape="circle"
                  onClick={() => handleEditModal(item)}
                />
              </AccessGuard>
              <AccessGuard permissions={[Permissions.DeleteAppreciationType]}>
                <Button
                  icon={<DeleteOutlined />}
                  className="mr-2 bg-red-500 text-white"
                  shape="circle"
                  onClick={() => showDeleteModal(item?.id as string)}
                />
              </AccessGuard>
            </div>
          </List.Item>
        )}
      />
      <AppreciationTypeDrawer appType={appType} open={open} onClose={onClose} />
      <DeleteModal
        open={openDeleteModal}
        onConfirm={() => handleDeleteAppType(deletedId)}
        onCancel={onCloseDeleteModal}
      />
    </div>
  );
};

export default DefineAppreciation;
