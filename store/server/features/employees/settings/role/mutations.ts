import { useMutation, useQueryClient } from 'react-query';
import { ORG_AND_EMP_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { getCurrentToken } from '@/utils/getCurrentToken';

/**
 * Function to create a new role by sending a POST request to the API.
 *
 * @param values - The data for the new role.
 * @returns The response data from the API containing the created role.
 */

const createRole = async (values: any) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  const updatedRole = { ...values, tenantId: tenantId };

  return crudRequest({
    url: `${ORG_AND_EMP_URL}/roles`,
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
      tenantId: tenantId, // Pass tenantId in the headers
    },
    data: updatedRole,
  });
};

/**
 * Function to update an existing role by sending a PATCH request to the API.
 *
 * @param params - An object containing:
 *   - `values`: The updated data for the role.
 *   - `roleId`: The ID of the role to be updated.
 * @returns The response data from the API containing the updated role.
 */

const updateRole = async ({ values, roleId }: any) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  const updatedRole = { ...values, tenantId: tenantId };

  return crudRequest({
    url: `${ORG_AND_EMP_URL}/roles/${roleId}`,
    method: 'patch',
    headers: {
      Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
      tenantId: tenantId, // Pass tenantId in the headers
    },

    data: updatedRole,
  });
};

/**
 * Function to delete a role by sending a DELETE request to the API.
 *
 * @param params - An object containing:
 *   - `deletedId`: The ID of the role to be deleted.
 *   - `setCurrentModal`: Function to close the current modal.
 *   - `setDeletedId`: Function to reset the deleted ID state.
 * @returns The response data from the API confirming the deletion.
 *
 * @throws Error if the request fails.
 */

const deleteRole = async ({
  deletedId,
  setCurrentModal,
  setDeletedId,
}: any) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  await crudRequest({
    url: `${ORG_AND_EMP_URL}/roles/${deletedId?.id}`,
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
  setCurrentModal(null);
  setDeletedId(null);
};

/**
 * Custom hook to create a new role using `useMutation` from `react-query`.
 *
 * @returns The mutation object for adding a new role.
 *
 * @description
 * This hook handles the mutation to add a new role. On successful mutation,
 * it invalidates the 'roles' query to refetch the latest roles data, and shows
 * a success notification.
 */
export const useAddRole = () => {
  const queryClient = useQueryClient();
  return useMutation(createRole, {
    onSuccess: () => {
      queryClient.invalidateQueries('roles');
      NotificationMessage.success({
        message: 'role Created Successfully ',
        description: 'Permission Group successfully updated',
      });
    },
  });
};

/**
 * Custom hook to update an existing role using `useMutation` from `react-query`.
 *
 * @returns The mutation object for updating a role.
 *
 * @description
 * This hook handles the mutation to update an existing role. On successful mutation,
 * it invalidates the 'roles' query to refetch the latest roles data, and shows
 * a success notification.
 */
export const useUpdateRole = () => {
  const queryClient = useQueryClient();
  return useMutation(updateRole, {
    onSuccess: () => {
      queryClient.invalidateQueries('roles');
      NotificationMessage.success({
        message: 'Successfully Updated',
        description: 'Permission Group successfully updated',
      });
    },
  });
};

/**
 * Custom hook to delete a role using `useMutation` from `react-query`.
 *
 * @returns The mutation object for deleting a role.
 *
 * @description
 * This hook handles the mutation to delete a role. On successful mutation,
 * it invalidates the 'roles' query to ensure the latest roles data is refetched,
 * and shows a success notification.
 */
export const useDeleteRole = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteRole, {
    onSuccess: () => {
      queryClient.invalidateQueries('roles');
      NotificationMessage.success({
        message: 'Successfully Deleted',
        description: 'Role successfully deleted.',
      });
    },
  });
};
