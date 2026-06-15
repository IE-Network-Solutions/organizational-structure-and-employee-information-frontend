import NotificationMessage from '@/components/common/notification/notificationMessage';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { RECRUITMENT_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { getCurrentToken } from '@/utils/getCurrentToken';
import { useMutation, useQueryClient } from 'react-query';
import {
  CreateRecruiterNoteRequest,
  RecruiterNote,
  UpdateRecruiterNoteRequest,
} from './interface';

const buildHeaders = async () => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  return {
    Authorization: `Bearer ${token}`,
    tenantId,
  };
};

const createRecruiterNote = async (
  data: CreateRecruiterNoteRequest,
): Promise<RecruiterNote> => {
  const headers = await buildHeaders();
  return crudRequest({
    method: 'POST',
    url: `${RECRUITMENT_URL}/recruiter-note`,
    data: { jobId: data.jobId, note: data.note },
    headers,
  });
};

const updateRecruiterNote = async (
  id: string,
  data: UpdateRecruiterNoteRequest,
): Promise<RecruiterNote> => {
  const headers = await buildHeaders();
  return crudRequest({
    method: 'PATCH',
    url: `${RECRUITMENT_URL}/recruiter-note/${id}`,
    data,
    headers,
  });
};

const deleteRecruiterNote = async (id: string): Promise<RecruiterNote> => {
  const headers = await buildHeaders();
  return crudRequest({
    method: 'DELETE',
    url: `${RECRUITMENT_URL}/recruiter-note/${id}`,
    headers,
  });
};

const invalidateNotes = (
  queryClient: ReturnType<typeof useQueryClient>,
  jobId?: string,
) => {
  queryClient.invalidateQueries({
    queryKey: ['recruiter-notes'],
    exact: false,
  });
  if (jobId) {
    queryClient.invalidateQueries(['recruiter-notes', jobId]);
  }
};

export const useCreateRecruiterNote = () => {
  const queryClient = useQueryClient();
  return useMutation(createRecruiterNote, {
    onSuccess: (notUsed, variables) => {
      invalidateNotes(queryClient, variables.jobId);
      NotificationMessage.success({
        message: 'Note created successfully!',
        description: 'Your note has been saved.',
      });
    },
    onError: () => {
      NotificationMessage.error({
        message: 'Failed to create note',
        description: 'Please try again.',
      });
    },
  });
};

export const useUpdateRecruiterNote = () => {
  const queryClient = useQueryClient();
  return useMutation(
    ({ id, data }: { id: string; data: UpdateRecruiterNoteRequest }) =>
      updateRecruiterNote(id, data),
    {
      onSuccess: (data) => {
        invalidateNotes(queryClient, data.jobId);
        queryClient.invalidateQueries(['recruiter-note', data.id]);
        NotificationMessage.success({
          message: 'Note updated successfully!',
          description: 'Your note has been saved.',
        });
      },
      onError: () => {
        NotificationMessage.error({
          message: 'Failed to update note',
          description: 'Please try again.',
        });
      },
    },
  );
};

export const useDeleteRecruiterNote = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteRecruiterNote, {
    onSuccess: (data) => {
      invalidateNotes(queryClient, data.jobId);
      NotificationMessage.success({
        message: 'Note deleted successfully!',
        description: 'Your note has been removed.',
      });
    },
    onError: () => {
      NotificationMessage.error({
        message: 'Failed to delete note',
        description: 'Please try again.',
      });
    },
  });
};
