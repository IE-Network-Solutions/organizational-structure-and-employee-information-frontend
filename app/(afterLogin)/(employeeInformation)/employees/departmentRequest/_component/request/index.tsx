import ApprovalActionButtons from '@/components/Approval/actionButton';
import StatusBadge from '@/components/common/statusBadge/statusBadge';
import { useDeleteBranchTransferRequest } from '@/store/server/features/employees/approval/mutation';
import { useGetSimpleEmployee } from '@/store/server/features/employees/employeeDetail/queries';
import { useMyBranchApprovalStore } from '@/store/uistate/features/employees/branchTransfer/myrequest';
import { BranchRequest, RequestStatus } from '@/types/employee/approval';
import {
  LeaveRequestStatus,
  LeaveRequestStatusBadgeTheme,
} from '@/types/timesheet/settings';
import { Avatar, Table, TableColumnsType } from 'antd';
import { UserOutlined } from '@ant-design/icons';
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
  const EmpRender = ({ userId }: any) => {
    const {
      isLoading,
      data: employeeData,
      isError,
    } = useGetSimpleEmployee(userId);

    if (isLoading) return <div>...</div>;
    if (isError) return <>-</>;

    return employeeData ? (
      <div className="flex items-center gap-1.5">
        <div className="mx-1 text-sm">
          {employeeData?.employeeInformation?.employeeAttendanceId}
        </div>
        <Avatar size={24} icon={<UserOutlined />} />
        <div className="flex-1">
          <div className="text-xs text-gray-900">
            {employeeData?.firstName || '-'} {employeeData?.middleName || '-'}{' '}
            {employeeData?.lastName || '-'}
          </div>
          <div className="text-[10px] leading-4 text-gray-600">
            {employeeData?.email}
          </div>
        </div>
      </div>
    ) : (
      '-'
    );
  };
  const {
    setBranchRequestSidebarData,
    setBranchRequestSidebarWorkflowData,
    setIsShowBranchRequestDetail: isShowDetail,
  } = useMyBranchApprovalStore();
  const { mutate: deleteRequest } = useDeleteBranchTransferRequest();
  const columns: TableColumnsType<any> = [
    ...(itMyRequest
      ? []
      : [
          {
            title: 'Employee Name',
            dataIndex: 'userId',
            key: 'createdBy',
            render: (text: string) => <EmpRender userId={text} />,
          },
        ]),
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
              setBranchRequestSidebarWorkflowData(data.approvalWorkflowId);
            }}
          />
        );
      },
    },
  ];
  const allFilterData = data?.items?.map((item: any, index: number) => {
    return {
      key: index,
      userId: item?.userId,
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
