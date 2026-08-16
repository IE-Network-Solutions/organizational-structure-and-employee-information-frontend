'use client';
import React, { useMemo, useState } from 'react';
import { Button, Dropdown, Empty, Input, Segmented, Select, Tag } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import { useIsMobile } from '@/hooks/useIsMobile';
import EvaluationModal, { EvaluationModalTarget } from '../evaluationModal';
import { CriticalRole } from '../criticalRoleModal';
import { CompetencyImportance } from '../steps/stepCompetencyDefinition';
import { sumWeightedScores } from '../steps/stepEvaluatorAssignment';
import { EvaluationSessionCard, EvaluatorContainer } from '../hierarchyRows';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';

export type EvaluatorScope = 'admin' | 'mine';

export interface EvaluatorOption {
  id: string;
  name: string;
}

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
  scope: EvaluatorScope;
  onScopeChange: (scope: EvaluatorScope) => void;
  viewAsEvaluatorId: string;
  onViewAsChange: (evaluatorId: string) => void;
  evaluatorOptions: EvaluatorOption[];
}

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

const EvaluatorsView: React.FC<EvaluatorsViewProps> = ({
  roles,
  scope,
  onScopeChange,
  viewAsEvaluatorId,
  onViewAsChange,
  evaluatorOptions,
}) => {
  const router = useRouter();
  const { isMobile } = useIsMobile();
  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'Pending' | 'Evaluated'
  >('all');
  const [evaluatorFilter, setEvaluatorFilter] = useState('');
  const [successorFilter, setSuccessorFilter] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [evaluationTarget, setEvaluationTarget] =
    useState<EvaluationModalTarget | null>(null);

  const canViewAllEvaluations = AccessGuard.checkAccess({
    permissions: [Permissions.ViewSuccessionEvaluations],
  });
  // Without the tenant-wide permission the scope is pinned to the user's own.
  const isMine = scope === 'mine' || !canViewAllEvaluations;

  const allRows = useMemo(() => {
    const rows = buildEvaluatorAssignments(roles);
    if (!isMine || !viewAsEvaluatorId) return rows;
    return rows.filter((row) => row.evaluatorId === viewAsEvaluatorId);
  }, [roles, isMine, viewAsEvaluatorId]);

  const successorOptions = useMemo(() => {
    const byId = new Map<string, string>();
    allRows.forEach((row) => {
      if (!byId.has(row.successorId)) {
        byId.set(row.successorId, row.successorName);
      }
    });
    return Array.from(byId.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [allRows]);

  const activeFilters = useMemo(() => {
    const tags: Array<{ key: string; label: string; clear: () => void }> = [];
    if (statusFilter !== 'all') {
      tags.push({
        key: 'status',
        label: statusFilter === 'Pending' ? 'Not scored' : 'Scored',
        clear: () => setStatusFilter('all'),
      });
    }
    if (!isMine && evaluatorFilter) {
      const name =
        evaluatorOptions.find((e) => e.id === evaluatorFilter)?.name ??
        'Evaluator';
      tags.push({
        key: 'evaluator',
        label: name,
        clear: () => setEvaluatorFilter(''),
      });
    }
    if (successorFilter) {
      const name =
        successorOptions.find((e) => e.id === successorFilter)?.name ??
        'Successor';
      tags.push({
        key: 'successor',
        label: name,
        clear: () => setSuccessorFilter(''),
      });
    }
    return tags;
  }, [
    statusFilter,
    evaluatorFilter,
    successorFilter,
    isMine,
    evaluatorOptions,
    successorOptions,
  ]);

  const resetFilters = () => {
    setStatusFilter('all');
    setEvaluatorFilter('');
    setSuccessorFilter('');
  };

  const groups = useMemo(() => {
    const q = searchValue.trim().toLowerCase();
    const filteredRows = allRows.filter((row) => {
      const matchesSearch =
        !q ||
        (!isMine && row.evaluatorName.toLowerCase().includes(q)) ||
        row.successorName.toLowerCase().includes(q) ||
        row.roleName.toLowerCase().includes(q) ||
        row.competencyName.toLowerCase().includes(q) ||
        row.department.toLowerCase().includes(q);
      const matchesEvaluator =
        isMine || !evaluatorFilter || row.evaluatorId === evaluatorFilter;
      const matchesSuccessor =
        !successorFilter || row.successorId === successorFilter;
      return matchesSearch && matchesEvaluator && matchesSuccessor;
    });

    let sessions = buildEvaluationSessions(filteredRows);

    if (statusFilter === 'Pending') {
      sessions = sessions.filter((s) => s.pendingCount > 0);
    } else if (statusFilter === 'Evaluated') {
      sessions = sessions.filter(
        (s) => s.pendingCount === 0 && s.evaluatedCount > 0,
      );
    }

    if (isMine) {
      const pendingCount = sessions.reduce((n, s) => n + s.pendingCount, 0);
      const evaluatedCount = sessions.reduce((n, s) => n + s.evaluatedCount, 0);
      const name =
        evaluatorOptions.find((e) => e.id === viewAsEvaluatorId)?.name ??
        sessions[0]?.evaluatorName ??
        'You';
      return sessions.length
        ? [
            {
              evaluatorId: viewAsEvaluatorId || 'me',
              evaluatorName: name,
              sessions,
              pendingCount,
              evaluatedCount,
            },
          ]
        : [];
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
  }, [
    allRows,
    searchValue,
    statusFilter,
    evaluatorFilter,
    successorFilter,
    isMine,
    viewAsEvaluatorId,
    evaluatorOptions,
  ]);

  const openEvaluation = (session: EvaluationSession) => {
    setEvaluationTarget({
      roleId: session.roleId,
      successorId: session.successorId,
      evaluatorId: session.evaluatorId,
    });
  };

  const renderSessionCard = (session: EvaluationSession) => {
    const isComplete = session.pendingCount === 0 && session.evaluatedCount > 0;
    const sessionTotal = sumWeightedScores(session.criteria);
    const sessionMaxWeight = session.criteria.reduce(
      (sum, c) => sum + Number(c.weight ?? 0),
      0,
    );

    return (
      <EvaluationSessionCard
        key={session.key}
        sessionKey={session.key}
        successorName={session.successorName}
        successorJobTitle={session.successorJobTitle}
        roleName={session.roleName}
        department={session.department}
        isComplete={isComplete}
        sessionTotal={sessionTotal}
        sessionMaxWeight={sessionMaxWeight}
        criteriaCount={session.criteria.length}
        evaluatedCount={session.evaluatedCount}
        pendingCount={session.pendingCount}
        onOpen={() => openEvaluation(session)}
        onRoleClick={() =>
          router.push(`/employees/succession-planning/${session.roleId}`)
        }
      />
    );
  };

  return (
    <div className="flex flex-col gap-4" data-cy="evaluators-view">
      <div
        className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between"
        data-cy="evaluators-scope-row"
      >
        {/* "All evaluators" needs the tenant-wide permission; without it the
            toggle is not offered and the view stays on the user's own queue.
            The API enforces the same split via /evaluator-assignments/mine. */}
        {canViewAllEvaluations ? (
          <Segmented
            value={scope}
            onChange={(value) => onScopeChange(value as EvaluatorScope)}
            options={[
              { label: 'All evaluators', value: 'admin' },
              { label: 'My assignments', value: 'mine' },
            ]}
            data-cy="evaluators-scope-selector"
          />
        ) : (
          <span className="text-sm font-medium text-gray-700">
            My assignments
          </span>
        )}
        {isMine && (
          <div
            className="flex flex-wrap items-center gap-2"
            data-cy="evaluators-view-as"
          >
            <span className="text-xs text-gray-500 whitespace-nowrap">
              Viewing as
            </span>
            <Select
              value={viewAsEvaluatorId || undefined}
              onChange={onViewAsChange}
              placeholder="Select evaluator"
              className="min-w-[180px] w-full sm:w-[220px]"
              options={evaluatorOptions.map((e) => ({
                value: e.id,
                label: e.name,
              }))}
              data-cy="evaluators-view-as-select"
            />
          </div>
        )}
      </div>

      <p
        className="text-sm text-gray-500 -mt-1 hidden sm:block"
        data-cy="evaluators-view-intro"
      >
        {isMine
          ? 'Your assigned successor evaluations as tiles — open a card to score or review.'
          : 'Each evaluator groups their successor tiles — same layout as critical role detail.'}
      </p>

      <div
        className="flex justify-between gap-3 items-start"
        data-cy="evaluators-view-filters"
      >
        <Input
          placeholder={
            isMine
              ? 'Search successor, role, or competency'
              : 'Search evaluator, successor, role, or competency'
          }
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
        <div
          className="flex items-center gap-2 flex-wrap justify-end"
          data-cy="evaluators-active-filters"
        >
          {activeFilters.map((filter) => (
            <Tag
              key={filter.key}
              className="bg-white text-primary border-primary rounded-md px-3 h-6 flex items-center text-xs font-normal"
              data-cy={`evaluators-filter-tag-${filter.key}`}
            >
              <span
                onClick={filter.clear}
                className="text-primary hover:!text-[#FF8787] mr-2 text-lg leading-none cursor-pointer"
              >
                ×
              </span>
              {filter.label}
            </Tag>
          ))}

          <Dropdown
            placement="bottomRight"
            trigger={['click']}
            open={filterOpen}
            onOpenChange={setFilterOpen}
            dropdownRender={() => (
              <div
                className="bg-white rounded-lg border border-gray-200 min-w-[280px] sm:min-w-[320px] overflow-hidden shadow-md"
                data-cy="evaluators-filter-panel"
              >
                <div className="px-5 pt-4 pb-1">
                  <h3 className="text-base font-bold text-[#4d4d4d] m-0 mb-1">
                    Filter
                  </h3>
                  <p className="text-sm text-[#8c8c8c] m-0 font-normal">
                    Select all filters that apply
                  </p>
                </div>

                <div className="px-5 py-3 flex flex-col gap-3">
                  <div data-cy="evaluators-filter-status">
                    <label className="text-sm font-medium text-gray-800 mb-1.5 block">
                      Status
                    </label>
                    <Select
                      placeholder="Select status"
                      allowClear
                      className="w-full"
                      value={statusFilter === 'all' ? undefined : statusFilter}
                      onChange={(value) =>
                        setStatusFilter(
                          (value as 'Pending' | 'Evaluated') ?? 'all',
                        )
                      }
                      options={[
                        { value: 'Pending', label: 'Not scored' },
                        { value: 'Evaluated', label: 'Scored' },
                      ]}
                      data-cy="evaluators-filter-status-select"
                    />
                  </div>

                  {!isMine && (
                    <div data-cy="evaluators-filter-evaluator">
                      <label className="text-sm font-medium text-gray-800 mb-1.5 block">
                        Evaluator
                      </label>
                      <Select
                        placeholder="Select evaluator"
                        allowClear
                        showSearch
                        optionFilterProp="label"
                        className="w-full"
                        value={evaluatorFilter || undefined}
                        onChange={(value) => setEvaluatorFilter(value ?? '')}
                        options={evaluatorOptions.map((e) => ({
                          value: e.id,
                          label: e.name,
                        }))}
                        data-cy="evaluators-filter-evaluator-select"
                      />
                    </div>
                  )}

                  <div data-cy="evaluators-filter-successor">
                    <label className="text-sm font-medium text-gray-800 mb-1.5 block">
                      Successor
                    </label>
                    <Select
                      placeholder="Select successor"
                      allowClear
                      showSearch
                      optionFilterProp="label"
                      className="w-full"
                      value={successorFilter || undefined}
                      onChange={(value) => setSuccessorFilter(value ?? '')}
                      options={successorOptions.map((s) => ({
                        value: s.id,
                        label: s.name,
                      }))}
                      data-cy="evaluators-filter-successor-select"
                    />
                  </div>
                </div>

                <div className="px-5 py-3 flex justify-end gap-2 border-t border-gray-200">
                  <Button
                    onClick={resetFilters}
                    className="h-8 border border-[#D9D9D9] text-sm font-normal text-[#4d4d4d]"
                    data-cy="evaluators-filter-reset"
                  >
                    Reset
                  </Button>
                  <Button
                    type="primary"
                    className="h-8 font-normal text-sm"
                    onClick={() => setFilterOpen(false)}
                    data-cy="evaluators-filter-apply"
                  >
                    Save Filter
                  </Button>
                </div>
              </div>
            )}
          >
            <Button
              type="default"
              className="border border-[#D9D9D9] font-normal text-[#4d4d4d] h-10 sm:h-8"
              icon={<FilterAltOutlinedIcon className="py-1" />}
              data-cy="evaluators-filter-toggle-btn"
            >
              {!isMobile && 'Filter'}
            </Button>
          </Dropdown>
        </div>
      </div>

      {groups.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <span className="text-gray-400 text-sm" data-cy="evaluators-empty">
              {isMine
                ? viewAsEvaluatorId
                  ? 'No assignments for this evaluator yet.'
                  : 'Select an evaluator to view their assignments.'
                : 'No evaluator assignments yet. Assign evaluators when adding a critical role.'}
            </span>
          }
        />
      ) : isMine ? (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
          data-cy="evaluators-my-sessions"
        >
          {(groups[0]?.sessions ?? []).map((session) =>
            renderSessionCard(session),
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-4" data-cy="evaluators-group-list">
          {groups.map((group) => {
            const pendingSessions = group.sessions.filter(
              (s) => s.pendingCount > 0,
            ).length;
            return (
              <EvaluatorContainer
                key={group.evaluatorId}
                evaluatorId={group.evaluatorId}
                evaluatorName={group.evaluatorName}
                sessionCount={group.sessions.length}
                pendingSessionCount={pendingSessions}
              >
                {group.sessions.map((session) => renderSessionCard(session))}
              </EvaluatorContainer>
            );
          })}
        </div>
      )}

      <EvaluationModal
        open={evaluationTarget !== null}
        target={evaluationTarget}
        onClose={() => setEvaluationTarget(null)}
      />
    </div>
  );
};

export default EvaluatorsView;
