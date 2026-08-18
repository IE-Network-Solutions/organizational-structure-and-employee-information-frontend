'use client';
import React, { useState } from 'react';
import { Button, Tag } from 'antd';
import ExpandMoreOutlinedIcon from '@mui/icons-material/ExpandMoreOutlined';
import { PersonIdentity } from './personRoleChrome';
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
      <div className="text-sm font-medium text-primary group-hover:underline truncate">
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

export interface EvaluationSessionRowProps {
  sessionKey: string;
  successorName: string;
  successorJobTitle?: string;
  roleName: string;
  department: string;
  isComplete: boolean;
  criteriaCount: number;
  evaluatedCount: number;
  canOpen?: boolean;
  onOpen: () => void;
  onRoleClick?: () => void;
}

/**
 * One-line successor assignment. Used inside evaluator groups so a long
 * queue stays a list, not a wall of tiles.
 */
export const EvaluationSessionRow: React.FC<EvaluationSessionRowProps> = ({
  sessionKey,
  successorName,
  successorJobTitle,
  roleName,
  department,
  isComplete,
  criteriaCount,
  evaluatedCount,
  canOpen = true,
  onOpen,
  onRoleClick,
}) => (
  <div
    role={canOpen ? 'button' : undefined}
    tabIndex={canOpen ? 0 : undefined}
    className={`flex items-center gap-3 px-4 py-2.5 ${
      canOpen
        ? 'cursor-pointer hover:bg-[#F8FAFC]'
        : 'cursor-default opacity-80'
    }`}
    onClick={canOpen ? onOpen : undefined}
    onKeyDown={(event) => {
      if (!canOpen) return;
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onOpen();
      }
    }}
    data-cy={`evaluation-session-row-${sessionKey}`}
  >
    <PersonIdentity
      role="Successor"
      name={successorName}
      caption={
        <span className="text-xs text-gray-500">
          {successorJobTitle ? `${successorJobTitle} · ` : ''}
          {onRoleClick ? (
            <button
              type="button"
              className="font-medium text-gray-700 hover:text-primary"
              onClick={(e) => {
                e.stopPropagation();
                onRoleClick();
              }}
              data-cy={`evaluation-session-role-link-${sessionKey}`}
            >
              {roleName}
            </button>
          ) : (
            <span className="font-medium text-gray-700">{roleName}</span>
          )}
          <span className="text-gray-400"> · {department}</span>
        </span>
      }
      avatarSize={28}
      className="min-w-0 flex-1"
    />

    <span
      className="hidden sm:block text-xs text-gray-500 tabular-nums shrink-0"
      data-cy={`evaluation-session-progress-${sessionKey}`}
    >
      {criteriaCount > 0
        ? `${evaluatedCount} of ${criteriaCount}`
        : 'No criteria'}
    </span>

    {isComplete ? (
      <Tag
        color="green"
        className="m-0 shrink-0"
        data-cy={`evaluation-session-status-${sessionKey}`}
      >
        Scored
      </Tag>
    ) : (
      <Tag
        className="m-0 shrink-0"
        data-cy={`evaluation-session-status-${sessionKey}`}
      >
        Pending
      </Tag>
    )}

    {canOpen ? (
      <Button
        type="link"
        size="small"
        className="px-0 h-auto font-normal shrink-0 !text-primary hover:!text-primary"
        onClick={(e) => {
          e.stopPropagation();
          onOpen();
        }}
        data-cy={
          isComplete
            ? `review-evaluation-btn-${sessionKey}`
            : `start-evaluation-btn-${sessionKey}`
        }
      >
        {isComplete ? 'Review' : 'Evaluate'}
      </Button>
    ) : null}
  </div>
);

export interface EvaluatorContainerProps {
  evaluatorId: string;
  evaluatorName: string;
  sessionCount: number;
  pendingSessionCount: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

/** Collapsible evaluator row — summary first, assignments on demand. */
export const EvaluatorContainer: React.FC<EvaluatorContainerProps> = ({
  evaluatorId,
  evaluatorName,
  sessionCount,
  pendingSessionCount,
  defaultOpen = false,
  children,
}) => {
  const [open, setOpen] = useState(defaultOpen);
  const scoredCount = Math.max(0, sessionCount - pendingSessionCount);

  return (
    <div
      className="rounded-lg border border-[#D9D9D9] bg-white overflow-hidden"
      data-cy={`evaluator-group-${evaluatorId}`}
    >
      <button
        type="button"
        className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-[#F8FAFC]"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        data-cy={`evaluator-group-header-${evaluatorId}`}
      >
        <PersonIdentity
          role="Evaluator"
          name={evaluatorName}
          caption={`${sessionCount} successor${sessionCount === 1 ? '' : 's'}`}
          avatarSize={32}
          className="min-w-0 flex-1"
        />
        <div className="flex items-center gap-2 shrink-0">
          {pendingSessionCount > 0 ? (
            <Tag className="m-0" color="orange">
              {pendingSessionCount} pending
            </Tag>
          ) : null}
          {scoredCount > 0 ? (
            <Tag className="m-0" color="green">
              {scoredCount} scored
            </Tag>
          ) : null}
          <ExpandMoreOutlinedIcon
            className={`text-gray-400 transition-transform ${
              open ? 'rotate-180' : ''
            }`}
            fontSize="small"
          />
        </div>
      </button>
      {open ? (
        <div
          className="border-t border-[#E5E7EB] divide-y divide-[#F0F0F0]"
          data-cy={`evaluator-sessions-${evaluatorId}`}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
};
