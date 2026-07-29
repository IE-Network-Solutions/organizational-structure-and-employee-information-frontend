'use client';

import React, { useMemo } from 'react';
import { Form, Input, DatePicker, Modal, Skeleton, Tooltip } from 'antd';
import { useMyTimesheetStore } from '@/store/uistate/features/timesheet/myTimesheet';
import {
  useGetSingleApproval,
  useGetSingleApprovalLog,
} from '@/store/server/features/timesheet/leaveRequest/queries';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import {
  LeaveRequestStatus,
  SingleLogRequest,
} from '@/types/timesheet/settings';
import LeaveRequestStatusTag from '@/app/(afterLogin)/(timesheetInformation)/timesheet/leave-management/leaves/_components/LeaveRequestStatusTag';
import dayjs from 'dayjs';
import Image from 'next/image';

const MODAL_WIDTH = 480;
const DATE_FORMAT_MODAL = 'DD-MM-YYYY';
const MODAL_STYLES = {
  content: {
    background: '#FFFFFF',
    border: '1px solid #E5E7EB',
    borderRadius: 12,
    boxShadow:
      '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)',
  },
  body: { padding: 24 },
  mask: {},
} as const;

type ApprovalRecord = {
  approverId: string;
  userId: string;
  approvedUserId?: string;
  displayUserId?: string;
  stepOrder: number;
  status: 'Approved' | 'Rejected' | 'Pending';
  approvalComments?: { comment: string }[];
  approvalWorkflowId: string;
  action?: string;
};

function normalizeStatus(raw: unknown): LeaveRequestStatus {
  const s = String(raw ?? '')
    .trim()
    .toLowerCase();
  if (s === LeaveRequestStatus.APPROVED || s === 'approve') {
    return LeaveRequestStatus.APPROVED;
  }
  if (s === LeaveRequestStatus.DECLINED || s === 'rejected' || s === 'reject') {
    return LeaveRequestStatus.DECLINED;
  }
  return LeaveRequestStatus.PENDING;
}

