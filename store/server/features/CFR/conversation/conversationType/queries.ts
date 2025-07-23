/**
 * This module contains query hooks for fetching categories and users using react-query.
 */

import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { ORG_DEV_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { getCurrentToken } from '@/utils/getCurrentToken';
import { useQuery } from 'react-query';

const getAllConversationTypes = async () => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  return crudRequest({
    url: `${ORG_DEV_URL}/conversation-type`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};

const getConversationTypeById = async (id: string) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  return crudRequest({
    url: `${ORG_DEV_URL}/conversation-type/${id}`,
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
export const useGetConversationById = (id: string | undefined) => {
  return useQuery(
    ['conversationType', id], // Add `id` as a key to avoid potential conflicts
    () => getConversationTypeById(id as string), // Type assertion to assure TypeScript that `id` is defined
    {
      keepPreviousData: true,
      enabled: typeof id === 'string' && id.length > 0, // Ensure `id` is a valid, non-empty string
    },
  );
};

export const useConversationTypes = () => {
  return useQuery<any>('coverasationTypes', getAllConversationTypes);
};
