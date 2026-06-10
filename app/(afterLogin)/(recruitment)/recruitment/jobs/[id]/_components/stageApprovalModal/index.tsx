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
  useGetSingleApproval,
  useGetSingleApprovalLog,
} from '@/store/server/features/timesheet/leaveRequest/queries';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { SingleLogRequest } from '@/types/timesheet/settings';

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

function getStageLabel(index: number, title?: string) {
  if (title) return title;
  const ordinals = ['1st round', '2nd round', '3rd round', '4th round'];
  return ordinals[index] ?? `Round ${index + 1}`;
}

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
  } = useCandidateState();

  const [moveToStageId, setMoveToStageId] = useState<string | undefined>();

  const { data: candidateData, isLoading: isCandidateLoading } =
    useGetCandidateById(stageApprovalCandidateId ?? '');
  const { data: statusStages } = useGetStages();
  const { data: logData, isLoading: isLogLoading } = useGetSingleApprovalLog(
    stageApprovalCandidateId ?? '',
    stageApprovalWorkflowId ?? '',
  );
  const { data: approverLog } = useGetSingleApproval(
    stageApprovalCandidateId ?? '',
  );
  const { data: usersData } = useGetAllUsers();

  const candidate = candidateData ?? stageApprovalCandidate;
  const jobCandidate = candidate?.jobCandidate?.[0];
  const currentStageId = jobCandidate?.applicantStatusStageId;
  const currentStageTitle =
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
    setMoveToStageId(undefined);
  };

  const handleMove = () => {
    // TODO: Implement the move to stage logic
  };

  const sortedApprovals = useMemo(
    () => [...enrichedApprovalData].sort((a, b) => a.stepOrder - b.stepOrder),
    [enrichedApprovalData],
  );

  const recruitmentStages = statusStages?.items ?? [];

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
                  className="flex items-center justify-center gap-2 w-full overflow-x-auto py-2"
                >
                  {(recruitmentStages.length > 0
                    ? recruitmentStages.slice(0, 4)
                    : [{ id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }]
                  ).map((stage: any, idx: number, arr: any[]) => {
                    const isCurrent = stage.id === currentStageId;
                    const isPast =
                      recruitmentStages.findIndex(
                        (s: any) => s.id === currentStageId,
                      ) > idx;
                    const connectorColor =
                      isPast || isCurrent ? '#3636F0' : '#E6F4FF';

                    return (
                      <React.Fragment key={stage.id ?? idx}>
                        {idx > 0 && (
                          <div
                            data-cy="talent-acquisition-stage-approval-modal-approval-timeline-item"
                            className="flex-1 min-w-[40px] flex flex-col items-center justify-center gap-1"
                          >
                            <span
                              data-cy="talent-acquisition-stage-approval-modal-approval-timeline-item-label"
                              className="inline-flex items-center rounded-md border border-solid px-2 py-0.5 text-[11px] font-normal whitespace-nowrap"
                              style={{
                                backgroundColor: '#E6F0FF',
                                color: '#1677FF',
                                borderColor: '#91CAFF',
                              }}
                            >
                              {getStageLabel(idx - 1, arr[idx - 1]?.title)}
                            </span>
                            <div
                              data-cy="talent-acquisition-stage-approval-modal-approval-timeline-item-connector"
                              className="w-full h-0.5"
                              style={{ backgroundColor: connectorColor }}
                            />
                          </div>
                        )}
                        <div
                          data-cy="talent-acquisition-stage-approval-modal-approval-timeline-item-content"
                          className="flex flex-col items-center gap-1 shrink-0"
                        >
                          <div
                            data-cy="talent-acquisition-stage-approval-modal-approval-timeline-item-content-avatar"
                            className={`w-10 h-10 rounded-full border-2 flex items-center justify-center bg-gray-100 text-xs font-medium text-gray-500 ${
                              isCurrent
                                ? 'border-dashed border-[#3636F0]'
                                : isPast
                                  ? 'border-[#3636F0]'
                                  : 'border-gray-200'
                            }`}
                          >
                            {String(idx + 1)}
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })}
                </div>
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
                    const isCurrentStage =
                      isPendingStep && idx === firstPendingIdx;
                    const isConnectorActive =
                      isApprovedStep && idx < firstPendingIdx;
                    const stageLabel = getStageLabel(
                      idx,
                      recruitmentStages[idx]?.title,
                    );
                    const avatarPx = isCurrentStage ? 48 : 40;

                    return (
                      <React.Fragment key={approval.stepOrder}>
                        {idx > 0 && (
                          <div
                            data-cy="talent-acquisition-stage-approval-modal-approval-timeline-item"
                            className="flex-1 min-w-[40px] flex flex-col items-center justify-center gap-1"
                          >
                            <span
                              className="inline-flex items-center rounded-md border border-solid px-2 py-0.5 text-[11px] font-normal whitespace-nowrap"
                              style={{
                                backgroundColor: '#E6F0FF',
                                color: '#1677FF',
                                borderColor: '#91CAFF',
                              }}
                              data-cy={`talent-acquisition-stage-approval-modal-stage-label-${idx}`}
                            >
                              {getStageLabel(
                                idx - 1,
                                recruitmentStages[idx - 1]?.title,
                              )}
                            </span>
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
                          className="flex flex-col items-center gap-1 shrink-0"
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
                                  className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs font-medium"
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
                          {idx === 0 && (
                            <span
                              className="inline-flex items-center rounded-md border border-solid px-2 py-0.5 text-[11px] font-normal whitespace-nowrap"
                              style={{
                                backgroundColor: '#E6F0FF',
                                color: '#1677FF',
                                borderColor: '#91CAFF',
                              }}
                              data-cy="talent-acquisition-stage-approval-modal-approval-timeline-item-content-label"
                            >
                              {stageLabel}
                            </span>
                          )}
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
              onClick={handleMove}
              className="h-10 px-6 rounded-lg !bg-[#1E40AF] hover:!bg-[#1D4ED8] border-0"
              data-cy="talent-acquisition-stage-approval-modal-move-button"
            >
              Move
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default StageApprovalModal;
