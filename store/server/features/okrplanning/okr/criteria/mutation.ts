import NotificationMessage from '@/components/common/notification/notificationMessage';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { OKR_AND_PLANNING_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useMutation, useQueryClient } from 'react-query';

const createVpScoring = async (values: any) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;

  try {
    await crudRequest({
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
  const token = useAuthenticationStore.getState().token;
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

// Custom hook for deleting VP Scoring
export const useDeleteVpScoring = () => {
  const queryClient = useQueryClient();

  return useMutation(deleteVpScoring, {
    onSuccess: () => {
      queryClient.invalidateQueries('VpScoringInformation'); // Adjust the query name as needed
    },
    onError: (error) => {
      NotificationMessage.error({
        message: error + '',
        description: 'Failed to delete VP Scoring.',
      });
    },
  });
};

const updateVpScoring = async ({ id, values }: { id: string; values: any }) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;

  try {
    await crudRequest({
      url: `${OKR_AND_PLANNING_URL}/vp-scoring/${id}`, // Include the id in the URL
      method: 'PUT', // Use PATCH method for update
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
