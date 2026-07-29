'use client';
import React, { useMemo, useState } from 'react';
import { Avatar, Button, Empty, Input, Tag } from 'antd';
import { SearchOutlined, UserOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import PlayArrowOutlinedIcon from '@mui/icons-material/PlayArrowOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import StatusBadge, {
  StatusBadgeTheme,
} from '@/components/common/statusBadge/statusBadge';
import { CriticalRole } from '../criticalRoleModal';
import { CompetencyImportance } from '../steps/stepCompetencyDefinition';
import {
  scoreAchievementPercent,
  sumWeightedScores,
} from '../steps/stepEvaluatorAssignment';

export interface EvaluatorAssignmentRow {
  key: string;
  evaluatorId: string;
  evaluatorName: string;
  roleId: string;
  roleName: string;
  department: string;
  successorId: string;
  successorName: string;
  successorJobTitle?: string;
  competencyName: string;
  category: string;
  importance: CompetencyImportance;
  weight?: number;
  status: 'Evaluated' | 'Pending';
  score?: number;
}

/** One evaluation session = evaluator scores a successor for a role (1+ criteria) */
export interface EvaluationSession {
  key: string;
  evaluatorId: string;
  evaluatorName: string;
  roleId: string;
  roleName: string;
  department: string;
  successorId: string;
  successorName: string;
  successorJobTitle?: string;
  criteria: EvaluatorAssignmentRow[];
  pendingCount: number;
  evaluatedCount: number;
}

interface EvaluatorGroup {
  evaluatorId: string;
  evaluatorName: string;
  sessions: EvaluationSession[];
  pendingCount: number;
  evaluatedCount: number;
}

interface EvaluatorsViewProps {
  roles: CriticalRole[];
}

const importanceColor: Record<CompetencyImportance, string> = {
  Required: 'red',
  Preferred: 'blue',
  'Nice to Have': 'default',
};

const getScoreBadgeClass = (score: number) => {
  if (score >= 80) return 'bg-green-50 border-green-200 text-green-700';
  if (score >= 60) return 'bg-amber-50 border-amber-200 text-amber-700';
  return 'bg-red-50 border-red-200 text-red-700';
};

/** Flatten role → successor → competencyEvaluations into evaluator-centric rows */
export const buildEvaluatorAssignments = (
  roles: CriticalRole[],
): EvaluatorAssignmentRow[] => {
  const rows: EvaluatorAssignmentRow[] = [];

  roles.forEach((role) => {
    (role.successors ?? []).forEach((successor) => {
      (successor.competencyEvaluations ?? []).forEach((evaluation, index) => {
        if (!evaluation.evaluatorId) return;
        rows.push({
          key: `${role.id}-${successor.id}-${index}-${evaluation.evaluatorId}`,
          evaluatorId: evaluation.evaluatorId,
          evaluatorName: evaluation.evaluatorName || 'Unknown',
          roleId: role.id,
          roleName: role.roleName,
          department: role.department,
          successorId: successor.id,
          successorName: successor.name,
          successorJobTitle: successor.jobTitle,
          competencyName: evaluation.competencyName,
          category: evaluation.category,
          importance: evaluation.importance,
          weight: evaluation.weight,
          status: evaluation.status ?? 'Pending',
          score: evaluation.score,
        });
      });
    });
  });

  return rows;
};

export const buildEvaluationSessions = (
  rows: EvaluatorAssignmentRow[],
): EvaluationSession[] => {
  const bySession = new Map<string, EvaluationSession>();

  rows.forEach((row) => {
    const sessionKey = `${row.evaluatorId}::${row.roleId}::${row.successorId}`;
    const existing = bySession.get(sessionKey);
    if (existing) {
      existing.criteria.push(row);
      if (row.status === 'Pending') existing.pendingCount += 1;
      else existing.evaluatedCount += 1;
    } else {
      bySession.set(sessionKey, {
        key: sessionKey,
        evaluatorId: row.evaluatorId,
        evaluatorName: row.evaluatorName,
        roleId: row.roleId,
        roleName: row.roleName,
        department: row.department,
        successorId: row.successorId,
        successorName: row.successorName,
        successorJobTitle: row.successorJobTitle,
        criteria: [row],
        pendingCount: row.status === 'Pending' ? 1 : 0,
        evaluatedCount: row.status === 'Evaluated' ? 1 : 0,
      });
    }
  });

  return Array.from(bySession.values());
};

export const evaluationPagePath = (
  roleId: string,
  successorId: string,
  evaluatorId: string,
) =>
  `/employees/succession-planning/evaluate/${roleId}/${successorId}?evaluatorId=${encodeURIComponent(evaluatorId)}`;

