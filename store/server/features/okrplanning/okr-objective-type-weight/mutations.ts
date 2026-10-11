import NotificationMessage from '@/components/common/notification/notificationMessage';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { OKR_AND_PLANNING_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { getCurrentToken } from '@/utils/getCurrentToken';
import { useMutation, useQueryClient } from 'react-query';
import {
  OkrObjectiveTypeWeightAssignment,
  UpsertOkrObjectiveTypeWeightDto,
} from './interface';

export const upsertObjectiveTypeWeights = async (
  dto: UpsertOkrObjectiveTypeWeightDto,
): Promise<OkrObjectiveTypeWeightAssignment> => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  try {
    const response = (await crudRequest({
      url: `${OKR_AND_PLANNING_URL}/okr-objective-type-weights`,
      method: 'PUT',
      data: {
        ...dto,
        scopeId: dto.scopeId ?? null,
      },
      headers: {
        Authorization: `Bearer ${token}`,
        tenantId: tenantId,
      },
    })) as OkrObjectiveTypeWeightAssignment;

    NotificationMessage.success({
      message: 'Weights Saved',
      description: 'Objective type weights have been saved successfully.',
    });

    return response;
  } catch (error: any) {
    NotificationMessage.error({
      message: 'Failed to Save Weights',
      description:
        error?.response?.data?.message ||
        error?.message ||
        'Failed to save objective type weights.',
    });
    throw error;
  }
};

export const useUpsertObjectiveTypeWeights = () => {
  const queryClient = useQueryClient();
  return useMutation(upsertObjectiveTypeWeights, {
    // The request function already shows the error; skip the global toast.
    onError: () => undefined,
    onSuccess: () => {
      queryClient.invalidateQueries('objectiveTypeWeightAssignments');
      queryClient.invalidateQueries('effectiveObjectiveTypeWeights');
    },
  });
};

export const deleteObjectiveTypeWeightAssignment = async (
  id: string,
): Promise<{ id: string }> => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  try {
    const response = (await crudRequest({
      url: `${OKR_AND_PLANNING_URL}/okr-objective-type-weights/${id}`,
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        tenantId: tenantId,
      },
    })) as { id: string };

    NotificationMessage.success({
      message: 'Assignment Removed',
      description: 'The weight assignment has been deleted.',
    });

    return response;
  } catch (error: any) {
    NotificationMessage.error({
      message: 'Failed to Delete Assignment',
      description:
        error?.response?.data?.message ||
        error?.message ||
        'Failed to delete the weight assignment.',
    });
    throw error;
  }
};

export const useDeleteObjectiveTypeWeightAssignment = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteObjectiveTypeWeightAssignment, {
    // The request function already shows the error; skip the global toast.
    onError: () => undefined,
    onSuccess: () => {
      queryClient.invalidateQueries('objectiveTypeWeightAssignments');
      queryClient.invalidateQueries('effectiveObjectiveTypeWeights');
    },
  });
};
