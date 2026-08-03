'use client';
import React from 'react';
import { Button, Table } from 'antd';
import type { TableColumnsType } from 'antd';
import PlayArrowOutlinedIcon from '@mui/icons-material/PlayArrowOutlined';
import StatusBadge, {
  StatusBadgeTheme,
} from '@/components/common/statusBadge/statusBadge';
import {
  PersonIdentity,
  PersonRoleAvatar,
  PersonRoleLabel,
} from './personRoleChrome';
import { scoreAchievementPercent } from './steps/stepEvaluatorAssignment';

export const getScoreBadgeClass = (score: number) => {
  if (score >= 80) return 'bg-green-50 border-green-200 text-green-700';
  if (score >= 60) return 'bg-amber-50 border-amber-200 text-amber-700';
  return 'bg-red-50 border-red-200 text-red-700';
};

export interface CriteriaLineItem {
  key: string;
  name: string;
  category?: string;
  weight?: number;
  score?: number;
  status?: 'Evaluated' | 'Pending';
  clickable?: boolean;
  onClick?: () => void;
  trailing?: React.ReactNode;
}

/** Compact criteria row for divide-y lists (role detail, etc.). */
export const CriteriaLine: React.FC<{
  item: CriteriaLineItem;
  'data-cy'?: string;
}> = ({ item, 'data-cy': dataCy }) => {
  const scored = item.status === 'Evaluated' && item.score != null;
  const nameNode = item.clickable ? (
    <button
      type="button"
      className="text-left group min-w-0"
      onClick={item.onClick}
      data-cy={dataCy ? `${dataCy}-name` : undefined}
    >
      <div className="text-sm font-medium text-[#1E40AF] group-hover:underline truncate">
        {item.name}
      </div>
      {item.category ? (
        <div className="text-xs text-gray-400 truncate">{item.category}</div>
      ) : null}
    </button>
  ) : (
    <div className="min-w-0">
      <div className="text-sm text-gray-800 truncate">{item.name}</div>
      {item.category ? (
        <div className="text-xs text-gray-400 truncate">{item.category}</div>
      ) : null}
    </div>
  );

  return (
    <div
      className="flex flex-wrap items-center gap-3 px-4 py-2.5"
      data-cy={dataCy}
    >
      <div className="min-w-0 flex-1">{nameNode}</div>
      <div className="text-sm text-[#4d4d4d] tabular-nums w-14 shrink-0">
        {item.weight != null ? `${item.weight}%` : '—'}
      </div>
      <div className="w-24 shrink-0 flex justify-end">
        {scored ? (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded border text-sm font-semibold tabular-nums ${getScoreBadgeClass(
              scoreAchievementPercent(item.score!, item.weight ?? 0),
            )}`}
          >
            {item.score}
            {item.weight != null ? ` / ${item.weight}` : ''}
          </span>
        ) : (
          <span className="text-sm text-gray-400">—</span>
        )}
      </div>
      {item.trailing ? (
        <div className="w-full sm:w-[220px] sm:shrink-0">{item.trailing}</div>
      ) : null}
    </div>
  );
};

export interface SuccessorSessionTableProps {
  sessionKey: string;
  successorName: string;
  successorJobTitle?: string;
  roleName: string;
  department: string;
  isComplete: boolean;
  sessionTotal: number;
  sessionMaxWeight: number;
  criteria: CriteriaLineItem[];
  onRoleClick: () => void;
  onEvaluate?: () => void;
}

/**
 * One successor = one small table (header + criteria rows).
 * Used inside a larger evaluator container on the admin view.
 */
export const SuccessorSessionTable: React.FC<SuccessorSessionTableProps> = ({
  sessionKey,
  successorName,
  successorJobTitle,
  roleName,
  department,
  isComplete,
  sessionTotal,
  sessionMaxWeight,
  criteria,
  onRoleClick,
  onEvaluate,
}) => {
  const columns: TableColumnsType<CriteriaLineItem> = [
    {
      title: (
        <span className="text-[#4d4d4d] text-xs font-bold uppercase tracking-wide">
          Criteria
        </span>
      ),
      key: 'name',
      render: (_: unknown, record) =>
        record.clickable ? (
          <button
            type="button"
            className="text-left group min-w-0"
            onClick={record.onClick}
            data-cy={`evaluation-criterion-link-${record.key}`}
          >
            <div className="text-sm font-medium text-[#1E40AF] group-hover:underline truncate">
              {record.name}
            </div>
            {record.category ? (
              <div className="text-xs text-gray-400">{record.category}</div>
            ) : null}
          </button>
        ) : (
          <div className="min-w-0">
            <div className="text-sm text-gray-800 truncate">{record.name}</div>
            {record.category ? (
              <div className="text-xs text-gray-400">{record.category}</div>
            ) : null}
          </div>
        ),
    },
    {
      title: (
        <span className="text-[#4d4d4d] text-xs font-bold uppercase tracking-wide">
          Weight
        </span>
      ),
      key: 'weight',
      width: 90,
      render: (_: unknown, record) => (
        <span className="text-sm text-[#4d4d4d] tabular-nums">
          {record.weight != null ? `${record.weight}%` : '—'}
        </span>
      ),
    },
    {
      title: (
        <span className="text-[#4d4d4d] text-xs font-bold uppercase tracking-wide">
          Result
        </span>
      ),
      key: 'result',
      width: 120,
      render: (_: unknown, record) => {
        const scored = record.status === 'Evaluated' && record.score != null;
        if (!scored) {
          return <span className="text-sm text-gray-400">—</span>;
        }
        return (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded border text-sm font-semibold tabular-nums ${getScoreBadgeClass(
              scoreAchievementPercent(record.score!, record.weight ?? 0),
            )}`}
          >
            {record.score}
            {record.weight != null ? ` / ${record.weight}` : ''}
          </span>
        );
      },
    },
  ];

  return (
    <div
      className="rounded-lg border border-[#E5E7EB] overflow-hidden bg-white"
      data-cy={`evaluation-session-${sessionKey}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-[#F8FAFC] border-b border-[#E5E7EB]">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <PersonRoleAvatar role="Successor" size={32} />
          <div className="min-w-0 flex-1">
            <PersonRoleLabel role="Successor" />
            <div className="text-sm font-semibold text-gray-800 truncate">
              {successorName}
            </div>
            <div className="text-xs text-gray-500 truncate">
              {successorJobTitle ? `${successorJobTitle} · ` : ''}
              For{' '}
              <button
                type="button"
                className="font-medium text-gray-700 hover:text-primary"
                onClick={onRoleClick}
              >
                {roleName}
              </button>
              <span className="text-gray-400"> · {department}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <StatusBadge
            theme={
              isComplete ? StatusBadgeTheme.success : StatusBadgeTheme.warning
            }
          >
            {isComplete ? 'Session scored' : 'Not scored'}
          </StatusBadge>
          <span
            className="text-sm text-gray-600 tabular-nums"
            data-cy={`evaluation-session-total-${sessionKey}`}
          >
            Total{' '}
            <span
              className={`font-bold ${
                sessionTotal === sessionMaxWeight && sessionMaxWeight > 0
                  ? 'text-green-700'
                  : 'text-gray-800'
              }`}
            >
              {sessionTotal} / {sessionMaxWeight || 100}
            </span>
          </span>
          {!isComplete && onEvaluate ? (
            <Button
              type="primary"
              size="small"
              onClick={onEvaluate}
              icon={<PlayArrowOutlinedIcon style={{ fontSize: 16 }} />}
              className="inline-flex items-center"
              data-cy={`start-evaluation-btn-${sessionKey}`}
            >
              Evaluate
            </Button>
          ) : null}
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={criteria}
        rowKey="key"
        pagination={false}
        size="small"
        rowClassName={(_, index) =>
          index % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]'
        }
        data-cy={`evaluation-session-table-${sessionKey}`}
      />
    </div>
  );
};

export interface EvaluatorContainerProps {
  evaluatorId: string;
  evaluatorName: string;
  sessionCount: number;
  pendingSessionCount: number;
  children: React.ReactNode;
}

/** Large white container for an evaluator; successor tables live inside. */
export const EvaluatorContainer: React.FC<EvaluatorContainerProps> = ({
  evaluatorId,
  evaluatorName,
  sessionCount,
  pendingSessionCount,
  children,
}) => (
  <div
    className="rounded-lg border border-[#D9D9D9] bg-white p-4 sm:p-5 flex flex-col gap-4"
    data-cy={`evaluator-group-${evaluatorId}`}
  >
    <div
      className="pb-3 border-b border-[#E5E7EB]"
      data-cy={`evaluator-group-header-${evaluatorId}`}
    >
      <PersonIdentity
        role="Evaluator"
        name={evaluatorName}
        caption={`${sessionCount} successor${sessionCount === 1 ? '' : 's'}${
          pendingSessionCount > 0 ? ` · ${pendingSessionCount} pending` : ''
        }`}
        avatarSize={40}
      />
    </div>
    <div
      className="flex flex-col gap-3"
      data-cy={`evaluator-sessions-${evaluatorId}`}
    >
      {children}
    </div>
  </div>
);
