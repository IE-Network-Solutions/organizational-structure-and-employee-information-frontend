'use client';
import { useGetAllIncentiveData } from '@/store/server/features/incentive/other/queries';
import {
  AllIncentiveData,
  useIncentiveStore,
} from '@/store/uistate/features/incentive/incentive';
import { Avatar, Table, TableColumnsType, Tooltip, Space } from 'antd';
import React, { useRef } from 'react';
import { useRouter } from 'next/navigation';
import { UserOutlined, DeleteOutlined } from '@ant-design/icons';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import CustomPagination from '@/components/customPagination';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import { useIsMobile } from '@/hooks/useIsMobile';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import DeleteConfirmationPopover from '@/components/common/deleteConfirmationPopover';
import { useDeleteIncentive } from '@/store/server/features/incentive/other/mutation';
import { useGetAllIncentiveIds } from '@/store/server/features/incentive/other/queries';

const AllIncentiveTable: React.FC = () => {
  const {
    searchParams,
    currentPage,
    pageSize,
    setCurrentPage,
    setPageSize,
    selectedRowKeys,
    setSelectedRowKeys,
  } = useIncentiveStore();

  const { mutate: deleteIncentive, isLoading: isDeleting } =
    useDeleteIncentive();
  const router = useRouter();
  const isSelectingAllRef = useRef(false);
  const [deleteModalOpen, setDeleteModalOpen] = React.useState<
    Record<string, boolean>
  >({});

  const { refetch: fetchAllIds } = useGetAllIncentiveIds(
    searchParams?.employee_name || '',
    searchParams?.byYear || ' ',
    searchParams?.bySession || '',
    searchParams?.byMonth || '',
    false, // Always disabled, we'll use refetch manually
  );

  const handleDeleteConfirm = (id: string) => {
    deleteIncentive(
      { id },
      {
        onSuccess: () => {
          setDeleteModalOpen((prev) => ({ ...prev, [id]: false }));
        },
      },
    );
  };

  const handleDeleteCancel = (id: string) => {
    setDeleteModalOpen((prev) => ({ ...prev, [id]: false }));
  };

  const columns: TableColumnsType<any> = [
    {
      title: 'Recognition',
      dataIndex: 'recognition',
      sorter: (a, b) => a.recognition.localeCompare(b.recognition),
    },
    {
      title: 'Employees',
      dataIndex: 'employee_name',
      sorter: (a, b) => a.recognition.localeCompare(b.employee_name),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      sorter: (a, b) => a.recognition.localeCompare(b.role),
    },
    {
      title: 'Criteria',
      dataIndex: 'criteria',
      sorter: (a, b) => a.recognition.localeCompare(b.criteria),
      width: 450,
    },
    {
      title: 'Bonus',
      dataIndex: 'bonus',
      sorter: (a, b) => a.recognition.localeCompare(b.bonus),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      sorter: (a, b) => a.recognition.localeCompare(b.status),
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right' as const,
      width: 100,
      render: (unused: any, record: any) => (
        <Space
          size="middle"
          onClick={(e) => e.stopPropagation()}
          id={`incentive-table-actions-${record.id}`}
          data-cy={`incentive-table-actions-${record.id}`}
        >
          <AccessGuard
            permissions={[Permissions.DeleteIncentive]}
            id={`incentive-table-delete-guard-${record.id}`}
            data-cy={`incentive-table-delete-guard-${record.id}`}
          >
            <DeleteConfirmationPopover
              open={deleteModalOpen[record.id] || false}
              onCancel={() => handleDeleteCancel(record.id)}
              onConfirm={() => handleDeleteConfirm(record.id)}
              message="Are you sure you want to permanently delete this record?"
              loading={isDeleting}
              id={`incentive-table-delete-modal-${record.id}`}
              data-cy={`incentive-table-delete-modal-${record.id}`}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteModalOpen((prev) => ({
                    ...prev,
                    [record.id]: true,
                  }));
                }}
                className="bg-red-600 hover:bg-red-700 text-white rounded w-8 h-8 flex items-center justify-center"
                id={`incentive-table-delete-button-${record.id}`}
                data-cy={`incentive-table-delete-button-${record.id}`}
              >
                <DeleteOutlined className="text-white" />
              </button>
            </DeleteConfirmationPopover>
          </AccessGuard>
        </Space>
      ),
    },
  ];

  const { isMobile, isTablet } = useIsMobile();

  const { data: incentiveData, isLoading: responseLoading } =
    useGetAllIncentiveData(
      searchParams?.employee_name || '',
      searchParams?.byYear || ' ',
      searchParams?.bySession,
      searchParams?.byMonth || '',
      pageSize,
      currentPage,
    );
  const { data: employeeData } = useGetAllUsers();

  const getEmployeeInformation = (id: string) => {
    const user = employeeData?.items?.find((item: any) => item.id === id);
    return user;
  };

  const onPageChange = (page: number, pageSize?: number) => {
    setCurrentPage(page);
    if (pageSize) {
      setPageSize(pageSize);
    }
  };

  const allIncentiveTableData =
    responseLoading ||
    !incentiveData?.items ||
    incentiveData?.items?.length === 0
      ? []
      : incentiveData.items.map((item: AllIncentiveData) => {
          return {
            id: item?.id,
            userId: item?.userId,
            recognition: item?.recognitionType || '--',
            employee_name: (
              <Tooltip
                id={`all-incentive-table-employee-tooltip-${item?.id}`}
                data-cy={`all-incentive-table-employee-tooltip-${item?.id}`}
              >
                <div
                  id={`all-incentive-table-employee-wrapper-${item?.id}`}
                  data-cy={`all-incentive-table-employee-wrapper-${item?.id}`}
                  className="flex flex-wrap items-center justify-start gap-3"
                >
                  <Avatar
                    data-cy={`all-incentive-table-employee-avatar-${item?.id}`}
                    icon={
                      <UserOutlined
                        id={`all-incentive-table-employee-avatar-icon-${item?.id}`}
                        data-cy={`all-incentive-table-employee-avatar-icon-${item?.id}`}
                      />
                    }
                  />
                  <span
                    id={`all-incentive-table-employee-name-${item?.id}`}
                    data-cy={`all-incentive-table-employee-name-${item?.id}`}
                  >
                    {getEmployeeInformation(item?.userId)?.firstName +
                      '  ' +
                      getEmployeeInformation(item?.userId)?.middleName}
                  </span>
                </div>
              </Tooltip>
            ),
            role: getEmployeeInformation(item?.userId)?.role?.name,
            criteria: item?.breakdown?.length ? (
              <div
                id={`all-incentive-table-criteria-wrapper-${item?.id}`}
                data-cy={`all-incentive-table-criteria-wrapper-${item?.id}`}
                className="flex gap-2 max-w-[400px] overflow-x-auto scrollbar-hide"
              >
                {item.breakdown.map((criterion, index) => (
                  <span
                    key={criterion?.criterionKey || index}
                    id={`all-incentive-table-criteria-${item?.id}-${index}`}
                    data-cy={`all-incentive-table-criteria-${item?.id}-${index}`}
                    className="whitespace-nowrap rounded-xl bg-[#D3E4F0] text-[#1D9BF0] px-2 py-1 text-sm flex-shrink-0"
                  >
                    {criterion?.criterionKey}
                  </span>
                ))}
              </div>
            ) : null,
            bonus: (
              <div
                id={`all-incentive-table-bonus-${item?.id}`}
                data-cy={`all-incentive-table-bonus-${item?.id}`}
              >
                {item?.amount} {''}ETB
              </div>
            ),
            status: (
              <div
                id={`all-incentive-table-status-wrapper-${item?.id}`}
                data-cy={`all-incentive-table-status-wrapper-${item?.id}`}
                className="inline-block"
              >
                {item?.isPaid ? (
                  <div
                    id={`all-incentive-table-status-paid-${item?.id}`}
                    data-cy={`all-incentive-table-status-paid-${item?.id}`}
                    className="rounded-lg bg-[#55C79033] py-1 px-6"
                  >
                    <span
                      id={`all-incentive-table-status-paid-text-${item?.id}`}
                      data-cy={`all-incentive-table-status-paid-text-${item?.id}`}
                      className="text-[#0CAF60] font-semibold text-md"
                    >
                      Paid
                    </span>
                  </div>
                ) : (
                  <div
                    id={`all-incentive-table-status-not-paid-${item?.id}`}
                    data-cy={`all-incentive-table-status-not-paid-${item?.id}`}
                    className="rounded-lg bg-[#FFEDEC] py-1 px-4"
                  >
                    <span
                      id={`all-incentive-table-status-not-paid-text-${item?.id}`}
                      data-cy={`all-incentive-table-status-not-paid-text-${item?.id}`}
                      className="text-[#E03137] font-semibold text-md"
                    >
                      Not Paid
                    </span>
                  </div>
                )}
              </div>
            ),
          };
        }) || [];

  const currentPageIds = (allIncentiveTableData || []).map((item: any) =>
    String(item.id),
  );
  const currentPageSelectedKeys = (selectedRowKeys || []).filter((key) =>
    currentPageIds.includes(String(key)),
  );

  const rowSelection = {
    selectedRowKeys: currentPageSelectedKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      if (isSelectingAllRef.current) return;

      const existingSelected = (selectedRowKeys || []).map(String);
      const otherPagesSelected = existingSelected.filter(
        (key) => !currentPageIds.includes(key),
      );
      const newSelectedStrings = newSelectedRowKeys.map(String);
      setSelectedRowKeys([
        ...otherPagesSelected,
        ...newSelectedStrings,
      ] as string[]);
    },
    onSelectAll: (selected: boolean) => {
      isSelectingAllRef.current = true;

      if (selected) {
        fetchAllIds()
          .then((response) => {
            if (response.data?.items) {
              const allIds = response.data.items.map((item: any) =>
                String(item.id),
              );
              const existingSelected = (selectedRowKeys || []).map(String);
              const allSelected =
                allIds.length > 0 &&
                allIds.every((id: string) => existingSelected.includes(id)) &&
                existingSelected.length === allIds.length;

              setSelectedRowKeys(allSelected ? [] : allIds);
            }
            setTimeout(() => {
              isSelectingAllRef.current = false;
            }, 100);
          })
          .catch(() => {
            const existingSelected = (selectedRowKeys || []).map(String);
            const allCurrentPageSelected =
              currentPageIds.length > 0 &&
              currentPageIds.every((id: string) =>
                existingSelected.includes(id),
              );

            const otherPagesSelected = existingSelected.filter(
              (key) => !currentPageIds.includes(key),
            );
            setSelectedRowKeys(
              allCurrentPageSelected
                ? otherPagesSelected
                : ([...otherPagesSelected, ...currentPageIds] as string[]),
            );
            setTimeout(() => {
              isSelectingAllRef.current = false;
            }, 100);
          });
      } else {
        setSelectedRowKeys([]);
        setTimeout(() => {
          isSelectingAllRef.current = false;
        }, 100);
      }
    },
  };

  return (
    <div
      id="all-incentive-table-container"
      data-cy="all-incentive-table-container"
      className="m-1"
    >
      <Table
        id="all-incentive-table"
        data-cy="all-incentive-table"
        rowSelection={{ type: 'checkbox', ...rowSelection }}
        rowKey="id"
        className="w-full cursor-pointer"
        columns={columns}
        dataSource={allIncentiveTableData}
        pagination={false}
        loading={responseLoading}
        scroll={{ x: 1400 }}
        onRow={(record) => ({
          onClick: () => {
            router.push(`/incentives/detail/${record?.id}`);
          },
        })}
      />

      {isMobile || isTablet ? (
        <CustomMobilePagination
          id="all-incentive-table-mobile-pagination"
          data-cy="all-incentive-table-mobile-pagination"
          totalResults={incentiveData?.meta?.totalItems}
          pageSize={pageSize}
          onChange={onPageChange}
          onShowSizeChange={onPageChange}
        />
      ) : (
        <CustomPagination
          id="all-incentive-table-pagination"
          data-cy="all-incentive-table-pagination"
          current={currentPage}
          total={incentiveData?.meta?.totalItems}
          pageSize={pageSize}
          onChange={onPageChange}
          onShowSizeChange={onPageChange}
        />
      )}
    </div>
  );
};

export default AllIncentiveTable;
