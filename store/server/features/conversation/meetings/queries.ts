/**
 * This module contains query hooks for fetching categories and users using react-query.
 */

import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { ORG_DEV } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useQuery } from 'react-query';

const getAllConversationTypes = async () => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;

  return crudRequest({
    url: `${ORG_DEV}/conversation-instances/by-conversation-set-id`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};

const getConversationMettingsByConversationSetId = async (id: string) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;

  return crudRequest({
    url: `${ORG_DEV}/conversation-instances/by-conversation-set-id/${id}`,
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
export const useGetConversationById = (id: string) => {
  return useQuery<any>(
    'convesationMeeting',
    () => getConversationMettingsByConversationSetId(id),
    {
      keepPreviousData: true,
    },
  );
};

export const useConversationTypes = () => {
  return useQuery<any>('convesationMeeting', getAllConversationTypes);
};
