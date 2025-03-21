import NotificationMessage from '@/components/common/notification/notificationMessage';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { OKR_AND_PLANNING_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import axios from 'axios';
import { useMutation, useQueryClient } from 'react-query';

const token = useAuthenticationStore.getState().token;
const tenantId = useAuthenticationStore.getState().tenantId;
const createPlanningAssignation = async (values: any) => {
  try {
    await crudRequest({
      url: `${OKR_AND_PLANNING_URL}/recognition-type`,
      method: 'POST',
      data: values,
      headers: {
        Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
        tenantId: tenantId, // Pass tenantId in the headers
      },
    });

    // Assuming success if no error is thrown
    NotificationMessage.success({
      message: 'Successfully Created',
      description: 'Planning Assignation  successfully Created.',
    });
  } catch (error) {
    // Handle error (optional)
    throw error; // Re-throw error if needed for further handling
  }
};
export const UpdatePlanningAssignation = async (
  values: Record<string, string>,
) => {
  try {
    await crudRequest({
      url: `${OKR_AND_PLANNING_URL}/recognition-type/${values?.id}`,
      method: 'PUT',
      data: values,
      headers: {
        Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
        tenantId: tenantId, // Pass tenantId in the headers
      },
    });
    NotificationMessage.success({
      message: 'Successfully Updated',
      description: 'Planning Assignation successfully Updated.',
    });
  } catch (error) {
    // Handle error (optional)
    throw error; // Re-throw error if needed for further handling
  }
};

const deletePlanningAssignation = async (deletedId: string) => {
  try {
    const headers = {
      Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
      tenantId: tenantId, // Pass tenantId in the headers
    };
    const response = await axios.delete(
      `${OKR_AND_PLANNING_URL}/recognition-type/${deletedId}`,
      { headers },
    );
    NotificationMessage.success({
      message: 'Successfully Deleted',
      description: 'Planning Assignation successfully deleted.',
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const useDeletePlanningAssignation = () => {
  const queryClient = useQueryClient();
  return useMutation(deletePlanningAssignation, {
    onSuccess: () => {
      queryClient.invalidateQueries('planningAssignation');
    },
  });
};
export const useCreatePlanningAssignation = () => {
  const queryClient = useQueryClient();
  return useMutation(createPlanningAssignation, {
    onSuccess: () => {
      queryClient.invalidateQueries('planningAssignation');
    },
  });
};
export const useUpdatePlanningAssignation = () => {
  const queryClient = useQueryClient();
  return useMutation(UpdatePlanningAssignation, {
    onSuccess: () => {
      queryClient.invalidateQueries('planningAssignation');
    },
  });
};
