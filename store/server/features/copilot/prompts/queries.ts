import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { ORG_AND_EMP_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { getCurrentToken } from '@/utils/getCurrentToken';
import { useQuery } from 'react-query';
import {
  normalizeCopilotPromptList,
  type CopilotPrompt,
} from './interface';

const getAuthHeaders = async () => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  return {
    Authorization: `Bearer ${token}`,
    tenantId: tenantId,
  };
};

const fetchCopilotPrompts = async (): Promise<CopilotPrompt[]> => {
  const headers = await getAuthHeaders();
  const data = await crudRequest({
    url: `${ORG_AND_EMP_URL}/copilot-prompts`,
    method: 'GET',
    headers,
  });
  return normalizeCopilotPromptList(data);
};

const fetchCopilotPromptById = async (id: string): Promise<CopilotPrompt> => {
  const headers = await getAuthHeaders();
  return await crudRequest({
    url: `${ORG_AND_EMP_URL}/copilot-prompts/${encodeURIComponent(id)}`,
    method: 'GET',
    headers,
  });
};

export const useGetCopilotPrompts = (enabled = true) => {
  return useQuery(['copilot-prompts'], fetchCopilotPrompts, {
    enabled,
    staleTime: 60_000,
  });
};

export const useGetCopilotPromptById = (id: string | null) => {
  return useQuery(
    ['copilot-prompts', id],
    () => fetchCopilotPromptById(id as string),
    {
      enabled: !!id,
    },
  );
};
