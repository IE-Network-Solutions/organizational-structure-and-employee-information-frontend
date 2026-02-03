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
    url: `${OKR_URL}/report-comments`,
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
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  try {
    return crudRequest({
      url: `${OKR_URL}/report-comments/${commentId}`,
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
 * Function to delete a post by sending a DELETE request to the API
 * @param postId The ID of the post to delete
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
      url: `${OKR_URL}/report-comments/${commentId}`,
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
 * Custom hook to add a new post using useMutation from react-query.
 *
 * @returns The mutation object for adding a post.
 *
 * @description
 * This hook handles the mutation to add a new post. On successful mutation,
 * it invalidates the "posts" query to refetch the latest data.
 */
/** Build comment object for cache from API response and/or form variables */
function toCommentForCache(apiResponse: any, variables: { reportId?: string; comment?: string; commentedBy?: string }) {
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

function updateOkrReportsCaches(
  queryClient: ReturnType<typeof useQueryClient>,
  updater: (data: { items?: any[] }) => { items?: any[] } | undefined,
) {
  const queries = queryClient.getQueriesData<{ items?: any[] }>(['okrReports']);
  queries.forEach(([queryKey, data]) => {
    if (!data) return;
    const updated = updater(data);
    if (updated) queryClient.setQueryData(queryKey, updated);
  });
}

export const useAddReportComment = () => {
  const queryClient = useQueryClient();
  return useMutation(addComment, {
    onSuccess: (apiResponse: any, variables: any) => {
      const reportId = variables?.reportId;
      const newComment = toCommentForCache(apiResponse, variables ?? {});

      updateOkrReportsCaches(queryClient, (data) => {
        if (!data?.items || !Array.isArray(data.items)) return undefined;
        const updatedItems = data.items.map((report: any) =>
          String(report.id) === String(reportId)
            ? { ...report, comments: [...(report.comments || []), newComment] }
            : report
        );
        return { ...data, items: updatedItems };
      });

      queryClient.invalidateQueries('okrReports');
      queryClient.invalidateQueries('reportComments');
      NotificationMessage.success({
        message: 'comment Successfully created ',
        description: 'okr report comment created successfully',
      });
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
export const useDeleteReportComment = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteComment, {
    onSuccess: (_data: any, commentId: string) => {
      updateOkrReportsCaches(queryClient, (data) => {
        if (!data?.items || !Array.isArray(data.items)) return undefined;
        const updatedItems = data.items.map((report: any) => {
          const comments = (report.comments || []).filter((c: any) => String(c.id) !== String(commentId));
          return { ...report, comments };
        });
        return { ...data, items: updatedItems };
      });

      queryClient.invalidateQueries('okrReports');
      queryClient.invalidateQueries('reportComments');
      NotificationMessage.success({
        message: 'comment Successfully deleted ',
        description: 'okr report comment deleted successfully',
      });
    },
  });
};

export const useUpdateReportComment = () => {
  const queryClient = useQueryClient();
  return useMutation(
    ({ id, updatedComment }: { id: string; updatedComment: CommentsData }) =>
      updateComment(id, updatedComment),
    {
      onSuccess: (_data: any, variables: { id: string; updatedComment: CommentsData }) => {
        const commentId = variables.id;
        const newText = variables.updatedComment?.comment;

        updateOkrReportsCaches(queryClient, (data) => {
          if (!data?.items || !Array.isArray(data.items)) return undefined;
          const updatedItems = data.items.map((report: any) => {
            const comments = report.comments || [];
            const idx = comments.findIndex((c: any) => String(c.id) === String(commentId));
            if (idx === -1) return report;
            const updatedComments = [...comments];
            updatedComments[idx] = {
              ...updatedComments[idx],
              comment: newText ?? updatedComments[idx].comment,
              updatedAt: new Date().toISOString(),
            };
            return { ...report, comments: updatedComments };
          });
          return { ...data, items: updatedItems };
        });

        queryClient.invalidateQueries('okrReports');
        queryClient.invalidateQueries('reportComments');
        NotificationMessage.success({
          message: 'comment Successfully updated ',
          description: 'okr report comment updated successfully',
        });
      },
    },
  );
};
