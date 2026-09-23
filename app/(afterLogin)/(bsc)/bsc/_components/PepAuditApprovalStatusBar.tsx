'use client';

import React from 'react';
import { Avatar, Tooltip } from 'antd';
import { CheckOutlined, CloseOutlined, UserOutlined } from '@ant-design/icons';
import { PepAuditRow } from '@/types/bsc';
import {
  resolveAggregatePepWorkflowSteps,
  resolvePepWorkflowSteps,
  type PepWorkflowStepState,
} from '@/utils/bsc/pepAuditWorkflow';

type StepDisplayStatus = 'Approved' | 'Pending' | 'Rejected' | 'Waiting';

export type PepAuditStepParticipant = {
  name: string;
  profileImage?: string | null;
};

export type PepAuditBarParticipants = {
  reporter: PepAuditStepParticipant;
  manager: PepAuditStepParticipant;
  pep: PepAuditStepParticipant;
};

const STATUS_LABEL: Record<StepDisplayStatus, string> = {
  Approved: 'Approved',
  Pending: 'Pending',
  Rejected: 'Rejected',
  Waiting: 'Waiting',
};

function mapStepState(state: PepWorkflowStepState): StepDisplayStatus {
  if (state === 'done') return 'Approved';
  if (state === 'active') return 'Pending';
  if (state === 'rejected') return 'Rejected';
  return 'Waiting';
}

function participantInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function PepApprovalStepItem({
  participant,
  status,
  roleLabel,
  dataCy,
}: {
  participant: PepAuditStepParticipant;
  status: StepDisplayStatus;
  roleLabel: string;
  dataCy: string;
}) {
  const isApproved = status === 'Approved';
  const isPending = status === 'Pending';
  const isRejected = status === 'Rejected';
  const isWaiting = status === 'Waiting';

  let circleClass = 'border-[#D9D9D9] bg-[#FAFAFA] text-gray-400';
  if (isApproved) {
    circleClass = 'border-[#16A34A] bg-[#F6FFED] text-[#16A34A]';
  } else if (isPending) {
    circleClass = 'border-[#1677ff] bg-[#E6F4FF] text-[#1677ff]';
  } else if (isRejected) {
    circleClass = 'border-[#DC2626] bg-[#FFF2F0] text-[#DC2626]';
  }

  const displayName = participant.name.trim() || '—';
  const statusColor = isApproved
    ? 'text-[#16A34A]'
    : isPending
      ? 'text-[#1677ff]'
      : isRejected
        ? 'text-[#DC2626]'
        : 'text-gray-400';

  return (
    <Tooltip title={`${roleLabel}: ${displayName} · ${STATUS_LABEL[status]}`}>
      <div
        className="flex w-[72px] shrink-0 flex-col items-center gap-0.5 text-center"
        data-cy={dataCy}
      >
        <div
          className={`flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 ${circleClass}`}
          data-cy={`${dataCy}-circle`}
        >
          {isApproved ? (
            <CheckOutlined className="text-xs font-bold" />
          ) : isRejected ? (
            <CloseOutlined className="text-[10px]" />
          ) : participant.profileImage ? (
            <Avatar
              size={24}
              src={participant.profileImage}
              icon={<UserOutlined />}
              className="border-0 bg-transparent"
            />
          ) : isPending ? (
            <span
              data-cy="auto-added"
              className="text-[9px] font-semibold leading-none"
            >
              {participantInitials(displayName)}
            </span>
          ) : (
            <UserOutlined className="text-[10px]" />
          )}
        </div>
        <p
          className={`m-0 w-full truncate text-[10px] leading-tight ${
            isWaiting ? 'text-gray-400' : 'font-medium text-gray-800'
          }`}
          title={displayName}
          data-cy={`${dataCy}-name`}
        >
          {displayName}
        </p>
        <span
          className={`text-[9px] leading-none ${statusColor}`}
          data-cy={`${dataCy}-status`}
        >
          {STATUS_LABEL[status]}
        </span>
      </div>
    </Tooltip>
  );
}

