// components/ApprovalRequestCard.tsx
import { FC } from 'react';
import { Button, Input, Popconfirm } from 'antd';
import { useApprovalStore } from '@/store/uistate/features/approval';
import {
  useSetApproveLeaveRequest,
  useSetFinalApproveBranchRequest,
  useSetFinalApproveLeaveRequest,
  useSetAllLeaveRequestNotification,
} from '@/store/server/features/timesheet/leaveRequest/mutation';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useGetEmployee } from '@/store/server/features/employees/employeeDetail/queries';
import Image from 'next/image';
import Avatar from '@/public/gender_neutral_avatar.jpg';
import dayjs from 'dayjs';
import { useIsMobile } from '@/hooks/useIsMobile';
import { LuFileDown } from 'react-icons/lu';
import { Check, X } from 'lucide-react';
import { MdOutlineFileDownload } from 'react-icons/md';

interface ApprovalRequestCardProps {
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

  const cancel: any = () => { };
  const { isMobile, isTablet } = useIsMobile();



  const leaveDurationDays =
    requestType === 'Leave' && startAt && endAt
      ? days ??
      dayjs(endAt).endOf('day').diff(dayjs(startAt).startOf('day'), 'day') +
      1
      : undefined;

  const formattedDateRange =
    requestType === 'Leave'
      ? isMobile || isTablet
        ? `${dayjs(startAt).format('MMM DD')} - ${dayjs(endAt).format('MMM DD')}${leaveDurationDays ? ` (${leaveDurationDays} days)` : ''
        }`
        : `${dayjs(startAt).format('MMM DD')} - ${dayjs(
          endAt,
        ).format('MMM DD, YYYY')}${leaveDurationDays ? ` (${leaveDurationDays} days)` : ''
        }`
      : '';

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
          <Image
            src={
              employeeData?.profileImage &&
                typeof employeeData?.profileImage === 'string'
                ? (() => {
                  try {
                    const parsed = JSON.parse(employeeData.profileImage);
                    return parsed.url && parsed.url.startsWith('http')
                      ? parsed.url
                      : Avatar;
                  } catch {
                    return employeeData.profileImage.startsWith('http')
                      ? employeeData.profileImage
                      : Avatar;
                  }
                })()
                : Avatar
            }
            alt="Description of image"
            layout="fill"
            className="object-cover"
          />
        </div>
        <div className="flex flex-col gap-1" data-cy="approval-status-card-info">
          <div className="flex items-center justify-between gap-2">
            <p
              className="font-semibold text-xs text-gray-900 truncate"
              data-cy="approval-status-card-employee-name"
            >
              {employeeData?.firstName} {employeeData?.middleName}
            </p>
            <div className='flex gap-2 '>
              <span
                className='truncate inline-flex items-center px-2.5 py-0.5 rounded-sm text-[10px] font-medium border bg-gray-50 text-gray-700 border-gray-200'
                data-cy="approval-status-card-leave-type"
              >
                {leaveType}
              </span>
              <div className="flex items-center gap-2">
                {fileAttachment && (
                  <a
                    href={fileAttachment}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center w-6 h-6 rounded-sm bg-white border border-gray-100 !text-black"
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
                className="font-normal text-gray-500 text-[10px]"
                data-cy="approval-status-card-branch-transfer-dates"
              >
                {startAt ? dayjs(startAt).format('MMM DD') : '-'} to {endAt}
              </p>
            </>
          ) : requestType === 'Leave' ? (
            <div className="flex items-center justify-between gap-4">
              <p
                className="font-normal text-gray-500 text-[10px]"
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
          title="Approve Request"
          description="Are you sure to approve this leave request?"
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
          okText="Approve"
          cancelText="Cancel"
        >
          <button
            type="button"
            className="inline-flex items-center justify-center w-6 h-6 rounded-md border border-[#52C41A] text-[#52C41A]"
            disabled={
              isLoadingEditApprover ||
              isLoadingFinalLeaveApprover ||
              isLoadingFinalBranchApprover
            }
          >
            <svg xmlns="http://www.w3.org/2000/svg" height="12" viewBox="0 -960 960 960" width="12px" fill="#52C41A"><path d="m424-296 282-282-56-56-226 226-114-114-56 56 170 170Zm56 216q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" /></svg>
          </button>
        </Popconfirm>
        <Popconfirm
          title="Reject Request"
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
          okText="Reject"
          cancelText="Cancel"
          okButtonProps={{ disabled: !rejectComment }}
        >
          <button
            type="button"
            className="inline-flex items-center justify-center w-6 h-6 rounded-md border border-[#FF4D4F] text-[#FF4D4F]"
            disabled={
              isLoadingEditApprover ||
              isLoadingFinalLeaveApprover ||
              isLoadingFinalBranchApprover
            }
          >
            <svg xmlns="http://www.w3.org/2000/svg" height="12" viewBox="0 -960 960 960" width="12px" fill="#F5222D"><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" /></svg>          </button>
        </Popconfirm>

      </div>
    </div>
  );
};

export default ApprovalRequestCard;
