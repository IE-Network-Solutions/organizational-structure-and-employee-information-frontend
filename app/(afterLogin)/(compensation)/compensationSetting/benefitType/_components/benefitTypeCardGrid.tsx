'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Dropdown, Popover } from 'antd';
import type { MenuProps } from 'antd';
import { HiOutlineDotsHorizontal } from 'react-icons/hi';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { useFetchAllowanceTypes } from '@/store/server/features/compensation/settings/queries';
import {
  useDeleteAllowanceType,
  useUpdateCompensationStatus,
} from '@/store/server/features/compensation/settings/mutations';
import { useCompensationSettingStore } from '@/store/uistate/features/compensation/settings';
import { DownOutlined, LoadingOutlined } from '@ant-design/icons';
import { PayPeriodCardSkeleton } from '@/components/common/PayPeriodCardSkeleton';

const BENEFIT_TYPE_SKELETON_COUNT = 6;

const pillStyle: React.CSSProperties = {
  display: 'inline-flex',
  flexDirection: 'row',
  alignItems: 'center',
  height: 22,
  padding: '1px 8px',
  borderRadius: 4,
  border: '1px solid #D9D9D9',
  background: '#fff',
  fontSize: 12,
  lineHeight: '18px',
  fontWeight: 400,
  color: '#595959',
  userSelect: 'none',
  whiteSpace: 'nowrap',
};

const dotsButtonStyle: React.CSSProperties = {
  height: 24,
  width: 24,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 4,
  border: '1px solid #D9D9D9',
  background: '#fff',
};

type DeleteModalRecord = { id: string; name: string } | null;

