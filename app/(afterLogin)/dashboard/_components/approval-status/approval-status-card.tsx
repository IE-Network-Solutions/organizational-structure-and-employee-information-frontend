// components/ApprovalRequestCard.tsx
import { FC } from 'react';
import { Button, Input, Popconfirm } from 'antd';
import { useApprovalStore } from '@/store/uistate/features/approval';
import {
  useSetApproveLeaveRequest,
  useSetFinalApproveBranchRequest,
  useSetFinalApproveLeaveRequest,
} from '@/store/server/features/timesheet/leaveRequest/mutation';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useGetEmployee } from '@/store/server/features/employees/employeeDetail/queries';
import Image from 'next/image';
import Avatar from '@/public/gender_neutral_avatar.jpg';
import dayjs from 'dayjs';
import { useIsMobile } from '@/hooks/useIsMobile';
import { LuFileDown } from 'react-icons/lu';

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
        }
      },
    });
  };

  const cancel: any = () => {};
  const { isMobile, isTablet } = useIsMobile();

  return (
    <div className="flex items-center justify-between bg-white p-2 rounded-lg  overflow-y-auto scrollbar-none mb-3">
      <div className="flex items-center space-x-3">
        <div className="relative w-7 h-7 rounded-full overflow-hidden">
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
        <div className="flex flex-col">
          <p className="font-semibold text-xs">
            {leaveType?.length >= 15
              ? leaveType?.slice(0, 15) + '...'
              : leaveType}
          </p>
          <p className="font-normal text-gray-500 text-[10px]">
            {employeeData?.firstName} {employeeData?.middleName}
          </p>
          {requestType === 'BranchTransfer' ? (
            <>
              <p className="font-normal text-gray-500 text-[10px]">
                {startAt || '-'} to {endAt || '-'}
              </p>
            </>
          ) : requestType === 'Leave' ? (
            <div className="flex justify-between items-center gap-5 font-normal text-gray-500 text-[10px]">
              <p className="">
                {isMobile || isTablet
                  ? `${dayjs(startAt).format('MMM DD') || '-'} to ${dayjs(endAt).format('MMM DD') || '-'}`
                  : `${dayjs(startAt).format('MMM DD, YYYY') || '-'} to ${dayjs(endAt).format('MMM DD, YYYY') || '-'}`}
              </p>

              {fileAttachment && (
                <a href={fileAttachment} target="_blank">
                  <LuFileDown className="text-[#2F78EE] text-base " />
                </a>
              )}
            </div>
          ) : (
            ''
          )}
          <p className="text-[10px] text-gray-500">{name}</p>
        </div>
      </div>
      <div className="space-x-1 space-y-1 ">
        <Popconfirm
          title="Reject Request"
          description={
            <>
              <p>Are you sure you want to reject this leave request?</p>
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
          <Button
            disabled={
              isLoadingEditApprover ||
              isLoadingFinalLeaveApprover ||
              isLoadingFinalBranchApprover
            }
          >
            Reject
          </Button>
        </Popconfirm>
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
          <Button
            type="primary"
            disabled={
              isLoadingEditApprover ||
              isLoadingFinalLeaveApprover ||
              isLoadingFinalBranchApprover
            }
          >
            Approve
          </Button>
        </Popconfirm>
      </div>
    </div>
  );
};

export default ApprovalRequestCard;
