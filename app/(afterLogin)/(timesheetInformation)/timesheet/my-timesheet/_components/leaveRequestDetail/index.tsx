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
  useGetSingleApproval,
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
    leaveRequestSidebarWorkflowData,
    setLeaveRequestSidebarWorkflowData,
  } = useMyTimesheetStore();

  const { data: employeeData } = useGetAllUsers();
  const userData = (id: string) => {
    const user = employeeData?.items?.find((item: any) => item.id === id);
    return `${user?.firstName || ''} ${user?.middleName || ''} ${user?.lastName || ''}`.trim();
  };
  const userImage = (id: string) => {
    const user = employeeData?.items?.find((item: any) => item.id === id);
    return user?.profileImage;
  };

  const onClose = () => {
    setLeaveRequestSidebarData(null);
    setLeaveRequestSidebarWorkflowData(null);
    setIsShowLeaveRequestDetail(false);
  };

  const { data: leaveData, isLoading } = useGetSingleLeaveRequest(
    leaveRequestSidebarData ?? '',
  );

  const { data: logData } = useGetSingleApprovalLog(
    leaveRequestSidebarData ?? '',
    leaveRequestSidebarWorkflowData ?? '',
  );

  const { data: approverLog } = useGetSingleApproval(
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
        setLeaveRequestSidebarWorkflowData(null);
      },
      id: 'time-attendance-leave-request-detail-cancel-button',
      'data-cy': 'time-attendance-leave-request-detail-cancel-button',
    },
  ];
  const labelClass = 'text-sm text-gray-900 font-medium mb-2.5';
  type ApprovalRecord = {
    approverId: string; // UUID
    userId: string; // UUID
    stepOrder: number;
    status: 'Approved' | 'Rejected' | 'Pending'; // Adjust enum as needed
    conditionField: string | null;
    conditionRangeValue: string | null;
    tenantId: string; // UUID
    approvalLogId: string; // UUID
    requestId: string; // UUID
    approvalWorkflowId: string; // UUID
    action: 'Approved' | 'Rejected'; // Adjust enum as needed
    approvalComments: any;
  };

  return (
    isShowLeaveRequestDetail && (
      <CustomDrawerLayout
        open={isShowLeaveRequestDetail}
        onClose={onClose}
        modalHeader={
          <CustomDrawerHeader data-cy="time-attendance-leave-request-detail-header">
            Leave Request Details
          </CustomDrawerHeader>
        }
        footer={
          <CustomDrawerFooterButton
            data-cy="time-attendance-leave-request-detail-footer-button"
            buttons={footerModalItems}
          />
        }
        width="40%"
        data-cy="time-attendance-leave-request-detail-sidebar"
      >
        {!leaveData ? (
          <div
            className="flex justify-center py-10"
            id="time-attendance-leave-request-detail-loading"
            data-cy="time-attendance-leave-request-detail-loading"
          >
            <Spin data-cy="time-attendance-leave-request-detail-loading-spin" />
          </div>
        ) : (
          <Spin
            spinning={isLoading}
            data-cy="time-attendance-leave-request-detail-content-spin"
          >
            <div
              className="flex items-center gap-[15px] mb-8"
              id="time-attendance-leave-request-detail-requester-container"
              data-cy="time-attendance-leave-request-detail-requester-container"
            >
              <div
                className="text-xs text-gray-900"
                id="time-attendance-leave-request-detail-requester-label"
                data-cy="time-attendance-leave-request-detail-requester-label"
              >
                Requester:
              </div>
              <UserCard
                data={leaveData}
                name={
                  leaveData?.items?.userId &&
                  userData(String(leaveData?.items?.userId))
                }
                profileImage={
                  leaveData?.items?.userId &&
                  userImage(String(leaveData?.items?.userId))
                }
                size="small"
                data-cy="time-attendance-leave-request-detail-requester-card"
              />
            </div>
            <Row
              gutter={[32, 32]}
              id="time-attendance-leave-request-detail-info-row"
              data-cy="time-attendance-leave-request-detail-info-row"
            >
              <Col span={8}>
                <div
                  className={labelClass}
                  id="time-attendance-leave-request-detail-leave-type-label"
                  data-cy="time-attendance-leave-request-detail-leave-type-label"
                >
                  Leave Type
                </div>
                <div
                  className={classNames(labelClass, undefined, [
                    'font-semibold',
                    'mb-0',
                  ])}
                  id="time-attendance-leave-request-detail-leave-type-value"
                  data-cy="time-attendance-leave-request-detail-leave-type-value"
                >
                  {leaveData?.items?.leaveType
                    ? typeof leaveData?.items?.leaveType !== 'string'
                      ? leaveData?.items?.leaveType.title
                      : ''
                    : ''}
                </div>
              </Col>
              <Col span={8}>
                <div
                  className={labelClass}
                  id="time-attendance-leave-request-detail-date-label"
                  data-cy="time-attendance-leave-request-detail-date-label"
                >
                  Date
                </div>
                <div
                  className={classNames(labelClass, undefined, [
                    'font-semibold',
                    'mb-0',
                  ])}
                  id="time-attendance-leave-request-detail-date-value"
                  data-cy="time-attendance-leave-request-detail-date-value"
                >
                  {dayjs(leaveData?.items?.startAt).format(DATE_FORMAT)} -
                  &nbsp;
                  {dayjs(leaveData?.items?.endAt).format(DATE_FORMAT)}
                </div>
              </Col>
              <Col
                data-cy="time-attendance-leave-request-detail-total-days-column"
                span={8}
              >
                <div
                  className={labelClass}
                  id="time-attendance-leave-request-detail-total-days-label"
                  data-cy="time-attendance-leave-request-detail-total-days-label"
                >
                  Total Days
                </div>
                <div
                  className={classNames(labelClass, undefined, [
                    'font-semibold',
                    'mb-0',
                  ])}
                  id="time-attendance-leave-request-detail-total-days-value"
                  data-cy="time-attendance-leave-request-detail-total-days-value"
                >
                  {leaveData?.items?.days ? leaveData?.items?.days : ''}
                </div>
              </Col>
              {leaveData?.items?.justificationDocument && (
                <Col
                  data-cy="time-attendance-leave-request-detail-attachment-column"
                  span={24}
                >
                  <div
                    className={labelClass}
                    id="time-attendance-leave-request-detail-attachment-label"
                    data-cy="time-attendance-leave-request-detail-attachment-label"
                  >
                    Attachment{' '}
                    <span
                      id="time-attendance-leave-request-detail-attachment-label-asterisk"
                      data-cy="time-attendance-leave-request-detail-attachment-label-asterisk"
                      className="text-error"
                    >
                      *
                    </span>
                  </div>
                  <a
                    href={leaveData?.items?.justificationDocument}
                    target="_blank"
                    className="w-full h-[54px] border border-gray-200 rounded-[10px] flex items-center justify-between px-5 text-gray-900"
                    id="time-attendance-leave-request-detail-attachment-link"
                    data-cy="time-attendance-leave-request-detail-attachment-link"
                  >
                    <div
                      className="text-sm font-medium"
                      id="time-attendance-leave-request-detail-attachment-name"
                      data-cy="time-attendance-leave-request-detail-attachment-name"
                    >
                      {
                        formatLinkToUploadFile(
                          leaveData?.items?.justificationDocument,
                        ).name
                      }
                    </div>

                    <TbFileDownload
                      size={20}
                      data-cy="time-attendance-leave-request-detail-attachment-download-icon"
                    />
                  </a>
                </Col>
              )}
            </Row>
            {leaveData?.items?.status == 'pending' && (
              <div
                id="time-attendance-leave-request-detail-next-approver-container"
                data-cy="time-attendance-leave-request-detail-next-approver-container"
              >
                <Divider
                  data-cy="time-attendance-leave-request-detail-next-approver-divider"
                  className="my-8 h-[5px] bg-gray-200"
                />
                <div
                  id="time-attendance-leave-request-detail-next-approver-content-container"
                  data-cy="time-attendance-leave-request-detail-next-approver-content-container"
                >
                  <div
                    className="flex items-center justify-between mt-5 mb-4"
                    id="time-attendance-leave-request-detail-next-approver-header"
                    data-cy="time-attendance-leave-request-detail-next-approver-header"
                  >
                    <div
                      className="text-sm font-semibold text-gray-900"
                      id="time-attendance-leave-request-detail-next-approver-label"
                      data-cy="time-attendance-leave-request-detail-next-approver-label"
                    >
                      Next Approver
                    </div>
                    <div
                      className="text-sm font-semibold text-gray-900 flex gap-2"
                      id="time-attendance-leave-request-detail-next-approver-level"
                      data-cy="time-attendance-leave-request-detail-next-approver-level"
                    >
                      Level {(approverLog?.items?.length ?? 0) + 1}
                    </div>
                  </div>
                </div>
              </div>
            )}
            <Divider
              data-cy="time-attendance-leave-request-detail-approval-levels-divider"
              className="my-8 h-[5px] bg-gray-200"
            />
            <div
              id="time-attendance-leave-request-detail-approval-levels-container"
              data-cy="time-attendance-leave-request-detail-approval-levels-container"
            >
              <div
                className="text-lg font-semibold text-gray-900"
                id="time-attendance-leave-request-detail-approval-levels-title"
                data-cy="time-attendance-leave-request-detail-approval-levels-title"
              >
                Approval Levels Status
              </div>

              <div
                className="my-2.5"
                id="time-attendance-leave-request-detail-approval-statuses-info"
                data-cy="time-attendance-leave-request-detail-approval-statuses-info"
              >
                <ApprovalStatusesInfo data-cy="time-attendance-leave-request-detail-approval-statuses-info-component" />
              </div>
              {Array.isArray(logData) &&
                logData
                  ?.sort((a, b) => a.stepOrder - b.stepOrder)
                  ?.map((approvalCard: ApprovalRecord, idx: number) => (
                    <ApprovalStatusCard
                      key={idx}
                      data={approvalCard}
                      userName={userData}
                      userImage={userImage}
                      data-cy={`time-attendance-leave-request-detail-approval-status-card-${idx}`}
                    />
                  ))}
            </div>
            <Divider
              data-cy="time-attendance-leave-request-detail-overall-status-divider"
              className="my-8 h-[5px] bg-gray-200"
            />

            <div
              id="time-attendance-leave-request-detail-overall-status-container"
              data-cy="time-attendance-leave-request-detail-overall-status-container"
            >
              <div
                className="flex items-center justify-between mt-5 mb-4"
                id="time-attendance-leave-request-detail-overall-status-header"
                data-cy="time-attendance-leave-request-detail-overall-status-header"
              >
                <div
                  className="text-sm font-semibold text-gray-900"
                  id="time-attendance-leave-request-detail-overall-status-label"
                  data-cy="time-attendance-leave-request-detail-overall-status-label"
                >
                  Over All Status
                </div>
                <div
                  className="text-sm font-semibold text-gray-900 flex gap-2"
                  id="time-attendance-leave-request-detail-overall-status-value"
                  data-cy="time-attendance-leave-request-detail-overall-status-value"
                >
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
                    id="time-attendance-leave-request-detail-overall-status-icon"
                    data-cy="time-attendance-leave-request-detail-overall-status-icon"
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
