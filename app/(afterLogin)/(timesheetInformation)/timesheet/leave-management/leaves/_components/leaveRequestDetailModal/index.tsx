'use client';

import React, { useMemo } from 'react';
import {
  Modal,
  Skeleton,
  Form,
  Input,
  DatePicker,
  Checkbox,
  Select,
  Tooltip,
} from 'antd';
import { useLeaveManagementStore } from '@/store/uistate/features/timesheet/leaveManagement';
import {
  useGetSingleLeaveRequest,
  useGetSingleApprovalLog,
  useGetSingleApproval,
} from '@/store/server/features/timesheet/leaveRequest/queries';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { LeaveRequestStatus } from '@/types/timesheet/settings';
import LeaveRequestStatusTag from '../LeaveRequestStatusTag';
import { formatLinkToUploadFile } from '@/helpers/formatTo';
import dayjs from 'dayjs';
import { SingleLogRequest } from '@/types/timesheet/settings';
import { TbFile } from 'react-icons/tb';
import Image from 'next/image';

/* Figma node 1943-11843: Leave Request Detail Modal – size & colors */
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

const LeaveRequestDetailModal = () => {
  const {
    isShowLeaveRequestManagementSidebar: isShow,
    setIsShowLeaveRequestManagementSidebar: setIsShow,
    leaveRequestId,
    leaveRequestWorkflowId,
    setLeaveRequestId,
    setLeaveRequestWorkflowId,
  } = useLeaveManagementStore();

  const { data: leaveData, isLoading } = useGetSingleLeaveRequest(
    leaveRequestId ?? '',
  );
  const { data: logData, isLoading: isLogLoading } = useGetSingleApprovalLog(
    leaveRequestId ?? '',
    leaveRequestWorkflowId ?? '',
  );
  const { data: approverLog } = useGetSingleApproval(leaveRequestId ?? '');
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
    'No reason provided';

  const onClose = () => {
    setIsShow(false);
    setLeaveRequestId(null);
    setLeaveRequestWorkflowId(null);
  };

  const item = leaveData?.items as Record<string, unknown> | undefined;
  const leaveTypeTitle =
    item?.leaveType &&
    typeof item.leaveType === 'object' &&
    item.leaveType !== null
      ? (item.leaveType as { title?: string }).title
      : '';
  const days = (item?.days as number) ?? 0;
  const status =
    (item?.status as LeaveRequestStatus) ?? LeaveRequestStatus.PENDING;
  const delegatee = item?.delegatee;
  const delegateeLabel =
    typeof delegatee === 'object' && delegatee !== null
      ? `${(delegatee as { firstName?: string }).firstName ?? ''} ${(delegatee as { lastName?: string }).lastName ?? ''}`.trim()
      : typeof delegatee === 'string'
        ? delegatee
        : '';

  const isRejected = status === LeaveRequestStatus.DECLINED;

  return (
    <Modal
      open={isShow && !!leaveRequestId}
      onCancel={onClose}
      footer={null}
      width={MODAL_WIDTH}
      centered
      destroyOnClose
      className="leave-request-detail-modal"
      data-cy="time-attendance-leave-request-detail-modal"
      styles={{
        content: MODAL_STYLES.content,
        body: MODAL_STYLES.body,
      }}
      maskStyle={MODAL_STYLES.mask}
    >
      {!item ? (
        <div
          className="flex justify-center py-10"
          data-cy="time-attendance-leave-request-detail-modal-loading"
        >
          <Skeleton
            active
            data-cy="time-attendance-leave-request-detail-modal-spin"
          />
        </div>
      ) : (
        <Skeleton
          loading={isLoading}
          active
          data-cy="time-attendance-leave-request-detail-modal-content-spin"
        >
          <div
            className="rounded-[12px] bg-white"
            data-cy="time-attendance-leave-request-detail-modal-content"
          >
            {/* Header: Title (line 1), then Days + Status badge (line 2) – per design */}
            <div
              className="mb-6 pl-0 pt-0"
              id="time-attendance-leave-request-detail-modal-header"
              data-cy="time-attendance-leave-request-detail-modal-header"
            >
              <h2
                className="text-xl font-bold text-gray-900 m-0 mb-1.5"
                id="time-attendance-leave-request-detail-modal-title"
                data-cy="time-attendance-leave-request-detail-modal-title"
              >
                {leaveTypeTitle || 'Leave Request'}
              </h2>
              <div
                className="flex items-center gap-4"
                data-cy="time-attendance-leave-request-detail-modal-header-meta"
              >
                <span
                  className="text-sm font-normal text-gray-700"
                  id="time-attendance-leave-request-detail-modal-days"
                  data-cy="time-attendance-leave-request-detail-modal-days"
                >
                  {days} Day{days !== 1 ? 's' : ''}
                </span>
                <LeaveRequestStatusTag
                  status={status}
                  dataCy="time-attendance-leave-request-detail-modal-status-badge"
                />
              </div>
            </div>

            {/* Approval Stages – label left-aligned, timeline centered */}
            <div
              className="mb-6"
              id="time-attendance-leave-request-detail-modal-approval-stages"
              data-cy="time-attendance-leave-request-detail-modal-approval-stages"
            >
              <div
                className="text-sm font-normal text-gray-900 mb-3"
                id="time-attendance-leave-request-detail-modal-approval-stages-label"
                data-cy="time-attendance-leave-request-detail-modal-approval-stages-label"
              >
                Approval Stages
              </div>
              <div
                className="flex items-center justify-center gap-0 min-w-0"
                data-cy="time-attendance-leave-request-detail-modal-approval-timeline"
              >
                {isLogLoading ? (
                  <div
                    className="h-10 w-full flex items-center justify-center"
                    data-cy="time-attendance-leave-request-detail-modal-approval-loading"
                  >
                    <Skeleton.Button active size="small" />
                  </div>
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
                      const displayId =
                        approval.displayUserId ?? approval.userId;
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
                              data-cy={`time-attendance-leave-request-detail-modal-approval-connector-${idx}`}
                            />
                          )}
                          <Tooltip
                            title={userData(displayId) || 'Unknown'}
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
                              id={`time-attendance-leave-request-detail-modal-approval-avatar-${approval.stepOrder}`}
                              data-cy={`time-attendance-leave-request-detail-modal-approval-avatar-${approval.stepOrder}`}
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
                                  data-cy="time-attendance-leave-request-detail-modal-approval-avatar-fallback"
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

            {/* Rejection Reason (only when rejected) */}
            {isRejected && (
              <div
                className="mb-6 rounded-lg p-4 bg-[#FFF0F0] border border-red-200"
                id="time-attendance-leave-request-detail-modal-rejection-reason"
                data-cy="time-attendance-leave-request-detail-modal-rejection-reason"
              >
                <div
                  className="flex gap-3 items-start"
                  data-cy="time-attendance-leave-request-detail-modal-rejection-reason-inner"
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
                        data-cy="time-attendance-leave-request-detail-modal-rejection-reason-avatar"
                      >
                        {userImage(
                          rejectorStep.displayUserId ??
                            rejectorStep.userId ??
                            '',
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
                            data-cy="time-attendance-leave-request-detail-modal-rejection-avatar-fallback"
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
                    data-cy="time-attendance-leave-request-detail-modal-rejection-reason-content"
                  >
                    <div
                      className="font-semibold text-gray-900 mb-1"
                      id="time-attendance-leave-request-detail-modal-rejection-reason-title"
                      data-cy="time-attendance-leave-request-detail-modal-rejection-reason-title"
                    >
                      Rejection Reason
                    </div>
                    <p
                      className="text-sm text-gray-700 m-0"
                      id="time-attendance-leave-request-detail-modal-rejection-reason-text"
                      data-cy="time-attendance-leave-request-detail-modal-rejection-reason-text"
                    >
                      {rejectionComment}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Form fields (read-only) */}
            <Form
              layout="vertical"
              className="leave-request-detail-form"
              data-cy="time-attendance-leave-request-detail-modal-form"
            >
              <Form.Item
                label={
                  <>
                    Leave Type{' '}
                    <span
                      className="text-red-500"
                      data-cy="time-attendance-leave-request-detail-modal-required-indicator"
                    >
                      *
                    </span>
                  </>
                }
                data-cy="time-attendance-leave-request-detail-modal-leave-type"
              >
                <Select
                  value={leaveTypeTitle || undefined}
                  options={
                    leaveTypeTitle
                      ? [{ value: leaveTypeTitle, label: leaveTypeTitle }]
                      : []
                  }
                  disabled
                  suffixIcon={null}
                  className="w-full"
                  id="time-attendance-leave-request-detail-modal-leave-type-select"
                />
              </Form.Item>

              <Form.Item
                label={
                  <>
                    Start Date{' '}
                    <span
                      className="text-red-500"
                      data-cy="time-attendance-leave-request-detail-modal-start-date-required"
                    >
                      *
                    </span>
                  </>
                }
                data-cy="time-attendance-leave-request-detail-modal-start-date"
              >
                <DatePicker
                  value={item?.startAt ? dayjs(item.startAt as string) : null}
                  format={DATE_FORMAT_MODAL}
                  disabled
                  className="w-full"
                  id="time-attendance-leave-request-detail-modal-start-date-picker"
                />
              </Form.Item>

              <Form.Item
                label={
                  <>
                    End Date{' '}
                    <span
                      className="text-red-500"
                      data-cy="time-attendance-leave-request-detail-modal-end-date-required"
                    >
                      *
                    </span>
                  </>
                }
                data-cy="time-attendance-leave-request-detail-modal-end-date"
              >
                <DatePicker
                  value={item?.endAt ? dayjs(item.endAt as string) : null}
                  format={DATE_FORMAT_MODAL}
                  disabled
                  className="w-full"
                  id="time-attendance-leave-request-detail-modal-end-date-picker"
                />
              </Form.Item>

              <Form.Item data-cy="time-attendance-leave-request-detail-modal-half-date">
                <Checkbox
                  checked={!!item?.isHalfday}
                  disabled
                  id="time-attendance-leave-request-detail-modal-half-date-checkbox"
                >
                  Half Date
                </Checkbox>
              </Form.Item>

              <Form.Item
                label={
                  <>
                    Reason{' '}
                    <span
                      className="text-red-500"
                      data-cy="time-attendance-leave-request-detail-modal-reason-required"
                    >
                      *
                    </span>
                  </>
                }
                data-cy="time-attendance-leave-request-detail-modal-reason"
              >
                <Input.TextArea
                  value={(item?.justificationNote as string) ?? ''}
                  disabled
                  rows={3}
                  id="time-attendance-leave-request-detail-modal-reason-input"
                />
              </Form.Item>

              <Form.Item
                label={
                  <>
                    Delegate{' '}
                    <span
                      className="text-red-500"
                      data-cy="time-attendance-leave-request-detail-modal-delegate-required"
                    >
                      *
                    </span>
                  </>
                }
                data-cy="time-attendance-leave-request-detail-modal-delegate"
              >
                <Select
                  value={delegateeLabel || undefined}
                  options={
                    delegateeLabel
                      ? [{ value: delegateeLabel, label: delegateeLabel }]
                      : []
                  }
                  disabled
                  suffixIcon={null}
                  className="w-full"
                  id="time-attendance-leave-request-detail-modal-delegate-select"
                />
              </Form.Item>

              <Form.Item
                label="Attachment (optional)."
                data-cy="time-attendance-leave-request-detail-modal-attachment"
              >
                {(item?.justificationDocument as string) ? (
                  <a
                    href={item.justificationDocument as string}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-gray-900 hover:text-blue-600 border border-gray-200 rounded-lg px-3 py-2 w-full"
                    id="time-attendance-leave-request-detail-modal-attachment-link"
                    data-cy="time-attendance-leave-request-detail-modal-attachment-link"
                  >
                    <TbFile
                      className="shrink-0 text-blue-600"
                      size={20}
                      data-cy="time-attendance-leave-request-detail-modal-attachment-icon"
                    />
                    <span
                      className="text-sm truncate"
                      data-cy="time-attendance-leave-request-detail-modal-attachment-name"
                    >
                      {
                        formatLinkToUploadFile(
                          item.justificationDocument as string,
                        ).name
                      }
                    </span>
                  </a>
                ) : (
                  <span
                    className="text-sm text-gray-400"
                    id="time-attendance-leave-request-detail-modal-attachment-empty"
                    data-cy="time-attendance-leave-request-detail-modal-attachment-empty"
                  >
                    No attachment
                  </span>
                )}
              </Form.Item>
            </Form>
          </div>
        </Skeleton>
      )}
    </Modal>
  );
};

export default LeaveRequestDetailModal;
