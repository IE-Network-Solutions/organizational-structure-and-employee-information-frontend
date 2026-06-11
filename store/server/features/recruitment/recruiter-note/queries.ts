import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { RECRUITMENT_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { getCurrentToken } from '@/utils/getCurrentToken';
import { useQuery } from 'react-query';
import { PaginatedRecruiterNotes, RecruiterNote } from './interface';

const buildHeaders = async () => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  return {
    Authorization: `Bearer ${token}`,
    tenantId,
  };
};

const getRecruiterNotes = async (
  jobId: string,
  page = 1,
  limit = 20,
): Promise<PaginatedRecruiterNotes> => {
  const headers = await buildHeaders();
  const queryParams = new URLSearchParams({
    jobId,
    page: String(page),
    limit: String(limit),
    orderBy: 'createdAt',
    orderDirection: 'DESC',
  });

  return crudRequest({
    url: `${RECRUITMENT_URL}/recruiter-note?${queryParams.toString()}`,
    method: 'GET',
    headers,
  });
};

const getRecruiterNoteById = async (id: string): Promise<RecruiterNote> => {
  const headers = await buildHeaders();
  return crudRequest({
    url: `${RECRUITMENT_URL}/recruiter-note/${id}`,
    method: 'GET',
    headers,
  });
};

export const useGetRecruiterNotes = (
  jobId: string,
  page = 1,
  limit = 20,
  enabled = true,
) => {
  return useQuery(
    ['recruiter-notes', jobId, page, limit],
    () => getRecruiterNotes(jobId, page, limit),
    { enabled: Boolean(jobId) && enabled },
  );
};

export const useGetRecruiterNoteById = (id: string, enabled = true) => {
  return useQuery(['recruiter-note', id], () => getRecruiterNoteById(id), {
    enabled: Boolean(id) && enabled,
  });
};
