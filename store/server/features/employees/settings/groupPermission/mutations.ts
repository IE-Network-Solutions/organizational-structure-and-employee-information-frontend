import { useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import { ORG_AND_EMP_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { GroupPermissionkey } from '@/types/dashboard/adminManagement';
import NotificationMessage from '@/components/common/notification/notificationMessage';

/**
 * Function to create a new permission group by sending a POST request to the API.
 * 
 * @param values - The data for the new permission group.
 * @returns The response data from the API, which contains details of the created permission group.
 */
const createPermissionGroup = async (values: GroupPermissionkey) => {
  return crudRequest({
    url: `${ORG_AND_EMP_URL}/permission-group`,
    method: 'POST',
    data: values,
  });
};

/**
 * Function to update an existing permission group by sending a PATCH request to the API.
 * 
 * @param values - The data for updating the permission group, including its ID.
 * @returns The response data from the API, which contains details of the updated permission group.
 */
const updatePermissionGroup = async (values: any) => {
  return crudRequest({
    url: `${ORG_AND_EMP_URL}/permission-group/${values?.id}`,
    method: 'patch',
    data: values,
  });
};
/**
 * Function to delete a post by sending a DELETE request to the API
 * @param postId The ID of the post to delete
 * @returns The response data from the API
 */
const deleteGroupPermission = async ({
  deletedId,
  setCurrentModal,
  setDeletedId,
}: any) => {
  try {
    const response = await axios.delete(
      `${ORG_AND_EMP_URL}/permission-group/${deletedId?.id}`,
    );
    setCurrentModal(null);
    setDeletedId(null);
    NotificationMessage.success({
      message: 'Successfully Deleted',
      description: 'Permission Group successfully deleted.',
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Custom hook to handle adding a new permission group using `useMutation` from `react-query`.
 * 
 * @returns The mutation object for adding a new permission group.
 * 
 * @description
 * This hook manages the process of adding a new permission group. After a successful
 * mutation, it invalidates the "groupPermissions" query to refetch the updated list of permission groups.
 */
export const useAddPermissionGroup = () => {
  const queryClient = useQueryClient();
  return useMutation(createPermissionGroup, {
    onSuccess: () => {
      queryClient.invalidateQueries('groupPermissions');
      NotificationMessage.success({
        message: 'Successfully Updated',
        description: 'Permission Group successfully updated',
      });
    },
  });
};

/**
 * Custom hook to handle updating an existing permission group using `useMutation` from `react-query`.
 * 
 * @returns The mutation object for updating a permission group.
 * 
 * @description
 * This hook manages the process of updating an existing permission group. After a successful
 * mutation, it invalidates the "groupPermissions" query to refetch the updated list of permission groups.
 */
export const useUpdatePermissionGroup = () => {
  const queryClient = useQueryClient();
  return useMutation(updatePermissionGroup, {
    onSuccess: () => {
      queryClient.invalidateQueries('groupPermissions');
      NotificationMessage.success({
        message: 'Successfully Updated',
        description: 'Permission Group successfully updated',
      });
    },
  });
};

/**
 * Custom hook to handle deleting a permission group using `useMutation` from `react-query`.
 * 
 * @returns The mutation object for deleting a permission group.
 * 
 * @description
 * This hook manages the process of deleting a permission group. After a successful
 * mutation, it invalidates the "groupPermissions" query to ensure the list of permission groups is updated.
 */
export const useDeleteGroupPermission = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteGroupPermission, {
    onSuccess: () => {
      queryClient.invalidateQueries('groupPermissions');
    },
  });
};