function PepApprovalConnector({
  active,
  rejected,
  dataCy,
}: {
  active: boolean;
  rejected: boolean;
  dataCy: string;
}) {
  const color = rejected ? '#DC2626' : active ? '#16A34A' : '#D9D9D9';
  return (
    <div
      className="mx-1 h-px min-w-[8px] flex-1 self-center"
      style={{ backgroundColor: color }}
      data-cy={dataCy}
    />
  );
}

type BarProps = {
  steps: [PepWorkflowStepState, PepWorkflowStepState, PepWorkflowStepState];
  participants: PepAuditBarParticipants;
  dataCy?: string;
  className?: string;
};

export function PepAuditApprovalStatusBar({
  steps,
  participants,
  dataCy = 'bsc-pep-audit-approval-bar',
  className = '',
}: BarProps) {
  const displayStatuses = steps.map(mapStepState);
  const stepParticipants = [
    participants.reporter,
    participants.manager,
    participants.pep,
  ] as const;
  const roleLabels = ['Employee', 'Manager', 'PEP'] as const;

  return (
    <div
      className={`flex w-full min-w-0 items-center ${className}`}
      data-cy={dataCy}
    >
      <div
        className="flex w-full min-w-0 items-center"
        data-cy={`${dataCy}-levels`}
      >
        {stepParticipants.map((participant, idx) => {
          const status = displayStatuses[idx];
          const previousStatus = idx > 0 ? displayStatuses[idx - 1] : null;
          const connectorActive =
            previousStatus === 'Approved' && status !== 'Waiting';
          const connectorRejected =
            previousStatus === 'Rejected' || status === 'Rejected';

          return (
            <React.Fragment key={`${participant.name}-${idx}`}>
              {idx > 0 ? (
                <PepApprovalConnector
                  active={connectorActive}
                  rejected={connectorRejected}
                  dataCy={`${dataCy}-connector-${idx}`}
                />
              ) : null}
              <PepApprovalStepItem
                participant={participant}
                status={status}
                roleLabel={roleLabels[idx]}
                dataCy={`${dataCy}-step-${idx}`}
              />
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

function defaultParticipantsFromRow(row: PepAuditRow): PepAuditBarParticipants {
  return {
    reporter: { name: row.employeeName || 'Employee' },
    manager: { name: 'Manager' },
    pep: { name: 'PEP' },
  };
}

type SingleRowProps = {
  row: PepAuditRow;
  participants?: Partial<PepAuditBarParticipants>;
  dataCy?: string;
  className?: string;
};

export function PepAuditApprovalStatusBarForRow({
  row,
  participants,
  dataCy,
  className,
}: SingleRowProps) {
  const steps = resolvePepWorkflowSteps(row);
  const defaults = defaultParticipantsFromRow(row);
  return (
    <PepAuditApprovalStatusBar
      steps={steps}
      participants={{
        reporter: participants?.reporter ?? defaults.reporter,
        manager: participants?.manager ?? defaults.manager,
        pep: participants?.pep ?? defaults.pep,
      }}
      dataCy={dataCy}
      className={className}
    />
  );
}

type AggregateProps = {
  rows: PepAuditRow[];
  participants: PepAuditBarParticipants;
  dataCy?: string;
  className?: string;
};

export function PepAuditApprovalStatusBarAggregate({
  rows,
  participants,
  dataCy = 'bsc-results-approval-bar',
  className,
}: AggregateProps) {
  if (!rows.length) {
    return (
      <span data-cy="auto-added" className="text-sm text-gray-400">
        —
      </span>
    );
  }
  const steps = resolveAggregatePepWorkflowSteps(rows);
  return (
    <PepAuditApprovalStatusBar
      steps={steps}
      participants={participants}
      dataCy={dataCy}
      className={className}
    />
  );
}
