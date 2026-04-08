'use client';
import React from 'react';
import { Button, List } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
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
    <div
      className="p-6  w-full"
      id="okr-define-reprimand-container"
      data-cy="okr-define-reprimand-container"
    >
      <div
        className="flex justify-between items-center mb-4"
        id="okr-define-reprimand-header"
        data-cy="okr-define-reprimand-header"
      >
        <h2
          className="text-lg font-semibold"
          id="okr-define-reprimand-title"
          data-cy="okr-define-reprimand-title"
        >
          Reprimand
        </h2>
        <AccessGuard
          data-cy="okr-define-reprimand-add-button-access-guard-display-guard"
          permissions={[Permissions.CreateReprimandType]}
        >
          <Button
            type="primary"
            className="bg-blue-500 hover:bg-blue-600 focus:bg-blue-600"
            onClick={showDrawer}
            id="okr-define-reprimand-add-button"
            data-cy="okr-define-reprimand-add-button"
          >
            + Add Type
          </Button>
        </AccessGuard>
      </div>

      <List
        dataSource={repTypes?.items}
        loading={isLoading}
        id="okr-define-reprimand-list"
        data-cy="okr-define-reprimand-list"
        renderItem={(item) => (
          <List.Item
            className="flex justify-between items-center py-4 px-4 rounded-xl my-3 border border-gray-200"
            id={`okr-define-reprimand-list-item-${item?.id}`}
            data-cy={`okr-define-reprimand-list-item-${item?.id}`}
          >
            <span
              className=""
              id={`okr-define-reprimand-list-item-name-${item?.id}`}
              data-cy={`okr-define-reprimand-list-item-name-${item?.id}`}
            >
              {item?.name}
            </span>
            <div
              id={`okr-define-reprimand-list-item-actions-${item?.id}`}
              data-cy={`okr-define-reprimand-list-item-actions-${item?.id}`}
            >
              <AccessGuard
                data-cy="okr-define-reprimand-table-edit-button-access-guard-display-guard"
                permissions={[Permissions.UpdateReprimandType]}
              >
                <Button
                  icon={
                    <EditOutlinedIcon
                      data-cy={`okr-define-reprimand-table-edit-button-icon-${item?.id}`}
                    />
                  }
                  className="mr-2 bg-blue text-white"
                  shape="circle"
                  onClick={() => handleEditModal(item)}
                  id={`okr-define-reprimand-edit-button-${item?.id}`}
                  data-cy={`okr-define-reprimand-edit-button-${item?.id}`}
                />
              </AccessGuard>
              <AccessGuard
                data-cy="okr-define-reprimand-table-delete-button-access-guard-display-guard"
                permissions={[Permissions.DeleteReprimandType]}
              >
                <Button
                  icon={
                    <DeleteOutlined
                      data-cy={`okr-define-reprimand-table-delete-button-icon-${item?.id}`}
                    />
                  }
                  className="mr-2 bg-red-500 text-white"
                  shape="circle"
                  onClick={() => showDeleteModal(item?.id as string)}
                  id={`okr-define-reprimand-delete-button-${item?.id}`}
                  data-cy={`okr-define-reprimand-delete-button-${item?.id}`}
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
        data-cy="okr-define-reprimand-drawer"
      />
      <DeleteModal
        open={openDeleteModal}
        onConfirm={() => handleDeleteRepType(deletedId)}
        onCancel={onCloseDeleteModal}
        data-cy="okr-define-reprimand-delete-modal"
      />
    </div>
  );
};

export default DefineReprimand;
