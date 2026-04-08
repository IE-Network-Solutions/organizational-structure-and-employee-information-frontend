'use client';

import React, { useMemo, useState } from 'react';
import { Dropdown, Popover, Skeleton, Table } from 'antd';
import type { MenuProps } from 'antd';
import { HiOutlineDotsHorizontal } from 'react-icons/hi';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { TableColumnsType } from '@/types/table/table';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { useAllowanceEntitlementStore } from '@/store/uistate/features/compensation/allowance';
import { useBenefitEntitlementStore } from '@/store/uistate/features/compensation/benefit';
import DeductionEntitlementSideBar from './deductionEntitlementSidebar';
import DeductionEntitlementSideBarEdit from './deductionEntitlementSidebarEdit';
import BenefitEntitlementSideBarEdit from '../../../benefit/[id]/_components/benefitEntitlementSidebarEdit';
import { useFetchAllowanceEntitlements } from '@/store/server/features/compensation/allowance/queries';
import { useParams } from 'next/navigation';
import { useDeleteAllowanceEntitlement } from '@/store/server/features/compensation/allowance/mutations';
import CustomPagination from '@/components/customPagination';
import { TableSkeleton } from '@/components/tableSkeleton';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';

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

type DeleteModalRecord = { id: string; userId: string } | null;

type DeductionEntitlementTableProps = {
  title: string;
  compact?: boolean;
};

