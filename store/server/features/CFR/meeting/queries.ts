import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { ORG_DEV_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useQuery } from 'react-query';
interface UseGetMeetingsParams {
  pageSize: number;
  current: number;
  meetingTypeId?: string;
  departmentId?: string;
  items: any;
  meta: any;
}


const getMeetings = async (
  pageSize: number,
  current: number,
  meetingTypeId: string,
  departmentId: string,
) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;

  return crudRequest({
    url: `${ORG_DEV_URL}/meetings?pageSize=${pageSize}&current=${current}&meetingTypeId=${meetingTypeId}&departmentId=${departmentId}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};
const getMeetingsId = async (id: string | null) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;

  return crudRequest({
    url: `${ORG_DEV_URL}/meetings/${id}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};

export const useGetMeetingsById = (id: string | null) => {
  return useQuery<any>(
    ['meetings', id], // Unique query key based on params
    () => getMeetingsId(id),
    {
      enabled: !!id, // Ensures id is truthy and not null or empty
    },
  );
};

export const useGetMeetings = (
  pageSize: number,
  current: number,
  meetingTypeId: string,
  departmentId: string,
): ReturnType<typeof useQuery<UseGetMeetingsParams>> => {
  return useQuery<any>(
    ['meetings'], // Unique query key based on params
    () => getMeetings(pageSize, current, meetingTypeId, departmentId),
  );
};



