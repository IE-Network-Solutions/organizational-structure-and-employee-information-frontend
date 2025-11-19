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

const toSlug = (value: string | number | null | undefined) =>
  String(value ?? 'na')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

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

    const userSlug = toSlug(userId);

    if (isLoading)
      return (
        <div
          id={`department-request-emp-loading-${userSlug}`}
          data-cy={`department-request-emp-loading-${userSlug}`}
        >
          ...
        </div>
      );
    if (isError)
      return (
        <>
          -
        </>
      );

    return employeeData ? (
      <div
        className="flex items-center gap-1.5"
        id={`department-request-emp-card-${userSlug}`}
        data-cy={`department-request-emp-card-${userSlug}`}
      >
        <div
          className="mx-1 text-sm"
          id={`department-request-emp-attendance-${userSlug}`}
          data-cy={`department-request-emp-attendance-${userSlug}`}
        >
          {employeeData?.employeeInformation?.employeeAttendanceId}
        </div>
        <Avatar
          size={24}
          icon={<UserOutlined id={`department-request-emp-avatar-user-icon-${userSlug}`} />}
          data-cy={`department-request-emp-avatar-icon-${userSlug}`}
        />
        <div
          className="flex-1"
          id={`department-request-emp-info-${userSlug}`}
          data-cy={`department-request-emp-info-${userSlug}`}
        >
          <div
            className="text-xs text-gray-900"
            id={`department-request-emp-name-${userSlug}`}
            data-cy={`department-request-emp-name-${userSlug}`}
          >
            {employeeData?.firstName || '-'} {employeeData?.middleName || '-'}{' '}
            {employeeData?.lastName || '-'}
          </div>
          <div
            className="text-[10px] leading-4 text-gray-600"
            id={`department-request-emp-email-${userSlug}`}
            data-cy={`department-request-emp-email-${userSlug}`}
          >
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
      render: (text: LeaveRequestStatus, record: any) => {
        const statusSlug = toSlug(`${record?.id}-${text}`);
        return (
          <StatusBadge 
            theme={LeaveRequestStatusBadgeTheme[text]}
            data-cy={`department-request-status-wrapper-${statusSlug}`}
          >
            {text}
          </StatusBadge>
        );
      },
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: (data: BranchRequest) => {
        const actionSlug = toSlug(data?.id || 'action');
        return (
          <ApprovalActionButtons
            data-cy={`department-request-action-buttons-${actionSlug}`}
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
              setBranchRequestSidebarWorkflowData(
                data.approvalWorkflowId,
              );
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
  const titleSlug = toSlug(title);

  return (
    <>
      <div
        className="flex items-center mb-6"
        id={`department-request-header-${titleSlug}`}
        data-cy={`department-request-header-${titleSlug}`}
      >
        <div
          className="text-2xl font-bold text-gray-900"
          id={`department-request-title-${titleSlug}`}
          data-cy={`department-request-title-${titleSlug}`}
        >
          {title}
        </div>
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
        id={`department-request-table-${titleSlug}`}
        data-cy={`department-request-table-${titleSlug}`}
      />
    </>
  );
};

export default Request;
