'use client';

import DeleteModal from '@/components/common/deleteConfirmationModal';
import { OkrRule } from '@/store/uistate/features/okrplanning/monitoring-evaluation/okr-rule/interface';
import { Button, List } from 'antd';
import React from 'react';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useOkrRuleStore } from '@/store/uistate/features/okrplanning/monitoring-evaluation/okr-rule';
import { useDeleteOkrRule } from '@/store/server/features/okrplanning/monitoring-evaluation/okr-rule/mutations';
import { useGetOkrRule } from '@/store/server/features/okrplanning/monitoring-evaluation/okr-rule/queries';
import OkrRuleDrawer from './okr-rule';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { FaPlus } from 'react-icons/fa';

const DefineOkrRule = () => {
  const {
    open,
    setOpen,
    openDeleteModal,
    setOpenDeleteModal,
    deletedId,
    setDeletedId,
    okrRule,
    setOkrRule,
  } = useOkrRuleStore();

  const { mutate: deleteOkrRule } = useDeleteOkrRule();
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
  const handleEditModal = (value: OkrRule) => {
    setOkrRule(value);
    setOpen(true);
  };
  function handleDeleteOkrRule(id: string) {
    deleteOkrRule(id, {
      onSuccess: () => {
        onCloseDeleteModal();
      },
    });
  }
  const { data: OkrRules, isLoading } = useGetOkrRule();
  return (
    <div
      className="p-5 rounded-2xl bg-white h-full"
      id="okr-define-okr-rule-container"
      data-cy="okr-define-okr-rule-container"
    >
      <div
        className="flex justify-between items-center mb-4"
        id="okr-define-okr-rule-header"
        data-cy="okr-define-okr-rule-header"
      >
        <h2
          className="text-lg font-semibold"
          id="okr-define-okr-rule-title"
          data-cy="okr-define-okr-rule-title"
        >
          OKR Rule
        </h2>
        <AccessGuard
          data-cy="okr-define-okr-rule-add-button-access-guard-display-guard"
          permissions={[Permissions.CreateOkrRule]}
        >
          <Button
            type="primary"
            className="bg-blue-500 hover:bg-blue-600 focus:bg-blue-600 h-10"
            icon={<FaPlus className="text-xs" />}
            onClick={showDrawer}
            id="okr-define-okr-rule-add-button"
            data-cy="okr-define-okr-rule-add-button"
          >
            <span
              className="hidden md:block "
              id="okr-define-okr-rule-add-button-label"
              data-cy="okr-define-okr-rule-add-button-label"
            >
              Add Rule
            </span>
          </Button>
        </AccessGuard>
      </div>

      <List
        dataSource={OkrRules?.items}
        loading={isLoading}
        bordered={false}
        id="okr-define-okr-rule-list"
        data-cy="okr-define-okr-rule-list"
        renderItem={(item) => (
          <List.Item
            className="flex justify-between items-center py-3 px-4 rounded-xl my-3"
            style={{
              border: '1px solid #d1d5db',
              borderRadius: '0.75rem',
              margin: '0.75rem 0',
              padding: '1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
            id={`okr-define-okr-rule-list-item-${item?.id}`}
            data-cy={`okr-define-okr-rule-list-item-${item?.id}`}
          >
            <div
              className="w-full flex flex-row items-center justify-between gap-4 "
              id={`okr-define-okr-rule-list-item-content-${item?.id}`}
              data-cy={`okr-define-okr-rule-list-item-content-${item?.id}`}
            >
              <span
                id={`okr-define-okr-rule-list-item-title-${item?.id}`}
                data-cy={`okr-define-okr-rule-list-item-title-${item?.id}`}
              >
                {item?.title || 'Unknown title'}
              </span>
              <div
                className="flex items-center gap-2"
                id={`okr-define-okr-rule-list-item-actions-${item?.id}`}
                data-cy={`okr-define-okr-rule-list-item-actions-${item?.id}`}
              >
                <AccessGuard
                  data-cy="okr-define-okr-rule-table-edit-button-access-guard-display-guard"
                  permissions={[Permissions.UpdateOkrRule]}
                >
                  <Button
                    icon={
                      <EditOutlined
                        data-cy={`okr-define-okr-rule-table-edit-button-icon-${item?.id}`}
                      />
                    }
                    className="mr-2 bg-blue text-white border-none"
                    shape="circle"
                    onClick={() => handleEditModal(item)}
                    id={`okr-define-okr-rule-edit-button-${item?.id}`}
                    data-cy={`okr-define-okr-rule-edit-button-${item?.id}`}
                  />
                </AccessGuard>
                <AccessGuard
                  data-cy="okr-define-okr-rule-table-delete-button-access-guard-display-guard"
                  permissions={[Permissions.DeleteOkrRule]}
                >
                  <Button
                    icon={
                      <DeleteOutlined
                        data-cy={`okr-define-okr-rule-table-delete-button-icon-${item?.id}`}
                      />
                    }
                    className="mr-2 bg-red-500 text-white border-none"
                    shape="circle"
                    onClick={() => showDeleteModal(item?.id as string)}
                    id={`okr-define-okr-rule-delete-button-${item?.id}`}
                    data-cy={`okr-define-okr-rule-delete-button-${item?.id}`}
                  />
                </AccessGuard>
              </div>
            </div>
          </List.Item>
        )}
      />
      <OkrRuleDrawer
        okrRule={okrRule}
        open={open}
        onClose={onClose}
        data-cy="okr-define-okr-rule-drawer"
      />
      <DeleteModal
        open={openDeleteModal}
        onConfirm={() => handleDeleteOkrRule(deletedId)}
        onCancel={onCloseDeleteModal}
        data-cy="okr-define-okr-rule-delete-modal"
      />
    </div>
  );
};

export default DefineOkrRule;
