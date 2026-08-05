import NotificationMessage from '@/components/common/notification/notificationMessage';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { ORG_AND_EMP_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { getCurrentToken } from '@/utils/getCurrentToken';
import { useMutation, useQueryClient } from 'react-query';
import type {
  CopilotPrompt,
  CreateCopilotPromptPayload,
  UpdateCopilotPromptPayload,
} from './interface';

const getAuthHeaders = async () => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  return {
    Authorization: `Bearer ${token}`,
    tenantId: tenantId,
  };
};

const createCopilotPrompt = async (
  payload: CreateCopilotPromptPayload,
): Promise<CopilotPrompt> => {
  const headers = await getAuthHeaders();
  const content = payload.content.trim();
  return await crudRequest({
    url: `${ORG_AND_EMP_URL}/copilot-prompts`,
    method: 'POST',
    headers,
    data: {
      title: payload.title?.trim() || undefined,
      content,
      prompt: content,
    },
  });
};

const updateCopilotPrompt = async ({
  id,
  ...payload
}: UpdateCopilotPromptPayload & { id: string }): Promise<CopilotPrompt> => {
  const headers = await getAuthHeaders();
  const data: Record<string, string> = {};
  if (payload.title !== undefined) data.title = payload.title.trim();
  if (payload.content !== undefined) {
    const content = payload.content.trim();
    data.content = content;
    data.prompt = content;
  }
  return await crudRequest({
    url: `${ORG_AND_EMP_URL}/copilot-prompts/${encodeURIComponent(id)}`,
    method: 'PATCH',
    headers,
    data,
  });
};

const deleteCopilotPrompt = async (id: string): Promise<void> => {
  const headers = await getAuthHeaders();
  await crudRequest({
    url: `${ORG_AND_EMP_URL}/copilot-prompts/${encodeURIComponent(id)}`,
    method: 'DELETE',
    headers,
  });
};

/** One-time seed of default global prompts (no auth per API contract). */
const seedCopilotPrompts = async (): Promise<unknown> => {
  return await crudRequest({
    url: `${ORG_AND_EMP_URL}/copilot-prompts/seed`,
    method: 'POST',
    skipEncryption: true,
  });
};

export const useCreateCopilotPrompt = (options?: { silent?: boolean }) => {
  const queryClient = useQueryClient();
  return useMutation(createCopilotPrompt, {
    onSuccess: () => {
      queryClient.invalidateQueries('copilot-prompts');
      if (!options?.silent) {
        NotificationMessage.success({
          message: 'Prompt saved',
          description: 'Your prompt has been saved successfully.',
        });
      }
    },
    onError: () => {
      NotificationMessage.error({
        message: 'Could not save prompt',
        description: 'Please try again.',
      });
    },
  });
};

export const useUpdateCopilotPrompt = (options?: { silent?: boolean }) => {
  const queryClient = useQueryClient();
  return useMutation(updateCopilotPrompt, {
    onSuccess: () => {
      queryClient.invalidateQueries('copilot-prompts');
      if (!options?.silent) {
        NotificationMessage.success({
          message: 'Prompt updated',
          description: 'Your prompt has been updated.',
        });
      }
    },
    onError: () => {
      NotificationMessage.error({
        message: 'Could not update prompt',
        description: 'You can only update your own prompts.',
      });
    },
  });
};

export const useDeleteCopilotPrompt = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteCopilotPrompt, {
    onSuccess: () => {
      queryClient.invalidateQueries('copilot-prompts');
      NotificationMessage.success({
        message: 'Prompt deleted',
        description: 'Your prompt has been removed.',
      });
    },
    onError: () => {
      NotificationMessage.error({
        message: 'Could not delete prompt',
        description: 'You can only delete your own prompts.',
      });
    },
  });
};

export const useSeedCopilotPrompts = () => {
  const queryClient = useQueryClient();
  return useMutation(seedCopilotPrompts, {
    onSuccess: () => {
      queryClient.invalidateQueries('copilot-prompts');
    },
  });
};
