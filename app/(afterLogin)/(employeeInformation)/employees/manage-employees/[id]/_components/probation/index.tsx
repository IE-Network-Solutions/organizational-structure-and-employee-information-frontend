'use client';
import React from 'react';
import { Button, Skeleton } from 'antd';
import ProbationTargetAccordion from './_components/probationTargetAccordion';
import { useFetchProbationTargetsByUserId } from '@/store/server/features/probation-target/queries';
import { useCreateProbationTarget } from '@/store/server/features/probation-target/mutation';
import {
  useDeleteProbationTask,
  useUpdateProbationTask,
} from '@/store/server/features/probation-task/mutation';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import AddIcon from '@mui/icons-material/Add';
import { useIsMobile } from '@/hooks/useIsMobile';

interface Ids {
  id: string;
}

const toSlug = (value: string | number | null | undefined) =>
  String(value ?? 'na')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const ProbationPage: React.FC<Ids> = ({ id }) => {
  const { userId } = useAuthenticationStore();
  // Fetch probation targets for the current user
  const {
    data: probationTargets,
    isLoading,
    error,
    refetch,
  } = useFetchProbationTargetsByUserId(id);
  const pageSlug = toSlug(id);
  const { isMobile } = useIsMobile();

  // Mutation hooks
  const { mutate: updateTaskMutation } = useUpdateProbationTask();
  const { mutate: deleteTaskMutation } = useDeleteProbationTask();

  const { mutate: createProbationTargetMutation, isLoading: isCreatingTarget } =
    useCreateProbationTarget();

  const handleUpdateTaskScore = (taskId: string, score: number | undefined) => {
    updateTaskMutation(
      {
        id: taskId,
        evaluationScore: score,
      },
      {
        onSuccess: () => {
          refetch();
        },
        onError: () => {
          NotificationMessage.error({ message: 'Failed to update task score' });
        },
      },
    );
  };

  const handleToggleTaskComplete = (taskId: string) => {
    // Find the task to check its current completion status
    const target = probationTargets?.find((pt) =>
      pt.probationTasks.some((task) => task.id === taskId),
    );
    const task = target?.probationTasks.find((task) => task.id === taskId);

    if (!task) {
      NotificationMessage.error({ message: 'Task not found' });
      return;
    }

    // Toggle completion by setting evaluationScore to "0.00" or "1.00"
    const isCurrentlyCompleted = task.isCompleted;
    const newScore = 0;

    updateTaskMutation(
      {
        id: taskId,
        isCompleted: !isCurrentlyCompleted,
        evaluationScore: newScore,
      },
      {
        onSuccess: () => {
          const action = isCurrentlyCompleted ? 'unmarked' : 'marked';
          NotificationMessage.success({
            message: `Task ${action} as completed`,
          });
          refetch();
        },
        onError: () => {
          NotificationMessage.error({
            message: 'Failed to update task completion status',
          });
        },
      },
    );
  };

  const handleTaskAdded = () => {
    // Refetch data after adding task
    refetch();
  };

  const handleDeleteTask = (taskId: string) => {
    deleteTaskMutation(taskId, {
      onSuccess: () => {
        NotificationMessage.success({ message: 'Task deleted successfully' });
        refetch();
      },
      onError: () => {
        NotificationMessage.error({ message: 'Failed to delete task' });
      },
    });
  };

  const handleCreateProbationTarget = () => {
    // Create a new probation target with default values
    const newProbationTarget = {
      name: `Probation Target ${new Date().toLocaleDateString()}`,
      userId: id,
      totalScore: 0,
      createdBy: userId,
    };

    createProbationTargetMutation(newProbationTarget, {
      onError: () => {
        NotificationMessage.error({
          message: 'Failed to create probation target',
        });
      },
    });
  };

  if (isLoading) {
    return (
      <div
        className="flex justify-center items-center h-64"
        id={`probation-loading-state-${pageSlug}`}
        data-cy="probation-loading-state"
      >
        <Skeleton active data-cy="probation-loading-spinner" />
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="flex justify-center items-center h-64"
        id={`probation-error-state-${pageSlug}`}
        data-cy="probation-error-state"
      >
        <div
          className="text-lg text-red-500"
          id={`probation-error-message-${pageSlug}`}
          data-cy="probation-error-message"
        >
          Error loading probation targets:{' '}
          {error instanceof Error ? error.message : 'Unknown error'}
        </div>
      </div>
    );
  }

  const totalWeight = (probationTargets || []).reduce(
    (sum, pt) =>
      sum +
      pt.probationTasks.reduce(
        (tSum, t) =>
          tSum +
          (typeof t.weight === 'string'
            ? parseInt(t.weight, 10) || 0
            : (t.weight ?? 0)),
        0,
      ),
    0,
  );

  const weightColor =
    totalWeight === 100
      ? { bg: '#f6ffed', border: '#b7eb8f', text: '#389e0d' }
      : totalWeight > 100
        ? { bg: '#fff1f0', border: '#ffa39e', text: '#cf1322' }
        : { bg: '#fff7e6', border: '#ffd591', text: '#d46b08' };

  return (
    <div
      className="rounded-xl bg-[#F9FAFB]"
      id="probation-page-container"
      data-cy="probation-page-container"
    >
      {/* Header */}
      <div
        className="flex flex-wrap items-center justify-between gap-3 px-4 pt-4 pb-3"
        id="probation-create-target-wrapper"
        data-cy="probation-create-target-wrapper"
      >
        <div data-cy="probation-onboarding-tasks-title-wrapper">
          <p
            className="text-sm font-semibold text-gray-800 m-0"
            data-cy="probation-onboarding-tasks-title"
          >
            Probation Targets
          </p>
          <p
            className="text-xs text-gray-400 m-0 mt-0.5"
            data-cy="probation-onboarding-tasks-subtitle"
          >
            Track tasks and scores per probation target
          </p>
        </div>
        <div
          className="flex items-center gap-3"
          data-cy="probation-header-actions"
        >
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border"
            style={{
              background: weightColor.bg,
              borderColor: weightColor.border,
              color: weightColor.text,
            }}
            id="probation-total-weight"
            data-cy="probation-total-weight"
          >
            <span data-cy="probation-total-weight-label">Total Weight:</span>
            <strong data-cy="probation-total-weight-value">
              {totalWeight}
            </strong>
            {totalWeight !== 100 && (
              <span className="opacity-70" data-cy="probation-total-weight-max">
                / 100
              </span>
            )}
            {totalWeight === 100 && (
              <span data-cy="probation-total-weight-check">✓</span>
            )}
          </div>
          <AccessGuard
            permissions={[Permissions.CreateProbationTarget]}
            id="probation-create-target-guard"
            data-cy="probation-create-target-guard"
          >
            <Button
              type="primary"
              onClick={handleCreateProbationTarget}
              loading={isCreatingTarget}
              className="font-normal text-sm"
              id="probation-create-target-btn"
              data-cy="probation-create-target-btn"
              icon={<AddIcon />}
            >
              {!isMobile && 'Add Probation Target'}
            </Button>
          </AccessGuard>
        </div>
      </div>

      {/* Probation Target Accordion */}
      <div
        id="probation-accordion-wrapper"
        data-cy="probation-accordion-wrapper"
        className="px-4 pb-4"
      >
        <ProbationTargetAccordion
          probationTargets={probationTargets || []}
          employeeId={id}
          onUpdateTaskScore={handleUpdateTaskScore}
          onToggleTaskComplete={handleToggleTaskComplete}
          onTaskAdded={handleTaskAdded}
          onDeleteTask={handleDeleteTask}
          data-cy="probation-targets-card"
        />
      </div>
    </div>
  );
};

export default ProbationPage;
