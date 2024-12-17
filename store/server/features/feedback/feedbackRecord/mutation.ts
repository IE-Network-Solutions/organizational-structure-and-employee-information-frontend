/**
 * @module questionTemplateMutation
 * This module provides functions and custom hooks for managing question templates (create, update, and delete) using CRUD operations via API requests.
 */

import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useCustomQuestionTemplateStore } from '@/store/uistate/features/feedback/settings';
import { ORG_DEV_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { handleSuccessMessage } from '@/utils/showSuccessMessage';
import { useMutation, useQueryClient } from 'react-query';


const createFeedbackRecord = async (data: any) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  const headers = {
    tenantId,
    Authorization: `Bearer ${token}`,
  };

  return await crudRequest({
    url: `${ORG_DEV_URL}/feedback-record`,
    method: 'POST',
    data,
    headers,
  });
};
const updateFeedbackRecord = async (data: any) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  const headers = {
    tenantId,
    Authorization: `Bearer ${token}`,
  };

  return await crudRequest({
    url: `${ORG_DEV_URL}/feedback-record/${data?.id}`,
    method: 'patch',
    data,
    headers,
  });
};
const deleteFeedbackRecordById = async (id: string) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  const headers = {
    tenantId,
    Authorization: `Bearer ${token}`,
  };

  return await crudRequest({
    url: `${ORG_DEV_URL}/feedback-record/${id}`,
    method: 'delete',
    headers,
  });
};

export const useUpdateFeedbackRecord = () => {
  const queryClient = useQueryClient();
  return useMutation(updateFeedbackRecord, {
    onSuccess: (notused, variables: any) => {
      queryClient.invalidateQueries('feedbackRecord');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });
};

export const useCreateFeedbackRecord = () => {
  const queryClient = useQueryClient();
  return useMutation(createFeedbackRecord, {
    onSuccess: (notused, variables: any) => {
      queryClient.invalidateQueries('feedbackRecord');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });
};

export const useDeleteFeedbackRecordById = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteFeedbackRecordById, {
    onSuccess: (notused, variables: any) => {
      queryClient.invalidateQueries('feedbackRecord');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });
};
// eslint-enable-next-line @typescript-eslint/naming-convention
