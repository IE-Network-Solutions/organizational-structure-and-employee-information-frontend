import { useGetSimpleEmployee } from '@/store/server/features/employees/employeeDetail/queries';
import { useGetApprovalLeaveRequest } from '@/store/server/features/timesheet/leaveRequest/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { Avatar, Button, Input, Popconfirm, Spin, Table } from 'antd';
import React from 'react';
import { UserOutlined } from '@ant-design/icons';
import { TableColumnsType } from '@/types/table/table';
import StatusBadge from '@/components/common/statusBadge/statusBadge';
import {
  TrainingNeedAssessmentStatus,
  TrainingNeedAssessmentStatusBadgeTheme,
} from '@/types/tna/tna';
import { useApprovalTNAStore } from '@/store/uistate/features/tna/settings/approval';

const TnaApprovalTable = () => {
  const tenantId = useAuthenticationStore.getState().tenantId;
  const { userId } = useAuthenticationStore();
  const userRollId = useAuthenticationStore.getState().userData.roleId;
  const { rejectComment, setRejectComment } = useApprovalTNAStore();

  //   const { data, isFetching } = useGetApprovalLeaveRequest(
  //     userId,
  //     // userCurrentPage,
  //     1,
  //     // pageSize,
  //     5
  //   );
  const trainingData: any = {
    items: [
      {
        title: 'Training Session 1',
        trainingPrice: 100,
        reason: 'Skill Development',
        currencyId: 'USD',
        status: 'pending',
        assignedUserId: 'abe45de0-923b-4b2c-8851-e75b234b4485',
      },
      {
        title: 'Training Session 2',
        trainingPrice: 150,
        reason: 'Team Building',
        currencyId: 'USD',
        status: 'pending',
        assignedUserId: 'abe45de0-923b-4b2c-8851-e75b234b4485',
      },
      {
        title: 'Training Session 3',
        trainingPrice: 200,
        reason: 'Leadership Skills',
        currencyId: 'USD',
        status: 'pending',
        assignedUserId: 'abe45de0-923b-4b2c-8851-e75b234b4485',
      },
      {
        title: 'Training Session 4',
        trainingPrice: 120,
        reason: 'Technical Skills',
        currencyId: 'USD',
        status: 'pending',
        assignedUserId: 'abe45de0-923b-4b2c-8851-e75b234b4485',
      },
      {
        title: 'Training Session 5',
        trainingPrice: 180,
        reason: 'Communication Skills',
        currencyId: 'USD',
        status: 'pending',
        assignedUserId: 'abe45de0-923b-4b2c-8851-e75b234b4485',
      },
    ],
    meta: {
      currentPage: 1,
      itemCount: 5,
      itemsPerPage: 20,
      totalItems: 5,
      totalPages: 4,
    },
  };
  const onPageChange = (page: number) => {
    //   setUserCurrentPage(page);
  };
  const columns: TableColumnsType<any> = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Employee Name',
      dataIndex: 'assignedUserId',
      key: 'assignedUserId',
      render: (text: string) => <EmpRender userId={text} />,
    },
    {
      title: 'Price',
      dataIndex: 'trainingPrice',
      key: 'trainingPrice',
    },

    {
      title: 'reason',
      dataIndex: 'reason',
      key: 'reason',
    },
    {
      title: 'currency',
      dataIndex: 'currencyId',
      key: 'currencyId',
    },

    {
      title: 'Type',
      dataIndex: 'leaveType',
      key: 'leaveType',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      sorter: true,
      render: (text: TrainingNeedAssessmentStatus) => (
        <StatusBadge theme={TrainingNeedAssessmentStatusBadgeTheme[text]}>
          {text}
        </StatusBadge>
      ),
    },
    {
      title: 'Action',
      dataIndex: 'action',
    },
  ];
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
  const reject: any = (e: {
    approvalWorkflowId: any;
    stepOrder: any;
    requestId: any;
    approvedUserId: string;
    approverRoleId: any;
    action: string;
    tenantId: string;
    comment: { comment: string; commentedBy: string; tenantId: string };
  }) => {
    console.log(e);
    // editApprover(e, {
    //   onSuccess: () => {
    //     setRejectComment('');
    //   },
    // });
  };

  const confirm: any = (e: {
    approvalWorkflowId: any;
    stepOrder: any;
    requestId: any;
    approvedUserId: string;
    approverRoleId: any;
    action: string;
    tenantId: string;
  }) => {
    // editApprover(e);
    console.log(e);
  };
  const cancel: any = () => {};

  const allFilterData = trainingData?.items?.map((item: any, index: number) => {
    return {
      key: index,
      title: item?.title,
      assignedUserId: item?.assignedUserId,
      trainingPrice: item?.trainingPrice,
      reason: item?.reason,
      currencyId: item?.currencyId,
      status: item?.status,
      action: (
        <div className="flex gap-4 ">
          <Popconfirm
            title="Approve Request"
            description="Are you sure to approve this leave request?"
            onConfirm={() => {
              confirm({
                approvalWorkflowId: item?.approvalWorkflowId,
                stepOrder: item?.nextApprover?.[0]?.stepOrder,
                requestId: item?.id,
                approvedUserId: userId,
                approverRoleId: userRollId,
                action: 'Approved',
                tenantId: tenantId,
              });
            }}
            onCancel={cancel}
            okText="Approve"
            cancelText="Cancel"
          >
            <Button type="primary">Approve</Button>
          </Popconfirm>
          <Popconfirm
            title="Reject Request"
            description={
              <>
                <p>Are you sure you want to reject this leave request?</p>
                <Input
                  placeholder="Add a comment"
                  value={rejectComment}
                  onChange={(e) => setRejectComment(e.target.value)}
                  style={{ marginTop: 8 }}
                />
              </>
            }
            onConfirm={() => {
              reject({
                approvalWorkflowId: item?.approvalWorkflowId,
                stepOrder: item?.nextApprover?.[0]?.stepOrder,
                requestId: item?.id,
                approvedUserId: userId,
                approverRoleId: userRollId,
                action: 'Rejected',
                tenantId: tenantId,
                comment: {
                  comment: rejectComment,
                  commentedBy: userId,
                  tenantId: tenantId,
                },
              });
            }}
            onCancel={cancel}
            okText="Reject"
            cancelText="Cancel"
            okButtonProps={{ disabled: !rejectComment }}
          >
            <Button danger>Reject</Button>
          </Popconfirm>
        </div>
      ),
    };
  });
  return (
    <>
      {trainingData?.items?.length > 0 ? (
        <>
          <div className="flex items-center mb-6">
            <div className="text-2xl font-bold text-gray-900">
              Waiting for my approval
            </div>
          </div>
          <div className="flex items-center justify-end mb-6">
            {/* <div className="flex items-center gap-10 mb-6">
              <Popconfirm
                title="All Approve Request"
                description="Are you sure to approve all leave request?"
                onConfirm={() => {
                  onAllApproveRequest();
                }}
                onCancel={cancel}
                okText="Approve All"
                cancelText="Cancel"
              >
                <Button disabled={allApproveIsLoading} type="primary">
                  <Spin spinning={allApproveIsLoading} />
                  Approve All
                </Button>{' '}
              </Popconfirm>
              <Popconfirm
                title="All Reject Request"
                description="Are you sure to reject all leave request?"
                onConfirm={() => {
                  onAllRejectRequest();
                }}
                onCancel={cancel}
                okText="Reject All"
                cancelText="Cancel"
              >
                <Button disabled={allRejectIsLoading} danger>
                  <Spin spinning={allRejectIsLoading} />
                  Reject All
                </Button>
              </Popconfirm>
            </div> */}
          </div>
          <Table
            columns={columns}
            // loading={isFetching}
            dataSource={allFilterData}
            pagination={{
              total: trainingData?.meta?.totalItems,
              current: trainingData?.meta?.userCurrentPage,
              pageSize: trainingData?.meta?.totalPages,
              onChange: onPageChange,
            }}
            scroll={{ x: 'min-content' }}
          />
        </>
      ) : (
        ''
      )}
    </>
  );
};

export default TnaApprovalTable;
