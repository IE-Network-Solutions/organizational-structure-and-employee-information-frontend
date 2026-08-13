import { useMutation, useQueryClient } from 'react-query';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import {
  CreateBlueprintInput,
  UpdateBlueprintInput,
} from '@/types/timesheet/workSchedule';
import {
  adminRespondToSwap,
  assignEmployees,
  createBlueprint,
  createSwapRequest,
  deleteBlueprint,
  MockWorkScheduleError,
  peerRespondToSwap,
  resetMockWorkScheduleDb,
  unassignEmployee,
  updateBlueprint,
  updateInstance,
} from './mockService';

const invalidateWorkSchedule = (
  queryClient: ReturnType<typeof useQueryClient>,
) => {
  queryClient.invalidateQueries({
    predicate: (query) =>
      typeof query.queryKey[0] === 'string' &&
      String(query.queryKey[0]).startsWith('workSchedule'),
  });
};

const notifyError = (error: unknown) => {
  const message =
    error instanceof MockWorkScheduleError
      ? error.message
      : 'Something went wrong. Please try again.';
  NotificationMessage.error({
    message:
      error instanceof MockWorkScheduleError
        ? error.code.replace(/_/g, ' ')
        : 'Error',
    description: message,
  });
};

export const useCreateBlueprint = () => {
  const queryClient = useQueryClient();
  return useMutation((input: CreateBlueprintInput) => createBlueprint(input), {
    onSuccess: () => {
      invalidateWorkSchedule(queryClient);
      NotificationMessage.success({
        message: 'Work schedule created',
        description: 'Work schedule was created successfully.',
      });
    },
    onError: notifyError,
  });
};

export const useUpdateBlueprint = () => {
  const queryClient = useQueryClient();
  return useMutation(
    (params: { id: string; input: UpdateBlueprintInput }) =>
      updateBlueprint(params.id, params.input),
    {
      onSuccess: () => {
        invalidateWorkSchedule(queryClient);
        NotificationMessage.success({
          message: 'Work schedule updated',
          description: 'Work schedule was updated successfully.',
        });
      },
      onError: notifyError,
    },
  );
};

export const useDeleteBlueprint = () => {
  const queryClient = useQueryClient();
  return useMutation((id: string) => deleteBlueprint(id), {
    onSuccess: () => {
      invalidateWorkSchedule(queryClient);
      NotificationMessage.success({
        message: 'Work schedule deleted',
        description: 'Work schedule was deleted successfully.',
      });
    },
    onError: notifyError,
  });
};

export const useAssignEmployees = () => {
  const queryClient = useQueryClient();
  return useMutation(assignEmployees, {
    onSuccess: (created) => {
      invalidateWorkSchedule(queryClient);
      NotificationMessage.success({
        message: 'Employees assigned',
        description:
          created.length > 0
            ? `${created.length} employee(s) assigned to the blueprint.`
            : 'Selected employees were already assigned.',
      });
    },
    onError: notifyError,
  });
};

export const useUnassignEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation(
    (params: { blueprintId: string; userId: string }) =>
      unassignEmployee(params.blueprintId, params.userId),
    {
      onSuccess: () => {
        invalidateWorkSchedule(queryClient);
        NotificationMessage.success({
          message: 'Employee unassigned',
          description:
            'Future unswapped shifts for this assignment were cancelled.',
        });
      },
      onError: notifyError,
    },
  );
};

export const useUpdateShiftInstance = () => {
  const queryClient = useQueryClient();
  return useMutation(
    (params: {
      id: string;
      input: {
        startTime?: string;
        endTime?: string;
        assignedUserId?: string;
        isCancelled?: boolean;
        shiftType?: import('@/types/timesheet/workSchedule').ShiftType;
      };
    }) => updateInstance(params.id, params.input),
    {
      onSuccess: () => {
        invalidateWorkSchedule(queryClient);
        NotificationMessage.success({
          message: 'Shift updated',
          description: 'Shift instance was updated successfully.',
        });
      },
      onError: notifyError,
    },
  );
};

export const useCreateSwapRequest = () => {
  const queryClient = useQueryClient();
  return useMutation(createSwapRequest, {
    onSuccess: () => {
      invalidateWorkSchedule(queryClient);
      NotificationMessage.success({
        message: 'Swap requested',
        description: 'The peer will review this swap request.',
      });
    },
    onError: notifyError,
  });
};

export const usePeerRespondToSwap = () => {
  const queryClient = useQueryClient();
  return useMutation(
    (params: { id: string; accept: boolean; actorUserId: string }) =>
      peerRespondToSwap(params.id, params.accept, params.actorUserId),
    {
      onSuccess: (unusedResult, variables) => {
        invalidateWorkSchedule(queryClient);
        NotificationMessage.success({
          message: variables.accept ? 'Swap accepted' : 'Swap rejected',
          description: variables.accept
            ? 'The request was sent to admin approval.'
            : 'The swap request was rejected.',
        });
      },
      onError: notifyError,
    },
  );
};

export const useAdminRespondToSwap = () => {
  const queryClient = useQueryClient();
  return useMutation(
    (params: { id: string; accept: boolean; rejectionReason?: string }) =>
      adminRespondToSwap(params.id, params.accept, params.rejectionReason),
    {
      onSuccess: (unusedResult, variables) => {
        invalidateWorkSchedule(queryClient);
        NotificationMessage.success({
          message: variables.accept ? 'Swap approved' : 'Swap rejected',
          description: variables.accept
            ? 'Shift owners were swapped successfully.'
            : 'The swap request was rejected.',
        });
      },
      onError: notifyError,
    },
  );
};

export const useResetMockWorkSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation(() => resetMockWorkScheduleDb(), {
    onSuccess: () => {
      invalidateWorkSchedule(queryClient);
      NotificationMessage.success({
        message: 'Demo data reset',
        description: 'Mock work schedule data was restored to the seed.',
      });
    },
    onError: notifyError,
  });
};
