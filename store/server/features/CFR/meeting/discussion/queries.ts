import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { ORG_DEV_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useQuery } from 'react-query';
const getMeetingDiscussion = async (id: string, agendaId: string) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;

  return crudRequest({
    url: `${ORG_DEV_URL}/meeting-discussions?meetingId=${id}&agendaId=${agendaId}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};
export const useGetMeetingDiscussion = (id: string, agendaId: string) => {
  return useQuery<any>(
    ['meeting-discussion', id, agendaId], // Unique query key based on params
    () => getMeetingDiscussion(id, agendaId),
    {
      enabled: !!id && !!agendaId, // Ensures both id and agendaId are truthy
    },
  );
};