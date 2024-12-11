import NotificationMessage from '@/components/common/notification/notificationMessage';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { OKR_AND_PLANNING_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useMutation, useQueryClient } from 'react-query';

const createAssignTarget = async (values: any) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;

  try {
    await crudRequest({
      url: `${OKR_AND_PLANNING_URL}/criteria-targets`,
      method: 'POST',
      data: values,
      headers: {
        Authorization: `Bearer ${token}`,
        tenantId: tenantId,
      },
    });

    NotificationMessage.success({
      message: 'Successfully Created',
      description: 'Target successfully Assigned.',
    });
  } catch (error) {
    throw error;
  }
};
export const useCreateAssignTarget = () => {
  const queryClient = useQueryClient();

  return useMutation(createAssignTarget, {
    onSuccess: () => {
      queryClient.invalidateQueries('targetAssignment');
    },
    onError: (error) => {
      NotificationMessage.error({
        message: error + '',
        description: 'Assigning Target Failed.',
      });
    },
  });
};

const deleteAssignedTarget = async (id: string) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;

  try {
    await crudRequest({
      url: `${OKR_AND_PLANNING_URL}/criteria-targets/${id}`,
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        tenantId: tenantId,
      },
    });

    NotificationMessage.success({
      message: 'Successfully Deleted',
      description: 'Assigned Target successfully deleted.',
    });
  } catch (error) {
    throw error;
  }
};
export const useDeleteAssignedTarget = () => {
  const queryClient = useQueryClient();

  return useMutation(deleteAssignedTarget, {
    onSuccess: () => {
      queryClient.invalidateQueries('targetAssignment');
    },
    onError: (error) => {
      NotificationMessage.error({
        message: error + '',
        description: 'Failed to delete Assigned Target.',
      });
    },
  });
};

const updateAssignedTarget = async ({
  id,
  values,
}: {
  id: string;
  values: any;
}) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;

  try {
    await crudRequest({
      url: `${OKR_AND_PLANNING_URL}/criteria-targets/bulk/${id}`,
      method: 'PUT',
      data: values,
      headers: {
        Authorization: `Bearer ${token}`,
        tenantId: tenantId,
      },
    });

    NotificationMessage.success({
      message: 'Successfully Updated',
      description: 'Assigned Target successfully updated.',
    });
  } catch (error) {
    throw error;
  }
};

export const useUpdateAssignedTargets = () => {
  const queryClient = useQueryClient();

  return useMutation(updateAssignedTarget, {
    onSuccess: () => {
      queryClient.invalidateQueries('targetAssignment');
    },
    onError: (error) => {
      NotificationMessage.error({
        message: error + '',
        description: 'VP Scoring Update Failed.',
      });
    },
  });
};