const BenefitTypeCardGrid = () => {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [deleteModalRecord, setDeleteModalRecord] =
    useState<DeleteModalRecord>(null);
  const { data, isLoading } = useFetchAllowanceTypes();
  const { mutate: deleteAllowanceType } = useDeleteAllowanceType();
  const { mutate: updateCompensationStatus } = useUpdateCompensationStatus();
  const router = useRouter();
  const {
    setSelectedBenefitRecord,
    setIsBenefitOpen,
    tableData,
    setTableData,
  } = useCompensationSettingStore();

  useEffect(() => {
    if (data) {
      const filteredData = data.filter((item: any) => item.type === 'MERIT');
      setTableData(filteredData);
    }
  }, [data, setTableData]);

  const handleDelete = (id: string) => {
    deleteAllowanceType(id);
    setDeleteModalRecord(null);
  };

  const openDeleteModal = (record: { id: string; name: string }) => {
    setDeleteModalRecord(record);
  };

  const handleBenefitEdit = (record: any | null) => {
    setSelectedBenefitRecord(record);
    setIsBenefitOpen(true);
  };

  const updateStatus = (id: string) => {
    setLoadingId(id);
    updateCompensationStatus(
      { id },
      {
        onSuccess: () => setLoadingId(null),
        onError: () => setLoadingId(null),
      },
    );
  };

  const formatModePills = (mode?: string, isPeriodic?: boolean) => {
    const isNonRepayable = mode === 'CREDIT';
    const isRepayable = mode === 'DEBIT';
    const modeLabel = isNonRepayable
      ? 'Non-repayable'
      : isRepayable
        ? 'Repayable'
        : '—';
    const periodicLabel =
      isNonRepayable && isPeriodic !== undefined
        ? isPeriodic
          ? 'Periodic'
          : 'Non-periodic'
        : null;
    return { modeLabel, periodicLabel };
  };

  return (
    <div
      data-testid="benefit-type-card-grid-container"
      id="compensation-settings-benefit-type-card-grid-container"
      data-cy="compensation-settings-benefit-type-card-grid-container"
    >
      <div
        className="mt-0 grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        data-cy="compensation-settings-benefit-type-card-grid"
      >
        {isLoading ? (
          <div
            className="contents"
            data-testid="benefit-type-card-grid-loading"
            data-cy="compensation-settings-benefit-type-card-grid-loading"
            aria-busy="true"
          >
            {Array.from(
              { length: BENEFIT_TYPE_SKELETON_COUNT },
              (element: unknown, skeletonIndex: number) => (
                <PayPeriodCardSkeleton
                  key={`compensation-settings-benefit-type-card-sk-${skeletonIndex}`}
                  index={skeletonIndex}
                  dataCyPrefix="compensation-settings-benefit-type-card-skeleton"
                />
              ),
            )}
          </div>
        ) : (
          tableData.map((record: any) => {
            const menuItems: MenuProps['items'] = [
              {
                key: 'edit',
                icon: (
                  <EditOutlined style={{ fontSize: 14, color: '#595959' }} />
                ),
                label: 'Edit',
                onClick: () => handleBenefitEdit(record),
              },
              {
                key: 'delete',
                icon: (
                  <DeleteOutlined style={{ fontSize: 14, color: '#595959' }} />
                ),
                label: 'Delete',
                onClick: () =>
                  openDeleteModal({ id: record.id, name: record.name }),
              },
            ];

            return (
              <Card
                key={record.id}
                style={{
                  width: '100%',
                  minWidth: 0,
                  height: 86,
                  borderRadius: 8,
                  border: '1px solid #D9D9D9',
                  boxShadow: 'none',
                  cursor: 'pointer',
                  boxSizing: 'border-box',
                  display: 'flex',
                  flexDirection: 'column',
                }}
                bodyStyle={{
                  padding: '10px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                  flex: 1,
                  minHeight: 0,
                  boxSizing: 'border-box',
                  overflow: 'hidden',
                }}
                data-cy={`compensation-settings-benefit-type-card-${record.id}`}
                onClick={(e) => {
                  const target = e.target as HTMLElement;
                  if (
                    target.closest('button') ||
                    target.closest('.ant-dropdown')
                  )
                    return;
                  router.push(`/benefit/${record.id}`);
                }}
              >
                <div
                  className="flex items-start justify-between"
                  style={{ gap: 8 }}
                  data-cy={`compensation-settings-benefit-type-card-header-row-${record.id}`}
                >
                  <h3
                    className="text-base leading-tight flex-1 min-w-0 truncate font-normal"
                    style={{ color: '#000000' }}
                    data-cy={`compensation-settings-benefit-type-card-name-${record.id}`}
                    title={record.name}
                  >
                    {record.name || '–'}
                  </h3>
                  <AccessGuard
                    permissions={[
                      Permissions.UpdateBenefitType,
                      Permissions.DeleteBenefitType,
                    ]}
                  >
                    <Dropdown
                      menu={{ items: menuItems }}
                      trigger={['click']}
                      placement="bottomRight"
                      getPopupContainer={() => document.body}
                    >
                      <Popover
                        open={deleteModalRecord?.id === record.id}
                        onOpenChange={(open) => {
                          if (!open) setDeleteModalRecord(null);
                        }}
                        trigger={['click']}
                        placement="bottomRight"
                        zIndex={10250}
                        getPopupContainer={() => document.body}
                        overlayStyle={{ maxWidth: 'calc(100vw - 32px)' }}
                        overlayInnerStyle={{ width: 320, maxWidth: '100%' }}
                        title={
                          <span
                            className="text-base font-semibold text-gray-900"
                            data-cy="compensation-settings-benefit-type-delete-popover-title"
                          >
                            Delete Benefit Type
                          </span>
                        }
                        content={
                          <div
                            className="pt-2"
                            data-cy="compensation-settings-benefit-type-delete-popover-body"
                          >
                            <p
                              className="text-gray-800 text-sm font-normal m-0 leading-normal"
                              data-cy="compensation-settings-benefit-type-delete-popover-message"
                            >
                              Are you sure you want to delete{' '}
                              <strong data-cy="compensation-settings-benefit-type-delete-popover-name">
                                {deleteModalRecord?.name}
                              </strong>{' '}
                              type ?
                            </p>
                            <div
                              className="flex justify-end gap-2 mt-4"
                              data-cy="compensation-settings-benefit-type-delete-popover-actions"
                            >
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteModalRecord(null);
                                }}
                                className="h-10 px-4 rounded-md border border-gray-300 bg-white text-gray-700 text-sm font-normal hover:bg-gray-50"
                                data-cy="compensation-settings-benefit-type-delete-popover-cancel"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (deleteModalRecord) {
                                    handleDelete(deleteModalRecord.id);
                                  }
                                }}
                                className="h-10 px-4 rounded-md border-0 bg-red-500 text-white text-sm font-normal hover:bg-red-600"
                                data-cy="compensation-settings-benefit-type-delete-popover-confirm"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        }
                      >
                        <button
                          type="button"
                          className="shrink-0"
                          style={dotsButtonStyle}
                          data-cy={`compensation-settings-benefit-type-card-menu-${record.id}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <HiOutlineDotsHorizontal size={16} />
                        </button>
                      </Popover>
                    </Dropdown>
                  </AccessGuard>
                </div>
                <div
                  className="flex flex-wrap items-center min-h-0 shrink"
                  style={{ gap: 6 }}
                  data-cy={`compensation-settings-benefit-type-card-meta-row-${record.id}`}
                >
                  <span
                    style={pillStyle}
                    data-cy={`compensation-settings-benefit-type-card-type-${record.id}`}
                  >
                    {record.isRate ? 'Rate' : 'Fixed'}
                  </span>
                  <span
                    style={pillStyle}
                    data-cy={`compensation-settings-benefit-type-card-mode-${record.id}`}
                  >
                    {formatModePills(record.mode, record.isPeriodic).modeLabel}
                  </span>
                  <AccessGuard
                    permissions={[
                      Permissions.UpdateAllowanceType,
                      Permissions.DeleteAllowanceType,
                    ]}
                  >
                    <Dropdown
                      placement="bottomLeft"
                      trigger={['click']}
                      getPopupContainer={() => document.body}
                      menu={{
                        items: [
                          { key: 'active', label: 'Active' },
                          { key: 'inactive', label: 'Inactive' },
                        ],
                        onClick: ({ key }) => {
                          const next = key === 'active';
                          if (next !== Boolean(record.isActive)) {
                            updateStatus(record.id);
                          }
                        },
                      }}
                    >
                      <button
                        type="button"
                        style={{
                          ...pillStyle,
                          minWidth: 74,
                          justifyContent: 'space-between',
                          gap: 6,
                        }}
                        data-cy={`compensation-settings-benefit-type-card-status-${record.id}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span
                          data-cy={`compensation-settings-benefit-type-card-status-label-${record.id}`}
                        >
                          {record.isActive ? 'Active' : 'Inactive'}
                        </span>
                        {loadingId === record.id ? (
                          <LoadingOutlined style={{ fontSize: 12 }} />
                        ) : (
                          <DownOutlined style={{ fontSize: 10 }} />
                        )}
                      </button>
                    </Dropdown>
                  </AccessGuard>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Delete confirmation now renders as an anchored Popover on the kebab button */}
    </div>
  );
};

export default BenefitTypeCardGrid;
