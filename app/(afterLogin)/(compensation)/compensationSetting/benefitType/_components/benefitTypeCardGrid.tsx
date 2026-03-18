'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Dropdown, Modal, Spin } from 'antd';
import type { MenuProps } from 'antd';
import { HiOutlineDotsHorizontal } from 'react-icons/hi';
import { EditOutlined, DeleteOutlined, CloseOutlined } from '@ant-design/icons';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { useFetchAllowanceTypes } from '@/store/server/features/compensation/settings/queries';
import {
  useDeleteAllowanceType,
  useUpdateCompensationStatus,
} from '@/store/server/features/compensation/settings/mutations';
import { useCompensationTypeTablesStore } from '@/store/uistate/features/compensation/settings';
import { useCompensationSettingStore } from '@/store/uistate/features/compensation/settings';
import CustomPagination from '@/components/customPagination';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import { useIsMobile } from '@/hooks/useIsMobile';
import { DownOutlined, LoadingOutlined } from '@ant-design/icons';

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
  color: '#595959',
  userSelect: 'none',
  whiteSpace: 'nowrap',
};

const dotsButtonStyle: React.CSSProperties = {
  height: 32,
  width: 32,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 6,
  border: '1px solid #D9D9D9',
  background: '#fff',
};

type DeleteModalRecord = { id: string; name: string } | null;

const BenefitTypeCardGrid = () => {
  const { isMobile, isTablet } = useIsMobile();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [deleteModalRecord, setDeleteModalRecord] =
    useState<DeleteModalRecord>(null);
  const { data, isLoading } = useFetchAllowanceTypes();
  const { mutate: deleteAllowanceType } = useDeleteAllowanceType();
  const { mutate: updateCompensationStatus } = useUpdateCompensationStatus();
  const {
    benefitPageSize,
    benefitCurrentPage,
    setBenefitPageSize,
    setBenefitCurrentPage,
  } = useCompensationTypeTablesStore();
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
      setBenefitCurrentPage(1);
    }
  }, [data, setTableData, setBenefitCurrentPage]);

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

  const paginatedData = tableData.slice(
    (benefitCurrentPage - 1) * benefitPageSize,
    benefitCurrentPage * benefitPageSize,
  );

  return (
    <div
      data-testid="benefit-type-card-grid-container"
      id="compensation-settings-benefit-type-card-grid-container"
      data-cy="compensation-settings-benefit-type-card-grid-container"
    >
      <Spin
        spinning={isLoading}
        data-testid="benefit-type-card-grid-loading"
        data-cy="compensation-settings-benefit-type-card-grid-loading"
      >
        <div
          className="mt-0"
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fill, minmax(min(360px, 100%), 1fr))',
            gap: 16,
            justifyContent: 'start',
          }}
          data-cy="compensation-settings-benefit-type-card-grid"
        >
          {paginatedData.map((record: any) => {
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
                  maxWidth: 360,
                  minHeight: 86,
                  borderRadius: 8,
                  border: '1px solid #D9D9D9',
                  boxShadow: 'none',
                  cursor: 'pointer',
                }}
                bodyStyle={{
                  padding: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  minHeight: 86,
                  boxSizing: 'border-box',
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
                >
                  <h3
                    className="text-base text-gray-500 leading-tight flex-1 min-w-0 truncate"
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
                      <button
                        type="button"
                        className="shrink-0"
                        style={dotsButtonStyle}
                        data-cy={`compensation-settings-benefit-type-card-menu-${record.id}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <HiOutlineDotsHorizontal size={20} />
                      </button>
                    </Dropdown>
                  </AccessGuard>
                </div>
                <div className="flex flex-wrap items-center" style={{ gap: 8 }}>
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
                    {record.mode === 'CREDIT' ? 'Credit' : 'Debit'}
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
                        <span>{record.isActive ? 'Active' : 'Inactive'}</span>
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
          })}
        </div>

        {isMobile || isTablet ? (
          <CustomMobilePagination
            data-cy="compensation-settings-benefit-type-mobile-pagination"
            totalResults={tableData.length}
            pageSize={benefitPageSize}
            onChange={(page, size) => {
              setBenefitCurrentPage(page);
              setBenefitPageSize(size);
            }}
            onShowSizeChange={(page, size) => {
              setBenefitCurrentPage(page);
              setBenefitPageSize(size);
            }}
          />
        ) : (
          <CustomPagination
            data-cy="compensation-settings-benefit-type-pagination"
            current={benefitCurrentPage}
            total={tableData.length}
            pageSize={benefitPageSize}
            onChange={(page, size) => {
              setBenefitCurrentPage(page);
              setBenefitPageSize(size);
            }}
            onShowSizeChange={(size) => {
              setBenefitPageSize(size);
              setBenefitCurrentPage(1);
            }}
          />
        )}

        <Modal
          title={
            <span className="text-base font-semibold text-gray-900">
              Delete Benefit Type
            </span>
          }
          open={deleteModalRecord !== null}
          onCancel={() => setDeleteModalRecord(null)}
          closable
          closeIcon={
            <CloseOutlined
              className="text-gray-500 hover:text-gray-700"
              style={{ fontSize: 14 }}
            />
          }
          footer={
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteModalRecord(null)}
                className="h-10 px-4 rounded-md border border-gray-300 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50"
                data-cy="compensation-settings-benefit-type-delete-modal-cancel"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() =>
                  deleteModalRecord && handleDelete(deleteModalRecord.id)
                }
                className="h-10 px-4 rounded-md border-0 bg-red-500 text-white text-sm font-medium hover:bg-red-600"
                data-cy="compensation-settings-benefit-type-delete-modal-confirm"
              >
                Delete
              </button>
            </div>
          }
          data-cy="compensation-settings-benefit-type-delete-modal"
          styles={{
            content: { borderRadius: 8 },
            header: { borderBottom: '1px solid #f0f0f0', padding: '16px 24px' },
            body: { padding: '16px 24px 24px' },
          }}
        >
          {deleteModalRecord && (
            <p className="text-gray-800 text-sm font-normal m-0 leading-normal">
              Are you sure you want to delete {deleteModalRecord.name} type ?
            </p>
          )}
        </Modal>
      </Spin>
    </div>
  );
};

export default BenefitTypeCardGrid;
