import ApprovalActionButtons from '@/components/Approval/actionButton';
import StatusBadge from '@/components/common/statusBadge/statusBadge';
import { useDeleteBranchTransferRequest } from '@/store/server/features/employees/approval/mutation';
import { useMyBranchApprovalStore } from '@/store/uistate/features/employees/branchTransfer/myrequest';
import { BranchRequest, RequestStatus } from '@/types/employee/approval';
import {
  LeaveRequestStatus,
  LeaveRequestStatusBadgeTheme,
} from '@/types/timesheet/settings';
import { Table, TableColumnsType } from 'antd';
import React from 'react';

const Request = ({
  data,
  pageSize,
  onPageChange,
  isFetching,
  title,
  itMyRequest,
}: {
  data: any;
  pageSize: number;
  onPageChange: (a: number, b?: number) => void;
  itMyRequest: boolean;
  isFetching: any;
  title: string;
}) => {
  const {
    setBranchRequestSidebarData,
    setIsShowBranchRequestDetail: isShowDetail,
  } = useMyBranchApprovalStore();
  const { mutate: deleteRequest } = useDeleteBranchTransferRequest();
  const columns: TableColumnsType<any> = [
    {
      title: 'Current Branch',
      dataIndex: 'currentBranch',
    },
    {
      title: 'Requested Branch',
      dataIndex: 'requestedBranch',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (text: LeaveRequestStatus) => (
        <StatusBadge theme={LeaveRequestStatusBadgeTheme[text]}>
          {text}
        </StatusBadge>
      ),
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: (data: BranchRequest) => {
        return (
          <ApprovalActionButtons
            id={data?.id ?? null}
            disableDelete={
              data.status === RequestStatus.APPROVED ||
              data.status === RequestStatus.DECLINED
            }
            itMyRequest={itMyRequest}
            onDelete={() => {
              deleteRequest(data.id);
            }}
            onDetail={() => {
              isShowDetail(true);
              setBranchRequestSidebarData(data.id);
            }}
          />
        );
      },
    },
  ];

  const allFilterData = data?.items?.map((item: any, index: number) => {
    return {
      key: index,
      currentBranch: item?.currentBranch?.name,
      requestedBranch: item?.requestBranch?.name,
      status: item?.status,
      action: item,
    };
  });
  return (
    <>
      <div className="flex items-center mb-6">
        <div className="text-2xl font-bold text-gray-900">{title}</div>
      </div>
      <Table
        columns={columns}
        loading={isFetching}
        dataSource={allFilterData}
        pagination={{
          total: allFilterData?.meta?.totalItems,
          current: allFilterData?.meta?.currentPage,
          pageSize: pageSize,
          onChange: onPageChange,
          showSizeChanger: true,
          onShowSizeChange: onPageChange,
        }}
      />
    </>
  );
};

export default Request;
