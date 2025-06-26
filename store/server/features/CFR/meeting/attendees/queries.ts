import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { ORG_DEV_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useQuery } from 'react-query';
const getMeetingAttendees = async (id: string) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;

  return crudRequest({
    url: `${ORG_DEV_URL}/attendees?meetingId=${id}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};
export const useGetMeetingAttendees = (id: string) => {
  return useQuery<any>(
    ['meeting-attendees', id], // Unique query key based on params
    () => getMeetingAttendees(id),
    {
      enabled: !!id, // Ensures id is truthy and not null or empty
    },
  );
};
