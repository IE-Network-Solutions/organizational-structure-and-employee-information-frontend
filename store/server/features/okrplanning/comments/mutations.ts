import { useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import { OKR_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';

/**
 * Function to add a new post by sending a POST request to the API
 * @param newPost The data for the new post
 * @returns The response data from the API
 */
const addComment = async (newPost: any) => {
    const token = useAuthenticationStore.getState().token;
    const tenantId = useAuthenticationStore.getState().tenantId;

    console.log(newPost,"newPost")
  return crudRequest({
    url: `${OKR_URL}/plan-comments`,
    method: 'POST',
    data: newPost,
    headers: {
        Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
        tenantId: tenantId, // Pass tenantId in the headers
      },
  });
};

/**
 * Function to delete a post by sending a DELETE request to the API
 * @param postId The ID of the post to delete
 * @returns The response data from the API
 */
const deleteComment = async (commentId: string) => {
    const token = useAuthenticationStore.getState().token;
    const tenantId = useAuthenticationStore.getState().tenantId;
  try {
    return crudRequest({
        url: `${OKR_URL}/plan-comments/${commentId}`,
        method: 'delete',
        headers: {
            Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
            tenantId: tenantId, // Pass tenantId in the headers
          },
      });
  } catch (error) {
    throw error;
  }
};

/**
 * Custom hook to add a new post using useMutation from react-query.
 *
 * @returns The mutation object for adding a post.
 *
 * @description
 * This hook handles the mutation to add a new post. On successful mutation,
 * it invalidates the "posts" query to refetch the latest data.
 */
export const useAddPlanComment = () => {
  const queryClient = useQueryClient();
  return useMutation(addComment, {
    onSuccess: () => {
      queryClient.invalidateQueries('okrPlans');
      queryClient.invalidateQueries('comments');
    },
  });
};

/**
 * Custom hook to delete a post using useMutation from react-query.
 *
 * @returns The mutation object for deleting a post.
 *
 * @description
 * This hook handles the mutation to delete a post. On successful mutation,
 * it invalidates the "posts" query to ensure the posts data is refetched.
 */
export const useDeleteComment = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteComment, {
    onSuccess: () => {
      queryClient.invalidateQueries('okrPlans');
      queryClient.invalidateQueries('comments');
    },
  });
};
