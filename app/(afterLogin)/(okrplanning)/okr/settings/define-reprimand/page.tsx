'use client';
import React from 'react';
import { Button, List } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import ReprimandTypeDrawer from './_components/reprimand-type';
import { useGetReprimandType } from '@/store/server/features/okrplanning/monitoring-evaluation/reprimand-type/queries';
import { ReprimandType } from '@/store/uistate/features/okrplanning/monitoring-evaluation/reprimand-type/interface';
import { useDeleteRepType } from '@/store/server/features/okrplanning/monitoring-evaluation/reprimand-type/mutations';
import { useRepTypeStore } from '@/store/uistate/features/okrplanning/monitoring-evaluation/reprimand-type';
import DeleteModal from '@/components/common/deleteConfirmationModal';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';

const DefineReprimand = () => {
  const {
    open,
    setOpen,
    openDeleteModal,
    setOpenDeleteModal,
    deletedId,
    setDeletedId,
    repType,
    setRepType,
  } = useRepTypeStore();

  const { mutate: deleteAppType } = useDeleteRepType();
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
  const handleEditModal = (value: ReprimandType) => {
    setRepType({ ...value, weight: Number(value.weight) });
    setOpen(true);
  };
  function handleDeleteRepType(id: string) {
    deleteAppType(id, {
      onSuccess: () => {
        onCloseDeleteModal();
      },
    });
  }
  const { data: repTypes, isLoading } = useGetReprimandType();
  return (
    <div className="p-6  w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Reprimand</h2>
        <AccessGuard permissions={[Permissions.CreateReprimandType]}>
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
        dataSource={repTypes?.items}
        loading={isLoading}
        renderItem={(item) => (
          <List.Item className="flex justify-between items-center py-4 px-4 rounded-xl my-3 border border-gray-200">
            <span className="">{item?.name}</span>
            <div>
              <AccessGuard permissions={[Permissions.UpdateReprimandType]}>
                <Button
                  icon={<EditOutlined />}
                  className="mr-2 bg-blue text-white"
                  shape="circle"
                  onClick={() => handleEditModal(item)}
                />
              </AccessGuard>
              <AccessGuard permissions={[Permissions.DeleteReprimandType]}>
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
      <ReprimandTypeDrawer
        repType={repType || undefined}
        open={open}
        onClose={onClose}
      />
      <DeleteModal
        open={openDeleteModal}
        onConfirm={() => handleDeleteRepType(deletedId)}
        onCancel={onCloseDeleteModal}
      />
    </div>
  );
};

export default DefineReprimand;
