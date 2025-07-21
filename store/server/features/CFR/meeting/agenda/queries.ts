import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { ORG_DEV_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useQuery } from 'react-query';
import { getCurrentToken } from '@/utils/getCurrentToken';
const getMeetingAgenda = async (id: string) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  return crudRequest({
    url: `${ORG_DEV_URL}/meeting-agenda?meetingId=${id}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};
const getMeetingAgendaId = async (id: string | null) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  return crudRequest({
    url: `${ORG_DEV_URL}/meeting-agenda/${id}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};
export const useGetMeetingAgendaIdById = (id: string | null) => {
  return useQuery<any>(
    ['meeting-agenda', id], // Unique query key based on params
    () => getMeetingAgendaId(id),
    {
      enabled: !!id, // Ensures id is truthy and not null or empty
    },
  );
};
export const useGetMeetingAgenda = (id: string) => {
  return useQuery<any>(
    ['meeting-agenda', id], // Unique query key based on params
    () => getMeetingAgenda(id),
    {
      enabled: !!id, // Ensures id is truthy and not null or empty
    },
  );
};
