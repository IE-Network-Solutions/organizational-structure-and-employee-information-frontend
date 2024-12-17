/**
 * @module fetchQuestionTemplate
 * This module provides a function and custom hook to fetch question templates from the API with pagination support.
 */

import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { ORG_DEV_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useQuery } from 'react-query';

const fetchFeedbackTypeById = async (id: string) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  const headers = {
    tenantId,
    Authorization: `Bearer ${token}`,
  };
  return await crudRequest({
    url: `${ORG_DEV_URL}/feedback-type/${id}`,
    method: 'GET',
    headers,
  });
};
const fetchAllFeedbackTypes = async () => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  const headers = {
    tenantId,
    Authorization: `Bearer ${token}`,
  };
  return await crudRequest({
    url: `${ORG_DEV_URL}/feedback-type`,
    method: 'GET',
    headers,
  });
};
export const useFetchFeedbackTypeById = (id: string) => {
  return useQuery(
    ['feedbackType', id], // Include `id` in the query key for caching
    () => fetchFeedbackTypeById(id), // Fetch function
    {
      enabled: !!id, // Conditionally enable the query
    },
  );
};
export const useFetchAllFeedbackTypes = (
  pageSize?: number,
  current?: number,
) => {
  return useQuery(['feedbackTypes', pageSize, current], () =>
    fetchAllFeedbackTypes(),
  );
};