const EvaluatorsView: React.FC<EvaluatorsViewProps> = ({ roles }) => {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'Pending' | 'Evaluated'
  >('all');

  const allRows = useMemo(() => buildEvaluatorAssignments(roles), [roles]);

  const groups = useMemo(() => {
    const q = searchValue.trim().toLowerCase();
    const filteredRows = allRows.filter((row) => {
      const matchesSearch =
        !q ||
        row.evaluatorName.toLowerCase().includes(q) ||
        row.successorName.toLowerCase().includes(q) ||
        row.roleName.toLowerCase().includes(q) ||
        row.competencyName.toLowerCase().includes(q) ||
        row.department.toLowerCase().includes(q);
      return matchesSearch;
    });

    let sessions = buildEvaluationSessions(filteredRows);

    if (statusFilter === 'Pending') {
      sessions = sessions.filter((s) => s.pendingCount > 0);
    } else if (statusFilter === 'Evaluated') {
      sessions = sessions.filter(
        (s) => s.pendingCount === 0 && s.evaluatedCount > 0,
      );
    }

    const byEvaluator = new Map<string, EvaluatorGroup>();
    sessions.forEach((session) => {
      const existing = byEvaluator.get(session.evaluatorId);
      if (existing) {
        existing.sessions.push(session);
        existing.pendingCount += session.pendingCount;
        existing.evaluatedCount += session.evaluatedCount;
      } else {
        byEvaluator.set(session.evaluatorId, {
          evaluatorId: session.evaluatorId,
          evaluatorName: session.evaluatorName,
          sessions: [session],
          pendingCount: session.pendingCount,
          evaluatedCount: session.evaluatedCount,
        });
      }
    });

    return Array.from(byEvaluator.values()).sort((a, b) =>
      a.evaluatorName.localeCompare(b.evaluatorName),
    );
  }, [allRows, searchValue, statusFilter]);

  const openEvaluation = (session: EvaluationSession) => {
    router.push(
      evaluationPagePath(
        session.roleId,
        session.successorId,
        session.evaluatorId,
      ),
    );
  };

  return (
    <div className="flex flex-col gap-4" data-cy="evaluators-view">
      <p className="text-sm text-gray-500 -mt-1 hidden sm:block" data-cy="evaluators-view-intro">
        Evaluators score successors against the competencies they were assigned.
        Start an evaluation to enter scores; results appear here after
        submission.
      </p>

      <div
        className="flex justify-between gap-3 items-start"
        data-cy="evaluators-view-filters"
      >
        <Input
          placeholder="Search evaluator, successor, role, or competency"
          allowClear
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="w-[min(100%,300px)] h-10 sm:h-8 pr-0 py-0"
          data-cy="evaluators-view-search"
          suffix={
            <div className="text-gray-400 border-l border-gray-300 py-1 px-2">
              <SearchOutlined />
            </div>
          }
        />
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {(['all', 'Pending', 'Evaluated'] as const).map((status) => {
            const active = statusFilter === status;
            return (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`px-2.5 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm border transition-colors ${
                  active
                    ? 'bg-[#1E40AF] text-white border-[#1E40AF]'
                    : 'bg-white text-gray-600 border-[#D9D9D9] hover:border-[#1E40AF]'
                }`}
                data-cy={`evaluators-status-filter-${status}`}
              >
                {status === 'all' ? 'All' : status}
              </button>
            );
          })}
        </div>
      </div>

      {groups.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <span className="text-gray-400 text-sm" data-cy="evaluators-empty">
              No evaluator assignments yet. Assign evaluators when adding a
              critical role.
            </span>
          }
        />
      ) : (
        <div className="flex flex-col gap-4" data-cy="evaluators-group-list">
          {groups.map((group) => (
            <div
              key={group.evaluatorId}
              className="rounded-lg border border-[#D9D9D9] overflow-hidden bg-white"
              data-cy={`evaluator-group-${group.evaluatorId}`}
            >
              <div
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-[#F8FAFC] border-b border-[#E5E7EB]"
                data-cy={`evaluator-group-header-${group.evaluatorId}`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar
                    size={36}
                    icon={<UserOutlined />}
                    style={{ backgroundColor: '#1E40AF' }}
                    className="shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-gray-800 truncate">
                      {group.evaluatorName}
                    </div>
                    <div className="text-xs text-gray-500">
                      {group.sessions.length} evaluation
                      {group.sessions.length === 1 ? '' : 's'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                    {group.pendingCount} Pending
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                    {group.evaluatedCount} Evaluated
                  </span>
                </div>
              </div>

              <div
                className="flex flex-col divide-y divide-[#F0F0F0]"
                data-cy={`evaluator-sessions-${group.evaluatorId}`}
              >
                {group.sessions.map((session) => {
                  const isComplete =
                    session.pendingCount === 0 && session.evaluatedCount > 0;
                  const sessionTotal = sumWeightedScores(session.criteria);
                  const sessionMaxWeight = session.criteria.reduce(
                    (sum, c) => sum + Number(c.weight ?? 0),
                    0,
                  );
                  return (
                    <div
                      key={session.key}
                      className="px-4 py-4 flex flex-col gap-3"
                      data-cy={`evaluation-session-${session.key}`}
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-gray-800">
                            {session.successorName}
                          </span>
                          <StatusBadge
                            theme={
                              isComplete
                                ? StatusBadgeTheme.success
                                : StatusBadgeTheme.warning
                            }
                          >
                            {isComplete ? 'Evaluated' : 'Pending'}
                          </StatusBadge>
                        </div>
                        <div className="text-xs text-gray-500">
                          {session.successorJobTitle
                            ? `${session.successorJobTitle} · `
                            : ''}
                          Successor for{' '}
                          <button
                            type="button"
                            className="font-medium text-gray-700 hover:text-primary"
                            onClick={() =>
                              router.push(
                                `/employees/succession-planning/${session.roleId}`,
                              )
                            }
                          >
                            {session.roleName}
                          </button>
                          <span className="text-gray-400">
                            {' '}
                            · {session.department}
                          </span>
                        </div>
                      </div>

                      <div className="rounded-md border border-[#E5E7EB] overflow-x-auto">
                        <div className="min-w-[520px]">
                          <div className="grid grid-cols-[1fr_80px_120px_100px_80px] gap-2 px-3 py-2 bg-[#FAFAFA] border-b border-[#E5E7EB]">
                            <span className="text-xs font-bold text-[#4d4d4d] uppercase tracking-wide">
                              Competency
                            </span>
                            <span className="text-xs font-bold text-[#4d4d4d] uppercase tracking-wide">
                              Weight
                            </span>
                            <span className="text-xs font-bold text-[#4d4d4d] uppercase tracking-wide">
                              Importance
                            </span>
                            <span className="text-xs font-bold text-[#4d4d4d] uppercase tracking-wide">
                              Status
                            </span>
                            <span className="text-xs font-bold text-[#4d4d4d] uppercase tracking-wide">
                              Result
                            </span>
                          </div>
                          {session.criteria.map((criterion) => (
                            <div
                              key={criterion.key}
                              className="grid grid-cols-[1fr_80px_120px_100px_80px] gap-2 items-center px-3 py-2.5 border-t border-[#F0F0F0] first:border-t-0"
                              data-cy={`evaluation-criterion-row-${criterion.key}`}
                            >
                              <div className="min-w-0">
                                <div className="text-sm text-gray-800 truncate">
                                  {criterion.competencyName}
                                </div>
                                <div className="text-xs text-gray-400">
                                  {criterion.category}
                                </div>
                              </div>
                              <div className="text-sm text-[#4d4d4d] tabular-nums">
                                {criterion.weight != null
                                  ? `${criterion.weight}%`
                                  : '—'}
                              </div>
                              <div>
                                <Tag
                                  color={
                                    importanceColor[criterion.importance] ??
                                    'default'
                                  }
                                  className="m-0"
                                >
                                  {criterion.importance}
                                </Tag>
                              </div>
                              <div>
                                <span
                                  className={`text-xs font-medium ${
                                    criterion.status === 'Evaluated'
                                      ? 'text-green-700'
                                      : 'text-amber-700'
                                  }`}
                                >
                                  {criterion.status}
                                </span>
                              </div>
                              <div>
                                {criterion.status === 'Evaluated' &&
                                criterion.score != null ? (
                                  <span
                                    className={`inline-flex items-center px-2 py-0.5 rounded border text-sm font-semibold tabular-nums ${getScoreBadgeClass(
                                      scoreAchievementPercent(
                                        criterion.score,
                                        criterion.weight ?? 0,
                                      ),
                                    )}`}
                                  >
                                    {criterion.score}
                                    {criterion.weight != null
                                      ? ` / ${criterion.weight}`
                                      : ''}
                                  </span>
                                ) : (
                                  <span className="text-sm text-gray-400">—</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div
                        className="flex flex-wrap items-center justify-between gap-3"
                        data-cy={`evaluation-session-actions-${session.key}`}
                      >
                        <div
                          className="text-sm text-gray-600"
                          data-cy={`evaluation-session-total-${session.key}`}
                        >
                          Total score:{' '}
                          <span
                            className={`font-bold tabular-nums ${
                              sessionTotal === sessionMaxWeight &&
                              sessionMaxWeight > 0
                                ? 'text-green-700'
                                : 'text-gray-800'
                            }`}
                          >
                            {sessionTotal} / {sessionMaxWeight || 100}
                          </span>
                        </div>
                        <Button
                          type={isComplete ? 'default' : 'primary'}
                          onClick={() => openEvaluation(session)}
                          icon={
                            isComplete ? (
                              <VisibilityOutlinedIcon
                                style={{ fontSize: 16 }}
                              />
                            ) : (
                              <PlayArrowOutlinedIcon style={{ fontSize: 16 }} />
                            )
                          }
                          className="inline-flex items-center"
                          data-cy={`start-evaluation-btn-${session.key}`}
                        >
                          {isComplete
                            ? 'View / Edit Evaluation'
                            : 'Start Evaluation'}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EvaluatorsView;
