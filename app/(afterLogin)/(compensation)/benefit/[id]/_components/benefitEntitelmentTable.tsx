import React, { useMemo, useState } from 'react';
import { Popover, Spin, Table, Dropdown, Skeleton } from 'antd';
import type { MenuProps } from 'antd';
import { HiOutlineDotsHorizontal } from 'react-icons/hi';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { TableColumnsType } from '@/types/table/table';
import ActionButtons from '@/components/common/actionButton/actionButtons';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import BenefitEntitlementSideBar from './benefitEntitlementSidebar';
import { useFetchBenefitEntitlement } from '@/store/server/features/compensation/benefit/queries';
import { useParams } from 'next/navigation';
import { useDeleteBenefitEntitlement } from '@/store/server/features/compensation/benefit/mutations';
import { useBenefitEntitlementStore } from '@/store/uistate/features/compensation/benefit';
import { EmployeeDetails } from '../../../_components/employeeDetails';
import BenefitEntitlementSideBarEdit from './benefitEntitlementSidebarEdit';
import BenefitTracking from './benefitTracker';
import { useAllowanceEntitlementStore } from '@/store/uistate/features/compensation/allowance';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import CustomPagination from '@/components/customPagination';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import { useIsMobile } from '@/hooks/useIsMobile';

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

type BenefitPropTypes = {
  title: string;
  compact?: boolean;
};
type DeleteModalRecord = { id: string; userId: string } | null;

