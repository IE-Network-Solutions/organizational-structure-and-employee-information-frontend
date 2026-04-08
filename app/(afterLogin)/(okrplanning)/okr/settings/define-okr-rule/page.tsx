'use client';

import DeleteModal from '@/components/common/deleteConfirmationModal';
import EmptyState from '@/components/empty';
import DefineOkrRulePageSkeleton from './_components/defineOkrRulePageSkeleton';
import { OkrRule } from '@/store/uistate/features/okrplanning/monitoring-evaluation/okr-rule/interface';
import { Dropdown, MenuProps } from 'antd';
import React from 'react';
import { EllipsisOutlined } from '@ant-design/icons';
import { useOkrRuleStore } from '@/store/uistate/features/okrplanning/monitoring-evaluation/okr-rule';
import { useDeleteOkrRule } from '@/store/server/features/okrplanning/monitoring-evaluation/okr-rule/mutations';
import { useGetOkrRule } from '@/store/server/features/okrplanning/monitoring-evaluation/okr-rule/queries';
import OkrRuleModal from './okr-rule';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { MdDeleteForever, MdModeEditOutline } from 'react-icons/md';

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

  const { data: okrRulesData, isLoading: isOkrRulesLoading } = useGetOkrRule();

  const listItems = okrRulesData?.items ?? [];

  const canCreateOkrRule = AccessGuard.checkAccess({
    permissions: [Permissions.CreateOkrRule],
  });

  const openCreateOkrRule = () => {
    setOkrRule(null);
    setOpen(true);
  };

  const getMenuItems = (item: any): MenuProps['items'] => {
    return [
      {
        key: 'edit',
        label: (
          <AccessGuard
            permissions={[Permissions.UpdateOkrRule]}
            data-cy={`okr-rule-card-edit-access-guard-${item.id}`}
          >
            <div
              className="flex items-center gap-3 py-1"
              onClick={() => handleEditModal(item)}
              id={`okr-rule-card-edit-menu-item-${item.id}`}
              data-cy={`okr-rule-card-edit-menu-item-${item.id}`}
            >
              <MdModeEditOutline className="text-[#595959] text-xl" />
              <span
                className="text-[15px] text-[#262626]"
                data-cy={`okr-rule-card-edit-text-${item.id}`}
              >
                Edit OKR
              </span>
            </div>
          </AccessGuard>
        ),
      },
      {
        type: 'divider',
      },
      {
        key: 'delete',
        label: (
          <AccessGuard
            permissions={[Permissions.DeleteOkrRule]}
            data-cy={`okr-rule-card-delete-access-guard-${item.id}`}
          >
            <div
              className="flex items-center gap-3 py-1 text-red-600"
              onClick={() => showDeleteModal(item.id)}
              id={`okr-rule-card-delete-menu-item-${item.id}`}
              data-cy={`okr-rule-card-delete-menu-item-${item.id}`}
            >
              <MdDeleteForever className="text-xl" />
              <span
                className="text-[15px]"
                data-cy={`okr-rule-card-delete-text-${item.id}`}
              >
                Delete OKR
              </span>
            </div>
          </AccessGuard>
        ),
      },
    ];
  };

  return (
    <div
      className="w-full"
      id="okr-define-okr-rule-container"
      data-cy="okr-define-okr-rule-container"
    >
      {/* Container with Border */}
      <div
        className="border border-[#f0f0f0] rounded-xl pt-5 px-8 pb-8 bg-white min-h-[400px]"
        id="okr-define-okr-rule-main-container"
        data-cy="okr-define-okr-rule-main-container"
      >
        {isOkrRulesLoading ? (
          <DefineOkrRulePageSkeleton />
        ) : listItems.length === 0 ? (
          <div
            className="flex min-h-[280px] items-center justify-center py-8"
            data-cy="okr-define-okr-rule-empty"
            id="okrDefineOkrRuleEmptyId"
          >
            <EmptyState
              title="No OKR rules yet"
              description="Add a rule to set self and team contribution percentages (must total 100%)."
              actionText={canCreateOkrRule ? 'Add rule' : undefined}
              onAction={canCreateOkrRule ? openCreateOkrRule : undefined}
            />
          </div>
        ) : (
          <div
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
            id="okr-define-okr-rule-grid"
            data-cy="okr-define-okr-rule-grid"
          >
            {listItems.map((item: any) => (
              <div
                key={item.id}
                className="relative rounded-[12px] border border-[#d9d9d9] bg-white p-5 transition-shadow hover:shadow-sm"
                id={`okr-rule-card-${item.id}`}
                data-cy={`okr-rule-card-${item.id}`}
              >
                <div
                  className="mb-6 flex items-start justify-between"
                  data-cy={`okr-rule-card-header-${item.id}`}
                >
                  <p
                    className="mr-2 flex-1 text-[15px] font-semibold leading-tight text-[#262626]"
                    id={`okr-rule-card-title-${item.id}`}
                    data-cy={`okr-rule-card-title-${item.id}`}
                  >
                    {item.title || 'Unknown title'}
                  </p>
                  <div
                    id={`okr-rule-card-menu-wrapper-${item.id}`}
                    data-cy={`okr-rule-card-menu-wrapper-${item.id}`}
                  >
                    <Dropdown
                      menu={{ items: getMenuItems(item) }}
                      trigger={['click']}
                      placement="bottomRight"
                    >
                      <button
                        type="button"
                        className="flex h-8 w-8 items-center justify-center rounded-[6px] border border-[#d9d9d9] text-[#8c8c8c] transition-colors hover:border-[#2b54ad] hover:text-[#262626]"
                        onClick={(e) => e.stopPropagation()}
                        data-cy={`okr-rule-card-menu-button-${item.id}`}
                      >
                        <EllipsisOutlined className="text-lg" />
                      </button>
                    </Dropdown>
                  </div>
                </div>

                <div
                  className="flex items-center gap-3"
                  data-cy={`okr-rule-card-footer-${item.id}`}
                >
                  <div
                    className="rounded-[6px] border border-[#d9d9d9] bg-[#fafafa] px-3 py-1.5 text-[12px] text-[#595959]"
                    id={`okr-rule-card-self-${item.id}`}
                    data-cy={`okr-rule-card-self-${item.id}`}
                  >
                    Self Contribution: {item.myOkrPercentage || 0}
                  </div>
                  <div
                    className="rounded-[6px] border border-[#d9d9d9] bg-[#fafafa] px-3 py-1.5 text-[12px] text-[#595959]"
                    id={`okr-rule-card-team-${item.id}`}
                    data-cy={`okr-rule-card-team-${item.id}`}
                  >
                    Team Contribution: {item.teamOkrPercentage || 0}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <OkrRuleModal
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
