import { crudRequest } from "@/utils/crudRequest";
import { useMutation, useQueryClient } from "react-query";
import { Branch } from "./interface";
import { ORG_AND_EMP_URL, tenantId } from "@/utils/constants";
import NotificationMessage from "@/components/common/notification/notificationMessage";


/**
 * Create a new branch.
 * @param data - Branch data to be created.
 * @returns Promise with the created branch data.
 */
const headers = {
  tenantId: tenantId, 
};
const createBranch = async (data: Branch) => {
  return await crudRequest({ url: `${ORG_AND_EMP_URL}/branchs`, method: "POST", data , headers });
};

/**
 * Update an existing branch.
 * @param id - ID of the branch to update.
 * @param data - Updated branch data.
 * @returns Promise with the updated branch data.
 */
const updateBranch = async (id: string, data: Branch) => {
  return await crudRequest({ url: `${ORG_AND_EMP_URL}/branchs/${id}`, method: "PATCH", data  , headers});
};

/**
 * Delete a branch.
 * @param id - ID of the branch to delete.
 * @returns Promise confirming the deletion.
 */
const deleteBranch = async (id: string) => {
  return await crudRequest({ url: `${ORG_AND_EMP_URL}/branchs/${id}`, method: "DELETE", headers });
};

/**
 * Custom hook to create a new branch using react-query.
 * Invalidate the "branches" query on success to refresh the data.
 * @returns Mutation object for creating a branch.
 */
export const useCreateBranch = () => {
  const queryClient = useQueryClient();
  return useMutation(createBranch, {
    onSuccess: (data:any) => {
      queryClient.invalidateQueries("branches");
      NotificationMessage.success({message:`Success` , description:"Successfully Created"})
    },
    onError:(error:any) =>{
      NotificationMessage.error(error)
    }
  });
};


/**
 * Custom hook to update an existing branch using react-query.
 * Invalidate the "branches" query on success to refresh the data.
 * @returns Mutation object for updating a branch.
 */
export const useUpdateBranch = () => {
    const queryClient = useQueryClient();
    return useMutation(
      (data: { id: string; branch: Branch }) => updateBranch(data.id, data.branch),
      {
        onSuccess: () => {
          queryClient.invalidateQueries("branches");
        },
      }
    );
  };
  
  /**
   * Custom hook to delete a branch using react-query.
   * Invalidate the "branches" query on success to refresh the data.
   * @returns Mutation object for deleting a branch.
   */
  export const useDeleteBranch = () => {
    const queryClient = useQueryClient();
    return useMutation(deleteBranch, {
      onSuccess: () => {
        queryClient.invalidateQueries("branches");
      },
    });
  };