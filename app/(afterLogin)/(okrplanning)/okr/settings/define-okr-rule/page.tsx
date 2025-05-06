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
    <div className="p-5 rounded-2xl bg-white h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">OKR Rule</h2>
        <AccessGuard permissions={[Permissions.CreateOkrRule]}>
          <Button
            type="primary"
            className="bg-blue-500 hover:bg-blue-600 focus:bg-blue-600 h-10"
            icon={<FaPlus className="text-xs" />}
            onClick={showDrawer}
          >
            <span className="hidden md:block ">Add Rule</span>
          </Button>
        </AccessGuard>
      </div>

      <List
        dataSource={OkrRules?.items}
        loading={isLoading}
        bordered={false}
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
          >
            <div className="w-full flex flex-row items-center justify-between gap-4 ">
              <span>{item?.title || 'Unknown title'}</span>
              <div className="flex items-center gap-2">
                <AccessGuard permissions={[Permissions.UpdateOkrRule]}>
                  <Button
                    icon={<EditOutlined />}
                    className="mr-2 bg-blue text-white border-none"
                    shape="circle"
                    onClick={() => handleEditModal(item)}
                  />
                </AccessGuard>
                <AccessGuard permissions={[Permissions.DeleteOkrRule]}>
                  <Button
                    icon={<DeleteOutlined />}
                    className="mr-2 bg-red-500 text-white border-none"
                    shape="circle"
                    onClick={() => showDeleteModal(item?.id as string)}
                  />
                </AccessGuard>
              </div>
            </div>
          </List.Item>
        )}
      />
      <OkrRuleDrawer okrRule={okrRule} open={open} onClose={onClose} />
      <DeleteModal
        open={openDeleteModal}
        onConfirm={() => handleDeleteOkrRule(deletedId)}
        onCancel={onCloseDeleteModal}
      />
    </div>
  );
};

export default DefineOkrRule;
