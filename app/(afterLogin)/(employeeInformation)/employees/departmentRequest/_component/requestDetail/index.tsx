import CustomDrawerLayout from '@/components/common/customDrawer';
import CustomDrawerFooterButton, {
  CustomDrawerFooterButtonProps,
} from '@/components/common/customDrawer/customDrawerFooterButton';
import CustomDrawerHeader from '@/components/common/customDrawer/customDrawerHeader';
import StatusBadge from '@/components/common/statusBadge/statusBadge';
import { useGetSingleTransferRequest } from '@/store/server/features/employees/approval/queries';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { useGetSingleApprovalLog } from '@/store/server/features/timesheet/leaveRequest/queries';
import { useMyBranchApprovalStore } from '@/store/uistate/features/employees/branchTransfer/myrequest';
import { Spin, Steps } from 'antd';
import React from 'react';

const toSlug = (value: string | number | null | undefined) =>
  String(value ?? 'na')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const RequestDetail = () => {
  const {
    isShowBranchRequestDetail,
    setIsShowBranchRequestDetail,
    branchRequestSidebarData,
    setBranchRequestSidebarData,
    branchRequestSidebarWorkflowData,
    setBranchRequestSidebarWorkflowData,
  } = useMyBranchApprovalStore();

  const { data: employeeData } = useGetAllUsers();
  const userData = (
    id: string,
  ):
    | { firstName?: string; middleName?: string; lastName?: string }
    | undefined => {
    const user = employeeData?.items?.find((item: any) => item.id === id);
    return user
      ? {
          firstName: user.firstName,
          middleName: user?.middleName,
          lastName: user.lastName,
        }
      : undefined;
  };

  const onClose = () => {
    setBranchRequestSidebarData('');
    setBranchRequestSidebarWorkflowData('');
    setIsShowBranchRequestDetail(false);
  };

  const { data: leaveData, isLoading } = useGetSingleTransferRequest(
    branchRequestSidebarData ?? '',
  );
  const { data: logData } = useGetSingleApprovalLog(
    branchRequestSidebarData ?? '',
    branchRequestSidebarWorkflowData ?? '',
  );
  const footerModalItems: CustomDrawerFooterButtonProps[] = [
    {
      label: 'Cancel',
      key: 'cancel',
      className: 'h-[56px] text-base',
      size: 'large',
      onClick: () => {
        onClose();
        setBranchRequestSidebarData('');
        setBranchRequestSidebarWorkflowData('');
      },
    },
  ];

  return (
    isShowBranchRequestDetail && (
      <CustomDrawerLayout
        open={isShowBranchRequestDetail}
        onClose={onClose}
        modalHeader={<CustomDrawerHeader>Request Details</CustomDrawerHeader>}
        footer={<CustomDrawerFooterButton buttons={footerModalItems} />}
        width="400px"
      >
        <Spin spinning={isLoading}>
          <div
            className=" p-6 rounded-lg  space-y-4 max-w-sm mx-auto"
            id="department-request-detail-info"
            data-cy="department-request-detail-info"
          >
            <div
              className="text-xl font-semibold "
              id="department-request-detail-current-branch"
              data-cy="department-request-detail-current-branch"
            >
              <span
                className=""
                id="department-request-detail-current-label"
                data-cy="department-request-detail-current-label"
              >
                Current Branch:
              </span>{' '}
              <span
                className="font-light"
                id="department-request-detail-current-value"
                data-cy="department-request-detail-current-value"
              >
                {leaveData?.currentBranch?.name}
              </span>{' '}
            </div>
            <div
              className="text-xl font-semibold "
              id="department-request-detail-requested-branch"
              data-cy="department-request-detail-requested-branch"
            >
              <span
                className=""
                id="department-request-detail-requested-label"
                data-cy="department-request-detail-requested-label"
              >
                Requested Branch:
              </span>{' '}
              <span
                className="font-light"
                id="department-request-detail-requested-value"
                data-cy="department-request-detail-requested-value"
              >
                {leaveData?.requestBranch?.name}
              </span>{' '}
            </div>

            <div
              className="flex items-center space-x-2"
              id="department-request-detail-status-wrapper"
              data-cy="department-request-detail-status-wrapper"
            >
              {leaveData?.status ? (
                <StatusBadge
                //   theme={LeaveRequestStatusBadgeTheme[leaveData?.status]}
                  data-cy="department-request-detail-status-badge"
                >
                  {leaveData?.status}
                </StatusBadge>
              ) : (
                ''
              )}
            </div>
          </div>
          <div
            className=" p-6 rounded-lg  space-y-4 max-w-sm mx-auto"
            id="department-request-detail-history"
            data-cy="department-request-detail-history"
          >
            <div
              className="text-xl font-semibold "
              id="department-request-detail-history-title"
              data-cy="department-request-detail-history-title"
            >
              Approval History
            </div>
            <Steps
              data-cy="department-request-detail-history-steps"
              direction="vertical"
              items={logData?.items?.map((step) => ({
                title: (
                  <span
                    className="text-xl font-semibold "
                    id={`department-request-detail-step-title-${toSlug(`${step?.id}-${step?.action}`)}`}
                    data-cy={`department-request-detail-step-title-${toSlug(`${step?.id}-${step?.action}`)}`}
                  >
                    {step.action}
                  </span>
                ),
                subTitle: (
                  <div
                    className="text-lg font-semibold"
                    id={`department-request-detail-step-subtitle-${toSlug(`${step?.id}-${step?.action}`)}`}
                    data-cy={`department-request-detail-step-subtitle-${toSlug(`${step?.id}-${step?.action}`)}`}
                  >
                    {step?.action == 'Rejected'
                      ? 'Rejected By : '
                      : 'Approve By : '}
                    <span
                      className="text-xl"
                      id={`department-request-detail-step-user-${toSlug(`${step?.id}-${step?.action}`)}`}
                      data-cy={`department-request-detail-step-user-${toSlug(`${step?.id}-${step?.action}`)}`}
                    >
                      {userData(String(step.approvedUserId))?.firstName}{' '}
                      {userData(String(step.approvedUserId))?.middleName}{' '}
                      {userData(String(step.approvedUserId))?.lastName}
                    </span>
                  </div>
                ),
                description:
                  step?.action == 'Rejected' ? (
                    <span
                      className="text-base"
                      id={`department-request-detail-step-reason-${toSlug(`${step?.id}-${step?.action}`)}`}
                      data-cy={`department-request-detail-step-reason-${toSlug(`${step?.id}-${step?.action}`)}`}
                    >
                      Reason : {step?.approvalComments?.[0]?.comment}
                    </span>
                  ) : (
                    ''
                  ),
                status: step?.action == 'Rejected' ? 'error' : 'process',
              }))}
              className="space-y-4"
            />
            {logData?.items ? '' : 'No Approval Log'}
          </div>
        </Spin>
      </CustomDrawerLayout>
    )
  );
};

export default RequestDetail;
