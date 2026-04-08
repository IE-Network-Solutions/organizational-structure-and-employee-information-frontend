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

const DEDUCTION_TYPE_SKELETON_COUNT = 6;

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

/** Fixed height for every deduction grid tile (including “All Deduction”) */
const DEDUCTION_CARD_HEIGHT_PX = 86;

const deductionCardShellStyle: React.CSSProperties = {
  width: '100%',
  minWidth: 0,
  height: DEDUCTION_CARD_HEIGHT_PX,
  minHeight: DEDUCTION_CARD_HEIGHT_PX,
  maxHeight: DEDUCTION_CARD_HEIGHT_PX,
  borderRadius: 8,
  border: '1px solid #D9D9D9',
  boxShadow: 'none',
  cursor: 'pointer',
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
};

const deductionCardBodyStyle: React.CSSProperties = {
  padding: '10px 12px',
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
  flex: 1,
  minHeight: 0,
  boxSizing: 'border-box',
  overflow: 'hidden',
};

type DeleteModalRecord = { id: string; name: string } | null;

const DeductionTypeCardGrid = () => {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [deleteModalRecord, setDeleteModalRecord] =
    useState<DeleteModalRecord>(null);
  const { data, isLoading } = useFetchAllowanceTypes();
  const { mutate: deleteAllowanceType } = useDeleteAllowanceType();
  const { mutate: updateCompensationStatus } = useUpdateCompensationStatus();
  const router = useRouter();
  const {
    setSelectedDeductionRecord,
    setIsDeductionOpen,
    tableData,
    setTableData,
  } = useCompensationSettingStore();

  useEffect(() => {
    if (data) {
      const filteredData = data.filter(
        (item: { type?: string }) => item.type === 'DEDUCTION',
      );
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

  const handleDeductionEdit = (record: unknown) => {
    setSelectedDeductionRecord(record);
    setIsDeductionOpen(true);
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

  /** Shown on deduction cards (Credit / Debit) — matches payroll grid UX */
  const deductionModeLabel = (mode?: string) => {
    if (mode === 'CREDIT') return 'Credit';
    if (mode === 'DEBIT') return 'Debit';
    return '—';
  };

  return (
    <div
      data-testid="deduction-type-card-grid-container"
      id="compensation-settings-deduction-type-card-grid-container"
      data-cy="compensation-settings-deduction-type-card-grid-container"
    >
      <div
        className="mt-0 grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        data-cy="compensation-settings-deduction-type-card-grid"
      >
        <Card
          key="all-deduction-summary"
          style={deductionCardShellStyle}
          bodyStyle={deductionCardBodyStyle}
          data-cy="compensation-settings-deduction-type-card-all-summary"
          onClick={() => router.push('/deduction/allDeduction')}
        >
          <div
            className="flex items-start justify-between shrink-0"
            style={{ gap: 8 }}
            data-cy="compensation-settings-deduction-type-card-all-summary-header"
          >
            <h3
              className="text-base leading-tight flex-1 min-w-0 truncate m-0 font-normal"
              style={{ color: '#000000' }}
              data-cy="compensation-settings-deduction-type-card-all-summary-title"
            >
              All Deduction
            </h3>
            <span
              className="shrink-0"
              style={{ width: 24, height: 24 }}
              aria-hidden
              data-cy="compensation-settings-deduction-type-card-all-summary-spacer"
            />
          </div>
          <p
            className="text-sm font-normal text-[#595959] leading-normal m-0 min-h-0 line-clamp-2"
            title="Displays all deduction types assigned to employees, showing each employee's allocated deductions."
            data-cy="compensation-settings-deduction-type-card-all-summary-description"
          >
            Displays all deduction types assigned to employees, showing each
            employee&apos;s allocated deductions.
          </p>
        </Card>
        {isLoading ? (
          <div
            className="contents"
            data-testid="deduction-type-card-grid-loading"
            data-cy="compensation-settings-deduction-type-card-grid-loading"
            aria-busy="true"
          >
            {Array.from(
              { length: DEDUCTION_TYPE_SKELETON_COUNT },
              (element: unknown, skeletonIndex: number) => (
                <PayPeriodCardSkeleton
                  key={`compensation-settings-deduction-type-card-sk-${skeletonIndex}`}
                  index={skeletonIndex}
                  dataCyPrefix="compensation-settings-deduction-type-card-skeleton"
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
                onClick: () => handleDeductionEdit(record),
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
                style={deductionCardShellStyle}
                bodyStyle={deductionCardBodyStyle}
                data-cy={`compensation-settings-deduction-type-card-${record.id}`}
                onClick={(e) => {
                  const target = e.target as HTMLElement;
                  if (
                    target.closest('button') ||
                    target.closest('.ant-dropdown')
                  )
                    return;
                  router.push(`/deduction/${record.id}`);
                }}
              >
                <div
                  className="flex items-start justify-between"
                  style={{ gap: 8 }}
                  data-cy={`compensation-settings-deduction-type-card-header-row-${record.id}`}
                >
                  <h3
                    className="text-base leading-tight flex-1 min-w-0 truncate font-normal"
                    style={{ color: '#000000' }}
                    data-cy={`compensation-settings-deduction-type-card-name-${record.id}`}
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
                            data-cy="compensation-settings-deduction-type-delete-popover-title"
                          >
                            Delete Deduction Type
                          </span>
                        }
                        content={
                          <div
                            className="pt-2"
                            data-cy="compensation-settings-deduction-type-delete-popover-body"
                          >
                            <p
                              className="text-gray-800 text-sm font-normal m-0 leading-normal"
                              data-cy="compensation-settings-deduction-type-delete-popover-message"
                            >
                              Are you sure you want to delete{' '}
                              <strong data-cy="compensation-settings-deduction-type-delete-popover-name">
                                {deleteModalRecord?.name}
                              </strong>{' '}
                              type ?
                            </p>
                            <div
                              className="flex justify-end gap-2 mt-4"
                              data-cy="compensation-settings-deduction-type-delete-popover-actions"
                            >
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteModalRecord(null);
                                }}
                                className="h-10 px-4 rounded-md border border-gray-300 bg-white text-gray-700 text-sm font-normal hover:bg-gray-50"
                                data-cy="compensation-settings-deduction-type-delete-popover-cancel"
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
                                data-cy="compensation-settings-deduction-type-delete-popover-confirm"
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
                          data-cy={`compensation-settings-deduction-type-card-menu-${record.id}`}
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
                  data-cy={`compensation-settings-deduction-type-card-meta-row-${record.id}`}
                >
                  <span
                    style={pillStyle}
                    data-cy={`compensation-settings-deduction-type-card-type-${record.id}`}
                  >
                    {record.isRate ? 'Rate' : 'Fixed'}
                  </span>
                  <span
                    style={pillStyle}
                    data-cy={`compensation-settings-deduction-type-card-mode-${record.id}`}
                  >
                    {deductionModeLabel(record.mode)}
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
                        data-cy={`compensation-settings-deduction-type-card-status-${record.id}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span
                          data-cy={`compensation-settings-deduction-type-card-status-label-${record.id}`}
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
    </div>
  );
};

export default DeductionTypeCardGrid;