const DeductionEntitlementTable: React.FC<DeductionEntitlementTableProps> = ({
  title,
  compact = true,
}) => {
  const [deleteModalRecord, setDeleteModalRecord] =
    useState<DeleteModalRecord>(null);
  const {
    currentPage,
    pageSize,
    setCurrentPage,
    setPageSize,
    setIsDeductionEntitlementSidebarEditOpen,
    setEditDeductionData,
    searchText,
  } = useAllowanceEntitlementStore();

  const {
    setIsBenefitEntitlementSidebarUpdateOpen,
    setEditBenefitData,
    setEmployeeBenefitData,
  } = useBenefitEntitlementStore();

  const { isMobile, isTablet } = useIsMobile();
  const { mutate: deleteAllowanceEntitlement } =
    useDeleteAllowanceEntitlement();
  const { id } = useParams();
  const { data: allowanceEntitlementData, isLoading: entitlementLoading } =
    useFetchAllowanceEntitlements(id);
  const { data: employeeData, isLoading: employeeLoading } = useGetAllUsers();

  const handleDelete = (entitlementId: string) => {
    deleteAllowanceEntitlement(entitlementId);
  };

  const handleEdit = (record: any) => {
    if (record.isRate) {
      setEditDeductionData(record);
      setIsDeductionEntitlementSidebarEditOpen(true);
    } else {
      setEditBenefitData(record);
      setIsBenefitEntitlementSidebarUpdateOpen(true);
    }
  };

  const handleEmployeeData = (data: any) => {
    setEmployeeBenefitData(data);
  };

  const getEmployeeName = (userId: string) => {
    const emp = employeeData?.items?.find((e: any) => e.id === userId);
    return emp
      ? `${emp?.firstName ?? ''} ${emp?.lastName ?? ''}`.trim() || '—'
      : '—';
  };

  const handleDeleteConfirm = () => {
    if (deleteModalRecord) {
      handleDelete(deleteModalRecord.id);
      setDeleteModalRecord(null);
    }
  };

  const transformedSource = useMemo(
    () =>
      Array.isArray(allowanceEntitlementData)
        ? allowanceEntitlementData.map((item: any) => ({
            id: item.id,
            userId: item.employeeId,
            isRate: item.compensationItem.isRate,
            Amount: item.totalAmount,
            ApplicableTo: item.compensationItem.applicableTo,
            mode: item.compensationItem.mode,
            isPeriodic: item.compensationItem.isPeriodic,
          }))
        : [],
    [allowanceEntitlementData],
  );

  const filteredDataSource = useMemo(() => {
    let data = transformedSource;
    if (compact && searchText.trim()) {
      const searchLower = searchText.toLowerCase().trim();
      const employeeItems = employeeData?.items ?? [];
      const matchingIds = new Set(
        employeeItems
          .filter((e: any) =>
            `${e?.firstName ?? ''} ${e?.middleName ?? ''} ${e?.lastName ?? ''}`
              .toLowerCase()
              .includes(searchLower),
          )
          .map((e: any) => e.id),
      );
      data = data.filter((row: any) => matchingIds.has(row.userId));
    }
    return data;
  }, [compact, searchText, transformedSource, employeeData?.items]);

  const paginatedData = filteredDataSource.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const columnsCompact: TableColumnsType<any> = [
    {
      title: 'Employee',
      dataIndex: 'userId',
      key: 'userId',
      width: '32%',
      minWidth: isMobile ? 180 : 180,
      ellipsis: true,
      render: (cellValue: any, record: any) => {
        void cellValue;
        return (
          <div
            onClick={() => handleEmployeeData(record)}
            className="cursor-pointer truncate text-[13px] text-[#262626]"
            data-cy="compensation-deduction-entitlement-compact-employee-cell"
          >
            <span
              className="truncate block"
              data-cy="compensation-deduction-entitlement-compact-employee-name"
            >
              {employeeLoading ? (
                <Skeleton.Input
                  active
                  size="small"
                  style={{ width: 120, height: 16 }}
                />
              ) : (
                getEmployeeName(record?.userId)
              )}
            </span>
          </div>
        );
      },
    },
    {
      title: 'Type',
      dataIndex: 'isRate',
      key: 'type',
      width: isMobile ? 110 : 120,
      render: (isRate: boolean) => (
        <span
          className="text-[13px] text-[#434343]"
          data-cy="compensation-deduction-entitlement-compact-type-cell"
        >
          {isRate ? 'Rate' : 'Fixed'}
        </span>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'Amount',
      key: 'Amount',
      width: isMobile ? 140 : 130,
      render: (amount: string) =>
        amount != null && amount !== '' ? (
          <span
            className="text-[13px] text-[#434343]"
            data-cy="compensation-deduction-entitlement-compact-amount"
          >
            {amount}
          </span>
        ) : (
          <span data-cy="compensation-deduction-entitlement-compact-amount-dash">
            -
          </span>
        ),
    },
    {
      title: 'Action',
      key: 'action',
      width: isMobile ? 72 : 84,
      align: 'left',
      render: (cellValue: any, record: any) => {
        void cellValue;
        const hasAmount =
          record.Amount != null &&
          record.Amount !== '' &&
          Number(record.Amount) > 0;
        const menuItems: MenuProps['items'] = [];
        if (hasAmount) {
          menuItems.push({
            key: 'edit',
            icon: <EditOutlined style={{ fontSize: 14, color: '#595959' }} />,
            label: 'Edit',
            onClick: () => handleEdit(record),
          });
        }
        menuItems.push({
          key: 'delete',
          icon: <DeleteOutlined style={{ fontSize: 14, color: '#595959' }} />,
          label: 'Delete',
          onClick: () =>
            setDeleteModalRecord({ id: record.id, userId: record.userId }),
        });
        const deletePopoverOpen = deleteModalRecord?.id === record.id;
        const actionInner = (
          <AccessGuard
            permissions={[
              Permissions.UpdateAllowanceEntitlement,
              Permissions.DeleteAllowanceEntitlement,
            ]}
          >
            <Dropdown
              menu={{ items: menuItems }}
              trigger={['click']}
              placement="bottomRight"
              overlayStyle={{
                borderRadius: 8,
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              }}
            >
              <Popover
                open={deletePopoverOpen}
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
                    data-cy="compensation-deduction-delete-employee-popover-title"
                  >
                    Delete Employee
                  </span>
                }
                content={
                  <div
                    className="pt-2"
                    data-cy="compensation-deduction-delete-employee-popover-body"
                  >
                    <p
                      className="text-gray-800 text-sm font-normal m-0 leading-normal"
                      data-cy="compensation-deduction-delete-employee-popover-message"
                    >
                      Are you Sure you want to remove{' '}
                      <strong data-cy="compensation-deduction-delete-employee-popover-name">
                        {deleteModalRecord
                          ? getEmployeeName(deleteModalRecord.userId)
                          : ''}
                      </strong>{' '}
                      from this deduction type ?
                    </p>
                    <div
                      className="flex justify-end gap-2 mt-4"
                      data-cy="compensation-deduction-delete-employee-popover-actions"
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteModalRecord(null);
                        }}
                        className="h-10 px-4 rounded-md border border-gray-300 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50"
                        data-cy="compensation-deduction-delete-employee-popover-cancel"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteConfirm();
                        }}
                        className="h-10 px-4 rounded-md border-0 bg-red-500 text-white text-sm font-medium hover:bg-red-600"
                        data-cy="compensation-deduction-delete-employee-popover-confirm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                }
              >
                <button
                  type="button"
                  style={dotsButtonStyle}
                  onClick={(e) => e.stopPropagation()}
                  data-cy="compensation-deduction-entitlement-compact-actions-menu"
                >
                  <HiOutlineDotsHorizontal size={16} />
                </button>
              </Popover>
            </Dropdown>
          </AccessGuard>
        );
        return actionInner;
      },
    },
  ];

  return (
    <div
      id="compensation-deduction-entitlement-table-container"
      data-cy="compensation-deduction-entitlement-table-container"
      aria-busy={entitlementLoading}
    >
      <>
        <div
          className="overflow-hidden [&_.ant-table-wrapper]:!rounded-none [&_.ant-table-wrapper]:!shadow-none [&_.ant-table]:!shadow-none [&_.ant-table-container]:!rounded-none [&_.ant-table-container]:!rounded-ss-none [&_.ant-table-container]:!rounded-se-none [&_.ant-table-container]:!rounded-es-none [&_.ant-table-container]:!rounded-ee-none [&_.ant-table-title]:!rounded-none [&_.ant-table-header]:!rounded-none [&_.ant-table-footer]:!rounded-none [&_.ant-table-footer]:!rounded-es-none [&_.ant-table-footer]:!rounded-ee-none [&_.ant-table-thead>tr:first-child>th:first-child]:!rounded-none [&_.ant-table-thead>tr:first-child>th:first-child]:!rounded-ss-none [&_.ant-table-thead>tr:first-child>th:last-child]:!rounded-none [&_.ant-table-thead>tr:first-child>th:last-child]:!rounded-se-none [&_.ant-table-tbody>tr:last-child>td:first-child]:!rounded-none [&_.ant-table-tbody>tr:last-child>td:first-child]:!rounded-es-none [&_.ant-table-tbody>tr:last-child>td:last-child]:!rounded-none [&_.ant-table-tbody>tr:last-child>td:last-child]:!rounded-ee-none [&_.ant-table-content]:[-ms-overflow-style:none] [&_.ant-table-content]:[scrollbar-width:none] [&_.ant-table-content::-webkit-scrollbar]:hidden"
          id="compensation-deduction-entitlement-table-scroll"
          data-cy="compensation-deduction-entitlement-table-scroll"
        >
          {entitlementLoading ? (
            <div
              data-cy="compensation-deduction-entitlement-table-loading"
              aria-busy="true"
            >
              <TableSkeleton columns={columnsCompact} />
            </div>
          ) : (
            <Table
              data-cy="compensation-deduction-entitlement-table"
              className={`benefit-entitlement-table !shadow-none ${compact ? '' : 'mt-6'} ${
                compact
                  ? '[&_.ant-table]:text-sm [&_.ant-table]:!rounded-none [&_.ant-table-container]:!rounded-none [&_.ant-table-header]:!rounded-none [&_.ant-table-content]:!rounded-none [&_.ant-table-cell]:align-middle [&_.ant-table-thead>tr>th]:bg-[#FAFAFA] [&_.ant-table-thead>tr>th]:text-[#262626] [&_.ant-table-thead>tr>th]:font-bold [&_.ant-table-thead>tr>th]:px-3 [&_.ant-table-thead>tr>th]:py-3 [&_.ant-table-thead>tr>th]:text-[13px] [&_.ant-table-thead>tr>th:last-child]:text-left [&_.ant-table-tbody>tr>td]:px-3 [&_.ant-table-tbody>tr>td]:py-[10px] [&_.ant-table-tbody>tr>td]:text-[#434343] [&_.ant-table-tbody>tr>td]:border-b [&_.ant-table-tbody>tr>td]:border-[#F0F0F0] [&_.ant-table-tbody>tr:last-child>td]:border-b-0 [&_.ant-table-tbody>tr.benefit-row-even>td]:bg-[#FFFFFF] [&_.ant-table-tbody>tr.benefit-row-odd>td]:bg-[#FAFAFA]'
                  : '[&_.ant-table]:!rounded-none [&_.ant-table-container]:!rounded-none [&_.ant-table-container]:!rounded-ss-none [&_.ant-table-container]:!rounded-se-none [&_.ant-table-container]:!rounded-es-none [&_.ant-table-container]:!rounded-ee-none [&_.ant-table-header]:!rounded-none [&_.ant-table-content]:!rounded-none [&_.ant-table-thead>tr>th]:font-bold'
              }`}
              columns={columnsCompact}
              dataSource={paginatedData}
              rowKey="id"
              rowHoverable={false}
              rowClassName={(unusedRow, rowIndex) => {
                void unusedRow;
                return rowIndex % 2 === 0
                  ? 'benefit-row-even'
                  : 'benefit-row-odd';
              }}
              pagination={false}
              scroll={
                compact && (isMobile || isTablet) ? { x: 620 } : undefined
              }
            />
          )}
        </div>
        {isMobile || isTablet ? (
          <div
            className="mt-3 px-0"
            id="compensation-deduction-entitlement-mobile-pagination"
            data-cy="compensation-deduction-entitlement-mobile-pagination"
          >
            <CustomMobilePagination
              data-cy="compensation-deduction-entitlement-mobile-pagination"
              totalResults={filteredDataSource.length}
              pageSize={pageSize}
              currentPage={currentPage}
              onChange={(page, size) => {
                setCurrentPage(page);
                setPageSize(size);
              }}
              onShowSizeChange={(page, size) => {
                setCurrentPage(page);
                setPageSize(size);
              }}
            />
          </div>
        ) : (
          <div
            id="compensation-deduction-entitlement-pagination"
            data-cy="compensation-deduction-entitlement-pagination"
          >
            <CustomPagination
              data-cy="compensation-deduction-entitlement-pagination"
              current={currentPage}
              total={filteredDataSource.length}
              pageSize={pageSize}
              onChange={(page, size) => {
                setCurrentPage(page);
                setPageSize(size);
              }}
              onShowSizeChange={(size) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
            />
          </div>
        )}
      </>
      <DeductionEntitlementSideBar data-cy="compensation-deduction-entitlement-sidebar" />
      <DeductionEntitlementSideBarEdit data-cy="compensation-deduction-entitlement-sidebar-edit" />
      <BenefitEntitlementSideBarEdit
        title={title}
        forDeductionDetail
        data-cy="compensation-deduction-entitlement-benefit-sidebar-edit"
      />
    </div>
  );
};

export default DeductionEntitlementTable;
