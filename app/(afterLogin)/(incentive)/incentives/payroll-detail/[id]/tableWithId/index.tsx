'use client';
import { useGetIncentiveDataByRecognitionId } from '@/store/server/features/incentive/other/queries';
import {
  AllIncentiveData,
  useIncentiveStore,
} from '@/store/uistate/features/incentive/incentive';
import { Avatar, Table, TableColumnsType, Tooltip, Tag } from 'antd';
import React from 'react';
import { UserOutlined, DeleteOutlined } from '@ant-design/icons';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { useIsMobile } from '@/hooks/useIsMobile';
import CustomPagination from '@/components/customPagination';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import DeleteConfirmationPopover from '@/components/common/deleteConfirmationPopover';
import { useDeleteIncentive } from '@/store/server/features/incentive/other/mutation';
import dayjs from 'dayjs';
import IncentiveDetailModal from './components/IncentiveDetailModal';

export type IncentiveTableDataParams = {
  recognition: string;
  employee_name: React.ReactNode;
  criteria: React.ReactNode;
  bonus: React.ReactNode;
  status: React.ReactNode;
  date_issued: React.ReactNode;
  createdAt: string;
  id: string;
};

interface IncentiveTableDetailsProps {
  id: string;
}

const IncentiveTableAfterGenerate: React.FC<IncentiveTableDetailsProps> = ({
  id,
}) => {
  const { mutate: deleteIncentive, isLoading: isDeleting } =
    useDeleteIncentive();
  const [deleteModalOpen, setDeleteModalOpen] = React.useState<
    Record<string, boolean>
  >({});
  const [detailModalOpen, setDetailModalOpen] = React.useState(false);
  const [selectedDetailId, setSelectedDetailId] = React.useState<string | null>(
    null,
  );

  const handleDeleteConfirm = (incentiveId: string) => {
    deleteIncentive(
      { id: incentiveId },
      {
        onSuccess: () => {
          setDeleteModalOpen((prev) => ({ ...prev, [incentiveId]: false }));
        },
      },
    );
  };

  const handleDeleteCancel = (incentiveId: string) => {
    setDeleteModalOpen((prev) => ({ ...prev, [incentiveId]: false }));
  };

  const columns: TableColumnsType<IncentiveTableDataParams> = [
    {
      title: 'Recognition',
      dataIndex: 'recognition',
      sorter: (a, b) => a.recognition.localeCompare(b.recognition),
      width: 260,
      render: (recognition: string) => (
        <span
          data-cy="incentive-detail-table-recognition-value"
          className="text-sm font-normal leading-normal text-black/70"
        >
          {recognition || '-'}
        </span>
      ),
    },
    {
      title: 'Employee',
      dataIndex: 'employee_name',
      width: 200,
    },
    {
      title: 'Criteria',
      dataIndex: 'criteria',
      width: 210,
    },
    {
      title: 'Bonus',
      dataIndex: 'bonus',
      width: 110,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 100,
    },
    {
      title: 'Date Issued',
      dataIndex: 'date_issued',
      width: 133,
      sorter: (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: 'Action',
      key: 'actions',
      width: 80,
      render: (unused: any, record: any) => (
        
          <AccessGuard
            permissions={[Permissions.DeleteRecognition]}
            id={`incentive-detail-table-delete-guard-${record.id}`}
            data-cy={`incentive-detail-table-delete-guard-${record.id}`}
          >
            <DeleteConfirmationPopover
              open={deleteModalOpen[record.id] || false}
              onCancel={() => handleDeleteCancel(record.id)}
              onConfirm={() => handleDeleteConfirm(record.id)}
              message="Are you sure you want to permanently delete this record?"
              loading={isDeleting}
              id={`incentive-delete-modal-${record.id}`}
              data-cy={`incentive-delete-modal-${record.id}`}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteModalOpen((prev) => ({
                    ...prev,
                    [record.id]: true,
                  }));
                }}
                className="bg-white hover:bg-gray-100 text-black border rounded-[4px] border-gray-300 w-7 h-7 flex items-center justify-center"
                id={`incentive-detail-table-delete-button-${record.id}`}
                data-cy={`incentive-detail-table-delete-button-${record.id}`}
              >
                <DeleteOutlined />
              </button>
            </DeleteConfirmationPopover>
          </AccessGuard>
      ),
    },
  ];

  const {
    searchParams,
    currentPage,
    pageSize,
    setCurrentPage,
    setPageSize,
    selectedRowKeys,
    setSelectedRowKeys,
  } = useIncentiveStore();

  const recognitionsTypeId = id;

  const { data: dynamicRecognitionData, isLoading: responseLoading } =
    useGetIncentiveDataByRecognitionId(
      recognitionsTypeId,
      searchParams?.employee_name || '',
      searchParams?.byYear || ' ',
      searchParams?.bySession,
      searchParams?.byMonth || '',
      pageSize,
      currentPage,
    );

  const onPageChange = (page: number, pageSize?: number) => {
    setCurrentPage(page);
    if (pageSize) {
      setPageSize(pageSize);
    }
  };

  const { data: employeeData } = useGetAllUsers();

  const getEmployeeInformation = (id: string) => {
    const user = employeeData?.items?.find((item: any) => item.id === id);
    return user;
  };
  const { isMobile, isTablet } = useIsMobile();

  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedRowKeys: any) => {
      setSelectedRowKeys(selectedRowKeys);
    },
  };

  const IncentiveByRecognitionTypeTableData =
    responseLoading || dynamicRecognitionData?.items?.length < 0
      ? []
      : dynamicRecognitionData?.items?.map((item: AllIncentiveData) => {
          return {
            id: item?.id,
            userId: item?.userId,
            recognition: item?.recognitionType || '--',
            employee_name: (
              <Tooltip
                id={`incentive-table-employee-tooltip-${item?.id}`}
                data-cy={`incentive-table-employee-tooltip-${item?.id}`}
              >
                <div
                  id={`incentive-table-employee-wrapper-${item?.id}`}
                  data-cy={`incentive-table-employee-wrapper-${item?.id}`}
                  className="flex items-center gap-2"
                >
                  {getEmployeeInformation(item?.userId)?.profileImage ? (
                    <Avatar
                      data-cy={`incentive-table-employee-avatar-${item?.id}`}
                      src={getEmployeeInformation(item?.userId)?.profileImage}
                      className="w-7 h-7 rounded-full object-cover"
                    />
                  ) : (
                    <Avatar
                      data-cy={`incentive-table-employee-avatar-${item?.id}`}
                      icon={
                        <UserOutlined
                          id={`incentive-table-employee-avatar-icon-${item?.id}`}
                          data-cy={`incentive-table-employee-avatar-icon-${item?.id}`}
                        />
                      }
                      className="w-7 h-7 rounded-full object-cover"
                    />
                  )}
                  <span
                    id={`incentive-table-employee-name-${item?.id}`}
                    data-cy={`incentive-table-employee-name-${item?.id}`}
                    className="text-sm font-normal leading-normal text-black/70"
                  >
                    {getEmployeeInformation(item?.userId)?.firstName +
                      '  ' +
                      getEmployeeInformation(item?.userId)?.middleName || '-'}
                  </span>
                </div>
              </Tooltip>
            ),
            role: getEmployeeInformation(item?.userId)?.role?.name,
            criteria:
              item?.breakdown?.length > 0 ? (
                <div
                  className="flex items-center gap-2"
                  id={`incentive-table-criterion-wrapper-${item?.id}`}
                  data-cy={`incentive-table-criterion-wrapper-${item?.id}`}
                >
                  {item?.breakdown?.slice(0, 1).map((criterion, index) => (
                    <span
                      id={`incentive-table-criterion-${item?.id}-${index}`}
                      data-cy={`incentive-table-criterion-${item?.id}-${index}`}
                      className="whitespace-nowrap px-2 py-.5 bg-gray-100 rounded-[4px] border border-[#D1D5DB] text-sm font-normal text-black/70"
                      key={criterion?.criterionKey || index}
                    >
                      {criterion?.criterionKey || '-'}
                    </span>
                  ))}
                  {item?.breakdown?.length > 1 && (
                    <span
                      id={`incentive-table-criterion-more-${item?.id}`}
                      data-cy={`incentive-table-criterion-more-${item?.id}`}
                      className="whitespace-nowrap px-2 py-.5 bg-gray-100 rounded-[4px] border border-[#D1D5DB] text-sm font-normal text-black/70"
                    >
                      +{item?.breakdown?.length - 1}
                    </span>
                  )}
                </div>
              ) : (
                <span
                  id={`incentive-table-criterion-empty-${item?.id}`}
                  data-cy={`incentive-table-criterion-empty-${item?.id}`}
                  className="text-sm font-normal leading-normal text-black/70"
                >
                  -
                </span>
              ),
            bonus: (
              <div
                id={`incentive-table-bonus-${item?.id}`}
                data-cy={`incentive-table-bonus-${item?.id}`}
                className="text-sm font-normal leading-normal text-black/70 whitespace-nowrap"
              >
                {Number(item?.amount || 0).toLocaleString()} ETB
              </div>
            ),
            status: (
              <div
                id={`incentive-table-status-wrapper-${item?.id}`}
                data-cy={`incentive-table-status-wrapper-${item?.id}`}
                className="inline-block"
              >
                {item?.isPaid ? (
                  <div
                    id={`incentive-table-status-paid-${item?.id}`}
                    data-cy={`incentive-table-status-paid-${item?.id}`}
                  >
                    <Tag
                      id={`incentive-table-status-paid-text-${item?.id}`}
                      data-cy={`incentive-table-status-paid-text-${item?.id}`}
                      className="text-[#16A34A] text-sm font-normal rounded-[4px] border border-[#B8E6CB] bg-[#ECFDF3] px-1 py-0.5"
                    >
                      Paid
                    </Tag>
                  </div>
                ) : (
                  <div
                    id={`incentive-table-status-not-paid-${item?.id}`}
                    data-cy={`incentive-table-status-not-paid-${item?.id}`}
                  >
                    <Tag
                      id={`incentive-table-status-not-paid-text-${item?.id}`}
                      data-cy={`incentive-table-status-not-paid-text-${item?.id}`}
                      className="text-[#EF4444] text-sm font-normal rounded-[4px] border border-[#FECACA] bg-[#FEF2F2] px-2 py-0.5"
                    >
                      Unpaid
                    </Tag>
                  </div>
                )}
              </div>
            ),
            date_issued: item?.createdAt
              ? dayjs(item?.createdAt).format('MMMM DD, YYYY')
              : '-',
            createdAt: item?.createdAt,
          };
        });

  return (
    <div
      id="incentive-table-after-generate-container"
      data-cy="incentive-table-after-generate-container"
      className="overflow-x-auto scrollbar-hide"
    >
      <Table
        id="incentive-table-after-generate-table"
        data-cy="incentive-table-after-generate-table"
        rowSelection={{ type: 'checkbox', ...rowSelection }}
        rowKey="id"
        className="w-full cursor-pointer"
        columns={columns}
        dataSource={IncentiveByRecognitionTypeTableData}
        pagination={false}
        loading={responseLoading}
        onRow={(record) => ({
          onClick: () => {
            setSelectedDetailId(record?.id);
            setDetailModalOpen(true);
          },
        })}
        rowHoverable={false}
        rowClassName={(unusedRecord, rowIndex) => {
          void unusedRecord;
          return rowIndex % 2 === 1 ? 'bg-[#fafafa]' : '';
        }}
      />
      {isMobile || isTablet ? (
        <CustomMobilePagination
          data-cy="incentive-table-after-generate-mobile-pagination"
          totalResults={dynamicRecognitionData?.meta?.totalItems}
          pageSize={pageSize}
          onChange={onPageChange}
          onShowSizeChange={onPageChange}
        />
      ) : (
        <CustomPagination
          data-cy="incentive-table-after-generate-pagination"
          current={currentPage}
          total={dynamicRecognitionData?.meta?.totalItems}
          pageSize={pageSize}
          onChange={onPageChange}
          onShowSizeChange={onPageChange}
        />
      )}

      <IncentiveDetailModal
        open={detailModalOpen}
        onCancel={() => {
          setDetailModalOpen(false);
          setSelectedDetailId(null);
        }}
        detailId={selectedDetailId}
      />
    </div>
  );
};

export default IncentiveTableAfterGenerate;
