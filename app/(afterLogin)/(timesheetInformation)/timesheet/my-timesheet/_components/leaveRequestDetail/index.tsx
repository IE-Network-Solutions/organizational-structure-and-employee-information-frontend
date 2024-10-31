import { useMyTimesheetStore } from '@/store/uistate/features/timesheet/myTimesheet';
import CustomDrawerLayout from '@/components/common/customDrawer';
import { Spin, Steps } from 'antd';
import CustomDrawerFooterButton, {
  CustomDrawerFooterButtonProps,
} from '@/components/common/customDrawer/customDrawerFooterButton';
import CustomDrawerHeader from '@/components/common/customDrawer/customDrawerHeader';
import { LeaveRequestStatusBadgeTheme } from '@/types/timesheet/settings';
import React, { useState } from 'react';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import {
  useGetSingleApprovalLog,
  useGetSingleLeaveRequest,
} from '@/store/server/features/timesheet/leaveRequest/queries';
import StatusBadge from '@/components/common/statusBadge/statusBadge';

const LeaveRequestDetail = () => {
  const {
    isShowLeaveRequestDetail,
    setIsShowLeaveRequestDetail,
    leaveRequestSidebarData,
    setLeaveRequestSidebarData,
  } = useMyTimesheetStore();

  const { data: employeeData } = useGetAllUsers();
  const userData = (
    id: string,
  ): { firstName?: string; lastName?: string } | undefined => {
    const user = employeeData?.items?.find((item: any) => item.id === id);
    return user
      ? { firstName: user.firstName, lastName: user.lastName }
      : undefined;
  };

  const [isLoading, setIsLoading] = useState(false);

  const onClose = () => {
    setIsLoading(false);
    setLeaveRequestSidebarData(null);
    setIsShowLeaveRequestDetail(false);
  };

  const { data: leaveData } = useGetSingleLeaveRequest(
    leaveRequestSidebarData ?? '',
  );

  const { data: logData } = useGetSingleApprovalLog(
    leaveRequestSidebarData ?? '',
  );
  const footerModalItems: CustomDrawerFooterButtonProps[] = [
    {
      label: 'Cancel',
      key: 'cancel',
      className: 'h-[56px] text-base',
      size: 'large',
      onClick: () => {
        onClose();
        setLeaveRequestSidebarData(null);
      },
    },
  ];

  return (
    isShowLeaveRequestDetail && (
      <CustomDrawerLayout
        open={isShowLeaveRequestDetail}
        onClose={onClose}
        modalHeader={
          <CustomDrawerHeader>Leave Request Details</CustomDrawerHeader>
        }
        footer={<CustomDrawerFooterButton buttons={footerModalItems} />}
        width="400px"
      >
        <Spin spinning={isLoading}>
          <div className=" p-6 rounded-lg  space-y-4 max-w-sm mx-auto">
            <div className="text-xl font-semibold ">
              From{' '}
              <span className="font-light">{leaveData?.items?.startAt}</span> to{' '}
              <span className="font-light">{leaveData?.items?.endAt}</span>{' '}
            </div>
            <div className="text-xl font-semibold ">
              <span className="">Days:</span>{' '}
              <span className="font-light">{leaveData?.items?.days}</span>{' '}
            </div>
            <div className="text-xl font-semibold ">
              Leave Type:{' '}
              <span className="font-light">
                {String(leaveData?.items?.leaveType?.title)}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {leaveData?.items?.status ? (
                <StatusBadge
                  theme={LeaveRequestStatusBadgeTheme[leaveData?.items?.status]}
                >
                  {leaveData?.items?.status.charAt(0).toUpperCase() +
                    leaveData?.items?.status.slice(1)}
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

export default LeaveRequestDetail;
