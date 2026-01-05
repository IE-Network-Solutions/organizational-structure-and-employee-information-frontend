import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { ORG_DEV_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { getCurrentToken } from '@/utils/getCurrentToken';
import { useQuery } from 'react-query';

const getConversationInstanceById = async (id: string | null) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  return crudRequest({
    url: `${ORG_DEV_URL}/conversation-instances/${id}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};

const getConversationInstanceByQuestionSetId = async (
  id: string,
  userId: string | null,
  departmentId: string | null,
) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  // Build the URL dynamically based on non-empty parameters
  const buildUrlWithParams = (
    baseUrl: string,
    params: Record<string, string | null>,
  ) => {
    const queryString = Object.entries(params)
      .filter(([, value]) => value != null && value !== '') // Exclude null, undefined, and empty string
      .map(([key, value]) => `${key}=${encodeURIComponent(value as string)}`)
      .join('&');
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  };

  const url = buildUrlWithParams(
    `${ORG_DEV_URL}/conversation-instances/by-conversation-set-id/${id}`,
    {
      userId,
      departmentId,
    },
  );

  return crudRequest({
    url,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId,
    },
  });
};

const getAllConversationInstances = async () => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  return crudRequest({
    url: `${ORG_DEV_URL}/conversation-instances`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};

export const useGetAllConversationInstancesById = (id: string | null) => {
  return useQuery<any>(
    'conversation-instance',
    () => getConversationInstanceById(id),
    {
      enabled: typeof id === 'string' && id.length > 0,
      // keepPreviousData: true,
    },
  );
};

export const useGetAllConversationInstancesByQuestionSetId = (
  id: string,
  userId: string,
  departmentId: string,
) => {
  return useQuery<any>(
    'conversation-instances',
    () => getConversationInstanceByQuestionSetId(id, userId, departmentId),
    {
      enabled: typeof id === 'string' && id.length > 0,
      // keepPreviousData: true,
    },
  );
};

export const useGetAllConversationInstances = () => {
  return useQuery<any>('conversation-instances', getAllConversationInstances);
};
