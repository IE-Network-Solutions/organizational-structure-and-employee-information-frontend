import { useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import { ORG_AND_EMP_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';

const token = useAuthenticationStore.getState().token;
const tenantId = useAuthenticationStore.getState().tenantId;
/**
 * Function to add a new post by sending a POST request to the API
 * @param newPost The data for the new post
 * @returns The response data from the API
 */
const createEmployeeInformationForm = async (values: any) => {
  return crudRequest({
    url: `${ORG_AND_EMP_URL}/employee-information-form`,
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
      tenantId: tenantId, // Pass tenantId in the headers
    },
    data: values,
  });
};

/**
 * Function to delete a post by sending a DELETE request to the API
 * @param postId The ID of the post to delete
 * @returns The response data from the API
 */
const deleteEmployeeInformationForm = async ({
  deletedId,
  setCurrentModal,
  setDeletedId,
}: any) => {
  try {
    const headers = {
      Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
      tenantId: tenantId, // Pass tenantId in the headers
    };

    const response = await axios.delete(
      `${ORG_AND_EMP_URL}/employee-information-form/${deletedId}`,
      { headers },
    );
    setCurrentModal(null);
    setDeletedId(null);
    NotificationMessage.success({
      message: 'Successfully Deleted',
      description: 'Employee successfully deleted.',
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Custom hook to add a new group Permissions using useMutation from react-query.
 *
 * @returns The mutation object for adding a group Permissions.
 *
 * @description
 * This hook handles the mutation to add a new post. On successful mutation,
 * it invalidates the "groupPermissions" query to refetch the latest data.
 */
export const useAddEmployeeInformationForm = () => {
  const queryClient = useQueryClient();
  return useMutation(createEmployeeInformationForm, {
    onSuccess: () => {
      queryClient.invalidateQueries('employeInformationForms');
      NotificationMessage.success({
        message: 'Successfully Created',
        description: 'Employee successfully Created',
      });
    },
  });
};

/**
 * Custom hook to delete a group Permissions using useMutation from react-query.
 *
 * @returns The mutation object for deleting a group Permissions.
 *
 * @description
 * This hook handles the mutation to delete a group Permissions. On successful mutation,
 * it invalidates the "groupPermissions" query to ensure the group Permissions data is refetched.
 */
export const useDeleteEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteEmployeeInformationForm, {
    onSuccess: () => {
      queryClient.invalidateQueries('employeInformationForms');
    },
  });
};
