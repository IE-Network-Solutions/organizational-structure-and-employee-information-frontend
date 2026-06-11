'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Button, Form, Modal, Select, Skeleton, Tooltip } from 'antd';
import Image from 'next/image';
import { useCandidateState } from '@/store/uistate/features/recruitment/candidate';
import {
  useGetCandidateById,
  useGetStages,
} from '@/store/server/features/recruitment/candidate/queries';
import {
  useCandidateApprovalLogs,
  useCandidateApprovalWorkflow,
} from '@/store/server/features/recruitment/candidateApproval/queries';
import {
  useApproveCandidateApproval,
  useBulkApproveCandidateApproval,
  useBulkRejectCandidateApproval,
  useCreateCandidateApprovalRequests,
  useRejectCandidateApproval,
} from '@/store/server/features/recruitment/candidateApproval/mutation';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { SingleLogRequest } from '@/types/timesheet/settings';
import NotificationMessage from '@/components/common/notification/notificationMessage';

type ApprovalRecord = {
  approverId: string;
  userId: string;
  approvedUserId?: string;
  displayUserId?: string;
  stepOrder: number;
  status: 'Approved' | 'Rejected' | 'Pending';
  approvalWorkflowId: string;
  action?: string;
};

const StageApprovalModal = () => {
  const {
    isShowStageApprovalModal: isShow,
    setIsShowStageApprovalModal: setIsShow,
    stageApprovalCandidateId,
    setStageApprovalCandidateId,
    stageApprovalWorkflowId,
    setStageApprovalWorkflowId,
    stageApprovalCandidate,
    setStageApprovalCandidate,
    stageApprovalRows,
    setStageApprovalRows,
    setSelectedCandidate,
    setSelectedRowKeys,
  } = useCandidateState();

  const [moveToStageId, setMoveToStageId] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: candidateData, isLoading: isCandidateLoading } =
    useGetCandidateById(stageApprovalCandidateId ?? '');
  const { data: statusStages } = useGetStages();
  const activeRows = stageApprovalRows?.length
    ? stageApprovalRows
    : stageApprovalCandidate
      ? [stageApprovalCandidate]
      : [];
  const primaryApprovalRow = activeRows[0];
  const primaryRequestId = primaryApprovalRow?.requestId ?? null;
  const { data: approverLog, isLoading: isLogLoading } =
    useCandidateApprovalLogs(primaryRequestId);
  const { data: workflowData } = useCandidateApprovalWorkflow(
    stageApprovalWorkflowId,
  );
  const { data: usersData } = useGetAllUsers();
  const { mutateAsync: createApprovalRequests } =
    useCreateCandidateApprovalRequests();
  const { mutateAsync: approveCandidateApproval } =
    useApproveCandidateApproval();
  const { mutateAsync: rejectCandidateApproval } = useRejectCandidateApproval();
  const { mutateAsync: bulkApproveCandidateApproval } =
    useBulkApproveCandidateApproval();
  const { mutateAsync: bulkRejectCandidateApproval } =
    useBulkRejectCandidateApproval();

  const candidate = candidateData ?? stageApprovalCandidate;
  const jobCandidate = candidate?.jobCandidate?.[0];
  const currentStageId =
    primaryApprovalRow?.currentStageId ?? jobCandidate?.applicantStatusStageId;
  const currentStageTitle =
    primaryApprovalRow?.currentStageTitle ??
    jobCandidate?.applicantStatusStage?.title ??
    statusStages?.items?.find((stage: any) => stage.id === currentStageId)
      ?.title ??
    '';

  useEffect(() => {
    if (isShow) {
      setMoveToStageId(undefined);
    }
  }, [isShow, stageApprovalCandidateId]);

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
    return [];
  }, []);

  const stageOptions = useMemo(
    () =>
      (statusStages?.items ?? []).map((stage: any) => ({
        value: stage.id,
        label: stage.title,
      })),
    [statusStages?.items],
  );

  const onClose = () => {
    setIsShow(false);
    setStageApprovalCandidateId(null);
    setStageApprovalWorkflowId(null);
    setStageApprovalCandidate(null);
    setStageApprovalRows([]);
    setMoveToStageId(undefined);
  };

  const resolveApprovalRequestIds = async () => {
    const requestIdByCandidateId = new Map<string, string>();
    activeRows.forEach((row: any) => {
      if (row?.candidateId && row?.requestId) {
        requestIdByCandidateId.set(row.candidateId, row.requestId);
      }
    });

    const uninitiatedRows = activeRows.filter((row: any) => !row?.requestId);
    const rowsByStage = uninitiatedRows.reduce(
      (acc: Record<string, any[]>, row: any) => {
        const stageId = row?.currentStageId;
        if (!stageId) return acc;
        acc[stageId] = [...(acc[stageId] ?? []), row];
        return acc;
      },
      {},
    );

    for (const [stageId, rows] of Object.entries(rowsByStage)) {
      const response = await createApprovalRequests({
        approvalWorkflowId: stageApprovalWorkflowId ?? '',
        jobId: rows[0]?.jobId,
        applicantStatusStageId: stageId,
        candidateIds: rows.map((row: any) => row.candidateId),
      });

      (response?.items ?? []).forEach((item: any) => {
        if (item?.candidateId && item?.id) {
          requestIdByCandidateId.set(item.candidateId, item.id);
        }
      });
    }

    return requestIdByCandidateId;
  };

  const buildActionItems = (requestIdByCandidateId: Map<string, string>) => {
    const targetStage = stageOptions.find(
      (stage: any) => stage.value === moveToStageId,
    );
    const toStatus =
      typeof targetStage?.label === 'string' ? targetStage.label : '';

    return activeRows.map((row: any) => ({
      requestId: requestIdByCandidateId.get(row.candidateId) ?? row.requestId,
      applicantStatusStageId: moveToStageId!,
      fromStatus: row?.currentStageTitle ?? currentStageTitle,
      toStatus,
    }));
  };

  const handleApprovalAction = async (action: 'approve' | 'reject') => {
    if (!moveToStageId) {
      NotificationMessage.error({
        message: 'Please choose a stage',
      });
      return;
    }
    if (!activeRows.length || !stageApprovalWorkflowId) {
      NotificationMessage.error({
        message: 'Approval request data is missing',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const requestIdByCandidateId = await resolveApprovalRequestIds();
      const items = buildActionItems(requestIdByCandidateId);
      const missingRequest = items.find((item) => !item.requestId);
      if (missingRequest) {
        throw new Error('Approval request id was not returned by the backend.');
      }

      if (items.length === 1) {
        if (action === 'approve') {
          await approveCandidateApproval(items[0]);
        } else {
          await rejectCandidateApproval(items[0]);
        }
      } else if (action === 'approve') {
        await bulkApproveCandidateApproval({ items });
      } else {
        await bulkRejectCandidateApproval({ items });
      }

      setSelectedCandidate([]);
      setSelectedRowKeys([]);
      onClose();
    } catch (error: any) {
      NotificationMessage.error({
        message:
          error?.response?.data?.message ||
          error?.message ||
          'Candidate approval action failed',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const sortedApprovals = useMemo(() => {
    const workflowApprovers =
      primaryApprovalRow?.approvers ?? workflowData?.approvers ?? [];
    const logs = approverLog?.items ?? [];
    if (workflowApprovers.length) {
      return workflowApprovers
        .map((approver: ApprovalRecord) => {
          const log = logs.find(
            (item: SingleLogRequest) => item.stepOrder === approver.stepOrder,
          );
          return {
            ...approver,
            approvedUserId: log?.approvedUserId,
            displayUserId: log?.approvedUserId ?? approver.userId,
            status:
              log?.action === 'Approved' || log?.action === 'Rejected'
                ? (log.action as 'Approved' | 'Rejected')
                : 'Pending',
          };
        })
        .sort(
          (a: ApprovalRecord, b: ApprovalRecord) => a.stepOrder - b.stepOrder,
        );
    }

    return [...enrichedApprovalData].sort((a, b) => a.stepOrder - b.stepOrder);
  }, [
    approverLog?.items,
    enrichedApprovalData,
    primaryApprovalRow?.approvers,
    workflowData?.approvers,
  ]);

  return (
    <Modal
      open={isShow && !!stageApprovalCandidateId}
      onCancel={onClose}
      footer={null}
      width={720}
      centered
      destroyOnClose
      className="stage-approval-modal"
      data-cy="talent-acquisition-stage-approval-modal"
    >
      {isCandidateLoading && !candidate ? (
        <div
          className="flex justify-center py-10"
          data-cy="talent-acquisition-stage-approval-modal-loading"
        >
          <Skeleton active />
        </div>
      ) : (
        <div
          className="rounded-[12px] bg-white"
          data-cy="talent-acquisition-stage-approval-modal-content"
        >
          <div
            className="mb-6"
            data-cy="talent-acquisition-stage-approval-modal-header"
          >
            <h2
              className="text-base font-bold text-[#4D4D4D] m-0 mb-2"
              data-cy="talent-acquisition-stage-approval-modal-title"
            >
              Stage Approval
            </h2>
          </div>

          <div
            className="mb-6"
            data-cy="talent-acquisition-stage-approval-modal-approval-stages"
          >
            <div
              className="text-sm font-normal text-black mb-4"
              data-cy="talent-acquisition-stage-approval-modal-approval-stages-label"
            >
              Approval Stages
            </div>
            <div
              className="flex items-center justify-center gap-0 min-w-0 px-1"
              data-cy="talent-acquisition-stage-approval-modal-approval-timeline"
            >
              {isLogLoading ? (
                <div
                  data-cy="talent-acquisition-stage-approval-modal-approval-timeline-skeleton"
                  className="h-16 w-full flex items-center justify-center"
                >
                  <Skeleton.Button active size="small" />
                </div>
              ) : sortedApprovals.length === 0 ? (
                <div
                  data-cy="talent-acquisition-stage-approval-modal-approval-timeline-empty"
                  className="h-12 w-full"
                />
              ) : (
                (() => {
                  const primaryColor = '#3636F0';
                  const notReachedColor = '#E6F4FF';
                  const firstPendingIdx = sortedApprovals.findIndex(
                    (a) => a.status === 'Pending',
                  );

                  return sortedApprovals.map((approval, idx) => {
                    const displayId = approval.displayUserId ?? approval.userId;
                    const isPendingStep = approval.status === 'Pending';
                    const isApprovedStep = approval.status === 'Approved';
                    const isRejectedStep = approval.status === 'Rejected';
                    const isCurrentStage =
                      isPendingStep && idx === firstPendingIdx;
                    const isConnectorActive =
                      isApprovedStep && idx < firstPendingIdx;
                    const avatarPx = isCurrentStage ? 48 : 40;

                    return (
                      <React.Fragment key={approval.stepOrder}>
                        {idx > 0 && (
                          <div
                            data-cy="talent-acquisition-stage-approval-modal-approval-timeline-item"
                            className="flex-1 min-w-[40px] flex items-center justify-center"
                          >
                            <div
                              data-cy="talent-acquisition-stage-approval-modal-approval-timeline-item-connector"
                              className="w-full h-0.5"
                              style={{
                                backgroundColor: isConnectorActive
                                  ? primaryColor
                                  : notReachedColor,
                              }}
                            />
                          </div>
                        )}
                        <div
                          data-cy="talent-acquisition-stage-approval-modal-approval-timeline-item-content"
                          className="flex items-center shrink-0"
                        >
                          <Tooltip
                            title={userData(displayId) || 'Approver'}
                            placement="bottom"
                            overlayInnerStyle={{
                              background: '#000',
                              color: '#fff',
                              borderRadius: 8,
                            }}
                          >
                            <div
                              className={`relative shrink-0 rounded-full overflow-hidden border-2 transition-transform ${
                                isCurrentStage
                                  ? 'w-12 h-12 border-dashed border-[#3636F0]'
                                  : isApprovedStep
                                    ? 'w-10 h-10 border-[#3636F0]'
                                    : isRejectedStep
                                      ? 'w-10 h-10 border-[#FF4D4F]'
                                      : 'w-10 h-10 border-gray-200'
                              }`}
                              data-cy={`talent-acquisition-stage-approval-modal-approval-avatar-${approval.stepOrder}`}
                            >
                              {displayId && userImage(displayId) ? (
                                <Image
                                  src={userImage(displayId) ?? ''}
                                  alt={userData(displayId)}
                                  width={avatarPx}
                                  height={avatarPx}
                                  className="object-cover w-full h-full"
                                />
                              ) : (
                                <div
                                  data-cy="talent-acquisition-stage-approval-modal-approval-timeline-item-content-avatar-fallback"
                                  className="w-full h-full bg-gray-200"
                                />
                              )}
                            </div>
                          </Tooltip>
                        </div>
                      </React.Fragment>
                    );
                  });
                })()
              )}
            </div>
          </div>

          <Form
            layout="vertical"
            className="stage-approval-form"
            data-cy="talent-acquisition-stage-approval-modal-form"
          >
            <Form.Item
              label={
                <>
                  Previous Stage{' '}
                  <span
                    data-cy="talent-acquisition-stage-approval-modal-previous-stage-required"
                    className="text-red-500 pl-1"
                    aria-hidden
                  >
                    *
                  </span>
                </>
              }
              data-cy="talent-acquisition-stage-approval-modal-previous-stage"
            >
              <Select
                value={currentStageId || undefined}
                options={
                  currentStageId
                    ? [
                        {
                          value: currentStageId,
                          label: currentStageTitle || 'Current stage',
                        },
                      ]
                    : []
                }
                disabled
                suffixIcon={null}
                className="w-full"
                data-cy="talent-acquisition-stage-approval-modal-previous-stage-select"
              />
            </Form.Item>

            <Form.Item
              label={
                <>
                  Move to{' '}
                  <span
                    data-cy="talent-acquisition-stage-approval-modal-move-to-required"
                    className="text-red-500 pl-1"
                    aria-hidden
                  >
                    *
                  </span>
                </>
              }
              data-cy="talent-acquisition-stage-approval-modal-move-to"
            >
              <Select
                value={moveToStageId}
                onChange={setMoveToStageId}
                options={stageOptions}
                placeholder="Choose Stage"
                className="w-full"
                data-cy="talent-acquisition-stage-approval-modal-move-to-select"
              />
            </Form.Item>
          </Form>

          <div
            className="flex items-center justify-end gap-3 pt-2"
            data-cy="talent-acquisition-stage-approval-modal-footer"
          >
            <Button
              onClick={onClose}
              className="h-10 px-5 rounded-lg border border-gray-300 text-gray-700"
              data-cy="talent-acquisition-stage-approval-modal-cancel-button"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              onClick={() => handleApprovalAction('reject')}
              loading={isSubmitting}
              disabled={isSubmitting}
              danger
              className="h-10 px-6 rounded-lg"
              data-cy="talent-acquisition-stage-approval-modal-reject-button"
            >
              Reject
            </Button>
            <Button
              type="primary"
              onClick={() => handleApprovalAction('approve')}
              loading={isSubmitting}
              disabled={isSubmitting}
              className="h-10 px-6 rounded-lg !bg-[#1E40AF] hover:!bg-[#1D4ED8] border-0"
              data-cy="talent-acquisition-stage-approval-modal-approve-button"
            >
              Approve
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default StageApprovalModal;
