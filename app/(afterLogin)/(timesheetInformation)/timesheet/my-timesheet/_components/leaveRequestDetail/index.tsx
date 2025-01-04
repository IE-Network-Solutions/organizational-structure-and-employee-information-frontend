import { useMyTimesheetStore } from '@/store/uistate/features/timesheet/myTimesheet';
import CustomDrawerLayout from '@/components/common/customDrawer';
import { Col, Divider, Row, Spin } from 'antd';
import CustomDrawerFooterButton, {
  CustomDrawerFooterButtonProps,
} from '@/components/common/customDrawer/customDrawerFooterButton';
import CustomDrawerHeader from '@/components/common/customDrawer/customDrawerHeader';
import { LeaveRequestStatus } from '@/types/timesheet/settings';
import React from 'react';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import {
  useGetSingleApprovalLog,
  useGetSingleLeaveRequest,
} from '@/store/server/features/timesheet/leaveRequest/queries';
import UserCard from '@/components/common/userCard/userCard';
import dayjs from 'dayjs';
import { DATE_FORMAT } from '@/utils/constants';
import { formatLinkToUploadFile } from '@/helpers/formatTo';
import { TbFileDownload } from 'react-icons/tb';
import ApprovalStatusesInfo from '@/components/common/approvalStatuses/approvalStatusesInfo';
import ApprovalStatusCard from '@/components/common/approvalStatuses/approvalStatusCard';
import Image from 'next/image';
import { classNames } from '@/utils/classNames';

const LeaveRequestDetail = () => {
  const {
    isShowLeaveRequestDetail,
    setIsShowLeaveRequestDetail,
    leaveRequestSidebarData,
    setLeaveRequestSidebarData,
  } = useMyTimesheetStore();

  const { data: employeeData } = useGetAllUsers();
  const userData = (id: string) => {
    const user = employeeData?.items?.find((item: any) => item.id === id);
    return `${user?.firstName || ''} ${user?.middleName || ''} ${user?.lastName || ''}`.trim();
  };

  const onClose = () => {
    setLeaveRequestSidebarData(null);
    setIsShowLeaveRequestDetail(false);
  };

  const { data: leaveData, isLoading } = useGetSingleLeaveRequest(
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
  const labelClass = 'text-sm text-gray-900 font-medium mb-2.5';

  return (
    isShowLeaveRequestDetail && (
      <CustomDrawerLayout
        open={isShowLeaveRequestDetail}
        onClose={onClose}
        modalHeader={
          <CustomDrawerHeader>Leave Request Details</CustomDrawerHeader>
        }
        footer={<CustomDrawerFooterButton buttons={footerModalItems} />}
        width="40%"
      >
        {!leaveData ? (
          <div className="flex justify-center py-10">
            <Spin />
          </div>
        ) : (
          <Spin spinning={isLoading}>
            <div className="flex items-center gap-[15px] mb-8">
              <div className="text-xs text-gray-900">Requester:</div>
              <UserCard
                name={
                  leaveData?.items?.userId &&
                  userData(String(leaveData?.items?.userId))
                }
                size="small"
              />
            </div>
            <Row gutter={[32, 32]}>
              <Col span={8}>
                <div className={labelClass}>Leave Type</div>
                <div
                  className={classNames(labelClass, undefined, [
                    'font-semibold',
                    'mb-0',
                  ])}
                >
                  {leaveData?.items?.leaveType
                    ? typeof leaveData?.items?.leaveType !== 'string'
                      ? leaveData?.items?.leaveType.title
                      : ''
                    : ''}
                </div>
              </Col>
              <Col span={8}>
                <div className={labelClass}>Date</div>
                <div
                  className={classNames(labelClass, undefined, [
                    'font-semibold',
                    'mb-0',
                  ])}
                >
                  {dayjs(leaveData?.items?.startAt).format(DATE_FORMAT)} -
                  &nbsp;
                  {dayjs(leaveData?.items?.endAt).format(DATE_FORMAT)}
                </div>
              </Col>
              <Col span={8}>
                <div className={labelClass}>Total Days</div>
                <div
                  className={classNames(labelClass, undefined, [
                    'font-semibold',
                    'mb-0',
                  ])}
                >
                  {leaveData?.items?.days ? leaveData?.items?.days : ''}
                </div>
              </Col>
              {leaveData?.items?.justificationDocument && (
                <Col span={24}>
                  <div className={labelClass}>
                    Attachment <span className="text-error">*</span>
                  </div>
                  <a
                    href={leaveData?.items?.justificationDocument}
                    target="_blank"
                    className="w-full h-[54px] border border-gray-200 rounded-[10px] flex items-center justify-between px-5 text-gray-900"
                  >
                    <div className="text-sm font-medium">
                      {
                        formatLinkToUploadFile(
                          leaveData?.items?.justificationDocument,
                        ).name
                      }
                    </div>

                    <TbFileDownload size={20} />
                  </a>
                </Col>
              )}
            </Row>
            <Divider className="my-8 h-[5px] bg-gray-200" />
            <div>
              <div className="text-lg font-semibold text-gray-900">
                Approval Levels Status
              </div>

              <div className="my-2.5">
                <ApprovalStatusesInfo />
              </div>

              {logData?.items?.map((approvalCard, idx) => (
                <ApprovalStatusCard
                  key={idx}
                  data={approvalCard}
                  userName={userData}
                />
              ))}
            </div>
            <Divider className="my-8 h-[5px] bg-gray-200" />

            <div>
              <div className="flex items-center justify-between mt-5 mb-4">
                <div className="text-sm font-semibold text-gray-900">
                  Over All Status
                </div>
                <div className="text-sm font-semibold text-gray-900 flex gap-2">
                  {leaveData?.items?.status}
                  <Image
                    width={24}
                    height={24}
                    src={
                      leaveData?.items?.status === LeaveRequestStatus?.APPROVED
                        ? '/icons/status/verify.svg'
                        : leaveData?.items?.status ===
                            LeaveRequestStatus?.PENDING
                          ? '/icons/status/information.svg'
                          : leaveData?.items?.status ===
                              LeaveRequestStatus?.DECLINED
                            ? '/icons/status/reject.svg'
                            : ''
                    }
                    alt={leaveData?.items?.status}
                  />
                </div>
              </div>
            </div>
          </Spin>
        )}
      </CustomDrawerLayout>
    )
  );
};

export default LeaveRequestDetail;
