// components/ApprovalRequestCard.tsx
import { FC } from 'react';
import { Avatar, Input, Popconfirm, Skeleton } from 'antd';
import {
  CheckCircleFilled,
  CloseCircleFilled,
  UserOutlined,
} from '@ant-design/icons';
import { useApprovalStore } from '@/store/uistate/features/approval';
import {
  useSetApproveLeaveRequest,
  useSetFinalApproveBranchRequest,
  useSetFinalApproveLeaveRequest,
  useSetAllLeaveRequestNotification,
} from '@/store/server/features/timesheet/leaveRequest/mutation';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useGetEmployee } from '@/store/server/features/employees/employeeDetail/queries';
import dayjs from 'dayjs';
import { useIsMobile } from '@/hooks/useIsMobile';
import { MdOutlineClose, MdOutlineFileDownload } from 'react-icons/md';
import { LuCircleCheck } from 'react-icons/lu';

interface ApprovalRequestCardProps {
  isLoading: boolean;
  name: string;
  days?: number;
  startAt: string;
  endAt: string;
  isHalfDay?: string;
  leaveType: string;
  approvalWorkflowId: string;
  nextApprover: string;
  id: string;
  approveRequesterId: string;
  requestType: string;
  fileAttachment?: string;
}

const ApprovalRequestCard: FC<ApprovalRequestCardProps> = ({
  isLoading,
  name,
  days,
  startAt,
  endAt,
  leaveType,
  approvalWorkflowId,
  nextApprover,
  approveRequesterId,
  id,
  requestType,
  fileAttachment,
}) => {
  const { rejectComment, setRejectComment } = useApprovalStore();
  const { mutate: editApprover, isLoading: isLoadingEditApprover } =
    useSetApproveLeaveRequest();
  const { mutate: finalLeaveApprover, isLoading: isLoadingFinalLeaveApprover } =
    useSetFinalApproveLeaveRequest();
  const {
    mutate: finalBranchApprover,
    isLoading: isLoadingFinalBranchApprover,
  } = useSetFinalApproveBranchRequest();
  const { mutate: sendNotification } = useSetAllLeaveRequestNotification();
  const tenantId = useAuthenticationStore.getState().tenantId;
  const { userId } = useAuthenticationStore();
  const userRollId = useAuthenticationStore.getState().userData.roleId;
  const { data: employeeData } = useGetEmployee(approveRequesterId);
  const finalLeaveApproval: any = (e: {
    leaveRequestId: string;
    status: string;
  }) => {
    finalLeaveApprover(e);
  };
  const finalBranchApproval: any = (e: {
    requestId: string;
    status: string;
  }) => {
    finalBranchApprover(e);
  };
  const reject: any = (e: {
    approvalWorkflowId: any;
    stepOrder: any;
    requestId: string;
    approvedUserId: string;
    approverRoleId: any;
    action: string;
    tenantId: string;
    comment: { comment: string; commentedBy: string; tenantId: string };
  }) => {
    editApprover(e, {
      onSuccess: () => {
        setRejectComment('');
        if (requestType == 'Leave') {
          finalLeaveApproval({
            leaveRequestId: e.requestId,
            status: 'declined',
          });
        } else if (requestType == 'BranchTransfer') {
          finalBranchApproval({
            requestId: e.requestId,
            status: 'declined',
          });
        }
      },
    });
  };
  const confirm: any = (e: {
    approvalWorkflowId: any;
    stepOrder: any;
    requestId: string;
    approvedUserId: string;
    approverRoleId: any;
    action: string;
    tenantId: string;
  }) => {
    editApprover(e, {
      onSuccess: (data) => {
        if (data?.last == true) {
          if (requestType == 'Leave') {
            finalLeaveApproval({
              leaveRequestId: e.requestId,
              status: 'approved',
            });
          } else if (requestType == 'BranchTransfer') {
            finalLeaveApproval({
              leaveRequestId: e.requestId,
              status: 'approved',
            });
          }
        } else {
          // If not the final approval, send notification to next approver ONLY for Leave requests
          if (requestType == 'Leave') {
            sendNotification({
              leaveRequestIds: [e.requestId],
            });
          }
        }
      },
    });
  };

  const cancel: any = () => {};
  const { isMobile, isTablet } = useIsMobile();

  const leaveDurationDays =
    requestType === 'Leave' && startAt && endAt
      ? (days ??
        dayjs(endAt).endOf('day').diff(dayjs(startAt).startOf('day'), 'day') +
          1)
      : undefined;

  const formattedDateRange =
    requestType === 'Leave'
      ? isMobile || isTablet
        ? `${dayjs(startAt).format('MMM DD')} - ${dayjs(endAt).format('MMM DD')}${
            leaveDurationDays ? ` (${leaveDurationDays} days)` : ''
          }`
        : `${dayjs(startAt).format('MMM DD')} - ${dayjs(endAt).format(
            'MMM DD, YYYY',
          )}${leaveDurationDays ? ` (${leaveDurationDays} days)` : ''}`
      : '';

  if (isLoading) {
    return (
      <div
        className="flex h-[60px] items-center justify-between bg-white py-1 px-3 rounded-lg border border-gray-200 overflow-y-auto scrollbar-none mb-3"
        data-cy="approval-status-card-skeleton"
      >
        <div
          className="flex items-center space-x-3"
          data-cy="approval-status-card-skeleton-content"
        >
          <div
            className="relative w-[36px] h-[36px] rounded-full overflow-hidden"
            data-cy="approval-status-card-skeleton-avatar"
          >
            <Skeleton.Avatar active size={36} />
          </div>

          <div
            className="flex flex-col gap-1 flex-1"
            data-cy="approval-status-card-skeleton-info"
          >
            <div
              className="flex items-center justify-between gap-2"
              data-cy="approval-status-card-skeleton-top-row"
            >
              <div
                className="flex flex-col gap-1 flex-1"
                data-cy="approval-status-card-skeleton-top-row-left"
              >
                <Skeleton.Input
                  active
                  size="small"
                  className="!h-4 !w-28 !min-w-0 hidden md:block"
                />
              </div>
              <Skeleton.Input
                active
                size="small"
                className="!h-5 !w-24 !min-w-0 !rounded-[4px]"
              />
            </div>

            <Skeleton.Input
              active
              size="small"
              className="!h-3 !w-40 !min-w-0"
            />
            <Skeleton.Input
              active
              size="small"
              className="!h-3 !w-28 !min-w-0"
            />
          </div>
        </div>

        <div
          className="flex items-center gap-2"
          data-cy="approval-status-card-skeleton-actions"
        >
          <Skeleton.Button
            active
            shape="circle"
            className="!w-6 !h-6 !min-w-6 !min-h-6 !rounded-[4px]"
          />
          <Skeleton.Button
            active
            shape="circle"
            className="!w-6 !h-6 !min-w-6 !min-h-6 !rounded-[4px]"
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex h-[60px] items-center justify-between bg-white py-1 px-3 rounded-lg border border-gray-200 overflow-y-auto scrollbar-none mb-3"
      data-cy="approval-status-card"
    >
      <div
        className="flex items-center space-x-3"
        data-cy="approval-status-card-content"
      >
        <div
          className="relative w-[36px] h-[36px] rounded-full overflow-hidden"
          data-cy="approval-status-card-avatar"
        >
          <Avatar
            className="w-[36px] h-[36px]"
            src={
              employeeData?.profileImage &&
              typeof employeeData?.profileImage === 'string'
                ? (() => {
                    try {
                      const parsed = JSON.parse(employeeData.profileImage);
                      return parsed.url && parsed.url.startsWith('http')
                        ? parsed.url
                        : undefined;
                    } catch {
                      return employeeData.profileImage.startsWith('http')
                        ? employeeData.profileImage
                        : undefined;
                    }
                  })()
                : undefined
            }
            icon={<UserOutlined />}
            alt="Description of image"
          />
        </div>
        <div
          className="flex flex-col gap-1"
          data-cy="approval-status-card-info"
        >
          <div
            className="flex items-center justify-between gap-2"
            data-cy="approval-status-card-top-row"
          >
            <div
              className="flex items-center gap-1"
              data-cy="approval-status-card-employee-names"
            >
              <p
                className="font-normal text-sm text-black truncate"
                data-cy="approval-status-card-employee-name"
              >
                {employeeData?.firstName || '-'}
              </p>
              <p
                className="font-normal text-sm text-black/90 truncate md:block hidden"
                data-cy="approval-status-card-employee-name"
              >
                {employeeData?.middleName || '-'}
              </p>
            </div>

            <div className="flex gap-2 " data-cy="approval-status-card-meta">
              <span
                className="truncate inline-flex items-center px-2 py-[1px] rounded-[4px] text-[10px] font-medium border bg-gray-50 text-gray-700 border-gray-200"
                data-cy="approval-status-card-leave-type"
              >
                {leaveType}
              </span>
              <div
                className="flex items-center gap-2"
                data-cy="approval-status-card-attachments"
              >
                {fileAttachment && (
                  <a
                    href={fileAttachment}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center w-6 h-6 rounded-[4px] bg-white border border-gray-300 !text-black"
                    data-cy="approval-status-card-file-attachment"
                  >
                    <MdOutlineFileDownload className="text-xs" />
                  </a>
                )}
              </div>
            </div>
          </div>
          {requestType === 'BranchTransfer' ? (
            <>
              <p
                className="font-normal text-gray-500 text-xs"
                data-cy="approval-status-card-branch-transfer-dates"
              >
                {startAt ? dayjs(startAt).format('MMM DD') : '-'} to {endAt}
              </p>
            </>
          ) : requestType === 'Leave' ? (
            <div
              className="flex items-center justify-between gap-4"
              data-cy="approval-status-card-date-row"
            >
              <p
                className="font-normal text-gray-500 text-sm"
                data-cy="approval-status-card-date-range"
              >
                {formattedDateRange}
              </p>
            </div>
          ) : (
            ''
          )}
          <p
            className="text-[10px] text-gray-400"
            data-cy="approval-status-card-approver-name"
          >
            {name}
          </p>
        </div>
      </div>
      <div
        className="flex items-center gap-2"
        data-cy="approval-status-card-actions"
      >
        <Popconfirm
          icon={null}
          description="Are you sure you want to approve this leave request ?"
          placement="bottomRight"
          title={
            <span
              className="flex items-center gap-1"
              data-cy="approval-status-card-approve-popconfirm-title"
            >
              <CheckCircleFilled className="text-[#52C41A]" />
              <span data-cy="approval-status-card-approve-popconfirm-title-text">
                Approve
              </span>
            </span>
          }
          onConfirm={() => {
            confirm({
              approvalWorkflowId: approvalWorkflowId,
              stepOrder: nextApprover,
              requestId: id,
              approvedUserId: userId,
              approverRoleId: userRollId,
              action: 'Approved',
              tenantId: tenantId,
            });
          }}
          onCancel={cancel}
          okText="OK"
          cancelText="Cancel"
        >
          <button
            type="button"
            className="inline-flex items-center justify-center w-6 h-6 rounded-[4px] border border-[#52C41A] text-[#52C41A]"
            disabled={
              isLoading ||
              isLoadingEditApprover ||
              isLoadingFinalLeaveApprover ||
              isLoadingFinalBranchApprover
            }
            data-cy={`approval-status-card-approve-btn-${id}`}
          >
            <LuCircleCheck size={14} className="text-[#52C41A]" />
          </button>
        </Popconfirm>
        <Popconfirm
          icon={null}
          title={
            <span
              className="flex items-center gap-1"
              data-cy="approval-status-card-decline-popconfirm-title"
            >
              <CloseCircleFilled className="text-[#FF4D4F]" />
              <span data-cy="approval-status-card-decline-popconfirm-title-text">
                Decline
              </span>
            </span>
          }
          placement="bottomRight"
          description={
            <>
              <p data-cy="approval-status-card-reject-confirmation">
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
              approvalWorkflowId: approvalWorkflowId,
              stepOrder: nextApprover,
              requestId: id,
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
          okText="OK"
          cancelText="Cancel"
          okButtonProps={{ disabled: isLoading || !rejectComment }}
        >
          <button
            type="button"
            className="inline-flex items-center justify-center w-6 h-6 rounded-[4px] border border-[#FF4D4F] text-[#FF4D4F]"
            disabled={
              isLoading ||
              isLoadingEditApprover ||
              isLoadingFinalLeaveApprover ||
              isLoadingFinalBranchApprover
            }
            data-cy={`approval-status-card-reject-btn-${id}`}
          >
            <MdOutlineClose size={14} className="text-[#FF4D4F]" />
          </button>
        </Popconfirm>
      </div>
    </div>
  );
};

export default ApprovalRequestCard;
