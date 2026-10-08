import NotificationMessage from '@/components/common/notification/notificationMessage';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { OKR_AND_PLANNING_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { getCurrentToken } from '@/utils/getCurrentToken';
import { useMutation, useQueryClient } from 'react-query';
import {
  CreateOkrObjectiveTypeDto,
  OkrObjectiveType,
  UpdateOkrObjectiveTypeDto,
} from './interface';

export const createOkrObjectiveType = async (
  dto: CreateOkrObjectiveTypeDto,
): Promise<OkrObjectiveType> => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  try {
    const response = (await crudRequest({
      url: `${OKR_AND_PLANNING_URL}/okr-objective-types`,
      method: 'POST',
      data: dto,
      headers: {
        Authorization: `Bearer ${token}`,
        tenantId: tenantId,
      },
    })) as OkrObjectiveType;

    NotificationMessage.success({
      message: 'Objective Type Created',
      description: `Objective type "${dto.name}" has been created successfully.`,
    });

    return response;
  } catch (error: any) {
    NotificationMessage.error({
      message: 'Failed to Create Objective Type',
      description:
        error?.response?.data?.message ||
        error?.message ||
        'Failed to create objective type.',
    });
    throw error;
  }
};

export const updateOkrObjectiveType = async ({
  id,
  data,
}: {
  id: string;
  data: UpdateOkrObjectiveTypeDto;
}): Promise<OkrObjectiveType> => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  try {
    const response = (await crudRequest({
      url: `${OKR_AND_PLANNING_URL}/okr-objective-types/${id}`,
      method: 'PATCH',
      data: data,
      headers: {
        Authorization: `Bearer ${token}`,
        tenantId: tenantId,
      },
    })) as OkrObjectiveType;

    NotificationMessage.success({
      message: 'Objective Type Updated',
      description: 'Objective type has been updated successfully.',
    });

    return response;
  } catch (error: any) {
    NotificationMessage.error({
      message: 'Failed to Update Objective Type',
      description:
        error?.response?.data?.message ||
        error?.message ||
        'Failed to update objective type.',
    });
    throw error;
  }
};

export const deleteOkrObjectiveType = async (
  id: string,
): Promise<OkrObjectiveType> => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  try {
    const response = (await crudRequest({
      url: `${OKR_AND_PLANNING_URL}/okr-objective-types/${id}`,
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        tenantId: tenantId,
      },
    })) as OkrObjectiveType;

    NotificationMessage.success({
      message: 'Objective Type Deleted',
      description: 'Objective type has been deleted successfully.',
    });

    return response;
  } catch (error: any) {
    NotificationMessage.error({
      message: 'Failed to Delete Objective Type',
      description:
        error?.response?.data?.message ||
        error?.message ||
        'Failed to delete objective type.',
    });
    throw error;
  }
};

export const deactivateOkrObjectiveType = async (
  id: string,
): Promise<OkrObjectiveType> => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  try {
    const response = (await crudRequest({
      url: `${OKR_AND_PLANNING_URL}/okr-objective-types/${id}/deactivate`,
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        tenantId: tenantId,
      },
    })) as OkrObjectiveType;

    NotificationMessage.success({
      message: 'Objective Type Deactivated',
      description: 'Objective type has been deactivated successfully.',
    });

    return response;
  } catch (error: any) {
    NotificationMessage.error({
      message: 'Failed to Deactivate Objective Type',
      description:
        error?.response?.data?.message ||
        error?.message ||
        'Failed to deactivate objective type.',
    });
    throw error;
  }
};

export const useCreateOkrObjectiveType = () => {
  const queryClient = useQueryClient();
  return useMutation(createOkrObjectiveType, {
    onSuccess: () => {
      queryClient.invalidateQueries('okrObjectiveTypes');
    },
  });
};

export const useUpdateOkrObjectiveType = () => {
  const queryClient = useQueryClient();
  return useMutation(updateOkrObjectiveType, {
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries('okrObjectiveTypes');
      queryClient.invalidateQueries(['okrObjectiveType', variables.id]);
    },
  });
};

export const useDeleteOkrObjectiveType = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteOkrObjectiveType, {
    onSuccess: () => {
      queryClient.invalidateQueries('okrObjectiveTypes');
    },
  });
};

export const useDeactivateOkrObjectiveType = () => {
  const queryClient = useQueryClient();
  return useMutation(deactivateOkrObjectiveType, {
    onSuccess: () => {
      queryClient.invalidateQueries('okrObjectiveTypes');
    },
  });
};
