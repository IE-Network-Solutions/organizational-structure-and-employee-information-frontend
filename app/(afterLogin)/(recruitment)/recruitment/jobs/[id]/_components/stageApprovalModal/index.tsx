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
  type CandidateApprovalActionPayload,
} from '@/store/server/features/recruitment/candidateApproval/mutation';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { SingleLogRequest } from '@/types/timesheet/settings';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import AddEmployeeModal from '@/app/(afterLogin)/(employeeInformation)/employees/manage-employees/_components/add-employee-modal';
import { mapCandidateToEmployeePrefill } from '@/app/(afterLogin)/(employeeInformation)/employees/manage-employees/_components/mapCandidateToEmployeePrefill';
import { useEmployeeManagementStore } from '@/store/uistate/features/employees/employeeManagment';

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

type StageInfo = {
  id: string;
  title: string;
  level: number;
  isFinal: boolean;
};

const getStageLevel = (
  stageById: Map<string, StageInfo>,
  stageId?: string,
): number | null => {
  const level = stageById.get(stageId ?? '')?.level;
  if (typeof level !== 'number' || !Number.isFinite(level)) {
    return null;
  }
  return level;
};

const resolveActionFromLevels = (
  currentLevel: number | null,
  targetLevel: number | null,
): 'approve' | 'reject' | null => {
  if (currentLevel === null || targetLevel === null) return null;
  if (targetLevel > currentLevel) return 'approve';
  if (targetLevel < currentLevel) return 'reject';
  return null;
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
  const userId = useAuthenticationStore((state) => state.userId);

  const {
    setOpen: setAddEmployeeModalOpen,
    setEmployeePrefillData,
    setIsEmployeeModalFromCandidateMove,
  } = useEmployeeManagementStore();

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

  const isFinalApprover = useMemo(() => {
    const approvers =
      primaryApprovalRow?.approvers ?? workflowData?.approvers ?? [];
    if (!approvers.length || !userId) return false;

    const maxStepOrder = Math.max(
      ...approvers.map((approver: { stepOrder: number }) => approver.stepOrder),
    );
    const loggedInApprover = approvers.find(
      (approver: { userId: string }) => approver.userId === userId,
    );

    return loggedInApprover?.stepOrder === maxStepOrder;
  }, [primaryApprovalRow?.approvers, workflowData?.approvers, userId]);

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

  const stageById = useMemo(() => {
    const map = new Map<string, StageInfo>();
    (statusStages?.items ?? []).forEach((stage: any) => {
      if (!stage?.id) return;
      map.set(stage.id, {
        id: stage.id,
        title: stage.title ?? '',
        level: Number(stage.level),
        isFinal: Boolean(stage.isFinal),
      });
    });
    return map;
  }, [statusStages?.items]);

  const stageOptions = useMemo(
    () =>
      (statusStages?.items ?? [])
        .filter((stage: any) => {
          if (stage?.isFinal && !isFinalApprover) return false;
          return true;
        })
        .map((stage: any) => ({
          value: stage.id,
          label: stage.title,
        })),
    [statusStages?.items, isFinalApprover],
  );

  useEffect(() => {
    if (!moveToStageId) return;
    const selectedStage = stageById.get(moveToStageId);
    if (selectedStage?.isFinal && !isFinalApprover) {
      setMoveToStageId(undefined);
    }
  }, [moveToStageId, isFinalApprover, stageById]);

  const moveToActionHint = useMemo(() => {
    if (!moveToStageId || !currentStageId) return null;
    if (moveToStageId === currentStageId) {
      return 'Select a different stage to continue.';
    }

    const action = resolveActionFromLevels(
      getStageLevel(stageById, currentStageId),
      getStageLevel(stageById, moveToStageId),
    );

    if (action === 'approve') {
      return 'Moving to a higher-level stage will approve this candidate.';
    }
    if (action === 'reject') {
      return 'Moving to a lower-level stage will reject this candidate.';
    }
    return 'Stage levels are missing or equal. Choose another stage.';
  }, [currentStageId, moveToStageId, stageById]);

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
    const targetStage = stageById.get(moveToStageId ?? '');
    const toStatus = targetStage?.title ?? '';

    return activeRows.map((row: any) => {
      const rowCurrentStageId = row?.currentStageId ?? currentStageId;
      return {
        payload: {
          requestId:
            requestIdByCandidateId.get(row.candidateId) ?? row.requestId,
          applicantStatusStageId: moveToStageId!,
          fromStatus: row?.currentStageTitle ?? currentStageTitle,
          toStatus,
        } satisfies CandidateApprovalActionPayload,
        rowCurrentStageId,
      };
    });
  };

  const submitApprovalItems = async (
    approveItems: CandidateApprovalActionPayload[],
    rejectItems: CandidateApprovalActionPayload[],
  ) => {
    if (approveItems.length === 1 && rejectItems.length === 0) {
      await approveCandidateApproval(approveItems[0]);
      return;
    }
    if (rejectItems.length === 1 && approveItems.length === 0) {
      await rejectCandidateApproval(rejectItems[0]);
      return;
    }
    if (approveItems.length > 0) {
      await bulkApproveCandidateApproval({ items: approveItems });
    }
    if (rejectItems.length > 0) {
      await bulkRejectCandidateApproval({ items: rejectItems });
    }
  };

  const handleMoveTo = async () => {
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

    const targetStage = stageById.get(moveToStageId);
    if (targetStage?.isFinal && !isFinalApprover) {
      NotificationMessage.error({
        message:
          'Only the final approver can move candidates to a final stage.',
      });
      return;
    }

    const targetLevel = getStageLevel(stageById, moveToStageId);
    if (targetLevel === null) {
      NotificationMessage.error({
        message: 'Target stage level is missing',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const requestIdByCandidateId = await resolveApprovalRequestIds();
      const actionItems = buildActionItems(requestIdByCandidateId);
      const missingRequest = actionItems.find(
        (item) => !item.payload.requestId,
      );
      if (missingRequest) {
        throw new Error('Approval request id was not returned by the backend.');
      }

      const approveItems: CandidateApprovalActionPayload[] = [];
      const rejectItems: CandidateApprovalActionPayload[] = [];

      for (const item of actionItems) {
        if (item.rowCurrentStageId === moveToStageId) {
          throw new Error('Cannot move to the same stage.');
        }

        const action = resolveActionFromLevels(
          getStageLevel(stageById, item.rowCurrentStageId),
          targetLevel,
        );

        if (!action) {
          throw new Error(
            'Stage level is missing or unchanged. Choose a higher or lower stage.',
          );
        }

        if (action === 'approve') {
          approveItems.push(item.payload);
        } else {
          rejectItems.push(item.payload);
        }
      }

      await submitApprovalItems(approveItems, rejectItems);

      const isMovingToFinalStage =
        stageById.get(moveToStageId)?.isFinal === true;

      const candidateForPrefill =
        candidateData ??
        activeRows[0]?.displayCandidate ??
        stageApprovalCandidate;
      const employeePrefill = isMovingToFinalStage
        ? mapCandidateToEmployeePrefill(candidateForPrefill)
        : null;

      setSelectedCandidate([]);
      setSelectedRowKeys([]);
      onClose();

      if (isMovingToFinalStage) {
        setEmployeePrefillData(employeePrefill);
        setIsEmployeeModalFromCandidateMove(true);
        setAddEmployeeModalOpen(true);
      }
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
    <>
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
                      (a: ApprovalRecord) => a.status === 'Pending',
                    );

                    return sortedApprovals.map(
                      (approval: ApprovalRecord, idx: number) => {
                        const displayId =
                          approval.displayUserId ?? approval.userId;
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
                      },
                    );
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
                {moveToActionHint && (
                  <p
                    className="mt-2 mb-0 text-xs text-gray-500"
                    data-cy="talent-acquisition-stage-approval-modal-move-to-hint"
                  >
                    {moveToActionHint}
                  </p>
                )}
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
                onClick={handleMoveTo}
                loading={isSubmitting}
                disabled={!moveToStageId || isSubmitting}
                className="h-10 px-6 rounded-lg !bg-[#1E40AF] hover:!bg-[#1D4ED8] border-0"
                data-cy="talent-acquisition-stage-approval-modal-move-to-button"
              >
                Move to
              </Button>
            </div>
          </div>
        )}
      </Modal>
      <AddEmployeeModal onClose={() => setAddEmployeeModalOpen(false)} />
    </>
  );
};

export default StageApprovalModal;
