'use client';
import React from 'react';
import { Button, Spin } from 'antd';
import { useIsMobile } from '@/hooks/useIsMobile';
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

interface Ids {
  id: string;
}

const ProbationPage: React.FC<Ids> = ({ id }) => {
  const { userId } = useAuthenticationStore();
  const { isMobile } = useIsMobile();

  // Fetch probation targets for the current user
  const {
    data: probationTargets,
    isLoading,
    error,
    refetch,
  } = useFetchProbationTargetsByUserId(id);

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
      <div className="flex justify-center items-center h-64">
        <Spin tip="Loading probation targets..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-red-500">
          Error loading probation targets:{' '}
          {error instanceof Error ? error.message : 'Unknown error'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Create Probation Target Button */}
      <div className="flex justify-end">
        <AccessGuard permissions={[Permissions.CreateProbationTarget]}>
          <Button
            type="primary"
            onClick={handleCreateProbationTarget}
            loading={isCreatingTarget}
            className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
          >
            Create Probation Target
          </Button>
        </AccessGuard>
      </div>

      {/* Probation Target Accordion */}
      <ProbationTargetAccordion
        probationTargets={probationTargets || []}
        employeeId={id}
        onUpdateTaskScore={handleUpdateTaskScore}
        onToggleTaskComplete={handleToggleTaskComplete}
        onTaskAdded={handleTaskAdded}
        onDeleteTask={handleDeleteTask}
      />
    </div>
  );
};

export default ProbationPage;