const BenefitEntitlementTable: React.FC<BenefitPropTypes> = ({
  title,
  compact = false,
}) => {
  const [deleteModalRecord, setDeleteModalRecord] =
    useState<DeleteModalRecord>(null);
  const {
    setIsBenefitEntitlementSidebarUpdateOpen,
    currentPage,
    pageSize,
    setCurrentPage,
    setPageSize,
    setEditBenefitData,
    setEmployeeBenefitData,
  } = useBenefitEntitlementStore();
  const { isMobile, isTablet } = useIsMobile();
  const { mutate: deleteBenefitEntitlement } = useDeleteBenefitEntitlement();
  const { id } = useParams();
  const { data: benefitEntitlementsData, isLoading } =
    useFetchBenefitEntitlement(id);
  const { searchQuery, searchText } = useAllowanceEntitlementStore();
  const { data: employeeData, isLoading: employeeLoading } = useGetAllUsers();
  const transformedData = Array.isArray(benefitEntitlementsData)
    ? benefitEntitlementsData.map((item: any) => ({
        id: item.id,
        userId: item.employeeId,
        isRate: item.compensationItem.isRate,
        Amount: item.totalAmount,
        ApplicableTo: item.compensationItem.applicableTo,
        mode: item.compensationItem.mode,
      }))
    : [];
  const handleDelete = (id: string) => {
    deleteBenefitEntitlement(id);
  };
  const handleEdit = (record: any) => {
    setEditBenefitData(record);
    setIsBenefitEntitlementSidebarUpdateOpen(true);
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
      deleteBenefitEntitlement(deleteModalRecord.id);
      setDeleteModalRecord(null);
    }
  };

  const columnsCompact: TableColumnsType<any> = [
    {
      title: 'Employee',
      dataIndex: 'userId',
      key: 'userId',
      width: '52%',
      minWidth: isMobile ? 130 : 230,
      ellipsis: true,
      render: (_: any, record: any) => (
        <div
          onClick={() => handleEmployeeData(record)}
          className="cursor-pointer truncate text-[13px] text-[#262626]"
        >
          <span className="truncate block">
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
      ),
    },
    {
      title: 'Type',
      dataIndex: 'isRate',
      key: 'isRate',
      width: isMobile ? 72 : 110,
      render: (isRate: boolean) => (
        <span className="text-[13px] text-[#595959]">
          {isRate ? 'Rate' : 'Fixed'}
        </span>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'Amount',
      key: 'Amount',
      width: isMobile ? 90 : 130,
      render: (amount: string, record: any) =>
        amount ? <span className="text-[13px] text-[#434343]">{amount}</span> : '-',
    },
    {
      title: 'Action',
      key: 'action',
      width: isMobile ? 60 : 84,
      align: 'left',
      render: (_: any, record: any) => {
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
        return (
          <AccessGuard
            permissions={[
              Permissions.UpdateBenefitEntitlement,
              Permissions.DeleteBenefitEntitlement,
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
                  <span className="text-base font-semibold text-gray-900">
                    Delete Employee
                  </span>
                }
                content={
                  <div className="pt-2">
                    <p className="text-gray-800 text-sm font-normal m-0 leading-normal">
                      Are you Sure you want to remove{' '}
                      <strong>
                        {deleteModalRecord
                          ? getEmployeeName(deleteModalRecord.userId)
                          : ''}
                      </strong>{' '}
                      from this benefit type ?
                    </p>
                    <div className="flex justify-end gap-2 mt-4">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteModalRecord(null);
                        }}
                        className="h-10 px-4 rounded-md border border-gray-300 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50"
                        data-cy="compensation-benefit-delete-employee-popover-cancel"
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
                        data-cy="compensation-benefit-delete-employee-popover-confirm"
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
                >
                  <HiOutlineDotsHorizontal size={16} />
                </button>
              </Popover>
            </Dropdown>
          </AccessGuard>
        );
      },
    },
  ];

  const columns: TableColumnsType<any> = [
    {
      title: 'Employee',
      dataIndex: 'userId',
      key: 'userId',
      sorter: true,
      render: (rule: any, record: any) => (
        <div
          onClick={() => handleEmployeeData(record)}
          id={`compensation-benefit-entitlement-employee-${record?.userId}`}
          data-cy={`compensation-benefit-entitlement-employee-${record?.userId}`}
        >
          {' '}
          <EmployeeDetails
            data-cy={`compensation-benefit-entitlement-employee-details-${record?.userId}`}
            empId={record?.userId}
          />
        </div>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'isRate',
      key: 'isRate',
      sorter: true,
      width: 100,
      render: (isRate: string) => (
        <div
          id="compensation-benefit-entitlement-type-display"
          data-cy="compensation-benefit-entitlement-type-display"
        >
          {isRate ? 'Rate' : 'Fixed'}
        </div>
      ),
    },
    {
      title: 'Mode',
      dataIndex: 'mode',
      key: 'mode',
      sorter: true,
      width: 100,
      render: (mode: string) => (
        <div
          id="compensation-benefit-entitlement-mode-display"
          data-cy="compensation-benefit-entitlement-mode-display"
        >
          {mode == 'CREDIT' ? 'Credit' : 'Debit'}
        </div>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'Amount',
      key: 'Amount',
      sorter: true,
      width: 150,
      render: (amount: string, record) => (
        <div
          id={`compensation-benefit-entitlement-amount-${record?.id}`}
          data-cy={`compensation-benefit-entitlement-amount-${record?.id}`}
        >
          {amount
            ? record.isRate
              ? `${amount}% of base salary`
              : `${amount} ETB`
            : '-'}
        </div>
      ),
    },
    {
      title: (
        <span
          className="truncate"
          data-cy="benefit-entitlement-table-applicable-to-header"
        >
          Applicable To
        </span>
      ),
      dataIndex: 'ApplicableTo',
      key: 'ApplicableTo',
      sorter: true,
      render: (applicableTo: string) => (
        <div
          id="compensation-benefit-entitlement-applicable-display"
          data-cy="compensation-benefit-entitlement-applicable-display"
        >
          {applicableTo === 'PER-EMPLOYEE'
            ? 'Selected Employee'
            : 'All Employees'}
        </div>
      ),
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: (rule: any, record: any) => (
        <div
          id={`compensation-benefit-entitlement-actions-${record?.id}`}
          data-cy={`compensation-benefit-entitlement-actions-${record?.id}`}
        >
          <AccessGuard
            data-cy="compensation-benefit-entitlement-actions-access-guard"
            permissions={[
              Permissions.UpdateBenefitEntitlement,
              Permissions.DeleteBenefitEntitlement,
            ]}
          >
            <ActionButtons
              data-cy="compensation-benefit-entitlement-actions-button"
              id={record?.id ?? null}
              disableEdit={false}
              onEdit={() => handleEdit(record)}
              onDelete={() => handleDelete(record.id)}
            />
          </AccessGuard>
        </div>
      ),
    },
  ];

  const filteredDataSource = useMemo(() => {
    let data = transformedData;
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
    } else if (!compact && searchQuery) {
      data = data.filter((row: any) => row.userId === searchQuery);
    }
    return data;
  }, [transformedData, compact, searchText, searchQuery, employeeData?.items]);

  const paginatedData = filteredDataSource.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  return (
    <div
      id="compensation-benefit-entitlement-table-container"
      data-cy="compensation-benefit-entitlement-table-container"
    >
      <Spin
        data-cy="compensation-benefit-entitlement-table-loading"
        spinning={isLoading}
      >
        <>
          <div
            className="overflow-x-auto scrollbar-hide [&_.ant-table-wrapper]:!shadow-none [&_.ant-table]:!shadow-none"
            id="compensation-benefit-entitlement-table-scroll"
            data-cy="compensation-benefit-entitlement-table-scroll"
          >
            <Table
              data-cy="compensation-benefit-entitlement-table"
              className={`benefit-entitlement-table !shadow-none ${compact ? '' : 'mt-6'} ${
                compact
                    ? '[&_.ant-table]:text-sm [&_.ant-table]:rounded-md [&_.ant-table-cell]:align-middle [&_.ant-table-thead>tr>th]:bg-[#FAFAFA] [&_.ant-table-thead>tr>th]:text-[#262626] [&_.ant-table-thead>tr>th]:font-medium [&_.ant-table-thead>tr>th]:px-3 [&_.ant-table-thead>tr>th]:py-3 [&_.ant-table-thead>tr>th]:text-[13px] [&_.ant-table-thead>tr>th:last-child]:text-left [&_.ant-table-tbody>tr>td]:px-3 [&_.ant-table-tbody>tr>td]:py-[10px] [&_.ant-table-tbody>tr>td]:text-[#434343] [&_.ant-table-tbody>tr>td]:border-b [&_.ant-table-tbody>tr>td]:border-[#F0F0F0] [&_.ant-table-tbody>tr:last-child>td]:border-b-0 [&_.ant-table-tbody>tr.benefit-row-even>td]:bg-[#FFFFFF] [&_.ant-table-tbody>tr.benefit-row-odd>td]:bg-[#FAFAFA]'
                  : ''
              }`}
              columns={compact ? columnsCompact : columns}
              dataSource={paginatedData}
              rowKey="id"
              rowHoverable={false}
              rowClassName={(_, index) =>
                index % 2 === 0 ? 'benefit-row-even' : 'benefit-row-odd'
              }
              pagination={false}
              scroll={compact && (isMobile || isTablet) ? { x: 340 } : undefined}
            />
          </div>
          {isMobile || isTablet ? (
            <div
              className="mt-3 px-0"
              id="compensation-benefit-entitlement-mobile-pagination"
              data-cy="compensation-benefit-entitlement-mobile-pagination"
            >
              <CustomMobilePagination
                data-cy="compensation-benefit-entitlement-mobile-pagination"
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
              id="compensation-benefit-entitlement-pagination"
              data-cy="compensation-benefit-entitlement-pagination"
            >
              <CustomPagination
                data-cy="compensation-benefit-entitlement-pagination"
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
      </Spin>
      <BenefitTracking data-cy="compensation-benefit-tracking" />
      <div
        id="compensation-benefit-sidebar-create"
        data-cy="compensation-benefit-sidebar-create"
      >
          <BenefitEntitlementSideBar
            data-cy="compensation-benefit-sidebar-create"
            title={title}
          />
        </div>
        <div
          id="compensation-benefit-sidebar-edit"
          data-cy="compensation-benefit-sidebar-edit"
        >
          <BenefitEntitlementSideBarEdit
            data-cy="compensation-benefit-sidebar-edit"
            title={title}
          />
        </div>

        {/* Delete confirmation is rendered as an anchored Popover above the kebab button */}
    </div>
  );
};

export default BenefitEntitlementTable;
