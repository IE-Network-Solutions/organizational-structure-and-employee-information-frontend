import { useMutation, useQueryClient } from 'react-query';
import { OKR_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import { CommentsData } from '@/types/okr';
import { getCurrentToken } from '@/utils/getCurrentToken';

/**
 * Function to add a new post by sending a POST request to the API
 * @param newPost The data for the new post
 * @returns The response data from the API
 */
const addComment = async (newPost: any) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

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
 * Function to add a new post by sending a POST request to the API
 * @param newPost The data for the new post
 * @returns The response data from the API
 */
const updateComment = async (
  commentId: string,
  updatedComment: CommentsData,
) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  try {
    return crudRequest({
      url: `${OKR_URL}/plan-comments/${commentId}`,
      method: 'PATCH',
      data: updatedComment,
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
 * Function to delete a post by sending a DELETE request to the API
 * @param postId The ID of the post to delete
 * @returns The response data from the API
 */
const deleteComment = async (commentId: string) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  try {
    return crudRequest({
      url: `${OKR_URL}/plan-comments/${commentId}`,
      method: 'DELETE',
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
/** Build comment object for cache from API response and/or form variables */
function toCommentForCache(apiResponse: any, variables: { planId?: string; comment?: string; commentedBy?: string }) {
  const now = new Date().toISOString();
  return {
    id: apiResponse?.id ?? `temp-${Date.now()}`,
    createdAt: apiResponse?.createdAt ?? now,
    updatedAt: apiResponse?.updatedAt ?? now,
    deletedAt: apiResponse?.deletedAt ?? null,
    createdBy: apiResponse?.createdBy ?? variables.commentedBy ?? '',
    updatedBy: apiResponse?.updatedBy ?? null,
    commentedBy: apiResponse?.commentedBy ?? variables.commentedBy ?? '',
    comment: apiResponse?.comment ?? variables.comment ?? '',
    tenantId: apiResponse?.tenantId ?? '',
  };
}

function updateOkrPlansCaches(
  queryClient: ReturnType<typeof useQueryClient>,
  updater: (data: { items?: any[] }) => { items?: any[] } | undefined,
) {
  // react-query v3: getQueriesData(['okrPlans']) returns all queries whose key starts with ['okrPlans']
  const queries = queryClient.getQueriesData<{ items?: any[] }>(['okrPlans']);
  queries.forEach(([queryKey, data]) => {
    if (!data) return;
    const updated = updater(data);
    if (updated) queryClient.setQueryData(queryKey, updated);
  });
}

export const useAddPlanComment = () => {
  const queryClient = useQueryClient();
  return useMutation(addComment, {
    onSuccess: (apiResponse: any, variables: any) => {
      const planId = variables?.planId;
      const newComment = toCommentForCache(apiResponse, variables ?? {});

      updateOkrPlansCaches(queryClient, (data) => {
        if (!data?.items || !Array.isArray(data.items)) return undefined;
        const updatedItems = data.items.map((plan: any) =>
          String(plan.id) === String(planId)
            ? { ...plan, comments: [...(plan.comments || []), newComment] }
            : plan
        );
        return { ...data, items: updatedItems };
      });

      queryClient.invalidateQueries('okrPlans');
      queryClient.invalidateQueries('okrUserPlans');
      queryClient.invalidateQueries('planComments');
      NotificationMessage.success({
        message: 'comment Successfully created ',
        description: 'okr plan comment created successfully',
      });
    },
  });
};

export const useUpdatePlanComment = () => {
  const queryClient = useQueryClient();
  return useMutation(
    ({ id, updatedComment }: { id: string; updatedComment: CommentsData }) =>
      updateComment(id, updatedComment),
    {
      onSuccess: (_data: any, variables: { id: string; updatedComment: CommentsData }) => {
        const commentId = variables.id;
        const newText = variables.updatedComment?.comment;

        updateOkrPlansCaches(queryClient, (data) => {
          if (!data?.items || !Array.isArray(data.items)) return undefined;
          const updatedItems = data.items.map((plan: any) => {
            const comments = plan.comments || [];
            const idx = comments.findIndex((c: any) => String(c.id) === String(commentId));
            if (idx === -1) return plan;
            const updatedComments = [...comments];
            updatedComments[idx] = {
              ...updatedComments[idx],
              comment: newText ?? updatedComments[idx].comment,
              updatedAt: new Date().toISOString(),
            };
            return { ...plan, comments: updatedComments };
          });
          return { ...data, items: updatedItems };
        });

        queryClient.invalidateQueries('okrPlans');
        queryClient.invalidateQueries('okrUserPlans');
        queryClient.invalidateQueries('planComments');
        NotificationMessage.success({
          message: 'comment Successfully updated ',
          description: 'okr plan comment updated successfully',
        });
      },
    },
  );
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
export const useDeletePlanComment = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteComment, {
    onSuccess: (_data: any, commentId: string) => {
      updateOkrPlansCaches(queryClient, (data) => {
        if (!data?.items || !Array.isArray(data.items)) return undefined;
        const updatedItems = data.items.map((plan: any) => {
          const comments = (plan.comments || []).filter((c: any) => String(c.id) !== String(commentId));
          return { ...plan, comments };
        });
        return { ...data, items: updatedItems };
      });

      queryClient.invalidateQueries('okrPlans');
      queryClient.invalidateQueries('okrUserPlans');
      queryClient.invalidateQueries('planComments');
      NotificationMessage.success({
        message: 'comment Successfully deleted ',
        description: 'okr plan comment deleted successfully',
      });
    },
  });
};
