/**
 * This module contains query hooks for fetching categories and users using react-query.
 */

import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { ORG_DEV_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useQuery } from 'react-query';
import { getCurrentToken } from '@/utils/getCurrentToken';


const getAllQuestionSet = async () => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  return crudRequest({
    url: `${ORG_DEV_URL}/question-set`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};

const getQuestionSetById = async (id: string) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  return crudRequest({
    url: `${ORG_DEV_URL}/question-set/${id}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};

const getActionPlansById = async (id: string) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  return crudRequest({
    url: `${ORG_DEV_URL}/conversation-action-plans/${id}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};

const getActionPlansByConversationInstanceId = async (id: string) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  return crudRequest({
    url: `${ORG_DEV_URL}/conversation-action-plans?conversationInstanceId=${id}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};

/**
 * Custom hook to fetch a specific user by their ID.
 * @param {string} createdById - The ID of the user to fetch.
 * @returns {UseQueryResult<any>} The Query object for fetching the user.
 */
export const useGetAllActionPlansByConversationInstanceId = (id: string) => {
  return useQuery<any>(
    'conversationActionPlan',
    () => getActionPlansByConversationInstanceId(id),
    {
      enabled: typeof id === 'string' && id.length > 0,
      keepPreviousData: true,
    },
  );
};

/**
 * Custom hook to fetch a specific user by their ID.
 * @param {string} createdById - The ID of the user to fetch.
 * @returns {UseQueryResult<any>} The Query object for fetching the user.
 */
export const useGetAllActionPlansById = (id: string) => {
  return useQuery<any>('conversationActionPlan', () => getQuestionSetById(id), {
    enabled: typeof id === 'string' && id.length > 0,
    keepPreviousData: true,
  });
};
export const useGetActionPlansById = (id: string) => {
  return useQuery<any>(
    'conversationActionPlanId',
    () => getActionPlansById(id),
    {
      enabled: typeof id === 'string' && id.length > 0,
    },
  );
};

export const useGetAllActionPlans = () => {
  return useQuery<any>('conversationActionPlan', getAllQuestionSet);
};
