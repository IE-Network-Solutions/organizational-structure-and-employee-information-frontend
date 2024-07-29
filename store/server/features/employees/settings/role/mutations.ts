import { useMutation, useQueryClient  } from "react-query";
import axios from "axios";
import { ORG_AND_EMP_URL } from "@/utils/constants";
import { crudRequest } from "@/utils/crudRequest";
import { DeleteGroupPermissionProps, GroupPermissionkey } from "@/types/dashboard/adminManagement";
import NotificationMessage from "@/components/common/notification/notificationMessage";

/**
 * Function to add a new post by sending a POST request to the API
 * @param newPost The data for the new post
 * @returns The response data from the API
 */
const createRole = async (values: any) => {
   return crudRequest({url:`${ORG_AND_EMP_URL}/roles` ,  method:"POST" , data:values})
  };

  const updateRole = async ({ values, roleId }: any) => {
    return crudRequest({url:`${ORG_AND_EMP_URL}/roles/${roleId}` ,  method:"patch" , data:values})
   };
/**
 * Function to delete a post by sending a DELETE request to the API
 * @param postId The ID of the post to delete
 * @returns The response data from the API
 */
const deleteRole = async ({ deletedId,setCurrentModal,setDeletedId }: any) => {
    try {
      const response = await axios.delete(`${ORG_AND_EMP_URL}/roles/${deletedId}`);
      setCurrentModal(null);
      setDeletedId(null);
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
export const useAddRole = () => {
    const queryClient = useQueryClient()
    return useMutation(createRole, {
        onSuccess: () => {
            queryClient.invalidateQueries("roles");
            NotificationMessage.success({
                message: 'role Created Successfully ',
                description: 'Permission Group successfully updated',
            });
        },
    })
}
export const useUpdateRole = () => {
    const queryClient = useQueryClient()
    return useMutation(updateRole, {
        onSuccess: () => {
            queryClient.invalidateQueries("roles");
            NotificationMessage.success({
                message: 'Successfully Updated',
                description: 'Permission Group successfully updated',
            });
        },
    })
}

/**
 * Custom hook to delete a group Permissions using useMutation from react-query.
 * 
 * @returns The mutation object for deleting a group Permissions.
 * 
 * @description
 * This hook handles the mutation to delete a group Permissions. On successful mutation,
 * it invalidates the "groupPermissions" query to ensure the group Permissions data is refetched.
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


