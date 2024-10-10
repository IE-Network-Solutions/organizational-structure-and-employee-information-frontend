import { useMutation, useQueryClient } from 'react-query';
import { AddPostData } from './interface';
import axios from 'axios';
import { ORG_AND_EMP_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';

/**
 * Function to add a new post by sending a POST request to the API
 * @param newPost The data for the new post
 * @returns The response data from the API
 */
const addPost = async (newPost: AddPostData) => {
  return crudRequest({
    url: `${ORG_AND_EMP_URL}/users`,
    method: 'POST',
    data: newPost,
  });
};

/**
 * Function to delete a post by sending a DELETE request to the API
 * @param postId The ID of the post to delete
 * @returns The response data from the API
 */
const deletePost = async (postId: string) => {
  try {
    const response = await axios.delete(`${ORG_AND_EMP_URL}/posts/${postId}`);
    return response.data;
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
export const useAddPost = () => {
  const queryClient = useQueryClient();
  return useMutation(addPost, {
    onSuccess: () => {
      queryClient.invalidateQueries('posts');
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
export const useDeletePost = () => {
  const queryClient = useQueryClient();
  return useMutation(deletePost, {
    onSuccess: () => {
      queryClient.invalidateQueries('posts');
    },
  });
};
