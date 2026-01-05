import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { ORG_DEV_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useQuery } from 'react-query';
import { getCurrentToken } from '@/utils/getCurrentToken';
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
  startAt: string | null = null,
  endAt: string | null = null,
  title: string | null = null,
) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  return crudRequest({
    url: `${ORG_DEV_URL}/meetings?limit=${pageSize}&page=${current}&meetingTypeId=${meetingTypeId}&departmentId=${departmentId}&startAt=${startAt ?? ''}&endAt=${endAt ?? ''}&title=${title ?? ''}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};
const getMeetingsId = async (id: string | null) => {
  const token = await getCurrentToken();
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
  startAt: string | null = null,
  endAt: string | null = null,
  title: string | null = null,
): ReturnType<typeof useQuery<UseGetMeetingsParams>> => {
  return useQuery<any>(
    [
      'meetings',
      pageSize,
      current,
      meetingTypeId,
      departmentId,
      startAt,
      endAt,
      title,
    ], // Unique query key based on params
    () =>
      getMeetings(
        pageSize,
        current,
        meetingTypeId,
        departmentId,
        startAt,
        endAt,
        title,
      ),
  );
};
const getUserMeetings = async (id: string | null) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  return crudRequest({
    url: `${ORG_DEV_URL}/meetings/user-report/${id}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};

export const useGetUserMeetings = (id: string | null) => {
  return useQuery<any>(
    ['meetings', id], // Unique query key based on params
    () => getUserMeetings(id),
    {
      enabled: !!id, // Ensures id is truthy and not null or empty
    },
  );
};
//prev meeting
const getPrevMeetings = async (meetingTypeId: string, userId: string) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  return crudRequest({
    url: `${ORG_DEV_URL}/meetings/previous-meetings?meetingTypeId=${meetingTypeId}&userId=${userId}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};
export const useGetPrevMeetings = (
  meetingTypeId: string,
  userId: string,
): ReturnType<typeof useQuery<UseGetMeetingsParams>> => {
  return useQuery<any>(
    ['meeting-prev', meetingTypeId, userId], // Unique query key based on params
    () => getPrevMeetings(meetingTypeId, userId),
    {
      enabled: !!meetingTypeId && !!userId,
    },
  );
};

//meeting comments
const getMeetingComments = async (id: string) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  return crudRequest({
    url: `${ORG_DEV_URL}/meeting-comments/by-meeting/${id}
`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};
export const useGetMeetingComments = (
  id: string,
): ReturnType<typeof useQuery<any>> => {
  return useQuery<any>(
    ['meeting-comments', id], // Unique query key based on params
    () => getMeetingComments(id),
    {
      enabled: !!id, // Ensures id is truthy and not null or empty
    },
  );
};
