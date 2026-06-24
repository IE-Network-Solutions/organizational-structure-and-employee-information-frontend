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

    NotificationMessage.success({
      message: 'Successfully Created',
      description: 'VP Scoring successfully Created.',
    });

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

    NotificationMessage.success({
      message: 'Successfully Updated',
      description: 'VP Scoring successfully updated.',
    });

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