export default function WorkFromHomeRequestDetailModal() {
  const {
    isShowWorkFromHomeRequestDetail: isShow,
    setIsShowWorkFromHomeRequestDetail: setIsShow,
    workFromHomeRequestId,
    workFromHomeRequestWorkflowId,
    workFromHomeRequestDetail,
    setWorkFromHomeRequestId,
    setWorkFromHomeRequestWorkflowId,
    setWorkFromHomeRequestDetail,
  } = useMyTimesheetStore();

  const { data: logData, isLoading: isLogLoading } = useGetSingleApprovalLog(
    workFromHomeRequestId ?? '',
    workFromHomeRequestWorkflowId ?? '',
  );
  const { data: approverLog } = useGetSingleApproval(
    workFromHomeRequestId ?? '',
  );
  const { data: usersData } = useGetAllUsers();

  const userData = (id: string) => {
    const user = usersData?.items?.find(
      (item: { id: string }) => item.id === id,
    );
    if (!user) return '';
    return `${user?.firstName ?? ''} ${user?.middleName ?? ''} ${user?.lastName ?? ''}`.trim();
  };

  const userImage = (id: string) => {
    const user = usersData?.items?.find(
      (item: { id: string }) => item.id === id,
    );
    return user?.profileImage;
  };

  const enrichedApprovalData = useMemo((): ApprovalRecord[] => {
    if (!logData || !Array.isArray(logData)) return [];
    const historicalLogs = Array.isArray(approverLog)
      ? approverLog
      : (approverLog?.items ?? []);

    return logData.map((approval: ApprovalRecord) => {
      const historicalRecord = historicalLogs.find(
        (log: SingleLogRequest) => log.stepOrder === approval.stepOrder,
      );
      const hasActionTaken =
        historicalRecord &&
        (historicalRecord.action === 'Approved' ||
          historicalRecord.action === 'Rejected');

      return {
        ...approval,
        approvedUserId: historicalRecord?.approvedUserId,
        status: hasActionTaken
          ? historicalRecord!.action === 'Approved'
            ? 'Approved'
            : 'Rejected'
          : approval.status,
        displayUserId: hasActionTaken
          ? historicalRecord?.approvedUserId
          : approval.userId,
      };
    });
  }, [logData, approverLog]);

  const rejectedStep = useMemo(
    () =>
      enrichedApprovalData.find(
        (a) => a.status === 'Rejected' && a.approvalComments?.length,
      ),
    [enrichedApprovalData],
  );

  const rejectorStep = useMemo(
    () => enrichedApprovalData.find((a) => a.status === 'Rejected'),
    [enrichedApprovalData],
  );

  const rejectionComment =
    rejectedStep?.approvalComments?.[0]?.comment ??
    rejectorStep?.approvalComments?.[0]?.comment ??
    (workFromHomeRequestDetail?.rejectedReason as string) ??
    'No reason provided';

  const onClose = () => {
    setIsShow(false);
    setWorkFromHomeRequestId(null);
    setWorkFromHomeRequestWorkflowId(null);
    setWorkFromHomeRequestDetail(null);
  };

  const item = workFromHomeRequestDetail;
  const days = (item?.days as number | string) ?? 0;
  const status = normalizeStatus(item?.status);
  const isRejected = status === LeaveRequestStatus.DECLINED;
  const reason =
    (item?.reason as string) ?? (item?.justificationNote as string) ?? '';

  return (
    <Modal
      open={isShow && !!workFromHomeRequestId}
      onCancel={onClose}
      footer={null}
      width={MODAL_WIDTH}
      centered
      destroyOnClose
      className="work-from-home-request-detail-modal"
      data-cy="time-attendance-wfh-request-detail-modal"
      styles={{
        content: MODAL_STYLES.content,
        body: MODAL_STYLES.body,
      }}
      maskStyle={MODAL_STYLES.mask}
    >
      {!item ? (
        <div
          className="flex justify-center py-10"
          data-cy="time-attendance-wfh-request-detail-modal-loading"
        >
          <Skeleton active />
        </div>
      ) : (
        <div
          className="rounded-[12px] bg-white"
          data-cy="time-attendance-wfh-request-detail-modal-content"
        >
          <div
            className="mb-6 pl-0 pt-0"
            data-cy="time-attendance-wfh-request-detail-modal-header"
          >
            <h2
              className="text-xl font-bold text-gray-900 m-0 mb-1.5"
              data-cy="time-attendance-wfh-request-detail-modal-title"
            >
              Work From Home
            </h2>
            <div
              className="flex items-center gap-4"
              data-cy="time-attendance-wfh-request-detail-modal-header-meta"
            >
              <span
                className="text-sm font-normal text-gray-700"
                data-cy="time-attendance-wfh-request-detail-modal-days"
              >
                {days} Day{Number(days) !== 1 ? 's' : ''}
              </span>
              <LeaveRequestStatusTag
                status={status}
                dataCy="time-attendance-wfh-request-detail-modal-status-badge"
              />
            </div>
          </div>

          <div
            className="mb-6"
            data-cy="time-attendance-wfh-request-detail-modal-approval-stages"
          >
            <div
              className="text-sm font-normal text-gray-900 mb-3"
              data-cy="time-attendance-wfh-request-detail-modal-approval-stages-label"
            >
              Approval Stages
            </div>
            <div
              className="flex items-center justify-center gap-0 min-w-0"
              data-cy="time-attendance-wfh-request-detail-modal-approval-timeline"
            >
              {isLogLoading ? (
                <div
                  className="h-10 w-full flex items-center justify-center"
                  data-cy="time-attendance-wfh-request-detail-modal-approval-loading"
                >
                  <Skeleton.Button active size="small" />
                </div>
              ) : enrichedApprovalData.length === 0 ? (
                <span
                  className="text-sm text-gray-500"
                  data-cy="time-attendance-wfh-request-detail-modal-no-approval-workflow"
                >
                  No approval workflow
                </span>
              ) : (
                (() => {
                  const sorted = [...enrichedApprovalData].sort(
                    (a, b) => a.stepOrder - b.stepOrder,
                  );
                  const rejectorIdx = sorted.findIndex(
                    (a) => a.status === 'Rejected',
                  );
                  const primaryColor = '#3636F0';
                  const notReachedColor = '#E6F4FF';
                  const firstPendingIdx = sorted.findIndex(
                    (a) => a.status === 'Pending',
                  );
                  return sorted.map((approval, idx) => {
                    const displayId = approval.displayUserId ?? approval.userId;
                    const isRejectedStep = approval.status === 'Rejected';
                    const isPendingStep = approval.status === 'Pending';
                    const isCurrentStage =
                      isRejectedStep ||
                      (rejectorIdx < 0 &&
                        isPendingStep &&
                        idx === firstPendingIdx);
                    const isPastRejector =
                      rejectorIdx >= 0 && idx > rejectorIdx;
                    const isConnectorNotReached =
                      isPendingStep || isRejectedStep;
                    const avatarSize = isCurrentStage
                      ? 'w-12 h-12'
                      : isPastRejector
                        ? 'w-8 h-8'
                        : 'w-10 h-10';
                    const avatarBorder = isRejectedStep
                      ? 'border-red-500'
                      : 'border-[#3636F0]';
                    const avatarPx = isCurrentStage
                      ? 48
                      : isPastRejector
                        ? 32
                        : 40;
                    return (
                      <React.Fragment key={approval.stepOrder}>
                        {idx > 0 && (
                          <div
                            className="flex-1 min-w-[16px] h-0.5"
                            style={{
                              backgroundColor: isConnectorNotReached
                                ? notReachedColor
                                : primaryColor,
                            }}
                            data-cy={`time-attendance-wfh-request-detail-modal-approval-connector-${idx}`}
                          />
                        )}
                        <Tooltip
                          title={`Level ${approval.stepOrder}: ${userData(displayId) || 'Unknown'}`}
                          placement="bottom"
                          overlayInnerStyle={{
                            background: '#000',
                            color: '#fff',
                            borderRadius: 8,
                          }}
                        >
                          <div
                            className={`relative shrink-0 ${avatarSize} rounded-full overflow-hidden border-2 ${avatarBorder} transition-transform ${
                              isCurrentStage ? 'scale-110' : ''
                            }`}
                            data-cy={`time-attendance-wfh-request-detail-modal-approval-avatar-${approval.stepOrder}`}
                          >
                            {displayId && userImage(displayId) ? (
                              <Image unoptimized
                                src={userImage(displayId) ?? ''}
                                alt={userData(displayId)}
                                width={avatarPx}
                                height={avatarPx}
                                className="object-cover w-full h-full"
                              />
                            ) : (
                              <div
                                className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs font-medium"
                                data-cy="time-attendance-wfh-request-detail-modal-approval-avatar-fallback"
                              >
                                {userData(displayId)
                                  ?.split(' ')
                                  .map((n) => n[0])
                                  .join('')
                                  .slice(0, 2) ?? '?'}
                              </div>
                            )}
                          </div>
                        </Tooltip>
                      </React.Fragment>
                    );
                  });
                })()
              )}
            </div>
          </div>

          {isRejected && (
            <div
              className="mb-6 rounded-lg p-4 bg-[#FFF0F0] border border-red-200"
              data-cy="time-attendance-wfh-request-detail-modal-rejection-reason"
            >
              <div
                className="flex gap-3 items-start"
                data-cy="time-attendance-wfh-request-detail-modal-rejection-reason-inner"
              >
                {(rejectorStep?.displayUserId ?? rejectorStep?.userId) && (
                  <Tooltip
                    title={userData(
                      rejectorStep.displayUserId ?? rejectorStep.userId ?? '',
                    )}
                    placement="bottom"
                    overlayInnerStyle={{
                      background: '#000',
                      color: '#fff',
                      borderRadius: 8,
                    }}
                  >
                    <div
                      className="shrink-0 w-10 h-10 rounded-full overflow-hidden border-2 border-red-500"
                      data-cy="time-attendance-wfh-request-detail-modal-rejection-reason-avatar"
                    >
                      {userImage(
                        rejectorStep.displayUserId ?? rejectorStep.userId ?? '',
                      ) ? (
                        <Image unoptimized
                          src={
                            userImage(
                              rejectorStep.displayUserId ??
                                rejectorStep.userId ??
                                '',
                            ) ?? ''
                          }
                          alt=""
                          width={40}
                          height={40}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div
                          className="w-full h-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-500"
                          data-cy="time-attendance-wfh-request-detail-modal-rejection-avatar-fallback"
                        >
                          {userData(
                            rejectorStep.displayUserId ??
                              rejectorStep.userId ??
                              '',
                          )
                            ?.split(' ')
                            .map((n) => n[0])
                            .join('')
                            .slice(0, 2) ?? '?'}
                        </div>
                      )}
                    </div>
                  </Tooltip>
                )}
                <div
                  className="min-w-0 flex-1"
                  data-cy="time-attendance-wfh-request-detail-modal-rejection-reason-content"
                >
                  <div
                    className="font-semibold text-gray-900 mb-1"
                    data-cy="time-attendance-wfh-request-detail-modal-rejection-reason-title"
                  >
                    Rejection Reason
                  </div>
                  <p
                    className="text-sm text-gray-700 m-0"
                    data-cy="time-attendance-wfh-request-detail-modal-rejection-reason-text"
                  >
                    {rejectionComment}
                  </p>
                </div>
              </div>
            </div>
          )}

          <Form
            layout="vertical"
            className="work-from-home-request-detail-form"
            data-cy="time-attendance-wfh-request-detail-modal-form"
          >
            <Form.Item
              label={
                <>
                  Start Date{' '}
                  <span
                    className="text-red-500"
                    data-cy="time-attendance-wfh-request-detail-modal-start-date-required"
                  >
                    *
                  </span>
                </>
              }
              data-cy="time-attendance-wfh-request-detail-modal-start-date"
            >
              <DatePicker
                value={item?.startAt ? dayjs(item.startAt as string) : null}
                format={DATE_FORMAT_MODAL}
                disabled
                className="w-full"
              />
            </Form.Item>

            <Form.Item
              label={
                <>
                  End Date{' '}
                  <span
                    className="text-red-500"
                    data-cy="time-attendance-wfh-request-detail-modal-end-date-required"
                  >
                    *
                  </span>
                </>
              }
              data-cy="time-attendance-wfh-request-detail-modal-end-date"
            >
              <DatePicker
                value={item?.endAt ? dayjs(item.endAt as string) : null}
                format={DATE_FORMAT_MODAL}
                disabled
                className="w-full"
              />
            </Form.Item>

            <Form.Item
              label={
                <>
                  Reason{' '}
                  <span
                    className="text-red-500"
                    data-cy="time-attendance-wfh-request-detail-modal-reason-required"
                  >
                    *
                  </span>
                </>
              }
              data-cy="time-attendance-wfh-request-detail-modal-reason"
            >
              <Input.TextArea value={reason} disabled rows={3} />
            </Form.Item>
          </Form>
        </div>
      )}
    </Modal>
  );
}
