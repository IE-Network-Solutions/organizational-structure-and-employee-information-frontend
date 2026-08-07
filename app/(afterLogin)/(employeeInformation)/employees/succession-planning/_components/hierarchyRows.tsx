'use client';
import React from 'react';
import { Button, Card, Tag } from 'antd';
import PlayArrowOutlinedIcon from '@mui/icons-material/PlayArrowOutlined';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
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

export interface EvaluationSessionCardProps {
  sessionKey: string;
  successorName: string;
  successorJobTitle?: string;
  roleName: string;
  department: string;
  isComplete: boolean;
  sessionTotal: number;
  sessionMaxWeight: number;
  criteriaCount: number;
  evaluatedCount: number;
  pendingCount: number;
  onOpen: () => void;
  onRoleClick?: () => void;
}

/**
 * Compact successor evaluation tile — same chrome as role-detail SuccessorSummaryCard.
 */
export const EvaluationSessionCard: React.FC<EvaluationSessionCardProps> = ({
  sessionKey,
  successorName,
  successorJobTitle,
  roleName,
  department,
  isComplete,
  sessionTotal,
  sessionMaxWeight,
  criteriaCount,
  evaluatedCount,
  pendingCount,
  onOpen,
  onRoleClick,
}) => {
  const maxWeight = sessionMaxWeight || 100;

  return (
    <Card
      hoverable
      bordered={false}
      className="rounded-lg border border-[#D9D9D9] bg-white h-full cursor-pointer shadow-none hover:border-primary"
      styles={{ body: { padding: 16 } }}
      onClick={onOpen}
      data-cy={`evaluation-session-card-${sessionKey}`}
    >
      <div className="flex flex-col gap-3 h-full">
        <PersonIdentity
          role="Successor"
          name={successorName}
          caption={
            <span className="text-xs text-gray-500">
              {successorJobTitle ? `${successorJobTitle} · ` : ''}
              For{' '}
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
          avatarSize={40}
        />

        <div className="flex flex-wrap items-center gap-1.5">
          <Tag
            className="m-0"
            color={isComplete ? 'green' : 'orange'}
            data-cy={`evaluation-session-status-${sessionKey}`}
          >
            {isComplete ? 'Session scored' : 'Not scored'}
          </Tag>
          {!isComplete && pendingCount > 0 ? (
            <Tag className="m-0" color="default">
              {pendingCount} pending
            </Tag>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1 border-t border-[#F0F0F0]">
          <div>
            <p className="text-sm text-[#bababa] font-normal m-0 mb-0.5">
              Score
            </p>
            <p
              className={`text-sm font-normal m-0 tabular-nums ${
                isComplete && sessionTotal === maxWeight && maxWeight > 0
                  ? 'text-green-700'
                  : 'text-[#4d4d4d]'
              }`}
              data-cy={`evaluation-session-total-${sessionKey}`}
            >
              {criteriaCount > 0 ? `${sessionTotal} / ${maxWeight}` : '—'}
            </p>
          </div>
          <div>
            <p className="text-sm text-[#bababa] font-normal m-0 mb-0.5">
              Criteria
            </p>
            <p className="text-sm font-normal text-[#4d4d4d] m-0 tabular-nums">
              {criteriaCount > 0
                ? `${evaluatedCount}/${criteriaCount}`
                : '—'}
            </p>
          </div>
        </div>

        {isComplete ? (
          <button
            type="button"
            className="mt-auto self-start inline-flex items-center gap-1 text-sm font-medium !text-primary hover:underline bg-transparent border-0 p-0 cursor-pointer"
            style={{ color: '#3636F0' }}
            onClick={(e) => {
              e.stopPropagation();
              onOpen();
            }}
            data-cy={`review-evaluation-btn-${sessionKey}`}
          >
            Review scores
            <ArrowForwardOutlinedIcon
              style={{ fontSize: 16, color: '#3636F0' }}
            />
          </button>
        ) : (
          <Button
            type="primary"
            size="small"
            className="mt-auto self-start h-8 font-normal inline-flex items-center gap-1"
            onClick={(e) => {
              e.stopPropagation();
              onOpen();
            }}
            data-cy={`start-evaluation-btn-${sessionKey}`}
          >
            <PlayArrowOutlinedIcon style={{ fontSize: 16 }} />
            Evaluate
          </Button>
        )}
      </div>
    </Card>
  );
};

export interface EvaluatorContainerProps {
  evaluatorId: string;
  evaluatorName: string;
  sessionCount: number;
  pendingSessionCount: number;
  children: React.ReactNode;
}

/** Evaluator header + tile grid for successor sessions. */
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
      className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
      data-cy={`evaluator-sessions-${evaluatorId}`}
    >
      {children}
    </div>
  </div>
);
