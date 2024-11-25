/**
 * This module contains query hooks for fetching categories and users using react-query.
 */

import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import {ORG_DEV } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useQuery } from 'react-query';



const getAllQuestionSet = async () => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;

  return crudRequest({
    url: `${ORG_DEV}/question-set`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};

const getQuestionSetById = async (id:string) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;

  return crudRequest({
    url: `${ORG_DEV}/question-set/${id}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};

const getActionPlansByConversationInstanceId = async (id:string) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;

  return crudRequest({
    url: `${ORG_DEV}/conversation-action-plans?conversationInstanceId=${id}`,
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
export const useGetAllActionPlansByConversationInstanceId= (id:string) => {
  return useQuery<any>('conversationActionPlan', ()=>getActionPlansByConversationInstanceId(id), {
    enabled: typeof id === 'string' && id.length > 0,
    keepPreviousData: true,
  });
};

/**
 * Custom hook to fetch a specific user by their ID.
 * @param {string} createdById - The ID of the user to fetch.
 * @returns {UseQueryResult<any>} The Query object for fetching the user.
 */
export const useGetAllActionPlansById= (id:string) => {
  return useQuery<any>('conversationActionPlan', ()=>getQuestionSetById(id), {
    enabled: typeof id === 'string' && id.length > 0,
    keepPreviousData: true,
  });
};

export const useGetAllActionPlans = () => {
  return useQuery<any>('conversationActionPlan', getAllQuestionSet);
};
