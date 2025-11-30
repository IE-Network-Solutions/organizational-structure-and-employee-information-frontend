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
    <div
      className="p-6   w-full"
      id="okr-define-appreciation-container"
      data-cy="okr-define-appreciation-container"
    >
      <div
        className="flex justify-between items-center mb-4"
        id="okr-define-appreciation-header"
        data-cy="okr-define-appreciation-header"
      >
        <h2
          className="text-lg font-semibold"
          id="okr-define-appreciation-title"
          data-cy="okr-define-appreciation-title"
        >
          Appreciation
        </h2>
        <AccessGuard
          data-cy="okr-define-appreciation-add-button-access-guard-display-guard"
          permissions={[Permissions.CreateAppreciationType]}
        >
          <Button
            type="primary"
            className="bg-blue-500 hover:bg-blue-600 focus:bg-blue-600"
            onClick={showDrawer}
            id="okr-define-appreciation-add-button"
            data-cy="okr-define-appreciation-add-button"
          >
            + Add Type
          </Button>
        </AccessGuard>
      </div>

      <List
        dataSource={appTypes?.items}
        loading={isLoading}
        id="okr-define-appreciation-list"
        data-cy="okr-define-appreciation-list"
        renderItem={(item) => (
          <List.Item
            className="flex justify-between items-center py-4 px-4 rounded-xl my-3 border border-gray-200"
            id={`okr-define-appreciation-list-item-${item?.id}`}
            data-cy={`okr-define-appreciation-list-item-${item?.id}`}
          >
            <span
              className=""
              id={`okr-define-appreciation-list-item-name-${item?.id}`}
              data-cy={`okr-define-appreciation-list-item-name-${item?.id}`}
            >
              {item?.name}
            </span>
            <div
              id={`okr-define-appreciation-list-item-actions-${item?.id}`}
              data-cy={`okr-define-appreciation-list-item-actions-${item?.id}`}
            >
              <AccessGuard
                data-cy="okr-define-appreciation-table-edit-button-access-guard-display-guard"
                permissions={[Permissions.UpdateAppreciationType]}
              >
                <Button
                  icon={<EditOutlined />}
                  className="mr-2 bg-blue text-white"
                  shape="circle"
                  onClick={() => handleEditModal(item)}
                  id={`okr-define-appreciation-edit-button-${item?.id}`}
                  data-cy={`okr-define-appreciation-edit-button-${item?.id}`}
                />
              </AccessGuard>
              <AccessGuard
                data-cy="okr-define-appreciation-table-delete-button-access-guard-display-guard"
                permissions={[Permissions.DeleteAppreciationType]}
              >
                <Button
                  icon={
                    <DeleteOutlined
                      data-cy={`okr-define-appreciation-table-delete-button-icon-${item?.id}`}
                    />
                  }
                  className="mr-2 bg-red-500 text-white"
                  shape="circle"
                  onClick={() => showDeleteModal(item?.id as string)}
                  id={`okr-define-appreciation-delete-button-${item?.id}`}
                  data-cy={`okr-define-appreciation-delete-button-${item?.id}`}
                />
              </AccessGuard>
            </div>
          </List.Item>
        )}
      />
      <AppreciationTypeDrawer
        appType={appType}
        open={open}
        onClose={onClose}
        data-cy="okr-define-appreciation-drawer"
      />
      <DeleteModal
        open={openDeleteModal}
        onConfirm={() => handleDeleteAppType(deletedId)}
        onCancel={onCloseDeleteModal}
        data-cy="okr-define-appreciation-delete-modal"
      />
    </div>
  );
};

export default DefineAppreciation;
