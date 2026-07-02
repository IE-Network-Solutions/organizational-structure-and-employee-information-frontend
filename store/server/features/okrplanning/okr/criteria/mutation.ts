import NotificationMessage from '@/components/common/notification/notificationMessage';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { OKR_AND_PLANNING_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { getCurrentToken } from '@/utils/getCurrentToken';
import { useMutation, useQueryClient } from 'react-query';

export interface VpScoringFailedAssignment {
  userId: string;
  vpScoringId: string;
  vpScoringName: string;
}

export interface VpScoringMutationResponse {
  failed?: VpScoringFailedAssignment[];
  [key: string]: unknown;
}

/** Extract failed user assignments from create/update VP scoring API responses. */
export function extractVpScoringFailedAssignments(
  response: unknown,
): VpScoringFailedAssignment[] {
  if (!response || typeof response !== 'object') return [];

  const normalize = (items: unknown[]): VpScoringFailedAssignment[] =>
    items
      .filter((item) => item && typeof item === 'object')
      .map((item) => {
        const row = item as Record<string, unknown>;
        return {
          userId: String(row.userId ?? ''),
          vpScoringId: String(row.vpScoringId ?? ''),
          vpScoringName: String(row.vpScoringName ?? 'Unknown configuration'),
        };
      })
      .filter((item) => item.userId.length > 0);

  const root = response as Record<string, unknown>;
  const candidates = [
    root.failed,
    (root.data as Record<string, unknown> | undefined)?.failed,
    (root.result as Record<string, unknown> | undefined)?.failed,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return normalize(candidate);
  }

  return [];
}

function notifyVpScoringMutationResult(
  response: VpScoringMutationResponse,
  action: 'created' | 'updated',
) {
  const failed = extractVpScoringFailedAssignments(response);
  if (failed.length > 0) {
    NotificationMessage.warning({
      message: action === 'created' ? 'Partially Created' : 'Partially Updated',
      description: `VP Scoring was saved, but ${failed.length} employee(s) could not be assigned because they already belong to another configuration.`,
    });
    return;
  }

  NotificationMessage.success({
    message: action === 'created' ? 'Successfully Created' : 'Successfully Updated',
    description:
      action === 'created'
        ? 'VP Scoring successfully Created.'
        : 'VP Scoring successfully updated.',
  });
}

const createVpScoring = async (
  values: any,
): Promise<VpScoringMutationResponse> => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  try {
    const response = await crudRequest({
      url: `${OKR_AND_PLANNING_URL}/vp-scoring`,
      method: 'POST',
      data: values,
      headers: {
        Authorization: `Bearer ${token}`,
        tenantId: tenantId,
      },
    });

    notifyVpScoringMutationResult(response, 'created');

    return response;
  } catch (error) {
    throw error;
  }
};

export const useCreateVpScoring = () => {
  const queryClient = useQueryClient();

  return useMutation(createVpScoring, {
    onSuccess: () => {
      queryClient.invalidateQueries('VpScoringInformation');
    },
    onError: (error) => {
      NotificationMessage.error({
        message: error + '',
        description: 'Criteria Creation Failed.',
      });
    },
  });
};

const deleteVpScoring = async (id: string) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  try {
    await crudRequest({
      url: `${OKR_AND_PLANNING_URL}/vp-scoring/${id}`,
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        tenantId: tenantId,
      },
    });

    NotificationMessage.success({
      message: 'Successfully Deleted',
      description: 'VP Scoring successfully deleted.',
    });
  } catch (error) {
    throw error;
  }
};

export const useDeleteVpScoring = () => {
  const queryClient = useQueryClient();

  return useMutation(deleteVpScoring, {
    onSuccess: () => {
      queryClient.invalidateQueries('VpScoringInformation');
    },
    onError: (error) => {
      NotificationMessage.error({
        message: error + '',
        description: 'Failed to delete VP Scoring.',
      });
    },
  });
};

const updateVpScoring = async ({
  id,
  values,
}: {
  id: string;
  values: any;
}): Promise<VpScoringMutationResponse> => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  try {
    const response = await crudRequest({
      url: `${OKR_AND_PLANNING_URL}/vp-scoring/${id}`,
      method: 'PUT',
      data: values,
      headers: {
        Authorization: `Bearer ${token}`,
        tenantId: tenantId,
      },
    });

    notifyVpScoringMutationResult(response, 'updated');

    return response;
  } catch (error) {
    throw error;
  }
};

export const useUpdateVpScoring = () => {
  const queryClient = useQueryClient();

  return useMutation(updateVpScoring, {
    onSuccess: () => {
      queryClient.invalidateQueries('VpScoringInformation');
    },
    onError: (error) => {
      NotificationMessage.error({
        message: error + '',
        description: 'VP Scoring Update Failed.',
      });
    },
  });
};
