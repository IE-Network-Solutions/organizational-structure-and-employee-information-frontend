/**
 * @module fetchQuestionTemplate
 * This module provides a function and custom hook to fetch question templates from the API with pagination support.
 */

import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { ORG_DEV_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useQuery } from 'react-query';

const fetchFeedbackRecordById = async (id: string) => {
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
const fetchAllFeedbackRecord = async () => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  const headers = {
    tenantId,
    Authorization: `Bearer ${token}`,
  };
  return await crudRequest({
    url: `${ORG_DEV_URL}/feedback-record`,
    method: 'GET',
    headers,
  });
};
export const useFetchFeedbackRecordById = (id: string) => {
  return useQuery(
    ['feedbackRecord', id], // Include `id` in the query key for caching
    () => fetchFeedbackRecordById(id), // Fetch function
    // {
    //   enabled: !!id, // Conditionally enable the query
    // },
  );
};
export const useFetchAllFeedbackRecord = (
  pageSize?: number,
  current?: number,
) => {
  return useQuery(['feedbackRecord', pageSize, current], () =>
    fetchAllFeedbackRecord(),
  );
};
