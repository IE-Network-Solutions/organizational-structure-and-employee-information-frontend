import type { CriticalRole } from './criticalRoleModal';
import type { SuccessorReadiness } from './successionTypes';
import {
  buildEvaluationSessions,
  type EvaluatorAssignmentRow,
} from './evaluatorsView';

/** Prefer live successors array; fall back to stored count only if array missing. */
export const roleSuccessorCount = (role: CriticalRole): number => {
  if (Array.isArray(role.successors)) return role.successors.length;
  return Number(role.successorCount ?? 0);
};

export const computeCriticalRoleKpis = (roles: CriticalRole[]) => {
  const totalRoles = roles.length;
  const positionsWithSuccessors = roles.filter(
    (role) => roleSuccessorCount(role) > 0,
  ).length;
  const positionsWithoutSuccessors = roles.filter(
    (role) => roleSuccessorCount(role) === 0,
  ).length;

  const allSuccessors = roles.flatMap((role) => role.successors ?? []);

  const readyNowCount = allSuccessors.filter(
    (successor) => successor.readiness === 'Ready Now',
  ).length;

  /** Pipeline ready in ≤1 year, excluding Ready Now (shown separately). */
  const readyWithinOneYearReadiness: SuccessorReadiness[] = [
    'Ready within 6 Months',
    'Ready within 1 Year',
  ];
  const readyWithinOneYearCount = allSuccessors.filter(
    (successor) =>
      successor.readiness != null &&
      readyWithinOneYearReadiness.includes(successor.readiness),
  ).length;

  const successionCoveragePercent =
    totalRoles > 0
      ? Math.round((positionsWithSuccessors / totalRoles) * 100)
      : 0;

  return {
    totalRoles,
    positionsWithSuccessors,
    positionsWithoutSuccessors,
    readyNowCount,
    readyWithinOneYearCount,
    successionCoveragePercent,
    totalSuccessors: allSuccessors.length,
  };
};

export const computeEvaluatorKpis = (assignments: EvaluatorAssignmentRow[]) => {
  const sessions = buildEvaluationSessions(assignments);
  const uniqueEvaluatorCount = new Set(
    assignments.map((row) => row.evaluatorId),
  ).size;
  const pendingEvaluationCount = sessions.filter(
    (session) => session.pendingCount > 0,
  ).length;
  const completedEvaluationCount = sessions.filter(
    (session) => session.pendingCount === 0 && session.evaluatedCount > 0,
  ).length;
  const evaluationCompletionPercent =
    sessions.length > 0
      ? Math.round((completedEvaluationCount / sessions.length) * 100)
      : 0;

  return {
    sessionCount: sessions.length,
    uniqueEvaluatorCount,
    pendingEvaluationCount,
    completedEvaluationCount,
    evaluationCompletionPercent,
  };
};
