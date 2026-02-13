import { useGetSimpleEmployee } from '@/store/server/features/employees/employeeDetail/queries';
import { useGetApprovalTNARequest } from '@/store/server/features/timesheet/leaveRequest/queries';
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
import { useTnaReviewStore } from '@/store/uistate/features/tna/review';
import { useSingleCurrency } from '@/store/server/features/tna/review/queries';
import { useGetTnaCategory } from '@/store/server/features/tna/category/queries';
import {
  useSetAllApproveTnaRequest,
  useSetApproveLeaveRequest,
  useSetRejectTnaRequest,
} from '@/store/server/features/timesheet/leaveRequest/mutation';
import {
  useSetAllFinalApproveTnaRequest,
  useSetFinalApproveTnaRequest,
} from '@/store/server/features/tna/review/mutation';
import { AllLeaveRequestApproveData } from '@/store/server/features/timesheet/leaveRequest/interface';
import { useAllCurrentLeaveApprovedStore } from '@/store/uistate/features/timesheet/myTimesheet/allCurentApproved';
import { useIsMobile } from '@/hooks/useIsMobile';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import CustomPagination from '@/components/customPagination';

const TnaApprovalTable = () => {
  const tenantId = useAuthenticationStore.getState().tenantId;
  const { userId } = useAuthenticationStore();
  const userRollId = useAuthenticationStore.getState().userData.roleId;
  const { rejectComment, setRejectComment } = useApprovalTNAStore();
  const { pageSize, setPageSize, userCurrentPage, setUserCurrentPage } =
    useTnaReviewStore();
  const { data: currentApproverData, isFetching: currentApproverIsFetching } =
    useGetApprovalTNARequest(userId, userCurrentPage, pageSize);
  const { mutate: allApprover, isLoading: allApproveIsLoading } =
    useSetAllApproveTnaRequest();
  const { mutate: allReject, isLoading: allRejectIsLoading } =
    useSetRejectTnaRequest();
  const { mutate: editApprover } = useSetApproveLeaveRequest();
  const { mutate: finalApprover } = useSetFinalApproveTnaRequest();
  const { mutate: finalAllApproval } = useSetAllFinalApproveTnaRequest();
  const { allPageSize, allUserCurrentPage } = useAllCurrentLeaveApprovedStore();
  const onPageChange = (page: number, pageSize?: number) => {
    setUserCurrentPage(page);
    if (pageSize) {
      setPageSize(pageSize);
    }
  };
  const onPageSizeChange = (pageSize: number) => {
    setPageSize(pageSize);
    setUserCurrentPage(1);
  };
  const { isMobile, isTablet } = useIsMobile();

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
      render: (text: string) => (
        <EmpRender
          userId={text}
          data-cy="tna-my-training-approval-table-employee-name-render"
          id="tnaMyTrainingApprovalTableEmployeeNameRenderId"
        />
      ),
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
      render: (text: string) => (
        <CurrencyName
          currencyId={text}
          data-cy="tna-my-training-approval-table-currency-name-render"
        />
      ),
    },

    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (text: string) => (
        <TnaName
          tnaId={text}
          data-cy="tna-my-training-approval-table-tna-name-render"
        />
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      sorter: true,
      render: (text: TrainingNeedAssessmentStatus) => (
        <StatusBadge
          theme={TrainingNeedAssessmentStatusBadgeTheme[text]}
          data-cy="tna-my-training-approval-table-status-badge"
        >
          {text}
        </StatusBadge>
      ),
    },
    {
      title: 'Action',
      dataIndex: 'action',
    },
  ];
  const CurrencyName = ({ currencyId }: { currencyId: string }) => {
    const { data: tnaSingleCurrency } = useSingleCurrency(currencyId);
    return (
      <div
        className="mx-1 text-sm"
        data-cy="tna-my-training-approval-table-currency-name"
        id="tnaMyTrainingApprovalTableCurrencyNameId"
      >
        {tnaSingleCurrency ? tnaSingleCurrency?.code : '-'}
      </div>
    );
  };
  const TnaName = ({ tnaId }: { tnaId: string }) => {
    const { data: tnaCategoryData } = useGetTnaCategory({});
    const tna = tnaCategoryData?.items?.find((tnas: any) => tnas.id === tnaId);
    return (
      <div
        className="mx-1 text-sm"
        data-cy="tna-my-training-approval-table-tna-name"
        id="tnaMyTrainingApprovalTableTnaNameId"
      >
        {tnaId ? tna?.name : '-'}
      </div>
    );
  };

  const EmpRender = ({ userId }: any) => {
    const {
      isLoading,
      data: employeeData,
      isError,
    } = useGetSimpleEmployee(userId);

    if (isLoading)
      return (
        <div data-cy="review-components-approvaltabel-index-tsx-index-div-165">
          ...
        </div>
      );
    if (isError) return <>-</>;

    return employeeData ? (
      <div
        className="flex items-center gap-1.5"
        data-cy="tna-my-training-approval-table-employee-render"
        id="tnaMyTrainingApprovalTableEmployeeRenderId"
      >
        <div
          className="mx-1 text-sm"
          data-cy="tna-my-training-approval-table-employee-attendance-id"
          id="tnaMyTrainingApprovalTableEmployeeAttendanceIdId"
        >
          {employeeData?.employeeInformation?.employeeAttendanceId}
        </div>
        <Avatar
          size={24}
          icon={
            <UserOutlined data-cy="tna-my-training-approval-table-employee-icon" />
          }
          data-cy="tna-my-training-approval-table-employee-avatar"
        />
        <div
          className="flex-1"
          data-cy="tna-my-training-approval-table-employee-info"
          id="tnaMyTrainingApprovalTableEmployeeInfoId"
        >
          <div
            className="text-xs text-gray-900"
            data-cy="tna-my-training-approval-table-employee-full-name"
            id="tnaMyTrainingApprovalTableEmployeeFullNameId"
          >
            {employeeData?.firstName || '-'} {employeeData?.middleName || '-'}{' '}
            {employeeData?.lastName || '-'}
          </div>
          <div
            className="text-[10px] leading-4 text-gray-600"
            data-cy="tna-my-training-approval-table-employee-email"
            id="tnaMyTrainingApprovalTableEmployeeEmailId"
          >
            {employeeData?.email}
          </div>
        </div>
      </div>
    ) : (
      '-'
    );
  };
  const finalApproval: any = (e: { requestId: string; status: string }) => {
    finalApprover(e);
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
    editApprover(e, {
      onSuccess: () => {
        setRejectComment('');
        finalApproval({ requestId: e.requestId, status: 'declined' });
      },
    });
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
    editApprover(e, {
      onSuccess: (data) => {
        if (data?.last == true) {
          finalApproval({
            requestId: e.requestId,
            status: 'approved',
          });
        }
      },
    });
  };
  const cancel: any = () => {};
  const onAllApproveRequest = () => {
    const body: AllLeaveRequestApproveData = {
      userId: userId,
      roleId: userRollId,
      limit: allPageSize,
      page: allUserCurrentPage,
    };

    allApprover(body, {
      onSuccess: (data) => {
        if (data?.items?.length > 0) {
          const transformData = data.items.map(({ id }: { id: string }) => ({
            requestId: id,
            status: 'approved',
          }));
          finalAllApproval(transformData);
        }
      },
    });
  };
  const onAllRejectRequest = () => {
    const body: AllLeaveRequestApproveData = {
      userId: userId,
      roleId: userRollId,
      limit: allPageSize,
      page: allUserCurrentPage,
    };

    allReject(body, {
      onSuccess: (data) => {
        if (data?.items?.length > 0) {
          const transformData = data.items.map(({ id }: { id: string }) => ({
            requestId: id,
            status: 'rejected',
          }));
          finalAllApproval(transformData);
        }
      },
    });
  };
  const allFilterData = currentApproverData?.items?.map(
    (item: any, index: number) => {
      return {
        key: index,
        title: item?.title,
        assignedUserId: item?.assignedUserId,
        trainingPrice: item?.trainingPrice,
        reason: item?.reason,
        currencyId: item?.currencyId,
        type: item?.trainingNeedCategoryId,
        status: item?.status,
        action: (
          <div
            className="flex gap-4 "
            data-cy="tna-my-training-approval-table-action-buttons"
            id="tnaMyTrainingApprovalTableActionButtonsId"
          >
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
              id="tnaReviewApprovalTableApprovePopconfirmId"
              data-cy="tna-review-approval-table-approve-popconfirm"
            >
              <Button
                type="primary"
                data-cy="tna-review-approval-table-approve-button"
                id="tnaReviewApprovalTableApproveButtonId"
              >
                Approve
              </Button>
            </Popconfirm>
            <Popconfirm
              title="Reject Request"
              description={
                <>
                  <p data-cy="review-components-approvaltabel-index-tsx-index-p-345">
                    Are you sure you want to reject this leave request?
                  </p>
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
              id="tnaReviewApprovalTableRejectPopconfirmId"
              data-cy="tna-review-approval-table-reject-popconfirm"
            >
              <Button danger data-cy="tna-review-approval-table-reject-button">
                Reject
              </Button>
            </Popconfirm>
          </div>
        ),
      };
    },
  );
  return (
    <>
      {currentApproverData?.items?.length > 0 ? (
        <>
          <div
            className="flex items-center mb-6"
            id="tnaReviewApprovalTableHeaderId"
            data-cy="tna-review-approval-table-header"
          >
            <div
              className="text-2xl font-bold text-gray-900"
              id="tnaReviewApprovalTableTitleId"
              data-cy="tna-review-approval-table-title"
            >
              Waiting for my approval
            </div>
          </div>
          <div
            className="flex items-center justify-end mb-6"
            id="tnaReviewApprovalTableActionsId"
            data-cy="tna-review-approval-table-actions"
          >
            <div
              className="flex items-center gap-10 mb-6"
              id="tnaReviewApprovalTableBulkActionsId"
              data-cy="tna-review-approval-table-bulk-actions"
            >
              <Popconfirm
                title="All Approve Request"
                description="Are you sure to approve all leave request?"
                onConfirm={() => {
                  onAllApproveRequest();
                }}
                onCancel={cancel}
                okText="Approve All"
                cancelText="Cancel"
                id="tnaReviewApprovalTableApproveAllPopconfirmId"
                data-cy="tna-review-approval-table-approve-all-popconfirm"
              >
                <Button
                  disabled={allApproveIsLoading}
                  type="primary"
                  id="tnaReviewApprovalTableApproveAllButtonId"
                  data-cy="tna-review-approval-table-approve-all-button"
                >
                  <Spin
                    spinning={allApproveIsLoading}
                    data-cy="tna-review-approval-table-all-button-spin"
                  />
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
                id="tnaReviewApprovalTableRejectAllPopconfirmId"
                data-cy="tna-review-approval-table-reject-all-popconfirm"
              >
                <Button
                  disabled={allRejectIsLoading}
                  danger
                  id="tnaReviewApprovalTableRejectAllButtonId"
                  data-cy="tna-review-approval-table-reject-all-button"
                >
                  <Spin
                    spinning={allRejectIsLoading}
                    data-cy="tna-review-approval-table-reject-all-button-spin"
                  />
                  Reject All
                </Button>
              </Popconfirm>
            </div>
          </div>
          <Table
            columns={columns}
            loading={currentApproverIsFetching}
            dataSource={allFilterData}
            pagination={{
              total: currentApproverData?.meta?.totalItems,
              current: userCurrentPage,
              pageSize: pageSize,
              onChange: onPageChange,
            }}
            scroll={{ x: 'min-content' }}
            id="tnaReviewApprovalTableId"
            data-cy="tna-review-approval-table"
          />
          {isMobile || isTablet ? (
            <CustomMobilePagination
              totalResults={currentApproverData?.meta?.totalItems || 0}
              pageSize={pageSize}
              onChange={onPageChange}
              onShowSizeChange={onPageChange}
              data-cy="tna-review-approval-table-mobile-pagination"
            />
          ) : (
            <CustomPagination
              current={userCurrentPage}
              total={currentApproverData?.meta?.totalItems || 0}
              pageSize={pageSize}
              onChange={onPageChange}
              onShowSizeChange={onPageSizeChange}
              data-cy="tna-review-approval-table-pagination"
            />
          )}
        </>
      ) : (
        ''
      )}
    </>
  );
};

export default TnaApprovalTable;
