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
          <div className=" p-6 rounded-lg  space-y-4 max-w-sm mx-auto">
            <div className="text-xl font-semibold ">
              <span className="">Current Branch:</span>{' '}
              <span className="font-light">
                {leaveData?.currentBranch?.name}
              </span>{' '}
            </div>
            <div className="text-xl font-semibold ">
              <span className="">Requested Branch:</span>{' '}
              <span className="font-light">
                {leaveData?.requestBranch?.name}
              </span>{' '}
            </div>

            <div className="flex items-center space-x-2">
              {leaveData?.status ? (
                <StatusBadge
                //   theme={LeaveRequestStatusBadgeTheme[leaveData?.status]}
                >
                  {leaveData?.status}
                </StatusBadge>
              ) : (
                ''
              )}
            </div>
          </div>
          <div className=" p-6 rounded-lg  space-y-4 max-w-sm mx-auto">
            <div className="text-xl font-semibold ">Approval History</div>
            <Steps
              direction="vertical"
              items={logData?.items?.map((step) => ({
                title: (
                  <span className="text-xl font-semibold ">{step.action}</span>
                ),
                subTitle: (
                  <div className="text-lg font-semibold">
                    {step?.action == 'Rejected'
                      ? 'Rejected By : '
                      : 'Approve By : '}
                    <span className="text-xl">
                      {userData(String(step.approvedUserId))?.firstName}{' '}
                      {userData(String(step.approvedUserId))?.middleName}{' '}
                      {userData(String(step.approvedUserId))?.lastName}
                    </span>
                  </div>
                ),
                description:
                  step?.action == 'Rejected' ? (
                    <span className="text-base">
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
